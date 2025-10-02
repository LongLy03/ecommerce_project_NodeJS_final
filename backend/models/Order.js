// Order model: sản phẩm, số lượng, ...

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    items: [orderItemSchema],
    shippingAddress: {
        addressId: { type: mongoose.Schema.Types.ObjectId, default: null },
        phone: { type: String, default: '' },
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        country: { type: String, default: '' },
    },
    discount: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Discount',
        default: null
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'shipped'],
        default: 'pending'
    }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;