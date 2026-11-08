"use client";

import { useState } from "react";
import OrderDetailContent from "@/components/order/OrderDetailContent";
import OrderTracker from "@/components/order/OrderTracker";
import Modal from "@/components/ui/Modal";
import OrderStatusBadge from "@/components/ui/OrderStatusBadge";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import { useOrders } from "@/context/OrderContext";
import { useToast } from "@/context/ToastContext";
import { ORDER_STATUSES, isFinalStatus } from "@/lib/order-status";
import type { Order, OrderStatus } from "@/types/store";

// Hộp thoại chi tiết đơn hàng, cho phép Admin cập nhật trạng thái.
export default function OrderDetailModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const { updateOrderStatus } = useOrders();
  const { showToast } = useToast();
  const [nextStatus, setNextStatus] = useState<OrderStatus>(order.status);

  const isLocked = isFinalStatus(order.status);

  function handleSave() {
    if (nextStatus === order.status) {
      return;
    }

    const result = updateOrderStatus(order.id, nextStatus);

    if (result.ok) {
      showToast(`Đã cập nhật đơn ${order.id}.`);
    } else {
      showToast(result.message, "error");
    }
  }

  return (
    <Modal
      title={`Đơn hàng ${order.id}`}
      onClose={onClose}
      size="lg"
    >
      <div className="space-y-6">
        <OrderTracker status={order.status} />

        <div className="flex flex-wrap items-end gap-3 rounded-xl bg-surface p-4">
          <div className="min-w-[200px] flex-1">
            <label
              htmlFor="order-status"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              Trạng thái đơn hàng
            </label>
            <select
              id="order-status"
              value={nextStatus}
              disabled={isLocked}
              onChange={(event) => setNextStatus(event.target.value as OrderStatus)}
              className="h-12 w-full cursor-pointer rounded-lg border border-line bg-white px-3 text-ink focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-soft disabled:cursor-not-allowed disabled:bg-white/60"
            >
              {ORDER_STATUSES.map((status) => (
                <option
                  key={status.value}
                  value={status.value}
                >
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isLocked || nextStatus === order.status}
            className={`${btnBase} ${btnPrimary} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            Cập nhật trạng thái
          </button>

          <div className="w-full text-sm text-ink-muted">
            Hiện tại: <OrderStatusBadge status={order.status} />
            {isLocked && (
              <span className="ml-2">
                Đơn đã giao hoặc đã hủy nên không thể đổi trạng thái.
              </span>
            )}
          </div>
        </div>

        <OrderDetailContent order={order} />
      </div>
    </Modal>
  );
}
