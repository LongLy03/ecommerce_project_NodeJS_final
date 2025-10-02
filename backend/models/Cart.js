const mongoose = require('mongoose');

const cartItemShema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product',
        required: true
    },
    variantId: {
        type: mongoose.Schema.Types.ObjectId
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
}, { _id: true });

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true
    },
    items: [cartItemShema],
    discount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discount',
        default: null
    }
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;