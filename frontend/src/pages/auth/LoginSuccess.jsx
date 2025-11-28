import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../components/common/Loader";

const LoginSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy thông tin từ URL
    const token = searchParams.get("token");
    const userStr = searchParams.get("user"); // Nếu backend gửi kèm thông tin user dạng JSON string
    // Hoặc lấy từng trường: const name = searchParams.get("name"); ...

    if (token) {
      // 1. Lưu Token
      localStorage.setItem("token", token);
      
      // 2. Lưu User Info (Nếu backend gửi kèm, hoặc phải gọi API getProfile để lấy lại)
      if (userStr) {
          try {
              localStorage.setItem("userInfo", userStr);
          } catch (e) {
              console.error("Lỗi parse user info", e);
          }
      } else {
          // Nếu URL chỉ có token, gọi API lấy profile ngay lập tức
          // (Code này giả định bạn có hàm lấy profile, nếu chưa thì redirect về home rồi App.js sẽ tự fetch)
      }

      toast.success("Đăng nhập thành công!");
      
      // 3. Chuyển hướng về trang chủ
      navigate("/");
    } else {
      toast.error("Đăng nhập thất bại. Không tìm thấy token.");
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100">
       <Loader />
       <p className="mt-3 text-muted">Đang xử lý đăng nhập...</p>
    </div>
  );
};

export default LoginSuccess;
