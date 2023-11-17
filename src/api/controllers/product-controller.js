const Product = require("../models/product-model");
const Category = require("../models/category-model");
const Brand = require("../models/brand-model");
const Cart = require("../models/cart-model");
const Wishlist = require("../models/wishlist-model");
// const flash = require("express-flash");
const path = require("path");

// admin actions

const getAddProduct = async (req, res, next) => {
  const categoriesData = await Category.find();
  res.render("admin/add-product", { categoriesData });
};

const brandsByCategory = async (req, res) => {
  const { categoryId } = req.params;
  const brandsData = await Brand.find({ category: categoryId });
  const categoriesData = await Category.find();
  console.log(brandsData);
  // res.render("admin/add-product", { brandsData, categoriesData });
  res.json(brandsData);
};

const addProductPost = async (req, res, next) => {
  try {
    const {
      category,
      brand,
      name,
      stock,
      mrp,
      originalPrice,
      discountPrice,
      description,
      offer,
    } = req.body;
    const images = req.files;

    const categoryData = await Category.findOne({ _id: category });
    if (categoryData.offer < offer) {
      await Category.updateOne({ _id: category }, { offer: offer });
    }
    const BrandData = await Brand.findOne({ _id: brand });
    if (BrandData.offer < offer) {
      await Brand.updateOne({ _id: brand }, { offer: offer });
    }

    if (
      images &&
      images.length === 4 &&
      images.every((image) => image.fieldname.startsWith("files"))
    ) {
      const imageUrls = images.map((image) => {
        const imageUrl = path.relative("src/api/public", image.path);
        console.log(imageUrl);
        return imageUrl;
      });

      const product = await Product.create({
        name: name,
        description: description,
        mrp: mrp,
        originalPrice: originalPrice,
        offer: offer,
        stock: stock,
        discountPrice: discountPrice,
        category: category,
        brand: brand,
        image: imageUrls,
      });

      console.log(product);

      res.redirect("/admin/view-product");
    } else {
      res.status(400).send("Please upload all four images.");
    }
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).send("Internal Server Error");
  }
};

const getViewProduct = async (req, res, next) => {
  const productsData = await Product.find()
    .populate("category")
    .populate("brand");
  console.log(productsData);
  res.render("admin/view-product", { productsData });
};

const getEditProduct = async (req, res) => {
  const { productId } = req.params;
  const productData = await Product.findById(productId)
    .populate("category")
    .populate("brand");

  console.log(productData);
  if (productData) {
    res.render("admin/product-edit", {
      productData,
    });
  } else {
    res.status(404).send("Product not found");
  }
};

const editProductPost = async (req, res) => {
  console.log(req.body)
  const productId = req.params.productId;

  const {
    category,
    brand,
    name,
    stock,
    mrp,
    originalPrice,
    discountPrice,
    description,
    offer,
  } = req.body;

  const images = req.files;

  const categoryData = await Category.findOne({ _id: category });
  
  if (categoryData.offer < offer) {
    await Category.updateOne({ _id: category }, { offer: offer });
  } else {
    const maxOfferProduct = await Product.findOne({ category: category }).sort({
      offer: -1,
    });
    await Category.updateOne(
      { _id: category },
      { offer: maxOfferProduct.offer }
    );
  }
  const BrandData = await Brand.findOne({ _id: brand });
  if (BrandData.offer < offer) {
    await Brand.updateOne({ _id: brand }, { offer: offer });
  } else {
    const maxOfferProduct = await Product.findOne({ brand: brand }).sort({
      offer: -1,
    });
    await Brand.updateOne(
      { _id: brand },
      { offer: maxOfferProduct.offer }
    );
  }

  if (
    images &&
    images.length === 4 &&
    images.every((image) => image.fieldname.startsWith("files"))
  ) {
    const imageUrls = images.map((image) => {
      const imageUrl = path.relative("src/api/public", image.path);
      console.log(imageUrl);
      return imageUrl;
    });

    console.log("start");
    const product = await Product.updateOne(
      { _id: productId },
      {
        $set: {
          name: name,
          description: description,
          mrp: mrp,
          originalPrice: originalPrice,
          offer: offer,
          stock: stock,
          discountPrice: discountPrice,
          category: category,
          brand: brand,
          image: imageUrls,
        },
      }
    );
    console.log(product);

    console.log("end");

    res.redirect("/admin/view-product");
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    const productData = await Product.findByIdAndDelete(productId).populate(
      "category"
    );
    console.log(productData);

    const category = productData.category;

    const maxOfferProduct = await Product.findOne({ category: category }).sort({
      offer: -1,
    });

    if (maxOfferProduct) {
      await Category.updateOne(
        { _id: category },
        { offer: maxOfferProduct.offer }
      );
    } else {
      await Category.updateOne({ _id: category }, { offer: 0 });
    }

    res.redirect("/admin/view-product");
  } catch (error) {
    // Handle errors, send an error response, or redirect to an error page
    console.error(error);
    res.status(500).send("Error deleting product");
  }
};

const searchProducts = async (req, res) => {
  const { searchQuery } = req.query;

  try {
    if (!searchQuery) {
      res.redirect("/admin/view-product");
      return;
    }

    const productsData = await Product.find({
      name: { $regex: searchQuery, $options: "i" },
    })
      .populate("category")
      .populate("brand");

    res.render("admin/view-product", { productsData });
  } catch (error) {
    console.error("Error searching Categoriess:", error);
    res.status(500).send("Internal Server Error");
  }
};

// user actions
const searchProducts1 = async (req, res) => {
  const { searchTerm,categoryId } = req.query;
  console.log(searchTerm,categoryId)
  const products = await Product.find({
    name: { $regex: searchTerm, $options: "i" },category:categoryId,
  });
  console.log(products)
  res.json(products);
}
const filterProducts = async (req, res) => {
  const { categoryId, minPrice, maxPrice } = req.query;  
  console.log(categoryId, minPrice, maxPrice)
  const products = await Product.find({
    category: categoryId,
    originalPrice: { $gte: minPrice, $lte: maxPrice },
  });
  console.log(products)
  res.json(products);
}
const getSingleProduct = async (req, res) => {
  try {      
    const { productId } = req.params;

    const product = await Product.findById(productId);
    const brand = await Brand.findById(product.brand);
    const category = product.category; // Assuming `product.category` stores the category ID

    // Fetch all products in the same category, excluding the current product
    const products = await Product.find({
      category,
      _id: { $ne: productId },
    });

    req.session.brand = brand;
    if(req.session.user){
    const cartCount = await Cart.countDocuments({ user: req.session.user._id });
    const wishlistCount = await Wishlist.countDocuments({
      user: req.session.user._id,
    });
  
    res.render("client/single-product", {
      layout: "layouts/user-layout",
      user: req.session.user ? true : false,
      product,
      products,
      brand,
      cartCount,
      wishlistCount
    });
  }else{
    res.render("client/single-product", {
      layout: "layouts/user-layout",
      user: req.session.user ? true : false,
      product,
      products,
      brand,
      cartCount:"",
      wishlistCount:"",
    });
  }
  } catch (error) {
    console.error("Error in getSingleProduct:", error);
  }
};

const getAllProducts = async (req, res) => {
  const { categoryId } = req.params;
 

  const products = await Product.find({ category: categoryId });
  const brandsData = await Brand.find().limit(10);
  const categoriesData = await Category.find();

  if (!req.session.user) {
    return res.render("client/all-products", {
      layout: "layouts/user-layout",
      user: false,
      products,
      brandsData,
      categoriesData,
      cartCount:"",
      wishlistCount:"",
    });
  }
  const cartCount = await Cart.countDocuments({ user: req.session.user._id });
  const wishlistCount = await Wishlist.countDocuments({
    user: req.session.user._id,
  });
  res.render("client/all-products", {
    layout: "layouts/user-layout",
    user: true,
    products,
    brandsData,
    categoriesData,
    cartCount,
    wishlistCount,
  });
};
const addRating = async (req, res) => {
  console.log("rating")
  try {
    const { productId,rating } = req.body;
    console.log(productId,rating)
    

    const product = await Product.findById(productId);

    if (!product) {
      res.status(404).send("Product not found");
      return;
    }

    const ratingData = await Product.updateOne(
      { _id: productId },
      {
        $push: {
          ratings: rating,
        },
      }
    );
    

    res.json(ratingData)
  } catch (error) {
    console.error("Error adding rating:", error);
    res.status(500).send("Internal Server Error");
  }
}
module.exports = {
  getAddProduct,
  brandsByCategory,
  addProductPost,
  getViewProduct,
  getEditProduct,
  editProductPost,
  deleteProduct,
  searchProducts,
  getSingleProduct,
  getAllProducts,
  addRating,
  searchProducts1,
  filterProducts,
};
