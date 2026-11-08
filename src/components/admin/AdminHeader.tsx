"use client";

import { usePathname, useRouter } from "next/navigation";
import { getAdminPageTitle } from "@/components/admin/adminNav";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

// Thanh trên cùng của khu quản trị: nút mở menu (điện thoại), tên trang và tài khoản admin.
export default function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const { showToast } = useToast();

  function handleLogout() {
    logout();
    showToast("Bạn đã đăng xuất.");
    router.push("/dang-nhap");
  }

  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center gap-3 border-b border-line bg-white px-4 md:px-6 lg:px-8">
      <button
        type="button"
        aria-label="Mở menu quản trị"
        onClick={onMenuClick}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-xl text-ink hover:bg-surface lg:hidden"
      >
        ☰
      </button>

      <h1 className="flex-1 truncate text-lg font-black text-navy md:text-xl">
        {getAdminPageTitle(pathname)}
      </h1>

      <div className="flex items-center gap-3 text-sm">
        <span className="hidden max-w-[180px] truncate text-ink-muted sm:inline">
          {currentUser?.fullName}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="min-h-10 rounded-lg border border-line px-4 font-semibold text-ink hover:bg-surface"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
