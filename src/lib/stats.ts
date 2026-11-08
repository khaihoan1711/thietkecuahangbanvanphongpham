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

function monthKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${date.getFullYear()}-${month}`;
}

// Doanh thu của `months` tháng gần nhất (tính cả tháng hiện tại), tháng cũ nhất đứng đầu.
export function getMonthlyRevenue(
  orders: Order[],
  months = 6,
  now = new Date(),
): MonthlyRevenue[] {
  const result: MonthlyRevenue[] = [];

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const yearShort = String(date.getFullYear()).slice(-2);

    result.push({
      label: `T${date.getMonth() + 1}/${yearShort}`,
      key: monthKey(date),
      revenue: 0,
    });
  }

  for (const order of getRevenueOrders(orders)) {
    const entry = result.find(
      (item) => item.key === monthKey(new Date(order.createdAt)),
    );

    if (entry) {
      entry.revenue += order.total;
    }
  }

  return result;
}
