import axios from "axios";
import type {
  User,
  LoginData,
  RegisterData,
  AuthResponse,
  UserResponse,
  VerifyTokenResponse,
  ChangePasswordResponse,
  UpdateProfilePayload,
} from "../types/auth";

const API_URL = "http://localhost:5000/api/auth";

export type {
  User,
  LoginData,
  RegisterData,
  AuthResponse,
  UserResponse,
  VerifyTokenResponse,
  ChangePasswordResponse,
  UpdateProfilePayload,
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(`${API_URL}/login`, data);
  return response.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(`${API_URL}/register`, data);
  return response.data;
};

export const getCurrentUser = async (): Promise<UserResponse> => {
  const token = localStorage.getItem("token");
  const response = await axios.get<UserResponse>(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const verifyToken = async (): Promise<VerifyTokenResponse> => {
  const token = localStorage.getItem("token");
  if (!token) {
    return { success: false, valid: false };
  }
  try {
    const response = await axios.get<VerifyTokenResponse>(`${API_URL}/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      validateStatus: (status) => status < 500,
    });
    
    if (response.status === 401) {
      return {
        success: false,
        valid: false,
        message: "Token không hợp lệ hoặc đã hết hạn",
      };
    }
    
    return response.data;
  } catch {
    return {
      success: false,
      valid: false,
      message: "Lỗi kết nối server",
    };
  }
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<ChangePasswordResponse> => {
  const token = localStorage.getItem("token");
  const response = await axios.put<ChangePasswordResponse>(
    `${API_URL}/change-password`,
    { currentPassword, newPassword },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const updateProfile = async (payload: UpdateProfilePayload): Promise<AuthResponse> => {
  const token = localStorage.getItem("token");
  const response = await axios.put<AuthResponse>(`${API_URL}/me`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const saveAuthData = (token: string, user: User) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

export const getUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("token");
};

export const sendOTP = async (email: string): Promise<{ success: boolean; message?: string; data?: { otp?: string } }> => {
  const response = await axios.post<{ success: boolean; message?: string; data?: { otp?: string } }>(
    `${API_URL}/forgot-password/send-otp`,
    { email }
  );
  return response.data;
};

export const verifyOTP = async (email: string, otp: string): Promise<{ success: boolean; message?: string; data?: { resetToken: string } }> => {
  const response = await axios.post<{ success: boolean; message?: string; data?: { resetToken: string } }>(
    `${API_URL}/forgot-password/verify-otp`,
    { email, otp }
  );
  return response.data;
};

export const resetPassword = async (resetToken: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
  const response = await axios.post<{ success: boolean; message?: string }>(
    `${API_URL}/forgot-password/reset`,
    { resetToken, newPassword }
  );
  return response.data;
};

export const googleLogin = async (googleData: {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(`${API_URL}/google`, googleData);
  return response.data;
};
