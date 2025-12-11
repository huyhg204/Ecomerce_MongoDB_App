const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");

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

    // Thống kê Products
    const totalProducts = await Product.countDocuments();
    const productsInRange = await Product.countDocuments({
      ...dateFilter,
    });

    // Thống kê theo ngày (30 ngày gần nhất hoặc theo dateFilter)
    let dateRange = [];
    if (startDate && endDate) {
      // Parse date string (YYYY-MM-DD) và tạo date range
      // Sử dụng local time để tránh timezone issue
      const parseDate = (dateStr) => {
        const [year, month, day] = dateStr.split("-").map(Number);
        return new Date(year, month - 1, day);
      };
      
      const start = parseDate(startDate);
      start.setHours(0, 0, 0, 0);
      const end = parseDate(endDate);
      end.setHours(23, 59, 59, 999);
      
      const currentDate = new Date(start);
      while (currentDate <= end) {
        dateRange.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else {
      // Mặc định 30 ngày gần nhất
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        dateRange.push(date);
      }
    }

    const dailyStats = [];
    for (const date of dateRange) {
      // Tạo date range cho ngày này (local time)
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayOrders = await Order.find({
        createdAt: { $gte: dayStart, $lte: dayEnd },
        status: { $nin: ["cancelled"] },
      });

      const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.totals?.grandTotal || 0), 0);
      
      // Thống kê đơn hàng theo trạng thái trong ngày
      const ordersByStatusDay = {};
      dayOrders.forEach(order => {
        ordersByStatusDay[order.status] = (ordersByStatusDay[order.status] || 0) + 1;
      });

      dailyStats.push({
        date: date.toISOString().split("T")[0],
        orders: dayOrders.length,
        revenue: dayRevenue,
        byStatus: {
          pending: ordersByStatusDay.pending || 0,
          processing: ordersByStatusDay.processing || 0,
          handover_to_carrier: ordersByStatusDay.handover_to_carrier || 0,
          shipping: ordersByStatusDay.shipping || 0,
          delivered: ordersByStatusDay.delivered || 0,
          received: ordersByStatusDay.received || 0,
          cancelled: ordersByStatusDay.cancelled || 0,
        },
      });
    }

    // Sản phẩm bán chạy (top 10)
    const bestSellingProducts = await Order.aggregate([
      ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
      {
        $match: {
          status: { $nin: ["cancelled"] },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          image: { $first: "$items.image" },
          price: { $first: "$items.price" },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    // Populate thông tin sản phẩm đầy đủ
    const bestSellingWithDetails = await Promise.all(
      bestSellingProducts.map(async (item) => {
        const product = await Product.findById(item._id);
        return {
          productId: item._id,
          name: item.name || product?.name || "N/A",
          image: item.image || product?.image || "",
          price: item.price || product?.price || 0,
          quantitySold: item.totalQuantity,
          revenue: item.totalRevenue,
        };
      })
    );

    res.json({
      success: true,
      data: {
        products: {
          total: totalProducts,
          inRange: productsInRange,
        },
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
        dailyStats,
        bestSellingProducts: bestSellingWithDetails,
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

