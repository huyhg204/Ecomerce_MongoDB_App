const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const OTP = require("../models/OTP");

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin",
        errors: {
          name: !name ? "Tên là bắt buộc" : null,
          email: !email ? "Email là bắt buộc" : null,
          password: !password ? "Mật khẩu là bắt buộc" : null,
        },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Email không hợp lệ",
        errors: { email: "Vui lòng nhập đúng định dạng email" },
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự",
        errors: { password: "Mật khẩu phải có ít nhất 6 ký tự" },
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng",
        errors: { email: "Email này đã được đăng ký" },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone?.trim() || "",
      address: address?.trim() || "",
    });

    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: {
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          address: newUser.address,
          role: newUser.role || "user",
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng",
        errors: { email: "Email này đã được đăng ký" },
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin",
        errors: {
          email: !email ? "Email là bắt buộc" : null,
          password: !password ? "Mật khẩu là bắt buộc" : null,
        },
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
        errors: { general: "Thông tin đăng nhập không chính xác" },
      });
    }

    if (user.isLocked) {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị khóa",
        errors: { general: "Tài khoản của bạn đang bị khoá, vui lòng liên hệ quản trị viên." },
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
        errors: { general: "Thông tin đăng nhập không chính xác" },
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role || "user",
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lấy thông tin user hiện tại (cần token) - sử dụng middleware authenticateToken
const getCurrentUser = async (req, res) => {
  try {
    // User đã được set bởi middleware authenticateToken
    const user = req.user;

    res.json({
      success: true,
      message: "Lấy thông tin user thành công",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role || "user",
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin user:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Không có token hoặc token không hợp lệ",
        errors: { token: "Vui lòng đăng nhập lại" },
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Không có token",
        errors: { token: "Vui lòng đăng nhập lại" },
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
        errors: { user: "User không tồn tại" },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
        errors: { token: "Vui lòng đăng nhập lại" },
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token đã hết hạn",
        errors: { token: "Vui lòng đăng nhập lại" },
      });
    }
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const authenticateTokenOptional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    const user = await User.findById(decoded.userId).select("-password");
    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    next();
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập",
      errors: { auth: "Yêu cầu đăng nhập" },
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Không có quyền truy cập",
      errors: { role: "Chỉ admin mới có quyền truy cập" },
    });
  }

  next();
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin",
        errors: {
          currentPassword: !currentPassword ? "Mật khẩu hiện tại là bắt buộc" : null,
          newPassword: !newPassword ? "Mật khẩu mới là bắt buộc" : null,
        },
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
        errors: { newPassword: "Mật khẩu phải có ít nhất 6 ký tự" },
      });
    }

    const userWithPassword = await User.findById(user._id);

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      userWithPassword.password
    );

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu hiện tại không đúng",
        errors: { currentPassword: "Mật khẩu hiện tại không chính xác" },
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    userWithPassword.password = hashedNewPassword;
    await userWithPassword.save();

    res.json({
      success: true,
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    console.error("Lỗi khi đổi mật khẩu:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập lại",
      });
    }

    const { name, phone, address } = req.body || {};
    const updates = {};

    if (typeof name === "string" && name.trim()) updates.name = name.trim();
    if (typeof phone === "string") updates.phone = phone.trim();
    if (typeof address === "string") updates.address = address.trim();

    if (!Object.keys(updates).length) {
      return res.status(400).json({
        success: false,
        message: "Không có thông tin nào để cập nhật",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, select: "-password" }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    res.json({
      success: true,
      message: "Cập nhật thông tin thành công",
      data: {
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          address: updatedUser.address,
          role: updatedUser.role || "user",
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({
      success: false,
      message: "Không thể cập nhật hồ sơ",
      error: error.message,
    });
  }
};

const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        valid: false,
        message: "Không có token",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        valid: false,
        message: "User không tồn tại",
      });
    }

    res.json({
      success: true,
      valid: true,
      message: "Token hợp lệ",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        valid: false,
        message: error.name === "TokenExpiredError" ? "Token đã hết hạn" : "Token không hợp lệ",
      });
    }
    res.status(500).json({
      success: false,
      valid: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email",
        errors: { email: "Email là bắt buộc" },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Email không hợp lệ",
        errors: { email: "Vui lòng nhập đúng định dạng email" },
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email không tồn tại trong hệ thống",
        errors: { email: "Email này chưa được đăng ký" },
      });
    }

    await OTP.deleteMany({ email: email.toLowerCase(), purpose: "forgot-password" });

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({
      email: email.toLowerCase(),
      code: otpCode,
      purpose: "forgot-password",
      expiresAt,
    });

    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Mã OTP đặt lại mật khẩu - Tiến Thành Store",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d90019;">Đặt lại mật khẩu</h2>
            <p>Xin chào,</p>
            <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
            <p>Mã OTP của bạn là: <strong style="font-size: 24px; color: #d90019;">${otpCode}</strong></p>
            <p>Mã này có hiệu lực trong <strong>10 phút</strong>.</p>
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            <p>Trân trọng,<br>Tiến Thành Store</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Lỗi gửi email:", emailError);
      if (process.env.NODE_ENV !== "production") {
        return res.json({
          success: true,
          message: "OTP đã được tạo (development mode)",
          data: { otp: otpCode },
        });
      }
      return res.status(500).json({
        success: false,
        message: "Không thể gửi email. Vui lòng thử lại sau.",
      });
    }

    res.json({
      success: true,
      message: "Mã OTP đã được gửi đến email của bạn",
    });
  } catch (error) {
    console.error("Lỗi khi gửi OTP:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin",
        errors: {
          email: !email ? "Email là bắt buộc" : null,
          otp: !otp ? "Mã OTP là bắt buộc" : null,
        },
      });
    }

    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      code: otp,
      purpose: "forgot-password",
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Mã OTP không hợp lệ hoặc đã hết hạn",
        errors: { otp: "Vui lòng kiểm tra lại mã OTP" },
      });
    }

    otpRecord.used = true;
    await otpRecord.save();

    const resetToken = jwt.sign(
      { email: email.toLowerCase(), purpose: "reset-password" },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "15m" }
    );

    res.json({
      success: true,
      message: "Xác thực OTP thành công",
      data: { resetToken },
    });
  } catch (error) {
    console.error("Lỗi khi xác thực OTP:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin",
        errors: {
          resetToken: !resetToken ? "Token là bắt buộc" : null,
          newPassword: !newPassword ? "Mật khẩu mới là bắt buộc" : null,
        },
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự",
        errors: { newPassword: "Mật khẩu phải có ít nhất 6 ký tự" },
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || "your-secret-key");
      if (decoded.purpose !== "reset-password") {
        throw new Error("Invalid token purpose");
      }
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn",
        errors: { resetToken: "Vui lòng thực hiện lại quy trình đặt lại mật khẩu" },
      });
    }

    const user = await User.findOne({ email: decoded.email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: "Đặt lại mật khẩu thành công",
    });
  } catch (error) {
    console.error("Lỗi khi đặt lại mật khẩu:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    if (!googleId || !email || !name) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin từ Google",
        errors: {
          googleId: !googleId ? "Google ID là bắt buộc" : null,
          email: !email ? "Email là bắt buộc" : null,
          name: !name ? "Tên là bắt buộc" : null,
        },
      });
    }

    let user = await User.findOne({
      $or: [{ googleId }, { email: email.toLowerCase() }],
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        googleId,
        password: "",
        role: "user",
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: user.googleId ? "Đăng nhập thành công" : "Đăng ký thành công",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role || "user",
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập Google:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng",
        errors: { email: "Email này đã được đăng ký bằng phương thức khác" },
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  changePassword,
  updateProfile,
  verifyToken,
  authenticateToken,
  authenticateTokenOptional,
  requireAdmin,
  sendOTP,
  verifyOTP,
  resetPassword,
  googleLogin,
};

