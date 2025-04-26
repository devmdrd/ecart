const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  sku: { type: mongoose.Schema.Types.ObjectId, ref: 'SKU', required: true },  
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
