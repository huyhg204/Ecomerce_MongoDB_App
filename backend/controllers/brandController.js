const Brand = require("../models/Brand");

// ===== CONTROLLERS =====

// Lấy tất cả brands
const getBrands = async (req, res) => {
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

    const brands = await Brand.find(query).sort(sortOption);
    res.json(brands);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách thương hiệu:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy brand theo ID
const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findById(id);

    if (!brand) {
      return res.status(404).json({ message: "Không tìm thấy thương hiệu" });
    }

    res.json(brand);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết thương hiệu:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy brand theo slug
const getBrandBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const brand = await Brand.findOne({ slug });

    if (!brand) {
      return res.status(404).json({ message: "Không tìm thấy thương hiệu" });
    }

    res.json(brand);
  } catch (error) {
    console.error("Lỗi khi lấy thương hiệu theo slug:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Thêm brand mới
const addBrand = async (req, res) => {
  try {
    const { name, description, isActive, sortOrder } = req.body;

    // Kiểm tra name bắt buộc
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Tên thương hiệu là bắt buộc" });
    }

    // Xử lý file upload nếu có
    let imagePath = "";
    if (req.file) {
      imagePath = `img/${req.file.filename}`;
    } else if (req.body.image) {
      imagePath = req.body.image;
    }

    const newBrand = await Brand.create({
      name: name.trim(),
      description: description?.trim() || "",
      image: imagePath,
      isActive: isActive !== undefined ? (isActive === "true" || isActive === true) : true,
      sortOrder: sortOrder ? Number(sortOrder) : 0,
    });

    res.status(201).json({
      message: "Thêm thương hiệu thành công",
      data: newBrand,
    });
  } catch (error) {
    console.error("Lỗi khi thêm thương hiệu:", error);

    // Xử lý lỗi duplicate key
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `${field === "name" ? "Tên" : "Slug"} thương hiệu đã tồn tại`,
      });
    }

    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Cập nhật brand
const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive, sortOrder } = req.body;

    const updateData = {};

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
      updateData.image = req.body.image;
    }

    const updated = await Brand.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy thương hiệu" });
    }

    res.json({
      message: "Cập nhật thương hiệu thành công",
      data: updated,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật thương hiệu:", error);

    // Xử lý lỗi duplicate key
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `${field === "name" ? "Tên" : "Slug"} thương hiệu đã tồn tại`,
      });
    }

    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Xóa brand (soft delete - chỉ ẩn)
const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    // Soft delete: chỉ ẩn brand (set isActive = false)
    const updated = await Brand.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy thương hiệu" });
    }

    res.json({
      message: "Ẩn thương hiệu thành công",
      data: updated,
    });
  } catch (error) {
    console.error("Lỗi khi ẩn thương hiệu:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy danh sách brands đang hoạt động (public)
const getActiveBrands = async (req, res) => {
  try {
    const brands = await Brand.find({ isActive: true })
      .select("_id name slug isActive") // Chỉ lấy các trường cần thiết
      .sort({
        sortOrder: 1,
        name: 1,
      });
    res.json(brands);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách thương hiệu hoạt động:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ===== EXPORT =====
module.exports = {
  getBrands,
  getBrandById,
  getBrandBySlug,
  addBrand,
  updateBrand,
  deleteBrand,
  getActiveBrands,
};

