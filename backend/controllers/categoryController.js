const Category = require("../models/Category");

// ===== CONTROLLERS =====

// Lấy tất cả danh mục
const getCategories = async (req, res) => {
  try {
    const { isActive, sortBy } = req.query;
    let query = {};
    
    // Lọc theo trạng thái hoạt động nếu có
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    let sortOption = { sortOrder: 1, createdAt: -1 };
    if (sortBy === "name") {
      sortOption = { name: 1 };
    } else if (sortBy === "created") {
      sortOption = { createdAt: -1 };
    }

    const categories = await Category.find(query).sort(sortOption);
    res.json(categories);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách danh mục:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy danh mục theo ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
    
    res.json(category);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết danh mục:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy danh mục theo slug
const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });
    
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
    
    res.json(category);
  } catch (error) {
    console.error("Lỗi khi lấy danh mục theo slug:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Thêm danh mục mới
const addCategory = async (req, res) => {
  try {
    const { name, description, isActive, sortOrder } = req.body;

    // Kiểm tra name bắt buộc
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Tên danh mục là bắt buộc" });
    }

    // Xử lý file upload nếu có
    let imagePath = "";
    if (req.file) {
      imagePath = `img/${req.file.filename}`;
    } else if (req.body.image) {
      // Nếu không có file upload nhưng có image URL
      imagePath = req.body.image;
    }

    const newCategory = await Category.create({
      name: name.trim(),
      description: description?.trim() || "",
      image: imagePath,
      isActive: isActive !== undefined ? (isActive === "true" || isActive === true) : true,
      sortOrder: sortOrder ? Number(sortOrder) : 0,
    });

    res.status(201).json({ 
      message: "Thêm danh mục thành công", 
      data: newCategory 
    });
  } catch (error) {
    console.error("Lỗi khi thêm danh mục:", error);
    
    // Xử lý lỗi duplicate key (name hoặc slug đã tồn tại)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field === "name" ? "Tên" : "Slug"} danh mục đã tồn tại` 
      });
    }
    
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Cập nhật danh mục
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive, sortOrder } = req.body;

    const updateData = {};

    // Trim name nếu có
    if (name) {
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description.trim();
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive === "true" || isActive === true;
    }

    if (sortOrder !== undefined) {
      updateData.sortOrder = Number(sortOrder);
    }

    // Xử lý file upload nếu có
    if (req.file) {
      updateData.image = `img/${req.file.filename}`;
    } else if (req.body.image !== undefined) {
      // Nếu không có file upload nhưng có image URL
      updateData.image = req.body.image;
    }

    const updated = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    res.json({ 
      message: "Cập nhật danh mục thành công", 
      data: updated 
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật danh mục:", error);
    
    // Xử lý lỗi duplicate key
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field === "name" ? "Tên" : "Slug"} danh mục đã tồn tại` 
      });
    }
    
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Xóa danh mục (soft delete - chỉ ẩn)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    // Soft delete: chỉ ẩn category (set isActive = false)
    const updated = await Category.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    res.json({ 
      message: "Ẩn danh mục thành công", 
      data: updated 
    });
  } catch (error) {
    console.error("Lỗi khi ẩn danh mục:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy danh sách danh mục đang hoạt động (public)
const getActiveCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select("_id name slug isActive") // Chỉ lấy các trường cần thiết, không có image
      .sort({ sortOrder: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách danh mục hoạt động:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ===== EXPORT =====
module.exports = {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  addCategory,
  updateCategory,
  deleteCategory,
  getActiveCategories,
};

