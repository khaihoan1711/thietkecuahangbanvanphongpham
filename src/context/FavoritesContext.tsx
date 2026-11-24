"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useToast } from "@/context/ToastContext";
import { usePersistentState } from "@/hooks/usePersistentState";
import { STORAGE_KEYS } from "@/lib/storage";

type FavoritesContextValue = {
  // Mã các sản phẩm yêu thích, sản phẩm vừa thêm đứng đầu
  favoriteIds: string[];
  isReady: boolean;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

// Danh sách sản phẩm yêu thích, lưu trong LocalStorage của trình duyệt.
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [favoriteIds, setFavoriteIds, isReady] = usePersistentState<string[]>(
    STORAGE_KEYS.favorites,
    [],
    (value) => Array.isArray(value) && value.every((id) => typeof id === "string"),
  );

  function isFavorite(productId: string) {
    return favoriteIds.includes(productId);
  }

  function toggleFavorite(productId: string) {
    if (isFavorite(productId)) {
      setFavoriteIds((current) => current.filter((id) => id !== productId));
      showToast("Đã bỏ sản phẩm khỏi danh sách yêu thích.");
    } else {
      setFavoriteIds((current) => [productId, ...current]);
      showToast("Đã thêm sản phẩm vào danh sách yêu thích.");
    }
  }

  return (
    <FavoritesContext.Provider
      value={{ favoriteIds, isReady, isFavorite, toggleFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites phải được dùng bên trong FavoritesProvider.");
  }

  return context;
}
