import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getUser, isAuthenticated, verifyToken, clearAuthData } from "../services/authService";
import { clearStoredCart } from "../services/cartStorage";
import type { User } from "../types/auth";

interface AuthContextType {
  user: User | null;
  isAuth: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      if (isAuthenticated()) {
        const storedUser = getUser();
        if (storedUser) {
          // Verify token với server
          const verifyResult = await verifyToken();
          if (verifyResult.success && verifyResult.valid) {
            setUser(storedUser);
          } else {
            // Token không hợp lệ, xóa dữ liệu
            clearAuthData();
            setUser(null);
          }
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      clearAuthData();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = () => {
    clearAuthData();
    clearStoredCart(); // Xóa giỏ hàng localStorage khi đăng xuất
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuth: !!user,
    loading,
    setUser,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

