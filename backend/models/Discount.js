// Discount model: code giảm giá, số lần dùng, ...

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
        maxUsage: {
            type: Number,
            default: 10, // mặc định 10 lần/code
        },
        usedCount: {
            type: Number,
            default: 0,
        },
    }
)