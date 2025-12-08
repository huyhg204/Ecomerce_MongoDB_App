const Product = require("../models/Product");
const Decimal128Type = require("mongoose").Types.Decimal128;

// ===== CONTROLLERS =====
const getProducts = async (req, res) => {
  try {
    const search = req.query.q;
    const isActive = req.query.isActive;
    const category = req.query.category;
    const brand = req.query.brand;
    const tag = req.query.tag; // Filter theo tag
    
    const query = {};
    
    // Tìm kiếm theo tên
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    
    // Filter theo category
    if (category) {
      query.category = category;
    }
    
    // Filter theo brand
    if (brand) {
      query.brand = brand;
    }
    
    // Filter theo tag (single value)
    if (tag) {
      query.tag = tag;
    }
    
    // Kiểm tra xem có phải admin không (từ req.user được set bởi authenticateTokenOptional middleware)
    const isAdmin = req.user && req.user.role === "admin";
    
    // Xử lý isActive
    if (isActive !== undefined && isActive !== "") {
      // Nếu có query param isActive và không rỗng, filter theo đó
      if (isActive === "true") {
        // Lấy sản phẩm có isActive = true hoặc không có trường isActive
        query.$or = [
          { isActive: true },
          { isActive: { $exists: false } }
        ];
      } else if (isActive === "false") {
        // Lấy sản phẩm có isActive = false
        query.isActive = false;
      }
      // Nếu isActive không phải "true" hoặc "false", không filter (lấy tất cả)
    } else {
      // Nếu không có query param isActive hoặc isActive = ""
      if (isAdmin) {
        // Admin: mặc định lấy tất cả (không filter isActive)
        // Không thêm điều kiện isActive vào query
      } else {
        // User thường: chỉ lấy sản phẩm đang hoạt động
        query.$or = [
          { isActive: true },
          { isActive: { $exists: false } }
        ];
      }
    }
    
    const products = await Product.find(query)
      .populate("brand", "name slug")
      .populate("category", "name slug")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Lỗi MongoDB:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id)
      .populate("brand", "name slug")
      .populate("category", "name slug");
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json(product);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const addProduct = async (req, res) => {
  try {
    const { name, code, price, salePercent = 0, category, brand, inStock, color, colorStocks } = req.body;
    
    // Xử lý colorStocks - mảng các object {name, stock}
    let colorStocksArray = [];
    if (colorStocks) {
      try {
        // Nếu là string JSON, parse nó
        const parsed = typeof colorStocks === 'string' ? JSON.parse(colorStocks) : colorStocks;
        if (Array.isArray(parsed)) {
          colorStocksArray = parsed
            .filter(cs => cs && cs.name && cs.name.trim().length > 0)
            .map(cs => ({
              name: cs.name.trim(),
              stock: Number(cs.stock) || 0
            }));
        }
      } catch (e) {
        console.error("Lỗi parse colorStocks:", e);
      }
    }
    
    // Xử lý color - có thể là string (comma-separated) hoặc array (backward compatibility)
    let colorArray = [];
    if (color && colorStocksArray.length === 0) {
      // Chỉ xử lý color nếu không có colorStocks
      if (typeof color === 'string') {
        colorArray = color.split(',').map(c => c.trim()).filter(c => c.length > 0);
      } else if (Array.isArray(color)) {
        colorArray = color.filter(c => c && c.trim().length > 0);
      }
    }

    // Validate brand và category là ObjectId hợp lệ
    if (!brand) {
      return res.status(400).json({ message: "Thương hiệu là bắt buộc" });
    }

    // Xử lý tag (single value)
    let tag = null;
    if (req.body.tag) {
      const validTags = ['sale', 'new', 'featured'];
      if (validTags.includes(req.body.tag)) {
        tag = req.body.tag;
      }
    } else if (req.body.tag === '') {
      tag = null; // Cho phép xóa tag
    }

    // Xử lý file upload nếu có
    let imagePath = "";
    let imagesArray = [];
    
    // Xử lý ảnh chính
    if (req.files && req.files.image && req.files.image[0]) {
      imagePath = `img/${req.files.image[0].filename}`;
    } else if (req.body.image) {
      // Nếu không có file upload nhưng có image URL
      imagePath = req.body.image;
    }
    
    // Xử lý nhiều ảnh phụ
    if (req.files && req.files.images && req.files.images.length > 0) {
      imagesArray = req.files.images.map(file => `img/${file.filename}`);
    } else if (req.body.images) {
      // Nếu có images từ body (JSON array)
      try {
        const parsedImages = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
        imagesArray = Array.isArray(parsedImages) ? parsedImages : [];
      } catch (e) {
        imagesArray = [];
      }
    }

    // Tính stock tổng từ colorStocks
    const totalStock = colorStocksArray.reduce((sum, cs) => sum + (cs.stock || 0), 0);
    
    const newProduct = await Product.create({
      name,
      code: code || "",
      price: price.toString(), // Convert to string for Decimal128
      salePercent: salePercent ? Number(salePercent) : 0,
      category: category || null, // ObjectId hoặc null
      brand: brand, // ObjectId
      image: imagePath,
      images: imagesArray,
      inStock: inStock !== undefined ? (inStock === "true" || inStock === true) : (totalStock > 0),
      stock: totalStock, // Tự động tính từ colorStocks
      tag: tag,
      color: colorArray, // Backward compatibility
      colorStocks: colorStocksArray, // Mảng màu với số lượng riêng
    });

    // Populate để trả về thông tin đầy đủ
    const populatedProduct = await Product.findById(newProduct._id)
      .populate("brand", "name slug")
      .populate("category", "name slug");

    res.status(201).json({ message: "Thêm sản phẩm thành công", data: populatedProduct });
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, price, salePercent, category, brand, inStock, color, colorStocks } = req.body;

    const updateData = {};

    if (name) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (price !== undefined) updateData.price = price.toString(); // Convert to string for Decimal128
    if (salePercent !== undefined) updateData.salePercent = Number(salePercent);
    if (category !== undefined) {
      updateData.category = category || null; // ObjectId hoặc null
    }
    if (brand !== undefined) {
      updateData.brand = brand; // ObjectId
    }
    // Xử lý colorStocks - mảng các object {name, stock}
    if (colorStocks !== undefined) {
      try {
        const parsed = typeof colorStocks === 'string' ? JSON.parse(colorStocks) : colorStocks;
        if (Array.isArray(parsed)) {
          const colorStocksArray = parsed
            .filter(cs => cs && cs.name && cs.name.trim().length > 0)
            .map(cs => ({
              name: cs.name.trim(),
              stock: Number(cs.stock) || 0
            }));
          updateData.colorStocks = colorStocksArray;
          // Tự động tính stock tổng từ colorStocks
          const totalStock = colorStocksArray.reduce((sum, cs) => sum + (cs.stock || 0), 0);
          updateData.stock = totalStock;
          // Cập nhật inStock dựa trên stock
          if (inStock === undefined) {
            updateData.inStock = totalStock > 0;
          }
        } else if (parsed === null || parsed === '') {
          updateData.colorStocks = [];
          updateData.stock = 0;
          if (inStock === undefined) {
            updateData.inStock = false;
          }
        }
      } catch (e) {
        console.error("Lỗi parse colorStocks:", e);
      }
    }
    
    if (inStock !== undefined) updateData.inStock = inStock === "true" || inStock === true;
    
    // Xử lý color - có thể là string (comma-separated) hoặc array (backward compatibility)
    if (color !== undefined && updateData.colorStocks === undefined) {
      let colorArray = [];
      if (typeof color === 'string' && color.trim().length > 0) {
        // Nếu là string, split bằng dấu phẩy và trim
        colorArray = color.split(',').map(c => c.trim()).filter(c => c.length > 0);
      } else if (Array.isArray(color)) {
        colorArray = color.filter(c => c && typeof c === 'string' && c.trim().length > 0);
      }
      updateData.color = colorArray;
    }

    // Xử lý tag (single value)
    if (req.body.tag !== undefined) {
      const validTags = ['sale', 'new', 'featured'];
      if (req.body.tag === '' || req.body.tag === null) {
        updateData.tag = null;
      } else if (validTags.includes(req.body.tag)) {
        updateData.tag = req.body.tag;
      }
    }

    // Xử lý file upload nếu có
    if (req.files && req.files.image && req.files.image[0]) {
      updateData.image = `img/${req.files.image[0].filename}`;
    } else if (req.body.image !== undefined) {
      // Nếu không có file upload nhưng có image URL
      updateData.image = req.body.image;
    }
    
    // Xử lý nhiều ảnh phụ
    if (req.files && req.files.images && req.files.images.length > 0) {
      const newImages = req.files.images.map(file => `img/${file.filename}`);
      // Nếu có ảnh cũ từ body, merge với ảnh mới
      if (req.body.existingImages) {
        try {
          const existingImages = typeof req.body.existingImages === 'string' 
            ? JSON.parse(req.body.existingImages) 
            : req.body.existingImages;
          updateData.images = Array.isArray(existingImages) 
            ? [...existingImages, ...newImages] 
            : newImages;
        } catch (e) {
          updateData.images = newImages;
        }
      } else {
        updateData.images = newImages;
      }
    } else if (req.body.existingImages !== undefined) {
      // Nếu chỉ cập nhật danh sách ảnh phụ (xóa một số ảnh, không upload mới)
      try {
        const existingImages = typeof req.body.existingImages === 'string' 
          ? JSON.parse(req.body.existingImages) 
          : req.body.existingImages;
        updateData.images = Array.isArray(existingImages) ? existingImages : [];
      } catch (e) {
        updateData.images = [];
      }
    } else if (req.body.images !== undefined) {
      // Nếu có images từ body (JSON array) - fallback
      try {
        const parsedImages = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
        updateData.images = Array.isArray(parsedImages) ? parsedImages : [];
      } catch (e) {
        // Giữ nguyên images hiện tại nếu parse lỗi
      }
    }

    const updated = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("brand", "name slug")
      .populate("category", "name slug");

    if (!updated) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    res.json({ message: "Cập nhật sản phẩm thành công", data: updated });
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Lấy sản phẩm hiện tại để kiểm tra trạng thái
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    
    // Toggle trạng thái: nếu đang active thì ẩn, nếu đang ẩn thì hiện lại
    const newStatus = product.isActive === false ? true : false;
    
    // Soft delete/restore: toggle isActive
    const updated = await Product.findByIdAndUpdate(
      id,
      { isActive: newStatus },
      { new: true, runValidators: true }
    )
      .populate("brand", "name slug")
      .populate("category", "name slug");

    const message = newStatus ? "Hiện sản phẩm thành công" : "Ẩn sản phẩm thành công";
    res.json({ message, data: updated });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ===== EXPORT =====
module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};
