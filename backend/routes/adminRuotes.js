// Quản lý User, sản phẩm, đơn hàng, discount, danh mục, thống kê, ...
const express = require('express');

const {
    getAllUsers,
    updateUser,
    blockUser,
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
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id', protect, adminOnly, updateUser);
router.patch('/users/:id/block', protect, adminOnly, blockUser);

// Product route
router.post('/products', protect, adminOnly, createProduct);
router.put('/products/:id', protect, adminOnly, updateProduct);
router.delete('/products/:id', protect, adminOnly, deleteProduct);

// Order route
router.put('/orders', protect, adminOnly, getOrders);
router.put('/orders/:id', protect, adminOnly, getOrderDetail);
router.patch('/orders/:id/status', protect, adminOnly, updateOrderStatus);

// Discount route
router.post('/discounts', protect, adminOnly, createDiscountCode);
router.get('/discounts', protect, adminOnly, getAllDiscountCodes);

// Dashboard route
router.get('/dashboard/basic', protect, adminOnly, dashboardBasic);
router.get('/dashboard/advanced', protect, adminOnly, dashboardAdvanced);

module.exports = router;