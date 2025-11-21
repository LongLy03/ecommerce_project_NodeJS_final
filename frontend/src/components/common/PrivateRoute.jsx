import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ role }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('userInfo') || '{}');

    // 1. Chưa đăng nhập -> Đá về login
    if (!token) {
        return <Navigate to="/login" />;
    }

    // 2. Nếu yêu cầu quyền Admin mà user không phải Admin -> Đá về trang chủ
    if (role === 'admin' && !user.isAdmin) {
        return <Navigate to="/" />;
    }

    // 3. Hợp lệ -> Cho vào
    return <Outlet />;
};

export default PrivateRoute;