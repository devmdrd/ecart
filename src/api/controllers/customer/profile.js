const User = require('../../models/user');
const Address = require("../../models/address")
const Cart = require("../../models/cart");
const Wishlist = require("../../models/wishlist");
const Order = require("../../models/order");
const path = require("path");

exports.renderProfile = async (req, res) => {
  if (!req.session?.user) return res.redirect("/login");

  try {
    const user = await User.findById(req.session.user.id).select("-password");
    if (!user) return res.render("client/error", { layout: "layouts/user-layout", message: "User not found", user: false });

    const orders = await Order.find({ user: user._id })
      .populate({ path: 'items.product', select: 'name images' })
      .populate({ 
        path: 'items.sku',
        populate: { path: 'attributes.attributeId', select: 'name' } 
      })
      .sort({ createdAt: -1 })
      .lean();

    const formattedOrders = orders.map(o => ({
      id: o._id.toString(),
      date: o.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      status: o.status,
      total: o.totalAmount,
      paymentMethod: o.paymentMethod || 'Not specified',
      tracking: {
        placed: o.createdAt.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        processed: ['Shipped', 'Delivered'].includes(o.status) ? o.updatedAt.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : null,
        shipped: o.status === 'Shipped' ? o.updatedAt.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : null,
        delivered: o.status === 'Delivered' ? o.updatedAt.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : null
      },
      shippingAddress: o.shippingAddress || {
        fullName: user.name,
        addressLine1: 'No address specified',
        city: '', state: '', zipCode: '', phone: user.phone || ''
      },
      products: o.items.map(i => {
        const variant = i.sku?.attributes?.map(attr => attr.attributeId?.name).filter(Boolean).join(", ") || 'No variant specified';
        return {
          id: i.product?._id?.toString() || 'unknown',
          name: i.product?.name || 'Product not available',
          variant,
          quantity: i.quantity,
          price: i.sku?.discountPrice ?? i.sku?.price ?? 0,
          originalPrice: i.sku?.price ?? 0,
          discountPrice: i.sku?.discountPrice ?? null,
          image: i.product?.images?.[0] || ''
        };
      })
    }));

    const addresses = await Address.find({ user: user._id }).lean();
    const formattedAddresses = addresses.map(a => ({
      id: a._id.toString(),
      fullName: a.fullName,
      addressLine1: a.addressLine1,
      addressLine2: a.addressLine2 || '',
      city: a.city,
      state: a.state,
      zipCode: a.postalCode,
      phone: a.phone,
      isDefault: a.isDefault
    }));

    const cartCount = await Cart.countDocuments({ user: user._id });
    const wishlistCount = await Wishlist.countDocuments({ user: user._id });

    res.render("client/profiles/account", {
      layout: "layouts/user-layout",
      userData: {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage || '',
        memberSince: user.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      },
      orders: formattedOrders,
      addresses: formattedAddresses,
      user: true,
      message: "",
      cartCount,
      wishlistCount
    });
  } catch (err) {
    console.error("Render Profile Error:", err);
    res.render("client/error", { layout: "layouts/user-layout", message: "Internal server error", user: false });
  }
};

exports.updateProfile = async (req, res) => {
  const { name, phone, email, username } = req.body;
  const userId = req.session?.user?.id;

  try {
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required." });
    }

    const updates = {
      name: name?.trim() || "",
      phone: phone?.trim() || "",
      email: email?.trim().toLowerCase() || "",
      username: username?.trim() || "",
    };

    if (req.file) {
      updates.profileImage = path.relative("src/api/public", req.file.path);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

