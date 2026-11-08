"use client";

import { Fragment, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import CategoryForm from "@/components/admin/categories/CategoryForm";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import { useCatalog } from "@/context/CatalogContext";
import { useToast } from "@/context/ToastContext";
import { formatVND } from "@/lib/format";
import type { Category } from "@/types/store";

// Trang quản lý danh mục: thêm, sửa, xóa và xem sản phẩm thuộc từng danh mục.
export default function CategoriesAdminView() {
  const { categories, products, deleteCategory } = useCatalog();
  const { showToast } = useToast();
  // "new" = đang thêm mới, Category = đang sửa, null = đóng form
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  // Danh mục đang mở danh sách sản phẩm
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function handleDelete() {
    if (!deleting) {
      return;
    }

    const result = deleteCategory(deleting.id);

    if (result.ok) {
      showToast(`Đã xóa danh mục "${deleting.label}".`);
    } else {
      showToast(result.message, "error");
    }

    setDeleting(null);
  }

  return (
    <>
      <AdminPageHeader
        title="Quản lý danh mục"
        description="Danh mục hiển thị trên thanh menu và trang chủ của cửa hàng."
        action={
          <button
            type="button"
            onClick={() => setEditing("new")}
            className={`${btnBase} ${btnPrimary} min-h-11`}
          >
            + Thêm danh mục
          </button>
        }
      />

      <AdminTable
        columns={["Danh mục", "Mã (đường dẫn)", "Số sản phẩm", "Thao tác"]}
        rowCount={categories.length}
        emptyMessage="Chưa có danh mục nào."
      >
        {categories.map((category) => {
          const categoryProducts = products.filter(
            (product) => product.category === category.id,
          );
          const isExpanded = expandedId === category.id;

          return (
            <Fragment key={category.id}>
              <tr>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-lg text-primary"
                    >
                      {category.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-navy">{category.label}</p>
                      <p className="max-w-[280px] truncate text-xs text-ink-muted">
                        {category.short}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-muted">/danh-muc/{category.id}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() => setExpandedId(isExpanded ? null : category.id)}
                    className="min-h-10 font-semibold text-primary hover:underline"
                  >
                    {categoryProducts.length} sản phẩm {isExpanded ? "▴" : "▾"}
                  </button>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setEditing(category)}
                    className="min-h-10 px-2 font-semibold text-primary hover:underline"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(category)}
                    className="min-h-10 px-2 font-semibold text-red-600 hover:underline"
                  >
                    Xóa
                  </button>
                </td>
              </tr>

              {isExpanded && (
                <tr className="bg-surface/60">
                  <td
                    colSpan={4}
                    className="px-4 py-4"
                  >
                    {categoryProducts.length === 0 ? (
                      <p className="text-sm text-ink-muted">
                        Danh mục này chưa có sản phẩm.
                      </p>
                    ) : (
                      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {categoryProducts.map((product) => (
                          <li
                            key={product.id}
                            className="flex items-center gap-3 rounded-lg border border-line bg-white p-2"
                          >
                            <img
                              src={product.image}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded border border-line object-contain"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-ink">
                                {product.name}
                              </p>
                              <p className="text-xs text-ink-muted">
                                {formatVND(product.price)}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              )}
            </Fragment>
          );
        })}
      </AdminTable>

      {editing && (
        <CategoryForm
          category={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Xóa danh mục"
          message={`Bạn có chắc muốn xóa danh mục "${deleting.label}"? Danh mục còn sản phẩm sẽ không xóa được.`}
          confirmLabel="Xóa danh mục"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}
