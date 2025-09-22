// Đăng ký, đăng nhập, hồ sơ, địa chỉ, ...

const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const passport = require('passport');

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login-failed' }),
    (req, res) => {
        res.json(req.user);
    }
);

router.get('/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));

router.get('/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login-failed' }),
    (req, res) => {
        res.json(req.user);
    }
);

router.get('/login-failed', (req, res) => {
    res.status(401).json({ message: 'Đăng nhạp thất bại!' });
});

router.get('/profile', protect, getUserProfile);

module.exports = router;