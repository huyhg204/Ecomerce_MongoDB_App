// Auth types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
  errors?: {
    [key: string]: string | null;
  };
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export interface VerifyTokenResponse {
  success: boolean;
  valid: boolean;
  message?: string;
  data?: {
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  address?: string;
}

