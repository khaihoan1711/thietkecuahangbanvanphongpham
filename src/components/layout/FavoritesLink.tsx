"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useCatalog } from "@/context/CatalogContext";
import { useFavorites } from "@/context/FavoritesContext";

// Biểu tượng trái tim ở đầu trang, cạnh giỏ hàng: mở trang sản phẩm yêu thích.
export default function FavoritesLink() {
  const { favoriteIds, isReady } = useFavorites();
  const { products } = useCatalog();
  // Chỉ đếm sản phẩm còn tồn tại (Admin có thể đã xóa sản phẩm)
  const count = favoriteIds.filter((id) =>
    products.some((product) => product.id === id),
  ).length;
  const showBadge = isReady && count > 0;

  return (
    <Link
      href="/yeu-thich"
      aria-label={
        showBadge ? `Sản phẩm yêu thích, ${count} sản phẩm` : "Sản phẩm yêu thích"
      }
      title="Sản phẩm yêu thích"
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-surface"
    >
      <Icon
        name="heart"
        size={24}
      />
      {showBadge && (
        <span
          aria-hidden="true"
          className="absolute right-0 top-0.5 h-5 min-w-5 rounded-full bg-red-500 px-1 text-center text-xs font-semibold leading-5 text-white"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
