const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["forgot-password", "verify-email"],
      default: "forgot-password",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // Tự động xóa sau khi hết hạn
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index để tự động xóa OTP đã hết hạn
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OTP", otpSchema);
