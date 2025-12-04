const express = require("express");
const router = express.Router();
const { authenticateToken, requireAdmin } = require("../controllers/authController");
const upload = require("../middleware/upload");

const {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  addCategory,
  updateCategory,
  deleteCategory,
  getActiveCategories,
} = require("../controllers/categoryController");

// Public routes - không cần authentication
router.get("/active", getActiveCategories);
router.get("/slug/:slug", getCategoryBySlug);
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Admin routes - cần authentication và role admin
router.post("/", authenticateToken, requireAdmin, upload.single("image"), addCategory);
router.put("/:id", authenticateToken, requireAdmin, upload.single("image"), updateCategory);
router.delete("/:id", authenticateToken, requireAdmin, deleteCategory);

module.exports = router;

