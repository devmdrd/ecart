const Cart = require("../../models/cart");
const User = require("../../models/user");
const Wishlist = require("../../models/wishlist");
const Coupon = require("../../models/coupon"); 
const Product = require("../../models/product");
const SKU = require("../../models/sku");

const formatCartItem = (item) => {
  const product = item.product || item;
  const sku = item.sku;

  const attributes =
    sku?.attributes?.map((attr) => {
      const matchedValue = attr.attributeId?.values?.find(
        (val) => val._id.toString() === attr.valueId.toString()
      );
      return matchedValue?.value || ""; 
    }) || [];

  return {
    productName: product.name || "Unnamed Product",
    productImage: product.images?.[0] || "",
    attributes,
    discountPrice: sku?.discountPrice || 0,
    qty: item.quantity || 1,
  };
};

exports.renderCheckout = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.render("client/auth/login", {
        layout: "layouts/user-layout",
        user: false,
        cartCount: "",
        wishlistCount: "",
      });
    }

    let cartItems = [];
    let subtotal = 0;
    let discount = 0;
    let appliedCoupon = null;
    let couponMessage = null;
    let cartCount = 0;
    let wishlistCount = 0;
    let addresses = [];
    let availableCoupons = [];

    if (req.query.productId) {
      const { productId, skuId, quantity } = req.query;

      const product = await Product.findById(productId).populate('brand');
      const sku = await SKU.findById(skuId).populate({
        path: 'attributes.attributeId',
        select: 'name values'
      });

      if (!product || !sku) {
        return res.status(400).render("error", {
          layout: "layouts/user-layout",
          user,
          message: "Invalid product or SKU."
        });
      }

      cartItems.push(formatCartItem({
        product,
        sku,
        quantity: parseInt(quantity, 10) || 1
      }));

      cartCount = 1;

    } else {
      const cart = await Cart.findOne({ user: user._id })
        .populate({ path: 'products.product', populate: { path: 'brand' } })
        .populate({ path: 'products.sku', populate: { path: 'attributes.attributeId', select: 'name values' } });

      if (cart && cart.products.length > 0) {
        cartItems = cart.products.map(item => formatCartItem(item));
        cartCount = cartItems.length;
      }
    }

    subtotal = cartItems.reduce((sum, item) => sum + (item.discountPrice * item.qty), 0);

    availableCoupons = await Coupon.find({
      expiryDate: { $gte: new Date() },
      usedBy: { $ne: user._id }
    });

    if (req.query.coupon) {
      appliedCoupon = await Coupon.findOne({
        code: req.query.coupon.toUpperCase().trim(),
        expiryDate: { $gte: new Date() },
        usedBy: { $ne: user._id }
      });

      if (appliedCoupon) {
        discount = appliedCoupon.discount;
        couponMessage = "Coupon applied successfully!";
      } else {
        couponMessage = "Invalid or expired coupon code.";
      }
    }

    const total = Math.max(subtotal - discount, 0);

    wishlistCount = await Wishlist.countDocuments({ user: user._id });

    const userDoc = await User.findById(user._id).populate('addresses');
    if (userDoc) {
      addresses = userDoc.addresses;
    }

    res.render("client/shopping/checkout", {
      layout: "layouts/user-layout",
      user,
      cartCount,
      wishlistCount,
      addresses,
      cartItems,
      subtotal,
      discount,
      total,
      appliedCoupon,
      availableCoupons,
      couponMessage
    });

  } catch (err) {
    console.error("Error in renderCheckout:", err);
    res.status(500).render("error", {
      layout: "layouts/user-layout",
      user: false,
      message: "Something went wrong. Please try again later."
    });
  }
};
