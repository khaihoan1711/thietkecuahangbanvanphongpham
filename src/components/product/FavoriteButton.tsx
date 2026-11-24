"use client";

import Icon from "@/components/ui/Icon";
import { useFavorites } from "@/context/FavoritesContext";

// Nút trái tim ở góc ảnh sản phẩm: bấm để thêm hoặc bỏ khỏi danh sách yêu thích.
export default function FavoriteButton({
  productId,
  productName,
  className = "",
}: {
  productId: string;
  productName: string;
  className?: string;
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(productId);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={
        active
          ? `Bỏ ${productName} khỏi danh sách yêu thích`
          : `Thêm ${productName} vào danh sách yêu thích`
      }
      title={active ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
      onClick={() => toggleFavorite(productId)}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-soft transition hover:scale-110 ${
        active ? "text-red-500" : "text-ink-muted hover:text-red-500"
      } ${className}`}
    >
      <Icon
        name="heart"
        size={19}
        className={active ? "fill-current" : ""}
      />
    </button>
  );
}
