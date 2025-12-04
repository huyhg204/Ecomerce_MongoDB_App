import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../services/authService";
import { toast } from "sonner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./css/admin-dashboard.css";

interface DashboardStats {
  users: {
    total: number;
    inRange: number;
    today: number;
  };
  orders: {
    total: number;
    inRange: number;
    today: number;
    byStatus: {
      pending: number;
      processing: number;
      handover_to_carrier: number;
      shipping: number;
      delivered: number;
      received: number;
      cancelled: number;
    };
  };
  revenue: {
    total: number;
    orders: number;
    average: number;
  };
  last7Days: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

const STATUS_LABELS: { [key: string]: string } = {
  pending: "Chờ xác nhận",
  processing: "Đang xử lý",
  handover_to_carrier: "Đã bàn giao",
  shipping: "Đang giao",
  delivered: "Đã giao",
  received: "Đã nhận",
  cancelled: "Đã hủy",
};

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async (customStartDate?: Date | null, customEndDate?: Date | null) => {
    try {
      setLoading(true);
      const token = getToken();
      const params = new URLSearchParams();
      
      const start = customStartDate !== undefined ? customStartDate : startDate;
      const end = customEndDate !== undefined ? customEndDate : endDate;
      
      if (start) {
        params.append("startDate", start.toISOString().split("T")[0]);
      }
      if (end) {
        params.append("endDate", end.toISOString().split("T")[0]);
      }

      const res = await axios.get(
        `http://localhost:5000/api/dashboard/stats?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error("Lỗi lấy thống kê:", error);
      toast.error("Không thể tải thống kê. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const handleApplyFilter = () => {
    // Sử dụng giá trị hiện tại từ state
    fetchStats(startDate, endDate);
  };

  const handleResetFilter = () => {
    setStartDate(null);
    setEndDate(null);
    // Fetch lại với filter rỗng sau khi reset state
    const fetchWithoutFilter = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const res = await axios.get(
          `http://localhost:5000/api/dashboard/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error("Lỗi lấy thống kê:", error);
        toast.error("Không thể tải thống kê. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchWithoutFilter();
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div>Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-error">
        <div>Không thể tải dữ liệu thống kê</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>Tổng quan</h2>
        <div className="date-filter">
          <div className="filter-group">
            <label>Từ ngày:</label>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="dd/MM/yyyy"
              placeholderText="Chọn ngày bắt đầu"
              className="date-picker-input"
              isClearable
            />
          </div>
          <div className="filter-group">
            <label>Đến ngày:</label>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              dateFormat="dd/MM/yyyy"
              placeholderText="Chọn ngày kết thúc"
              className="date-picker-input"
              isClearable
            />
          </div>
          <button className="btn-apply" onClick={handleApplyFilter}>
            Áp dụng
          </button>
          {(startDate || endDate) && (
            <button className="btn-reset" onClick={handleResetFilter}>
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {/* Users Stats */}
        <div className="stat-card">
          <div className="stat-icon users">
            <i className="fa-solid fa-users"></i>
          </div>
          <div className="stat-content">
            <div className="stat-label">Tổng số khách hàng</div>
            <div className="stat-value">{stats.users.total}</div>
            <div className="stat-details">
              {startDate || endDate ? (
                <>
                  Trong khoảng: <strong>{stats.users.inRange}</strong>
                </>
              ) : (
                <>
                  Hôm nay: <strong>{stats.users.today}</strong>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Orders Stats */}
        <div className="stat-card">
          <div className="stat-icon orders">
            <i className="fa-solid fa-shopping-cart"></i>
          </div>
          <div className="stat-content">
            <div className="stat-label">Tổng số đơn hàng</div>
            <div className="stat-value">{stats.orders.total}</div>
            <div className="stat-details">
              {startDate || endDate ? (
                <>
                  Trong khoảng: <strong>{stats.orders.inRange}</strong>
                </>
              ) : (
                <>
                  Hôm nay: <strong>{stats.orders.today}</strong>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Revenue Stats */}
        <div className="stat-card">
          <div className="stat-icon revenue">
            <i className="fa-solid fa-money-bill-wave"></i>
          </div>
          <div className="stat-content">
            <div className="stat-label">Tổng doanh thu</div>
            <div className="stat-value">{formatCurrency(stats.revenue.total)}</div>
            <div className="stat-details">
              Đơn hàng: <strong>{stats.revenue.orders}</strong> | Trung bình:{" "}
              <strong>{formatCurrency(stats.revenue.average)}</strong>
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="stat-card">
          <div className="stat-icon average">
            <i className="fa-solid fa-chart-line"></i>
          </div>
          <div className="stat-content">
            <div className="stat-label">Giá trị đơn trung bình</div>
            <div className="stat-value">{formatCurrency(stats.revenue.average)}</div>
            <div className="stat-details">
              Từ <strong>{stats.revenue.orders}</strong> đơn hàng
            </div>
          </div>
        </div>
      </div>

      {/* Orders by Status */}
      <div className="dashboard-section">
        <h3>Đơn hàng theo trạng thái</h3>
        <div className="status-grid">
          {Object.entries(stats.orders.byStatus).map(([status, count]) => (
            <div key={status} className="status-card">
              <div className="status-label">{STATUS_LABELS[status]}</div>
              <div className="status-value">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Last 7 Days Chart */}
      <div className="dashboard-section">
        <h3>Thống kê 7 ngày gần nhất</h3>
        <div className="chart-container">
          <div className="chart-bars">
            {stats.last7Days.map((day, index) => {
              const maxRevenue = Math.max(
                ...stats.last7Days.map((d) => d.revenue)
              );
              const barHeight = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
              
              return (
                <div key={index} className="chart-bar-item">
                  <div className="bar-wrapper">
                    <div
                      className="bar"
                      style={{ height: `${barHeight}%` }}
                      title={formatCurrency(day.revenue)}
                    ></div>
                  </div>
                  <div className="bar-label">{formatDate(day.date)}</div>
                  <div className="bar-value">
                    {day.orders} đơn
                    <br />
                    {formatCurrency(day.revenue)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
