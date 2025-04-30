const Address = require("../../models/address");
const User = require("../../models/user");
const Cart = require("../../models/cart");
const Wishlist = require("../../models/wishlist");

exports.renderAddress = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id).populate('addresses').lean();

    const formatted = user.addresses.map(a => ({
      id: a._id,
      fullName: a.fullName,
      houseNameOrNo: a.houseNameOrNo,
      street: a.street,
      city: a.city,
      state: a.state,
      postalCode: a.postalCode,
      country: a.country,
      phone: a.phone,
    }));

    const cart = await Cart.findOne({ user: req.session.user.id });
    const wishlistCount = await Wishlist.countDocuments({ user: req.session.user.id });

    res.render("client/accounts/address", {
      layout: "layouts/user-layout",
      activeTab: 'addresses',
      addresses: formatted,
      user: true,
      cartCount: cart?.products?.length || 0,
      wishlistCount
    });
  } catch (err) {
    console.error("Render Addresses Error:", err);
    res.render("client/error", {
      layout: "layouts/user-layout",
      message: "Internal server error",
      user: false
    });
  }
};

exports.addAddress = async (req, res) => {
  const userId = req.session.user.id;
  const addressData = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const newAddress = new Address(addressData);
    await newAddress.save();

    user.addresses.push(newAddress._id);
    await user.save();

    res.status(201).json({ success: true, message: "Address added successfully", address: newAddress });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({ success: false, message: "Failed to add address" });
  }
};

exports.getAddressById = async (req, res) => {
  const userId = req.session.user.id;
  const addressId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.addresses.includes(addressId)) {
      return res.status(403).json({ success: false, message: "Address does not belong to this user" });
    }

    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    res.status(200).json({ success: true, address });
  } catch (error) {
    console.error("Error fetching address:", error);
    res.status(500).json({ success: false, message: "Failed to fetch address" });
  }
};

exports.updateAddress = async (req, res) => {
  const { _id, ...updatedData } = req.body;

  try {
    const updatedAddress = await Address.findByIdAndUpdate(_id, updatedData, { new: true });
    if (!updatedAddress) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    res.status(200).json({ success: true, message: "Address updated successfully", address: updatedAddress });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ success: false, message: "Failed to update address" });
  }
};

exports.deleteAddress = async (req, res) => {
  const userId = req.session.user.id;
  const { addressId } = req.params;

  try {
    const address = await Address.findByIdAndDelete(addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { addresses: addressId }
    });

    res.status(200).json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ success: false, message: "Failed to delete address" });
  }
};
