const Review = require('../models/Review');
const Product = require('../models/Product');
const { io } = require('../server');
const mongoose = require('mongoose');

// Xem bình luận
const getReviews = async (req, res) => {
    try {
        const productId = req.params.idOrSlug;

        const reviews = await Review.find({ product: productId })
            .populate('user', 'name')
            .sort({ createAt: -1 })
            .lean();
            
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Thêm bình luận và đánh giá sao
const addReview = async (req, res) => {
    try {
        const productId = req.params.idOrSlug;
        const user = req.user ? req.user : null;
        const { rating, comment, guestName, guestEmail } = req.body;
        
        if (!comment || comment.trim().length === 0) {
            return res.status(400).json({ message: 'Vui lòng nhập nội dung bình luận' });
        }

        if (rating && !user) {
            return res.status(401).json({ message: 'Bạn phải đăng nhập để đánh giá bằng sao' });
        }

        if (!user && (!guestName || !guestEmail)) {
            return res.status(400).json({ message: 'Khách phải nhập tên và email' });
        }

        let review;

        if (user) {
            review = await Review.findOne({ product: productId, user: user._id });
            if (review) {
                review.comment = comment;
                if (rating) review.rating = Number(rating);
                await review.save();
            } else {
                review = await Review.create({
                    product: productId,
                    user: user._id,
                    rating: rating ? Number(rating) : null,
                    comment,
                });
            }
        } else {
            review = await Review.create({
                product: productId,
                guestName,
                guestEmail,
                comment,
                rating: null,
            });
        }
        
        // Cập nhật lại điểm trung bình và tổng số đánh giá của sản phẩm
        const stats = await Review.aggregate([
            { $match: { product:  new mongoose.Types.ObjectId(productId), rating: { $ne: null } } },
            { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
        ]);

        if (stats.length > 0) {
            await Product.findByIdAndUpdate(productId, {
                rating: stats[0].avgRating,
                numReviews: stats[0].count,
            });
        } else {
            await Product.findByIdAndUpdate(productId, { rating: 0, numReviews: 0 });
        }

        const populated = await Review.findById(review._id)
            .populate('user', 'name email')
            .lean();

        const io = req.app.get('io');
            if (io) {
                io.to(`product_${productId}`).emit('reviewAdded', populated);
        }

        res.status(201).json({ message: 'Đã thêm bình luận thành công', review: populated });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

module.exports = {
    getReviews, 
    addReview
};