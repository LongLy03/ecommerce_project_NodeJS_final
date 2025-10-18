// Order model: sản phẩm, số lượng, ...

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product',
        required: true
    },

    name: {
        type: String,
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    subTotal: {
        type: Number,
        required: true
    },
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

    paymentMethod: {
        type: String,
        enum: ['COD', 'Online'],
        default: 'COD',
        required: true
    },

    discountAmount: {
        type: Number,
        required: true
    },

    discount: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Discount',
        default: null
    },

    pointsUsed: {
      type: Number,
      default: 0
    },
    
    pointsEarned: {
      type: Number,
      default: 0
    },

    totalPrice: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
        default: 'pending'
    },

    statusHistory: [{
        status: String,
        updatedAt: { type: Date, default: Date.now }
    }]
    
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;