import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthAPI } from "../../services/api";
import { toast } from "react-toastify";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await AuthAPI.getProfile();
        setUser(data);
      } catch (error) {
        toast.error("Không thể tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (!user) return <div className="text-center mt-5">Không tìm thấy thông tin.</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4 border-bottom pb-2">Hồ sơ của tôi</h2>
      <div className="row">
        {/* Cột trái: Avatar & Hành động */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center p-4">
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 fw-bold" 
                   style={{width: 100, height: 100, fontSize: 40}}>
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <h5 className="fw-bold">{user.name}</h5>
              <p className="text-muted">{user.email}</p>
              
              <div className="d-grid gap-2 mt-3">
                {/* NÚT LIÊN KẾT ĐẾN TRANG ĐỔI MẬT KHẨU */}
                <Link to="/change-password" class="btn btn-outline-danger">
                  <i className="fas fa-key me-2"></i> Đổi mật khẩu
                </Link>
                <Link to="/orders" class="btn btn-outline-primary">
                  <i className="fas fa-box-open me-2"></i> Xem đơn hàng
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải: Thông tin chi tiết */}
        <div className="col-md-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white fw-bold">
              Thông tin cá nhân
            </div>
            <div className="card-body">
              <div className="row mb-3">
                 <div className="col-sm-3 fw-bold">Họ tên:</div>
                 <div className="col-sm-9">{user.name}</div>
              </div>
              <div className="row mb-3">
                 <div className="col-sm-3 fw-bold">Email:</div>
                 <div className="col-sm-9">{user.email}</div>
              </div>
              <div className="row mb-3">
                 <div className="col-sm-3 fw-bold">Vai trò:</div>
                 <div className="col-sm-9">
                    <span className={`badge ${user.isAdmin ? 'bg-danger' : 'bg-success'}`}>
                      {user.isAdmin ? "Quản trị viên (Admin)" : "Khách hàng"}
                    </span>
                 </div>
              </div>
              
              <hr />
              
              <h5 className="mb-3 mt-4">Địa chỉ mặc định</h5>
              {user.defaultAddress ? (
                <div className="p-3 bg-light rounded border">
                  <p className="mb-1"><strong>Địa chỉ:</strong> {user.defaultAddress.street}</p>
                  <p className="mb-1"><strong>Thành phố:</strong> {user.defaultAddress.city}</p>
                  <p className="mb-1"><strong>Quốc gia:</strong> {user.defaultAddress.country}</p>
                  <p className="mb-0"><strong>Điện thoại:</strong> <span className="text-primary">{user.defaultAddress.phone}</span></p>
                </div>
              ) : (
                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Chưa thiết lập địa chỉ mặc định.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;