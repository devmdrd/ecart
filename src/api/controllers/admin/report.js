const User = require('../../models/user');
const Order = require('../../models/order');

exports.renderReports = async (req, res) => {
  try {
    const today = new Date();
    const pastWeek = new Date();
    pastWeek.setDate(today.getDate() - 6);
    pastWeek.setHours(0, 0, 0, 0);

    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date(pastWeek);
      d.setDate(pastWeek.getDate() + i);
      return d.toISOString().slice(0, 10);
    });

    const dailyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: pastWeek } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' } } }
    ]);
    const revenueChartData = last7Days.map(date => {
      const match = dailyRevenue.find(d => d._id === date);
      return { date, revenue: match?.revenue || 0 };
    });

    const ordersPerDay = last7Days.map(date => {
      const match = dailyRevenue.find(d => d._id === date);
      return { date, orders: match?.revenue || 0 };
    });

    const orderStatusSummary = { Pending: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };
    const statusAgg = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    statusAgg.forEach(({ _id, count }) => {
      if (_id in orderStatusSummary) orderStatusSummary[_id] = count;
    });

    const popularProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', count: { $sum: '$items.quantity' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      { $project: { name: '$product.name', count: 1 } }
    ]);

    const categorySales = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          total: { $sum: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      { $project: { name: '$category.name', total: 1 } }
    ]);

    const newUsersOverTime = await User.aggregate([
      { $match: { createdAt: { $gte: pastWeek } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }
    ]);
    const newUsersChartData = last7Days.map(date => {
      const match = newUsersOverTime.find(d => d._id === date);
      return { date, count: match?.count || 0 };
    });

    const categoryOrderCount = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product.category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { name: '$category.name', count: 1 } }
    ]);

    const productSales = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', total: { $sum: '$items.quantity' } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { name: '$product.name', total: 1 } }
    ]);

    const weeklyNewUsers = await User.aggregate([
      { $match: { createdAt: { $gte: pastWeek } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }
    ]);

    res.render('admin/reports', {
      revenueChartData,
      ordersPerDay,
      orderStatusSummary,
      popularProducts,
      categorySales,
      newUsersChartData,
      categoryOrderCount,
      productSales,
      weeklyNewUsers
    });

  } catch (error) {
    console.error('Reports Error:', error);
    res.status(500).json({ success: false, message: "An error occurred while loading the report." });
  }
};
