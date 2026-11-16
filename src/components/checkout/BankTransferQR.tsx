import { formatVND } from "@/lib/format";

// Thông tin chuyển khoản của cửa hàng (ảnh QR là mã VietQR của tài khoản này).
const bank = {
  qrImage: "/images/products/qr-chuyen-khoan.png",
  name: "Vietcombank",
  accountName: "DUONG KHAI HOAN",
  accountNumber: "1029119451",
};

// Khung mã QR hiện ra khi khách chọn "Chuyển khoản ngân hàng".
// Trước khi đặt hàng chưa có mã đơn, nên chỉ nhắc khách ghi mã đơn sau khi đặt.
export default function BankTransferQR({
  amount,
  orderId,
}: {
  amount: number;
  orderId?: string;
}) {
  const rows = [
    ["Ngân hàng", bank.name],
    ["Chủ tài khoản", bank.accountName],
    ["Số tài khoản", bank.accountNumber],
  ];

  return (
    <div className="mt-5 flex flex-col items-center gap-5 rounded-xl border border-primary/30 bg-primary-soft/50 p-5 sm:flex-row sm:items-start">
      <img
        src={bank.qrImage}
        alt={`Mã QR chuyển khoản ${bank.name} — ${bank.accountName}`}
        width={525}
        height={525}
        className="w-52 shrink-0 rounded-lg bg-white p-3 shadow-soft"
      />
      <div className="space-y-2 text-ink">
        <p className="font-semibold text-navy">
          Quét mã QR bằng ứng dụng ngân hàng hoặc chuyển khoản theo thông tin sau
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
                <span className="text-ink-muted">
                  mã đơn hàng (hiện ra sau khi bấm Đặt hàng)
                </span>
              )}
            </dd>
          </div>
        </dl>
        <p className="text-sm text-ink-muted">
          Cửa hàng sẽ xác nhận và giao hàng sau khi nhận được tiền chuyển khoản.
        </p>
      </div>
    </div>
  );
}
