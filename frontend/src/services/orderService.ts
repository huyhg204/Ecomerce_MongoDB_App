import axios from "axios";

const API_URL = "http://localhost:5000/api/orders";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

export type OrderStatus =
  | "pending"
  | "processing"
  | "handover_to_carrier"
  | "shipping"
  | "delivered"
  | "received"
  | "cancelled";

export interface ShippingInfo {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  city?: string;
  district?: string;
  ward?: string;
  note?: string;
}

export interface OrderItemPayload {
  productId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  userId?: string;
  shippingInfo: ShippingInfo;
  paymentMethod: string;
  shippingFee?: number;
  discount?: number;
  couponCode?: string;
}

export interface OrderTotals {
  subTotal: number; // Tạm tính (giá gốc)
  total?: number; // Tổng tiền (giá giảm) - có thể không có trong đơn cũ
  savings?: number; // Tiết kiệm - có thể không có trong đơn cũ
  shippingFee: number;
  discount: number;
  grandTotal: number; // Tổng cộng (giá giảm + ship - discount)
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number; // Giá giảm (sau sale)
  oldPrice?: number; // Giá gốc
  quantity: number;
  selectedColor?: string; // Màu sắc đã chọn
}

export interface Order {
  _id: string;
  code: string;
  userId: string;
  items: OrderItem[];
  shippingInfo: ShippingInfo;
  paymentMethod: string;
  paymentStatus: string;
  status: OrderStatus;
  totals: OrderTotals;
  statusHistory: Array<{
    status: OrderStatus;
    note?: string;
    updatedBy?: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  success: boolean;
  message?: string;
  data: Order;
}

export interface OrderListResponse {
  success: boolean;
  data: Order[];
}

export const createOrder = async (
  payload: CreateOrderPayload
): Promise<OrderResponse> => {
  const response = await axios.post<OrderResponse>(API_URL, payload, {
    headers: authHeaders(),
  });
  return response.data;
};

export const getOrdersByUser = async (
  userId: string
): Promise<OrderListResponse> => {
  const response = await axios.get<OrderListResponse>(
    `${API_URL}/user/${userId}`,
    { headers: authHeaders() }
  );
  return response.data;
};

export const getOrderDetail = async (
  orderId: string
): Promise<OrderResponse> => {
  const response = await axios.get<OrderResponse>(`${API_URL}/${orderId}`, {
    headers: authHeaders(),
  });
  return response.data;
};

export const getAllOrders = async (
  status?: OrderStatus
): Promise<OrderListResponse> => {
  const response = await axios.get<OrderListResponse>(API_URL, {
    headers: authHeaders(),
    params: status ? { status } : undefined,
  });
  return response.data;
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  note?: string
): Promise<OrderResponse> => {
  const response = await axios.patch<OrderResponse>(
    `${API_URL}/${orderId}/status`,
    { status, note },
    { headers: authHeaders() }
  );
  return response.data;
};

export const confirmOrderReceived = async (
  orderId: string
): Promise<OrderResponse> => {
  const response = await axios.post<OrderResponse>(
    `${API_URL}/${orderId}/confirm`,
    {},
    { headers: authHeaders() }
  );
  return response.data;
};

export const cancelOrder = async (
  orderId: string
): Promise<OrderResponse> => {
  const response = await axios.post<OrderResponse>(
    `${API_URL}/${orderId}/cancel`,
    {},
    { headers: authHeaders() }
  );
  return response.data;
};

