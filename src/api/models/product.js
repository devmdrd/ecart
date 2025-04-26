const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  images: [String],
  features: String,
  specifications: String,
  skus: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SKU' }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
