const User = require("../models/User");
const Order = require("../models/Order");

// Helper function để tạo date range
const createDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

// ===== GET DASHBOARD STATS =====
const getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Tạo date filter
    let dateFilter = {};
    if (startDate && endDate) {
      const { start, end } = createDateRange(startDate, endDate);
      dateFilter.createdAt = { $gte: start, $lte: end };
    }

    // Thống kê Users
    const totalUsers = await User.countDocuments({ role: "user" });
    const usersInRange = await User.countDocuments({
      role: "user",
      ...dateFilter,
    });
    const newUsersToday = await User.countDocuments({
      role: "user",
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    });

    // Thống kê Orders
    const totalOrders = await Order.countDocuments();
    const ordersInRange = await Order.countDocuments(dateFilter);
    const ordersToday = await Order.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    });

    // Thống kê Orders theo status
    const ordersByStatus = await Order.aggregate([
      ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusMap = {
      pending: 0,
      processing: 0,
      handover_to_carrier: 0,
      shipping: 0,
      delivered: 0,
      received: 0,
      cancelled: 0,
    };

    ordersByStatus.forEach((item) => {
      if (statusMap.hasOwnProperty(item._id)) {
        statusMap[item._id] = item.count;
      }
    });

    // Thống kê doanh thu
    const revenueData = await Order.aggregate([
      ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
      {
        $match: {
          status: { $nin: ["cancelled"] },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totals.grandTotal" },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: "$totals.grandTotal" },
        },
      },
    ]);

    const revenue = revenueData[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
    };

    // Thống kê theo ngày (7 ngày gần nhất)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayOrders = await Order.countDocuments({
        createdAt: { $gte: date, $lt: nextDate },
        status: { $nin: ["cancelled"] },
      });

      const dayRevenue = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: date, $lt: nextDate },
            status: { $nin: ["cancelled"] },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totals.grandTotal" },
          },
        },
      ]);

      last7Days.push({
        date: date.toISOString().split("T")[0],
        orders: dayOrders,
        revenue: dayRevenue[0]?.total || 0,
      });
    }

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          inRange: usersInRange,
          today: newUsersToday,
        },
        orders: {
          total: totalOrders,
          inRange: ordersInRange,
          today: ordersToday,
          byStatus: statusMap,
        },
        revenue: {
          total: revenue.totalRevenue || 0,
          orders: revenue.totalOrders || 0,
          average: revenue.averageOrderValue || 0,
        },
        last7Days,
      },
    });
  } catch (error) {
    console.error("Lỗi lấy thống kê dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};

