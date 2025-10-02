// checkout, tạo đơn, lịch sử đơn hàng,...

const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Discount = require('../models/Discount');
const Order = require('../models/Order');
const User = require('../models//User');

// Thêm vào giỏ hàng
const addToCart = async (req, res) => {
    try {
        const { productId, variantId, quantity = 1 } = req.body;
        const userId = req.user ? req.user._id : null;
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });

        const itemIndex = cart.items.findIndex( i => {
            if (i.product.toString() !== productId) return false;

            if (variantId) {
                return !!i.variantId && i.variantId.toString() === variantId;
            } else {
                return !i.variantId; // match only items without variant
            }
        });

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: productId, variantId: variantId || null, quantity });
        }

        await cart.save();
        cart = await Cart.findById(cart._id).populate('items.product', 'name price images variants').populate('discount');
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Xem giỏ hàng
const getCart = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : null;
        let cart = await Cart.findOne({ user: userId })
            .populate('items.product', 'name price images variants')
            .populate('discount');
        
        if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
            const shipping = 0;
            return res.json({
                items: [],
                subtotal: 0,
                shipping,
                discount: null,
                discountAmount: 0,
                total: shipping
            });
        }

        const items = cart.items.map(item => {
            const product = item.product || {};
            let price = Number(product.price || 0);

            if (item.variantId && Array.isArray(product.variants)) {
                const variant = product.variants.find(v => String(v._id) === String(item.variantId));
                if (variant && typeof variant.price !== 'undefined') {
                    price = Number(variant.price);
                }
            }

            const quantity = Number(item.quantity || 0);
            const itemTotal = price * quantity;

            return {
                _id: item._id,
                productId: product._id,
                name: product.name || '',
                image: Array.isArray(product.images) ? product.images[0] : undefined,
                variantId: item.variantId || null,
                price,
                quantity,
                total: itemTotal
            };
        });

        const subtotal = items.reduce((sum, it) => sum + Number(it.total || 0), 0);
        const shipping = 30000;

        let discountAmount = 0;
        let discount = null;
        if (cart.discount) {
            discount = cart.discount;
            discountAmount = (subtotal * (discount.value || 0)) / 100;
        }

        const total = subtotal - discountAmount + shipping;

        return res.json({
            items,
            subtotal,
            shipping,
            discount,
            discountAmount,
            total
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' })
    }
};

// Cập nhật số lượng sản phẩm
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user ? req.user._id : null;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Giỏ hàng trống' });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: 'Sản phẩm không có trong giỏ' });

    item.quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Xóa sản phẩm ra khỏi giỏ hàng
const removeCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const userId = req.user ? req.user._id : null;

        let cart = await Cart.findOne({ user: userId });
        if (!cart) return res.status(404).json({ message: 'Giỏ hàng trống' });

        cart.items = cart.items.filter(i => i._id.toString() !== itemId);
        await cart.save();
        cart = await cart.populate('items.product', 'name price images variants');
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Áp dụng mã giảm giá
const applyDiscount = async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user ? req.user._id : null;
        const discount = await Discount.findOne({ code });
        if (!discount) return res.status(404).json({ message: 'Mã giảm giá không hợp lệ' });

        if (discount.usedCount >= discount.usageLimit) {
            return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng' });
        }

        let cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price images variants');
        if (!cart || !cart.items || cart.items.length === 0) return res.status(404).json({ message: 'Giỏ hàng trống' });

        cart.discount = discount._id;
        await cart.save();

        cart = await Cart.findById(cart._id).populate('items.product', 'name price images variants').populate('discount');

        const items = cart.items.map(item => {
            const product = item.product || {};
            let price = Number(product.price || 0);
            if (item.variantId && Array.isArray(product.variants)) {
                const variant = product.variants.find(v => String(v._id) === String(item.variantId));
                if (variant && typeof variant.price !== 'undefined') price = Number(variant.price);
            }
            const quantity = Number(item.quantity || 0);
            return { price, quantity, total: price * quantity, name: product.name || '', productId: product._id };
        });

        const subtotal = items.reduce((s, it) => s + Number(it.total || 0), 0);
        const shipping = 30000;
        const discountAmount = (subtotal * (cart.discount?.value || 0)) / 100;
        const total = subtotal - discountAmount + shipping;

        return res.json({
            items,
            subtotal,
            shipping,
            discount: cart.discount || null,
            discountAmount,
            total
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Thanh toán cho user
const checkout = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : null;
        const { name, email, shippingAddressId, shippingAddress: shippingAddressBody, paymentMethod } = req.body;
        const cart = await Cart.findOne({ user: userId })
            .populate('items.product', 'name price variants stock')
            .populate('discount');

        if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Giỏ hàng trống' });

        let total = 0;
        const orderItems = cart.items.map(item => {
            let variant = null;
            if (item.variantId) {
                variant = item.product.variants.id(item.variantId);
            }

            const price = variant ? variant.price : item.product.price;
            const subTotal = price * item.quantity;
            total += subTotal;

            return {
                product: item.product._id,
                variantId: item.variantId,
                name: item.product.name,
                quantity: item.quantity,
                price,
                subTotal,
            };
        });

        let discountAmount = 0;
        if (cart.discount) {
            discountAmount = (total * cart.discount.value) / 100; 
            total -= discountAmount;
            const updated = await Discount.findOneAndUpdate(
                { _id: cart.discount._id, usedCount: { $lt: cart.discount.usageLimit } },
                { $inc: { usedCount: 1 } },
                { new: true }
            );
            if (!updated) return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng' });
        }

        const user = userId ? await User.findById(userId) : null;

        let shippingAddress = {
            addressId: null,
            phone: '',
            street: '',
            city: '',
            country: '',
        };

        if (shippingAddressId) {
            // lấy address từ user.addresses
            const user = await User.findById(userId);
            if (!user) return res.status(400).json({ message: 'Người dùng không tồn tại' });
            const addr = user.addresses.id(shippingAddressId);
            if (!addr) return res.status(400).json({ message: 'Địa chỉ không tồn tại trong hồ sơ người dùng' });

            shippingAddress.addressId = addr._id;
            shippingAddress.phone = addr.phone || '';
            shippingAddress.street = addr.street || '';
            shippingAddress.city = addr.city || '';
            shippingAddress.country = addr.country || '';
        } else if (shippingAddressBody) {
            shippingAddress = Object.assign(shippingAddress, shippingAddressBody);
        } else {
            return res.status(400).json({ message: 'Vui lòng cung cấp địa chỉ giao hàng hoặc shippingAddressId' });
        }

        const order = await Order.create({
            user: userId,
            name: user ? user.name : name,
            email: user ? user.email : email,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            discount: cart.discount ? cart.discount._id : null,
            discountAmount,
            totalPrice: total,
            status: 'pending',
        });

        if (!user) {
            await User.create({ name, email, password: "defaultPassword", addresses: shippingAddress });
        }

        cart.items = [];
        cart.discount = null;
        await cart.save();
        res.status(201).json({ message: 'Đặt hàng thành công', order });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

module.exports = { 
    addToCart, 
    getCart, 
    updateCartItem, 
    removeCartItem, 
    applyDiscount,
    checkout
};