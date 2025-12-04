const express = require("express");
const router = express.Router();
const { authenticateToken, authenticateTokenOptional, requireAdmin } = require("../controllers/authController");
const upload = require("../middleware/upload");

const {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// Public routes - không cần authentication (nhưng có thể có token để phân biệt admin)
// Sử dụng optional authentication để admin có thể xem tất cả sản phẩm
router.get("/", authenticateTokenOptional, getProducts);
router.get("/:id", getProductById);

// Admin routes - cần authentication và role admin
router.post("/", authenticateToken, requireAdmin, upload.fields([{ name: "image", maxCount: 1 }, { name: "images", maxCount: 10 }]), addProduct);
router.put("/:id", authenticateToken, requireAdmin, upload.fields([{ name: "image", maxCount: 1 }, { name: "images", maxCount: 10 }]), updateProduct);
router.delete("/:id", authenticateToken, requireAdmin, deleteProduct);

module.exports = router;
