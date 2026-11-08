import type { ReactNode } from "react";

type AdminTableProps = {
  // Tên các cột
  columns: string[];
  // Các hàng <tr> của bảng
  children: ReactNode;
  // Số hàng dữ liệu. Bằng 0 thì hiện `emptyMessage`.
  rowCount: number;
  emptyMessage?: string;
};

// Bảng dữ liệu dùng chung cho các trang quản trị. Cuộn ngang được trên điện thoại.
export default function AdminTable({
  columns,
  children,
  rowCount,
  emptyMessage = "Chưa có dữ liệu.",
}: AdminTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 font-bold"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">{children}</tbody>
        </table>
      </div>

      {rowCount === 0 && (
        <p className="px-4 py-10 text-center text-ink-muted">{emptyMessage}</p>
      )}
    </div>
  );
}
