const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
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
    enum: ['Cash on Delivery', 'Credit Card', 'Debit Card', 'PayPal', 'UPI', 'Not specified'],
    default: 'Not specified'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
