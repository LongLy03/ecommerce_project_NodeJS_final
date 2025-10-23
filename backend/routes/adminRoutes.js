// Quản lý User, sản phẩm, đơn hàng, discount, danh mục, thống kê, ...

const express = require('express');

const {
    getAllUsers,
    getUser,
    updateUser,
    blockUser,
    unBlockUser,
    createProduct,
    updateProduct,
    deleteProduct,
    getOrders,
    getOrderDetail,
    updateOrderStatus,
    createDiscountCode,
    getAllDiscountCodes,
    dashboardBasic,
    dashboardAdvanced
} = require('../controllers/adminController');

const {protect, adminOnly} = require('../middleware/authMiddleware');

const router = express.Router();

// User route
router.get('/users', protect(true), adminOnly, getAllUsers);
router.get('/users/:id', protect(true), adminOnly, getUser);
router.put('/users/:id', protect(true), adminOnly, updateUser);
router.put('/users/:id/block', protect(true), adminOnly, blockUser);
router.put('/users/:id/unblock', protect(true), adminOnly, unBlockUser);

// Product route
router.post('/products', protect(true), adminOnly, createProduct);
router.put('/products/:id', protect(true), adminOnly, updateProduct);
router.delete('/products/:id', protect(true), adminOnly, deleteProduct);

// Order route
router.put('/orders', protect(true), adminOnly, getOrders);
router.put('/orders/:id', protect(true), adminOnly, getOrderDetail);
router.put('/orders/:id/status', protect(true), adminOnly, updateOrderStatus);

// Discount route
router.post('/discounts', protect(true), adminOnly, createDiscountCode);
router.get('/discounts', protect(true), adminOnly, getAllDiscountCodes);

// Dashboard route
router.get('/dashboard/basic', protect(true), adminOnly, dashboardBasic);
router.get('/dashboard/advanced', protect(true), adminOnly, dashboardAdvanced);

module.exports = router;