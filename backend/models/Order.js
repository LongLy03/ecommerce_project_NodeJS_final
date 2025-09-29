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
    items: [orderItemSchema],
    shippingAddress: {
        fullName: String,
        phone: String,
        street: String,
        city: String,
        country: String,
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