import { formatDateTime, formatVND } from "@/lib/format";
import type { Order } from "@/types/store";

const paymentLabel = {
  cod: "Thanh toán khi nhận hàng (COD)",
  bank: "Chuyển khoản ngân hàng",
};

// Chi tiết một đơn hàng: người nhận, địa chỉ, sản phẩm và tổng tiền.
// Dùng chung cho trang tài khoản của người dùng và hộp thoại chi tiết ở trang quản trị.
export default function OrderDetailContent({ order }: { order: Order }) {
  const { customer, shipping } = order;
  const addressLine = [
    shipping.address,
    shipping.ward,
    shipping.district,
    shipping.province,
  ]
    .filter(Boolean)
    .join(", ");

  const infoRows = [
    ["Mã đơn hàng", order.id],
    ["Ngày đặt", formatDateTime(order.createdAt)],
    ["Người nhận", customer.fullName],
    ["Số điện thoại", customer.phone],
    ["Email", customer.email],
    ["Địa chỉ giao hàng", addressLine],
    ["Thanh toán", paymentLabel[order.payment]],
    ["Ghi chú", order.note || "Không có"],
  ];

  const totalRows = [
    ["Tạm tính", formatVND(order.subtotal)],
    ["Phí vận chuyển", formatVND(order.shippingFee)],
    ["Giảm giá", `−${formatVND(order.discount)}`],
  ];

  return (
    <div className="space-y-5">
      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {infoRows.map(([label, value]) => (
          <div
            key={label}
            className="sm:col-span-1"
          >
            <dt className="text-ink-muted">{label}</dt>
            <dd className="font-medium text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <ul className="divide-y divide-line rounded-lg border border-line">
        {order.items.map((item) => (
          <li
            key={`${item.productId}-${item.pack}`}
            className="flex items-center gap-3 p-3"
          >
            <img
              src={item.image}
              alt={item.name}
              className="h-14 w-14 shrink-0 rounded-lg border border-line bg-white object-contain"
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink">{item.name}</p>
              <p className="text-sm text-ink-muted">
                {item.pack} · {formatVND(item.price)} × {item.quantity}
              </p>
            </div>
            <span className="whitespace-nowrap font-semibold text-ink">
              {formatVND(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="space-y-2 text-sm">
        {totalRows.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between gap-4"
          >
            <dt className="text-ink-muted">{label}</dt>
            <dd className="font-medium text-ink">{value}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-4 border-t border-line pt-3">
          <dt className="text-base font-semibold text-ink">Tổng cộng</dt>
          <dd className="text-xl font-bold text-primary">{formatVND(order.total)}</dd>
        </div>
      </dl>
    </div>
  );
}
