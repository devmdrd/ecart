const multer = require("multer");
const path = require("path");

// category image upload

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./src/api/public/assets/admin/img/category-images/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const uploadCategoryImage = multer({ storage: fileStorage });

// brand image upload
const brandStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/api/public/assets/admin/img/brand-images/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const uploadBrandImage = multer({ storage: brandStorage });

// product image upload
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/api/public/assets/admin/img/product-images/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname);
    cb(null, uniqueSuffix + fileExt);
  },
});
const uploadProductImage = multer({ storage: multerStorage });

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./src/api/public/assets/client/img/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const uploadProfileImage = multer({ storage: profileStorage });

// banner image upload
const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./src/api/public/assets/admin/img/banner-images/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const uploadBannerImage = multer({ storage: bannerStorage });

module.exports = {
  uploadCategoryImage,
  uploadBrandImage,
  uploadProductImage,
  uploadProfileImage,
  uploadBannerImage,
};
