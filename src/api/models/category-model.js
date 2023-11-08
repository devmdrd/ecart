const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  offer: {
    type: Number,
    required: true,
    default: 0,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },     
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
     