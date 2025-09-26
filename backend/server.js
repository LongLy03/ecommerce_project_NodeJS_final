// File khởi động server

const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const passport = require('./config/passport');

connectDB();

const app = express();
app.use(express.json());

// Passport middleware
app.use(passport.initialize());

// Routes
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});