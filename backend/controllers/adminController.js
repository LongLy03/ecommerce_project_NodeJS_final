// CRUD sản phẩm, dashboard, quản lý đơn, ...

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Discount = require('../models/Discount');
const Category = require('../models/Category')

// User
// Lấy tất cả người dùng
const getAllUsers = (req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => res.status(500).json({ message: 'Lỗi server khi xem danh sách người dùng', error: err.message }));
};

// Xem thông tin người dùng
const getUser = (req, res) => {
    const { id } = req.params;
    User.findById(id)
        .then(user => user ? res.json(user) : res.status(404).json({ message: 'Người dùng không tồn tại' }))
        .catch(err => res.status(500).json({ message: 'Lỗi server khi xem thông tin người dùng', error: err.message }));
}

// Cập nhật thông tin người dùng
const updateUser = (req, res) => {
    const { id } = req.params;
    User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
        .then(user => user ? res.json(user) : res.status(404).json({ message: 'Người dùng không tồn tại' }))
        .catch(err => res.status(500).json({ message: 'Lỗi server khi cập nhật thông tin người dùng', error: err.message }));
};

// Chặn người dùng
const blockUser = (req, res) => {
    const { id } = req.params;
    User.findById(id)
        .then(user => {
            if (!user) return res.status(404).json({ message: 'User không tồn tại' });
            user.isBlocked = true;
            return user.save();
        })
        .then(updated => res.json({ message: 'User đã bị chặn', user: updated }))
        .catch(err => res.status(500).json({ message: 'Lỗi server khi chặn người dùng', error: err.message }));
};

// Bỏ chặn người dùng
const unBlockUser = (req, res) => {
    const { id } = req.params;
    User.findById(id)
        .then(user => {
            if (!user) return res.status(404).json({ message: 'User không tồn tại' });
            if (!user.isBlocked) return res.status(404).json({ message: 'User không bị chặn' });
            user.isBlocked = false;
            return user.save();
        })
        .then(updated => res.json({ message: 'User đã được bỏ chặn', user: updated }))
        .catch(err => res.status(500).json({ message: 'Lỗi server khi bỏ chặn người dùng', error: err.message }));
};

// Product
// Tạo mới sản phẩm
const createProduct = async (req, res) => {
    const { slug, category } = req.body;

    const slugExists = await Product.findOne({ slug });

    if (slugExists) return res.status(400).json({ message: 'Tên định danh sản phẩm đã tồn tại!' });

    if (!(await Category.findById(category))) return res.status(404).json({ message: 'Danh mục không tồn tại' });

    Product.create(req.body)
            .then(product => res.status(201).json(product))
            .catch(err => res.status(400).json({message: 'Tạo sản phẩm thất bại', error: err.message}));
};

// Cập nhật sản phẩm
const updateProduct = (req, res) => {
    const { id } = req.params;
    Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
        .then(updated => res.json(updated))
        .catch(err => res.status(500).json({ message: 'Cập nhật thất bại', error: err.message }));
};

// Xóa sản phẩm
const deleteProduct = (req, res) => {
    const {id} = req.params;
    Product.findByIdAndDelete(id)
            .then(() => res.json({message: 'Xóa sản phẩm thành công'}))
            .catch(err => res.status(500).json({message: 'Xóa sản phẩm thất bại', error: err.message}));
};

// Quản lý danh mục
// Xem các danh mục sản phẩm
const getCategories = (req, res) => {
    Category.find()
        .then(categories => res.json(categories))
        .catch(err => res.status(500).json({ message: 'Lỗi server khi xem danh mục sản phẩm', error: err.message }));
}

// Thêm danh mục sản phẩm
const createCategory = (req, res) => {
    Category.create(req.body)
        .then(category => res.status(201).json(category))
        .catch(err => res.status(500).json({ message: 'Lỗi server khi thêm danh mục sản phẩm', error: err.message }));
}

// Chỉnh sửa danh mục sản phẩm
const updateCategory = (req, res) => {
    const { id } = req.params;
    Category.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
        .then(updated => res.json(updated))
        .catch(err => res.status(500).json({ message: 'Lỗi server khi chỉnh sửa danh mục sản phẩm', error: err.messgae }));
}

// Điều chỉnh tồn kho
const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { operation, amount, variantId } = req.body;
        const qty = Number(amount || 0);

        if (!variantId) {
            return res.status(400).json({ message: 'Yêu cầu variantId — hệ thống chỉ quản lý tồn kho tại cấp biến thể' });
        }

        if (!['increase', 'decrease', 'set'].includes(operation)) {
            return res.status(400).json({ message: 'operation phải là increase|decrease|set' });
        }
        if (qty < 0) return res.status(400).json({ message: 'amount phải >= 0' });

        if (operation === 'set') {
            const updated = await Product.findOneAndUpdate(
                { _id: id, 'variants._id': variantId },
                { $set: { 'variants.$.stock': qty } },
                { new: true }
            );
            if (!updated) return res.status(404).json({ message: 'Không tìm thấy sản phẩm hoặc biến thể' });
            return res.json({ message: 'Cập nhật tồn kho biến thể thành công', product: updated });
        }

        const inc = operation === 'increase' ? qty : -qty;

        if (operation === 'decrease') {
            // đảm bảo không giảm xuống dưới 0
            const updated = await Product.findOneAndUpdate(
                { _id: id, 'variants._id': variantId, 'variants.stock': { $gte: qty } },
                { $inc: { 'variants.$.stock': inc } },
                { new: true }
            );
            if (!updated) return res.status(400).json({ message: 'Không đủ tồn kho để giảm hoặc không tìm thấy sản phẩm/biến thể' });
            return res.json({ message: 'Giảm tồn kho biến thể thành công', product: updated });
        }

        // increase
        const updated = await Product.findOneAndUpdate(
            { _id: id, 'variants._id': variantId },
            { $inc: { 'variants.$.stock': inc } },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Không tìm thấy sản phẩm hoặc biến thể' });
        return res.json({ message: 'Tăng tồn kho biến thể thành công', product: updated });
    } catch (err) {
        return res.status(500).json({ message: 'Cập nhật tồn kho thất bại', error: err.message });
    }
};

// Order
// Lấy tất cả đơn hàng
const getOrders = (req, res) => {
    Order.find().sort({createdAt: -1})
        .then(orders => res.json(orders))
        .catch(err => res.status(500).json({message: 'Lỗi server', error: err.message}));
};

// Lấy chi tiết đơn hàng
const getOrderDetail = (req, res) => {
    const {id} = req.params;
    Order.findById(id).populate('user products.product')
        .then(order => order ? res.json(order) : res.status(404).json({message: 'Không tìm thấy đơn hàng'}))
        .catch(err => res.status(500).json({message: 'Lỗi server', error: err.message}));
}

// Cập nhật trạng thái đơn hàng
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
// Tạo mã giảm giá
const createDiscountCode = (req, res) => {
    Discount.create(req.body)
        .then(discount => res.status(201).json(discount))
        .catch(err => res.status(500).json({message: 'Lỗi server', error: err.message}));
};

// Lấy tất cả mã giảm giá
const getAllDiscountCodes = (req, res) => {
    Discount.find()
        .then(discounts => res.json(discounts))
        .catch(err => res.status(500).json({ message: 'Lỗi server', error: err.message }));
};

// Dashboard
// Thống kê cơ bản
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

// Thống kê nâng cao - doanh thu theo tháng
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
    getUser,
    updateUser,
    blockUser,
    unBlockUser,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories,
    createCategory,
    updateCategory,
    updateStock,
    getOrders,
    getOrderDetail,
    updateOrderStatus,
    createDiscountCode,
    getAllDiscountCodes,
    dashboardBasic,
    dashboardAdvanced
};