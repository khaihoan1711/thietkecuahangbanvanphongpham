"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AddressSection from "@/components/account/AddressSection";
import OrdersSection from "@/components/account/OrdersSection";
import PasswordSection from "@/components/account/PasswordSection";
import ProfileSection from "@/components/account/ProfileSection";
import AccessGuard from "@/components/auth/AccessGuard";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

const sections = [
  { id: "profile", label: "Thông tin cá nhân" },
  { id: "orders", label: "Đơn hàng của tôi" },
  { id: "address", label: "Địa chỉ" },
  { id: "password", label: "Đổi mật khẩu" },
] as const;

type SectionId = (typeof sections)[number]["id"];

function isSectionId(value?: string): value is SectionId {
  return sections.some((section) => section.id === value);
}

// Trang tài khoản. Chỉ người đã đăng nhập mới xem được (AccessGuard).
// `initialTab` cho phép mở thẳng một mục, ví dụ /tai-khoan?tab=orders.
export default function AccountView({ initialTab }: { initialTab?: string }) {
  const router = useRouter();
  const { currentUser, isAdmin, logout } = useAuth();
  const { showToast } = useToast();
  const [active, setActive] = useState<SectionId>(
    isSectionId(initialTab) ? initialTab : "profile",
  );

  function handleLogout() {
    logout();
    showToast("Bạn đã đăng xuất.");
    router.push("/");
  }

  return (
    <AccessGuard>
      {currentUser && (
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <nav
            aria-label="Tài khoản"
            className="rounded-xl border border-line bg-white p-3"
          >
            <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
              {sections.map((section) => {
                const isActive = section.id === active;

                return (
                  <li
                    key={section.id}
                    className="shrink-0"
                  >
                    <button
                      type="button"
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setActive(section.id)}
                      className={`flex min-h-11 w-full items-center whitespace-nowrap rounded-lg px-4 text-left transition-colors duration-200 ${
                        isActive
                          ? "bg-primary-soft font-semibold text-primary"
                          : "font-medium text-ink-muted hover:bg-surface hover:text-ink"
                      }`}
                    >
                      {section.label}
                    </button>
                  </li>
                );
              })}

              {isAdmin && (
                <li className="shrink-0">
                  <Link
                    href="/quan-tri"
                    className="flex min-h-11 w-full items-center whitespace-nowrap rounded-lg px-4 font-medium text-ink-muted hover:bg-surface hover:text-ink"
                  >
                    Khu vực quản trị
                  </Link>
                </li>
              )}

              <li className="shrink-0">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex min-h-11 w-full items-center whitespace-nowrap rounded-lg px-4 text-left font-medium text-ink-muted hover:bg-surface hover:text-ink"
                >
                  Đăng xuất
                </button>
              </li>
            </ul>
          </nav>

          <section className="rounded-xl border border-line bg-white p-6 md:p-8">
            {active === "profile" && <ProfileSection user={currentUser} />}
            {active === "orders" && <OrdersSection user={currentUser} />}
            {active === "address" && <AddressSection user={currentUser} />}
            {active === "password" && <PasswordSection />}
          </section>
        </div>
      )}
    </AccessGuard>
  );
}
