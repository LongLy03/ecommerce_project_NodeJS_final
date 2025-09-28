// Lấy danh mục sản phẩm, chi tiết, lọc, ...

const Product = require('../models/Product');
const Category = require('../models/Category');

const getProducts = async (req, res) => {
  try {
    const { 
        category, 
        minPrice, 
        maxPrice,
        minRating,
        search, 
        sort = 'createdAt_desc', 
        brand, 
        page = 1, 
        limit = 10 } = req.query;

    const pageNum = Math.max(parseInt(page), 1);
    const pageSize = Math.min(Math.max(parseInt(limit), 1), 100);

    const filter = {};

    if (category) {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(category);
        if (isObjectId) {
            filter.category = category;
        } else {
            const cat = await Category.findOne({ slug: category });
            if (cat) {
                filter.category = cat._id;
            } else {
                return res.json({
                    data: [],
                    meta: { total: 0, totalPages: 0, page: pageNum, limit: pageSize }
                });
            }
        }
    }

    if (brand) {
        filter.brand = brand;
    }

    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (minRating) {
        filter.rating = { $gte: Number(minRating) }
    }

    if (search) {
        filter.$text = { $search: search };
    }

    const [field, order] = sort.split('_');
    const sortOption = {};
    const dir = order === 'asc' ? 1 : -1;
    const allowedSortFields = ['price', 'createdAt', 'rating', 'name'];
    if (allowedSortFields.includes(field)) {
        sortOption[field] = dir;
    } else {
        sortOption['createdAt'] = -1;
    }

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / pageSize);

    const products = await Product.find(filter)
        .select('name slug price images brand rating numReviews')
        .sort(sortOption)
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize)
        .lean();

    res.json({
        data: products,
        meta: { total, totalPages, page: pageNum, limit: pageSize, hasNextPage: pageNum < totalPages, hasPrev: pageNum > 1 }
    });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const getProductByIdOrSlug = async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        let product;
        if (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) {
            product = await Product.findById(idOrSlug).populate('category', 'name slug').lean();
        } else {
            product = await Product.findOne({ slug: idOrSlug }).populate('category', 'name slug').lean();
        }

        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

        return res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

module.exports = { 
    getProducts,
    getProductByIdOrSlug
};