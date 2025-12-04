const User = require("../models/User");
const Order = require("../models/Order");

// Lấy tất cả user
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy user theo ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật user
exports.updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xóa user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa user thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.lockUser = async (req, res) => {
  try {
    const { isLocked } = req.body;
    if (typeof isLocked !== "boolean") {
      return res.status(400).json({ message: "isLocked phải là boolean" });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { isLocked },
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    res.json({
      success: true,
      message: isLocked ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserOrderCount = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({ userId: req.params.id });
    res.json({
      success: true,
      data: { totalOrders },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
