const Brand = require("../models/brand-model");
const Category = require("../models/category-model");
// const flash = require("express-flash");
const path = require("path");

const getAddBrand = async (req, res, next) => {
  const categoriesData = await Category.find();
  res.render("admin/add-brand", { categoriesData, message: "" });
};

const addBrandPost = async (req, res, next) => {
  const { name, description, category } = req.body;
  const image = req.file.path;
  const imageUrl = path.relative("src/api/public", image);

  const isAdded = await Brand.findOne({ name: name, category: category });
  console.log(isAdded);

  if (isAdded === null) {
    const data = await Brand.create({
      name: name,
      description: description,

      image: imageUrl,
      category: category,
    });
    req.flash("message", "Brand Added Successfully");
    res.redirect("/admin/view-brand");
  } else {
    const categoriesData = await Category.find();

    res.render("admin/add-brand", {
      categoriesData,
      message: "Brand already exists",
    });
  }
};

const getViewBrand = async (req, res, next) => {
  if (req.session.brandsData) {
    brandsData = req.session.brandsData;
    req.session.brandsData = false;
    console.log(brandsData);

    const categoriesData = await Category.find();
    res.render("admin/view-brand", { brandsData, categoriesData, message: "" });
  } else {
    const brandsData = await Brand.find().populate("category");
    const categoriesData = await Category.find();
    console.log(brandsData);
    const message = req.flash("message");
    res.render("admin/view-brand", {
      brandsData,
      categoriesData,
      message: message,
    });
  }
};

const getEditBrand = async (req, res) => {
  const { brandId } = req.params;
  const brandData = await Brand.findById(brandId).populate("category");

  if (brandData) {
    res.render("admin/brand-edit", { brandData });
  } else {
    res.status(404).send("Brand not found");
  }
};

const editBrandPost = async (req, res) => {
  console.log("edit start");
  const brandId = req.params.brandId;
  const { name, description, category } = req.body;
  console.log(description);
  const image = req.file.path;
  const imageUrl = path.relative("src/api/public", image);
  try {
    const Brands = await Brand.updateOne(
      { _id: brandId },
      {
        name: name,
        description: description,

        image: imageUrl,
        category: category,
      }
    );

    console.log("edit end");
  } catch (error) {
    console.log(error);
  }
  req.flash("message", "Brand Edited Successfully");
  res.redirect("/admin/view-brand");
};

const getBrandsByCategory = async (req, res) => {
  const { categoryId } = req.params;
  console.log(categoryId);
  const brandsData = await Brand.find({ category: categoryId }).populate(
    "category"
  );
  req.session.brandsData = brandsData;
  console.log(brandsData);
  res.redirect("/admin/view-brand");

  // res.render('admin/view-brand',{categoriesData,brandsData})
};

const searchBrands = async (req, res) => {
  const { searchQuery } = req.query;

  try {
    if (!searchQuery) {
      res.redirect("/admin/view-brand");
      return;
    }
    const categoriesData = await Category.find();

    const brandsData = await Brand.find({
      name: { $regex: searchQuery, $options: "i" },
    });

    res.render("admin/view-brand", { brandsData, categoriesData, message: "" });
  } catch (error) {
    console.error("Error searching Brands:", error);
    res.status(500).send("Internal Server Error");
  }
};

const deleteBrand = async (req, res) => {
  const brandId = req.params.brandId;
  await Brand.findByIdAndDelete(brandId);
  res.redirect("/admin/view-brand");
};
module.exports = {
  getAddBrand,
  addBrandPost,
  getViewBrand,
  getEditBrand,
  editBrandPost,
  getBrandsByCategory,
  searchBrands,
  deleteBrand,
};
