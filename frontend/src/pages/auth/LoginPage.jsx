import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthAPI } from "../../services/api";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error("Vui lòng nhập đầy đủ Email và Mật khẩu!");
    }

    try {
      setLoading(true);
      const data = await AuthAPI.login({ email, password });
      
      // DEBUG: Kiểm tra xem user này có phải admin không
      console.log("Thông tin đăng nhập:", data);

      // Lưu thông tin
      localStorage.setItem("token", data.token);
      localStorage.setItem("userInfo", JSON.stringify(data));

      toast.success(`Chào mừng ${data.name} quay trở lại!`);

      // LOGIC CHUYỂN HƯỚNG QUAN TRỌNG
      if (data.isAdmin) {
        console.log(">> User là ADMIN -> Chuyển sang trang Admin");
        navigate("/admin"); // Chuyển sang Dashboard
      } else {
        console.log(">> User là KHÁCH -> Về trang chủ");
        navigate("/"); // Về trang chủ
      }

    } catch (error) {
      console.error("Login Error:", error);
      toast.error(error.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow border-0">
            <div className="card-body p-4">
              <h3 className="text-center mb-4 fw-bold text-primary">Đăng Nhập</h3>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">Mật khẩu</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Nhập mật khẩu..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                    >
                      <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2 fw-bold"
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "Đăng nhập"}
                </button>
              </form>

              <div className="text-center mt-3">
                <p className="small text-muted">
                  Chưa có tài khoản? <Link to="/register" className="text-decoration-none">Đăng ký ngay</Link>
                </p>
                {/* Nút tiện ích: Quên mật khẩu */}
                <Link to="/forgot-password" class="small text-muted d-block mt-1">Quên mật khẩu?</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;