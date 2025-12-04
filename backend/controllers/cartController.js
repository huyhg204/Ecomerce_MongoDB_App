const Cart = require("../models/Cart");
const Product = require("../models/Product");

// =======================
// Thêm sản phẩm vào giỏ
// =======================
const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, selectedColor } = req.body;

    let cart = await Cart.findOne({ userId });

    // Nếu chưa có giỏ → tạo mới
    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [{ productId, quantity, selectedColor: selectedColor || "" }]
      });
    } else {
      // Kiểm tra sp đã có trong giỏ chưa (cùng productId và cùng màu)
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId && item.selectedColor === (selectedColor || "")
      );

      if (itemIndex !== -1) {
        // Nếu có → tăng số lượng
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Nếu chưa có → thêm vào
        cart.items.push({ productId, quantity, selectedColor: selectedColor || "" });
      }
    }

    await cart.save();

    res.json({ message: "Đã thêm vào giỏ hàng", cart });

  } catch (error) {
    console.error("Lỗi add to cart:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// =======================
// Lấy giỏ hàng
// =======================
const getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    let cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      cart = await Cart.create({
        userId,
        items: []
      });
    }

    res.json(cart);

  } catch (error) {
    console.error("Lỗi get cart:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// =======================
// Cập nhật số lượng
// =======================
const updateCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const cart = await Cart.findOne({ userId });

    if (!cart) return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1)
      return res.status(404).json({ message: "Sản phẩm không có trong giỏ" });

    cart.items[itemIndex].quantity = quantity;

    await cart.save();

    res.json({ message: "Đã cập nhật số lượng", cart });

  } catch (error) {
    console.error("Lỗi update cart:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// =======================
// Xóa sản phẩm khỏi giỏ
// =======================
const removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const cart = await Cart.findOne({ userId });

    if (!cart) return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();

    res.json({ message: "Đã xóa sản phẩm", cart });

  } catch (error) {
    console.error("Lỗi remove cart:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// =======================
// Export
// =======================
module.exports = {
  addToCart,
  getCart,
  updateCart,
  removeFromCart
};
