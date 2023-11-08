const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },

    minSpend: {
      type: Number,
      required: true,
    },
    maxAmount: {
      type: Number,
      required: true,
    },
    userId: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    status: {
      type: String,
      default: "active",
    },
  }
  //   { timestamps: true }
);
const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon;
