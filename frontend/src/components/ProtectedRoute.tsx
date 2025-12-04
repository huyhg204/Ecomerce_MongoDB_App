import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUser, isAuthenticated } from "../services/authService";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { user, isAuth, loading } = useAuth();
  
  // Kiểm tra localStorage trực tiếp để tránh race condition
  const hasToken = isAuthenticated();
  const storedUser = getUser();

  // Đang loading - chờ xác thực
  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh" 
      }}>
        <div>Đang tải...</div>
      </div>
    );
  }

  // Chưa đăng nhập - kiểm tra cả context và localStorage
  const currentUser = user || storedUser;
  const authenticated = isAuth || hasToken;

  if (!authenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Yêu cầu admin nhưng không phải admin - redirect về home
  if (requireAdmin && currentUser.role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

