const Banner = require("../models/Banner");
const path = require("path");

// ===== GET ALL BANNERS =====
const getAllBanners = async (req, res) => {
  try {
    const { isActive } = req.query;
    let filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const banners = await Banner.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json(banners);
  } catch (error) {
    console.error("Lỗi lấy danh sách banner:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ===== GET BANNER BY ID =====
const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({ message: "Không tìm thấy banner" });
    }

    res.json(banner);
  } catch (error) {
    console.error("Lỗi lấy banner:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ===== CREATE BANNER =====
const createBanner = async (req, res) => {
  try {
    const { title, subtitle, discountText, link, isActive, sortOrder } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Tiêu đề banner là bắt buộc" });
    }

    // Xử lý ảnh nếu có
    let imagePath = "";
    if (req.file) {
      imagePath = `img/${req.file.filename}`;
    } else if (req.body.image) {
      imagePath = req.body.image;
    }

    const banner = await Banner.create({
      title,
      subtitle: subtitle || "",
      discountText: discountText || "",
      image: imagePath,
      link: link || "#",
      isActive: isActive !== undefined ? isActive === "true" : true,
      sortOrder: sortOrder ? parseInt(sortOrder) : 0,
    });

    res.status(201).json({ message: "Tạo banner thành công", banner });
  } catch (error) {
    console.error("Lỗi tạo banner:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ===== UPDATE BANNER =====
const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, discountText, link, isActive, sortOrder } = req.body;

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: "Không tìm thấy banner" });
    }

    const updateData = {
      title: title || banner.title,
      subtitle: subtitle !== undefined ? subtitle : banner.subtitle,
      discountText: discountText !== undefined ? discountText : banner.discountText,
      link: link !== undefined ? link : banner.link,
      isActive: isActive !== undefined ? isActive === "true" : banner.isActive,
      sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : banner.sortOrder,
    };

    // Xử lý ảnh nếu có file mới
    if (req.file) {
      updateData.image = `img/${req.file.filename}`;
    } else if (req.body.image) {
      updateData.image = req.body.image;
    }

    const updatedBanner = await Banner.findByIdAndUpdate(id, updateData, { new: true });

    res.json({ message: "Cập nhật banner thành công", banner: updatedBanner });
  } catch (error) {
    console.error("Lỗi cập nhật banner:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ===== DELETE BANNER =====
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({ message: "Không tìm thấy banner" });
    }

    await Banner.findByIdAndDelete(id);
    res.json({ message: "Xóa banner thành công" });
  } catch (error) {
    console.error("Lỗi xóa banner:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
};

