// checkout, tạo đơn, lịch sử đơn hàng,...

const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Discount = require('../models/Discount');
const Order = require('../models/Order');

// Thêm vào giỏ hàng
const addToCart = async (req, res) => {
    try {
        const { productId, variantId, quatity = 1 } = req.body;
        const userId = req.user ? req.user._id : null;

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });

        const itemIndex = cart.items.findIndex(
            i =>
                i.product.toString() === productId &&
                (!variantId || i.variantId?.toString() === variantId)
        );

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: productId, variantId, quantity });
        }

        await cart.save();
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
        
        if (!cart) return res.json({ items: [] });

        res.json(cart);
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

        cart.items = cart.items.filter(i => i.product.toString() !== itemId);
        await cart.save();
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

        let cart = await Cart.findOne({ user: userId });
        if (!cart) return res.status(404).json({ message: 'Giỏ hàng trống' });

        cart.discount = discount._id;
        await cart.save();
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Thanh toán cho user
const checkout = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : null;
        const { shippingAddress, paymentMethod } = req.body;
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
            cart.discount.usedCount += 1;
            await cart.discount.save();
        }

        const order = await Order.create({
            user: userId,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            discount: cart.discount ? cart.discount._id : null,
            discountAmount,
            totalPrice: total,
            status: 'pending',
        });

        cart.items = [];
        cart.discount = null;
        await cart.save();
        res.status(201).json({ message: 'Đặt hàng thành công', order });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Thanh toán cho guest
const guestCheckout = async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod, discountCode } = req.body;

        if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Giỏ hàng trống' });
        }

        let total = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });

            const variant = item.variantId ? product.variants.id(item.variantId) : null;
            const price = variant ? variant.price : product.price;
            const subTotal = price * item.quantity;
            total += subTotal;

            orderItems.push({
                product: product._id,
                variantId: item.variantId || null,
                name: product.name,
                quantity: item.quantity,
                price,
                subTotal,
            });
        }

        let discount = null;
        let discountAmount = 0;
        if (discountCode) {
            discount = await Discount.findOne({ code: discountCode });
            if (!discount) return res.status(404).json({ message: 'Mã giảm giá không hợp lệ' });

            if (discount.usedCount >= discount.usageLimit) {
                return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng' });
            }

            discountAmount = (total * discount.value) / 100;
            total -= discountAmount;

            discount.usedCount += 1;
            await discount.save();
        }

        const order = await Order.create({
            user: null,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            discount: discount ? discount._id : null,
            discountAmount,
            totalPrice: total,
            status: 'pending',
        });

        res.status(201).json({ message: 'Đặt hàng thành công (Guest)', order });
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
    checkout,
    guestCheckout
};