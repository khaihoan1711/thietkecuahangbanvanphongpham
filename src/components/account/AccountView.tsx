"use client";

import Link from "next/link";
import { useState } from "react";
import AddressSection from "@/components/account/AddressSection";
import OrdersSection from "@/components/account/OrdersSection";
import PasswordSection from "@/components/account/PasswordSection";
import ProfileSection from "@/components/account/ProfileSection";
import { btnBase, btnPrimary } from "@/components/ui/buttons";

const sections = [
  { id: "profile", label: "Thông tin cá nhân" },
  { id: "orders", label: "Đơn hàng của tôi" },
  { id: "address", label: "Địa chỉ" },
  { id: "password", label: "Đổi mật khẩu" },
  { id: "logout", label: "Đăng xuất" },
] as const;

type SectionId = (typeof sections)[number]["id"];

export default function AccountView() {
  const [active, setActive] = useState<SectionId>("profile");

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[260px_1fr]">
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
        </ul>
      </nav>

      <section className="rounded-xl border border-line bg-white p-6 md:p-8">
        {active === "profile" && <ProfileSection />}
        {active === "orders" && <OrdersSection />}
        {active === "address" && <AddressSection />}
        {active === "password" && <PasswordSection />}
        {active === "logout" && (
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">Đăng xuất</h2>
            {/* TODO (real authentication): call the real logout here (end the session), then redirect.
                UI only for now: no login state exists, so nothing is cleared. */}
            <p
              role="status"
              className="mt-4 text-ink-muted"
            >
              Bạn đã đăng xuất.
            </p>
            <Link
              href="/dang-nhap"
              className={`${btnBase} ${btnPrimary} mt-6`}
            >
              Đăng nhập lại
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
