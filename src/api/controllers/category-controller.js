const Category = require("../models/category-model");
// const flash = require("express-flash");
const path = require("path");

const getAddCategory = (req, res, next) => {
  res.render("admin/add-category", { message: "" });
};

const addCategoryPost = async (req, res, next) => {
  const { name, description } = req.body;
  const imagePath = req.file.path;

  const imageUrl = path.relative("src/api/public", imagePath);

  try {
    const category = await Category.findOne({ name: name });
    if (category) {
      res.render("admin/add-category", { message: "Category Already Exists" });
    } else {
      const category = await new Category({
        name: name,
    
        description: description,
        image: imageUrl,
      });

      await category.save();
      req.flash("message", "Category Added Successfully");
      res.redirect("/admin/view-category");
    }
  } catch (err) {
    console.log(err);
  }
};

const getViewCategory = async (req, res, next) => {
  const categoryData = await Category.find();
  const message = req.flash("message");

  res.render("admin/view-category", { message: message, categoryData });
};

const getEditCategory = async (req, res) => {
  const { categoryId } = req.params;
  const categoryData = await Category.findById(categoryId);
  console.log(categoryData);
  if (categoryData) {
    res.render("admin/category-edit", { categoryData });
  } else {
    res.status(404).send("Category not found");
  }
};

const editCategoryPost = async (req, res) => {
  console.log(req.body);
  const categoryId = req.params.categoryId;
  const { name, description } = req.body;
  const image = req.file.path;
  console.log(image);

  const imageUrl = path.relative("src/api/public", image);

  try {
    await Category.findByIdAndUpdate(
      categoryId,
      { name, description, image: imageUrl },
      { new: true }
    );
    req.flash("message", "Category Edited Successfully");
    res.redirect("/admin/view-category");
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Internal Server Error");
  }
};

const deleteCategory = async (req, res) => {
  const categoryId = req.params.categoryId;
  await Category.findByIdAndDelete(categoryId);
  res.redirect("/admin/view-category");
};

module.exports = {
  getAddCategory,
  addCategoryPost,
  getViewCategory,
  getEditCategory,
  editCategoryPost,
  deleteCategory,
};
