// giỏ hàng, thanh toán, đơn hàng, ...

const express = require('express');
const router = express.Router();

const { 
        addToCart, 
        getCart, 
        updateCartItem, 
        removeCartItem, 
        applyDiscount,
        checkout,
        getOrderHistory,
        getOrderDetails,
        getOrderStatusHistory
} = require('../controllers/orderController');

const { protect } = require('../middleware/authMiddleware');

// Giỏ hàng
router.post('/cart', protect(false), addToCart);
router.get('/cart', protect(false), getCart);
router.put('/cart/:itemId', protect(false), updateCartItem);
router.delete('/cart/:itemId', protect(false), removeCartItem);

// Áp dụng mã giảm giá
router.post('/cart/discount', protect(false), applyDiscount);

// Thang toán
router.post('/checkout', protect(false), checkout);

// Lấy đơn hàng
router.get('/history', protect(true), getOrderHistory);
router.get('/:orderId', protect(true), getOrderDetails);
router.get('/:orderId/status-history', protect(true), getOrderStatusHistory);


module.exports = router;