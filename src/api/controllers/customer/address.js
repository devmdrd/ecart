const Address = require("../../models/address");
const User = require("../../models/user");

// List all addresses of a specific user
exports.listAddresses = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId).populate('addresses');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Add a new address
exports.addAddress = async (req, res) => {
  const userId = req.body.userId;
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

// Edit an address
exports.updateAddress = async (req, res) => {
  const addressId = req.params.addressId;
  const updatedData = req.body;

  try {
    const updatedAddress = await Address.findByIdAndUpdate(addressId, updatedData, { new: true });
    if (!updatedAddress) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    res.status(200).json({ success: true, message: "Address updated successfully", address: updatedAddress });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ success: false, message: "Failed to update address" });
  }
};

// Delete an address
exports.deleteAddress = async (req, res) => {
  const { addressId, userId } = req.params;

  try {
    const address = await Address.findByIdAndDelete(addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    // Remove address reference from user
    await User.findByIdAndUpdate(userId, {
      $pull: { addresses: addressId }
    });

    res.status(200).json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ success: false, message: "Failed to delete address" });
  }
};
