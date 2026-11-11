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
      { label: "Bút lông bảng", q: "lông bảng" },
      { label: "Bút xóa", q: "bút xóa" },
    ],
  },
  {
    category: "vo-so",
    label: "Vở & Sổ",
    children: [
      { label: "Tập học sinh", q: "tập" },
      { label: "Sổ lò xo", q: "sổ lò xo" },
      { label: "Sổ còng", q: "sổ còng" },
    ],
  },
  {
    category: "giay",
    label: "Giấy văn phòng",
    children: [
      { label: "Giấy in A4", q: "giấy in" },
      { label: "Ream giấy A4", q: "ream" },
      { label: "Giấy ghi chú", q: "ghi chú" },
      { label: "Giấy phân trang", q: "phân trang" },
      { label: "Bìa hồ sơ", q: "bìa" },
    ],
  },
  {
    category: "dung-cu",
    label: "Dụng cụ",
    children: [
      { label: "Kéo", q: "kéo" },
      { label: "Bấm kim & kim bấm", q: "kim" },
      { label: "Kẹp bướm", q: "kẹp bướm" },
      { label: "Băng keo", q: "băng keo" },
      { label: "Gôm tẩy", q: "gôm" },
      {
        label: "Thước & compa",
        q: "thước",
        children: [
          { label: "Thước kẻ", q: "thước" },
          { label: "Compa", q: "compa" },
        ],
      },
      { label: "Máy tính", q: "máy tính" },
    ],
  },
  {
    category: "hoa-pham",
    label: "Họa phẩm",
    children: [
      { label: "Màu nước", q: "màu nước" },
      { label: "Sáp màu", q: "sáp" },
      { label: "Bút chì màu", q: "chì màu" },
      { label: "Bút lông màu", q: "lông màu" },
      { label: "Cọ vẽ", q: "cọ" },
    ],
  },
  {
    category: "balo",
    label: "Balo & Hộp bút",
    children: [
      { label: "Balo & cặp", q: "balo" },
      { label: "Hộp bút", q: "hộp" },
      { label: "Bóp viết", q: "bóp" },
    ],
  },
];
