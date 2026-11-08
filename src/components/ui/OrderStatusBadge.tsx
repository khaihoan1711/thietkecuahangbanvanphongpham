import { getStatusInfo } from "@/lib/order-status";
import type { OrderStatus } from "@/types/store";

// Nhãn màu hiển thị trạng thái đơn hàng, dùng cho cả trang người dùng và trang quản trị.
export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const info = getStatusInfo(status);

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${info.badge}`}
    >
      {info.label}
    </span>
  );
}
