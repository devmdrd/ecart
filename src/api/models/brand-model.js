const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,    
    required: true,   
  },
  offer: {
    type: Number,
    required: true,
    default:0
  },
  description: {
    type: String,   
    required: true,
  },
  image:{
    type: String,
    required: true,
  },
  category:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",   
    required: true,
  },
  
});

const Brand = mongoose.model("Brand", brandSchema);

module.exports = Brand;
