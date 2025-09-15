require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/product');
const connection = require('../src/config/database');

const initialSync = async () => {
  try {
    await connection();
    console.log('✅ Connected to MongoDB');
    
    // Đồng bộ tất cả sản phẩm
    const result = await Product.syncAllToElasticsearch();
    
    console.log(`\n📊 Initial sync completed: ${result.success} successful, ${result.error} failed`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error in initial sync:', error);
    process.exit(1);
  }
};

initialSync();