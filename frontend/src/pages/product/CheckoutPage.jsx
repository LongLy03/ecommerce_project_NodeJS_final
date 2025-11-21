import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { OrderAPI } from "../../services/api";
import { toast } from "react-toastify";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedItems } = location.state || { selectedItems: [] }; // Lấy list ID từ trang Cart

  // Lấy thông tin user nếu đã login
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    address: user?.defaultAddress?.street || "",
    city: user?.defaultAddress?.city || "",
    phone: user?.defaultAddress?.phone || "",
    paymentMethod: "COD", // Mặc định
    usedPoints: 0
  });

  const [loading, setLoading] = useState(false);

  if (!selectedItems || selectedItems.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-warning">Bạn chưa chọn sản phẩm nào để thanh toán.</div>
        <button className="btn btn-primary" onClick={() => navigate("/cart")}>Quay lại giỏ hàng</button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Chuẩn bị payload theo yêu cầu của orderController.js
      const payload = {
        name: formData.name,
        email: formData.email,
        shippingAddress: {
            street: formData.address,
            city: formData.city,
            phone: formData.phone,
            country: "Vietnam"
        },
        paymentMethod: formData.paymentMethod,
        selectedItems: selectedItems, // Mảng ID các item trong giỏ
        usedPoints: formData.usedPoints
      };

      await OrderAPI.checkout(payload);
      
      toast.success("Đặt hàng thành công!");
      // Nếu là User -> Xem lịch sử, Nếu là Guest -> Về Home hoặc trang thông báo
      if (user) {
          navigate("/orders");
      } else {
          navigate("/");
      }
      
    } catch (error) {
      toast.error(error.message || "Đặt hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Thanh Toán</h2>
      <div className="row">
        {/* Form thông tin giao hàng */}
        <div className="col-md-7">
          <div className="card p-4 shadow-sm">
            <h4 className="mb-3">Thông tin giao hàng</h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Họ và tên</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email (để nhận thông báo đơn hàng)</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Số điện thoại</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Địa chỉ (Số nhà, Đường)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Tỉnh / Thành phố</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  required
                />
              </div>

              <h4 className="mb-3 mt-4">Phương thức thanh toán</h4>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="radio"
                  name="paymentMethod"
                  id="cod"
                  value="COD"
                  checked={formData.paymentMethod === "COD"}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                />
                <label className="form-check-label" htmlFor="cod">
                  Thanh toán khi nhận hàng (COD)
                </label>
              </div>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="radio"
                  name="paymentMethod"
                  id="banking"
                  value="BANKING"
                  checked={formData.paymentMethod === "BANKING"}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                />
                <label className="form-check-label" htmlFor="banking">
                  Chuyển khoản ngân hàng
                </label>
              </div>

              {/* Điểm thưởng (Chỉ hiện cho User) */}
              {user && (
                  <div className="mt-3 p-3 bg-light rounded">
                      <label className="form-label">Sử dụng điểm thưởng (1000đ = 1 điểm)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="Nhập số điểm muốn dùng..."
                        value={formData.usedPoints}
                        onChange={(e) => setFormData({...formData, usedPoints: e.target.value})}
                      />
                  </div>
              )}

              <button 
                type="submit" 
                className="btn btn-success w-100 py-3 mt-4 fw-bold"
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "ĐẶT HÀNG NGAY"}
              </button>
            </form>
          </div>
        </div>

        {/* Tóm tắt đơn hàng (Placeholder - Có thể nâng cấp để hiện chi tiết item) */}
        <div className="col-md-5">
          <div className="card p-4 shadow-sm bg-light">
             <h4>Tóm tắt đơn hàng</h4>
             <p className="text-muted">Bạn đang thanh toán cho {selectedItems.length} sản phẩm.</p>
             <hr />
             <div className="alert alert-info small">
                 Phí vận chuyển cố định: <strong>30.000đ</strong>
             </div>
             <p>Kiểm tra kỹ thông tin trước khi bấm Đặt hàng.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
