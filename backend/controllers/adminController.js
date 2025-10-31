// adminController.js

const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Discount = require('../models/Discount');
const Category = require('../models/Category');

// Lấy tất cả người dùng
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi xem danh sách người dùng', error: err.message });
    }
};

// Xem thông tin người dùng
const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        user ? res.json(user) : res.status(404).json({ message: 'Người dùng không tồn tại' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi xem thông tin người dùng', error: err.message });
    }
}

// Cập nhật thông tin người dùng
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        user ? res.json(user) : res.status(404).json({ message: 'Người dùng không tồn tại' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi cập nhật thông tin người dùng', error: err.message });
    }
};

// Chặn người dùng
const blockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User không tồn tại' });

        user.isBlocked = true;
        const updated = await user.save();
        res.json({ message: 'User đã bị chặn', user: updated });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi chặn người dùng', error: err.message });
    }
};

// Bỏ chặn người dùng
const unBlockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User không tồn tại' });
        if (!user.isBlocked) return res.status(400).json({ message: 'User không bị chặn' }); // 400 Bad Request
        
        user.isBlocked = false;
        const updated = await user.save();
        res.json({ message: 'User đã được bỏ chặn', user: updated });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi bỏ chặn người dùng', error: err.message });
    }
};

// Tạo mới sản phẩm
const createProduct = async (req, res) => {
    try {
        const { slug, category } = req.body;
        const slugExists = await Product.findOne({ slug });
        if (slugExists) return res.status(400).json({ message: 'Tên định danh sản phẩm đã tồn tại!' });
        if (!(await Category.findById(category))) return res.status(404).json({ message: 'Danh mục không tồn tại' });
        const product = await Product.create(req.body)
        return res.status(201).json(product);
    } catch (err) {
        return res.status(500).json({ messgae: 'Tạo sản phẩm thất bại', error: err.message });
    }
};

// Cập nhật sản phẩm
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { slug, category } = req.body;
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        if (slug) {
            const slugExists = await Product.findOne({ slug });
            // Chỉ báo lỗi nếu slug tồn tại và nó không phải là của chính sản phẩm này
            if (slugExists && slugExists._id.toString() !== id) return res.status(400).json({ message: 'Tên định danh sản phẩm đã tồn tại!' });
        }
        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) return res.status(404).json({ message: 'Danh mục không tồn tại' });
        }
        const updated = await Product.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });
        return res.json(updated);
    } catch (err) {
        return res.status(500).json({ message: 'Cập nhật thất bại', error: err.message });
    }
};

// Xóa sản phẩm
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        await Product.findByIdAndDelete(id);
        return res.json({ message: 'Xóa sản phẩm thành công' });
    } catch (err) {
        return res.status(500).json({ message: 'Xóa sản phẩm thất bại', error: err.message });
    }
};

// Thêm biến thể sản phẩm và thêm hình ảnh
const addVariantsAndImages = async (req, res) => {
    try {
        const { id } = req.params;
        const { variants = [], images = [] } = req.body;
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        if (!Array.isArray(variants)) return res.status(400).json({ message: 'variants phải là mảng' });
        if (!Array.isArray(images)) return res.status(400).json({ message: 'images phải là mảng' });
        for (const v of variants) {
            if (v.sku && product.variants.some(ev => ev.sku === v.sku)) {
                return res.status(400).json({ message: `Variant SKU đã tồn tại: ${v.sku}` });
            }
        }
        if (variants.length) product.variants.push(...variants);
        if (images.length) product.images.push(...images);
        await product.save();
        return res.json({ message: 'Cập nhật biến thể, hình ảnh thành công', product });
    } catch (err) {
        return res.status(500).json({ message: 'Thêm biến thể, hình ảnh không thành công', error: err.message });
    }
}

// Xóa biến thể sản phẩm và hình ảnh
const deleteVariantsAndImages = async (req, res) => {
    try {
        const { id } = req.params;
        const { variantIds = [], imageIds = [] } = req.body;
        if (!Array.isArray(variantIds)) return res.status(400).json({ message: 'variantIds phải là mảng' });
        if (!Array.isArray(imageIds)) return res.status(400).json({ message: 'imageIds phải là mảng' });
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });

        // Xóa variants
        if (variantIds.length > 0) {
            product.variants = product.variants.filter(
                v => !variantIds.includes(v._id.toString())
            );
        }

        // Xóa images bằng _id
        if (imageIds.length > 0) {
            // Kiểm tra số lượng ảnh trước khi xóa
            if (product.images.length - imageIds.length < 3) {
                 return res.status(400).json({
                     message: 'Không thể xóa - sản phẩm phải giữ ít nhất 3 ảnh'
                 });
            }
            product.images = product.images.filter(
                img => !imageIds.includes(img._id.toString())
            );
        }

        await product.save();
        return res.json({ 
            message: 'Xóa biến thể và hình ảnh thành công', 
            product 
        });
    } catch (err) {
        return res.status(500).json({ 
            message: 'Xóa biến thể và hình ảnh thất bại', 
            error: err.message 
        });
    }
}

// Chỉnh sửa biến thể sản phẩm
const updateVariant = async (req, res) => {
    try {
        const { id: productId, variantId } = req.params;
        const updateData = req.body;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        const variantIndex = product.variants.findIndex(v => v._id.toString() === variantId);
        if (variantIndex === -1) return res.status(404).json({ message: 'Biến thể không tồn tại' });
        if (updateData.sku) {
            const skuExists = product.variants.some(
                v => v.sku === updateData.sku && v._id.toString() !== variantId
            );
            if (skuExists) return res.status(400).json({ message: 'SKU đã tồn tại trong sản phẩm này' });
        }
        const variant = product.variants[variantIndex];
        Object.keys(updateData).forEach(key => {
            // Đảm bảo cập nhật lồng ghép (nested update) nếu có
            if (typeof updateData[key] === 'object' && !Array.isArray(updateData[key]) && variant[key]) {
                variant[key] = { ...variant[key], ...updateData[key] };
            } else {
                variant[key] = updateData[key];
            }
        });
        await product.save();
        return res.json({
            message: 'Cập nhật biến thể thành công',
            variant: product.variants[variantIndex]
        });
    } catch (err) {
        return res.status(500).json({
            message: 'Cập nhật biến thể thất bại',
            error: err.message
        });
    }
};

// Xem các danh mục sản phẩm
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi xem danh mục sản phẩm', error: err.message });
    }
}

// Thêm danh mục sản phẩm (Đã là async/await)
const createCategory = async (req, res) => {
    try {
        const { slug } = req.body;
        const slugExists = await Category.findOne({ slug });
        if (slugExists) return res.status(400).json({ message: 'Tên định danh danh mục đã tồn tại!' });
        const category = await Category.create(req.body);
        return res.status(201).json(category);
    } catch (err) {
        return res.status(500).json({
            message: 'Lỗi server khi thêm danh mục sản phẩm',
            error: err.message,
        });
    }
};

// Chỉnh sửa danh mục sản phẩm (Đã là async/await)
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { slug } = req.body;
        const category = await Category.findById(id);
        if (!category) return res.status(404).json({ message: 'Danh mục không tồn tại' });
        if (slug) {
            const slugExists = await Category.findOne({ slug });
            if (slugExists && slugExists._id.toString() !== id) return res.status(400).json({ message: 'Tên định danh danh mục đã tồn tại!' });
        }
        const updated = await Category.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });
        return res.json(updated);
    } catch (err) {
        return res.status(500).json({
            message: 'Lỗi server khi chỉnh sửa danh mục sản phẩm',
            error: err.message,
        });
    }
};

const getOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20, filter, startDate, endDate } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const dateFilter = {};

        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const yesterdayStart = new Date(new Date().setDate(now.getDate() - 1)).setHours(0, 0, 0, 0);
        
        // Tính ngày đầu tuần (Chủ Nhật là 0, Thứ Hai là 1)
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Bắt đầu từ T2
        const thisWeekStart = new Date(new Date(now.setDate(diff)).setHours(0, 0, 0, 0));
        
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        if (filter === 'today') {
            dateFilter.createdAt = { $gte: todayStart };
        } else if (filter === 'yesterday') {
            dateFilter.createdAt = { $gte: new Date(yesterdayStart), $lt: todayStart };
        } else if (filter === 'thisweek') {
            dateFilter.createdAt = { $gte: thisWeekStart };
        } else if (filter === 'thismonth') {
            dateFilter.createdAt = { $gte: thisMonthStart };
        } else if (startDate && endDate) {
            // Đảm bảo endDate bao gồm cả ngày đó (đến 23:59:59)
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);

            dateFilter.createdAt = {
                $gte: new Date(startDate),
                $lt: endOfDay
            };
        }
        
        // Lấy tổng số đơn hàng (để phân trang) và danh sách đơn hàng trong 1 lần query
        const [orders, totalOrders] = await Promise.all([
            Order.find(dateFilter)
                .sort({ createdAt: -1 }) // Sắp xếp mới nhất trước
                .skip(skip)
                .limit(parseInt(limit))
                .populate('user', 'name email'), // Chỉ lấy tên và email user
            Order.countDocuments(dateFilter)
        ]);

        res.json({
            orders,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalOrders / parseInt(limit)),
            totalOrders,
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách đơn hàng', error: err.message });
    }
};

// Lấy chi tiết đơn hàng (Refactor sang async/await)
const getOrderDetail = async (req, res) => {
    try {
        const { id } = req.params;
        // Populate đầy đủ thông tin sản phẩm và người dùng
        const order = await Order.findById(id)
                                 .populate('user', 'name email phone address')
                                 .populate('products.product'); 
        
        order ? res.json(order) : res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
}

// Cập nhật trạng thái đơn hàng (Refactor sang async/await)
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Thêm validate cho status nếu cần (ví dụ: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
        const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
        }

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        
        order.status = status;
        if (status === 'cancelled' && order.status !== 'cancelled') {
            const stockUpdateOperations = order.items.map(item => { 
                
                if (!item.variantId) {
                    throw new Error(`Sản phẩm ${item.product} (item ${item._id}) trong đơn hàng ${order._id} thiếu variantId.`);
                }
                
                return Product.updateOne(
                    {
                        _id: item.product, 
                        'variants._id': item.variantId // Tìm đúng variant
                    },
                    {
                        $inc: { 'variants.$.stock': item.quantity } // Hoàn kho
                    },
                    { session } 
                );
            });

            await Promise.all(stockUpdateOperations);
        }

        order.status = status;
        const updatedOrder = await order.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.json(updatedOrder);
        
        const updated = await order.save();
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái', error: err.message });
    }
};

// Tạo mã giảm giá (Refactor sang async/await)
const createDiscountCode = async (req, res) => {
    try {
        // Thêm kiểm tra trùng lặp 'code'
        const { code } = req.body;
        const codeExists = await Discount.findOne({ code });
        if (codeExists) {
            return res.status(400).json({ message: 'Mã giảm giá này đã tồn tại' });
        }
        
        const discount = await Discount.create(req.body);
        res.status(201).json(discount);
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        
        res.status(500).json({ 
            message: 'Cập nhật trạng thái thất bại. Tất cả thay đổi đã được hoàn tác.', 
            error: err.message 
        });
    }
};

// Lấy tất cả mã giảm giá (Cập nhật để populate đơn hàng)
const getAllDiscountCodes = async (req, res) => {
    try {        
        const discounts = await Discount.find()
            .populate('orders', 'orderId total createdAt'); // Giả sử virtual tên là 'orders'

        res.json(discounts);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Thống kê cơ bản (Cập nhật để thêm 'người dùng mới' và 'sản phẩm bán chạy')
const dashboardBasic = async (req, res) => {
    try {
        // 1. Tính ngày bắt đầu của tháng này
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // 2. Dùng Promise.all để chạy song song các truy vấn
        const [
            totalUsers,
            newUsersThisMonth,
            totalOrders,
            revenueResult,
            bestSellingProducts
        ] = await Promise.all([
            // 1. Tổng người dùng
            User.countDocuments(),
            // 2. Người dùng mới (trong tháng này)
            User.countDocuments({ createdAt: { $gte: startOfMonth } }),
            // 3. Tổng đơn hàng
            Order.countDocuments(),
            // 4. Tổng doanh thu (chỉ đơn hàng đã hoàn thành - 'delivered', nếu có)
            Order.aggregate([
                // { $match: { status: 'delivered' } }, // Bỏ comment nếu bạn chỉ muốn tính doanh thu đơn đã giao
                { $group: { _id: null, total: { $sum: "$total" } } }
            ]),
            // 5. Sản phẩm bán chạy nhất
            Order.aggregate([
                { $unwind: "$products" }, // Tách mảng products ra
                {
                    $group: {
                        _id: "$products.product", // Nhóm theo ID sản phẩm
                        totalSold: { $sum: "$products.quantity" } // Tính tổng số lượng bán
                    }
                },
                { $sort: { totalSold: -1 } }, // Sắp xếp
                { $limit: 5 }, // Lấy 5 sản phẩm
                {
                    $lookup: { // Join với bảng products để lấy tên
                        from: 'products',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                },
                { $unwind: "$productDetails" } // Tách mảng productDetails
            ])
        ]);

        res.json({
            totalUsers,
            newUsersThisMonth,
            totalOrders,
            totalRevenue: revenueResult[0]?.total || 0,
            bestSellingProducts
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi lấy thống kê dashboard', error: err.message });
    }
};

const getDashboardCharts = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Vui lòng cung cấp startDate và endDate' });
        }

        const matchStage = {
            createdAt: {
                $gte: new Date(startDate),
                $lt: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)) // Bao gồm cả ngày cuối
            }
        };

        let groupStage = {};
        let sortStage = {};

        // Tùy chỉnh việc nhóm theo yêu cầu (day, month, year)
        switch (groupBy) {
            case 'year':
                groupStage = {
                    _id: { year: { $year: "$createdAt" } },
                };
                sortStage = { "_id.year": 1 };
                break;
            case 'month':
                groupStage = {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                };
                sortStage = { "_id.year": 1, "_id.month": 1 };
                break;
            case 'week':
                 groupStage = {
                    _id: {
                        year: { $year: "$createdAt" },
                        week: { $week: "$createdAt" }
                    },
                };
                sortStage = { "_id.year": 1, "_id.week": 1 };
                break;
            case 'day':
            default:
                groupStage = {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" }
                    },
                };
                 sortStage = { "_id.year": 1, "_id.month": 1, "_id.day": 1 };
                break;
        }

        // Thêm các chỉ số cần thống kê vào groupStage
        groupStage.totalRevenue = { $sum: "$total" };
        groupStage.totalOrders = { $sum: 1 };
        groupStage.totalProductsSold = { $sum: { $sum: "$products.quantity" } }; // Tổng số lượng sản phẩm bán ra

        const chartData = await Order.aggregate([
            { $match: matchStage },
            { $group: groupStage },
            { $sort: sortStage }
        ]);

        res.json({ chartData });

    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu biểu đồ', error: err.message });
    }
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
    addVariantsAndImages,
    deleteVariantsAndImages,
    updateVariant,
    getCategories,
    createCategory,
    updateCategory,
    getOrders,
    getOrderDetail,
    updateOrderStatus,
    createDiscountCode,
    getAllDiscountCodes,
    dashboardBasic,
    getDashboardCharts
};