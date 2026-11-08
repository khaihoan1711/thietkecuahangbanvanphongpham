"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { seedCategories, seedProducts } from "@/data/products";
import { STORAGE_KEYS } from "@/lib/storage";
import type { Product } from "@/types/product";
import type { ActionResult, Category } from "@/types/store";

type CatalogContextValue = {
  products: Product[];
  categories: Category[];
  isReady: boolean;
  getProduct: (id: string) => Product | undefined;
  getCategory: (id: string) => Category | undefined;
  // Tên danh mục để hiển thị. Nếu danh mục đã bị xóa thì trả về chính mã đó.
  getCategoryLabel: (id: string) => string;
  // Thêm mới hoặc cập nhật (nếu mã sản phẩm đã tồn tại)
  saveProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  // Cộng hoặc trừ tồn kho (delta âm là trừ). Sản phẩm không theo dõi tồn kho thì bỏ qua.
  adjustStock: (productId: string, delta: number) => void;
  saveCategory: (category: Category) => void;
  // Không cho xóa danh mục còn sản phẩm.
  deleteCategory: (id: string) => ActionResult;
  resetCatalog: () => void;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts, productsReady] = usePersistentState<Product[]>(
    STORAGE_KEYS.products,
    seedProducts,
    Array.isArray,
  );
  const [categories, setCategories, categoriesReady] = usePersistentState<Category[]>(
    STORAGE_KEYS.categories,
    seedCategories,
    Array.isArray,
  );

  function getProduct(id: string) {
    return products.find((product) => product.id === id);
  }

  function getCategory(id: string) {
    return categories.find((category) => category.id === id);
  }

  function getCategoryLabel(id: string) {
    return getCategory(id)?.label ?? id;
  }

  function saveProduct(product: Product) {
    setProducts((current) => {
      const exists = current.some((item) => item.id === product.id);

      if (exists) {
        return current.map((item) => (item.id === product.id ? product : item));
      }

      return [product, ...current];
    });
  }

  function deleteProduct(id: string) {
    setProducts((current) => current.filter((product) => product.id !== id));
  }

  function adjustStock(productId: string, delta: number) {
    setProducts((current) =>
      current.map((product) => {
        if (product.id !== productId || product.stock === undefined) {
          return product;
        }

        return { ...product, stock: Math.max(0, product.stock + delta) };
      }),
    );
  }

  function saveCategory(category: Category) {
    setCategories((current) => {
      const exists = current.some((item) => item.id === category.id);

      if (exists) {
        return current.map((item) => (item.id === category.id ? category : item));
      }

      return [...current, category];
    });
  }

  function deleteCategory(id: string): ActionResult {
    const productCount = products.filter((product) => product.category === id).length;

    if (productCount > 0) {
      return {
        ok: false,
        message: `Danh mục còn ${productCount} sản phẩm. Hãy chuyển hoặc xóa sản phẩm trước.`,
      };
    }

    setCategories((current) => current.filter((category) => category.id !== id));

    return { ok: true };
  }

  function resetCatalog() {
    setProducts(seedProducts);
    setCategories(seedCategories);
  }

  return (
    <CatalogContext.Provider
      value={{
        products,
        categories,
        isReady: productsReady && categoriesReady,
        getProduct,
        getCategory,
        getCategoryLabel,
        saveProduct,
        deleteProduct,
        adjustStock,
        saveCategory,
        deleteCategory,
        resetCatalog,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);

  if (!context) {
    throw new Error("useCatalog phải nằm trong CatalogProvider.");
  }

  return context;
}
