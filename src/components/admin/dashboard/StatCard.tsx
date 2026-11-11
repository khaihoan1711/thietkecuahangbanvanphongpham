// Thẻ thống kê trên Dashboard: một con số lớn kèm nhãn.
export default function StatCard({
  label,
  value,
  icon,
  note,
}: {
  label: string;
  value: string;
  icon: string;
  // Dòng chú thích nhỏ bên dưới (ví dụ: "5 đơn chờ xác nhận")
  note?: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink-muted">{label}</p>
          <p className="mt-2 truncate text-2xl font-bold text-navy">{value}</p>
        </div>
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-xl text-primary"
        >
          {icon}
        </span>
      </div>
      {note && <p className="mt-3 text-xs text-ink-muted">{note}</p>}
    </div>
  );
}
