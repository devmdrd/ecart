const Category = require("../../models/category");
const path = require("path");

exports.renderManageCategory = async (req, res) => {
  const categoryId = req.params.categoryId;

  try {
    if (!categoryId) {
      return res.render("admin/categories/manage", { category: null, message: "" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.render("admin/categories/manage", { category, message: "" });
  } catch (error) {
    console.error("Error in Render Manage Category:", error);
    res.status(500).json({ success: false, message: "Error loading form" });
  }
};

exports.renderCategoryList = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.render("admin/categories/list", { categoryData: categories, message: "" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to retrieve categories" });
  }
};

exports.createCategory = async (req, res) => {
  const { name, description } = req.body;
  let imagePath = null;

  if (req.file && req.file.path) {
    imagePath = path.relative("src/api/public", req.file.path);
  }

  try {
    const trimmedName = name.trim();
    const trimmedDescription = description?.trim() || "";

    const existingCategory = await Category.findOne({ name: trimmedName });
    if (existingCategory) {
      return res.status(409).json({ success: false, message: "Category already exists" });
    }

    const newCategory = new Category({
      name: trimmedName,
      description: trimmedDescription,
      image: imagePath,
    });

    await newCategory.save();
    res.status(201).json({ success: true, message: "Category created successfully" });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.updateCategory = async (req, res) => {
  const { categoryId, name, description } = req.body;

  try {
    if (!categoryId) {
      return res.status(400).json({ success: false, message: "Category ID is required." });
    }

    const updates = { 
      name: name.trim() || "", 
      description: description?.trim() || "" 
    };

    if (req.file) {
      updates.image = path.relative("src/api/public", req.file.path);
    }

    const updatedCategory = await Category.findByIdAndUpdate(categoryId, updates, { new: true });

    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    res.status(200).json({ success: true, message: "Category updated successfully" });
  } catch (error) {
    console.error("Update Category Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

exports.deleteCategory = async (req, res) => {
  const categoryId = req.params.categoryId;

  try {
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error occurred while deleting the category" });
  }
};
