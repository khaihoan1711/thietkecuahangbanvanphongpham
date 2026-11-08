"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types/store";

type AccessGuardProps = {
  // Quyền cần có. Bỏ trống nghĩa là chỉ cần đăng nhập.
  role?: UserRole;
  children: ReactNode;
};

// Kiểm tra quyền truy cập ở phía Frontend.
// - Chưa đăng nhập: chuyển đến trang đăng nhập (và quay lại sau khi đăng nhập).
// - Đăng nhập nhưng không đủ quyền: hiện thông báo không có quyền.
// Lưu ý: đây chỉ là mô phỏng. Dữ liệu vẫn nằm trong trình duyệt nên không thể bảo mật thật sự.
export default function AccessGuard({ role, children }: AccessGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isReady } = useAuth();

  useEffect(() => {
    if (isReady && !currentUser) {
      router.replace(`/dang-nhap?next=${encodeURIComponent(pathname)}`);
    }
  }, [isReady, currentUser, pathname, router]);

  if (!isReady || !currentUser) {
    return (
      <p className="py-24 text-center text-ink-muted">Đang kiểm tra quyền truy cập…</p>
    );
  }

  if (role && currentUser.role !== role) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <p className="text-2xl font-black text-navy">Bạn không có quyền truy cập</p>
        <p className="mt-2 text-ink-muted">
          Trang này chỉ dành cho {role === "admin" ? "quản trị viên" : "người dùng"}.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block font-semibold text-primary hover:underline"
        >
          Về trang chủ
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
