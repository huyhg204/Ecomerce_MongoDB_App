const express = require("express");
const router = express.Router();
const { authenticateToken, requireAdmin } = require("../controllers/authController");
const upload = require("../middleware/upload");
const {
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
} = require("../controllers/bannerController");

// Public routes - không cần authentication
router.get("/", getAllBanners);
router.get("/:id", getBannerById);

// Admin routes - cần authentication và admin role
router.post("/", authenticateToken, requireAdmin, upload.single("image"), createBanner);
router.put("/:id", authenticateToken, requireAdmin, upload.single("image"), updateBanner);
router.delete("/:id", authenticateToken, requireAdmin, deleteBanner);

module.exports = router;

