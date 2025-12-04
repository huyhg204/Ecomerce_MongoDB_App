const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCart,
  removeFromCart
} = require("../controllers/cartController");

// Thêm vào giỏ
router.post("/add", addToCart);

// Lấy giỏ hàng theo user
router.get("/:userId", getCart);

// Cập nhật số lượng
router.post("/update", updateCart);

// Xóa sản phẩm
router.post("/remove", removeFromCart);

module.exports = router;
