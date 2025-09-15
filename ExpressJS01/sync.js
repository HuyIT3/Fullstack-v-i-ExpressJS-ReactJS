// sync.js
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/product'); // Điều chỉnh path nếu cần (ví dụ: nếu root là D:\Nam4\CNPM\, thì path từ src)
const connection = require('./src/config/database');

const syncAll = async () => {
  try {
    await connection();
    console.log('✅ Connected to MongoDB');
    
    // Kiểm tra có products trong MongoDB không
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products in MongoDB`);
    if (products.length === 0) {
      console.warn('⚠️ No products in MongoDB to sync!');
      process.exit(0);
    }
    
    const result = await Product.syncAllToElasticsearch();
    console.log(`\n📊 Sync result: ${result.success} success, ${result.error} failed`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync error:', error.message);
    process.exit(1);
  }
};

syncAll();