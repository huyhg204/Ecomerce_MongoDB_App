import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { getToken } from "../../services/authService";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./css/admin-add-product.css";

interface Category {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface Brand {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

const AdminAddProduct: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [price, setPrice] = useState("");
  const [salePercent, setSalePercent] = useState("0");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [tag, setTag] = useState<string>("");
  const [color, setColor] = useState(""); // Comma-separated: "Đen, Trắng, Xám"

  // Fetch categories và brands
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/categories/active"),
          axios.get("http://localhost:5000/api/brands/active"),
        ]);
        setCategories(categoriesRes.data);
        setBrands(brandsRes.data);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu", error);
      }
    };
    fetchData();
  }, []);

  // ==========================
  // SUBMIT FORM + UPLOAD FILE
  // ==========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Vui lòng chọn ảnh chính!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("code", code);
    formData.append("price", price);
    formData.append("salePercent", salePercent || "0");
    formData.append("stock", stock);
    formData.append("category", category);
    formData.append("brand", brand);
    formData.append("color", color);
    formData.append("image", file);
    
    // Thêm nhiều ảnh phụ
    files.forEach((fileItem) => {
      formData.append("images", fileItem);
    });
    
    formData.append("tag", tag || "");

    const token = getToken();

    try {
      await axios.post("http://localhost:5000/api/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Thêm sản phẩm thành công!");
      navigate("/admin/products");
    } catch (error) {
      console.error(error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || "Lỗi thêm sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const fileArray = Array.from(selectedFiles);
      setFiles(fileArray);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="admin-add-product-page">

      <h2 className="page-title">Thêm sản phẩm mới</h2>

      <form className="add-product-form" onSubmit={handleSubmit}>

        <div className="form-group">
          <label>Tên sản phẩm</label>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Mã sản phẩm</label>
          <input 
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Giá gốc (₫)</label>
          <input 
            type="number"
            value={originalPrice}
            onChange={(e) => {
              const newOriginalPrice = e.target.value;
              setOriginalPrice(newOriginalPrice);
              // Tự động tính giá giảm nếu có % giảm
              if (salePercent && Number(salePercent) > 0 && newOriginalPrice) {
                const origPrice = Number(newOriginalPrice);
                const discountedPrice = Math.round(origPrice * (1 - Number(salePercent) / 100));
                setPrice(discountedPrice.toString());
              } else if (newOriginalPrice) {
                setPrice(newOriginalPrice);
              }
            }}
            placeholder="Nhập giá gốc"
            required
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Phần trăm giảm giá (%)</label>
          <input 
            type="number"
            value={salePercent}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || (Number(value) >= 0 && Number(value) <= 100)) {
                setSalePercent(value);
                // Tự động tính giá giảm khi thay đổi %
                if (originalPrice && Number(value) > 0) {
                  const origPrice = Number(originalPrice);
                  const discountedPrice = Math.round(origPrice * (1 - Number(value) / 100));
                  setPrice(discountedPrice.toString());
                } else if (originalPrice) {
                  setPrice(originalPrice);
                }
              }
            }}
            placeholder="0"
            min="0"
            max="100"
          />
        </div>

        <div className="form-group">
          <label>Giá bán (₫) - Tự động tính</label>
          <input 
            type="number"
            value={price}
            placeholder="Tự động tính từ giá gốc và % giảm"
            required
            min="0"
            readOnly
            style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
          />
        </div>

        <div className="form-group">
          <label>Số lượng</label>
          <input 
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Màu sắc (nhiều màu)</label>
          <input 
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="Nhập các màu cách nhau bởi dấu phẩy. Ví dụ: Đen, Trắng, Xám, Bạc"
          />
          <small style={{ color: "#666", fontSize: "12px", marginTop: "4px", display: "block" }}>
            💡 Tip: Nhập nhiều màu cách nhau bởi dấu phẩy. Ví dụ: "Đen, Trắng, Xám"
          </small>
        </div>

        <div className="form-group">
          <label>Loại</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ddd",
              fontSize: "16px",
            }}
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Thương hiệu</label>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ddd",
              fontSize: "16px",
            }}
          >
            <option value="">-- Chọn thương hiệu --</option>
            {brands.map((br) => (
              <option key={br._id} value={br._id}>
                {br.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tag - chỉ chọn 1 tag */}
        <div className="form-group">
          <label>Tag sản phẩm</label>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ddd",
              fontSize: "16px",
            }}
          >
            <option value="">-- Không có tag --</option>
            <option value="sale">Khuyến mãi</option>
            <option value="new">Mới nhất</option>
            <option value="featured">Nổi bật</option>
          </select>
          <small style={{ color: "#666", fontSize: "12px", display: "block", marginTop: "4px" }}>
            Chọn 1 tag để hiển thị sản phẩm trong các section tương ứng
          </small>
        </div>

        {/* Upload ảnh chính */}
        <div className="form-group">
          <label>Ảnh chính</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
          {/* Preview ảnh chính */}
          {file && (
            <div style={{ marginTop: "10px" }}>
              <img
                src={URL.createObjectURL(file)}
                className="preview-img"
                alt="preview"
                style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "contain", border: "1px solid #ddd", borderRadius: "8px", padding: "4px" }}
              />
            </div>
          )}
        </div>

        {/* Upload nhiều ảnh phụ */}
        <div className="form-group">
          <label>Ảnh phụ (có thể chọn nhiều)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesChange}
          />
          <small style={{ color: "#666", fontSize: "12px", display: "block", marginTop: "4px" }}>
            Có thể chọn nhiều ảnh cùng lúc (tối đa 10 ảnh)
          </small>
          
          {/* Preview nhiều ảnh */}
          {files.length > 0 && (
            <div style={{ marginTop: "15px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {files.map((fileItem, index) => (
                <div key={index} style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={URL.createObjectURL(fileItem)}
                    alt={`preview ${index + 1}`}
                    style={{ 
                      width: "100px", 
                      height: "100px", 
                      objectFit: "cover", 
                      border: "1px solid #ddd", 
                      borderRadius: "8px",
                      padding: "4px"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-5px",
                      background: "#d90019",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      cursor: "pointer",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "Đang thêm..." : "Thêm sản phẩm"}
        </button>

      </form>
    </div>
  );
};

export default AdminAddProduct;
