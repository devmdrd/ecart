const express = require("express");
const router = express.Router();
const userController = require("../controllers/user-controller");
const productController = require("../controllers/product-controller");
const orderController = require("../controllers/order-controller");
const wishlistController = require("../controllers/wishlist-controller");
const cartController = require("../controllers/cart-controller");
const {uploadProfileImage} = require('../middlewares/multer');
const { isUserAuthenticated } = require("../middlewares/verification");
router.use(express.urlencoded({ extended: false }));


// main route
router.get("/dashboard",userController.getUserDashboard);

// auth routes
router.get("/login",userController.getUserLogin);
router.post("/login", userController.userLoginPost);
router.get("/sign-up", userController.getUserSignup);    
router.post("/sign-up", userController.registerNewUser);
router.get("/otp-form", userController.getOtpForm);   
router.post("/otp-form", userController.verifyOtp);
router.post('/validate-otp',userController.validateOtp);
router.get("/forgot-password",userController.getForgotPassword);
router.post("/forgot-password", userController.sendResetLink);
router.get("/reset/:token",userController.getResetPassword);
router.post("/signup-otp",userController.otpSignup);
router.post("/reset",userController.resetPassword);


// account routes
router.get("/accounts",isUserAuthenticated,userController.getUserProfile);
router.post('/post-details',userController.profileDetailsPost);
router.post('/post-profile',uploadProfileImage.single("image"),userController.profileImagePost);
router.post('/post-address',userController.addressDetailsPost);
router.get('/edit-address/:addressId',isUserAuthenticated,userController.getAddress);    
router.get('/delete-address/:addressId',isUserAuthenticated,userController.deleteAddress);       
    
// products routes
router.get("/single-product/:productId", productController.getSingleProduct);
router.get("/all-products/:categoryId", productController.getAllProducts);    

// cart routes 
router.get("/add-to-cart/:productId/:count/:price/:brand",cartController.addToCart);
router.get("/add-to-cart/:productId/:count/:price",cartController.addToCart1);
router.get("/cart",cartController.getCart);
router.get("/remove-product/:productId/:cartId",cartController.removeCartProduct);
   
// order routes
router.get('/all-orders/:orderId',orderController.getAllOrders11);
router.get("/cancel-order/:orderId",orderController.cancelOrder);
router.get("/return-order/:orderId",orderController.returnOrder);       

// wsishlist routes        
router.get("/add-to-wishlist/:productId",wishlistController.addToWishlist);
router.get("/wishlist",wishlistController.getWishlist);
router.get("/remove-wishlist/:productId/:wishlistId",wishlistController.removeWishlistProduct);

// payment routes
router.post("/buy-now", isUserAuthenticated,userController.getBuyNow); 
router.post('/order-success',orderController.orderSuccess)
router.get('/order-success1/:total/:addressId/:payment',orderController.orderSuccess1)
router.get('/order-success2/:orderId/:total/:addressId/:payment/:coupon',orderController.orderSuccess2)

// rating routes
router.post("/add-rating",productController.addRating);
 

// logout route
router.get("/logout",userController.userLogout);   

module.exports = router;       
