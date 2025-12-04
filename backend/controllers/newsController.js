const News = require("../models/News");

// ===== GET ALL NEWS =====
const getAllNews = async (req, res) => {
  try {
    const { isActive, isFeatured } = req.query;
    let filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }
    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured === "true";
    }

    const news = await News.find(filter).sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    console.error("Lỗi lấy danh sách tin tức:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ===== GET NEWS BY ID =====
const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id);

    if (!news) {
      return res.status(404).json({ message: "Không tìm thấy tin tức" });
    }

    // Tăng lượt xem
    news.views += 1;
    await news.save();

    res.json(news);
  } catch (error) {
    console.error("Lỗi lấy tin tức:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ===== CREATE NEWS =====
const createNews = async (req, res) => {
  try {
    const { title, content, summary, author, isActive, isFeatured } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Tiêu đề và nội dung là bắt buộc" });
    }

    // Xử lý ảnh nếu có
    let imagePath = "";
    if (req.file) {
      imagePath = `img/${req.file.filename}`;
    } else if (req.body.image) {
      imagePath = req.body.image;
    }

    const news = await News.create({
      title,
      content,
      summary: summary || "",
      image: imagePath,
      author: author || "Admin",
      isActive: isActive !== undefined ? isActive === "true" : true,
      isFeatured: isFeatured !== undefined ? isFeatured === "true" : false,
    });

    res.status(201).json({
      success: true,
      message: "Tạo tin tức thành công",
      data: news,
    });
  } catch (error) {
    console.error("Lỗi tạo tin tức:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ===== UPDATE NEWS =====
const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, summary, author, isActive, isFeatured } = req.body;

    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ message: "Không tìm thấy tin tức" });
    }

    // Cập nhật các trường
    if (title) news.title = title;
    if (content) news.content = content;
    if (summary !== undefined) news.summary = summary;
    if (author) news.author = author;
    if (isActive !== undefined) news.isActive = isActive === "true";
    if (isFeatured !== undefined) news.isFeatured = isFeatured === "true";

    // Xử lý ảnh nếu có file mới
    if (req.file) {
      news.image = `img/${req.file.filename}`;
    } else if (req.body.image) {
      news.image = req.body.image;
    }

    await news.save();

    res.json({
      success: true,
      message: "Cập nhật tin tức thành công",
      data: news,
    });
  } catch (error) {
    console.error("Lỗi cập nhật tin tức:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ===== DELETE NEWS =====
const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findByIdAndDelete(id);

    if (!news) {
      return res.status(404).json({ message: "Không tìm thấy tin tức" });
    }

    res.json({
      success: true,
      message: "Xóa tin tức thành công",
    });
  } catch (error) {
    console.error("Lỗi xóa tin tức:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
};

