const Review = require('../models/Review');
const Product = require('../models/Product');
const { io } = require('../server');
const mongoose = require('mongoose');

// Xem bình luận
const getReviews = async (req, res) => {
    try {
        const productId = req.params.idOrSlug;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const sortBy = req.query.sortBy || '-createdAt';
        if (page < 1) return res.status(400).json({ message: 'Page phải >= 1' });
        if (limit < 1 || limit > 50) return res.status(400).json({ message: 'Limit phải từ 1-50' });

        let product;
        if (mongoose.isValidObjectId(productId)) {
            product = await Product.findById(productId);
        } else {
            product = await Product.findOne({ slug: productId });
        }

        if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        const totalReviews = await Review.countDocuments({ product: product._id });
        const totalPages = Math.ceil(totalReviews / limit);

        if (page > totalPages && totalPages > 0) {
            return res.json({
                reviews,
                pagination: {
                    currentPage: totalPages,
                    totalPages,
                    totalReviews,
                    limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                    nextPage: page < totalPages ? page + 1 : null,
                    prevPage: page > 1 ? page - 1 : null
                }
            });
        }

        // Query với pagination và sort
        const reviews = await Review.find({ product: product._id })
            .sort(sortBy)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('user', 'name email')
            .lean();

        return res.json({
            reviews,
            pagination: {
                currentPage: page,
                totalPages,
                totalReviews,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                nextPage: page < totalPages ? page + 1 : null,
                prevPage: page > 1 ? page - 1 : null
            }
        });
    } catch (err) {
        return res.status(500).json({ message: 'Lỗi server khi xem bình luận' });
    }
};

// Thêm bình luận và đánh giá sao
const addReview = async (req, res) => {
    try {
        const productId = req.params.idOrSlug;
        const user = req.user ? req.user : null;
        const { rating, comment, guestName, guestEmail } = req.body;
        
        if (!comment || comment.trim().length === 0) return res.status(400).json({ message: 'Vui lòng nhập nội dung bình luận' });
        if (rating && !user) return res.status(401).json({ message: 'Bạn phải đăng nhập để đánh giá bằng sao' });
        if (!user && (!guestName || !guestEmail)) return res.status(400).json({ message: 'Khách phải nhập tên và email' });
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
        let productObjectId;
        if (mongoose.isValidObjectId(productId)) {
            productObjectId = new mongoose.Types.ObjectId(productId);
        } else {
            // nếu client gửi slug, tìm product để lấy _id
            const p = await Product.findOne({ $or: [{ _id: productId }, { slug: productId }] }).select('_id').lean();
            if (!p) {
                return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
            }
            productObjectId = p._id;
        }

        const stats = await Review.aggregate([
            { $match: { product: productObjectId, rating: { $ne: null } } },
            { $group: { _id: '$product', avgRating: { $avg: '$rating' }, ratingCount: { $sum: 1 } } }
        ]);

        const commentsCount = await Review.countDocuments({ product: productObjectId });
        let avg = 0;
        let ratingCount = 0;

        if (stats.length > 0) {
            avg = Number((stats[0].avgRating || 0).toFixed(1));
            ratingCount = stats[0].ratingCount;
        }

        await Product.findByIdAndUpdate(productObjectId, {
            rating: avg,
            numReviews: ratingCount,
            numComments: commentsCount
        });

        const populated = await Review.findById(review._id)
            .populate('user', 'name email')
            .lean();

        const io = req.app.get('io');
        if (io) io.to(`product_${productId}`).emit('reviewAdded', populated);
        return res.status(201).json({ message: 'Đã thêm bình luận thành công', review: populated });
    } catch (err) {
        return res.status(500).json({ message: 'Lỗi server khi bình luận và đánh giá sản phẩm' });
    }
};

module.exports = {
    getReviews, 
    addReview
};