// Đăng ký, đăng nhập, hồ sơ, địa chỉ, ...

const express = require('express');
const router = express.Router();
const { registerUser, 
    loginUser, 
    getUserProfile, 
    changePassword,
    updateUserProfile,
    forgotPassword,
    resetPassword,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const passport = require('passport');

// Đăng ký
router.post('/register', registerUser);

// Đăng nhập
router.post('/login', loginUser);

// Đăng nhập với Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login-failed' }),
    (req, res) => {
        res.json(req.user);
    }
);

// Đăng nhập với Facebook
router.get('/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));

router.get('/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login-failed' }),
    (req, res) => {
        res.json(req.user);
    }
);

// Xử lý lỗi đăng nhập OAuth
router.get('/login-failed', (req, res) => {
    res.status(401).json({ message: 'Đăng nhạp thất bại!' });
});

// Hồ sơ người dùng
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Đổi mật khẩu
router.put('/changepassword', protect, changePassword);

// Quên mật khẩu - đặt lại mật khẩu
router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword/:token', resetPassword);

// Quản lý địa chỉ
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);
router.put('/addresses/default/:id', protect, setDefaultAddress);

module.exports = router;