import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  type Coupon,
} from "../../services/couponService";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./css/admin-coupons.css";

const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    type: "fixed" as "fixed" | "percent",
    value: "",
    maxUses: "",
    validFrom: "",
    validTo: "",
    minOrderValue: "0",
    isActive: true,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await getAllCoupons();
      setCoupons(res.data);
    } catch (error: any) {
      console.error("fetchCoupons error:", error);
      toast.error(error.response?.data?.message || "Không thể tải danh sách mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon._id, formData);
        toast.success("Cập nhật mã giảm giá thành công!");
      } else {
        await createCoupon({
          ...formData,
          value: parseFloat(formData.value),
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
          minOrderValue: parseFloat(formData.minOrderValue),
        });
        toast.success("Tạo mã giảm giá thành công!");
      }
      setShowModal(false);
      setEditingCoupon(null);
      resetForm();
      fetchCoupons();
    } catch (error: any) {
      console.error("handleSubmit error:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      maxUses: coupon.maxUses?.toString() || "",
      validFrom: new Date(coupon.validFrom).toISOString().slice(0, 16),
      validTo: new Date(coupon.validTo).toISOString().slice(0, 16),
      minOrderValue: coupon.minOrderValue.toString(),
      isActive: coupon.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) return;
    try {
      await deleteCoupon(id);
      toast.success("Xóa mã giảm giá thành công!");
      fetchCoupons();
    } catch (error: any) {
      console.error("handleDelete error:", error);
      toast.error(error.response?.data?.message || "Không thể xóa mã giảm giá");
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      type: "fixed",
      value: "",
      maxUses: "",
      validFrom: "",
      validTo: "",
      minOrderValue: "0",
      isActive: true,
    });
  };

  const openAddModal = () => {
    setEditingCoupon(null);
    resetForm();
    setShowModal(true);
  };

  const isCouponValid = (coupon: Coupon) => {
    const now = new Date();
    return (
      coupon.isActive &&
      new Date(coupon.validFrom) <= now &&
      new Date(coupon.validTo) >= now &&
      (coupon.maxUses === null || coupon.usedCount < coupon.maxUses)
    );
  };

  if (loading) {
    return <div className="admin-coupons-container">Đang tải...</div>;
  }

  return (
    <div className="admin-coupons-container">
      <div className="admin-coupons-header">
        <h2>Quản lý mã giảm giá</h2>
        <button className="add-coupon-btn" onClick={openAddModal}>
          <i className="fa-solid fa-plus"></i> Thêm mã giảm giá
        </button>
      </div>

      <div className="admin-coupons-table-wrapper">
        <table className="admin-coupons-table">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Loại</th>
              <th>Giá trị</th>
              <th>Đã dùng</th>
              <th>Hạn sử dụng</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                  Chưa có mã giảm giá nào
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon._id}>
                  <td>
                    <strong>{coupon.code}</strong>
                  </td>
                  <td>
                    <span className={`coupon-type-badge ${coupon.type}`}>
                      {coupon.type === "fixed" ? "Cố định" : "Phần trăm"}
                    </span>
                  </td>
                  <td>
                    {coupon.type === "fixed"
                      ? `${coupon.value.toLocaleString()}₫`
                      : `${coupon.value}%`}
                  </td>
                  <td>
                    {coupon.maxUses
                      ? `${coupon.usedCount}/${coupon.maxUses}`
                      : `${coupon.usedCount} (không giới hạn)`}
                  </td>
                  <td>
                    {new Date(coupon.validFrom).toLocaleDateString("vi-VN")} -{" "}
                    {new Date(coupon.validTo).toLocaleDateString("vi-VN")}
                  </td>
                  <td>
                    <span
                      className={`coupon-status-badge ${
                        isCouponValid(coupon) ? "valid" : "invalid"
                      }`}
                    >
                      {isCouponValid(coupon) ? "Hợp lệ" : "Hết hạn"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(coupon)}
                    >
                      <i className="fa-solid fa-edit"></i>
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(coupon._id)}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCoupon ? "Sửa mã giảm giá" : "Thêm mã giảm giá"}</h3>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Mã giảm giá *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  required
                  disabled={!!editingCoupon}
                />
              </div>
              <div className="form-group">
                <label>Loại *</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as "fixed" | "percent",
                    })
                  }
                  required
                >
                  <option value="fixed">Giảm số tiền cố định</option>
                  <option value="percent">Giảm theo phần trăm</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  Giá trị * ({formData.type === "fixed" ? "Số tiền (₫)" : "Phần trăm (%)"})
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  required
                  min="0"
                  max={formData.type === "percent" ? "100" : undefined}
                />
              </div>
              <div className="form-group">
                <label>Số lượt sử dụng tối đa (để trống = không giới hạn)</label>
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) =>
                    setFormData({ ...formData, maxUses: e.target.value })
                  }
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Giá trị đơn hàng tối thiểu (₫)</label>
                <input
                  type="number"
                  value={formData.minOrderValue}
                  onChange={(e) =>
                    setFormData({ ...formData, minOrderValue: e.target.value })
                  }
                  min="0"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ngày bắt đầu *</label>
                  <input
                    type="datetime-local"
                    value={formData.validFrom}
                    onChange={(e) =>
                      setFormData({ ...formData, validFrom: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Ngày kết thúc *</label>
                  <input
                    type="datetime-local"
                    value={formData.validTo}
                    onChange={(e) =>
                      setFormData({ ...formData, validTo: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                  Kích hoạt
                </label>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  {editingCoupon ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;

