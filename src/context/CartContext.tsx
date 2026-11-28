"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCatalog } from "@/context/CatalogContext";
import { useToast } from "@/context/ToastContext";
import { readJson, STORAGE_KEYS, writeJson } from "@/lib/storage";
import {
  cartKey,
  normalizeCart,
  putCartItem,
  selectionFor,
} from "@/lib/product-options";
import type { CartItem, ProductSelection } from "@/types/product";

type CartContextValue = {
  items: CartItem[];
  totalQuantity: number;
  isReady: boolean;
  // Trả về false nếu không thêm được (tài khoản quản trị viên không được mua hàng)
  addToCart: (id: string, quantity: number, selection?: ProductSelection) => boolean;
  setQuantity: (id: string, quantity: number, selection?: ProductSelection) => void;
  removeFromCart: (id: string, selection?: ProductSelection) => void;
  // Xóa toàn bộ giỏ hàng (dùng sau khi đặt hàng thành công)
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

// Thông báo khi tài khoản quản trị viên cố mua hàng.
export const ADMIN_CANNOT_BUY =
  "Tài khoản quản trị viên không thể mua hàng. Vui lòng dùng tài khoản khách hàng.";

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Sản phẩm lấy từ kho dữ liệu chung, nên Admin sửa giá hoặc tồn kho thì giỏ hàng cũng cập nhật.
  const { products, isReady: catalogReady, getProduct } = useCatalog();
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Đọc giỏ hàng sau khi danh sách sản phẩm đã sẵn sàng.
  useEffect(() => {
    if (!catalogReady) {
      return;
    }

    const saved = readJson<unknown>(STORAGE_KEYS.cart, []);

    setItems(normalizeCart(saved, products));
    setIsReady(true);
    // Chỉ đọc một lần khi dữ liệu sản phẩm vừa tải xong.
  }, [catalogReady]);

  // Chỉ lưu sau khi đã đọc dữ liệu cũ để tránh ghi đè giỏ hàng.
  useEffect(() => {
    if (!isReady) {
      return;
    }

    writeJson(STORAGE_KEYS.cart, items);
  }, [items, isReady]);

  function updateCart(
    id: string,
    quantity: number,
    selection: ProductSelection,
    add: boolean,
  ) {
    const product = getProduct(id);

    if (!product) {
      return;
    }

    setItems((current) => putCartItem(current, product, quantity, selection, add));
  }

  function addToCart(id: string, quantity: number, selection: ProductSelection = {}) {
    if (isAdmin) {
      showToast(ADMIN_CANNOT_BUY, "error");
      return false;
    }

    const product = getProduct(id);

    if (!product) {
      return false;
    }

    // Số lượng đang có trong giỏ của đúng loại (đơn vị/màu) này, trước và sau khi thêm.
    const key = cartKey({ productId: id, ...selectionFor(product, selection) });
    const before = items.find((item) => cartKey(item) === key)?.quantity ?? 0;
    const next = putCartItem(items, product, quantity, selection, true);
    const after = next.find((item) => cartKey(item) === key)?.quantity ?? 0;

    if (after <= before) {
      showToast(
        product.stock === 0
          ? "Sản phẩm đã hết hàng."
          : "Số lượng trong giỏ đã bằng số hàng còn lại trong kho.",
        "error",
      );
      return false;
    }

    setItems(next);
    return true;
  }

  function setQuantity(id: string, quantity: number, selection: ProductSelection = {}) {
    updateCart(id, quantity, selection, false);
  }

  function removeFromCart(id: string, selection: ProductSelection = {}) {
    const product = getProduct(id);

    if (!product) {
      return;
    }

    const key = cartKey({ productId: id, ...selectionFor(product, selection) });

    setItems((current) => current.filter((item) => cartKey(item) !== key));
  }

  function clearCart() {
    setItems([]);
  }

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalQuantity,
        isReady,
        addToCart,
        setQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart phải nằm trong CartProvider.");
  }

  return context;
}
