import pens from "./pens.json";
import otherProducts from "./other-products.json";
import type { Product } from "@/types/product";
import type { Category } from "@/types/store";

// Danh mục mẫu. Sau khi website chạy, danh mục được đọc từ LocalStorage
// và Admin có thể thêm, sửa, xóa (xem CatalogContext).
export const seedCategories: Category[] = [
  {
    id: "but",
    label: "Bút viết",
    short: "Bút bi, bút gel, bút chì, highlight",
    icon: "✎",
  },
  { id: "vo-so", label: "Vở & Sổ", short: "Vở học sinh, sổ tay, sổ lò xo", icon: "▤" },
  {
    id: "giay",
    label: "Giấy văn phòng",
    short: "Giấy in, giấy note, giấy màu",
    icon: "▱",
  },
  { id: "dung-cu", label: "Dụng cụ", short: "Kéo, thước, dập ghim, compa", icon: "⌁" },
  { id: "hoa-pham", label: "Họa phẩm", short: "Màu vẽ, cọ, sáp màu", icon: "◉" },
  { id: "balo", label: "Balo & Hộp bút", short: "Balo, túi bút, phụ kiện", icon: "▣" },
];

// Sản phẩm mẫu. Sau khi website chạy, sản phẩm được đọc từ LocalStorage
// và Admin có thể thêm, sửa, xóa (xem CatalogContext).
export const seedProducts: Product[] = [
  ...pens.map((product): Product => ({ ...product, category: "but" })),
  ...otherProducts.map((product): Product => ({ ...product })),
];

// ---------- Các hàm lọc sản phẩm (nhận danh sách sản phẩm làm tham số) ----------

export function getFeaturedProducts(products: Product[], count = 8) {
  return products.filter((product) => product.isHot).slice(0, count);
}

export function getNewProducts(products: Product[], count = 8) {
  return products.filter((product) => product.isNew).slice(0, count);
}

export function getBestSellers(products: Product[]) {
  return products
    .filter((product) => product.isBestSeller || product.rank)
    .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
}

export function getSaleProducts(products: Product[]) {
  return products.filter(
    (product) => product.oldPrice && product.oldPrice > product.price,
  );
}

export function getProductsByCategory(
  products: Product[],
  category: string,
  count = 8,
) {
  return products.filter((product) => product.category === category).slice(0, count);
}

export function getRelatedProducts(products: Product[], product: Product, count = 4) {
  const sameCategory = products.filter(
    (item) => item.id !== product.id && item.category === product.category,
  );
  const rest = products.filter(
    (item) => item.id !== product.id && item.category !== product.category,
  );

  return [...sameCategory, ...rest].slice(0, count);
}
