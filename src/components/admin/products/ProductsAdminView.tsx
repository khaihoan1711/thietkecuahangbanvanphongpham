"use client";

import { useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import ProductForm from "@/components/admin/products/ProductForm";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import { useCatalog } from "@/context/CatalogContext";
import { useToast } from "@/context/ToastContext";
import { formatVND } from "@/lib/format";
import type { Product } from "@/types/product";

// Từ mức này trở xuống được coi là sắp hết hàng
const LOW_STOCK_LIMIT = 20;

type StockFilter = "all" | "low" | "out" | "unlimited";

const stockFilters: { value: StockFilter; label: string }[] = [
  { value: "all", label: "Mọi tồn kho" },
  { value: "low", label: "Sắp hết hàng" },
  { value: "out", label: "Hết hàng" },
  { value: "unlimited", label: "Không giới hạn" },
];

const filterStyle =
  "h-11 rounded-lg border border-line bg-white px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-soft";

function simplify(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
}

function matchesStock(product: Product, filter: StockFilter) {
  if (filter === "unlimited") return product.stock === undefined;
  if (filter === "out") return product.stock === 0;
  if (filter === "low") {
    return (
      product.stock !== undefined &&
      product.stock > 0 &&
      product.stock <= LOW_STOCK_LIMIT
    );
  }

  return true;
}

// Trang quản lý sản phẩm: xem, tìm kiếm, lọc, thêm, sửa, xóa.
// Mọi thay đổi được lưu vào LocalStorage và hiển thị ngay ở trang bán hàng.
export default function ProductsAdminView() {
  const { products, categories, getCategoryLabel, deleteProduct } = useCatalog();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  // "new" = đang thêm mới, Product = đang sửa, null = đóng form
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const needle = simplify(search.trim());
  const visible = products.filter(
    (product) =>
      (!needle ||
        simplify(`${product.name} ${product.sku} ${product.brand}`).includes(needle)) &&
      (categoryFilter === "all" || product.category === categoryFilter) &&
      matchesStock(product, stockFilter),
  );

  function handleDelete() {
    if (!deleting) {
      return;
    }

    deleteProduct(deleting.id);
    showToast(`Đã xóa sản phẩm "${deleting.name}".`);
    setDeleting(null);
  }

  return (
    <>
      <AdminPageHeader
        title="Quản lý sản phẩm"
        description="Thêm, sửa, xóa sản phẩm. Thay đổi hiển thị ngay ở trang bán hàng."
        action={
          <button
            type="button"
            onClick={() => setEditing("new")}
            className={`${btnBase} ${btnPrimary} min-h-11`}
          >
            + Thêm sản phẩm
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="search"
          aria-label="Tìm sản phẩm"
          placeholder="Tìm theo tên, mã, thương hiệu..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className={`${filterStyle} min-w-[220px] flex-1`}
        />
        <select
          aria-label="Lọc theo danh mục"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className={filterStyle}
        >
          <option value="all">Tất cả danh mục</option>
          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Lọc theo tồn kho"
          value={stockFilter}
          onChange={(event) => setStockFilter(event.target.value as StockFilter)}
          className={filterStyle}
        >
          {stockFilters.map((filter) => (
            <option
              key={filter.value}
              value={filter.value}
            >
              {filter.label}
            </option>
          ))}
        </select>
      </div>

      <p className="mb-3 text-sm text-ink-muted">
        Hiển thị <strong className="text-ink">{visible.length}</strong> /{" "}
        {products.length} sản phẩm
      </p>

      <AdminTable
        columns={["Sản phẩm", "Danh mục", "Thương hiệu", "Giá", "Tồn kho", "Thao tác"]}
        rowCount={visible.length}
        emptyMessage="Không tìm thấy sản phẩm phù hợp."
      >
        {visible.map((product) => (
          <tr key={product.id}>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <img
                  src={product.image}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-lg border border-line bg-white object-contain"
                />
                <div className="min-w-0">
                  <p className="max-w-[260px] truncate font-semibold text-navy">
                    {product.name}
                  </p>
                  <p className="text-xs text-ink-muted">{product.sku}</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3">{getCategoryLabel(product.category)}</td>
            <td className="px-4 py-3">{product.brand}</td>
            <td className="whitespace-nowrap px-4 py-3">
              <p className="font-semibold">{formatVND(product.price)}</p>
              {product.oldPrice && (
                <p className="text-xs text-ink-muted line-through">
                  {formatVND(product.oldPrice)}
                </p>
              )}
            </td>
            <td className="whitespace-nowrap px-4 py-3">
              {product.stock === undefined ? (
                <span className="text-ink-muted">Không giới hạn</span>
              ) : (
                <span
                  className={
                    product.stock <= LOW_STOCK_LIMIT
                      ? "font-bold text-red-600"
                      : "font-semibold"
                  }
                >
                  {product.stock}
                </span>
              )}
            </td>
            <td className="whitespace-nowrap px-4 py-3">
              <button
                type="button"
                onClick={() => setEditing(product)}
                className="min-h-10 px-2 font-semibold text-primary hover:underline"
              >
                Sửa
              </button>
              <button
                type="button"
                onClick={() => setDeleting(product)}
                className="min-h-10 px-2 font-semibold text-red-600 hover:underline"
              >
                Xóa
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>

      {editing && (
        <ProductForm
          product={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Xóa sản phẩm"
          message={`Bạn có chắc muốn xóa "${deleting.name}"? Sản phẩm sẽ biến mất khỏi trang bán hàng. Thao tác này không thể hoàn tác.`}
          confirmLabel="Xóa sản phẩm"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}
