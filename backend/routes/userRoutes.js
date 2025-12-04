const express = require("express");
const router = express.Router();
const { authenticateToken, requireAdmin } = require("../controllers/authController");
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  lockUser,
  getUserOrderCount,
} = require("../controllers/userController");

// Admin routes - cần authentication và role admin
router.get("/", authenticateToken, requireAdmin, getAllUsers);
router.get("/:id/orders/count", authenticateToken, requireAdmin, getUserOrderCount);
router.patch("/:id/lock", authenticateToken, requireAdmin, lockUser);
router.get("/:id", authenticateToken, requireAdmin, getUserById);
router.put("/:id", authenticateToken, requireAdmin, updateUser);
router.delete("/:id", authenticateToken, requireAdmin, deleteUser);

module.exports = router;
