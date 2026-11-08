"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavItems } from "@/components/admin/adminNav";
import { useOrders } from "@/context/OrderContext";

type AdminSidebarProps = {
  // Trên điện thoại sidebar là ngăn kéo, `open` cho biết đang mở hay đóng.
  open: boolean;
  onClose: () => void;
};

// Thanh điều hướng bên trái của khu quản trị.
export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { orders } = useOrders();
  const pendingCount = orders.filter((order) => order.status === "pending").length;

  return (
    <>
      {/* Nền tối phía sau ngăn kéo (chỉ trên điện thoại) */}
      {open && (
        <div
          aria-hidden="true"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-navy/50 lg:hidden"
        />
      )}

      <aside
        aria-label="Menu quản trị"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col bg-navy text-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-white/10 px-6 py-5">
          <Link
            href="/quan-tri"
            onClick={onClose}
            className="block leading-none"
          >
            <span className="block text-xl font-black tracking-tight">
              KhaiHoanShop
            </span>
            <span className="mt-1 block text-[11px] font-bold uppercase tracking-[0.22em] text-yellow">
              Quản trị
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {adminNavItems.map((item) => {
              const isActive =
                item.href === "/quan-tri"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              const showBadge = item.href === "/quan-tri/don-hang" && pendingCount > 0;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-3 rounded-lg px-4 text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-white/75 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="w-5 text-center"
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {showBadge && (
                      <span className="rounded-full bg-yellow px-2 py-0.5 text-xs font-bold text-ink">
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link
            href="/"
            className="flex min-h-11 items-center gap-3 rounded-lg px-4 text-sm font-semibold text-white/75 hover:bg-white/10 hover:text-white"
          >
            <span
              aria-hidden="true"
              className="w-5 text-center"
            >
              ↗
            </span>
            Xem cửa hàng
          </Link>
        </div>
      </aside>
    </>
  );
}
