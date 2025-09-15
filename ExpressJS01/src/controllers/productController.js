// src/controllers/productController.js
const { getProductsByCategoryPagination, getProductsByCategoryLazy, searchProducts } = require('../services/productService');

const getProductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    // Gọi service PHÂN TRANG
    const data = await getProductsByCategoryPagination(categoryId, page, limit);

    return res.status(200).json({
      EC: 0,
      data: data // { products: [...], pagination: {...} }
    });

  } catch (error) {
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi máy chủ",
      DT: error.message
    });
  }
};

// Controller cho Lazy Loading
const getProductsByCategoryLazyLoad = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const limit = parseInt(req.query.limit) || 5;
    const skip = parseInt(req.query.skip) || 0; // Dùng 'skip' thay vì 'offset' cho Mongoose

    // Gọi service Lazy Loading
    const products = await getProductsByCategoryLazy(categoryId, limit, skip);

    return res.status(200).json({
      EC: 0,
      data: products // Trả về mảng sản phẩm
    });

  } catch (error) {
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi máy chủ",
      DT: error.message
    });
  }
};
const searchProductsController = async (req, res) => {
  try {
    // Lấy tất cả tham số query
    const {
      query,
      categoryId,
      minPrice,
      maxPrice,
      minDiscount,
      minViews,
      page = 1,
      limit = 5,
      sortBy = 'views',
      sortOrder = 'desc'
    } = req.query;

    const data = await searchProducts({
      query,
      categoryId,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minDiscount: minDiscount ? parseFloat(minDiscount) : undefined,
      minViews: minViews ? parseInt(minViews) : undefined,
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    });
    
    return res.status(200).json({ 
      EC: 0, 
      data 
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ 
      EC: -1, 
      EM: 'Lỗi tìm kiếm', 
      DT: error.message 
    });
  }
};


module.exports = { getProductsByCategory, getProductsByCategoryLazyLoad,searchProductsController };