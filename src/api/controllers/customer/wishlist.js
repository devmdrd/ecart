const Wishlist = require("../../models/wishlist");
const Product = require("../../models/product");
const SKU = require("../../models/sku");
const Cart = require("../../models/cart");

exports.renderWishlist = async (req, res, next) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(200).render("client/shopping/wishlist", {
        layout: "layouts/user-layout",
        user: false,
        wishlistData: [],
        cartCount: 0,
        wishlistCount: 0
      });
    }

    const userId = user.id;

    const cart = await Cart.findOne({ user: userId });
    const cartCount = cart ? cart.products.length : 0; 

    const wishlistCount = await Wishlist.countDocuments({ user: userId });

    const wishlistData = await Wishlist.find({ user: userId })
      .populate({
        path: "product",
        select: "name images brand",
        populate: { path: "brand", select: "name" },
      })
      .populate({
        path: "sku",
        select: "price discountPrice discountPercentage stock attributes",
        populate: { path: "attributes.attributeId", select: "name values" }
      });

    wishlistData.forEach(item => item.sku.attributes.forEach(attr => 
      attr.attributeId?.values?.find(v => v._id.toString() === attr.valueId.toString())
    ));

    res.status(200).render("client/shopping/wishlist", {
      layout: "layouts/user-layout",
      user: true,
      wishlistData,
      cartCount,
      wishlistCount
    });
  } catch (err) {
    next(err);
  }
};

exports.addToWishlist = async (req, res) => {
  if (!req.session.user) {
    return res.status(200).json({ success: false, message: "Please log in to add items to your wishlist." });
  }

  try {
    const { productId, skuId } = req.body;
    const userId = req.session.user.id;
    const product = await Product.findById(productId);
    const sku = await SKU.findById(skuId);

    if (!product || !sku) {
      return res.status(404).json({ success: false, message: "Product or SKU not found" });
    }

    const exists = await Wishlist.findOne({ user: userId, product: productId, sku: skuId });
    if (!exists) {
      await Wishlist.create({ product: productId, sku: skuId, user: userId });
    }

    res.status(201).json({ success: true, message: "Product added to wishlist successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
  
exports.removeWishlistProduct = async (req, res) => {
  const { productId, wishlistId } = req.body;
  const userId = req.session.user.id;

  try {
    await Wishlist.findOneAndDelete({ _id: wishlistId, product: productId, user: userId });
    res.status(200).json({ success: true, message: "Product removed from wishlist successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
