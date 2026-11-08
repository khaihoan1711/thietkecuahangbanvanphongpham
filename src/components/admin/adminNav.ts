// Các mục trên thanh điều hướng của khu quản trị.
export const adminNavItems = [
  { href: "/quan-tri", label: "Tổng quan", icon: "▦" },
  { href: "/quan-tri/san-pham", label: "Sản phẩm", icon: "✎" },
  { href: "/quan-tri/danh-muc", label: "Danh mục", icon: "☰" },
  { href: "/quan-tri/don-hang", label: "Đơn hàng", icon: "▣" },
  { href: "/quan-tri/nguoi-dung", label: "Người dùng", icon: "☺" },
] as const;

// Tìm tên trang theo đường dẫn hiện tại (hiển thị trên header).
export function getAdminPageTitle(pathname: string) {
  const exact = adminNavItems.find((item) => item.href === pathname);

  return exact?.label ?? "Quản trị";
}
