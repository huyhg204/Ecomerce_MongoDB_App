const express = require("express");
const router = express.Router();
const { authenticateToken, requireAdmin } = require("../controllers/authController");
const upload = require("../middleware/upload");
const {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
} = require("../controllers/newsController");

// Public routes - không cần authentication
router.get("/", getAllNews);
router.get("/:id", getNewsById);

// Admin routes - cần authentication và admin role
router.post("/", authenticateToken, requireAdmin, upload.single("image"), createNews);
router.put("/:id", authenticateToken, requireAdmin, upload.single("image"), updateNews);
router.delete("/:id", authenticateToken, requireAdmin, deleteNews);

module.exports = router;

