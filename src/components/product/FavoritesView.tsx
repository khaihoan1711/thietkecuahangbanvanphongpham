"use client";

import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import { useCatalog } from "@/context/CatalogContext";
import { useFavorites } from "@/context/FavoritesContext";
import type { Product } from "@/types/product";

// Danh sách sản phẩm yêu thích (sản phẩm vừa thêm đứng đầu).
export default function FavoritesView() {
  const { favoriteIds, isReady } = useFavorites();
  const { products, isReady: catalogReady } = useCatalog();

  if (!isReady || !catalogReady) {
    return <p className="py-16 text-ink-muted">Đang tải sản phẩm yêu thích…</p>;
  }

  // Bỏ qua sản phẩm đã bị Admin xóa.
  const favorites = favoriteIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));

  if (favorites.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-white px-6 py-16 text-center">
        <p className="font-display text-2xl font-semibold text-ink">
          Bạn chưa có sản phẩm yêu thích
        </p>
        <p className="mt-2 text-ink-muted">
          Bấm vào biểu tượng trái tim ở góc mỗi sản phẩm để lưu lại.
        </p>
        <Link
          href="/san-pham"
          className={`${btnBase} ${btnPrimary} mt-6`}
        >
          Xem sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="mb-5 text-ink-muted">{favorites.length} sản phẩm</p>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
        {favorites.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </>
  );
}
