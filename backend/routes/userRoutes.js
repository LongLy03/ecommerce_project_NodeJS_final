// Đăng ký, đăng nhập, hồ sơ, địa chỉ, ...

const express = require('express');
const router = express.Router();
const { registerUser, loginUser} = require('../controllers/userController');
const passport = require('passport');

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.json(req.user);
    }
);

module.exports = router;