const express = require("express");
const {
  createOrder,
  getUserOrders,
  getOrderDetail,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  confirmOrderReceived,
} = require("../controllers/orderController");
const {
  authenticateToken,
  requireAdmin,
} = require("../controllers/authController");

const router = express.Router();

// User routes
router.post("/", authenticateToken, createOrder);
router.get("/user/:userId", authenticateToken, getUserOrders);
router.get("/:orderId", authenticateToken, getOrderDetail);
router.post("/:orderId/cancel", authenticateToken, cancelOrder);
router.post("/:orderId/confirm", authenticateToken, confirmOrderReceived);

// Admin routes
router.get("/", authenticateToken, requireAdmin, getAllOrders);
router.patch(
  "/:orderId/status",
  authenticateToken,
  requireAdmin,
  updateOrderStatus
);

module.exports = router;
