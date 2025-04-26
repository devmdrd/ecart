const Banner = require("../../models/banner");
const Category = require("../../models/category");
const path = require("path");

exports.renderManageBanner = async (req, res) => {
  const bannerId = req.params.bannerId;

  try {
    const categories = await Category.find();

    if (!bannerId) {
      return res.render("admin/banners/manage", { banner: null, categories, message: "" });
    }

    const banner = await Banner.findById(bannerId);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    res.render("admin/banners/manage", { banner, categories, message: "" });
  } catch (error) {
    console.error("Error in Render Manage Banner:", error);
    res.status(500).json({ success: false, message: "Error loading banner form" });
  }
};

exports.renderBannerList = async (req, res) => {
  try {
    const banners = await Banner.find().populate("categoryId").sort({ createdAt: -1 });
    res.render("admin/banners/list", { bannerData: banners, message: "" });
  } catch (error) {
    console.error("Error retrieving banners:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve banners" });
  }
};

exports.createBanner = async (req, res) => {
  const { title, description, categoryId } = req.body;

  if (!req.file) {
    return res.status(400).json({ success: false, message: "Image is required" });
  }

  try {
    const newBanner = new Banner({
      title: title.trim(),
      description: description?.trim() || "",
      image: path.relative("src/api/public", req.file.path),
      categoryId,
    });

    await newBanner.save();
    res.status(201).json({ success: true, message: "Banner created successfully" });
  } catch (error) {
    console.error("Error creating banner:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.updateBanner = async (req, res) => {
  const { bannerId, title, description, categoryId } = req.body;

  try {
    if (!bannerId) {
      return res.status(400).json({ success: false, message: "Banner ID is required." });
    }

    const updates = {
      title: title.trim(),
      description: description?.trim() || "",
      categoryId,
    };

    if (req.file) {
      updates.image = path.relative("src/api/public", req.file.path);
    }

    const updatedBanner = await Banner.findByIdAndUpdate(bannerId, updates, { new: true });

    if (!updatedBanner) {
      return res.status(404).json({ success: false, message: "Banner not found." });
    }

    res.status(200).json({ success: true, message: "Banner updated successfully" });
  } catch (error) {
    console.error("Update Banner Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

exports.deleteBanner = async (req, res) => {
  const bannerId = req.params.bannerId;

  try {
    const deletedBanner = await Banner.findByIdAndDelete(bannerId);
    if (!deletedBanner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    res.status(200).json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({ success: false, message: "Error occurred while deleting the banner" });
  }
};
