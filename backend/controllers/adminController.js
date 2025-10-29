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
            if (slugExists) return res.status(400).json({ message: 'Tên định danh sản phẩm đã tồn tại!' });
        }

        // Kiểm tra danh mục hợp lệ (nếu có cập nhật category)
        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) return res.status(404).json({ message: 'Danh mục không tồn tại' });
        }

        // Cập nhật sản phẩm
        const updated = await Product.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        return res.json(updated);
    } catch (err) {
        return res.status(500).json({
            message: 'Cập nhật thất bại',
            error: err.message,
        });
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
        return res.status(500).json({
            message: 'Xóa sản phẩm thất bại',
            error: err.message,
        });
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

        // Validate input
        if (!Array.isArray(variantIds)) return res.status(400).json({ message: 'variantIds phải là mảng' });
        if (!Array.isArray(imageIds)) return res.status(400).json({ message: 'imageIds phải là mảng' });

        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });

        // Xóa variants
        if (variantIds.length > 0) {
            const invalidVariants = variantIds.filter(vid => 
                !product.variants.some(v => v._id.toString() === vid)
            );
            
            if (invalidVariants.length > 0) {
                return res.status(400).json({ 
                    message: 'Một số variant không tồn tại', 
                    invalidIds: invalidVariants 
                });
            }

            product.variants = product.variants.filter(
                v => !variantIds.includes(v._id.toString())
            );
        }

        // Xóa images bằng _id
        if (imageIds.length > 0) {
            const invalidImages = imageIds.filter(imgId => 
                !product.images.some(img => img._id.toString() === imgId)
            );

            if (invalidImages.length > 0) {
                return res.status(400).json({
                    message: 'Một số ảnh không tồn tại',
                    invalidIds: invalidImages
                });
            }

            product.images = product.images.filter(
                img => !imageIds.includes(img._id.toString())
            );

            // Validate số lượng ảnh còn lại >= 3
            if (product.images.length < 3) {
                return res.status(400).json({
                    message: 'Không thể xóa - sản phẩm phải giữ ít nhất 3 ảnh'
                });
            }
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
            if (key === 'attributes') {
                variant.attributes = updateData.attributes;
            } else {
                variant[key] = updateData[key];
            }
        });


        await product.save();
        return res.json({
            message: 'Cập nhật biến thể thành công',
            variant: product.variants[variantIndex],
            product
        });
    } catch (err) {
        return res.status(500).json({
            message: 'Cập nhật biến thể thất bại',
            error: err.message
        });
    }
};

// Quản lý danh mục
// Xem các danh mục sản phẩm
const getCategories = (req, res) => {
    Category.find()
        .then(categories => res.json(categories))
        .catch(err => res.status(500).json({ message: 'Lỗi server khi xem danh mục sản phẩm', error: err.message }));
}

// Thêm danh mục sản phẩm
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


// Chỉnh sửa danh mục sản phẩm
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
    dashboardAdvanced
};