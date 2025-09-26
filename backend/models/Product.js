// Product Model: tên, giá, số lượng, tồn kho, ...

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      default: '',
    },
    images: [
      {
        url: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;