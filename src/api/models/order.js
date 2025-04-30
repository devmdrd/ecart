const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
  items: [
    {
      _id: false,
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      sku: { type: mongoose.Schema.Types.ObjectId, ref: 'SKU', required: true }, 
      quantity: { type: Number, default: 1, min: 1 }
    }
  ],
  totalAmount: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'ONLINE', 'Not Specified'],
    default: 'Not specified'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
