const Category = require("../../models/category");
const Brand = require("../../models/brand");
const Attribute = require("../../models/attribute");
const Product = require("../../models/product");
const SKU = require("../../models/sku");
const path = require("path");

exports.renderManageProduct = async (req, res) => {
  const { productId } = req.params;
  
  try {
    const categories = await Category.find();
    
    if (!productId) {
      return res.render("admin/products/manage", { product: null, categories, brands: [], variantAttributes: [], message: "" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const brands = await Brand.find({ category: product.category._id });
    const attributes = await Attribute.find({ categoryId: product.category._id });
    
    const variantAttributes = attributes.map(attr => ({
      id: attr._id.toString(),
      label: attr.name,
      options: attr.values.map(v => ({ id: v._id, value: v.value }))
    }));

    const skus = await SKU.find({ _id: { $in: product.skus } });
    const formattedSkus = skus.map(sku => ({
      _id: sku._id,
      price: sku.price,
      discount: sku.discountPercentage,
      discountPrice: sku.discountPrice,
      stock: sku.stock,
      attributes: sku.attributes.map(attr => ({
        attributeId: attr.attributeId.toString(),
        valueId: attr.valueId.toString()
      }))
    }));

    const formattedProduct = {
      _id: product._id,
      name: product.name,
      category: product.category,
      brand: product.brand,
      description: product.description,
      features: product.features,
      specifications: product.specifications,
      images: product.images,
      skus: formattedSkus
    };

    res.render("admin/products/manage", { product: formattedProduct, categories, brands, variantAttributes, message: "" });
    
  } catch (err) {
    res.status(500).json({ success: false, message: "An error occurred while loading the product." });
  }
};

exports.getProductAttributes = async (req, res) => {
  try {
    const { category } = req.query;
    if (!category) {
      return res.status(400).json({ success: false, message: "Category ID is required" });
    }

    const brands = await Brand.find({ category: category });
    const attributes = await Attribute.find({ categoryId: category });

    const variantAttributes = attributes.map(attr => ({
      id: attr._id,
      label: attr.name,
      options: attr.values.map(v => ({
        id: v._id,  
        value: v.value  
      }))
    }));
    
    res.status(200).json({ success: true, brands, variantAttributes });
  } catch (error) {
    console.error("Error fetching variant attributes:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.renderProductList = async (req, res) => {
  try {
    const products = await Product.find().populate("category").populate("brand").sort({ createdAt: -1 });
    res.render("admin/products/list", { products, message: "" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to retrieve products" });
  }
};

exports.createProduct = async (req, res) => {
  const { data } = req.body;
  const { name, category, brand, description, features, specifications, variants } = JSON.parse(data);

  if (!name?.trim() || !category || !brand || !variants?.length) {
    return res.status(400).json({ success: false, message: "Name, category, brand, and at least one variant are required" });
  }

  try {
    const existing = await Product.findOne({ name: name.trim(), category, brand });
    if (existing) return res.status(409).json({ success: false, message: "Product already exists" });

    const images = req.files?.map(f => path.relative("src/api/public", f.path)) || [];
    const skus = [];

    for (let v of variants) {
      const attributeRefs = [];
      
      for (let { attributeId, valueId } of v.attributes) {
        const attribute = await Attribute.findById(attributeId);
        const value = attribute?.values.find(val => val._id.toString() === valueId);
        if (!attribute || !value) {
          return res.status(400).json({ success: false, message: `Invalid attribute or value ID (${attributeId}/${valueId})` });
        }
        attributeRefs.push({ attributeId: attribute._id, valueId: value._id });
      }

      const sku = new SKU({
        attributes: attributeRefs,
        price: v.price,
        discountPrice: v.discountPrice,
        discountPercentage: v.discount,
        stock: v.stock || 0
      });

      await sku.save();
      skus.push(sku._id);
    }

    const product = new Product({
      name: name.trim(),
      category,
      brand,
      description: description?.trim() || '',
      features: features?.trim() || '',
      specifications: specifications?.trim() || '',
      images,
      skus
    });

    await product.save();
    res.status(201).json({ success: true, message: "Product created", product });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const parsedData = JSON.parse(req.body.data);
    const {
      productId, name, category, brand, description, features, specifications, variants, existingImages = []
    } = parsedData;

    const newImagePaths = req.files ? req.files.map(file => path.relative("src/api/public", file.path)) : [];

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required." });
    }

    let product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const updatedImages = product.images.filter(img => existingImages.includes(img));

    product.images = [...updatedImages, ...newImagePaths];

    product.name = name?.trim() || "";
    product.category = category;
    product.brand = brand;
    product.description = description?.trim() || "";
    product.features = features?.trim() || "";
    product.specifications = specifications?.trim() || "";

    if (variants && Array.isArray(variants)) {
      const updatedSkus = [];
      for (const v of variants) {
        const { _id: skuId, attributes, price, discount, discountPrice, stock } = v;

        const attributeRefs = [];
        for (const { attributeId, valueId } of attributes) {
          const attribute = await Attribute.findById(attributeId);
          const value = attribute?.values.find(val => val._id.toString() === valueId);
          if (!attribute || !value) {
            throw new Error(`Invalid attribute or value ID (${attributeId}/${valueId})`);
          }
          attributeRefs.push({ attributeId: attribute._id, valueId: value._id });
        }

        if (skuId) {
          const existingSku = await SKU.findById(skuId);
          if (!existingSku) throw new Error(`SKU ${skuId} not found`);
          existingSku.set({ attributes: attributeRefs, price, discountPrice, discountPercentage: discount, stock });
          await existingSku.save();
          updatedSkus.push(existingSku._id);
        } else {
          const newSku = new SKU({ attributes: attributeRefs, price, discountPrice, discountPercentage: discount, stock });
          await newSku.save();
          updatedSkus.push(newSku._id);
        }
      }
      product.skus = updatedSkus;
    }

    await product.save();
    res.status(200).json({ success: true, message: "Product updated successfully", product });

  } catch (err) {
    console.error("Error in updateProduct:", err);
    res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const productId = req.params.productId;

  try {
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await SKU.deleteMany({ _id: { $in: deletedProduct.skus } });

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error occurred while deleting the product" });
  }
};
