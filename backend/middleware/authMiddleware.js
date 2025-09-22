const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({ message: 'Người dùng không tồn tại' });
            }

            if (user.isBlocked) {
                return res.status(403).json({ message: 'Tài khoản của bạn đã bị chặn' });
            }

            req.user = user;
            return next();

        } catch (error) {
            return res.status(401).json({ message: 'Không được phép, token không hợp lệ' });
        }
    }
    res.status(401).json({ message: 'Không có token, từ chối truy cập' });
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        return next();
    }
    res.status(403).json({ message: 'Chỉ admin mới được truy cập' });
};

module.exports = { protect, adminOnly };