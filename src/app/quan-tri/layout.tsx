import type { Metadata } from "next";
import type { ReactNode } from "react";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Quản trị — KhaiHoanShop",
  description: "Khu vực quản trị sản phẩm, danh mục, đơn hàng và người dùng.",
};

// Mọi trang trong /quan-tri đều nằm trong khung quản trị và được kiểm tra quyền Admin.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
