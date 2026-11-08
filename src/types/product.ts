export type Region = "bac" | "trung" | "nam";

// Mã danh mục (ví dụ "but", "vo-so"). Admin có thể thêm danh mục mới nên đây là chuỗi tự do.
export type ProductCategory = string;

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  pack: string;
  category: ProductCategory;
  price: number;
  oldPrice?: number;
  shortDescription: string;
  description: string[];
  image: string;
  images?: string[];
  alt: string;
  rank?: number;
  isNew?: boolean;
  isHot?: boolean;
  isBestSeller?: boolean;
  stock?: number;
  units?: {
    id: string;
    label: string;
    count: number;
    price: number;
    oldPrice?: number;
  }[];
  colors?: { id: string; label: string; hex: string; image: string }[];
}

export type ProductSelection = { unitId?: string; colorId?: string };
export type CartItem = ProductSelection & { productId: string; quantity: number };
