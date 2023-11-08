const Wishlist = require("../models/wishlist-model");
const Product = require("../models/product-model");
// const flash = require("express-flash");
const path = require("path");

const getWishlist = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.render("client/empty-wishlist", {
        layout: "layouts/user-layout",
        user: false,
        message: "",
      });
    }

    const userId = req.session.user._id;

    const wishlistData = await Wishlist.find({ user: userId })
      .populate("brand")
      .populate("product")
      .exec();
    console.log(wishlistData);
    if(wishlistData.length === 0){
      return res.render("client/empty-wishlist", {
        layout: "layouts/user-layout",
        user: true,
        message: "",
      });
    }

    res.render("client/add-to-wishlist", {
      layout: "layouts/user-layout",
      message: "",
      user: true,
      wishlistData,
    });
  } catch (error) {
    // Handle any errors that may occur during database queries or rendering
    next(error);
  }
};
const addToWishlist = async (req, res) => {
  if (!req.session.user) {
    return res.render("client/empty-wishlist", {
      layout: "layouts/user-layout",
      user: false,
      message: "",
    });
  }

  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId).populate("brand");

    if (!product) {
      return res.status(404).send("Product not found"); // Handle product not found
    }

    const userId = req.session.user._id;

    const existingWishlistItem = await Wishlist.findOne({
      user: userId,
      product: productId,
    });

    if (existingWishlistItem) {
      existingWishlistItem.quantity += 1;
      existingWishlistItem.price += product.originalPrice;
      await existingWishlistItem.save();
    } else {
      const newWishlistItem = {
        product: productId,
        brand: product.brand._id,
        quantity: 1,
        price: product.originalPrice,
        user: userId,
      };
      await Wishlist.create(newWishlistItem);
    }

    return res.redirect("/users/wishlist");
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Internal Server Error"); // Handle internal server error
  }
};
const removeWishlistProduct = async (req, res) => {
    const { productId, wishlistId } = req.params;
    const userId = req.session.user._id;
    await Wishlist.findOneAndDelete({
      product: productId,
      user: userId,
      _id: wishlistId,
    });
  
    res.redirect("/users/wishlist");
  };
module.exports = {
  getWishlist,
  addToWishlist,
  removeWishlistProduct,
};
    