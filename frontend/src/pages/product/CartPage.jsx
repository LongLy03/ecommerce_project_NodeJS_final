import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OrderAPI } from "../../services/api";
import { toast } from "react-toastify";
import Loader from "../../components/common/Loader"; // Sử dụng Loader component

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]); // Lưu ID các item được chọn
  const [couponCode, setCouponCode] = useState("");
  const navigate = useNavigate();

  // Hàm load giỏ hàng
  const fetchCart = async () => {
    try {
      const data = await OrderAPI.getCart();
      setCart(data);
    } catch (error) {
      console.error(error);
      // Lỗi 401 sẽ được xử lý bởi interceptor hoặc bỏ qua nếu chưa login
    } finally {
      setLoading(false);
    }
  }; 

  useEffect(() => {
    fetchCart();
  }, []);

  // Cập nhật số lượng
  const handleUpdateQuantity = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      await OrderAPI.updateCartItem(itemId, newQty);
      fetchCart(); // Load lại để tính toán lại tổng tiền chính xác từ server
    } catch (error) {
      toast.error("Lỗi cập nhật giỏ hàng");
    }
  };

  // Xóa sản phẩm
  const handleRemoveItem = async (itemId) => {
    // 1. Hỏi xác nhận trước khi xóa
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
      return;
    }

    try {
      // 2. Gọi API xóa
      const updatedCart = await OrderAPI.removeCartItem(itemId);

      // 3. Cập nhật State ngay lập tức
      setCart(updatedCart);

      // 4. Xóa item đó khỏi danh sách "Đang chọn" (nếu có)
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));

      toast.success("Đã xóa sản phẩm thành công");
    } catch (error) {
      console.error("Lỗi xóa:", error);
      toast.error(error.message || "Lỗi khi xóa sản phẩm");
    }
  };

  // Xử lý chọn checkbox (từng cái)
  const handleSelect = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  // Chọn tất cả
  const handleSelectAll = () => {
    if (cart && cart.items) {
      if (selectedItems.length === cart.items.length) {
        setSelectedItems([]); // Bỏ chọn hết
      } else {
        setSelectedItems(cart.items.map((item) => item._id)); // Chọn hết
      }
    }
  };

  // Áp dụng mã giảm giá
  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      await OrderAPI.applyCoupon(couponCode);
      fetchCart();
      toast.success("Áp dụng mã giảm giá thành công!");
    } catch (error) {
      toast.error(error.message || "Mã giảm giá không hợp lệ");
    }
  };

  // Chuyển sang trang Checkout
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      return toast.warn("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán");
    }
    // Chuyển hướng và gửi kèm danh sách ID đã chọn
    navigate("/checkout", { state: { selectedItems } });
  };

  // Helper lấy ảnh sản phẩm an toàn
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
        const img = product.images[0];
        return typeof img === 'object' ? img.url : img;
    }
    return "https://via.placeholder.com/80";
  };

  if (loading) return <Loader />;

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <div className="py-5 bg-light rounded">
            <h3 className="text-muted mb-3">Giỏ hàng của bạn đang trống</h3>
            <Link to="/catalog" className="btn btn-primary btn-lg">
                <i className="fas fa-shopping-bag me-2"></i>Tiếp tục mua sắm
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4 fw-bold"><i className="fas fa-shopping-cart me-2"></i>Giỏ Hàng ({cart.items.length} sản phẩm)</h2>
      
      <div className="row">
        {/* CỘT TRÁI: Danh sách sản phẩm */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="selectAll"
                  checked={cart.items.length > 0 && selectedItems.length === cart.items.length}
                  onChange={handleSelectAll}
                  style={{ cursor: "pointer" }}
                />
                <label className="form-check-label fw-bold user-select-none" htmlFor="selectAll" style={{ cursor: "pointer" }}>
                  Chọn tất cả ({cart.items.length} sản phẩm)
                </label>
              </div>
            </div>
            
            <ul className="list-group list-group-flush">
              {cart.items.map((item) => (
                <li key={item._id} className="list-group-item p-3">
                  <div className="d-flex align-items-center">
                    {/* Checkbox */}
                    <div className="me-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={selectedItems.includes(item._id)}
                        onChange={() => handleSelect(item._id)}
                        style={{ cursor: "pointer", width: "18px", height: "18px" }}
                      />
                    </div>

                    {/* Ảnh sản phẩm */}
                    <Link to={`/product/${item.product._id}`}>
                        <img
                        src={getProductImage(item.product)}
                        alt={item.name}
                        style={{ width: "80px", height: "80px", objectFit: "cover" }}
                        className="rounded border"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/80?text=No+Img"; }}
                        />
                    </Link>

                    {/* Thông tin chi tiết */}
                    <div className="ms-3 flex-grow-1">
                      <h6 className="mb-1">
                        <Link
                          to={`/product/${item.product._id}`}
                          className="text-decoration-none text-dark fw-bold"
                        >
                          {item.name}
                        </Link>
                      </h6>
                      
                      {/* Hiển thị Variant nếu có */}
                      {item.variantId && (
                        <small className="text-muted d-block mb-1">
                          Phân loại: <span className="badge bg-light text-dark border">{item.variantId}</span> 
                          {/* Lưu ý: Backend nên populate variant name để hiển thị đẹp hơn thay vì ID */}
                        </small>
                      )}
                      
                      <div className="fw-bold text-danger">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.price)}
                      </div>
                    </div>

                    {/* Bộ điều chỉnh số lượng */}
                    <div className="d-flex align-items-center mx-3">
                      <div className="input-group input-group-sm" style={{ width: "100px" }}>
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <input 
                            type="text" 
                            className="form-control text-center bg-white" 
                            value={item.quantity} 
                            readOnly 
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Nút xóa */}
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleRemoveItem(item._id)}
                      title="Xóa sản phẩm"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CỘT PHẢI: Tổng tiền & Thanh toán */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 sticky-top" style={{ top: "20px", zIndex: 1 }}>
            <div className="card-body p-4">
              <h5 className="card-title mb-4 fw-bold text-primary">Thanh toán</h5>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tạm tính:</span>
                <span className="fw-bold">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(cart.subtotal)}
                </span>
              </div>

              {cart.discountAmount > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span><i className="fas fa-tag me-1"></i>Giảm giá:</span>
                  <span>
                    -{new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(cart.discountAmount)}
                  </span>
                </div>
              )}

              <hr className="my-3" />

              <div className="d-flex justify-content-between mb-4 align-items-center">
                <span className="fw-bold fs-6">Tổng cộng:</span>
                <span className="text-danger fw-bold fs-4">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(cart.total)}
                </span>
              </div>

              {/* Mã giảm giá */}
              <div className="mb-4">
                <label className="form-label small text-muted">Mã giảm giá (Voucher)</label>
                <div className="input-group">
                    <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập mã..."
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    />
                    <button
                    className="btn btn-outline-primary"
                    type="button"
                    onClick={handleApplyCoupon}
                    >
                    Áp dụng
                    </button>
                </div>
              </div>

              <button
                className="btn btn-success w-100 py-3 fw-bold fs-6 text-uppercase shadow-sm"
                onClick={handleCheckout}
                disabled={selectedItems.length === 0}
              >
                Mua hàng ({selectedItems.length})
              </button>
              
              {selectedItems.length === 0 && (
                  <div className="text-center mt-2">
                      <small className="text-danger fst-italic">
                          * Vui lòng chọn sản phẩm để thanh toán
                      </small>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;