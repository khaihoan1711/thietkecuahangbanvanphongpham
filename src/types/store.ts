// Các kiểu dữ liệu dùng chung cho danh mục, người dùng và đơn hàng.
// Toàn bộ dữ liệu này được lưu trong LocalStorage (không có backend).

// ---------- Danh mục ----------

export interface Category {
  // Mã danh mục, dùng trong đường dẫn /danh-muc/[id]
  id: string;
  label: string;
  // Mô tả ngắn hiển thị ở trang chủ
  short: string;
  // Ký tự biểu tượng hiển thị cạnh tên danh mục
  icon: string;
}

// ---------- Người dùng ----------

export type UserRole = "admin" | "user";

export interface Address {
  province: string;
  district: string;
  ward: string;
  address: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  // Chỉ để mô phỏng đăng nhập. Một hệ thống thật không bao giờ lưu mật khẩu ở trình duyệt.
  password: string;
  role: UserRole;
  isLocked: boolean;
  // Thời điểm tạo tài khoản, định dạng ISO
  createdAt: string;
  address?: Address;
}

// Kết quả trả về của các thao tác đăng ký, đăng nhập, đổi mật khẩu...
export type ActionResult = { ok: true } | { ok: false; message: string };

// ---------- Đơn hàng ----------

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipping"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cod" | "bank";

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  // Quy cách đã chọn, ví dụ "Cây · Xanh"
  pack: string;
  price: number;
  quantity: number;
  // Số đơn vị tồn kho trừ cho mỗi 1 sản phẩm (hộp 10 cây = 10)
  stockUnits: number;
}

export interface Order {
  id: string;
  // null nếu khách đặt hàng khi chưa đăng nhập
  userId: string | null;
  customer: {
    fullName: string;
    phone: string;
    email: string;
  };
  shipping: Address;
  note: string;
  payment: PaymentMethod;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  // Thời điểm đặt hàng, định dạng ISO
  createdAt: string;
}

// Dữ liệu cần có để tạo một đơn hàng mới (mã, trạng thái và ngày do hệ thống tự tạo).
export type NewOrderInput = Omit<Order, "id" | "status" | "createdAt">;
