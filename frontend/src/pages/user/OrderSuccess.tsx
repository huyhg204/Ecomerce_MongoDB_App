import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "../user/css/style.css";
import "../user/css/order-success.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useAuth } from "../../context/AuthContext";
import { getOrderDetail, type Order } from "../../services/orderService";
import { toast } from "sonner";

const OrderSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuth, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const orderId = searchParams.get("orderId");
  const error = searchParams.get("error");
  const transId = searchParams.get("transId");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuth || !user) {
      toast.error("Vui lòng đăng nhập.");
      navigate("/login", { replace: true });
      return;
    }

    // Xử lý lỗi từ callback MOMO
    if (error) {
      toast.error(decodeURIComponent(error));
      // Xóa query params
      window.history.replaceState({}, document.title, "/order-success");
    }

    // Nếu có orderId từ query params, load order detail
    if (orderId) {
      const loadOrder = async () => {
        try {
          setLoading(true);
          const res = await getOrderDetail(orderId);
          setOrder(res.data);
          // Nếu có transId (từ MOMO), hiển thị thông báo thành công
          if (transId && !error) {
            toast.success("Thanh toán MOMO thành công!");
          }
        } catch (error) {
          console.error("getOrderDetail error:", error);
          toast.error("Không thể tải thông tin đơn hàng.");
        } finally {
          setLoading(false);
        }
      };
      loadOrder();
    } else {
      setLoading(false);
    }
  }, [orderId, error, transId, isAuth, user, authLoading, navigate]);

  if (loading || authLoading) {
    return (
      <div className="order-success-main">
        <div className="order-success-container">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="order-success-main">
      <div className="order-success-container">

        {/* Success Icon and Title */}
        <div className="order-success-header">
          {error ? (
            <>
              <div className="order-success-icon" style={{ background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)", boxShadow: "0 4px 15px rgba(220, 53, 69, 0.3)" }}>
                <i className="fa fa-times"></i>
              </div>
              <h1 className="order-success-title" style={{ color: "#dc3545" }}>Thanh toán thất bại!</h1>
              <p className="order-success-message">
                {decodeURIComponent(error || "Có lỗi xảy ra trong quá trình thanh toán.")}
              </p>
            </>
          ) : (
            <>
              <div className="order-success-icon">
                <i className="fa fa-check"></i>
              </div>
              <h1 className="order-success-title">Đặt hàng thành công!</h1>
              <p className="order-success-message">
                Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.
              </p>
            </>
          )}
        </div>

        {/* Order Code */}
        {order && !error && (
          <div className="order-success-code-box">
            <span className="order-success-code-label">Mã đơn hàng của bạn:</span>
            <span className="order-success-code-value">#{order.code}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="order-success-actions">
          {order && (
            <Link
              to={`/orders/${order._id}`}
              className="order-success-btn order-success-btn-primary"
            >
              <i className="fa fa-file-invoice"></i>
              Xem chi tiết đơn hàng
            </Link>
          )}
          <Link
            to="/orders"
            className="order-success-btn order-success-btn-secondary"
          >
            <i className="fa fa-box"></i>
            Xem tất cả đơn hàng
          </Link>
          <Link
            to="/home"
            className="order-success-btn order-success-btn-secondary"
          >
            <i className="fa fa-home"></i>
            Về trang chủ
          </Link>
        </div>

        {/* COD Notice */}
        {order && order.paymentMethod === "cod" && !error && (
          <div className="order-success-notice">
            <strong>Lưu ý:</strong>
            <p>
              Nếu bạn chọn thanh toán khi nhận hàng, vui lòng chuẩn bị đúng số tiền khi nhận đơn hàng. 
              Chúng tôi sẽ liên hệ với bạn qua số điện thoại đã cung cấp để xác nhận đơn hàng.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSuccess;
