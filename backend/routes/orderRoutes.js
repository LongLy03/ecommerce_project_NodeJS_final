// giỏ hàng, thanh toán, đơn hàng, ...

const express = require('express');
const router = express.Router();
const { addToCart, 
        getCart, 
        updateCartItem, 
        removeCartItem, 
        applyDiscount,
        checkout } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Giỏ hàng
router.post('/cart', protect(false), addToCart);
router.get('/cart', protect(false), getCart);
router.put('/cart/:itemId', protect(false), updateCartItem);
router.delete('/cart/:itemId', protect(false), removeCartItem);
router.post('/cart/discount', protect(false), applyDiscount);

// Thang toán
router.post('/checkout', protect(false), checkout);

module.exports = router;