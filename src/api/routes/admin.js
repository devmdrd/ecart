const express = require("express");
const router = express.Router();

const { renderLogin, login, logout } = require("../controllers/admin/auth");
const { renderAdminDashboard } = require("../controllers/admin/dashboard");
const { renderManageCategory, renderCategoryList, createCategory, updateCategory, deleteCategory } = require("../controllers/admin/category");
const { renderManageBrand, renderBrandList, createBrand, updateBrand, deleteBrand } = require("../controllers/admin/brand");
const { renderManageAttribute, renderAttributeList, createAttribute, updateAttribute, deleteAttribute } = require("../controllers/admin/attribute");
const { renderManageProduct, getProductAttributes, renderProductList, createProduct, updateProduct, deleteProduct } = require("../controllers/admin/product");
const { renderManageCoupon, renderCouponList, createCoupon, updateCoupon, deleteCoupon } = require("../controllers/admin/coupon");
const { renderManageBanner, renderBannerList, createBanner, updateBanner, deleteBanner } = require("../controllers/admin/banner");

const { upload } = require("../middlewares/multer");
const { authenticateSession  } = require("../middlewares/verification");

router.use(express.urlencoded({ extended: false }));

// Dashboard
router.get("/dashboard", authenticateSession , renderAdminDashboard);

// Auth
router.get("/login", renderLogin);
router.post("/login", login);
router.get("/logout", logout);

// Category 
router.get("/categories/manage/:categoryId?", authenticateSession, renderManageCategory);
router.get("/categories", authenticateSession, renderCategoryList); 
router.post("/categories", authenticateSession, upload.single("image"), createCategory); 
router.put("/categories", authenticateSession, upload.single("image"), updateCategory); 
router.delete("/categories/:categoryId", authenticateSession, deleteCategory); 

// Brand
router.get("/brands/manage/:brandId?", authenticateSession, renderManageBrand);
router.get("/brands", authenticateSession, renderBrandList); 
router.post("/brands", authenticateSession, upload.single("image"), createBrand); 
router.put("/brands", authenticateSession, upload.single("image"), updateBrand); 
router.delete("/brands/:brandId", authenticateSession, deleteBrand); 

// Attribute
router.get("/attributes/manage/:attributeId?", authenticateSession, renderManageAttribute);
router.get("/attributes", authenticateSession, renderAttributeList); 
router.post("/attributes", authenticateSession, upload.none(), createAttribute); 
router.put("/attributes", authenticateSession, upload.none(), updateAttribute); 
router.delete("/attributes/:attributeId/:attributeValueId", authenticateSession, deleteAttribute); 

// Product
router.get("/products/manage/:productId?", authenticateSession, renderManageProduct);
router.get("/products/attributes", authenticateSession, getProductAttributes);
router.get("/products", authenticateSession, renderProductList); 
router.post("/products", authenticateSession, upload.array("images", 5), createProduct); 
router.put("/products", authenticateSession, upload.array("images", 5), updateProduct); 
router.delete("/products/:productId", authenticateSession, deleteProduct); 

// Coupon
router.get("/coupons/manage/:couponId?", authenticateSession, renderManageCoupon); 
router.get("/coupons", authenticateSession, renderCouponList); 
router.post("/coupons", authenticateSession, createCoupon); 
router.put("/coupons", authenticateSession, updateCoupon); 
router.delete("/coupons/:couponId", authenticateSession, deleteCoupon);

// Banner
router.get("/banners/manage/:bannerId?", authenticateSession, renderManageBanner);
router.get("/banners", authenticateSession, renderBannerList);
router.post("/banners", authenticateSession, upload.single("image"), createBanner);
router.put("/banners", authenticateSession, upload.single("image"), updateBanner);
router.delete("/banners/:bannerId", authenticateSession, deleteBanner);

module.exports = router;
