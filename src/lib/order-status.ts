import type { OrderStatus } from "@/types/store";

// Danh sách trạng thái đơn hàng, dùng chung cho trang người dùng và trang quản trị.
export const ORDER_STATUSES: {
  value: OrderStatus;
  label: string;
  // Màu của nhãn trạng thái (Tailwind)
  badge: string;
}[] = [
  { value: "pending", label: "Chờ xác nhận", badge: "bg-yellow-soft text-ink" },
  { value: "confirmed", label: "Đã xác nhận", badge: "bg-navy-soft text-navy" },
  { value: "shipping", label: "Đang giao hàng", badge: "bg-primary-soft text-primary" },
  { value: "delivered", label: "Đã giao hàng", badge: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Đã hủy", badge: "bg-red-100 text-red-700" },
];

// Các bước theo dõi đơn hàng (không gồm trạng thái "Đã hủy").
export const TRACKING_STEPS: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipping",
  "delivered",
];

export function getStatusInfo(status: OrderStatus) {
  return ORDER_STATUSES.find((item) => item.value === status) ?? ORDER_STATUSES[0];
}

// Đơn đã giao hoặc đã hủy thì không thể đổi trạng thái nữa.
export function isFinalStatus(status: OrderStatus) {
  return status === "delivered" || status === "cancelled";
}
