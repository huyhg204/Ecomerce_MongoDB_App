const mongoose = require("mongoose");
const { Decimal128 } = mongoose.Schema.Types;
const Decimal128Type = mongoose.Types.Decimal128;

// Getter/Setter Decimal128
function getDecimal(value) {
  return value ? parseFloat(value.toString()) : 0;
}
function setDecimal(value) {
  return value != null
    ? Decimal128Type.fromString(value.toString())
    : Decimal128Type.fromString("0");
}

// ===== SCHEMA =====
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true }, 
    price: {
      type: Decimal128,
      required: true,
      get: getDecimal,
      set: setDecimal,
    },
    oldPrice: {
      type: Decimal128,
      get: getDecimal,
      set: setDecimal,
    },
    salePercent: { type: Number, default: 0, min: 0, max: 100 },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    image: { type: String, default: "" },
    images: { type: [String], default: [] }, // Mảng các ảnh phụ
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    inStock: { type: Boolean, default: true },
    stock: { type: Number, default: 0, min: 0 }, // Số lượng tồn kho
    isActive: { type: Boolean, default: true }, // Trạng thái hoạt động (soft delete)
    tag: { 
      type: String, 
      default: null,
      enum: ["sale", "new", "featured", null] // Sản phẩm khuyến mãi, mới nhất, nổi bật (chỉ 1 tag)
    },
    color: { type: [String], default: [] }, // Mảng màu sắc sản phẩm (ví dụ: ["Đen", "Trắng", "Xám"])
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// ===== MIDDLEWARE =====
productSchema.pre("save", function (next) {
  if (this.salePercent > 0 && this.price > 0) {
    const priceValue = parseFloat(this.price.toString());
    this.oldPrice = Decimal128Type.fromString(
      (priceValue / (1 - this.salePercent / 100)).toFixed(0)
    );
  } else {
    this.oldPrice = this.price;
  }
  next();
});

productSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (!update) return next();

  const price =
    update.price !== undefined ? parseFloat(update.price) : undefined;
  const salePercent =
    update.salePercent !== undefined ? parseFloat(update.salePercent) : 0;

  if (price !== undefined) {
    if (salePercent > 0) {
      update.oldPrice = Decimal128Type.fromString(
        (price / (1 - salePercent / 100)).toFixed(0)
      );
    } else {
      update.oldPrice = Decimal128Type.fromString(price.toString());
    }
  }

  next();
});

// ===== MODEL FIX OVERWRITE =====
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;
