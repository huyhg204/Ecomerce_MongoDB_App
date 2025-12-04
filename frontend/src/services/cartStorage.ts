const CART_KEY = "localCartItems";

export type StoredCartItem = {
  productId: string;
  name: string;
  image?: string;
  price: number; // Giá giảm (sau khi sale)
  oldPrice?: number; // Giá gốc
  quantity: number;
  selectedColor?: string; // Màu sắc đã chọn
};

const readStorage = (): StoredCartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && item.productId);
  } catch (error) {
    console.warn("Không thể đọc local cart:", error);
    localStorage.removeItem(CART_KEY);
    return [];
  }
};

const writeStorage = (items: StoredCartItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

export const getStoredCartItems = (): StoredCartItem[] => readStorage();

export const upsertStoredCartItem = (payload: StoredCartItem): StoredCartItem[] => {
  const items = readStorage();
  // Tìm item có cùng productId và selectedColor
  const index = items.findIndex(
    (item) => item.productId === payload.productId && item.selectedColor === (payload.selectedColor || "")
  );
  if (index !== -1) {
    items[index].quantity += payload.quantity;
  } else {
    items.push(payload);
  }
  writeStorage(items);
  return items;
};

export const updateStoredCartQuantity = (productId: string, quantity: number): StoredCartItem[] => {
  const items = readStorage();
  const index = items.findIndex((item) => item.productId === productId);
  if (index === -1) return items;
  if (quantity <= 0) {
    items.splice(index, 1);
  } else {
    items[index].quantity = quantity;
  }
  writeStorage(items);
  return items;
};

export const removeStoredCartItem = (productId: string): StoredCartItem[] => {
  const filtered = readStorage().filter((item) => item.productId !== productId);
  writeStorage(filtered);
  return filtered;
};

export const clearStoredCart = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
};

