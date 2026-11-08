import { TRACKING_STEPS, getStatusInfo } from "@/lib/order-status";
import type { OrderStatus } from "@/types/store";

// Thanh theo dõi tiến trình đơn hàng: Chờ xác nhận → Đã xác nhận → Đang giao hàng → Đã giao hàng.
export default function OrderTracker({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <p
        role="status"
        className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
      >
        Đơn hàng này đã bị hủy.
      </p>
    );
  }

  const currentIndex = TRACKING_STEPS.indexOf(status);

  return (
    <ol
      aria-label="Tiến trình đơn hàng"
      className="grid grid-cols-4 gap-2"
    >
      {TRACKING_STEPS.map((step, index) => {
        const isDone = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li
            key={step}
            aria-current={isCurrent ? "step" : undefined}
            className="flex flex-col items-center text-center"
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                isDone ? "bg-primary text-white" : "bg-line text-ink-muted"
              }`}
            >
              {isDone ? "✓" : index + 1}
            </span>
            <span
              className={`mt-2 text-xs sm:text-sm ${
                isCurrent ? "font-bold text-primary" : "text-ink-muted"
              }`}
            >
              {getStatusInfo(step).label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
