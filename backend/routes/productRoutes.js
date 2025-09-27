// Catalog, chi tiết sản phẩm, tìm kiếm, lọc, ...

const express = require('express');
const router = express.Router();
const { getProducts } = require('../controllers/productController');

router.get('/', getProducts);

module.exports = router;