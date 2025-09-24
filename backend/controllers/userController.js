// đăng nhập, đổi mật khẩu, quản lý profile,...

const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const registerUser = async (req, res) => {
    const { name, email, password, address } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email đã tồn tại!' });
        }
        const user = await User.create({ name, email, password, address });
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isBlocked: user.isBlocked,
                address: user.address,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Thông tin người dùng không hợp lệ.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select('+password');
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isBlocked: user.isBlocked,
                address: user.address,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const getUserProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Chưa xác thực' });
        }
        res.json({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            isAdmin: req.user.isAdmin,
            isBlocked: req.user.isBlocked,
            address: req.user.address,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user._id).select('+password');
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        if (!(await user.matchPassword(oldPassword))) {
            return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
        }

        user.password = newPassword;
        await user.save();
        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            
            if (req.body.address) {
                user.address.street = req.body.address.street || user.address.street;
                user.address.city = req.body.address.city || user.address.city;
                user.address.state = req.body.address.state || user.address.state;
                user.address.zip = req.body.address.zip || user.address.zip;
                user.address.country = req.body.address.country || user.address.country;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                address: updatedUser.address,
                isAdmin: updatedUser.isAdmin,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Vui lòng nhập email' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng với email này' });
        }

        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/resetpassword/${resetToken}`;

        if (process.env.DEV_SEND_RESET_TOKEN === 'true') {
            return res.json({ 
                message: 'Token đặt lại mật khẩu (chỉ dành cho môi trường phát triển)',
                resetToken,
                resetUrl 
            });
        }

        const message = `Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn.\n\n
        Vui lòng nhấp vào liên kết sau để đặt lại mật khẩu của bạn:\n\n
        ${resetUrl}\n\n
        Link sẽ hết hạn sau 10 phút.\n\n
        Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n`;

        await sendEmail({
            to: user.email,
            subject: 'Yêu cầu đặt lại mật khẩu',
            text: message,
        });

        res.json({ message: 'Đã gửi email với hướng dẫn đặt lại mật khẩu' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const rawToken = req.params.token;
        const { password: newPassword } = req.body;
        if (!newPassword) {
            return res.status(400).json({ message: 'Vui lòng nhập mật khẩu mới' });
        }

        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn' });
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        const token = generateToken ? generateToken(user._id) : null;

        res.json({ message: 'Đặt lại mật khẩu thành công', token });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

module.exports = { 
    registerUser, 
    loginUser, 
    getUserProfile,
    changePassword,
    updateUserProfile,
    forgotPassword,
    resetPassword
};