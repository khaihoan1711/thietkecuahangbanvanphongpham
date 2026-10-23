"use client";

import { useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import ProductFilters from "@/components/products/ProductFilters";
import ProductToolbar from "@/components/products/ProductToolbar";
import type { Product, ProductCategory } from "@/types/product";

function simplify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}
function toggle<T>(list: T[], value: T) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}
function matchesPrice(price: number, range: string) {
  if (range === "under-50") return price < 50000;
  if (range === "50-100") return price >= 50000 && price <= 100000;
  if (range === "over-100") return price > 100000;
  return true;
}

export default function ProductListing({
  products,
  initialSearch = "",
  initialCategory = "all",
}: {
  products: Product[];
  initialSearch?: string;
  initialCategory?: ProductCategory | "all";
}) {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState<ProductCategory | "all">(initialCategory);
  const [brands, setBrands] = useState<string[]>([]);
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("featured");
  const brandOptions = Array.from(
    new Set(products.map((product) => product.brand)),
  ).sort();

  const filtered = products.filter((product) => {
    const needle = simplify(search.trim());
    const haystack = simplify(
      `${product.name} ${product.brand} ${product.sku} ${product.shortDescription}`,
    );
    return (
      (!needle || haystack.includes(needle)) &&
      (category === "all" || product.category === category) &&
      (brands.length === 0 || brands.includes(product.brand)) &&
      matchesPrice(product.price, price)
    );
  });

  const visible = [...filtered];
  if (sort === "price-asc") visible.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") visible.sort((a, b) => b.price - a.price);
  if (sort === "name") visible.sort((a, b) => a.name.localeCompare(b.name, "vi"));
  if (sort === "featured")
    visible.sort((a, b) => Number(Boolean(b.isHot)) - Number(Boolean(a.isHot)));

  function resetFilters() {
    setSearch("");
    setCategory("all");
    setBrands([]);
    setPrice("all");
  }

  return (
    <div className="grid items-start gap-7 lg:grid-cols-[250px_1fr]">
      <ProductFilters
        category={category}
        brandOptions={brandOptions}
        brands={brands}
        price={price}
        onCategoryChange={setCategory}
        onToggleBrand={(brand) => setBrands(toggle(brands, brand))}
        onPriceChange={setPrice}
        onReset={resetFilters}
      />
      <section aria-label="Danh sách sản phẩm">
        <ProductToolbar
          total={visible.length}
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
        />
        {visible.length === 0 ? (
          <div className="rounded-xl border border-line bg-surface px-6 py-16 text-center text-ink-muted">
            Không tìm thấy sản phẩm phù hợp. Hãy thử từ khóa hoặc bộ lọc khác.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
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
