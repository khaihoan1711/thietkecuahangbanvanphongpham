"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import Icon from "@/components/ui/Icon";
import type { Product } from "@/types/product";

const priceRanges = [
  { value: "under-50", label: "Dưới 50.000₫", min: 0, max: 50000 },
  { value: "50-100", label: "50.000₫ - 100.000₫", min: 50000, max: 100000 },
  { value: "100-200", label: "100.000₫ - 200.000₫", min: 100000, max: 200000 },
  { value: "over-200", label: "Trên 200.000₫", min: 200000, max: Infinity },
];

const sortOptions = [
  { value: "featured", label: "Nổi bật" },
  { value: "price-asc", label: "Giá thấp đến cao" },
  { value: "price-desc", label: "Giá cao đến thấp" },
  { value: "name", label: "Tên A-Z" },
];

function simplify(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
}
function toggle(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function FilterCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details
      open
      className="group rounded-lg bg-white shadow-soft"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between border-b border-line px-5 py-4 text-lg text-ink [&::-webkit-details-marker]:hidden">
        {title}
        <Icon
          name="chevron"
          size={18}
          className="rotate-90 text-ink-muted transition-transform group-open:-rotate-90"
        />
      </summary>
      <div className="space-y-1 px-5 py-3">{children}</div>
    </details>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex min-h-10 cursor-pointer items-center gap-3 text-[15px] text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 rounded border-line accent-primary"
      />
      {label}
    </label>
  );
}

export default function CategoryListing({
  products,
  initialSearch = "",
  bannerSrc,
  bannerAlt,
}: {
  products: Product[];
  initialSearch?: string;
  bannerSrc: string;
  bannerAlt: string;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [brands, setBrands] = useState<string[]>([]);
  const [prices, setPrices] = useState<string[]>([]);
  const [sort, setSort] = useState("featured");

  const brandOptions = Array.from(new Set(products.map((p) => p.brand))).sort();
  const needle = simplify(search.trim());

  const visible = products.filter((product) => {
    const haystack = simplify(
      `${product.name} ${product.brand} ${product.sku} ${product.shortDescription}`,
    );
    const inPrice =
      prices.length === 0 ||
      priceRanges.some(
        (range) =>
          prices.includes(range.value) &&
          product.price >= range.min &&
          product.price < range.max,
      );
    return (
      (!needle || haystack.includes(needle)) &&
      (brands.length === 0 || brands.includes(product.brand)) &&
      inPrice
    );
  });

  if (sort === "price-asc") visible.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") visible.sort((a, b) => b.price - a.price);
  if (sort === "name") visible.sort((a, b) => a.name.localeCompare(b.name, "vi"));
  if (sort === "featured")
    visible.sort((a, b) => Number(Boolean(b.isHot)) - Number(Boolean(a.isHot)));

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside
        aria-label="Bộ lọc sản phẩm"
        className="space-y-4"
      >
        <div className="flex items-center gap-3 rounded-lg bg-white px-4 shadow-soft">
          <label
            htmlFor="category-sort"
            className="shrink-0 text-sm font-semibold text-ink-muted"
          >
            Sắp xếp
          </label>
          <select
            id="category-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="h-12 w-full cursor-pointer bg-transparent text-[15px] text-ink outline-none"
          >
            {sortOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <FilterCard title="Nhãn hàng">
          {brandOptions.map((brand) => (
            <CheckRow
              key={brand}
              label={brand}
              checked={brands.includes(brand)}
              onChange={() => setBrands(toggle(brands, brand))}
            />
          ))}
        </FilterCard>

        <FilterCard title="Lọc giá">
          {priceRanges.map((range) => (
            <CheckRow
              key={range.value}
              label={range.label}
              checked={prices.includes(range.value)}
              onChange={() => setPrices(toggle(prices, range.value))}
            />
          ))}
        </FilterCard>
      </aside>

      <section
        aria-label="Danh sách sản phẩm"
        className="min-w-0"
      >
        <img
          src={bannerSrc}
          alt={bannerAlt}
          className="aspect-[2.36/1] w-full rounded-xl object-cover"
        />

        {(search || brands.length > 0 || prices.length > 0) && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="rounded-full bg-white px-3 py-1.5 font-semibold text-primary shadow-soft hover:bg-primary-soft"
              >
                Từ khóa: {search} ✕
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setBrands([]);
                setPrices([]);
              }}
              className="rounded-full px-3 py-1.5 font-semibold text-ink-muted hover:text-primary"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}

        <p className="mb-4 mt-5 text-sm text-ink-muted">
          Tìm thấy <strong className="text-ink">{visible.length}</strong> sản phẩm
        </p>

        {visible.length === 0 ? (
          <div className="rounded-xl bg-white px-6 py-16 text-center text-ink-muted shadow-soft">
            Không có sản phẩm phù hợp. Hãy bỏ bớt bộ lọc hoặc{" "}
            <Link
              href="/san-pham"
              className="font-semibold text-primary hover:underline"
            >
              xem tất cả sản phẩm
            </Link>
            .
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
