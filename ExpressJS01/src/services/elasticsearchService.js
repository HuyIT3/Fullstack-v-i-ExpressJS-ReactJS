// src/services/elasticsearchService.js
const esClient = require('../config/elasticsearch');

const initProductIndex = async () => {
  try {
    const exists = await esClient.indices.exists({ index: 'products' });
    if (!exists) {
      await esClient.indices.create({
        index: 'products',
        body: {
          mappings: {
            properties: {
              name: { 
                type: 'text',
                analyzer: 'standard', // Sử dụng standard analyzer
                fields: {
                  keyword: { type: 'keyword' } // Để hỗ trợ aggregation/sorting
                }
              },
              description: { 
                type: 'text',
                analyzer: 'standard'
              },
              price: { type: 'float' },
              image: { type: 'keyword' },
              categoryId: { type: 'keyword' },
              discount: { type: 'float' },
              views: { type: 'integer' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' }
            },
          },
          settings: {
            analysis: {
              analyzer: {
                // Tùy chỉnh analyzer nếu cần
                custom_analyzer: {
                  type: 'standard',
                  stopwords: '_none_'
                }
              }
            }
          }
        },
      });
      console.log('✅ Index products created');
    } else {
      console.log('ℹ️ Index products already exists');
    }
  } catch (error) {
    console.error('❌ Error init index:', error);
  }
};

module.exports = { initProductIndex };