"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

// Các liên kết tài khoản ở thanh trên cùng. Giao diện đổi theo trạng thái đăng nhập và quyền.
export default function HeaderAccount() {
  const router = useRouter();
  const { currentUser, isAdmin, logout } = useAuth();
  const { showToast } = useToast();

  function handleLogout() {
    logout();
    showToast("Bạn đã đăng xuất.");
    router.push("/");
  }

  // Chưa đăng nhập (hoặc đang chờ đọc LocalStorage): hiện Đăng nhập / Đăng ký.
  if (!currentUser) {
    return (
      <div className="flex shrink-0 items-center gap-4">
        <Link
          href="/dang-nhap"
          className="hover:underline"
        >
          Đăng nhập
        </Link>
        <Link
          href="/dang-ky"
          className="hover:underline"
        >
          Đăng ký
        </Link>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-3 sm:gap-4">
      <span className="hidden max-w-[200px] truncate sm:inline">
        Xin chào, <strong>{currentUser.fullName}</strong>
      </span>

      {isAdmin && (
        <Link
          href="/quan-tri"
          className="rounded bg-yellow px-2 py-0.5 font-bold text-ink hover:bg-yellow/80"
        >
          Quản trị
        </Link>
      )}

      <Link
        href="/tai-khoan"
        className="hover:underline"
      >
        Tài khoản
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="hover:underline"
      >
        Đăng xuất
      </button>
    </div>
  );
}
