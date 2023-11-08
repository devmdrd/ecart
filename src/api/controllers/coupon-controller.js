const Coupon = require("../models/coupon-model");
const User = require("../models/user-model");

const getViewCoupons = async (req, res) => {
  try {
    console.log("blabla");

    let activeCoupons = await Coupon.aggregate([
      {
        $match: {
          expiryDate: { $gte: new Date() },
        },
      },
      {
        $project: {
          expiryDate: {
            $dateToString: { format: "%d-%m-%Y ", date: "$expiryDate" },
          },
          code: 1,
          maxAmount: 1,
          minSpend: 1,
          description: 1,
          discount: 1,
        },
      },     
    ]);

    let expiredCoupons = await Coupon.aggregate([
      {
        $match: {
          expiryDate: { $lt: new Date() },
        },
      },
      {
        $project: {
          expiryDate: {
            $dateToString: { format: "%Y-%m-%d ", date: "$expiryDate" },
          },
          code: 1,
          maxAmount: 1,
          minSpend: 1,
          description: 1,
          discount: 1,
        },
      },
    ]);
    res.render("admin/coupons", {
      layout: "layouts/admin-layout",

      activeCoupons: activeCoupons,
      expiredCoupons: expiredCoupons,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
const addCouponPost = async (req, res) => {
  try {
    const coupon = new Coupon(req.body);

    console.log(coupon);
    await coupon.save();

    res.redirect("/admin/view-coupons");
  } catch (error) {
    console.error("Error adding coupon:", error);
  }
};
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.couponId);
    res.redirect("/admin/view-coupons");
  } catch (error) {
    res.status(500).send(error);
  }
};
const getEditCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.couponId);
    let activeCoupons = await Coupon.aggregate([
      {
        $match: {
          expiryDate: { $gte: new Date() },
        },
      },
      {
        $project: {
          expiryDate: {
            $dateToString: { format: "%d-%m-%Y ", date: "$expiryDate" },
          },
          code: 1,
          maxAmount: 1,
          minSpend: 1,
          description: 1,
          discount: 1,
        },
      },
    ]);

    let expiredCoupons = await Coupon.aggregate([
      {
        $match: {
          expiryDate: { $lt: new Date() },
        },
      },
      {
        $project: {
          expiryDate: {
            $dateToString: { format: "%Y-%m-%d ", date: "$expiryDate" },
          },
          code: 1,
          maxAmount: 1,
          minSpend: 1,
          description: 1,
          discount: 1,
        },
      },
    ]);
    res.render("admin/coupons", {
      layout: "layouts/admin-layout",

      coupon: coupon,
      activeCoupons: activeCoupons,
      expiredCoupons: expiredCoupons,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
const editCouponPost = async (req, res) => {
  const couponId = req.params.couponId;
  console.log(couponId);
  const { code, description, offer, maxAmount, minSpend, expiryDate } =
    req.body;
  console.log(req.body);
  const coupon = await Coupon.updateOne(
    { _id: couponId },
    {
      $set: {
        code: code,
        description: description,
        discount: offer,
        maxAmount: maxAmount,
        minSpend: minSpend,
        expiryDate: expiryDate,
      },
    }
  );
  console.log(coupon);
  res.redirect("/admin/view-coupons");
};
const validateCoupon = async (req, res) => {
  try {
    const id = req.session.user._id;
    const couponCode = req.params.couponCode;
    const total1 = req.params.total;
    const total = parseFloat(total1.replace(/₹/g, ""));
    
    console.log(total);

    const checkData = await Coupon.findOne({ code: couponCode });
    console.log(checkData);

    if (!checkData) {
      return res.json({ message: "Invalid Coupon" });
    }

    if (checkData.userId.includes(id)) {
      console.log("Coupon Already Used");
      return res.json({ message: "Coupon Already Used" });
    }

    if (new Date(checkData.expiryDate) < new Date()) {
      console.log("Invalid Coupon: Coupon has expired");
      return res.json({ message: "Invalid Coupon: Coupon has expired" });
    }

    if (checkData.minSpend > total) {
      console.log("Min Purchase Required to avail this Coupon");
      return res.json({ message: "Min Purchase Required to avail this Coupon" });
    }

    // If all conditions pass, send the valid coupon data
    console.log("Valid Coupon");
    return res.json(checkData);

  } catch (error) {
    return res.status(500).json({ message: "An error occurred", error: error });
  }
};


module.exports = {
  getViewCoupons,
  addCouponPost,
  deleteCoupon,
  getEditCoupon,
  editCouponPost,
  validateCoupon,
};
