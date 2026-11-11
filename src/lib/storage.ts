// Các hàm đọc và ghi LocalStorage an toàn.
// Trình duyệt có thể chặn LocalStorage (chế độ riêng tư, hết dung lượng...),
// nên mọi thao tác đều được bọc trong try/catch để website không bị lỗi.

export const STORAGE_KEYS = {
  products: "khaihoanshop-products-v3",
  categories: "khaihoanshop-categories",
  users: "khaihoanshop-users-v3",
  orders: "khaihoanshop-orders-v2",
  // Lưu id người đang đăng nhập
  session: "khaihoanshop-session",
  cart: "khaihoanstatinery-cart",
} as const;

// Đọc một giá trị JSON. Trả về `fallback` nếu chưa có hoặc dữ liệu bị hỏng.
export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);

    if (raw === null) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// Ghi một giá trị JSON. Trả về false nếu không ghi được.
export function writeJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// Đọc chuỗi thường (không phải JSON) từ localStorage hoặc sessionStorage.
export function readText(key: string, area: "local" | "session" = "local") {
  try {
    const storage = area === "local" ? localStorage : sessionStorage;
    return storage.getItem(key);
  } catch {
    return null;
  }
}

// Ghi chuỗi thường vào localStorage hoặc sessionStorage.
export function writeText(key: string, value: string, area: "local" | "session") {
  try {
    const storage = area === "local" ? localStorage : sessionStorage;
    storage.setItem(key, value);
  } catch {
    // Bỏ qua: trạng thái đăng nhập chỉ mất khi tải lại trang.
  }
}

// Xóa một khóa khỏi cả localStorage và sessionStorage.
export function removeKey(key: string) {
  try {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  } catch {
    // Không có gì để xóa.
  }
}
