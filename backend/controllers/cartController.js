const Cart = require("../models/Cart");
const Product = require("../models/Product");

// =======================
// Thêm sản phẩm vào giỏ
// =======================
const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, selectedColor } = req.body;

    // Kiểm tra sản phẩm và stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    if (!product.inStock) {
      return res.status(400).json({ message: "Sản phẩm hiện không còn hàng" });
    }

    // Kiểm tra stock theo màu nếu có colorStocks
    const colorName = selectedColor || "";
    let availableStock = product.stock; // Stock tổng (fallback)

    if (product.colorStocks && product.colorStocks.length > 0) {
      const colorStock = product.colorStocks.find(
        (cs) => cs.name === colorName
      );
      if (colorStock) {
        availableStock = colorStock.stock;
      } else if (colorName) {
        return res.status(400).json({ 
          message: `Màu "${colorName}" không có trong sản phẩm này` 
        });
      }
    }

    let cart = await Cart.findOne({ userId });

    // Tính số lượng sẽ có sau khi thêm
    let finalQuantity = quantity;
    if (cart) {
      const existingItem = cart.items.find(
        (item) => 
          item.productId.toString() === productId && 
          (item.selectedColor || "") === colorName
      );
      if (existingItem) {
        finalQuantity = existingItem.quantity + quantity;
      }
    }

    // Kiểm tra số lượng có đủ không
    if (availableStock === 0) {
      return res.status(400).json({ 
        message: colorName 
          ? `Sản phẩm màu "${colorName}" đã hết hàng.` 
          : "Sản phẩm đã hết hàng."
      });
    }
    
    if (finalQuantity > availableStock) {
      return res.status(400).json({ 
        message: `Số lượng không đủ. Số lượng còn lại cho màu "${colorName || "sản phẩm"}": ${availableStock}` 
      });
    }

    // Nếu chưa có giỏ → tạo mới
    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [{ productId, quantity, selectedColor: colorName }]
      });
    } else {
      // Kiểm tra sp đã có trong giỏ chưa (cùng productId và cùng màu)
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId && item.selectedColor === colorName
      );

      if (itemIndex !== -1) {
        // Nếu có → tăng số lượng
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Nếu chưa có → thêm vào
        cart.items.push({ productId, quantity, selectedColor: colorName });
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
    const { userId, productId, quantity, selectedColor } = req.body;

    const cart = await Cart.findOne({ userId });

    if (!cart) return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

    // Tìm item bằng cả productId và selectedColor để phân biệt các biến thể màu
    const itemIndex = cart.items.findIndex(
      (item) => 
        item.productId.toString() === productId && 
        (item.selectedColor || "") === (selectedColor || "")
    );

    if (itemIndex === -1)
      return res.status(404).json({ message: "Sản phẩm không có trong giỏ" });

    // Kiểm tra stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    if (!product.inStock) {
      return res.status(400).json({ message: "Sản phẩm hiện không còn hàng" });
    }

    // Kiểm tra stock theo màu nếu có colorStocks
    const colorName = selectedColor || "";
    let availableStock = product.stock; // Stock tổng (fallback)

    if (product.colorStocks && product.colorStocks.length > 0) {
      const colorStock = product.colorStocks.find(
        (cs) => cs.name === colorName
      );
      if (colorStock) {
        availableStock = colorStock.stock;
      }
    }

    // Kiểm tra số lượng có đủ không
    if (quantity > availableStock) {
      return res.status(400).json({ 
        message: `Số lượng không đủ. Số lượng còn lại cho màu "${colorName || "sản phẩm"}": ${availableStock}` 
      });
    }

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
    const { userId, productId, selectedColor } = req.body;

    const cart = await Cart.findOne({ userId });

    if (!cart) return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

    // Xóa item bằng cả productId và selectedColor để phân biệt các biến thể màu
    cart.items = cart.items.filter(
      (item) => 
        !(item.productId.toString() === productId && 
          (item.selectedColor || "") === (selectedColor || ""))
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
