// Product Model: tên, giá, số lượng, tồn kho, ...

const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  sku: String,
  name: String,
  price: { type: Number, required: true },
  compareAtPrice: Number,
  stock: { type: Number, default: 0 },
  attributes: [{key: String, value: String}],
}, { _id: true });

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true},
    price: {
      type: Number,
      required: true,
      index: true,
      min: 0,
    },
    variants: {
      type: [variantSchema],
      validate: {
        validator: v => Array.isArray(v) && v.length >= 2,
        message: 'Sản phẩm phải có ít nhất 2 biến thể'
      }
    },
    brand: {
      type: String,
      default: '',
    },
    images: {
      type: [{ url: String}],
      validate: {
        validator: a => Array.isArray(a) && a.length >= 3,
        message: 'Sản phẩm phải có ít nhất 3 ảnh minh họa'
      }
    },
    rating: {
      type: Number,
      default: 0,
      index: true,
    },
    numReviews: {
      type: Number,
      default: 0,
    }
  }, { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', brand: 'text' });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;