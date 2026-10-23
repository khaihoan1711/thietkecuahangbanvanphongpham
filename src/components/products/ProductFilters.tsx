import { categoryInfo } from "@/data/products";
import type { ProductCategory } from "@/types/product";

const priceRanges = [
  { value: "all", label: "Tất cả mức giá" },
  { value: "under-50", label: "Dưới 50.000₫" },
  { value: "50-100", label: "50.000₫ – 100.000₫" },
  { value: "over-100", label: "Trên 100.000₫" },
];

export default function ProductFilters({
  category,
  brandOptions,
  brands,
  price,
  onCategoryChange,
  onToggleBrand,
  onPriceChange,
  onReset,
}: {
  category: ProductCategory | "all";
  brandOptions: string[];
  brands: string[];
  price: string;
  onCategoryChange: (category: ProductCategory | "all") => void;
  onToggleBrand: (brand: string) => void;
  onPriceChange: (price: string) => void;
  onReset: () => void;
}) {
  return (
    <aside
      aria-label="Bộ lọc sản phẩm"
      className="rounded-xl border border-line bg-white p-5"
    >
      <div>
        <h2 className="font-bold text-navy">Danh mục</h2>
        <div className="mt-3 space-y-1">
          <label className="flex min-h-10 cursor-pointer items-center gap-3 text-sm">
            <input
              type="radio"
              checked={category === "all"}
              onChange={() => onCategoryChange("all")}
              className="h-4 w-4 accent-primary"
            />{" "}
            Tất cả sản phẩm
          </label>
          {(
            Object.entries(categoryInfo) as [
              ProductCategory,
              (typeof categoryInfo)[ProductCategory],
            ][]
          ).map(([key, info]) => (
            <label
              key={key}
              className="flex min-h-10 cursor-pointer items-center gap-3 text-sm"
            >
              <input
                type="radio"
                checked={category === key}
                onChange={() => onCategoryChange(key)}
                className="h-4 w-4 accent-primary"
              />{" "}
              {info.label}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-line pt-5">
        <h2 className="font-bold text-navy">Thương hiệu</h2>
        <div className="mt-3 space-y-1">
          {brandOptions.map((brand) => (
            <label
              key={brand}
              className="flex min-h-10 cursor-pointer items-center gap-3 text-sm"
            >
              <input
                type="checkbox"
                checked={brands.includes(brand)}
                onChange={() => onToggleBrand(brand)}
                className="h-4 w-4 accent-primary"
              />{" "}
              {brand}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-line pt-5">
        <h2 className="font-bold text-navy">Khoảng giá</h2>
        <div className="mt-3 space-y-1">
          {priceRanges.map((range) => (
            <label
              key={range.value}
              className="flex min-h-10 cursor-pointer items-center gap-3 text-sm"
            >
              <input
                type="radio"
                checked={price === range.value}
                onChange={() => onPriceChange(range.value)}
                className="h-4 w-4 accent-primary"
              />{" "}
              {range.label}
            </label>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-6 w-full rounded-lg border border-line px-4 py-2.5 text-sm font-bold text-primary hover:border-primary hover:bg-primary-soft"
      >
        Xóa bộ lọc
      </button>
    </aside>
  );
}
