const mongoose = require('mongoose');
const esClient = require('../config/elasticsearch');

// Schema Product
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  discount: { type: Number, default: 0 },
  views: { type: Number, default: 0 }
}, { timestamps: true });

// Hàm kiểm tra kết nối Elasticsearch
const checkElasticsearchConnection = async () => {
  try {
    await esClient.info();
    return true;
  } catch (error) {
    console.warn('⚠️ Elasticsearch not available, skipping sync');
    return false;
  }
};

// Middleware: Sau khi save
productSchema.post('save', async function (doc) {
  try {
    const isConnected = await checkElasticsearchConnection();
    if (!isConnected) return;
    
    await esClient.index({
      index: 'products',
      id: doc._id.toString(),
      body: {
        name: doc.name,
        description: doc.description,
        price: doc.price,
        image: doc.image,
        categoryId: doc.categoryId?.toString(),
        discount: doc.discount || 0,
        views: doc.views || 0,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
      refresh: true // Thêm refresh để dữ liệu có ngay lập tức
    });
    console.log(`✅ Synced product ${doc.name} to Elasticsearch`);
  } catch (err) {
    console.error('❌ Error syncing product (save):', err.message);
  }
});

// Middleware: Sau khi update
productSchema.post('findOneAndUpdate', async function (doc) {
  if (!doc) return;
  
  try {
    const isConnected = await checkElasticsearchConnection();
    if (!isConnected) return;
    
    await esClient.index({
      index: 'products',
      id: doc._id.toString(),
      body: {
        name: doc.name,
        description: doc.description,
        price: doc.price,
        image: doc.image,
        categoryId: doc.categoryId?.toString(),
        discount: doc.discount || 0,
        views: doc.views || 0,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
      refresh: true
    });
    console.log(`✅ Synced updated product ${doc.name} to Elasticsearch`);
  } catch (err) {
    console.error('❌ Error syncing product (update):', err.message);
  }
});

// Thêm static method để đồng bộ tất cả sản phẩm
productSchema.statics.syncAllToElasticsearch = async function () {
  try {
    const isConnected = await checkElasticsearchConnection();
    if (!isConnected) return { success: 0, error: 0 };
    
    const products = await this.find({});
    let successCount = 0;
    let errorCount = 0;
    
    for (const product of products) {
      try {
        await esClient.index({
          index: 'products',
          id: product._id.toString(),
          body: {
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
            categoryId: product.categoryId?.toString(),
            discount: product.discount || 0,
            views: product.views || 0,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
          },
          refresh: true
        });
        successCount++;
        console.log(`✅ Synced: ${product.name}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Error syncing ${product.name}:`, error.message);
      }
    }
    
    console.log(`📊 Sync completed: ${successCount} successful, ${errorCount} failed`);
    return { success: successCount, error: errorCount };
  } catch (error) {
    console.error('❌ Error in syncAllToElasticsearch:', error.message);
    return { success: 0, error: 1 };
  }
};

const Product = mongoose.model('Product', productSchema);
module.exports = Product;