import type { ProductCategory } from "@/types/product";

export interface MenuLeaf {
  label: string;
  /** Từ khóa lọc trong trang danh mục (không dấu cũng khớp). */
  q?: string;
  children?: MenuLeaf[];
}

export interface MenuGroup {
  category: ProductCategory;
  label: string;
  children: MenuLeaf[];
}

export function categoryHref(category: ProductCategory, q?: string) {
  return `/danh-muc/${category}${q ? `?q=${encodeURIComponent(q)}` : ""}`;
}

// Menu xổ xuống trên thanh điều hướng. Mục có `children` sẽ mở thêm menu con bên phải.
export const menuGroups: MenuGroup[] = [
  {
    category: "but",
    label: "Bút viết",
    children: [
      {
        label: "Bút bi",
        q: "bút bi",
        children: [
          { label: "Bút bi Thiên Long", q: "bút bi thiên long" },
          { label: "Bút bi cao cấp", q: "cao cấp" },
        ],
      },
      { label: "Bút gel", q: "bút gel" },
      { label: "Bút chì", q: "bút chì" },
      { label: "Bút dạ quang", q: "dạ quang" },
      { label: "Bút xóa", q: "bút xóa" },
    ],
  },
  {
    category: "vo-so",
    label: "Vở & Sổ",
    children: [
      { label: "Vở học sinh", q: "vở" },
      {
        label: "Sổ tay",
        q: "sổ",
        children: [
          { label: "Sổ lò xo", q: "sổ lò xo" },
          { label: "Sổ bìa da", q: "bìa da" },
        ],
      },
    ],
  },
  {
    category: "giay",
    label: "Giấy văn phòng",
    children: [
      { label: "Giấy in A4", q: "giấy in" },
      { label: "Giấy note", q: "giấy note" },
      { label: "Giấy thủ công", q: "thủ công" },
    ],
  },
  {
    category: "dung-cu",
    label: "Dụng cụ",
    children: [
      { label: "Kéo văn phòng", q: "kéo" },
      { label: "Dập ghim", q: "dập ghim" },
      { label: "Băng keo", q: "băng keo" },
      { label: "Thước & hình học", q: "thước" },
      { label: "Bảng trắng", q: "bảng trắng" },
    ],
  },
  {
    category: "hoa-pham",
    label: "Họa phẩm",
    children: [
      { label: "Màu nước", q: "màu nước" },
      { label: "Sáp dầu", q: "sáp" },
      { label: "Cọ vẽ", q: "cọ" },
    ],
  },
  {
    category: "balo",
    label: "Balo & Hộp bút",
    children: [
      { label: "Balo", q: "balo" },
      { label: "Hộp bút", q: "hộp bút" },
    ],
  },
];
