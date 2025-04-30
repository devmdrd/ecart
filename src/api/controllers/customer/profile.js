const User = require('../../models/user');
const Cart = require("../../models/cart");
const Wishlist = require("../../models/wishlist");
const path = require("path");

exports.renderProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id).select("-password");
    if (!user) {
      return res.render("client/error", {
        layout: "layouts/user-layout",
        message: "User not found",
        user: false,
        cartCount: '',
        wishlistCount: ''
      });
    }

    const cart = await Cart.findOne({ user: user._id });
    const cartCount = cart ? cart.products.length : 0;
    const wishlistCount = await Wishlist.countDocuments({ user: user._id });

    res.render("client/accounts/profile", {
      layout: "layouts/user-layout",
      activeTab: 'profile',
      userData: {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage || '',
        memberSince: user.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      },
      user: true,
      cartCount,
      wishlistCount,
    });
  } catch (err) {
    console.error("Render User Profile Error:", err);
    res.render("client/error", {
      layout: "layouts/user-layout",
      message: "Internal server error",
      user: false
    });
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

