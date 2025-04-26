const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  logo: String,
  description: String
}, { timestamps: true });

module.exports = mongoose.model('Brand', brandSchema);
