const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    unique:true,
    required: true,
  },
  offer: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,  
  },
  mrp: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
    required: true,
  },
  discountPrice: {
    type: Number,
    required: true,
  },    
  quantity:{
    type:Number,     
    default:1
  },
  stock: {   
    type: Number,
    required: true,
  },
  image: [
    {
      type: String,   
      required: true,
    },
  ],

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true,
  },
  rating: { 
    type: Number, 
    default: 0 
  },
});


const Product = mongoose.model("Product", productSchema);

module.exports = Product;
