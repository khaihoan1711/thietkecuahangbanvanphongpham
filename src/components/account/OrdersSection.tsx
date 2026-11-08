"use client";

import Link from "next/link";
import { useState } from "react";
import OrderDetailContent from "@/components/order/OrderDetailContent";
import OrderTracker from "@/components/order/OrderTracker";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import OrderStatusBadge from "@/components/ui/OrderStatusBadge";
import { useOrders } from "@/context/OrderContext";
import { useToast } from "@/context/ToastContext";
import { formatDate, formatVND } from "@/lib/format";
import type { User } from "@/types/store";

// Lịch sử đơn hàng của người dùng, kèm theo dõi trạng thái và hủy đơn đang chờ xác nhận.
export default function OrdersSection({ user }: { user: User }) {
  const { getUserOrders, updateOrderStatus } = useOrders();
  const { showToast } = useToast();
  const orders = getUserOrders(user);
  // Mã đơn đang mở chi tiết
  const [openId, setOpenId] = useState<string | null>(null);
  // Mã đơn đang chờ xác nhận hủy
  const [cancelId, setCancelId] = useState<string | null>(null);

  function handleCancel() {
    if (!cancelId) {
      return;
    }

    const result = updateOrderStatus(cancelId, "cancelled");

    if (result.ok) {
      showToast(`Đã hủy đơn hàng ${cancelId}.`);
    } else {
      showToast(result.message, "error");
    }

    setCancelId(null);
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-ink">Đơn hàng của tôi</h2>

      {orders.length === 0 ? (
        <div className="mt-6 rounded-xl border border-line bg-surface px-6 py-12 text-center">
          <p className="text-ink-muted">Bạn chưa có đơn hàng nào.</p>
          <Link
            href="/san-pham"
            className="mt-4 inline-block font-semibold text-primary hover:underline"
          >
            Bắt đầu mua sắm
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((order) => {
            const isOpen = openId === order.id;

            return (
              <li
                key={order.id}
                className="rounded-xl border border-line bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">Mã đơn hàng: {order.id}</p>
                    <p className="text-sm text-ink-muted">
                      Ngày đặt: {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-ink-muted">
                    Tổng tiền:{" "}
                    <span className="text-lg font-bold text-primary">
                      {formatVND(order.total)}
                    </span>
                  </p>

                  <div className="flex flex-wrap items-center gap-4">
                    {order.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => setCancelId(order.id)}
                        className="min-h-11 text-sm font-medium text-red-600 underline underline-offset-4 hover:text-red-700"
                      >
                        Hủy đơn
                      </button>
                    )}
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenId(isOpen ? null : order.id)}
                      className="min-h-11 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary-dark"
                    >
                      {isOpen ? "Ẩn chi tiết" : "Xem chi tiết"}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-4 space-y-5 border-t border-line pt-5">
                    <OrderTracker status={order.status} />
                    <OrderDetailContent order={order} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {cancelId && (
        <ConfirmDialog
          title="Hủy đơn hàng"
          message={`Bạn có chắc muốn hủy đơn hàng ${cancelId}? Thao tác này không thể hoàn tác.`}
          confirmLabel="Hủy đơn hàng"
          danger
          onConfirm={handleCancel}
          onCancel={() => setCancelId(null)}
        />
      )}
    </div>
  );
}
