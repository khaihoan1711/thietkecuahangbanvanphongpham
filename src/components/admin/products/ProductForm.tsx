"use client";

import { useState } from "react";
import Field, { SelectField, TextAreaField } from "@/components/ui/Field";
import Modal from "@/components/ui/Modal";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import { useCatalog } from "@/context/CatalogContext";
import { useToast } from "@/context/ToastContext";
import { fileToDataUrl } from "@/lib/image";
import { uniqueSlug } from "@/lib/slug";
import type { Product } from "@/types/product";

type FormValues = {
  name: string;
  sku: string;
  brand: string;
  category: string;
  pack: string;
  price: string;
  oldPrice: string;
  stock: string;
  shortDescription: string;
  description: string;
  image: string;
  isHot: boolean;
  isNew: boolean;
  isBestSeller: boolean;
};

type Errors = Partial<Record<keyof FormValues, string>>;

// Thứ tự kiểm tra cũng là thứ tự các ô trên form, nên lỗi đầu tiên cũng là ô đầu tiên.
const fieldOrder: (keyof FormValues)[] = [
  "name",
  "sku",
  "brand",
  "category",
  "pack",
  "price",
  "oldPrice",
  "stock",
  "shortDescription",
  "image",
];

// Sản phẩm có nhiều đơn vị (hộp, cây...) thì giá hiển thị là giá của đơn vị đầu tiên.
function toFormValues(
  product: Product | undefined,
  defaultCategory: string,
): FormValues {
  const firstUnit = product?.units?.[0];

  return {
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    brand: product?.brand ?? "",
    category: product?.category ?? defaultCategory,
    pack: product?.pack ?? "",
    price: String(firstUnit?.price ?? product?.price ?? ""),
    oldPrice: String((firstUnit ? firstUnit.oldPrice : product?.oldPrice) ?? ""),
    stock: product?.stock === undefined ? "" : String(product.stock),
    shortDescription: product?.shortDescription ?? "",
    description: product?.description.join("\n\n") ?? "",
    image: product?.image ?? "",
    isHot: product?.isHot ?? false,
    isNew: product?.isNew ?? false,
    isBestSeller: product?.isBestSeller ?? false,
  };
}

function isWholeNumber(text: string) {
  return /^\d+$/.test(text.trim());
}

// Form thêm mới (product là undefined) hoặc chỉnh sửa sản phẩm.
export default function ProductForm({
  product,
  onClose,
}: {
  product?: Product;
  onClose: () => void;
}) {
  const { products, categories, saveProduct } = useCatalog();
  const { showToast } = useToast();
  const [values, setValues] = useState<FormValues>(
    toFormValues(product, categories[0]?.id ?? ""),
  );
  const [errors, setErrors] = useState<Errors>({});
  const [isUploading, setIsUploading] = useState(false);

  const isEditing = Boolean(product);
  const isUploadedImage = values.image.startsWith("data:");

  function setField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate(): Errors {
    const result: Errors = {};
    const skuTaken = products.some(
      (item) =>
        item.id !== product?.id &&
        item.sku.toLowerCase() === values.sku.trim().toLowerCase(),
    );

    if (values.name.trim() === "") result.name = "Vui lòng nhập tên sản phẩm";

    if (values.sku.trim() === "") result.sku = "Vui lòng nhập mã sản phẩm";
    else if (skuTaken) result.sku = "Mã sản phẩm này đã tồn tại";

    if (values.brand.trim() === "") result.brand = "Vui lòng nhập thương hiệu";
    if (values.category === "") result.category = "Vui lòng chọn danh mục";
    if (values.pack.trim() === "")
      result.pack = "Vui lòng nhập quy cách (ví dụ: Cuốn, Hộp)";

    if (!isWholeNumber(values.price) || Number(values.price) <= 0) {
      result.price = "Giá phải là số nguyên lớn hơn 0";
    }

    if (values.oldPrice.trim() !== "") {
      if (!isWholeNumber(values.oldPrice)) {
        result.oldPrice = "Giá cũ phải là số nguyên";
      } else if (Number(values.oldPrice) <= Number(values.price)) {
        result.oldPrice = "Giá cũ phải lớn hơn giá bán";
      }
    }

    if (values.stock.trim() !== "" && !isWholeNumber(values.stock)) {
      result.stock = "Số lượng phải là số nguyên không âm";
    }

    if (values.shortDescription.trim() === "") {
      result.shortDescription = "Vui lòng nhập mô tả ngắn";
    }

    if (values.image.trim() === "")
      result.image = "Vui lòng nhập đường dẫn hoặc tải ảnh lên";

    return result;
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    // Cho phép chọn lại đúng tệp đó lần sau.
    event.target.value = "";

    if (!file) {
      return;
    }

    setIsUploading(true);

    try {
      setField("image", await fileToDataUrl(file));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không tải được ảnh.";

      setErrors((current) => ({ ...current, image: message }));
    } finally {
      setIsUploading(false);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const newErrors = validate();

    setErrors(newErrors);

    const firstInvalid = fieldOrder.find((field) => newErrors[field]);

    if (firstInvalid) {
      document.getElementById(`product-${firstInvalid}`)?.focus();
      return;
    }

    const price = Number(values.price);
    const oldPrice =
      values.oldPrice.trim() === "" ? undefined : Number(values.oldPrice);
    const stock = values.stock.trim() === "" ? undefined : Number(values.stock);
    const description = values.description
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
    const shortDescription = values.shortDescription.trim();

    const saved: Product = {
      // Giữ nguyên các trường form không chỉnh sửa (ảnh phụ, màu sắc, xếp hạng...)
      ...product,
      id:
        product?.id ??
        uniqueSlug(
          values.name,
          products.map((item) => item.id),
        ),
      sku: values.sku.trim(),
      name: values.name.trim(),
      brand: values.brand.trim(),
      category: values.category,
      pack: values.pack.trim(),
      price,
      oldPrice,
      stock,
      shortDescription,
      description: description.length > 0 ? description : [shortDescription],
      image: values.image.trim(),
      alt: values.name.trim(),
      isHot: values.isHot,
      isNew: values.isNew,
      isBestSeller: values.isBestSeller,
      // Sản phẩm có nhiều đơn vị: cập nhật giá của đơn vị đầu tiên, các đơn vị khác giữ nguyên.
      units: product?.units?.map((unit, index) =>
        index === 0 ? { ...unit, price, oldPrice } : unit,
      ),
    };

    saveProduct(saved);
    showToast(isEditing ? "Đã cập nhật sản phẩm." : "Đã thêm sản phẩm mới.");
    onClose();
  }

  return (
    <Modal
      title={isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
      onClose={onClose}
      size="lg"
    >
      <form
        noValidate
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field
              id="product-name"
              label="Tên sản phẩm"
              value={values.name}
              error={errors.name}
              onChange={(value) => setField("name", value)}
            />
          </div>
          <Field
            id="product-sku"
            label="Mã sản phẩm (SKU)"
            value={values.sku}
            error={errors.sku}
            onChange={(value) => setField("sku", value)}
          />
          <Field
            id="product-brand"
            label="Thương hiệu"
            value={values.brand}
            error={errors.brand}
            onChange={(value) => setField("brand", value)}
          />
          <SelectField
            id="product-category"
            label="Danh mục"
            value={values.category}
            error={errors.category}
            options={categories.map((category) => ({
              value: category.id,
              label: category.label,
            }))}
            onChange={(value) => setField("category", value)}
          />
          <Field
            id="product-pack"
            label="Quy cách"
            value={values.pack}
            error={errors.pack}
            placeholder="Ví dụ: Cuốn, Hộp, 1 cây"
            onChange={(value) => setField("pack", value)}
          />
          <Field
            id="product-price"
            label="Giá bán (₫)"
            type="number"
            min={0}
            value={values.price}
            error={errors.price}
            hint={
              product?.units
                ? "Sản phẩm có nhiều đơn vị: đây là giá của đơn vị đầu tiên."
                : undefined
            }
            onChange={(value) => setField("price", value)}
          />
          <Field
            id="product-oldPrice"
            label="Giá cũ (₫, nếu đang giảm giá)"
            type="number"
            min={0}
            value={values.oldPrice}
            error={errors.oldPrice}
            onChange={(value) => setField("oldPrice", value)}
          />
          <Field
            id="product-stock"
            label="Số lượng tồn kho"
            type="number"
            min={0}
            value={values.stock}
            error={errors.stock}
            hint="Để trống nếu không giới hạn số lượng."
            onChange={(value) => setField("stock", value)}
          />
        </div>

        <TextAreaField
          id="product-shortDescription"
          label="Mô tả ngắn"
          rows={2}
          value={values.shortDescription}
          error={errors.shortDescription}
          onChange={(value) => setField("shortDescription", value)}
        />
        <TextAreaField
          id="product-description"
          label="Mô tả chi tiết"
          rows={4}
          value={values.description}
          hint="Cách nhau một dòng trống để tách thành các đoạn."
          onChange={(value) => setField("description", value)}
        />

        {/* Hình ảnh: nhập đường dẫn hoặc tải ảnh từ máy */}
        <fieldset className="space-y-3">
          <legend className="mb-2 font-medium text-ink">Hình ảnh</legend>

          <div className="flex flex-wrap items-start gap-4">
            {values.image ? (
              <img
                src={values.image}
                alt="Ảnh sản phẩm"
                className="h-24 w-24 shrink-0 rounded-lg border border-line bg-white object-contain"
              />
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-line text-xs text-ink-muted">
                Chưa có ảnh
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-3">
              {isUploadedImage ? (
                <p className="text-sm text-ink-muted">Đang dùng ảnh tải lên từ máy.</p>
              ) : (
                <Field
                  id="product-image"
                  label="Đường dẫn ảnh"
                  value={values.image}
                  error={errors.image}
                  placeholder="/images/stationery/ten-anh.svg hoặc https://..."
                  onChange={(value) => setField("image", value)}
                />
              )}

              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-primary px-4 text-sm font-semibold text-primary hover:bg-primary-soft">
                  {isUploading ? "Đang xử lý…" : "Tải ảnh từ máy"}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploading}
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>

                {isUploadedImage && (
                  <button
                    type="button"
                    onClick={() => setField("image", "")}
                    className="min-h-11 text-sm font-semibold text-ink-muted hover:text-ink"
                  >
                    Dùng đường dẫn thay thế
                  </button>
                )}
              </div>

              {isUploadedImage && errors.image && (
                <p className="text-sm text-sale">{errors.image}</p>
              )}
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 font-medium text-ink">Nhãn hiển thị</legend>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {(
              [
                ["isHot", "Nổi bật"],
                ["isNew", "Sản phẩm mới"],
                ["isBestSeller", "Bán chạy"],
              ] as const
            ).map(([field, label]) => (
              <label
                key={field}
                className="flex min-h-11 cursor-pointer items-center gap-3"
              >
                <input
                  type="checkbox"
                  checked={values[field]}
                  onChange={(event) => setField(field, event.target.checked)}
                  className="h-5 w-5 accent-primary"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {Object.values(errors).some(Boolean) && (
          <p
            role="alert"
            className="text-sm text-sale"
          >
            Vui lòng kiểm tra lại các thông tin được đánh dấu.
          </p>
        )}

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
            {isEditing ? "Lưu thay đổi" : "Thêm sản phẩm"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
