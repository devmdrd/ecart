const Cart = require("../models/cart-model");
const Product = require("../models/product-model");
const Wishlist = require("../models/wishlist-model");
// const flash = require("express-flash");

const addToCart = async (req, res) => {
  try {
    if (req.session.user) {
      const productId = req.params.productId;
      const calcPrice = parseInt(req.params.price);
      const brandId = req.params.brand;
      const count = parseInt(req.params.count);

      const userId = req.session.user._id;

      const existingCartItem = await Cart.findOne({
        user: userId,
        product: productId,
      });

      if (existingCartItem) {
        existingCartItem.quantity += count;
        existingCartItem.price += calcPrice;
        await existingCartItem.save();
      } else {
        const newCartItem = {
          product: productId,
          brand: brandId,
          quantity: count,
          price: calcPrice,
          user: userId,
        };
        await Cart.create(newCartItem);
      }
      await Wishlist.findOneAndDelete({ user: userId, product: productId });
      res.redirect("/users/cart");
    } else {
      res.render("client/empty-cart", {
        layout: "layouts/user-layout",
        user: false,
        errorMessage: "",
      });
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
const addToCart1 = async (req, res) => {
  console.log(req.params)
  console.log("abcdegfhijklmno")
  if (req.session.user) {
    const productId = req.params.productId;
    const calcPrice = parseInt(req.params.price);
    const count = parseInt(req.params.count);
    const product = await Product.findById(productId);
    const brandId = product.brand;

    const userId = req.session.user._id;

    const existingCartItem = await Cart.findOne({
      user: userId,
      product: productId,
    });

    if (existingCartItem) {
      existingCartItem.quantity += count;
      existingCartItem.price += calcPrice;
      await existingCartItem.save();     
    } else {
      const newCartItem = {
        product: productId,
        brand: brandId,
        quantity: count,
        price: calcPrice,
        user: userId,
      };
      await Cart.create(newCartItem);
  
    }

    res.redirect("/users/cart");
  }
};

const getCart = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.render("client/empty-cart", {
        layout: "layouts/user-layout",
        user: false,
      });
    }

    const userId = req.session.user._id;

    const cartData = await Cart.find({ user: userId })
      .populate("brand")
      .populate("product")
      .exec();
    console.log(cartData);
    if(cartData.length === 0){
      return res.render("client/empty-cart", {
        layout: "layouts/user-layout",
        user: true,
      });
    }

    res.render("client/add-to-cart", {      
      layout: "layouts/user-layout",
      message: "",
      user: true,
      cartData,
    });
  } catch (error) {
    // Handle any errors that may occur during database queries or rendering
    next(error);
  }
};

const removeCartProduct = async (req, res) => {
  const { productId, cartId } = req.params;
  const userId = req.session.user._id;
  await Cart.findOneAndDelete({
    product: productId,    
    user: userId,
    _id: cartId,
  });

  res.redirect("/users/cart");
};

module.exports = {
  addToCart,
  getCart,
  removeCartProduct,
  addToCart1,
};   
         