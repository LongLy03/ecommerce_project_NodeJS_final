// CRUD sản phẩm, dashboard, quản lý đơn, ...
import User from "../models/User";
import Product from "../models/Product";
import Order from "../models/Order";
import Discount from "../models/Discount";
import req from "express/lib/request";


// User
const getAllUsers = (req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => res.status(500).json({ message: 'Lỗi server', error: err.message }));
};

const updateUser = (req, res) => {
    const { id } = req.params;
    User.findByIdAndUpdate(id, req.body, { new: true })
        .then(user => res.json(user))
        .catch(err => res.status(500).json({ message: 'Lỗi server', error: err.message }));
};

const blockUser = (req, res) => {
    const { id } = req.params;
    User.findById(id)
        .then(user => {
            if (!user) return res.status(404).json({ message: 'User không tồn tại' });
            user.isBlocked = true;
            return user.save();
        })
        .then(updated => res.json({ message: 'User đã bị chặn', user: updated }))
        .catch(err => res.status(500).json({ message: 'Lỗi server', error: err.message }));
};

// Product
const createProduct = (req, res) => {
    Product.create(req.body)
            .then(product => res.status(201).json(product))
            .catch(err => res.status(400).json({message: 'Tạo sản phẩm thất bại', error: err.message}));
};

const updateProduct = (req, res) => {
    const { id } = req.params;
    Product.findByIdAndUpdate(id, req.body, { new: true })
        .then(user => res.json(product))
        .catch(err => res.status(500).json({ message: 'Cập nhật thất bại', error: err.message }));
};

const deleteProduct = (req, res) => {
    const {id} = req.params;
    Product.findByIdAndDelete(id)
            .then(() => res.json({message: 'Xóa sản phẩm thành công'}))
            .catch(err => res.status(500).json({message: 'Xóa sản phẩm thất bại', error: err.message}));
};

// Order
const getOrders = (req, res) => {
    Order.find().sort({createdAt: -1})
        .then(orders => res.json(orders))
        .catch(err => res.status(500).json({message: 'Lỗi server', error: err.message}));
};

const getOrderDetail = (req, res) => {
    const {id} = req.params;
    Order.findById(id).populate('user products.product')
        .then(order => order ? res.json(order) : res.status(404).json({message: 'Không tìm thấy đơn hàng'}))
        .catch(err => res.status(500).json({message: 'Lỗi server', error: err.message}));
}

const updateOrderStatus = (req, res) => {
    const {id} = req.params;
    const {status} = req.body;
    Order.findById(id)
        .then(order =>{
            if(!order) return res.status(404).json({message: 'Không tìm thấy đơn hàng'});
            order.status = status;
            return order.save();
        })
        .then(updated => res.json(updated))
        .catch(err => res.status(500).json({message: 'Lỗi server', error: err.message}));
};

// Discount
const createDiscountCode = (req, res) => {
    Discount.create(req.body)
        .then(discount => res.status(201).json(discount))
        .catch(err => res.status(500).json({message: 'Lỗi server', error: err.message}));
};

const getAllDiscountCodes = (req, res) => {
    Discount.find()
        .then(discounts => res.json(discounts))
        .catch(err => res.status(500).json({ message: 'Lỗi server', error: err.message }));
};

// Dashboard
const dashboardBasic = (req, res) => {
    Promise.all([
        User.countDocuments(),
        Order.countDocuments(),
        Order.aggregate([{$group: {_id: null, total: {$sum: "$total"}}}])
    ])
        .then(([users, orders, revenue]) => {
            res.json({users, orders, revenue: revenue[0]?.total || 0});
        })
        .catch(err => res.status(500).json({ message: 'Lỗi server', error: err.message }));
};

const dashboardAdvanced = (req, res) => {
    Order.aggregate([
        {$group: {_id: {$month: "$createdAt"}, total: {$sum: "$total"}}},
        {$sort: {_id:1}}
    ])
        .then(salesByMonth => res.json({salesByMonth}))
        .catch(err => res.status(500).json({ message: 'Lỗi server', error: err.message }));
};

module.exports = {
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
};