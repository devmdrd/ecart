const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    // required: true,
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    // required: true,
  },   
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    // required: true,    
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",  
    // required: true,
  },
  price: {
    type: Number,   
    // required: true,
  },
  quantity: {
    type: Number,
    // required: true,
  },
  image: {
    type: String,
    // required: true,      
  },
});

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

module.exports = Wishlist;
