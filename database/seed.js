const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '../backend/.env' });

// Import models
const User = require('../backend/models/User');
const Product = require('../backend/models/Product');
const Category = require('../backend/models/Category');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected');

    // Xóa dữ liệu cũ
    // await User.deleteMany();
    // await Category.deleteMany();
    // await Product.deleteMany();

    // console.log('🗑️ Đã xóa dữ liệu cũ');

    // 1️⃣ Tạo user admin + user thường
    const users = await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: '123456',
        isAdmin: true,
        addresses: [
          { phone: '0123456789', street: '123 Trần Hưng Đạo', city: 'Hà Nội', country: 'VN', isDefault: true },
        ],
      },
      {
        name: 'Nguyen Van A',
        email: 'user@example.com',
        password: '123456',
        isAdmin: false,
        addresses: [
          { phone: '0987654321', street: '456 Lê Lợi', city: 'HCM', country: 'VN', isDefault: true },
          { phone: '0911222333', street: '789 Nguyễn Huệ', city: 'HCM', country: 'VN', isDefault: false },
        ],
      },
    ]);

    console.log('👤 Đã thêm user mẫu');

    // 2️⃣ Tạo danh mục mẫu
    const categories = await Category.insertMany([
      { name: 'Điện thoại', slug: 'dien-thoai', description: 'Các loại điện thoại thông minh' },
      { name: 'Laptop', slug: 'laptop', description: 'Laptop học tập, văn phòng, gaming' },
      { name: 'Phụ kiện', slug: 'phu-kien', description: 'Tai nghe, sạc, chuột...' },
    ]);

    console.log('📂 Đã thêm category mẫu');

    // 3️⃣ Tạo sản phẩm mẫu
    const products = await Product.insertMany([
      {
        name: 'iPhone 15 Pro Max',
        slug: 'iphone-15-pro-max',
        description: 'Điện thoại Apple mới nhất, hiệu năng mạnh mẽ.',
        category: categories[0]._id,
        price: 35000000,
        variants: [
          { sku: 'IP15PM-256', name: '256GB', price: 35000000, stock: 20, attributes: [{ key: 'màu', value: 'đen' }] },
          { sku: 'IP15PM-512', name: '512GB', price: 40000000, stock: 10, attributes: [{ key: 'màu', value: 'trắng' }] },
        ],
        brand: 'Apple',
        images: [{ url: 'https://example.com/iphone15.jpg' }],
        rating: 4.8,
        numReviews: 120,
      },
      {
        name: 'MacBook Air M2',
        slug: 'macbook-air-m2',
        description: 'Laptop siêu nhẹ, chip Apple M2.',
        category: categories[1]._id,
        price: 28000000,
        variants: [
          { sku: 'MBA-M2-8GB', name: '8GB RAM', price: 28000000, stock: 15, attributes: [{ key: 'màu', value: 'bạc' }] },
          { sku: 'MBA-M2-16GB', name: '16GB RAM', price: 32000000, stock: 5, attributes: [{ key: 'màu', value: 'xám' }] },
        ],
        brand: 'Apple',
        images: [{ url: 'https://example.com/macbookm2.jpg' }],
        rating: 4.7,
        numReviews: 90,
      },
      {
        name: 'Tai nghe AirPods Pro 2',
        slug: 'airpods-pro-2',
        description: 'Tai nghe không dây chống ồn chủ động.',
        category: categories[2]._id,
        price: 5500000,
        variants: [
          { sku: 'APPRO2-WHT', name: 'Màu trắng', price: 5500000, stock: 100, attributes: [{ key: 'màu', value: 'trắng' }] },
        ],
        brand: 'Apple',
        images: [{ url: 'https://example.com/airpodspro2.jpg' }],
        rating: 4.5,
        numReviews: 60,
      },
    ]);

    console.log('📦 Đã thêm product mẫu');
    console.log('🎉 SEED DATA HOÀN TẤT');
    process.exit();
  } catch (err) {
    console.error('❌ Lỗi seed dữ liệu:', err.message);
    process.exit(1);
  }
};

seedData();