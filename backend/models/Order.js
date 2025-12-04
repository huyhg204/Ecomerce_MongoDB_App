const mongoose = require("mongoose");
const Counter = require("./Counter");

const ORDER_STATUSES = [
  "pending", // Chờ xác nhận
  "processing", // Đang xử lý
  "handover_to_carrier", // Đã bàn giao cho đơn vị vận chuyển
  "shipping", // Đang giao hàng
  "delivered", // Đã giao hàng
  "received", // Khách xác nhận đã nhận
  "cancelled", // Đã huỷ
];

const PAYMENT_METHODS = ["cod", "bank_transfer", "payoo", "momo", "zalopay"];
const PAYMENT_STATUS = ["unpaid", "paid", "refunded"];

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String, default: "" },
  price: { type: Number, required: true, min: 0 }, // Giá giảm (sau sale)
  oldPrice: { type: Number, default: 0, min: 0 }, // Giá gốc
  quantity: { type: Number, required: true, min: 1 },
  selectedColor: { type: String, default: "" }, // Màu sắc đã chọn
});

const shippingInfoSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, trim: true, default: "" },
    district: { type: String, trim: true, default: "" },
    ward: { type: String, trim: true, default: "" },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const totalsSchema = new mongoose.Schema(
  {
    subTotal: { type: Number, required: true }, // Tạm tính (giá giảm)
    total: { type: Number, required: true }, // Thành tiền (giá giảm - trước voucher)
    savings: { type: Number, default: 0 }, // Tiết kiệm
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    note: { type: String, default: "" },
    updatedBy: { type: String, default: null },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    userId: { type: String, required: true },
    items: { type: [orderItemSchema], required: true },
    shippingInfo: { type: shippingInfoSchema, required: true },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, default: "cod" },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS,
      default: "unpaid",
    },
    status: { type: String, enum: ORDER_STATUSES, default: "pending" },
    totals: { type: totalsSchema, required: true },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
  },
  { timestamps: true }
);

orderSchema.pre("save", async function generateOrderCode(next) {
  if (this.code) return next();
  
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: "order" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      
      this.code = `MS${counter.seq.toString().padStart(6, "0")}`;
      return next();
    } catch (error) {
      // Nếu lỗi duplicate key, thử lại với seq tiếp theo
      if (error.code === 11000 || error.codeName === 'DuplicateKey') {
        attempts++;
        if (attempts >= maxAttempts) {
          // Nếu vẫn bị lỗi sau nhiều lần thử, tạo mã dựa trên timestamp
          const timestamp = Date.now();
          const random = Math.floor(Math.random() * 1000);
          this.code = `MS${timestamp.toString().slice(-8)}${random.toString().padStart(3, "0")}`;
          return next();
        }
        // Đợi một chút trước khi thử lại
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }
      return next(error);
    }
  }
  
  // Fallback: tạo mã dựa trên timestamp nếu vẫn thất bại
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  this.code = `MS${timestamp.toString().slice(-8)}${random.toString().padStart(3, "0")}`;
  return next();
});

const Order =
  mongoose.models.Order || mongoose.model("Order", orderSchema);

Order.STATUSES = ORDER_STATUSES;
Order.PAYMENT_METHODS = PAYMENT_METHODS;
Order.PAYMENT_STATUS = PAYMENT_STATUS;

module.exports = Order;
