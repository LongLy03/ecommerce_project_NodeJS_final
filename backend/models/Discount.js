// Discount model: code giảm giá, số lần dùng, ...

const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9]{5}$/, 'Mã giảm giá phải gồm 5 ký tự chữ và số'],
    },

    value: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },

    usageLimit: {
      type: Number,
      default: 10,
      max: 10
    },

    usedCount: {
      type: Number,
      default: 0,
    },

    expiryDate: {
        type: Date,
        required: [true, 'Ngày hết hạn là bắt buộc']
    }

}, { 
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
});

discountSchema.virtual('orders', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'discount'
});

const Discount = mongoose.model('Discount', discountSchema);
module.exports = Discount;