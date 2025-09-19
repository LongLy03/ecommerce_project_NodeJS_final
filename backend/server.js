// File khởi động server

const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const passport = require('./config/passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');

connectDB();

const app = express();
app.use(express.json());

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions',
        ttl: 60 * 60 // 1 tiếng
    }),
    cookie: {
        maxAge: 60 * 60 * 1000, // 1 tiếng
        httpOnly: true,
        secure: false
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});