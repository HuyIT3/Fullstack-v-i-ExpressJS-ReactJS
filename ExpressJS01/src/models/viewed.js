// src/models/viewed.js (New Model for Viewed Products)
const mongoose = require('mongoose');

const viewedSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  viewedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Viewed = mongoose.model('Viewed', viewedSchema);
module.exports = Viewed;