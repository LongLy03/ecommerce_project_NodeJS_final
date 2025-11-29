import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthAPI } from "../../services/api";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState(""); // Địa chỉ giao hàng ban đầu
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      
      // Backend yêu cầu: { name, email, addresses: [{...}] }
      // Ta đóng gói address thành mảng object như backend muốn
      const payload = {
        name,
        email,
        addresses: address ? [{ street: address, isDefault: true }] : []
      };

      // Gọi API
      await AuthAPI.register(payload);

      // Thành công
      toast.success("Đăng ký thành công! Vui lòng kiểm tra Email để lấy mật khẩu.");
      
      // Chuyển hướng về trang đăng nhập để user nhập pass vừa nhận được
      navigate("/login");

    } catch (error) {
      toast.error(error.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body p-4">
              <h3 className="text-center mb-4">Đăng Ký</h3>
              <div className="alert alert-info small">
                <i className="fas fa-info-circle me-1"></i>
                Mật khẩu sẽ được gửi đến email của bạn sau khi đăng ký.
              </div>

              <form onSubmit={handleSubmit}>
                {/* Full Name */}
                <div className="mb-3">
                  <label className="form-label">Họ và tên</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                {/* Address (Optional but recommended) */}
                 <div className="mb-3">
                  <label className="form-label">Địa chỉ giao hàng (Tùy chọn)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Số nhà, Tên đường, Quận/Huyện..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                {/* Button */}
                <button 
                  type="submit" 
                  className="btn btn-success w-100 py-2"
                  disabled={loading}
                >
                  {loading ? "Đang tạo tài khoản..." : "Đăng Ký"}
                </button>
              </form>

              <div className="text-center mt-3">
                <p className="small text-muted">
                  Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;