// Discount model: code giảm giá, số lần dùng, ...

const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    description: {
      type: String,
      default: '',
    },
    usageLimit: {
      type: Number,
      default: 0, // 0 = không giới hạn
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Discount = mongoose.model('Discount', discountSchema);
module.exports = Discount;