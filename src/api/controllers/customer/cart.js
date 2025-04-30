const Cart = require("../../models/cart");
const Product = require("../../models/product");
const Wishlist = require("../../models/wishlist");
const SKU = require("../../models/sku");
const Coupon = require("../../models/coupon");

exports.renderCart = async (req, res, next) => {
  try {
    const user = req.session.user;

    if (!user) {
      return res.render("client/shopping/cart", {
        layout: "layouts/user-layout",
        user: false,
        cartData: [],
        cartCount: "",
        wishlistCount: "",
        subtotal: 0,
        discount: 0,
        total: 0,
        appliedCoupon: null,
        availableCoupons: []
      });
    }

    const userId = user.id;

    const cart = await Cart.findOne({ user: userId })
    .populate({
      path: 'products.product',
      populate: {
        path: 'brand', 
        model: 'Brand' 
      }
    })
    .populate({
      path: "products.sku",
      populate: {
        path: "attributes.attributeId",
        select: "name values"
      }
    });

    const cartData = cart?.products || [];

    cartData.forEach(item => {
      item.sku.attributes.forEach(attr => {
        attr.attributeId?.values?.find(v => v._id.toString() === attr.valueId.toString());
      });
    });

    const subtotal = cartData.length
      ? cartData.reduce((sum, item) => sum + item.sku.price * item.quantity, 0)
      : 0;

    const cartCount = cartData.length;
    const wishlistCount = await Wishlist.countDocuments({ user: userId });

    const availableCoupons = await Coupon.find({
      expiryDate: { $gte: new Date() },
      usedBy: { $ne: userId }
    });

    const couponCode = req.query.coupon;
    let appliedCoupon = null;
    let discount = 0;

    if (couponCode) {
      appliedCoupon = await Coupon.findOne({
        code: couponCode.toUpperCase().trim(),
        expiryDate: { $gte: new Date() },
        usedBy: { $ne: userId }
      });

      if (appliedCoupon) {
        discount = appliedCoupon.discount; 
      }
    }

    const total = Math.max(subtotal - discount, 0); 

    res.render("client/shopping/cart", {
      layout: "layouts/user-layout",
      user: true,
      cartData,
      cartCount,
      wishlistCount,
      subtotal,
      discount,
      total,
      appliedCoupon,
      availableCoupons
    });
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(200).json({ success: false, message: "Please log in to add items to your cart. " });
    }

    const { productId, skuId, count, wishlistThrough = false } = req.body;
    const quantity = parseInt(count);
    const userId = user.id;
    const product = await Product.findById(productId);
    const sku = await SKU.findById(skuId);

    if (!product || !sku) {
      return res.status(404).json({ success: false, message: "Product or SKU not found" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        products: [{ product: productId, sku: skuId, quantity }],
      });
    } else {
      const item = cart.products.find(p => p.product.toString() === productId && p.sku.toString() === skuId);
      if (item) {
        item.quantity += quantity;
      } else {
        cart.products.push({ product: productId, sku: skuId, quantity });
      }
      await cart.save();
    }

    if(wishlistThrough) await Wishlist.findOneAndDelete({ user: userId, product: productId, sku: skuId });

    res.status(201).json({ success: true, message: "Product added to cart successfully" });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.removeCartProduct = async (req, res) => {
  const { productId, skuId } = req.body;
  const userId = req.session.user.id;

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart || !cart.products.some(p => p.product.toString() === productId && p.sku.toString() === skuId)) {
      return res.status(404).json({ success: false, message: "Product or SKU not found in cart" });
    }

    cart.products = cart.products.filter(p => !(p.product.toString() === productId && p.sku.toString() === skuId));
    await cart.save();

    res.status(200).json({ success: true, message: "Product removed from cart successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};