const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
      default: "",
    },
    discountText: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      required: true,
      default: "",
    },
    link: {
      type: String,
      default: "#",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Banner = mongoose.models.Banner || mongoose.model("Banner", bannerSchema);

module.exports = Banner;

