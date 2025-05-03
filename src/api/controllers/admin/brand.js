const Brand = require("../../models/brand");
const Category = require("../../models/category");
const path = require("path");

exports.renderManageBrand = async (req, res) => {
  const brandId = req.params.brandId;

  try {
    const categories = await Category.find();

    if (!brandId) {
      return res.render("admin/brands/manage", { brand: null, categories });
    }

    const brand = await Brand.findById(brandId).populate("category");

    if (!brand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    res.render("admin/brands/manage", { brand, categories });
  } catch (error) {
    console.error("Error in Render Manage Brand:", error);
    res.status(500).json({ success: false, message: "Error loading form" });
  }
};

exports.renderBrandList = async (req, res) => {
  try {
    const brands = await Brand.find().populate("category").sort({ createdAt: -1 });
    res.render("admin/brands/list", { brands });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to retrieve brands" });
  }
};

exports.createBrand = async (req, res) => {
  const { name, description, category } = req.body;
  let imagePath = null;

  if (req.file && req.file.path) {
    imagePath = path.relative("src/api/public", req.file.path);
  }

  try {
    const trimmedName = name.trim();
    const trimmedDescription = description?.trim() || "";

    const existingBrand = await Brand.findOne({ name: trimmedName, category });
    if (existingBrand) {
      return res.status(409).json({ success: false, message: "Brand already exists" });
    }

    const newBrand = new Brand({
      name: trimmedName,
      description: trimmedDescription,
      logo: imagePath,
      category,
    });

    await newBrand.save();
    res.status(201).json({ success: true, message: "Brand created successfully" });
  } catch (error) {
    console.error("Error creating brand:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.updateBrand = async (req, res) => {
  const { brandId, name, description, category } = req.body;

  try {
    if (!brandId) {
      return res.status(400).json({ success: false, message: "Brand ID is required." });
    }

    const updates = {
      name: name.trim() || "",
      description: description?.trim() || "",
      category,
    };

    if (req.file) {
      updates.logo = path.relative("src/api/public", req.file.path);
    }

    const updatedBrand = await Brand.findByIdAndUpdate(brandId, updates, { new: true });

    if (!updatedBrand) {
      return res.status(404).json({ success: false, message: "Brand not found." });
    }

    res.status(200).json({ success: true, message: "Brand updated successfully" });
  } catch (error) {
    console.error("Update Brand Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

exports.deleteBrand = async (req, res) => {
  const brandId = req.params.brandId;

  try {
    const deletedBrand = await Brand.findByIdAndDelete(brandId);
    if (!deletedBrand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    res.status(200).json({ success: true, message: "Brand deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error occurred while deleting the brand" });
  }
};
