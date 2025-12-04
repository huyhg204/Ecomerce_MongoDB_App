const express = require("express");
const router = express.Router();
const { authenticateToken, requireAdmin } = require("../controllers/authController");
const upload = require("../middleware/upload");

const {
  getBrands,
  getBrandById,
  getBrandBySlug,
  addBrand,
  updateBrand,
  deleteBrand,
  getActiveBrands,
} = require("../controllers/brandController");

// Public routes - không cần authentication
router.get("/active", getActiveBrands);
router.get("/slug/:slug", getBrandBySlug);
router.get("/", getBrands);
router.get("/:id", getBrandById);

// Admin routes - cần authentication và role admin
router.post("/", authenticateToken, requireAdmin, upload.single("image"), addBrand);
router.put("/:id", authenticateToken, requireAdmin, upload.single("image"), updateBrand);
router.delete("/:id", authenticateToken, requireAdmin, deleteBrand);

module.exports = router;

