import axios from "axios";
import { getToken } from "./authService";

const API_URL = "http://localhost:5000/api/news";

export type News = {
  _id: string;
  title: string;
  content: string;
  summary?: string;
  image?: string;
  author?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
};

// Lấy tất cả tin tức
export const getAllNews = async (params?: { isActive?: boolean; isFeatured?: boolean }): Promise<News[]> => {
  const queryParams = new URLSearchParams();
  if (params?.isActive !== undefined) {
    queryParams.append("isActive", params.isActive.toString());
  }
  if (params?.isFeatured !== undefined) {
    queryParams.append("isFeatured", params.isFeatured.toString());
  }

  const response = await axios.get<News[]>(`${API_URL}?${queryParams.toString()}`);
  return response.data;
};

// Lấy tin tức theo ID
export const getNewsById = async (id: string): Promise<News> => {
  const response = await axios.get<News>(`${API_URL}/${id}`);
  return response.data;
};

// Tạo tin tức mới
export const createNews = async (data: FormData): Promise<{ success: boolean; data: News; message: string }> => {
  const token = getToken();
  const response = await axios.post<{ success: boolean; data: News; message: string }>(
    API_URL,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// Cập nhật tin tức
export const updateNews = async (
  id: string,
  data: FormData
): Promise<{ success: boolean; data: News; message: string }> => {
  const token = getToken();
  const response = await axios.put<{ success: boolean; data: News; message: string }>(
    `${API_URL}/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// Xóa tin tức
export const deleteNews = async (id: string): Promise<{ success: boolean; message: string }> => {
  const token = getToken();
  const response = await axios.delete<{ success: boolean; message: string }>(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

