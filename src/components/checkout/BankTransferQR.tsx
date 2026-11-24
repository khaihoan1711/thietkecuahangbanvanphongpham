import { formatVND } from "@/lib/format";
import { BANK, vietQrImage } from "@/lib/vietqr";

// Khung chuyển khoản ngân hàng.
// - Chưa đặt hàng (chưa có mã đơn): chỉ hiện thông tin tài khoản, chưa có mã QR,
//   để khách không chuyển tiền thiếu mã đơn.
// - Đã có mã đơn: mã QR có sẵn đúng số tiền và nội dung chuyển khoản là mã đơn.
export default function BankTransferQR({
  amount,
  orderId,
}: {
  amount: number;
  orderId?: string;
}) {
  const rows = [
    ["Ngân hàng", BANK.name],
    ["Chủ tài khoản", BANK.accountName],
    ["Số tài khoản", BANK.accountNumber],
  ];

  return (
    <div className="mt-5 flex flex-col items-center gap-5 rounded-xl border border-primary/30 bg-primary-soft/50 p-5 sm:flex-row sm:items-start">
      {orderId && (
        <img
          src={vietQrImage(amount, orderId)}
          alt={`Mã QR chuyển khoản ${formatVND(amount)} cho đơn ${orderId}`}
          className="w-56 shrink-0 rounded-lg bg-white shadow-soft [image-rendering:pixelated]"
        />
      )}
      <div className="space-y-2 text-ink">
        <p className="font-semibold text-navy">
          {orderId
            ? "Quét mã QR bằng ứng dụng ngân hàng: số tiền và nội dung đã có sẵn"
            : "Thông tin chuyển khoản"}
        </p>
        <dl className="space-y-1">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="inline text-ink-muted">{label}: </dt>
              <dd className="inline font-semibold">{value}</dd>
            </div>
          ))}
          <div>
            <dt className="inline text-ink-muted">Số tiền: </dt>
            <dd className="inline font-bold text-primary">{formatVND(amount)}</dd>
          </div>
          <div>
            <dt className="inline text-ink-muted">Nội dung chuyển khoản: </dt>
            <dd className="inline">
              {orderId ? (
                <strong>{orderId}</strong>
              ) : (
                <span className="text-ink-muted">mã đơn hàng</span>
              )}
            </dd>
          </div>
        </dl>
        <p className="text-sm text-ink-muted">
          {orderId
            ? "Cửa hàng sẽ xác nhận và giao hàng sau khi nhận được tiền chuyển khoản."
            : "Mã QR có sẵn số tiền và mã đơn hàng sẽ hiện ngay sau khi bạn bấm Đặt hàng."}
        </p>
      </div>
    </div>
  );
}
