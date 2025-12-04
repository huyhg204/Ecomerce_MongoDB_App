const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ["fixed", "percent"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    maxUses: {
      type: Number,
      default: null, // null = không giới hạn
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validTo: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    minOrderValue: {
      type: Number,
      default: 0, // Giá trị đơn hàng tối thiểu để áp dụng mã
    },
  },
  {
    timestamps: true,
  }
);

// Index để tìm kiếm nhanh
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, validFrom: 1, validTo: 1 });

// Method để kiểm tra mã có hợp lệ không
couponSchema.methods.isValid = function () {
  const now = new Date();
  return (
    this.isActive &&
    this.validFrom <= now &&
    this.validTo >= now &&
    (this.maxUses === null || this.usedCount < this.maxUses)
  );
};

// Method để tính số tiền giảm
couponSchema.methods.calculateDiscount = function (orderTotal) {
  if (!this.isValid()) return 0;
  if (orderTotal < this.minOrderValue) return 0;

  if (this.type === "fixed") {
    return Math.min(this.value, orderTotal); // Không giảm quá tổng tiền
  } else {
    // percent
    return Math.min((orderTotal * this.value) / 100, orderTotal);
  }
};

module.exports = mongoose.model("Coupon", couponSchema);

