import type { Order } from "@/types/store";

// Doanh thu chỉ tính các đơn đã giao hàng thành công.
export function getRevenueOrders(orders: Order[]) {
  return orders.filter((order) => order.status === "delivered");
}

export function getTotalRevenue(orders: Order[]) {
  return getRevenueOrders(orders).reduce((sum, order) => sum + order.total, 0);
}

export interface MonthlyRevenue {
  // Nhãn hiển thị dưới biểu đồ, ví dụ "T11/26"
  label: string;
  // Khóa tháng dạng "2026-11"
  key: string;
  revenue: number;
}

// Biểu đồ doanh thu tính từ ngày này (giờ Việt Nam) đến hôm nay.
export const REVENUE_START = new Date("2026-09-28T00:00:00+07:00");

function monthKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${date.getFullYear()}-${month}`;
}

// Doanh thu từng tháng, từ tháng của `start` đến tháng hiện tại (tháng cũ nhất đứng đầu).
// Chỉ tính các đơn đã giao đặt từ ngày `start` trở đi.
export function getMonthlyRevenue(
  orders: Order[],
  start = REVENUE_START,
  now = new Date(),
): MonthlyRevenue[] {
  const result: MonthlyRevenue[] = [];
  const date = new Date(start.getFullYear(), start.getMonth(), 1);

  while (date <= now) {
    result.push({
      label: `T${date.getMonth() + 1}/${String(date.getFullYear()).slice(-2)}`,
      key: monthKey(date),
      revenue: 0,
    });
    date.setMonth(date.getMonth() + 1);
  }

  for (const order of getRevenueOrders(orders)) {
    const createdAt = new Date(order.createdAt);
    const entry = result.find((item) => item.key === monthKey(createdAt));

    if (entry && createdAt >= start) {
      entry.revenue += order.total;
    }
  }

  return result;
}
