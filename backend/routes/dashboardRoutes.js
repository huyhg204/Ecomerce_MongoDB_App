const express = require("express");
const router = express.Router();
const { authenticateToken, requireAdmin } = require("../controllers/authController");
const { getDashboardStats } = require("../controllers/dashboardController");

// Admin routes - cần authentication và role admin
router.get("/stats", authenticateToken, requireAdmin, getDashboardStats);

module.exports = router;

