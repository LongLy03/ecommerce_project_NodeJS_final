const Review = require('../models/Review');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Xem bình luận
const getReviews = async(req, res) => {
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

        // Query với pagination và sort
        const reviews = await Review.find({ product: product._id })
            .sort(sortBy)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('user', 'name email') // Populate thông tin user
            .lean();

        return res.json({
            reviews,
            pagination: {
                currentPage: page,
                totalPages,
                totalReviews,
                limit
            }
        });
    } catch (err) {
        console.error("Get Reviews Error:", err);
        return res.status(500).json({ message: 'Lỗi server khi xem bình luận' });
    }
};

// Thêm hoặc Cập nhật bình luận
const addReview = async(req, res) => {
    try {
        const productId = req.params.idOrSlug;
        const user = req.user ? req.user : null;
        const { rating, comment, guestName, guestEmail } = req.body;

        if (!comment || comment.trim().length === 0) {
            return res.status(400).json({ message: 'Vui lòng nhập nội dung bình luận' });
        }

        // Tìm ID sản phẩm chuẩn xác
        let productObjectId;
        let product;
        if (mongoose.isValidObjectId(productId)) {
            product = await Product.findById(productId);
        } else {
            product = await Product.findOne({ slug: productId });
        }

        if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        productObjectId = product._id;

        let review;

        // --- LOGIC QUAN TRỌNG: CHECK UPDATE HAY CREATE ---
        if (user) {
            // Nếu là User đã đăng nhập -> Kiểm tra xem đã review sản phẩm này chưa
            review = await Review.findOne({ product: productObjectId, user: user._id });

            if (review) {
                // NẾU ĐÃ CÓ -> CẬP NHẬT (UPDATE)
                review.comment = comment;
                // Chỉ update rating nếu người dùng có gửi lên rating mới
                if (rating) {
                    review.rating = Number(rating);
                }
                review.updatedAt = Date.now(); // Cập nhật thời gian
                await review.save();
            } else {
                // NẾU CHƯA CÓ -> TẠO MỚI (CREATE)
                review = await Review.create({
                    product: productObjectId,
                    user: user._id,
                    rating: rating ? Number(rating) : null,
                    comment,
                });
            }
        } else {
            // Nếu là Khách (Guest) -> Luôn tạo mới (vì khách không có ID để check trùng)
            if (!guestName || !guestEmail) {
                return res.status(400).json({ message: 'Khách phải nhập tên và email' });
            }
            review = await Review.create({
                product: productObjectId,
                guestName,
                guestEmail,
                comment,
                rating: null, // Khách không được đánh giá sao
            });
        }

        // --- TÍNH TOÁN LẠI ĐIỂM TRUNG BÌNH (RATING) ---
        // Chỉ tính trên các review có rating (nghĩa là của user đăng nhập)
        const stats = await Review.aggregate([
            { $match: { product: productObjectId, rating: { $ne: null } } },
            {
                $group: {
                    _id: '$product',
                    avgRating: { $avg: '$rating' },
                    ratingCount: { $sum: 1 }
                }
            }
        ]);

        // Đếm tổng số bình luận (bao gồm cả khách)
        const commentsCount = await Review.countDocuments({ product: productObjectId });

        let avg = 0;
        let ratingCount = 0;

        if (stats.length > 0) {
            avg = Number((stats[0].avgRating || 0).toFixed(1));
            ratingCount = stats[0].ratingCount;
        }

        // Cập nhật lại thông tin rating vào bảng Product
        await Product.findByIdAndUpdate(productObjectId, {
            rating: avg,
            numReviews: ratingCount,
            numComments: commentsCount
        });

        // --- GỬI SOCKET REALTIME ---
        // Populate để trả về đầy đủ thông tin user cho frontend hiển thị ngay
        const populatedReview = await Review.findById(review._id)
            .populate('user', 'name email')
            .lean();

        const io = req.app.get('io');
        if (io) {
            // Emit sự kiện reviewAdded vào room của sản phẩm
            // Frontend sẽ nghe sự kiện này để update list mà không cần reload
            io.to(`product_${productId}`).emit('reviewAdded', populatedReview);

            // Nếu dùng slug để join room thì emit cả vào room slug (tùy frontend join cái nào)
            // io.to(`product_${product.slug}`).emit('reviewAdded', populatedReview);
        }

        // Trả về kết quả
        const message = user && review.createdAt < review.updatedAt ?
            'Đã cập nhật đánh giá của bạn' :
            'Đã gửi bình luận thành công';

        return res.status(201).json({ message, review: populatedReview });

    } catch (err) {
        console.error("Add Review Error:", err);
        return res.status(500).json({ message: 'Lỗi server khi bình luận', error: err.message });
    }
};

module.exports = {
    getReviews,
    addReview
};