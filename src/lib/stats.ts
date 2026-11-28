import type { Order } from "@/types/store";

// ============================================================
// Mọi số liệu bán hàng trong khu quản trị dùng CHUNG một cách tính:
// - Doanh thu = tổng tiền các đơn ĐÃ GIAO (tiền hàng + phí giao − giảm giá),
//   tức là tiền cửa hàng đã thu được.
// - Đơn chờ xác nhận / đã xác nhận / đang giao: tiền "đang chờ thu", chưa là doanh thu.
// - Đơn đã hủy: không tính (hàng đã được hoàn lại kho).
// - Mặc định chỉ tính đơn đặt từ ngày REVENUE_START (giống biểu đồ doanh thu).
// ============================================================

// Ngày bắt đầu tính doanh thu (giờ Việt Nam). `null` nghĩa là toàn bộ thời gian.
export const REVENUE_START = new Date("2026-09-28T00:00:00+07:00");

function inPeriod(order: Order, start: Date | null) {
  return !start || new Date(order.createdAt) >= start;
}

function isPending(order: Order) {
  return order.status !== "delivered" && order.status !== "cancelled";
}

// Các đơn đã giao trong giai đoạn.
export function getRevenueOrders(orders: Order[], start: Date | null = REVENUE_START) {
  return orders.filter(
    (order) => order.status === "delivered" && inPeriod(order, start),
  );
}

export function getTotalRevenue(orders: Order[], start: Date | null = REVENUE_START) {
  return getRevenueOrders(orders, start).reduce((sum, order) => sum + order.total, 0);
}

export interface SalesSummary {
  deliveredCount: number;
  // Doanh thu = tiền hàng + phí giao − giảm giá (của các đơn đã giao)
  itemsTotal: number;
  shippingTotal: number;
  discountTotal: number;
  revenue: number;
  // Đơn chưa giao xong (chờ xác nhận, đã xác nhận, đang giao)
  pendingCount: number;
  pendingRevenue: number;
}

export function getSalesSummary(
  orders: Order[],
  start: Date | null = REVENUE_START,
): SalesSummary {
  const delivered = getRevenueOrders(orders, start);
  const pending = orders.filter((order) => isPending(order) && inPeriod(order, start));
  const sum = (list: Order[], pick: (order: Order) => number) =>
    list.reduce((total, order) => total + pick(order), 0);

  return {
    deliveredCount: delivered.length,
    itemsTotal: sum(delivered, (order) => order.subtotal),
    shippingTotal: sum(delivered, (order) => order.shippingFee),
    discountTotal: sum(delivered, (order) => order.discount),
    revenue: sum(delivered, (order) => order.total),
    pendingCount: pending.length,
    pendingRevenue: sum(pending, (order) => order.total),
  };
}

// ---------- Doanh thu theo tháng (biểu đồ) ----------

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

// Doanh thu từng tháng, từ tháng của `start` đến tháng hiện tại (tháng cũ nhất đứng đầu).
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

  for (const order of getRevenueOrders(orders, start)) {
    const entry = result.find(
      (item) => item.key === monthKey(new Date(order.createdAt)),
    );

    if (entry) {
      entry.revenue += order.total;
    }
  }

  return result;
}

// ---------- Thống kê theo sản phẩm ----------

export interface ProductSales {
  productId: string;
  name: string;
  image: string;
  // Số sản phẩm đã bán trong các đơn đã giao (hộp 10 cây được tính là 10)
  sold: number;
  // Số sản phẩm nằm trong các đơn chưa giao xong
  pending: number;
  // Số đơn đã giao có sản phẩm này
  orderCount: number;
  // Tiền hàng của sản phẩm trong các đơn đã giao
  revenue: number;
}

// Doanh số từng sản phẩm, bán nhiều nhất (theo đơn đã giao) đứng đầu.
export function getProductSales(
  orders: Order[],
  start: Date | null = REVENUE_START,
): ProductSales[] {
  const byProduct = new Map<string, ProductSales>();

  for (const order of orders) {
    if (order.status === "cancelled" || !inPeriod(order, start)) {
      continue;
    }

    const delivered = order.status === "delivered";
    const counted = new Set<string>();

    for (const item of order.items) {
      const entry = byProduct.get(item.productId) ?? {
        productId: item.productId,
        name: item.name,
        image: item.image,
        sold: 0,
        pending: 0,
        orderCount: 0,
        revenue: 0,
      };
      const units = item.quantity * item.stockUnits;

      if (delivered) {
        entry.sold += units;
        entry.revenue += item.price * item.quantity;

        if (!counted.has(item.productId)) {
          entry.orderCount += 1;
          counted.add(item.productId);
        }
      } else {
        entry.pending += units;
      }

      byProduct.set(item.productId, entry);
    }
  }

  return [...byProduct.values()].sort(
    (a, b) => b.sold - a.sold || b.revenue - a.revenue || b.pending - a.pending,
  );
}
