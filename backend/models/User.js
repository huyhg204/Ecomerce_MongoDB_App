const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { 
      type: String, 
      required: function() {
        return !this.googleId; // Chỉ required nếu không có googleId
      }
    },
    googleId: { type: String, unique: true, sparse: true },
    phone: { type: String },
    address: { type: String },
    role: { 
      type: String, 
      enum: ["user", "admin"], 
      default: "user" 
    },
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
