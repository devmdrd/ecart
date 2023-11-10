const Order = require("../models/order-model");
const Product = require("../models/product-model");
const User = require("../models/user-model");
const Cart = require("../models/cart-model");
const Razorpay = require("razorpay");
const Coupon = require("../models/coupon-model");
// const flash = require("express-flash");
const path = require("path");

// admin actions

const getAllOrders = async (req, res) => {
  if (!req.session.admin) {
    res.redirect("/admin/login");
  }
  const ordersData = await Order.find().populate("userId");
  console.log(ordersData);
  res.render("admin/all-orders", { ordersData });
};
const getAllOrders1 = async (req, res) => {
  console.log("nkmlcgvhbj");

  const orderId = req.params.orderId;
  const orders2 = await Order.find({ orderId: orderId });
  const orders = orders2[0];
  const orders3 = orders2.map((item) => item.items);
  const orders1 = [].concat(...orders3);

  const productIds = orders2.flatMap((order) =>
    order.items.map((item) => item.productId)
  );
  console.log(orders1);
  const products = await Product.find({ _id: { $in: productIds } });

  res.render("admin/order-details", {
    layout: "layouts/admin-layout",
    orders,
    products,
    orders1,
  });
};
const updateOrder = async (req, res) => {
  const { orderId, status } = req.params;
  console.log(orderId, status);
  try {
    const order = await Order.findOne({ orderId: orderId });
    console.log(order);
    if (!order) {
      return res.status(404).send("Order not found");
    }
    order.status = status;
    await order.save();
    res.redirect("/admin/all-orders");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

// user actions

const orderSuccess = async (req, res) => {
  console.log("first success");
  if (req.session.user) {
    const userId = req.session.user._id;
    const {
      orderTotal,
      orderAddressId,
      orderPayment,
      orderCoupon,
      orderBalance,
    } = req.body;

    const total1 = orderTotal.replace(/₹/g, "");

    const user = await User.findOne({ _id: req.session.user._id });
    const addressData = user.address.id(orderAddressId);

    if (req.session.product) {
      // console.log(req.session.product)
      const { productId, count } = req.session.product;

      console.log("single");
      const product = await Product.findById(productId);

      const productName = [product.name];

      if (product) {
        const newStock = product.stock - count;

        const productData = await Product.updateOne(
          { _id: productId },
          { $set: { stock: newStock } }
        );
      }
      const orderID = generateOrderID(10);
      const orderData = await Order.insertMany({
        orderId: orderID,

        userId: req.session.user._id,
        orderDate: Date.now(),
        status: "pending",
        items: [
          {
            productId: productId,
            quantity: count,
            price: product.originalPrice,
          },
        ],
        billingAddress: addressData,
        totalAmount: total1,
        paymentMethod: orderPayment,
      });
      const userId = req.session.user._id;
      const orderNow = await Order.findOne({
        orderId: orderID,
        userId: userId,
      });
      console.log(orderNow);
      const orderNow1 = orderNow.items;

      const updatedCoupon = await Coupon.updateOne(
        { code: orderCoupon },
        { $set: { status: "used", userId: userId } }
      );

      if (orderNow.paymentMethod === "cards") {
        console.log("wallet");
        const updateBalance = await User.updateOne(
          { _id: userId },
          { $set: { "wallet.total": orderBalance - total1 } }
        );
      }

      req.session.product = null;
      res.render("client/order-success", {
        layout: "layouts/user-layout",
        user: true,
        orderId: orderID,
        orderTotal,
        addressData,
        orderPayment,
        orderNow1,
        productName,
      });
    } else {
      console.log("multiple");

      const cart = await Cart.find({ user: userId });
      console.log(cart);
      const productName = [];
      for (const item of cart) {
        const product = await Product.findById(item.product);
        productName.push(product.name);
        if (product) {
          let newStock = product.stock - item.quantity;
          newStock = newStock < 0 ? 0 : newStock;

          await Product.updateOne({ _id: item.product }, { stock: newStock });
        }
      }

      const orderID = generateOrderID(10);
      const orderData = await Order.insertMany({
        orderId: orderID,
        userId: req.session.user._id,

        orderDate: Date.now(),
        status: "pending",
        items: cart.map((item) => ({
          productId: item.product,
          quantity: item.quantity,
          price: item.price / item.quantity,
        })),
        billingAddress: addressData,
        totalAmount: orderTotal,
        paymentMethod: orderPayment,
      });

      console.log(userId);
      const orderNow = await Order.findOne({
        orderId: orderID,
        userId: userId,
      });
      console.log(orderNow);
      const orderNow1 = orderNow.items;

      const updatedCoupon = await Coupon.updateOne(
        { code: orderCoupon },
        { $set: { status: "used", userId: userId } }
      );

      if (orderNow.paymentMethod === "cards") {
        console.log("wallet");
        const updateBalance = await User.updateOne(
          { _id: userId },
          { $set: { "wallet.total": orderBalance - total1 } }
        );
      }
      await Cart.deleteMany({ user: req.session.user._id });
      res.render("client/order-success", {
        layout: "layouts/user-layout",
        user: true,
        orderId: orderID,
        orderTotal,
        addressData,
        orderPayment,
        orderNow1,
        productName,
      });
    }

    function generateOrderID(length) {
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let orderID = "";
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        orderID += characters.charAt(randomIndex);
      }
      return orderID;
    }
  }
};
const orderSuccess1 = async (req, res) => {
  if (req.session.user) {
    console.log("dsdsdsds");
    const { total, addressId, payment } = req.params;

    const total1 = total.replace(/₹/g, "");

    const user = await User.findOne({ _id: req.session.user._id });

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const paymentData = {
      amount: total1 * 100, // Amount in paise (e.g., 50000 for ₹500)
      currency: "INR",
    };

    console.log(paymentData);
    instance.orders.create(paymentData, (err, order) => {
      if (err) {
        console.error(err);
        // Handle the error
      } else {
        console.log("Created order:", order);
        res.json(order);
        // Redirect the user to the Razorpay payment page with the order details
      }
    });
  }
};
const orderSuccess2 = async (req, res) => {
  console.log("esrtyvbnfxgchvjbkn");

  const { orderId, total, addressId, payment, coupon } = req.params;
  console.log(total);
  const total1 = total.replace(/₹/g, "");
  console.log(total1);
  if (req.session.product) {
    // console.log(req.session.product)
    const { productId, count } = req.session.product;

    const user = await User.findOne({ _id: req.session.user._id });
    const addressData = user.address.id(addressId);
    console.log(addressData);
    console.log("single");
    const product = await Product.findById(productId);
    console.log(product);
    const productName = [product.name];
    console.log(productName);

    if (product) {
      const newStock = product.stock - count;
      console.log(newStock);

      const productData = await Product.updateOne(
        { _id: productId },
        { $set: { stock: newStock } }
      );

      console.log(productData);
      if (coupon) {
        const couponData = await Coupon.findOne({
          code: coupon,
          status: "active",
        });
        if (!couponData) {
          console.log("Coupon already used");
        } else {
          const couponUpdated = await Coupon.updateOne(
            { code: coupon },
            { $set: { status: "used" } }
          );
        }
      }
    }
    const orderID = orderId;
    const orderData = await Order.insertMany({
      orderId: orderID,

      userId: req.session.user._id,
      orderDate: Date.now(),
      status: "pending",
      items: [
        {
          productId: productId,
          quantity: count,
          price: total1,
        },
      ],
      billingAddress: addressData,
      totalAmount: total1,
      paymentMethod: payment,
    });

    console.log("hello");
    const orderNow = await Order.findOne({ orderId: orderID });
    const orderNow1 = orderNow.items;
    console.log(orderNow1);
    req.session.product = null;
    res.render("client/order-success", {
      layout: "layouts/user-layout",
      user: true,
      orderId: orderID,
      total,
      addressData,
      payment,
      orderNow1,
      productName,
    });
  } else {
    console.log("multiple");
    const user = await User.findOne({ _id: req.session.user._id });
    const addressData = user.address.id(addressId);
    console.log(addressData);
    const cart = await Cart.find({ user: req.session.user._id });
    const productName = [];
    for (const item of cart) {
      const product = await Product.findById(item.product);
      productName.push(product.name);

      if (product) {
        let newStock = product.stock - item.quantity;
        newStock = newStock < 0 ? 0 : newStock;

        await Product.updateOne({ _id: item.product }, { stock: newStock });
      }
    }
    const orderID = orderId;
    const orderData = await Order.insertMany({
      orderId: orderID,
      userId: req.session.user._id,

      orderDate: Date.now(),
      status: "pending",
      items: cart.map((item) => ({
        productId: item.product,
        quantity: item.quantity,
        price: item.price / item.quantity,
      })),
      billingAddress: addressData,
      totalAmount: total1,
      paymentMethod: payment,
    });

    await Cart.deleteMany({ user: req.session.user._id });
    const orderNow = await Order.findOne({ orderId: orderID });
    const orderNow1 = orderNow.items;
    res.render("client/order-success", {
      layout: "layouts/user-layout",
      user: true,
      orderId: orderID,
      total,
      addressData,
      payment,
      orderNow1,
      productName,
    });
  }
};

const getAllOrders11 = async (req, res) => {
  console.log("nkmlcgvhbj");

  const orderId = req.params.orderId;
  const orders2 = await Order.find({ orderId: orderId });

  const orders = orders2[0];
  const orders3 = orders2.map((item) => item.items);
  const orders1 = [].concat(...orders3);

  const productIds = orders2.flatMap((order) =>
    order.items.map((item) => item.productId)
  );
  console.log(orders1);

  const products = await Product.find({ _id: { $in: productIds } });

  res.render("client/all-orders", {
    layout: "layouts/user-layout",
    user: true,
    orders,
    products,
    orders1,
  });
};
const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const orderData = await Order.findOne({ orderId: orderId });

    // Update the order status to "cancelled"
    await Order.updateOne(
      { orderId: orderId },
      { $set: { status: "cancelled" } }
    );

    const userData = await User.findOne({ _id: req.session.user._id }).populate(
      "wallet"
    );

    const updatedStock = await Product.updateMany(
      { _id: { $in: orderData.items.map((item) => item.productId) } },
      {
        $inc: {
          stock: orderData.items.reduce((acc, item) => acc + item.quantity, 0),
        },
      }
    );

    if (orderData.paymentMethod === "cod") {
      return res.json(null); // Return null as JSON for COD payment method
    }

    const newTransaction = {
      date: new Date().toLocaleString(),
      type: "Refund",
      person: userData.name,
      amount: orderData.totalAmount,
    };

    // Update the "total" in the "wallet" and push a new transaction
    const updateUserWallet = await User.findOneAndUpdate(
      { _id: userData._id },
      {
        $set: { "wallet.total": newTransaction.amount + userData.wallet.total }, // Update the "total" value
        $push: { "wallet.transactions": newTransaction }, // Push a new transaction to the array
      },
      { new: true }
    );

    res.json(updateUserWallet);
    // Return updated user wallet details as JSON response
  } catch (error) {
    console.error("An error occurred:", error);
    res
      .status(500)
      .json({ error: "An error occurred while cancelling the order" });
  }
};

const returnOrder = async (req, res) => {
  console.log("fgfgfg");
  const orderId = req.params.orderId;
  // Assuming you're using Mongoose
  const order = await Order.findOneAndUpdate(
    { orderId: orderId }, // Filter criteria
    { $set: { status: "return-initiated" } }, // Update operation
    { new: true } // To return the updated document
  );
  res.redirect("back");
};

const getSalesRevenueReport = async (req, res) => {
  try {
    const { aggregation } = req.query;
    let aggregateOptions;

    if (aggregation === "daily") {
      aggregateOptions = [
        {
          $group: {
            _id: { $dayOfMonth: "$orderDate" },
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
        { $sort: { _id: 1 } },
      ];
    } else if (aggregation === "weekly") {
      aggregateOptions = [
        {
          $group: {
            _id: { $isoWeek: "$orderDate" },
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
        { $sort: { _id: 1 } },
      ];
    } else if (aggregation === "monthly") {
      aggregateOptions = [
        {
          $group: {
            _id: { $month: "$orderDate" },
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
        { $sort: { _id: 1 } },
      ];
    } else if (aggregation === "yearly") {
      aggregateOptions = [
        {
          $group: {
            _id: { $year: "$orderDate" },
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
        { $sort: { _id: 1 } },
      ];
    }

    const salesData = await Order.aggregate(aggregateOptions);
    console.log(salesData);
    res.json(salesData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getAllSalesRevenueReport = async (req, res) => {
  console.log("hello");
  try {
    const sales = await Order.find().populate("userId").sort({ orderDate: -1 });
    const items = sales.map((item)=>item.items)
    // console.log(items);
    const items1 = items.map((item)=>item.map((item1)=>item1.productId))
    // console.log(items1);
    const items3 = [];
    for (const innerArray of items1) {
      const products = await Product.find({ _id: { $in: innerArray } });
      items3.push(products);
    }
    console.log(items3);
    res.render("admin/filter-sales", {
      layout: "layouts/admin-layout",
      salesData: sales,
      items3,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const postSalesRevenueReport = async (req, res) => {
  console.log("erxcgvhbjnk")
  try {
    const { startDate, endDate } = req.body;
    console.log(startDate, endDate);
   
    const sales = await Order.find({
      $expr: {
        $and: [
          { $gte: [{ $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } }, startDate] },
          { $lte: [{ $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } }, endDate] }
        ]
      }
    }).populate("userId").sort({ orderDate: -1 });
    
    const items = sales.map((item)=>item.items)
    // console.log(items);
    const items1 = items.map((item)=>item.map((item1)=>item1.productId))
    // console.log(items1);
    const items3 = [];
    for (const innerArray of items1) {
      const products = await Product.find({ _id: { $in: innerArray } });
      items3.push(products);
    }
    console.log(items3);
    const data = {sales,items3}
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllOrders,
  getAllOrders1,
  updateOrder,
  orderSuccess,
  orderSuccess1,
  orderSuccess2,
  getAllOrders11,
  cancelOrder,
  returnOrder,
  getSalesRevenueReport,
  getAllSalesRevenueReport,
  postSalesRevenueReport,
};
