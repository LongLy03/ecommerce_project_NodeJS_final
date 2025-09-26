const mongoose = require("mongoose");

const User = require("./models/user");
const Category = require("./models/category");
const Product = require("./models/product");
const Order = require("./models/order");
const Cart = require("./models/cart");
const Review = require("./models/review");
const Loyalty = require("./models/loyalty");
const Discount = require("./models/discount");

const uri = "mongodb://127.0.0.1:27017/final_ecommerce";

const seed = async () => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      Cart.deleteMany({}),
      Review.deleteMany({}),
      Loyalty.deleteMany({}),
      Discount.deleteMany({}),
    ]);

    const users = await User.create([
      { name: "Nguyen Van A", email: "a@example.com", password: "123456" },
      { name: "Admin", email: "admin@example.com", password: "admin123", isAdmin: true },
    ]);

    const categories = await Category.insertMany([
      { category_name: "Điện thoại", description: "Các loại điện thoại" },
      { category_name: "Laptop", description: "Các loại laptop" },
    ]);

    const [cat1, cat2] = categories;

    const products = await Product.insertMany([
      { name: "iPhone 15", description: "Điện thoại mới nhất", price: 25000000, category: cat1._id },
      { name: "MacBook Pro", description: "Laptop cao cấp", price: 45000000, category: cat2._id },
    ]);

    const [prod1, prod2] = products;
    const user1 = users[0];

    await Order.insertMany([
      { customer: user1._id, total_amount: prod1.price, status: 1 },
      { customer: user1._id, total_amount: prod2.price, status: 1 },
    ]);

    await Cart.create({
      customer: user1._id,
      products: products.map((p) => ({ product: p._id, quantity: 1 })),
    });

    await Review.insertMany(
      products.map((p) => ({
        customer: user1._id,
        product: p._id,
        rating: 5,
        comment: `Đánh giá cho ${p.name}`,
      }))
    );

    await Loyalty.create({ customer: user1._id, points: 100 });

    await Discount.insertMany([
      { code: "SALE10", percentage: 10, description: "Giảm giá 10%" },
      { code: "SALE20", percentage: 20, description: "Giảm giá 20%" },
    ]);

    console.log("Seed dữ liệu thành công");
    mongoose.connection.close();
  } catch (err) {
    console.error("Lỗi seed:", err);
    mongoose.connection.close();
  }
};

seed();
