const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      _id: false,
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      sku: { type: mongoose.Schema.Types.ObjectId, ref: 'SKU', required: true },  
      quantity: { type: Number, default: 1, min: 1 }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
