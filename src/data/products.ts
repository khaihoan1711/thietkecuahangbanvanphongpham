import pens from "./pens.json";
import otherProducts from "./other-products.json";
import type { Product, ProductCategory } from "@/types/product";

export const categoryInfo: Record<
  ProductCategory,
  { label: string; short: string; icon: string }
> = {
  but: { label: "Bút viết", short: "Bút bi, bút gel, bút chì, highlight", icon: "✎" },
  "vo-so": { label: "Vở & Sổ", short: "Vở học sinh, sổ tay, sổ lò xo", icon: "▤" },
  giay: { label: "Giấy văn phòng", short: "Giấy in, giấy note, giấy màu", icon: "▱" },
  "dung-cu": { label: "Dụng cụ", short: "Kéo, thước, dập ghim, compa", icon: "⌁" },
  "hoa-pham": { label: "Họa phẩm", short: "Màu vẽ, cọ, sáp màu", icon: "◉" },
  balo: { label: "Balo & Hộp bút", short: "Balo, túi bút, phụ kiện", icon: "▣" },
};

// Dữ liệu được dùng chung cho các trang của cửa hàng.
export const allProducts: Product[] = [
  ...pens.map((product): Product => ({ ...product, category: "but" })),
  ...otherProducts.map(
    (product): Product => ({
      ...product,
      category: product.category as ProductCategory,
    }),
  ),
];

export const featuredProducts = allProducts
  .filter((product) => product.isHot)
  .slice(0, 8);
export const newProducts = allProducts.filter((product) => product.isNew).slice(0, 8);
export const bestSellers = [...allProducts]
  .filter((product) => product.isBestSeller || product.rank)
  .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));

export function getProductsByCategory(category: ProductCategory, count = 8) {
  return allProducts.filter((product) => product.category === category).slice(0, count);
}

export function getProductById(id: string) {
  return allProducts.find((product) => product.id === id);
}

export function getRelatedProducts(product: Product, count = 4) {
  const sameCategory = allProducts.filter(
    (item) => item.id !== product.id && item.category === product.category,
  );
  const rest = allProducts.filter(
    (item) => item.id !== product.id && item.category !== product.category,
  );
  return [...sameCategory, ...rest].slice(0, count);
}
