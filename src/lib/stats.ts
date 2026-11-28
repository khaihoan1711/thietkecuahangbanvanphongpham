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

// ---------- Thống kê bán hàng theo sản phẩm ----------

// Thống kê bán hàng tính các đơn chưa bị hủy (đơn hủy đã được hoàn lại kho).
export function getSoldOrders(orders: Order[]) {
  return orders.filter((order) => order.status !== "cancelled");
}

export interface ProductSales {
  productId: string;
  name: string;
  image: string;
  // Số sản phẩm đã bán (tính theo cái/cuốn..., hộp 10 cây được tính là 10)
  sold: number;
  // Số đơn hàng có sản phẩm này
  orderCount: number;
  // Tiền hàng của sản phẩm (chưa tính phí giao hàng và giảm giá của đơn)
  revenue: number;
}

// Doanh số từng sản phẩm, bán nhiều nhất đứng đầu.
export function getProductSales(orders: Order[]): ProductSales[] {
  const byProduct = new Map<string, ProductSales>();

  for (const order of getSoldOrders(orders)) {
    const counted = new Set<string>();

    for (const item of order.items) {
      const entry = byProduct.get(item.productId) ?? {
        productId: item.productId,
        name: item.name,
        image: item.image,
        sold: 0,
        orderCount: 0,
        revenue: 0,
      };

      entry.sold += item.quantity * item.stockUnits;
      entry.revenue += item.price * item.quantity;

      if (!counted.has(item.productId)) {
        entry.orderCount += 1;
        counted.add(item.productId);
      }

      byProduct.set(item.productId, entry);
    }
  }

  return [...byProduct.values()].sort(
    (a, b) => b.sold - a.sold || b.revenue - a.revenue,
  );
}
