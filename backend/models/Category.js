const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true,
      unique: true 
    },
    description: { 
      type: String, 
      trim: true,
      default: "" 
    },
    image: { 
      type: String, 
      default: "" 
    },
    slug: { 
      type: String, 
      trim: true,
      unique: true,
      lowercase: true 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    sortOrder: { 
      type: Number, 
      default: 0 
    }
  },
  { timestamps: true }
);

// Tạo slug tự động từ name trước khi save
categorySchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-z0-9]+/g, "-") // Thay ký tự đặc biệt bằng dấu gạch ngang
      .replace(/^-+|-+$/g, ""); // Loại bỏ dấu gạch ngang ở đầu và cuối
  }
  next();
});

module.exports = mongoose.model("Category", categorySchema);

