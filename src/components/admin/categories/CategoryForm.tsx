"use client";

import { useState } from "react";
import Field from "@/components/ui/Field";
import Modal from "@/components/ui/Modal";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import { useCatalog } from "@/context/CatalogContext";
import { useToast } from "@/context/ToastContext";
import { uniqueSlug } from "@/lib/slug";
import type { Category } from "@/types/store";

type Errors = { label?: string; short?: string; icon?: string };

// Biểu tượng mặc định khi Admin không nhập
const DEFAULT_ICON = "◆";

// Form thêm mới (category là undefined) hoặc chỉnh sửa danh mục.
export default function CategoryForm({
  category,
  onClose,
}: {
  category?: Category;
  onClose: () => void;
}) {
  const { categories, saveCategory } = useCatalog();
  const { showToast } = useToast();
  const [label, setLabel] = useState(category?.label ?? "");
  const [short, setShort] = useState(category?.short ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "");
  const [errors, setErrors] = useState<Errors>({});

  const isEditing = Boolean(category);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const newErrors: Errors = {};
    const labelTaken = categories.some(
      (item) =>
        item.id !== category?.id &&
        item.label.toLowerCase() === label.trim().toLowerCase(),
    );

    if (label.trim() === "") {
      newErrors.label = "Vui lòng nhập tên danh mục";
    } else if (labelTaken) {
      newErrors.label = "Tên danh mục này đã tồn tại";
    }

    if (short.trim() === "") {
      newErrors.short = "Vui lòng nhập mô tả ngắn";
    }

    if (icon.trim().length > 2) {
      newErrors.icon = "Biểu tượng tối đa 2 ký tự";
    }

    setErrors(newErrors);

    if (newErrors.label) {
      document.getElementById("category-label")?.focus();
      return;
    }

    if (newErrors.short) {
      document.getElementById("category-short")?.focus();
      return;
    }

    if (newErrors.icon) {
      document.getElementById("category-icon")?.focus();
      return;
    }

    saveCategory({
      // Mã danh mục dùng trong đường dẫn nên không đổi khi sửa.
      id:
        category?.id ??
        uniqueSlug(
          label,
          categories.map((item) => item.id),
        ),
      label: label.trim(),
      short: short.trim(),
      icon: icon.trim() || DEFAULT_ICON,
    });

    showToast(isEditing ? "Đã cập nhật danh mục." : "Đã thêm danh mục mới.");
    onClose();
  }

  return (
    <Modal
      title={isEditing ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
      onClose={onClose}
      size="sm"
    >
      <form
        noValidate
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <Field
          id="category-label"
          label="Tên danh mục"
          value={label}
          error={errors.label}
          onChange={(value) => {
            setLabel(value);
            setErrors({ ...errors, label: undefined });
          }}
        />
        <Field
          id="category-short"
          label="Mô tả ngắn"
          value={short}
          error={errors.short}
          placeholder="Ví dụ: Bút bi, bút gel, bút chì"
          onChange={(value) => {
            setShort(value);
            setErrors({ ...errors, short: undefined });
          }}
        />
        <Field
          id="category-icon"
          label="Biểu tượng (không bắt buộc)"
          value={icon}
          error={errors.icon}
          hint="Một ký tự hoặc emoji hiển thị ở trang chủ."
          onChange={(value) => {
            setIcon(value);
            setErrors({ ...errors, icon: undefined });
          }}
        />

        <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-5">
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 rounded-lg border border-line px-6 font-semibold text-ink hover:bg-surface"
          >
            Hủy
          </button>
          <button
            type="submit"
            className={`${btnBase} ${btnPrimary}`}
          >
            {isEditing ? "Lưu thay đổi" : "Thêm danh mục"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
