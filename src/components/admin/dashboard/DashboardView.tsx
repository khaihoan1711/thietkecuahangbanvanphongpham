"use client";

import Link from "next/link";
import { useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import RevenueChart from "@/components/admin/dashboard/RevenueChart";
import StatCard from "@/components/admin/dashboard/StatCard";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import OrderStatusBadge from "@/components/ui/OrderStatusBadge";
import { useAuth } from "@/context/AuthContext";
import { useCatalog } from "@/context/CatalogContext";
import { useOrders } from "@/context/OrderContext";
import { useToast } from "@/context/ToastContext";
import { formatDate, formatVND } from "@/lib/format";
import { getMonthlyRevenue, getProductSales, getTotalRevenue } from "@/lib/stats";

// Số đơn hàng gần đây hiển thị trên Dashboard
const RECENT_ORDER_COUNT = 5;
// Sản phẩm có tồn kho từ mức này trở xuống được coi là sắp hết hàng
const LOW_STOCK_LIMIT = 20;

// Trang tổng quan: thống kê, biểu đồ doanh thu, đơn hàng gần đây.
// Mọi con số đều tính từ dữ liệu thật trong LocalStorage, nên đổi khi Admin thao tác.
export default function DashboardView() {
  const { products, resetCatalog } = useCatalog();
  const { users, resetUsers } = useAuth();
  const { orders, resetOrders } = useOrders();
  const { showToast } = useToast();
  const [confirmReset, setConfirmReset] = useState(false);

  const recentOrders = [...orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, RECENT_ORDER_COUNT);
  const pendingCount = orders.filter((order) => order.status === "pending").length;
  const revenueByMonth = getMonthlyRevenue(orders);
  const topProducts = getProductSales(orders).slice(0, 5);
  const lowStock = products
    .filter(
      (product) => product.stock !== undefined && product.stock <= LOW_STOCK_LIMIT,
    )
    .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));

  function handleReset() {
    resetCatalog();
    resetOrders();
    resetUsers();
    setConfirmReset(false);
    showToast("Đã khôi phục dữ liệu mẫu. Vui lòng đăng nhập lại.");
  }

  return (
    <>
      <AdminPageHeader
        title="Tổng quan"
        description="Số liệu cập nhật theo dữ liệu đang lưu trong trình duyệt."
        action={
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="min-h-11 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-surface"
          >
            Khôi phục dữ liệu mẫu
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tổng sản phẩm"
          value={String(products.length)}
          icon="✎"
        />
        <StatCard
          label="Tổng đơn hàng"
          value={String(orders.length)}
          icon="▣"
          note={`${pendingCount} đơn đang chờ xác nhận`}
        />
        <StatCard
          label="Tổng người dùng"
          value={String(users.length)}
          icon="☺"
        />
        <StatCard
          label="Tổng doanh thu"
          value={formatVND(getTotalRevenue(orders))}
          icon="₫"
          note="Chỉ tính các đơn đã giao hàng"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="rounded-xl border border-line bg-white p-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-navy">Doanh thu theo tháng</h3>
              <p className="text-sm text-ink-muted">
                Đơn đã giao, từ 28/09/2026 đến {formatDate(new Date().toISOString())}
              </p>
            </div>
            <p className="text-right">
              <span className="block text-sm text-ink-muted">Tổng trong giai đoạn</span>
              <strong className="text-xl text-primary">
                {formatVND(revenueByMonth.reduce((sum, item) => sum + item.revenue, 0))}
              </strong>
            </p>
          </div>
          <div className="mt-4">
            <RevenueChart data={revenueByMonth} />
          </div>
        </section>

        <section className="rounded-xl border border-line bg-white p-5">
          <h3 className="text-lg font-bold text-navy">Sản phẩm sắp hết hàng</h3>

          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">Tồn kho các sản phẩm đều ổn.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {lowStock.slice(0, 6).map((product) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <span className="min-w-0 truncate text-ink">{product.name}</span>
                  <span className="shrink-0 rounded-full bg-yellow-soft px-2.5 py-0.5 text-xs font-bold text-ink">
                    Còn {product.stock}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-line bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-navy">Sản phẩm bán chạy</h3>
          <Link
            href="/quan-tri/thong-ke"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Xem thống kê
          </Link>
        </div>
        {topProducts.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">Chưa có sản phẩm nào được bán.</p>
        ) : (
          <ol className="mt-4 divide-y divide-line">
            {topProducts.map((item, index) => (
              <li
                key={item.productId}
                className="flex items-center gap-3 py-2.5 text-sm"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <img
                  src={item.image}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-lg border border-line bg-white object-contain"
                />
                <span className="min-w-0 flex-1 truncate font-semibold text-ink">
                  {item.name}
                </span>
                <span className="shrink-0 text-ink-muted">
                  Đã bán{" "}
                  <strong className="text-primary">
                    {item.sold.toLocaleString("vi-VN")}
                  </strong>
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-navy">Đơn hàng gần đây</h3>
          <Link
            href="/quan-tri/don-hang"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Xem tất cả
          </Link>
        </div>

        <AdminTable
          columns={["Mã đơn", "Khách hàng", "Ngày đặt", "Tổng tiền", "Trạng thái"]}
          rowCount={recentOrders.length}
          emptyMessage="Chưa có đơn hàng nào."
        >
          {recentOrders.map((order) => (
            <tr key={order.id}>
              <td className="whitespace-nowrap px-4 py-3 font-semibold text-navy">
                {order.id}
              </td>
              <td className="px-4 py-3">{order.customer.fullName}</td>
              <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
                {formatDate(order.createdAt)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 font-semibold">
                {formatVND(order.total)}
              </td>
              <td className="px-4 py-3">
                <OrderStatusBadge status={order.status} />
              </td>
            </tr>
          ))}
        </AdminTable>
      </section>

      {confirmReset && (
        <ConfirmDialog
          title="Khôi phục dữ liệu mẫu"
          message="Toàn bộ sản phẩm, danh mục, đơn hàng và tài khoản sẽ được đưa về dữ liệu mẫu ban đầu. Bạn sẽ bị đăng xuất. Thao tác này không thể hoàn tác."
          confirmLabel="Khôi phục"
          danger
          onConfirm={handleReset}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </>
  );
}
