const Coupon = require("../../models/coupon");

exports.renderManageCoupon = async (req, res) => {
  const couponId = req.params.couponId;

  try {
    if (!couponId) {
      return res.render("admin/coupons/manage", { coupon: null });
    }

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    res.render("admin/coupons/manage", { coupon });
  } catch (error) {
    console.error("Error in Render Manage Coupon:", error);
    res.status(500).json({ success: false, message: "Error loading form" });
  }
};

exports.renderCouponList = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.render("admin/coupons/list", { couponData: coupons });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to retrieve coupons" });
  }
};

exports.createCoupon = async (req, res) => {
  const { code, discount, expiryDate } = req.body;

  try {
    const trimmedCode = code.trim().toUpperCase();
    const existingCoupon = await Coupon.findOne({ code: trimmedCode });
    
    if (existingCoupon) {
      return res.status(409).json({ success: false, message: "Coupon code already exists" });
    }

    const newCoupon = new Coupon({
      code: trimmedCode,
      discount,
      expiryDate: new Date(expiryDate),
    });

    await newCoupon.save();
    res.status(201).json({ success: true, message: "Coupon created successfully" });
  } catch (error) {
    console.error("Error creating coupon:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.updateCoupon = async (req, res) => {
  const { couponId, code, discount, expiryDate } = req.body;

  try {
    if (!couponId) {
      return res.status(400).json({ success: false, message: "Coupon ID is required." });
    }

    const updates = {
      code: code.trim().toUpperCase() || "",
      discount,
      expiryDate: new Date(expiryDate),
    };

    const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, updates, { new: true });

    if (!updatedCoupon) {
      return res.status(404).json({ success: false, message: "Coupon not found." });
    }

    res.status(200).json({ success: true, message: "Coupon updated successfully" });
  } catch (error) {
    console.error("Update Coupon Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

exports.deleteCoupon = async (req, res) => {
  const couponId = req.params.couponId;

  try {
    const deletedCoupon = await Coupon.findByIdAndDelete(couponId);
    if (!deletedCoupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    res.status(200).json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error occurred while deleting the coupon" });
  }
};
