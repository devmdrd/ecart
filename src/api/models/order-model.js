const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  orderDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: "pending",
  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
      price: Number,
    },
  ],

  billingAddress: {
    name: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  totalAmount: {
    type:Number,
  },
  paymentMethod: {
    type:String,
  },

  discounts: [
    {
      code: String,
      amount: Number,
    },
  ],

  orderHistory: [
    {
      timestamp: Date,
      status: String,
    },
  ],
 
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
