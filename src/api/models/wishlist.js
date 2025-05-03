const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  sku: { type: mongoose.Schema.Types.ObjectId, ref: 'SKU', required: true },  
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

wishlistSchema.index({ user: 1, product: 1, sku: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
