const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  review: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Rating', ratingSchema);
