"use client";

import { useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import StatCard from "@/components/admin/dashboard/StatCard";
import { useCatalog } from "@/context/CatalogContext";
import { useOrders } from "@/context/OrderContext";
import { formatVND } from "@/lib/format";
import { getProductSales, getSoldOrders } from "@/lib/stats";

// Từ mức tồn kho này trở xuống được coi là sắp hết hàng
const LOW_STOCK_LIMIT = 20;

type SortBy = "sold" | "revenue";

// Trang "Thống kê bán hàng": sản phẩm bán chạy, doanh số theo danh mục, sản phẩm chưa bán.
export default function SalesStatsView() {
  const { products, getCategoryLabel } = useCatalog();
  const { orders } = useOrders();
  const [sortBy, setSortBy] = useState<SortBy>("sold");

  const sales = getProductSales(orders);
  const rows = [...sales].sort((a, b) =>
    sortBy === "revenue"
      ? b.revenue - a.revenue
      : b.sold - a.sold || b.revenue - a.revenue,
  );
  const totalSold = sales.reduce((sum, item) => sum + item.sold, 0);
  const totalRevenue = sales.reduce((sum, item) => sum + item.revenue, 0);
  const soldOrderCount = getSoldOrders(orders).length;
  const best = sales[0];

  // Doanh số theo danh mục (sản phẩm đã bị xóa được xếp vào "Khác").
  const byCategory = new Map<string, number>();

  for (const item of sales) {
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
        description="Tính các đơn chưa bị hủy, gồm cả đơn đang chờ xác nhận và đang giao. Đơn bị hủy đã được hoàn lại kho."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Sản phẩm đã bán"
          value={totalSold.toLocaleString("vi-VN")}
          icon="▤"
          note={`Trong ${soldOrderCount} đơn hàng`}
        />
        <StatCard
          label="Tiền hàng đã bán"
          value={formatVND(totalRevenue)}
          icon="₫"
          note="Chưa tính phí giao hàng và giảm giá"
        />
        <StatCard
          label="Bán chạy nhất"
          value={best ? best.name : "Chưa có"}
          icon="★"
          note={
            best ? `Đã bán ${best.sold.toLocaleString("vi-VN")} sản phẩm` : undefined
          }
        />
        <StatCard
          label="Chưa bán được"
          value={`${notSold.length} sản phẩm`}
          icon="◌"
          note={`Trên tổng ${products.length} sản phẩm`}
        />
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
              <option value="sold">Số lượng bán</option>
              <option value="revenue">Tiền hàng</option>
            </select>
          </label>
        </div>

        <AdminTable
          columns={["#", "Sản phẩm", "Đã bán", "Số đơn", "Tiền hàng", "Tồn kho"]}
          rowCount={rows.length}
          emptyMessage="Chưa có sản phẩm nào được bán."
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
                  {item.sold.toLocaleString("vi-VN")}
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
                      {Math.round((revenue / Math.max(1, totalRevenue)) * 100)}%
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
            Sản phẩm chưa bán được ({notSold.length})
          </h3>
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
