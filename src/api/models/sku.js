const mongoose = require('mongoose');

const skuSchema = new mongoose.Schema({
  attributes: [
    {
      _id: false,
      attributeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attribute', required: true }, 
      valueId: { type: mongoose.Schema.Types.ObjectId } 
    }
  ],
  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, min: 0 },
  discountPercentage: { type: Number, min: 0, max: 100 },
  stock: { type: Number, default: 0, min: 0 }
});

module.exports = mongoose.model('SKU', skuSchema);
