import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthAPI } from "../../services/api";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State quản lý hiện/ẩn
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
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("userInfo", JSON.stringify(data));

      toast.success("Đăng nhập thành công!");

      if (data.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error(error.message || "Đăng nhập thất bại");
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
                      /* Logic chuyển đổi type ở đây */
                      type={showPassword ? "text" : "password"} 
                      className="form-control"
                      placeholder="Nhập mật khẩu..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    {/* Nút con mắt */}
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button" // Quan trọng: type="button" để không submit form
                      onClick={() => setShowPassword(!showPassword)}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;