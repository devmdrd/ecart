const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: String,
  image: { type: String, required: true },
  description: String,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
