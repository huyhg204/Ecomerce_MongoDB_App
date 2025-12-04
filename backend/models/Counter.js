const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Tên counter, ví dụ "productId"
  seq: { type: Number, default: 0 }      // Giá trị đếm hiện tại
});

module.exports = mongoose.model("Counter", counterSchema);
