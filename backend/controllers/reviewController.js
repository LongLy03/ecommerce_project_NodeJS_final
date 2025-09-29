const Review = require('../models/Review');
const Product = require('../models/Product');
const { io } = require('../server');

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

const addReview = async (req, res) => {
    try {
        const productId = req.params.idOrSlug;
        const userId = req.user._id;
        const { rating, comment } = req.body;
        
        if (!rating || !comment) return res.status(400).json({ message: 'Cần đánh giá bằng cách chọn số sao và bình luận sản phẩm' });
        
        const review = await Review.create({
            product: productId,
            user: userId,
            rating,
            comment
        });

        io.to(productId).emit('reviewAdded', review);

        const stats = await Review.aggregate([
            { $match: { product: review.product } },
            { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
        ])

        if (stats && stats[0]) {
            await Product.findByIdAndUpdate(review.product, {
                rating: stats[0].avgRating,
                numReviews: stats[0].count
            });
        }

        res.status(201).json(review);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

module.exports = {
    getReviews, 
    addReview
};