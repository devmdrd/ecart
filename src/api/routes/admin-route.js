const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin-controller');
const brandController = require('../controllers/brand-controller');
const categoryController = require('../controllers/category-controller');
const productController = require('../controllers/product-controller');
const orderController = require('../controllers/order-controller');
const couponController = require('../controllers/coupon-controller');
const bannerController = require('../controllers/banner-controller');   

const {uploadCategoryImage, uploadProductImage, uploadBrandImage, uploadBannerImage} = require('../middlewares/multer');
const { isAdminAuthenticated } = require('../middlewares/verification');

router.use(express.urlencoded({ extended: false }));

// login routes
router.get('/login', adminController.getAdminLogin);
router.post('/login',adminController.adminLoginPost);
router.get('/dashboard', isAdminAuthenticated,adminController.getAdminDashboard);    
   
// category routes
router.get('/add-category',isAdminAuthenticated, categoryController.getAddCategory);
router.post('/add-category', uploadCategoryImage.single("image"), categoryController.addCategoryPost);
router.get('/view-category',isAdminAuthenticated, categoryController.getViewCategory);
router.get('/edit-category/:categoryId', categoryController.getEditCategory);
router.post('/edit-category/:categoryId', uploadCategoryImage.single("image"), categoryController.editCategoryPost);

router.get('/delete-category/:categoryId',categoryController.deleteCategory);

// brand routes
router.get('/add-brand',isAdminAuthenticated,brandController.getAddBrand);
router.post('/add-brand', uploadBrandImage.single("image"), brandController.addBrandPost);
router.get('/view-brand',isAdminAuthenticated,brandController.getViewBrand);
router.get('/view-brand/:categoryId', brandController.getBrandsByCategory);
router.get('/edit-brand/:brandId',brandController.getEditBrand);
router.post('/edit-brand/:brandId', uploadBrandImage.single("image"), brandController.editBrandPost);
router.get('/search-brands',brandController.searchBrands); 
router.get('/delete-brand/:brandId',brandController.deleteBrand);

// product routes
router.get('/add-product',isAdminAuthenticated,productController.getAddProduct);
router.get('/add-product/:categoryId',productController.brandsByCategory);
router.post('/add-product', uploadProductImage.array('files',4),productController.addProductPost);
router.get('/view-product',isAdminAuthenticated,productController.getViewProduct);
router.get('/edit-product/:productId',productController.getEditProduct);
router.post('/edit-product/:productId', uploadProductImage.array('files', 4), productController.editProductPost);
router.get('/delete-product/:productId', productController.deleteProduct);
router.get('/search-products',productController.searchProducts);

// user routes
router.get('/view-user', isAdminAuthenticated,adminController.getUserLists); 
router.get('/block-user/:userId', adminController.blockUser);        
router.get('/unblock-user/:userId', adminController.unblockUser);    
router.get('/search-users',adminController.searchUsers); 

// coupon routes
router.get('/view-coupons',isAdminAuthenticated,couponController.getViewCoupons);
router.post('/add-coupon',couponController.addCouponPost);
router.get('/delete-coupon/:couponId',couponController.deleteCoupon);
router.get('/edit-coupon/:couponId',couponController.getEditCoupon); 
router.post('/edit-coupon/:couponId',couponController.editCouponPost);
router.get("/validate-coupon/:couponCode/:total",couponController.validateCoupon);

// banner routes
router.get('/add-banner',isAdminAuthenticated,bannerController.getAddBanner);
router.post('/add-banner',uploadBannerImage.single("image"),bannerController.addBannerPost);
router.get('/view-banner',isAdminAuthenticated,bannerController.getViewBanners);
router.get('/edit-banner/:bannerId',bannerController.getEditBanner);
router.post('/edit-banner/:bannerId',uploadBannerImage.single("image"),bannerController.editBannerPost);
router.get('/delete-banner/:bannerId',bannerController.deleteBanner);

// logout route
router.get("/all-orders",isAdminAuthenticated,orderController.getAllOrders);   
router.get("/all-orders/:orderId",orderController.getAllOrders1);
router.get("/update-order-status/:orderId/:status",orderController.updateOrder);
router.get('/logout', adminController.adminLogout);

// sales and revenue report
router.get("/sales-revenue-report",isAdminAuthenticated,orderController.getSalesRevenueReport);
router.get("/all-sales-revenue-report",orderController.getAllSalesRevenueReport);
router.post("/filter-sales-revenue-report",orderController.postSalesRevenueReport);


         
module.exports = router;

   