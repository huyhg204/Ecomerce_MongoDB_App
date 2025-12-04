import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { getToken, getUser } from "../../services/authService";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  createdAt: string;
  isLocked?: boolean;
}

const AdminCustomers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const currentUser = getUser();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(res.data);
    } catch (error: any) {
      console.error("Lỗi lấy danh sách khách hàng", error);
      toast.error(error.response?.data?.message || "Lỗi khi tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchOrderCount = async (userId: string) => {
    try {
      const token = getToken();
      const res = await axios.get(
        `http://localhost:5000/api/users/${userId}/orders/count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOrderCount(res.data?.data?.totalOrders ?? 0);
    } catch (error: any) {
      console.error("Lỗi lấy số lượng đơn", error);
      toast.error(error.response?.data?.message || "Không thể lấy số lượng đơn");
      setOrderCount(null);
    }
  };

  const openModal = (user: User) => {
    if (user._id === currentUser?.id) {
      toast.error("Không thể thao tác trên tài khoản của bạn.");
      return;
    }
    setSelectedUser(user);
    setShowModal(true);
    fetchOrderCount(user._id);
  };

  const handleToggleLock = async (user: User, isLocked: boolean) => {
    try {
      setUpdating(true);
      const token = getToken();
      const res = await axios.patch(
        `http://localhost:5000/api/users/${user._id}/lock`,
        { isLocked },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(res.data?.message || "Đã cập nhật trạng thái tài khoản");
      setShowModal(false);
      fetchUsers();
    } catch (error: any) {
      console.error("Lỗi cập nhật trạng thái user", error);
      toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "50px", textAlign: "center" }}>Đang tải...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Quản lý khách hàng</h2>
      
      <div style={{ marginTop: "20px", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Tên</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Email</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Số điện thoại</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Địa chỉ</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Vai trò</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Trạng thái</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Ngày tạo</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "20px", textAlign: "center" }}>
                  Không có khách hàng nào
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{user.name}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{user.email}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{user.phone || "-"}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{user.address || "-"}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      backgroundColor: user.role === "admin" ? "#ff6b6b" : "#4ecdc4",
                      color: "white",
                      fontSize: "12px"
                    }}>
                      {user.role === "admin" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor: user.isLocked ? "#fee2e2" : "#dcfce7",
                        color: user.isLocked ? "#b91c1c" : "#15803d",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      {user.isLocked ? "Đã khóa" : "Đang hoạt động"}
                    </span>
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>
                    <button
                      style={{
                        padding: "6px 12px",
                        border: "none",
                        borderRadius: "6px",
                        backgroundColor: user._id === currentUser?.id ? "#9ca3af" : "#1d4ed8",
                        color: "#fff",
                        cursor: user._id === currentUser?.id ? "not-allowed" : "pointer",
                      }}
                      disabled={user._id === currentUser?.id}
                      onClick={() => openModal(user)}
                    >
                      {user._id === currentUser?.id ? "Tài khoản của bạn" : "Chi tiết"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              width: "min(480px, 90vw)",
              background: "#fff",
              borderRadius: "18px",
              padding: "24px",
              boxShadow: "0 24px 60px rgba(15,23,42,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <p style={{ margin: 0, color: "#6b7280" }}>Khách hàng</p>
                <h3 style={{ margin: "4px 0 0" }}>{selectedUser.name}</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  border: "none",
                  background: "#f3f4f6",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  fontSize: "1.1rem",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedUser.phone || "-"}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {selectedUser.address || "-"}
              </p>
              <p>
                <strong>Vai trò:</strong> {selectedUser.role === "admin" ? "Admin" : "User"}
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                {selectedUser.isLocked ? (
                  <span style={{ color: "#dc2626" }}>Đã khóa</span>
                ) : (
                  <span style={{ color: "#16a34a" }}>Đang hoạt động</span>
                )}
              </p>
              <p>
                <strong>Số đơn hàng:</strong>{" "}
                {orderCount === null ? "Đang tải..." : `${orderCount} đơn`}
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                style={{
                  padding: "8px 14px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  cursor: "pointer",
                }}
                onClick={() => setShowModal(false)}
              >
                Đóng
              </button>
              <button
                style={{
                  padding: "8px 18px",
                  borderRadius: "10px",
                  border: "none",
                  background: selectedUser.isLocked ? "#16a34a" : "#dc2626",
                  color: "#fff",
                  cursor: "pointer",
                }}
                disabled={updating}
                onClick={() =>
                  handleToggleLock(selectedUser, !selectedUser.isLocked)
                }
              >
                {updating
                  ? "Đang xử lý..."
                  : selectedUser.isLocked
                  ? "Mở khóa tài khoản"
                  : "Khoá tài khoản"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
  