const mongoose = require('mongoose');

const attributeValueSchema = new mongoose.Schema({
  value: { type: String, required: true }
});

const attributeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  values: [attributeValueSchema],
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Attribute', attributeSchema);
