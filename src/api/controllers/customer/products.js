const Cart = require("../../models/cart");
const Wishlist = require("../../models/wishlist");
const Category = require("../../models/category");
const Brand = require("../../models/brand");
const Product = require("../../models/product");
const Rating = require("../../models/rating");
const Attribute = require("../../models/attribute");

const ITEMS_PER_PAGE = 6;

exports.renderProducts = async (req, res) => {
  try {
    const { categoryId, brandId = "", searchTerm = "", minPrice = 0, maxPrice = 150000, sortBy = "", page = 1 } = req.query;
    if (!categoryId) return res.status(400).render("error", { layout: "layouts/user-layout", user: false, message: "Category ID is required." });

    const user = req.session.user;
    const brandsData = await Brand.find().sort("name");
    const categoriesData = await Category.find().sort("name");

    const query = { category: categoryId };
    if (brandId) query.brand = brandId;
    if (searchTerm) query.$or = [{ name: { $regex: searchTerm, $options: "i" } }, { description: { $regex: searchTerm, $options: "i" } }];

    const skuMatch = minPrice && maxPrice ? {
      $or: [
        { discountPrice: { $gte: minPrice, $lte: maxPrice } },
        { price: { $gte: minPrice, $lte: maxPrice } }
      ]
    } : {};

    let products = await Product.find(query).populate("category brand").populate({ path: "skus", match: skuMatch });
    products = products.filter(p => p.skus.length);

    const getPrice = sku => sku.discountPrice || sku.price;
    if (sortBy === "low") products.sort((a, b) => getPrice(a.skus[0]) - getPrice(b.skus[0]));
    else if (sortBy === "high") products.sort((a, b) => getPrice(b.skus[0]) - getPrice(a.skus[0]));
    else products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
    const currentPage = Number(page) || 1;
    const paginated = products.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const productsData = paginated.map(p => {
      const sku = p.skus.reduce((a, b) => getPrice(a) < getPrice(b) ? a : b);
      return {
        _id: p._id, name: p.name, image: p.images?.[0] || "",
        price: sku.price, discountPrice: sku.discountPrice, discountPercentage: sku.discountPercentage || 0,
        stock: sku.stock || 0, brand: p.brand?.name || "", category: p.category?.name || "",
        description: p.description || "", slug: p.slug || p._id.toString(), skuId: sku._id
      };
    });

    const wishlistCount = await Wishlist.countDocuments({ user: user._id });
    const cart = await Cart.findOne({ user: user._id });
    const cartCount = cart ? cart.products.length : 0; 

    res.render("client/products/products-list", {
      layout: "layouts/user-layout",
      user: !!user,
      products: productsData,
      brandsData,
      categoriesData,
      cartCount,
      wishlistCount,
      appliedFilters: { categoryId, brandId, searchTerm, minPrice, maxPrice, sortBy },
      totalPages,
      currentPage
    });
  } catch (err) {
    console.error("Error in renderProducts:", err);
    res.status(500).render("error", {
      layout: "layouts/user-layout",
      user: false,
      message: "Something went wrong. Please try again later."
    });
  }
};

exports.renderSingleProduct = async (req, res) => {
  try {
    const { productId, skuId } = req.params;
    const user = req.session.user;

    const product = await Product.findById(productId).populate("brand category skus");

    if (!product) {
      return res.status(404).render("error", {
        layout: "layouts/user-layout",
        message: "Product not found",
        user: !!user,
        cartCount: 0,
        wishlistCount: 0
      });
    }

    const selectedSku = skuId ? product.skus.find(s => s._id.toString() === skuId): product.skus[0];

    if (!selectedSku) {
      return res.status(404).render("error", {
        layout: "layouts/user-layout",
        message: "Variant not found",
        user: !!user,
        cartCount: 0,
        wishlistCount: 0
      });
    }

    const ratings = await Rating.find({ product: productId }).populate("user", "name");
    const avgRating = ratings.length ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1) : 0;

    const similarProducts = await Product.find({ _id: { $ne: productId }, category: product.category._id }).limit(4).populate("brand category skus");

    const formattedSimilarProducts = similarProducts.filter(p => p.skus.length).map(p => {
      const sku = p.skus[0];
      return {
        _id: p._id,
        name: p.name,
        image: p.images?.[0] || "",
        price: sku.price,
        discountPrice: sku.discountPrice,
        discountPercentage: sku.discountPercentage || 0,
        stock: sku.stock,
        brand: p.brand?.name,
        category: p.category?.name,
        skuId: sku._id
      }
    });

    const variantList = await Promise.all(product.skus.map(async (sku) => {
      const variant = {
        _id: sku._id,
        price: sku.price,
        discountPrice: sku.discountPrice,
        discountPercentage: sku.discountPercentage,
        stock: sku.stock
      };

      for (const attr of sku.attributes) {
        const attribute = await Attribute.findById(attr.attributeId);
        if (attribute) {
          const valueObj = attribute.values.id(attr.valueId);
          const value = valueObj ? valueObj.value : 'No Value';
          variant[attribute.name] = value;
        }
      }

      return variant;
    }));

    const wishlistCount = await Wishlist.countDocuments({ user: req.session.user._id });
    const cart = await Cart.findOne({ user: req.session.user._id });
    const cartCount = cart ? cart.products.length : 0; 

    res.render("client/products/single-product", {
      layout: "layouts/user-layout",
      user: !!user,
      product: {
        _id: product._id,
        name: product.name,
        description: product.description,
        features: product.features,
        specifications: product.specifications,
        brand: product.brand?.name,
        category: product.category?.name,
        images: product.images,
        averageRating: avgRating,
        totalReviews: ratings.length
      },
      variant: selectedSku,
      allVariants: variantList,
      reviews: ratings.map(r => ({
        user: r.user?.name || "Anonymous",
        rating: r.rating,
        review: r.review,
        createdAt: r.createdAt
      })),
      similarProducts: formattedSimilarProducts,
      cartCount,
      wishlistCount
    });

  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      layout: "layouts/user-layout",
      message: "Server Error"
    });
  }
};
