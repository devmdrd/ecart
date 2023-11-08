const Banner = require("../models/banner-model");
const path = require("path");

const getViewBanners = async (req, res) => {
  try {
    const banners = await Banner.find();
    res.render("admin/all-banners", {
      layout: "layouts/admin-layout",
      banners,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
const addBannerPost = async (req, res) => {
  try {
    const { title, description } = req.body;

    const imagePath = req.file.path;

    const imageUrl = path.relative("src/api/public", imagePath);

    const bannerData = await Banner.create({
      title: title,
      description: description,
      image: imageUrl,
    });
    await bannerData.save();

    console.log(bannerData);

    res.redirect("/admin/view-banner");
  } catch (error) {
    console.log(error);
  }
};

const getAddBanner = (req, res) => {
  res.render("admin/add-banner", { layout: "layouts/admin-layout" });
};
const getEditBanner = async (req, res) => {
  try {
    const id = req.params.bannerId;
    const banner = await Banner.findById(id);
    res.render("admin/banner-edit", { layout: "layouts/admin-layout", banner });
  } catch (error) {
    res.status(500).send(error);
  }
};
const editBannerPost = async (req, res) => {
  try {
    const id = req.params.bannerId;
    const imagePath = req.file.path;

    const imageUrl = path.relative("src/api/public", imagePath);
    const banner = await Banner.findById(id);
    banner.title = req.body.title;
    banner.description = req.body.description;
    banner.image = imageUrl;
    await banner.save();
    res.redirect("/admin/view-banner");
  } catch (error) {
    res.status(500).send(error);
  }
};

const deleteBanner = async (req, res) => {
  try {
    const id = req.params.bannerId;
    await Banner.findByIdAndDelete(id);
    res.redirect("/admin/all-banners");
  } catch (error) {
    res.status(500).send(error);
  }
};
module.exports = {
  getViewBanners,
  addBannerPost,
  getAddBanner,
  getEditBanner,
  editBannerPost,
  deleteBanner,
};
