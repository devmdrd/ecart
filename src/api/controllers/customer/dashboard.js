const Cart = require("../../models/cart");
const Wishlist = require("../../models/wishlist");
const Category = require("../../models/category");
const Brand = require("../../models/brand");
const Banner = require("../../models/banner");
const Product = require("../../models/product");

exports.renderDashboard = async (req, res) => {
  try {
    const getMinSku = (skus = []) => skus.reduce((min, sku) => (sku.discountPrice || sku.price) < (min.discountPrice || min.price) ? sku : min, skus[0] || {});
  
    const categories = await Category.find();
    const brands = await Brand.find();
    const banners = await Banner.find();
    const products = await Product.find()
      .populate("category brand")
      .populate({ path: "skus", select: "price discountPrice discountPercentage stock" })
      .sort({ createdAt: -1 });

    const wishlistItems = req.session.user ? await Wishlist.find({ user: req.session.user._id }).select("_id product sku") : [];

    const processProduct = (product) => {
      const minSku = getMinSku(product.skus);
      const matchingWishlist = wishlistItems.find(item => item.sku.toString() === minSku._id.toString());

      return {
        _id: product._id,
        name: product.name,
        image: product.images[0] || '',
        price: minSku.price,
        discountPrice: minSku.discountPrice,
        discountPercentage: minSku.discountPercentage,
        stock: minSku.stock,
        skuId: minSku._id,
        isWishlisted: !!matchingWishlist,
        wishlistId: matchingWishlist?._id || null
      };
    };

    const productsByCategory = categories.map(category => ({
      _id: category._id,
      name: category.name,
      image: category.image || '',
      products: products.filter(product => product.category._id.toString() === category._id.toString()).map(processProduct)
    }));

    const newArrivals = products.slice(0, 8).map(processProduct);
    const bestSellers = products.sort(() => Math.random() - 0.5).slice(0, 8).map(processProduct);

    const cart = req.session.user ? await Cart.findOne({ user: req.session.user._id }) : null;
    const cartCount = cart ? cart.products.length : 0;
    const wishlistCount = wishlistItems.length;

    res.render("client/dashboard", {
      layout: "layouts/user-layout",
      categoryData: productsByCategory,
      newArrivals,
      bestSellers,
      brandData: brands,
      bannerData: banners,
      user: req.session.user || false,
      cartCount,
      wishlistCount
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).render("error", {
      layout: "layouts/user-layout",
      user: false,
      message: "Something went wrong. Please try again later."
    });
  }
};
