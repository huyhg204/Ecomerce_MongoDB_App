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
  createMomoPayment,
  momoCallback,
  momoIPN,
} = require("../controllers/momoController");
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

// MOMO Payment routes
router.post("/momo/create", createMomoPayment);
router.get("/momo/callback", momoCallback);
router.post("/momo/ipn", momoIPN);

module.exports = router;
