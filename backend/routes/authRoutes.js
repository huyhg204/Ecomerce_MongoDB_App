const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
  changePassword,
  updateProfile,
  verifyToken,
  authenticateToken,
  sendOTP,
  verifyOTP,
  resetPassword,
  googleLogin,
} = require("../controllers/authController");

// Đăng ký
router.post("/register", register);

// Đăng nhập
router.post("/login", login);

// Đăng nhập/Đăng ký bằng Google
router.post("/google", googleLogin);

// Forgot Password - Gửi OTP
router.post("/forgot-password/send-otp", sendOTP);

// Forgot Password - Xác thực OTP
router.post("/forgot-password/verify-otp", verifyOTP);

// Forgot Password - Đặt lại mật khẩu
router.post("/forgot-password/reset", resetPassword);

// Verify token
router.get("/verify", verifyToken);

// Lấy thông tin user hiện tại (cần token)
router.get("/me", authenticateToken, getCurrentUser);

// Cập nhật hồ sơ cá nhân
router.put("/me", authenticateToken, updateProfile);

// Đổi mật khẩu (cần token)
router.put("/change-password", authenticateToken, changePassword);

module.exports = router;

