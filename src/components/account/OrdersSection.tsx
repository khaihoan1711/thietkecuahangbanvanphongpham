"use client";

import { useState } from "react";
import { mockOrders, type OrderStatus } from "@/data/account";
import { formatVND } from "@/lib/format";

const statusStyle: Record<OrderStatus, string> = {
  "Chờ xác nhận": "bg-yellow-soft text-ink",
  "Đang giao": "bg-navy-soft text-navy",
  "Hoàn thành": "bg-primary-soft text-primary",
};

export default function OrdersSection() {
  // Id of the order whose details are open (there is no order detail page yet)
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-ink">Đơn hàng của tôi</h2>
      <ul className="mt-6 space-y-4">
        {mockOrders.map((order) => {
          const isOpen = openId === order.id;
          return (
            <li
              key={order.id}
              className="rounded-xl border border-line bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">Mã đơn hàng: {order.id}</p>
                  <p className="text-sm text-ink-muted">Ngày đặt: {order.date}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[order.status]}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-ink-muted">
                  Tổng tiền:{" "}
                  <span className="text-lg font-bold text-primary">
                    {formatVND(order.total)}
                  </span>
                </p>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : order.id)}
                  className="min-h-11 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary-dark"
                >
                  {isOpen ? "Ẩn chi tiết" : "Xem chi tiết"}
                </button>
              </div>

              {isOpen && (
                <ul className="mt-3 divide-y divide-line border-t border-line">
                  {order.items.map((item) => (
                    <li
                      key={item.name}
                      className="flex justify-between gap-4 py-2 text-ink-muted"
                    >
                      <span>{item.name}</span>
                      <span>x{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
