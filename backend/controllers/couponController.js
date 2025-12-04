const Coupon = require("../models/Coupon");

// ===== GET ALL COUPONS (ADMIN) =====
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    console.error("getAllCoupons error:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách mã giảm giá",
      error: error.message,
    });
  }
};

// ===== GET COUPON BY ID =====
const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mã giảm giá",
      });
    }
    res.json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    console.error("getCouponById error:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy thông tin mã giảm giá",
      error: error.message,
    });
  }
};

// ===== VALIDATE COUPON (USER) =====
const validateCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập mã giảm giá",
      });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Mã giảm giá không tồn tại",
      });
    }

    if (!coupon.isValid()) {
      return res.status(400).json({
        success: false,
        message: "Mã giảm giá đã hết hạn hoặc đã hết lượt sử dụng",
      });
    }

    const orderTotalNum = parseFloat(orderTotal) || 0;
    if (orderTotalNum < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString()}đ để áp dụng mã này`,
      });
    }

    const discount = coupon.calculateDiscount(orderTotalNum);

    res.json({
      success: true,
      data: {
        coupon: {
          _id: coupon._id,
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
        },
        discount,
      },
    });
  } catch (error) {
    console.error("validateCoupon error:", error);
    res.status(500).json({
      success: false,
      message: "Không thể xác thực mã giảm giá",
      error: error.message,
    });
  }
};

// ===== CREATE COUPON (ADMIN) =====
const createCoupon = async (req, res) => {
  try {
    const { code, type, value, maxUses, validFrom, validTo, minOrderValue, isActive } = req.body;

    if (!code || !type || value === undefined) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin: code, type, value",
      });
    }

    if (!["fixed", "percent"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Loại mã giảm giá phải là 'fixed' hoặc 'percent'",
      });
    }

    if (type === "percent" && (value < 0 || value > 100)) {
      return res.status(400).json({
        success: false,
        message: "Phần trăm giảm giá phải từ 0 đến 100",
      });
    }

    if (type === "fixed" && value <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số tiền giảm giá phải lớn hơn 0",
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      type,
      value: parseFloat(value),
      maxUses: maxUses ? parseInt(maxUses) : null,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validTo: validTo ? new Date(validTo) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Mặc định 30 ngày
      minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: "Tạo mã giảm giá thành công",
      data: coupon,
    });
  } catch (error) {
    console.error("createCoupon error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Mã giảm giá đã tồn tại",
      });
    }
    res.status(500).json({
      success: false,
      message: "Không thể tạo mã giảm giá",
      error: error.message,
    });
  }
};

// ===== UPDATE COUPON (ADMIN) =====
const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, type, value, maxUses, validFrom, validTo, minOrderValue, isActive } = req.body;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mã giảm giá",
      });
    }

    const updateData = {};
    if (code !== undefined) updateData.code = code.toUpperCase().trim();
    if (type !== undefined) {
      if (!["fixed", "percent"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Loại mã giảm giá phải là 'fixed' hoặc 'percent'",
        });
      }
      updateData.type = type;
    }
    if (value !== undefined) {
      const valueNum = parseFloat(value);
      if (coupon.type === "percent" && (valueNum < 0 || valueNum > 100)) {
        return res.status(400).json({
          success: false,
          message: "Phần trăm giảm giá phải từ 0 đến 100",
        });
      }
      if (coupon.type === "fixed" && valueNum <= 0) {
        return res.status(400).json({
          success: false,
          message: "Số tiền giảm giá phải lớn hơn 0",
        });
      }
      updateData.value = valueNum;
    }
    if (maxUses !== undefined) updateData.maxUses = maxUses ? parseInt(maxUses) : null;
    if (validFrom !== undefined) updateData.validFrom = new Date(validFrom);
    if (validTo !== undefined) updateData.validTo = new Date(validTo);
    if (minOrderValue !== undefined) updateData.minOrderValue = parseFloat(minOrderValue);
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedCoupon = await Coupon.findByIdAndUpdate(id, updateData, { new: true });

    res.json({
      success: true,
      message: "Cập nhật mã giảm giá thành công",
      data: updatedCoupon,
    });
  } catch (error) {
    console.error("updateCoupon error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Mã giảm giá đã tồn tại",
      });
    }
    res.status(500).json({
      success: false,
      message: "Không thể cập nhật mã giảm giá",
      error: error.message,
    });
  }
};

// ===== DELETE COUPON (ADMIN) =====
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mã giảm giá",
      });
    }
    res.json({
      success: true,
      message: "Xóa mã giảm giá thành công",
    });
  } catch (error) {
    console.error("deleteCoupon error:", error);
    res.status(500).json({
      success: false,
      message: "Không thể xóa mã giảm giá",
      error: error.message,
    });
  }
};

// ===== INCREMENT USED COUNT (Khi áp dụng mã) =====
const incrementUsedCount = async (couponId) => {
  try {
    await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
  } catch (error) {
    console.error("incrementUsedCount error:", error);
  }
};

module.exports = {
  getAllCoupons,
  getCouponById,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  incrementUsedCount,
};

