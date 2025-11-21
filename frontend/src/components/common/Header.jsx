import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthAPI } from "../../services/api";
import { toast } from "react-toastify";

const Header = () => {
  const navigate = useNavigate();
  
  // Lấy thông tin user từ localStorage để hiển thị tên và menu
  const user = JSON.parse(localStorage.getItem("userInfo"));
  const token = localStorage.getItem("token");

  // --- HÀM XỬ LÝ ĐĂNG XUẤT ---
  const handleLogout = async () => {
    try {
      // 1. Gọi API báo cho Backend biết user muốn thoát (để hủy session nếu có)
      await AuthAPI.logout(); 
    } catch (error) {
      console.error("Lỗi logout server:", error);
      // Vẫn tiếp tục xóa token ở client dù server có lỗi hay không
    } finally {
      // 2. Xóa sạch dữ liệu đăng nhập trong trình duyệt
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      
      // 3. Thông báo
      toast.info("Đã đăng xuất thành công");
      
      // 4. QUAN TRỌNG: Chuyển hướng về Trang chủ (/) thay vì trang Login
      navigate("/"); 
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-3 shadow-sm">
      <div className="container">
        {/* Logo thương hiệu */}
        <Link className="navbar-brand fw-bold text-warning" to="/">
          <i className="fas fa-laptop-code me-2"></i>COMPUTER STORE
        </Link>
        
        {/* Nút toggle cho mobile */}
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarContent">
          {/* Menu bên trái */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/"><i className="fas fa-home me-1"></i> Trang chủ</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/catalog"><i className="fas fa-list me-1"></i> Sản phẩm</Link>
            </li>
          </ul>

          {/* Menu bên phải (Giỏ hàng & User) */}
          <div className="d-flex align-items-center gap-3">
            
            {/* Nút Giỏ hàng */}
            <Link to="/cart" className="btn btn-outline-light position-relative border-0">
              <i className="fas fa-shopping-cart fa-lg"></i>
              {/* Nếu muốn hiện số lượng giỏ hàng, bạn cần dùng Context API để lấy số lượng live */}
            </Link>

            {/* LOGIC HIỂN THỊ: Đã đăng nhập vs Chưa đăng nhập */}
            {token && user ? (
              <div className="dropdown">
                {/* Nút kích hoạt dropdown "Xin chào..." */}
                <button 
                  className="btn btn-secondary dropdown-toggle d-flex align-items-center" 
                  type="button" 
                  id="userDropdown" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <div className="bg-warning rounded-circle text-dark d-flex align-items-center justify-content-center me-2" style={{width: 30, height: 30}}>
                    <i className="fas fa-user"></i>
                  </div>
                  <span>Xin chào, <strong>{user.name}</strong></span>
                </button>

                {/* Menu con xổ xuống */}
                <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="userDropdown">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      <i className="fas fa-id-card me-2 text-primary"></i> Hồ sơ của tôi
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/orders">
                      <i className="fas fa-box-open me-2 text-success"></i> Đơn mua
                    </Link>
                  </li>
                  
                  {/* Chỉ hiện menu Admin nếu user là Admin */}
                  {user.isAdmin && (
                    <>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <Link className="dropdown-item fw-bold text-danger" to="/admin">
                          <i className="fas fa-user-shield me-2"></i> Quản trị hệ thống
                        </Link>
                      </li>
                    </>
                  )}
                  
                  <li><hr className="dropdown-divider" /></li>
                  
                  {/* Nút Đăng xuất */}
                  <li>
                    <button 
                      className="dropdown-item text-danger" 
                      onClick={handleLogout}
                    >
                      <i className="fas fa-sign-out-alt me-2"></i> Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              // Nếu chưa đăng nhập -> Hiện nút Đăng nhập / Đăng ký
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light btn-sm">Đăng nhập</Link>
                <Link to="/register" className="btn btn-warning btn-sm text-dark fw-bold">Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;