// checkout, tạo đơn, lịch sử đơn hàng,...

const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Discount = require('../models/Discount');
const Order = require('../models/Order');
const User = require('../models//User');
const sendEmail = require('../utils/sendEmail');

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
                return !i.variantId;
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

// Xem giỏ hàng với bản tóm tắt có tổng giá tiền và giảm giá (nếu có)
const getCart = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : null;
        let cart = await Cart.findOne({ user: userId })
            .populate('items.product', 'name price images variants')
            .populate('discount');
        
        if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
            return res.json({
                items: [],
                subtotal: 0,
                discount: null,
                discountAmount: 0,
                total: 0
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
        const shipping = 30000; // Mặc định tiền ship là 30.000 vnđ
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

// Thanh toán cho user + guest
const checkout = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : null;

        const { 
            name, 
            email, 
            shippingAddressId, 
            shippingAddress: shippingAddressBody, 
            paymentMethod 
        } = req.body;

        const cart = await Cart.findOne({ user: userId })
            .populate('items.product', 'name price variants stock')
            .populate('discount');

        if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Giỏ hàng trống' });

        let total = 0;
        const orderItems = cart.items.map(item => {
            let variant = null;

            if (item.variantId && item.product && item.product.variants) {
                variant = item.product.variants.id(item.variantId);
            }

            const price = variant ? variant.price : item.product.price;
            const subTotal = price * item.quantity;
            const shipping = 30000;
            total = total + subTotal + shipping;

            return {
                product: item.product._id,
                name: item.product.name,
                quantity: item.quantity,
                price,
                subTotal,
            };
        });

        let discountAmount = 0;
        let appliedDiscount = null;

        if (cart.discount) {
            appliedDiscount = cart.discount;
            discountAmount = (total * (appliedDiscount.value || 0)) / 100; 
            total -= discountAmount

            const updated = await Discount.findOneAndUpdate(
                { _id: cart.discount._id, usedCount: { $lt: appliedDiscount.usageLimit } },
                { $inc: { usedCount: 1 } },
                { new: true }
            );

            if (!updated) return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng' });

            appliedDiscount = updated;
        }

        let shippingAddress = {
            addressId: null,
            phone: '',
            street: '',
            city: '',
            country: '',
        };

        if (shippingAddressId) {
            if (!userId) return res.status(400).json({ message: 'Chỉ người dùng đã đăng nhập mới có thể dùng shippingAddressId' });

            const userLookup = await User.findById(userId);
            if (!userLookup) return res.status(400).json({ message: 'Người dùng không tồn tại' });

            const addr = userLookup.addresses.id(shippingAddressId);
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

        let user = null;
        let createdUser = null;

        if (userId) {
            user = await User.findById(userId);
        } else if (email) {
            const found = await User.findOne({ email: email });
            if (found) {
                user = found;
            } else {
                const defaultPassword = 'defaultPassword';

                const newUser = new User({
                    name: name || 'Khách hàng',
                    email: email,
                    password: defaultPassword,
                    addresses: [{
                        phone: shippingAddress.phone || '',
                        street: shippingAddress.street || '',
                        city: shippingAddress.city || '',
                        country: shippingAddress.country || '',
                        isDefault: true
                    }]
                });

                createdUser = await newUser.save();
                user = createdUser;
            }
        }

        const order = await Order.create({
            user: user ? user._id : null,
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

        cart.items = [];
        cart.discount = null;
        await cart.save();

        // Gửi email xác nhận
        const buildOrderHtml = (ord) => {
            const formatVND = (num) => Number(num).toLocaleString('vi-VN') + 'đ';

            const lines = ord.items.map(i => `
                <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${i.name}</td>
                <td style="padding: 8px; text-align:center;">${i.quantity}</td>
                <td style="padding: 8px; text-align:right;">${formatVND(i.price)}</td>
                <td style="padding: 8px; text-align:right;">${formatVND(i.subTotal)}</td>
                </tr>
            `).join('');

            return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #0d6efd; color: #fff; padding: 16px; text-align: center;">
                <h2 style="margin: 0;">E-Commerce Store</h2>
                <p style="margin: 4px 0;">Xác nhận đơn hàng #${ord._id}</p>
                </div>

                <div style="padding: 16px;">
                <p>Xin chào <strong>${ord.name}</strong>,</p>
                <p>Cảm ơn bạn đã đặt hàng! Dưới đây là chi tiết đơn hàng của bạn:</p>

                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <thead>
                    <tr style="background-color: #f8f9fa;">
                        <th style="padding: 8px; text-align:left;">Sản phẩm</th>
                        <th style="padding: 8px;">SL</th>
                        <th style="padding: 8px; text-align:right;">Đơn giá</th>
                        <th style="padding: 8px; text-align:right;">Thành tiền</th>
                    </tr>
                    </thead>
                    <tbody>
                    ${lines}
                    </tbody>
                </table>

                <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;">
                <p style="text-align: right;">Tạm tính: <strong>${formatVND(ord.items.reduce((s,i)=>s+i.subTotal,0))}</strong></p>
                <p style="text-align: right;">Giảm giá: <strong style="color: #dc3545;">-${formatVND(ord.discountAmount)}</strong></p>
                <p style="text-align: right;">Phí vận chuyển: <strong>${formatVND(30000)}</strong></p>
                <h3 style="text-align: right; color: #198754;">Tổng cộng: ${formatVND(ord.totalPrice)}</h3>

                <div style="margin-top: 20px;">
                    <h4>Địa chỉ giao hàng:</h4>
                    <p>${ord.shippingAddress.street}, ${ord.shippingAddress.city}, ${ord.shippingAddress.country}</p>
                </div>

                <p style="margin-top: 20px;">Chúng tôi sẽ thông báo cho bạn khi đơn hàng được giao cho đơn vị vận chuyển.</p>
                <p>Trân trọng,<br><strong>Đội ngũ E-Commerce Store</strong></p>
                </div>

                <div style="background-color: #f8f9fa; padding: 10px; text-align: center; font-size: 12px; color: #666;">
                <p>© ${new Date().getFullYear()} E-Commerce Store. Mọi quyền được bảo lưu.</p>
                </div>
            </div>
            `;
            };

        // gửi email xác nhận cho user/guest
        try {
            const html = buildOrderHtml(order);
            // ưu tiên call dạng object, fallback sang (to, subject, html)
            if (typeof sendEmail === 'function') {
                try {
                    await sendEmail({ to: order.email, subject: 'Xác nhận đơn hàng', html });
                } catch (e1) {
                    try {
                        await sendEmail(order.email, 'Xác nhận đơn hàng', html);
                    } catch (e2) {
                        console.error('[checkout] sendEmail both attempts failed', e1, e2);
                    }
                }
            }
        } catch (emailErr) {
            console.error('[checkout] email error', emailErr);
        }

        // Nếu là guest vừa tạo tài khoản thì gửi thêm email chứa thông tin đăng nhập
        if (createdUser) {
            const credHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                <h3>Tài khoản của bạn đã được tạo!</h3>
                <p>Chào ${createdUser.name},</p>
                <p>Bạn đã đặt hàng với tư cách khách. Chúng tôi đã tạo tài khoản cho bạn để theo dõi đơn hàng:</p>
                <ul>
                    <li><strong>Email:</strong> ${createdUser.email}</li>
                    <li><strong>Mật khẩu tạm thời:</strong> defaultPassword</li>
                </ul>
                <p>Vui lòng đăng nhập và đổi mật khẩu sau khi đăng nhập lần đầu.</p>
                <p>Trân trọng,<br><strong>Đội ngũ E-Commerce Store</strong></p>
                </div>
            `;
            try {
                if (typeof sendEmail === 'function') {
                    try {
                        await sendEmail({ to: createdUser.email, subject: 'Thông tin tài khoản mới', html: credHtml });
                    } catch (e1) {
                        try {
                            await sendEmail(createdUser.email, 'Thông tin tài khoản mới', credHtml);
                        } catch (e2) {
                            console.error('[checkout] sendAccountEmail failed', e1, e2);
                        }
                    }
                }
            } catch (e) {
                console.error('[checkout] send account email error', e);
            }
        }
        
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