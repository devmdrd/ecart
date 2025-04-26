const express = require("express");
const router = express.Router();
const passport = require("passport");

const { renderDashboard } = require("../controllers/customer/dashboard");
const { renderLogin, renderRegister, renderForgotPassword, login, register, verifyOtp, forgotPassword, googleAuthCallback, logout } = require("../controllers/customer/auth");
const { renderProfile, updateProfile } = require("../controllers/customer/profile");
const { renderProducts, singleProduct } = require("../controllers/customer/products");
const { renderCart, addToCart, removeCartProduct } = require("../controllers/customer/cart");
const { renderWishlist, addToWishlist, removeWishlistProduct } = require("../controllers/customer/wishlist");

const { upload } = require("../middlewares/multer");
const { authenticateSession } = require("../middlewares/verification");

router.use(express.urlencoded({ extended: false }));

// Dashboard
router.get("/", renderDashboard);

// Auth
router.get("/login", renderLogin);
router.get("/register", renderRegister);
router.get("/forgot-password", renderForgotPassword);
router.post("/login", login);
router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.get("/logout", logout);

// Google Auth Routes
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/users/login" }), googleAuthCallback);

// Profiles
router.get("/profile", renderProfile);
router.post("/profile", authenticateSession, upload.single("image"), updateProfile);

// // Address
// router.get("/address", authenticateSession, renderAddress);
// router.post("/address", authenticateSession, addAddress);
// router.patch("/address", authenticateSession, updateAddress);
// router.delete("/address", authenticateSession, deleteAddress);

// // Products
router.get("/products", renderProducts);
router.get("/products/:productId/sku/:skuId", singleProduct);

// Cart
router.get("/cart", renderCart);
router.post("/cart", addToCart);
router.delete("/cart", removeCartProduct);

// Wishlist
router.get("/wishlist", renderWishlist);
router.post("/wishlist", addToWishlist);
router.delete("/wishlist", removeWishlistProduct);

// // Checkout
// router.get("/checkout", renderCheckout);

// // Orders
// router.post("/order", createOrder);
// router.get("/orders", renderOrders);

// // Payment
// router.post("/payment", confirmPayment);

// // Rating
// router.post("/rating", addRating);

module.exports = router;
