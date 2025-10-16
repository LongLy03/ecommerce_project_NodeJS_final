const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const { faker } = require('@faker-js/faker');

const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Discount = require('../models/Discount');
const Session = require('../models/Session');
const Category = require('../models/Category');
const Review = require('../models/Review');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI is undefined');
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

const seed = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany(),
    Product.deleteMany(),
    Cart.deleteMany(),
    Order.deleteMany(),
    Discount.deleteMany(),
    Session.deleteMany(),
    Category.deleteMany(),
    Review.deleteMany(),
  ]);

  const users = await User.insertMany(
    Array.from({ length: 10 }, () => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      address: faker.location.streetAddress(),
    }))
  );

  const categories = await Category.insertMany(
    Array.from({ length: 10 }, () => ({
      name: faker.commerce.department(),
      description: faker.commerce.productDescription(),
    }))
  );

  const products = await Product.insertMany(
    Array.from({ length: 10 }, () => ({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price({ min: 100000, max: 1000000 })),
      stock: faker.number.int({ min: 10, max: 100 }),
      category: categories[Math.floor(Math.random() * categories.length)]._id,
    }))
  );

  const discounts = await Discount.insertMany(
    Array.from({ length: 10 }, () => ({
      code: faker.string.alphanumeric(8).toUpperCase(),
      percentage: faker.number.int({ min: 5, max: 30 }),
      active: faker.datatype.boolean(),
    }))
  );

  const carts = await Cart.insertMany(
    users.map(u => ({
      user: u._id,
      items: [
        {
          product: products[Math.floor(Math.random() * products.length)]._id,
          quantity: faker.number.int({ min: 1, max: 5 }),
        },
      ],
      discount: discounts[Math.floor(Math.random() * discounts.length)]._id,
    }))
  );

  const orders = await Order.insertMany(
    users.map(u => ({
      user: u._id,
      items: [
        {
          product: products[Math.floor(Math.random() * products.length)]._id,
          quantity: faker.number.int({ min: 1, max: 3 }),
        },
      ],
      total: faker.number.int({ min: 200000, max: 2000000 }),
      status: faker.helpers.arrayElement(['Pending', 'Shipped', 'Delivered']),
      createdAt: faker.date.recent({ days: 30 }),
    }))
  );

  const sessions = await Session.insertMany(
    users.map(u => ({
      userId: u._id,
      token: faker.string.uuid(),
      device: faker.computer.model(),
      ipAddress: faker.internet.ipv4(),
      expiresAt: faker.date.future({ years: 1 }),
    }))
  );

  const reviews = await Review.insertMany(
    users.map(u => ({
      user: u._id,
      product: products[Math.floor(Math.random() * products.length)]._id,
      rating: faker.number.int({ min: 1, max: 5 }),
      comment: faker.lorem.sentence(),
    }))
  );

  console.log('✅ Seed completed successfully');
  await mongoose.connection.close();
};

seed().catch(err => {
  console.error('❌ Error seeding data:', err);
  mongoose.connection.close();
});
