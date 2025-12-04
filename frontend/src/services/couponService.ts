import axios from "axios";
import { authHeaders } from "./authService";

const API_URL = "http://localhost:5000/api/coupons";

export interface Coupon {
  _id: string;
  code: string;
  type: "fixed" | "percent";
  value: number;
  maxUses: number | null;
  usedCount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  minOrderValue: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ValidateCouponResponse {
  success: boolean;
  data: {
    coupon: {
      _id: string;
      code: string;
      type: "fixed" | "percent";
      value: number;
    };
    discount: number;
  };
  message?: string;
}

export interface CouponListResponse {
  success: boolean;
  data: Coupon[];
}

export interface CouponResponse {
  success: boolean;
  data: Coupon;
  message?: string;
}

export const validateCoupon = async (
  code: string,
  orderTotal: number
): Promise<ValidateCouponResponse> => {
  const response = await axios.post<ValidateCouponResponse>(
    `${API_URL}/validate`,
    { code, orderTotal }
  );
  return response.data;
};

export const getAllCoupons = async (): Promise<CouponListResponse> => {
  const response = await axios.get<CouponListResponse>(API_URL, {
    headers: authHeaders(),
  });
  return response.data;
};

export const getCouponById = async (id: string): Promise<CouponResponse> => {
  const response = await axios.get<CouponResponse>(`${API_URL}/${id}`, {
    headers: authHeaders(),
  });
  return response.data;
};

export const createCoupon = async (couponData: {
  code: string;
  type: "fixed" | "percent";
  value: number;
  maxUses?: number | null;
  validFrom: string;
  validTo: string;
  minOrderValue?: number;
  isActive?: boolean;
}): Promise<CouponResponse> => {
  const response = await axios.post<CouponResponse>(API_URL, couponData, {
    headers: authHeaders(),
  });
  return response.data;
};

export const updateCoupon = async (
  id: string,
  couponData: Partial<Coupon>
): Promise<CouponResponse> => {
  const response = await axios.put<CouponResponse>(
    `${API_URL}/${id}`,
    couponData,
    {
      headers: authHeaders(),
    }
  );
  return response.data;
};

export const deleteCoupon = async (id: string): Promise<CouponResponse> => {
  const response = await axios.delete<CouponResponse>(`${API_URL}/${id}`, {
    headers: authHeaders(),
  });
  return response.data;
};

