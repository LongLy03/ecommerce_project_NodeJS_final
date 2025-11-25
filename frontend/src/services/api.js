import axios from 'axios';

// Lấy URL từ biến môi trường hoặc mặc định localhost
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// 1. Khởi tạo Axios Instance
const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Interceptor: Tự động gắn Token vào mọi request nếu đã đăng nhập
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Lấy token từ LocalStorage
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. Interceptor: Xử lý lỗi trả về
api.interceptors.response.use(
    (response) => response.data, // Trả về data trực tiếp cho gọn
    (error) => {
        // Xử lý lỗi 401 (Hết hạn token hoặc chưa đăng nhập)
        if (error.response && error.response.status === 401) {
            // Chỉ logout nếu không phải đang ở trang login (tránh lặp vô tận)
            if (window.location.pathname !== '/login') {
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
                // Có thể redirect về login hoặc reload trang
                // window.location.href = '/login'; 
            }
        }
        // Trả về lỗi để component xử lý hiển thị alert
        return Promise.reject(error.response ? error.response.data : error);
    }
);

// --- ĐỊNH NGHĨA CÁC API ENDPOINTS (Khớp với Backend Routes) ---

export const ProductAPI = {
    // Lấy danh sách sản phẩm (hỗ trợ lọc, tìm kiếm, phân trang)
    // Backend: GET /products?page=1&limit=20&search=...
    getAll: (params) => api.get('/products', { params }),

    // Lấy chi tiết sản phẩm (theo ID hoặc Slug)
    // Backend: GET /products/:idOrSlug
    getDetail: (idOrSlug) => api.get(`/products/${idOrSlug}`),

    // Lấy dữ liệu cho trang chủ (Mới, Bán chạy, Category)
    // Backend: GET /products/home/sections
    getHomeSections: () => api.get('/products/home/sections'),

    // Lấy bình luận
    getReviews: (idOrSlug, params) => api.get(`/products/${idOrSlug}/reviews`, { params }),
    addReview: (idOrSlug, data) => api.post(`/products/${idOrSlug}/reviews`, data),
};

export const AuthAPI = {
    // Backend: POST /users/login
    login: (data) => api.post('/users/login', data),

    // Backend: POST /users/register
    register: (data) => api.post('/users/register', data),

    // Backend: GET /users/profile
    getProfile: () => api.get('/users/profile'),

    // Backend: PUT /users/profile
    updateProfile: (data) => api.put('/users/profile', data),

    // Backend: PUT /users/change-password
    changePassword: (data) => api.put('/users/change-password', data),

    // Backend: POST /users/logout
    logout: () => api.post('/users/logout'),
};

export const OrderAPI = {
    // --- GIỎ HÀNG ---
    // Backend: POST /orders/cart (Thêm vào giỏ)
    addToCart: (data) => api.post('/orders/cart', data),

    // Backend: GET /orders/cart (Xem giỏ)
    getCart: () => api.get('/orders/cart'),

    // Backend: PUT /orders/cart/:itemId (Sửa số lượng)
    updateCartItem: (itemId, quantity) => api.put(`/orders/cart/${itemId}`, { quantity }),

    // Backend: DELETE /orders/cart/:itemId (Xóa item)
    removeCartItem: (itemId) => api.delete(`/orders/cart/${itemId}`),

    // --- THANH TOÁN & ĐƠN HÀNG ---
    // Backend: POST /orders/cart-discount (Áp mã giảm giá)
    applyCoupon: (code) => api.post('/orders/cart-discount', { code }),

    // Backend: POST /orders/checkout (Đặt hàng)
    checkout: (data) => api.post('/orders/checkout', data),

    // Backend: GET /orders/history (Lịch sử đơn hàng)
    getHistory: () => api.get('/orders/history'),

    // Backend: GET /orders/:orderId (Chi tiết đơn hàng)
    getDetail: (orderId) => api.get(`/orders/${orderId}`),
};

// Admin API (Sẽ bổ sung sau nếu cần)
export const AdminAPI = {
    getDashboard: () => api.get('/admin/dashboard/basic'),
    getCharts: (params) => api.get('/admin/dashboard/charts', { params }),
    // Quản lý Users
    getUsers: () => api.get('/admin/users'),
    blockUser: (id) => api.put(`/admin/users/${id}/block`),
    unblockUser: (id) => api.put(`/admin/users/${id}/unblock`),

    // Quản lý Products
    addProduct: (data) => api.post('/admin/products', data),
    updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
    deleteProduct: (id) => api.delete(`/admin/products/${id}`),

    // Quản lý Orders
    getOrders: (params) => api.get('/admin/orders', { params }),
    updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),

    // Discount
    getDiscounts: () => api.get('/admin/discounts'),
    createDiscount: (data) => api.post('/admin/discounts', data),

    // Users
    getUsers: () => api.get('/admin/users'),
    blockUser: (id) => api.put(`/admin/users/${id}/block`),
    unblockUser: (id) => api.put(`/admin/users/${id}/unblock`),

    // Categories
    getCategories: () => api.get('/admin/categories'),
};

export default api;