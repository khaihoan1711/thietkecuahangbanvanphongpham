"use client";

import { useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import OrderDetailModal from "@/components/admin/orders/OrderDetailModal";
import OrderStatusBadge from "@/components/ui/OrderStatusBadge";
import { useOrders } from "@/context/OrderContext";
import { formatDateTime, formatVND } from "@/lib/format";
import { ORDER_STATUSES } from "@/lib/order-status";
import type { OrderStatus } from "@/types/store";

const filterStyle =
  "h-11 rounded-lg border border-line bg-white px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-soft";

function simplify(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
}

// Trang quản lý đơn hàng: danh sách, tìm kiếm, lọc theo trạng thái, xem chi tiết và cập nhật trạng thái.
export default function OrdersAdminView() {
  const { orders } = useOrders();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  // Lưu mã đơn (không lưu cả đơn) để hộp thoại luôn hiển thị dữ liệu mới nhất.
  const [openId, setOpenId] = useState<string | null>(null);

  const needle = simplify(search.trim());
  const visible = orders
    .filter(
      (order) =>
        (!needle ||
          simplify(
            `${order.id} ${order.customer.fullName} ${order.customer.phone}`,
          ).includes(needle)) &&
        (statusFilter === "all" || order.status === statusFilter),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const openOrder = orders.find((order) => order.id === openId);

  return (
    <>
      <AdminPageHeader
        title="Quản lý đơn hàng"
        description="Xem chi tiết và cập nhật trạng thái các đơn hàng."
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="search"
          aria-label="Tìm đơn hàng"
          placeholder="Tìm theo mã đơn, tên, số điện thoại..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className={`${filterStyle} min-w-[220px] flex-1`}
        />
        <select
          aria-label="Lọc theo trạng thái"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as OrderStatus | "all")
          }
          className={filterStyle}
        >
          <option value="all">Tất cả trạng thái</option>
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

      <p className="mb-3 text-sm text-ink-muted">
        Hiển thị <strong className="text-ink">{visible.length}</strong> /{" "}
        {orders.length} đơn hàng
      </p>

      <AdminTable
        columns={[
          "Mã đơn",
          "Khách hàng",
          "Ngày đặt",
          "Tổng tiền",
          "Trạng thái",
          "Thao tác",
        ]}
        rowCount={visible.length}
        emptyMessage="Không tìm thấy đơn hàng phù hợp."
      >
        {visible.map((order) => (
          <tr key={order.id}>
            <td className="whitespace-nowrap px-4 py-3 font-semibold text-navy">
              {order.id}
            </td>
            <td className="px-4 py-3">
              <p className="font-medium">{order.customer.fullName}</p>
              <p className="text-xs text-ink-muted">{order.customer.phone}</p>
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
              {formatDateTime(order.createdAt)}
            </td>
            <td className="whitespace-nowrap px-4 py-3 font-semibold">
              {formatVND(order.total)}
            </td>
            <td className="px-4 py-3">
              <OrderStatusBadge status={order.status} />
            </td>
            <td className="whitespace-nowrap px-4 py-3">
              <button
                type="button"
                onClick={() => setOpenId(order.id)}
                className="min-h-10 px-2 font-semibold text-primary hover:underline"
              >
                Chi tiết
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>

      {openOrder && (
        <OrderDetailModal
          order={openOrder}
          onClose={() => setOpenId(null)}
        />
      )}
    </>
  );
}
