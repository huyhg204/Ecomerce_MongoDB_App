const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
    adminReply: {
      text: {
        type: String,
        trim: true,
        default: "",
      },
      repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      repliedAt: {
        type: Date,
      },
    },
    isVisible: {
      type: Boolean,
      default: true, // Admin có thể ẩn đánh giá
    },
  },
  {
    timestamps: true,
  }
);

// Index để tìm kiếm nhanh
reviewSchema.index({ productId: 1, isVisible: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ createdAt: -1 });

// Đảm bảo mỗi user chỉ đánh giá 1 lần cho 1 sản phẩm
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);

