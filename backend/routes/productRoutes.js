// Catalog, chi tiết sản phẩm, tìm kiếm, lọc, ...

const express = require('express');
const router = express.Router();
const { getProducts, getProductByIdOrSlug } = require('../controllers/productController');
const { getReviews, addReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/:idOrSlug', getProductByIdOrSlug);
router.get('/:idOrSlug/reviews', getReviews);
router.post('/:idOrSlug/reviews', protect, addReview);

module.exports = router;