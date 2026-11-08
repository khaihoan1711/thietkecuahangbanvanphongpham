"use client";

import Modal from "@/components/ui/Modal";
import OrderStatusBadge from "@/components/ui/OrderStatusBadge";
import { useOrders } from "@/context/OrderContext";
import { formatDate, formatVND } from "@/lib/format";
import type { User } from "@/types/store";

// Hộp thoại xem thông tin tài khoản và các đơn hàng của người dùng.
export default function UserDetailModal({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) {
  const { getUserOrders } = useOrders();
  const orders = getUserOrders(user);
  const totalSpent = orders
    .filter((order) => order.status === "delivered")
    .reduce((sum, order) => sum + order.total, 0);

  const address = user.address
    ? [
        user.address.address,
        user.address.ward,
        user.address.district,
        user.address.province,
      ]
        .filter(Boolean)
        .join(", ")
    : "Chưa cập nhật";

  const infoRows = [
    ["Họ và tên", user.fullName],
    ["Email", user.email],
    ["Số điện thoại", user.phone],
    ["Quyền", user.role === "admin" ? "Quản trị viên (Admin)" : "Người dùng (User)"],
    ["Trạng thái", user.isLocked ? "Đã bị khóa" : "Đang hoạt động"],
    ["Ngày tạo", formatDate(user.createdAt)],
    ["Địa chỉ", address],
    ["Tổng đã mua (đơn đã giao)", formatVND(totalSpent)],
  ];

  return (
    <Modal
      title="Thông tin tài khoản"
      onClose={onClose}
    >
      <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
        {infoRows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-ink-muted">{label}</dt>
            <dd className="font-medium text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mb-3 mt-6 font-bold text-navy">Đơn hàng ({orders.length})</h3>

      {orders.length === 0 ? (
        <p className="text-sm text-ink-muted">Người dùng này chưa có đơn hàng nào.</p>
      ) : (
        <ul className="divide-y divide-line rounded-lg border border-line">
          {orders.map((order) => (
            <li
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm"
            >
              <span className="font-semibold text-navy">{order.id}</span>
              <span className="text-ink-muted">{formatDate(order.createdAt)}</span>
              <span className="font-medium">{formatVND(order.total)}</span>
              <OrderStatusBadge status={order.status} />
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
