import axios from "axios";
import { authHeaders } from "./authService";

const API_URL = "http://localhost:5000/api/banners";

export type Banner = {
  _id: string;
  title: string;
  subtitle?: string;
  discountText?: string;
  image: string;
  link?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

// Get all banners
export const getBanners = async (isActive?: boolean): Promise<Banner[]> => {
  try {
    const params = isActive !== undefined ? { isActive: String(isActive) } : {};
    const response = await axios.get<Banner[]>(API_URL, { params });
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy danh sách banner:", error);
    throw error;
  }
};

// Get banner by ID
export const getBannerById = async (id: string): Promise<Banner> => {
  try {
    const response = await axios.get<Banner>(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy banner:", error);
    throw error;
  }
};

// Create banner (admin only)
export const createBanner = async (formData: FormData): Promise<Banner> => {
  try {
    const response = await axios.post<{ message: string; banner: Banner }>(
      API_URL,
      formData,
      {
        headers: {
          ...authHeaders(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.banner;
  } catch (error) {
    console.error("Lỗi tạo banner:", error);
    throw error;
  }
};

// Update banner (admin only)
export const updateBanner = async (
  id: string,
  formData: FormData
): Promise<Banner> => {
  try {
    const response = await axios.put<{ message: string; banner: Banner }>(
      `${API_URL}/${id}`,
      formData,
      {
        headers: {
          ...authHeaders(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.banner;
  } catch (error) {
    console.error("Lỗi cập nhật banner:", error);
    throw error;
  }
};

// Delete banner (admin only)
export const deleteBanner = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${id}`, {
      headers: authHeaders(),
    });
  } catch (error) {
    console.error("Lỗi xóa banner:", error);
    throw error;
  }
};

