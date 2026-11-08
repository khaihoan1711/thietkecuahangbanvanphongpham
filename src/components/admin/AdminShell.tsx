"use client";

import { useState, type ReactNode } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AccessGuard from "@/components/auth/AccessGuard";

// Khung chung của khu quản trị: sidebar trái, header trên, nội dung bên phải.
// AccessGuard chỉ cho tài khoản Admin vào; người khác sẽ bị chuyển đi hoặc báo không có quyền.
export default function AdminShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <AccessGuard role="admin">
      <div className="min-h-screen bg-surface lg:flex">
        <AdminSidebar
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader onMenuClick={() => setMenuOpen(true)} />
          <main
            id="main-content"
            className="flex-1 p-4 md:p-6 lg:p-8"
          >
            {children}
          </main>
        </div>
      </div>
    </AccessGuard>
  );
}
