const express = require("express");
const {
  getAllCoupons,
  getCouponById,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/couponController");
const {
  authenticateToken,
  requireAdmin,
} = require("../controllers/authController");

const router = express.Router();

// Public route - validate coupon
router.post("/validate", validateCoupon);

// Admin routes
router.get("/", authenticateToken, requireAdmin, getAllCoupons);
router.get("/:id", authenticateToken, requireAdmin, getCouponById);
router.post("/", authenticateToken, requireAdmin, createCoupon);
router.put("/:id", authenticateToken, requireAdmin, updateCoupon);
router.delete("/:id", authenticateToken, requireAdmin, deleteCoupon);

module.exports = router;

