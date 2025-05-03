const User = require('../../models/user');
const Order = require('../../models/order');
const Product = require('../../models/product');
const Category = require('../../models/category');
const Brand = require('../../models/brand');

exports.renderAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalBrands = await Brand.countDocuments();
    const totalOrders = await Order.countDocuments();

    const revenueAgg = await Order.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    const ordersByStatus = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const orderStatusSummary = { Pending: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };
    ordersByStatus.forEach(item => {
      if (orderStatusSummary.hasOwnProperty(item._id)) {
        orderStatusSummary[item._id] = item.count;
      }
    });

    const today = new Date();
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      return d.toISOString().slice(0, 10);
    }).reverse();

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 6);
    fromDate.setHours(0, 0, 0, 0);

    const dailyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: fromDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      }
    ]);

    const revenueChartData = last7Days.map(date => {
      const match = dailyRevenue.find(d => d._id === date);
      return { date, revenue: match?.total || 0, orders: match?.count || 0 };
    });

    res.render("admin/dashboard", {
      totalUsers,
      totalProducts,
      totalCategories,
      totalBrands,
      totalOrders,
      totalRevenue,
      orderStatusSummary,
      revenueChartData
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ success: false, message: "An error occurred while loading the dashboard data." });
  }
};
