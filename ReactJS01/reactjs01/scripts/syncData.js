// scripts/syncData.js
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/product');
const esClient = require('../src/config/elasticsearch');
const connection = require('../src/config/database');

const syncAllProductsToES = async () => {
  try {
    await connection();
    console.log('✅ Connected to MongoDB');
    
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products in MongoDB`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const doc of products) {
      try {
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
          refresh: true // Đảm bảo dữ liệu được refresh ngay lập tức
        });
        console.log(`✅ Synced product: ${doc.name}`);
        successCount++;
      } catch (err) {
        console.error(`❌ Error syncing product ${doc.name}:`, err.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Sync completed: ${successCount} successful, ${errorCount} failed`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing data:', error);
    process.exit(1);
  }
};

syncAllProductsToES();