import React, { useEffect, useState } from "react";
import { ProductAPI } from "../../services/api";
import { toast } from "react-toastify";
import io from "socket.io-client";

// Kết nối Socket tới Backend (Cùng URL với API)
const socket = io(process.env.REACT_APP_API_URL?.replace('/api', '') || "http://localhost:5000");

const ReviewSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // State cho Form bình luận
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [guestInfo, setGuestInfo] = useState({ name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Lấy thông tin user hiện tại
    const storedUser = JSON.parse(localStorage.getItem("userInfo"));
    setUser(storedUser);

    // 1. Load danh sách review ban đầu
    const fetchReviews = async () => {
      try {
        const res = await ProductAPI.getReviews(productId);
        setReviews(res.reviews || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();

    // 2. Lắng nghe sự kiện Realtime từ Backend (reviewAdded)
    socket.emit("join", `product_${productId}`); // Join room sản phẩm (nếu backend yêu cầu)
    // Hoặc nếu backend emit global cho room thì lắng nghe:
    // Lưu ý: Cần check logic backend reviewController line 72: io.to(`product_${productId}`)
    // Client cần join room này. Tuy nhiên socket.io v4 client tự handle khá tốt.
    
    socket.on("reviewAdded", (newReview) => {
      // Nếu review này thuộc sản phẩm đang xem thì thêm vào đầu danh sách
      if (newReview.product === productId || newReview.product._id === productId) {
          setReviews((prev) => [newReview, ...prev]);
      }
    });

    return () => {
      socket.off("reviewAdded");
    };
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return toast.warn("Vui lòng nhập nội dung bình luận");
    
    // Validate cho khách
    if (!user) {
        if (!guestInfo.name || !guestInfo.email) return toast.warn("Vui lòng nhập tên và email");
    }

    setSubmitting(true);
    try {
      const payload = {
        comment,
        // Nếu là user thì gửi rating, nếu là guest thì rating = null (hoặc backend tự bỏ qua)
        rating: user ? rating : null,
        guestName: user ? undefined : guestInfo.name,
        guestEmail: user ? undefined : guestInfo.email
      };

      await ProductAPI.addReview(productId, payload);
      
      toast.success("Đã gửi bình luận!");
      setComment("");
      setRating(5);
      setGuestInfo({ name: "", email: "" });
      
      // Không cần gọi lại fetchReviews vì Socket sẽ tự đẩy review mới về
    } catch (error) {
      toast.error(error.message || "Gửi bình luận thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper vẽ ngôi sao
  const renderStars = (num) => {
    return [...Array(5)].map((_, i) => (
      <i key={i} className={`fas fa-star ${i < num ? "text-warning" : "text-muted"}`}></i>
    ));
  };

  return (
    <div className="card shadow-sm border-0 mt-4">
      <div className="card-header bg-white py-3">
        <h5 className="mb-0 fw-bold"><i className="fas fa-comments me-2"></i>Đánh giá & Bình luận ({reviews.length})</h5>
      </div>
      <div className="card-body">
        
        {/* DANH SÁCH BÌNH LUẬN */}
        <div className="review-list mb-5" style={{ maxHeight: "500px", overflowY: "auto" }}>
          {loading ? (
            <div className="text-center py-3">Đang tải bình luận...</div>
          ) : reviews.length === 0 ? (
            <p className="text-center text-muted py-3">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev._id} className="d-flex mb-3 border-bottom pb-3">
                <div className="me-3">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center fw-bold text-secondary" 
                         style={{width: 45, height: 45}}>
                        {rev.user ? rev.user.name.charAt(0).toUpperCase() : (rev.guestName ? rev.guestName.charAt(0).toUpperCase() : "G")}
                    </div>
                </div>
                <div>
                  <div className="d-flex align-items-center mb-1">
                    <strong className="me-2">{rev.user ? rev.user.name : rev.guestName}</strong>
                    {rev.rating && <small>{renderStars(rev.rating)}</small>}
                    {!rev.rating && <span className="badge bg-secondary ms-2" style={{fontSize: '0.6rem'}}>Khách vãng lai</span>}
                  </div>
                  <p className="mb-1 text-dark">{rev.comment}</p>
                  <small className="text-muted">{new Date(rev.createdAt).toLocaleString('vi-VN')}</small>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FORM VIẾT BÌNH LUẬN */}
        <div className="bg-light p-3 rounded">
          <h6 className="fw-bold mb-3">Viết đánh giá của bạn</h6>
          <form onSubmit={handleSubmit}>
            
            {/* Nếu đã đăng nhập -> Cho đánh giá sao */}
            {user ? (
               <div className="mb-3">
                  <label className="form-label me-3">Đánh giá sản phẩm:</label>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i 
                        key={star}
                        className={`fas fa-star fa-lg cursor-pointer me-1 ${star <= rating ? "text-warning" : "text-secondary"}`}
                        style={{cursor: "pointer"}}
                        onClick={() => setRating(star)}
                    ></i>
                  ))}
                  <span className="ms-2 fw-bold text-warning">{rating}/5 Tuyệt vời</span>
               </div>
            ) : (
               /* Nếu chưa đăng nhập -> Nhập thông tin Guest */
               <div className="row mb-3">
                   <div className="col-md-6">
                       <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Họ tên của bạn (Bắt buộc)"
                        value={guestInfo.name}
                        onChange={(e) => setGuestInfo({...guestInfo, name: e.target.value})}
                        required
                       />
                   </div>
                   <div className="col-md-6">
                       <input 
                        type="email" 
                        className="form-control" 
                        placeholder="Email (Bắt buộc)"
                        value={guestInfo.email}
                        onChange={(e) => setGuestInfo({...guestInfo, email: e.target.value})}
                        required
                       />
                   </div>
               </div>
            )}

            <div className="mb-3">
                <textarea 
                    className="form-control" 
                    rows="3" 
                    placeholder={user ? "Chia sẻ cảm nhận của bạn về sản phẩm..." : "Mời bạn thảo luận, vui lòng nhập tiếng Việt có dấu..."}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                ></textarea>
            </div>

            <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
                {submitting ? "Đang gửi..." : <><i className="fas fa-paper-plane me-2"></i>Gửi đánh giá</>}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ReviewSection;
