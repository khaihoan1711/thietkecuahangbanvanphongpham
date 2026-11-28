"use client";

import { useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import StatCard from "@/components/admin/dashboard/StatCard";
import { useCatalog } from "@/context/CatalogContext";
import { useOrders } from "@/context/OrderContext";
import { formatVND } from "@/lib/format";
import { getProductSales, getSalesSummary, REVENUE_START } from "@/lib/stats";

// Từ mức tồn kho này trở xuống được coi là sắp hết hàng
const LOW_STOCK_LIMIT = 20;

type SortBy = "sold" | "revenue";
type Period = "since-start" | "all";

const number = (value: number) => value.toLocaleString("vi-VN");

// Trang "Thống kê bán hàng". Cách tính giống trang Tổng quan và biểu đồ doanh thu:
// doanh thu chỉ gồm đơn đã giao; đơn chưa giao xong được tách riêng là "đang chờ thu".
export default function SalesStatsView() {
  const { products, getCategoryLabel } = useCatalog();
  const { orders } = useOrders();
  const [sortBy, setSortBy] = useState<SortBy>("sold");
  const [period, setPeriod] = useState<Period>("since-start");

  const start = period === "all" ? null : REVENUE_START;
  const summary = getSalesSummary(orders, start);
  const sales = getProductSales(orders, start);
  const rows = [...sales].sort((a, b) =>
    sortBy === "revenue"
      ? b.revenue - a.revenue || b.sold - a.sold
      : b.sold - a.sold || b.revenue - a.revenue || b.pending - a.pending,
  );
  const totalSold = sales.reduce((sum, item) => sum + item.sold, 0);
  const totalPending = sales.reduce((sum, item) => sum + item.pending, 0);
  const best = sales.find((item) => item.sold > 0);

  // Tiền hàng (đơn đã giao) theo danh mục. Sản phẩm đã bị xóa được xếp vào "Khác".
  const byCategory = new Map<string, number>();

  for (const item of sales) {
    if (item.revenue === 0) {
      continue;
    }

    const product = products.find((value) => value.id === item.productId);
    const label = product ? getCategoryLabel(product.category) : "Khác";

    byCategory.set(label, (byCategory.get(label) ?? 0) + item.revenue);
  }

  const categoryRows = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);
  const maxCategory = Math.max(1, ...categoryRows.map(([, revenue]) => revenue));
  const notSold = products.filter(
    (product) => !sales.some((item) => item.productId === product.id),
  );

  function stockOf(productId: string) {
    return products.find((product) => product.id === productId)?.stock;
  }

  return (
    <div>
      <AdminPageHeader
        title="Thống kê bán hàng"
        description="Doanh thu chỉ tính đơn đã giao, giống trang Tổng quan và biểu đồ doanh thu. Đơn chưa giao xong được tính riêng; đơn đã hủy không tính."
        action={
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            Giai đoạn
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value as Period)}
              className="min-h-10 rounded-lg border border-line bg-white px-3 text-sm text-ink"
            >
              <option value="since-start">Từ 28/09/2026 đến nay</option>
              <option value="all">Toàn bộ thời gian</option>
            </select>
          </label>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Doanh thu (đơn đã giao)"
          value={formatVND(summary.revenue)}
          icon="₫"
          note={`${summary.deliveredCount} đơn đã giao`}
        />
        <StatCard
          label="Đang chờ thu"
          value={formatVND(summary.pendingRevenue)}
          icon="⏳"
          note={`${summary.pendingCount} đơn chờ xác nhận / đang giao`}
        />
        <StatCard
          label="Sản phẩm đã bán"
          value={number(totalSold)}
          icon="▤"
          note={`Thêm ${number(totalPending)} sản phẩm trong đơn đang xử lý`}
        />
        <StatCard
          label="Bán chạy nhất"
          value={best ? best.name : "Chưa có"}
          icon="★"
          note={best ? `Đã bán ${number(best.sold)} sản phẩm` : undefined}
        />
      </div>

      {/* Cách ra con số doanh thu: khớp với biểu đồ ở trang Tổng quan */}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-line bg-white px-5 py-3 text-sm">
        <span className="text-ink-muted">Doanh thu =</span>
        <span>
          Tiền hàng <strong>{formatVND(summary.itemsTotal)}</strong>
        </span>
        <span className="text-ink-muted">+</span>
        <span>
          Phí giao <strong>{formatVND(summary.shippingTotal)}</strong>
        </span>
        <span className="text-ink-muted">−</span>
        <span>
          Giảm giá <strong>{formatVND(summary.discountTotal)}</strong>
        </span>
        <span className="text-ink-muted">=</span>
        <strong className="text-primary">{formatVND(summary.revenue)}</strong>
      </div>

      <section className="mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-navy">Sản phẩm bán chạy</h3>
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            Sắp xếp theo
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortBy)}
              className="min-h-10 rounded-lg border border-line bg-white px-3 text-sm text-ink"
            >
              <option value="sold">Số lượng đã bán</option>
              <option value="revenue">Tiền hàng</option>
            </select>
          </label>
        </div>

        <AdminTable
          columns={[
            "#",
            "Sản phẩm",
            "Đã bán",
            "Đang xử lý",
            "Số đơn đã giao",
            "Tiền hàng",
            "Tồn kho",
          ]}
          rowCount={rows.length}
          emptyMessage="Chưa có sản phẩm nào được bán trong giai đoạn này."
        >
          {rows.map((item, index) => {
            const stock = stockOf(item.productId);

            return (
              <tr key={item.productId}>
                <td className="px-4 py-3 font-bold text-navy">{index + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex min-w-[220px] items-center gap-3">
                    <img
                      src={item.image}
                      alt=""
                      className="h-11 w-11 shrink-0 rounded-lg border border-line bg-white object-contain"
                    />
                    <span className="font-semibold text-ink">{item.name}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-bold text-primary">
                  {number(item.sold)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
                  {item.pending ? number(item.pending) : "—"}
                </td>
                <td className="px-4 py-3">{item.orderCount}</td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold">
                  {formatVND(item.revenue)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {stock === undefined ? (
                    <span className="text-ink-muted">Không giới hạn</span>
                  ) : (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        stock === 0
                          ? "bg-red-100 text-red-700"
                          : stock <= LOW_STOCK_LIMIT
                            ? "bg-yellow-soft text-ink"
                            : "bg-primary-soft text-primary"
                      }`}
                    >
                      {stock === 0 ? "Hết hàng" : `Còn ${stock}`}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </AdminTable>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-line bg-white p-5">
          <h3 className="text-lg font-bold text-navy">Tiền hàng theo danh mục</h3>
          <p className="text-sm text-ink-muted">Các đơn đã giao trong giai đoạn</p>
          {categoryRows.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">Chưa có dữ liệu.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {categoryRows.map(([label, revenue]) => (
                <li key={label}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="font-semibold text-ink">{label}</span>
                    <span className="text-ink-muted">
                      {formatVND(revenue)} ·{" "}
                      {Math.round((revenue / Math.max(1, summary.itemsTotal)) * 100)}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(revenue / maxCategory) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-line bg-white p-5">
          <h3 className="text-lg font-bold text-navy">
            Sản phẩm chưa có đơn ({notSold.length})
          </h3>
          <p className="text-sm text-ink-muted">Không có trong đơn nào của giai đoạn</p>
          {notSold.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">
              Sản phẩm nào cũng đã có người mua.
            </p>
          ) : (
            <ul className="mt-4 max-h-80 divide-y divide-line overflow-y-auto pr-1">
              {notSold.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <span className="min-w-0 truncate text-ink">{product.name}</span>
                  <span className="shrink-0 text-xs text-ink-muted">
                    {product.stock === undefined
                      ? "Không giới hạn"
                      : `Tồn ${product.stock}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
