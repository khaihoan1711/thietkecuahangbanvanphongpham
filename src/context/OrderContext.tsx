"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useCatalog } from "@/context/CatalogContext";
import { usePersistentState } from "@/hooks/usePersistentState";
import { seedOrders } from "@/data/seed-orders";
import { isFinalStatus } from "@/lib/order-status";
import { STORAGE_KEYS } from "@/lib/storage";
import type {
  ActionResult,
  NewOrderInput,
  Order,
  OrderStatus,
  User,
} from "@/types/store";

type OrderContextValue = {
  orders: Order[];
  isReady: boolean;
  // Tạo đơn hàng mới (trạng thái "Chờ xác nhận") và trừ tồn kho.
  placeOrder: (input: NewOrderInput) => Order;
  // Đổi trạng thái. Đơn đã giao hoặc đã hủy thì không đổi được nữa.
  updateOrderStatus: (orderId: string, status: OrderStatus) => ActionResult;
  // Đơn hàng của một người dùng, mới nhất ở đầu.
  getUserOrders: (user: User) => Order[];
  resetOrders: () => void;
};

const OrderContext = createContext<OrderContextValue | null>(null);

// Mã đơn hàng mới, ví dụ "DHMIDC3K8A7F".
// Không có máy chủ nên mỗi trình duyệt tự tạo mã: dùng thời điểm đặt (mili giây, hệ 36)
// cộng 2 ký tự ngẫu nhiên để mã của các khách không trùng nhau. Chỉ gồm chữ in hoa
// và số để ngân hàng nào cũng giữ nguyên khi dùng làm nội dung chuyển khoản.
function newOrderId(existing: Order[]) {
  let id = "";

  do {
    const time = Date.now().toString(36).toUpperCase();
    const random = Math.floor(Math.random() * 36 * 36)
      .toString(36)
      .toUpperCase()
      .padStart(2, "0");

    id = "DH" + time + random;
  } while (existing.some((order) => order.id === id));

  return id;
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const { adjustStock } = useCatalog();
  const [orders, setOrders, isReady] = usePersistentState<Order[]>(
    STORAGE_KEYS.orders,
    seedOrders,
    Array.isArray,
  );

  function placeOrder(input: NewOrderInput): Order {
    const order: Order = {
      ...input,
      id: newOrderId(orders),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    setOrders((current) => [order, ...current]);

    // Trừ tồn kho theo số lượng khách đã đặt.
    for (const item of order.items) {
      adjustStock(item.productId, -(item.quantity * item.stockUnits));
    }

    return order;
  }

  function updateOrderStatus(orderId: string, status: OrderStatus): ActionResult {
    const order = orders.find((item) => item.id === orderId);

    if (!order) {
      return { ok: false, message: "Không tìm thấy đơn hàng." };
    }

    if (isFinalStatus(order.status)) {
      return {
        ok: false,
        message: "Đơn hàng đã giao hoặc đã hủy nên không thể đổi trạng thái.",
      };
    }

    // Hủy đơn thì trả hàng về kho.
    if (status === "cancelled") {
      for (const item of order.items) {
        adjustStock(item.productId, item.quantity * item.stockUnits);
      }
    }

    setOrders((current) =>
      current.map((item) => (item.id === orderId ? { ...item, status } : item)),
    );

    return { ok: true };
  }

  // Đơn của người dùng gồm đơn gắn với tài khoản và đơn đặt bằng cùng email lúc chưa đăng nhập.
  function getUserOrders(user: User) {
    return orders
      .filter(
        (order) => order.userId === user.id || order.customer.email === user.email,
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  function resetOrders() {
    setOrders(seedOrders);
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        isReady,
        placeOrder,
        updateOrderStatus,
        getUserOrders,
        resetOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);

  if (!context) {
    throw new Error("useOrders phải nằm trong OrderProvider.");
  }

  return context;
}
