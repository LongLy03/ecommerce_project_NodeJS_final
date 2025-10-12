// File khởi động server

const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const passport = require('./config/passport');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');

connectDB();
const app = express();

// cors
app.use(
    cors({
        origin: process.env.FRONTEND_URL || true,
        credentials: true,
    })
);

app.use(express.json());

// session
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'change_this_now',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            ttl: 14 * 24 * 60 * 60,
        }),
        cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24,
        },
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes)

const PORT = process.env.PORT || 5000;

// web socket
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true,
    }
});

io.on('connection', (socket) => {
    console.log('Client đã kết nối');

    socket.on('joinProductRoom', (productId) => {
        console.log('Client tham gia phòng ${productId}');
        socket.join(productId);
    });

    socket.on('disconnect', () => {
        console.log('Client đã ngắt kết nối');
    });
});

module.exports = { io };

app.listen(PORT, () => {
    console.log(`Server đang chạy tại port ${PORT}`);
});