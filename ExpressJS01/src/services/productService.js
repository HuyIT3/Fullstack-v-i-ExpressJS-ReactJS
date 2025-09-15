// src/services/productService.js
const Product = require('../models/product');
const Favorite = require('../models/favorite');
const Viewed = require('../models/viewed');
const Order = require('../models/order');
const Comment = require('../models/comment');
const esClient = require('../config/elasticsearch');

const getProductsByCategoryPagination = async (categoryId, page = 1, limit = 5) => {
  try {
    // Tính skip dựa trên page và limit
    const skip = (page - 1) * limit;

    // Tìm sản phẩm theo categoryId, populate thông tin category nếu cần
    // Sử dụng .skip() và .limit() để phân trang
    const products = await Product.find({ categoryId })
                                  .skip(skip)
                                  .limit(limit)
                                  .exec(); // .exec() trả về Promise

    // Đếm tổng số sản phẩm phù hợp với categoryId
    const total = await Product.countDocuments({ categoryId });

    const totalPages = Math.ceil(total / limit);

    return {
      products,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalProducts: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };

  } catch (error) {
    console.log(">>> Error getting products: ", error);
    throw error;
  }
};

// Service cho Lazy Loading (cũng dùng skip/limit, khác biệt chính ở Frontend)
const getProductsByCategoryLazy = async (categoryId, limit = 5, skip = 0) => {
  try {
    const products = await Product.find({ categoryId })
                                  .skip(skip)
                                  .limit(limit)
                                  .exec();

    return products; // Chỉ trả về array products

  } catch (error) {
    console.log(">>> Error getting products (Lazy): ", error);
    throw error;
  }
};


// Hàm search với Elasticsearch, hỗ trợ query text và filters
const searchProducts = async (queryParams) => {
  const { query = '', categoryId, minPrice, maxPrice, minDiscount, minViews, page = 1, limit = 5 } = queryParams;
  const from = (page - 1) * limit;

  try {
    const body = {
      from,
      size: limit,
      query: {
        bool: {
          must: query ? { multi_match: { query, fields: ['name^2', 'description'] } } : { match_all: {} }, // Tìm kiếm text, boost name
          filter: [],
        },
      },
      sort: [{ views: { order: 'desc' } }], // Sort theo lượt xem giảm dần mặc định
    };

    // Thêm filters
    if (categoryId) body.query.bool.filter.push({ term: { categoryId } });
    if (minPrice || maxPrice) {
      body.query.bool.filter.push({
        range: { price: { gte: minPrice || 0, lte: maxPrice || Number.MAX_SAFE_INTEGER } },
      });
    }
    if (minDiscount) body.query.bool.filter.push({ range: { discount: { gte: minDiscount } } });
    if (minViews) body.query.bool.filter.push({ range: { views: { gte: minViews } } });

    const response = await esClient.search({ index: 'products', body });
    const hits = response.hits.hits.map((hit) => hit._source);
    const total = response.hits.total.value;

    return {
      products: hits,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
      },
    };
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};
const syncAllProductsToES = async () => {
  const products = await Product.find({});
  for (const doc of products) {
    await esClient.index({
      index: 'products',
      id: doc._id.toString(),
      body: {
        name: doc.name,
        description: doc.description,
        price: doc.price,
        image: doc.image,
        categoryId: doc.categoryId?.toString(),
        discount: doc.discount,
        views: doc.views,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    });
  }
  console.log('✅ Synced all products to Elasticsearch');
};
// Add/Remove Favorite
const toggleFavorite = async (userId, productId) => {
  try {
    const existing = await Favorite.findOne({ userId, productId });
    if (existing) {
      await Favorite.deleteOne({ userId, productId });
      return { action: 'removed' };
    } else {
      const favorite = new Favorite({ userId, productId });
      await favorite.save();
      return { action: 'added' };
    }
  } catch (error) {
    throw error;
  }
};

const getUserFavorites = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const favorites = await Favorite.find({ userId })
    .populate('productId')
    .skip(skip)
    .limit(limit)
    .exec();
  const total = await Favorite.countDocuments({ userId });
  return {
    products: favorites.map(fav => fav.productId),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    }
  };
};

// Record Viewed Product
const recordViewed = async (userId, productId) => {
  try {
    // Update product views
    await Product.findByIdAndUpdate(productId, { $inc: { views: 1 } });
    
    // Record viewed
    const existing = await Viewed.findOne({ userId, productId });
    if (!existing) {
      const viewed = new Viewed({ userId, productId });
      await viewed.save();
    } else {
      existing.viewedAt = Date.now();
      await existing.save();
    }
  } catch (error) {
    throw error;
  }
};

const getUserViewed = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const viewed = await Viewed.find({ userId })
    .sort({ viewedAt: -1 })
    .populate('productId')
    .skip(skip)
    .limit(limit)
    .exec();
  const total = await Viewed.countDocuments({ userId });
  return {
    products: viewed.map(v => v.productId),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    }
  };
};

// Get Similar Products (using Elasticsearch for similarity)
const getSimilarProducts = async (productId, limit = 5) => {
  try {
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');

    const body = {
      size: limit,
      query: {
        bool: {
          must: { match: { categoryId: product.categoryId } },
          should: [
            { range: { price: { gte: product.price * 0.8, lte: product.price * 1.2 } } },
            { term: { discount: product.discount } },
          ],
          must_not: { term: { _id: productId } },
        },
      },
      sort: [{ views: 'desc' }],
    };

    const response = await esClient.search({ index: 'products', body });
    return response.hits.hits.map(hit => hit._source);
  } catch (error) {
    throw error;
  }
};

// Count Buyers and Commenters
const getProductStats = async (productId) => {
  try {
    // Count unique buyers (completed orders)
    const buyers = await Order.aggregate([
      { $match: { 'products.productId': mongoose.Types.ObjectId(productId), status: 'completed' } },
      { $group: { _id: '$userId' } },
      { $count: 'uniqueBuyers' }
    ]);
    const uniqueBuyers = buyers[0]?.uniqueBuyers || 0;

    // Count unique commenters
    const commenters = await Comment.aggregate([
      { $match: { productId: mongoose.Types.ObjectId(productId) } },
      { $group: { _id: '$userId' } },
      { $count: 'uniqueCommenters' }
    ]);
    const uniqueCommenters = commenters[0]?.uniqueCommenters || 0;

    return { uniqueBuyers, uniqueCommenters };
  } catch (error) {
    throw error;
  }
};

module.exports = { getProductsByCategoryPagination, getProductsByCategoryLazy, searchProducts,toggleFavorite,
  getUserFavorites,
  recordViewed,
  getUserViewed,
  getSimilarProducts,
  getProductStats, syncAllProductsToES};