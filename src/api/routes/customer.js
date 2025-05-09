const express = require("express");
const router = express.Router();
const passport = require("passport");

const { renderDashboard } = require("../controllers/customer/dashboard");
const { renderLogin, renderRegister, renderForgotPassword, login, register, verifyOtp, forgotPassword, googleAuthCallback, logout } = require("../controllers/customer/auth");
const { renderProfile, updateProfile } = require("../controllers/customer/profile");
const { renderProducts, renderSingleProduct } = require("../controllers/customer/products");
const { renderCart, addToCart, removeCartProduct } = require("../controllers/customer/cart");
const { renderWishlist, addToWishlist, removeWishlistProduct } = require("../controllers/customer/wishlist");
const { renderAddress, addAddress, getAddressById, updateAddress, deleteAddress } = require("../controllers/customer/address");
const { renderCheckout } = require("../controllers/customer/checkout");
const { createStripePaymentIntent, completeOrder, renderOrderSuccess } = require('../controllers/customer/payment');
const { renderOrders } = require("../controllers/customer/orders");

const { upload } = require("../middlewares/multer");
const { authenticateSession } = require("../middlewares/verification");

router.use(express.urlencoded({ extended: false }));

// Dashboard
router.get("/", authenticateSession({ required: false }), renderDashboard);

// Auth
router.get("/login", renderLogin);
router.get("/register", renderRegister);
router.get("/forgot-password", renderForgotPassword);
router.post("/login", login);
router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.get("/logout", logout);

// Google Auth
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/users/login" }), googleAuthCallback);

// Profiles
router.get("/accounts/profile", authenticateSession({ required: false }), renderProfile);
router.post("/profile", authenticateSession(), upload.single("image"), updateProfile);

// // Address
router.get("/accounts/address", authenticateSession({ required: false }), renderAddress);
router.get('/address/:id', authenticateSession(), getAddressById);
router.post("/address", authenticateSession(), addAddress);
router.patch("/address", authenticateSession(), updateAddress);
router.delete("/address/:addressId", authenticateSession(), deleteAddress);

// // Products
router.get("/products", authenticateSession({ required: false }), renderProducts);
router.get("/products/:productId/sku/:skuId", authenticateSession({ required: false }), renderSingleProduct);

// Cart
router.get("/cart", authenticateSession({ required: false }), renderCart);
router.post("/cart", authenticateSession(), addToCart);
router.delete("/cart", authenticateSession(), removeCartProduct);

// Wishlist
router.get("/wishlist", authenticateSession({ required: false }), renderWishlist);
router.post("/wishlist", authenticateSession(), addToWishlist);
router.delete("/wishlist", authenticateSession(), removeWishlistProduct);

// Checkout
router.get("/checkout", authenticateSession(), renderCheckout);

// // Orders
router.get("/accounts/orders", authenticateSession(), renderOrders);

// Payment
router.post('/create-payment-intent', createStripePaymentIntent);
router.post('/complete-order', completeOrder);
router.get('/order-success', renderOrderSuccess)

// // Rating
// router.post("/rating", addRating);

module.exports = router;
