"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { allProducts, getProductById } from "@/data/products";
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
  addToCart: (id: string, quantity: number, selection?: ProductSelection) => void;
  setQuantity: (id: string, quantity: number, selection?: ProductSelection) => void;
  removeFromCart: (id: string, selection?: ProductSelection) => void;
};

const STORAGE_KEY = "khaihoanstatinery-cart";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Đọc giỏ hàng sau khi trình duyệt tải xong.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) ?? "[]";
      setItems(normalizeCart(JSON.parse(saved), allProducts));
    } catch {
      setItems([]);
    }

    setIsReady(true);
  }, []);

  // Chỉ lưu sau khi đã đọc dữ liệu cũ để tránh ghi đè giỏ hàng.
  useEffect(() => {
    if (!isReady) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Giỏ hàng vẫn dùng được khi trình duyệt không cho phép lưu.
    }
  }, [items, isReady]);

  function updateCart(
    id: string,
    quantity: number,
    selection: ProductSelection,
    add: boolean,
  ) {
    const product = getProductById(id);
    if (!product) return;

    setItems((current) => putCartItem(current, product, quantity, selection, add));
  }

  function addToCart(id: string, quantity: number, selection: ProductSelection = {}) {
    updateCart(id, quantity, selection, true);
  }

  function setQuantity(id: string, quantity: number, selection: ProductSelection = {}) {
    updateCart(id, quantity, selection, false);
  }

  function removeFromCart(id: string, selection: ProductSelection = {}) {
    const product = getProductById(id);
    if (!product) return;

    const key = cartKey({ productId: id, ...selectionFor(product, selection) });
    setItems((current) => current.filter((item) => cartKey(item) !== key));
  }

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, totalQuantity, isReady, addToCart, setQuantity, removeFromCart }}
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
