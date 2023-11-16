const User = require("../models/user-model");
const Cart = require("../models/cart-model");
const Wishlist = require("../models/wishlist-model");
// Admin Midleware
const isAdminAuthenticated = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    return res.redirect("/admin/login");
  }
};

// User Middleware
const isUserAuthenticated = async(req, res, next) => {
  console.log(req.session.user);
  if (req.session.user) {
    const user = await User.findOne({ email: req.session.user.email });
    if (!user.blocked) {
      console.log("user  is authenticated");
      next();
    } else {
      console.log("user  is blocked");
      req.session.user = null;
      res.render("client/login", {
        layout: "layouts/user-layout",
        user: false,
        message: "Your account has been blocked",
        cartCount:"",
        wishlistCount:"",
      });
    }
  } else {
    res.render("client/login", {
      layout: "layouts/user-layout",
      user: false,
      message: "",
      cartCount:"",
      wishlistCount:"",
    });
  }    
};

module.exports = {
  isAdminAuthenticated,
  isUserAuthenticated,
};
