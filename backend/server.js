// File khởi động server

const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const passport = require('./config/passport');
const http = require('http');
const { Server } = require('socket.io');

connectDB();

const app = express();
app.use(express.json());

// Passport middleware
app.use(passport.initialize());

// Routes
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server (server, {
    cors: {
        origin: '*',
        methods: [ 'GET', 'POST' ]
    }
});

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('joinProductRoom', (productId) => {
        console.log('Client joined room ${productId}');
        socket.join(productId);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

module.exports = { io };

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});