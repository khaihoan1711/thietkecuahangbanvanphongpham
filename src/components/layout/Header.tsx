import Link from "next/link";
import CartLink from "@/components/layout/CartLink";
import Icon from "@/components/ui/Icon";
import { categoryInfo } from "@/data/products";
import type { ProductCategory } from "@/types/product";

const categories = Object.entries(categoryInfo) as [
  ProductCategory,
  (typeof categoryInfo)[ProductCategory],
][];

export default function Header({ currentPath = "/" }: { currentPath?: string }) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_1px_0_rgba(0,0,0,0.08)]">
      <div className="bg-navy text-white">
        <div className="mx-auto flex min-h-9 w-full max-w-container items-center justify-between gap-4 px-4 text-xs md:px-6 lg:px-8">
          <span className="truncate">
            Chào mừng đến KhaiHoanShop — Giao hàng toàn quốc
          </span>
          <div className="hidden items-center gap-4 sm:flex">
            <Link
              href="/dang-ky"
              className="hover:underline"
            >
              Đăng ký
            </Link>
            <Link
              href="/dang-nhap"
              className="hover:underline"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-container flex-wrap items-center gap-3 px-4 py-3 md:px-6 lg:h-[82px] lg:flex-nowrap lg:gap-8 lg:px-8 lg:py-0">
        <Link
          href="/"
          aria-label="KhaiHoanShop — Trang chủ"
          className="shrink-0 leading-none"
        >
          <span className="block text-[21px] font-black tracking-tight text-navy md:text-[29px]">
            KhaiHoanShop
          </span>
          <span className="block text-[12px] font-bold uppercase tracking-[0.22em] text-primary">
            Stationery
          </span>
        </Link>

        <form
          action="/san-pham"
          method="get"
          role="search"
          className="relative order-3 w-full basis-full lg:order-none lg:flex-1 lg:basis-0"
        >
          <label
            htmlFor="header-search"
            className="sr-only"
          >
            Tìm kiếm sản phẩm
          </label>
          <input
            id="header-search"
            name="q"
            type="search"
            placeholder="Tìm bút, vở, giấy A4, dụng cụ học tập..."
            className="h-12 w-full rounded-full border-2 border-primary bg-white pl-5 pr-14 text-sm outline-none placeholder:text-ink-muted focus:ring-4 focus:ring-primary-soft"
          />
          <button
            aria-label="Tìm kiếm"
            className="absolute right-1.5 top-1/2 inline-flex h-9 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-dark"
          >
            <Icon
              name="search"
              size={19}
            />
          </button>
        </form>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <Link
            href="/dang-nhap"
            className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-ink hover:bg-surface md:flex"
          >
            <Icon
              name="user"
              size={22}
            />
            <span className="hidden sm:inline">Đăng nhập</span>
          </Link>
          <CartLink />
        </div>
      </div>

      <nav
        aria-label="Điều hướng chính"
        className="border-t border-line bg-white"
      >
        <div className="mx-auto flex w-full max-w-container items-center px-4 md:px-6 lg:px-8">
          <div className="group relative hidden lg:block">
            <Link
              href="/san-pham"
              className="flex h-[50px] min-w-[220px] items-center gap-3 bg-primary px-5 font-bold text-white"
            >
              <Icon
                name="menu"
                size={20}
              />{" "}
              Danh mục sản phẩm
            </Link>
            <div className="invisible absolute left-0 top-full z-50 w-[270px] translate-y-1 border border-line bg-white py-2 opacity-0 shadow-card transition group-focus-within:visible group-hover:visible group-focus-within:translate-y-0 group-hover:translate-y-0 group-focus-within:opacity-100 group-hover:opacity-100">
              {categories.map(([key, info]) => (
                <Link
                  key={key}
                  href={`/san-pham?category=${key}`}
                  className="flex items-center justify-between px-5 py-3 text-sm font-medium hover:bg-primary-soft hover:text-primary"
                >
                  <span>{info.label}</span>
                  <Icon
                    name="chevron"
                    size={16}
                  />
                </Link>
              ))}
            </div>
          </div>

          <ul className="hide-scrollbar flex h-[50px] min-w-0 flex-1 items-stretch gap-6 overflow-x-auto px-0 lg:px-6">
            {[
              ["Trang chủ", "/"],
              ["Sản phẩm", "/san-pham"],
              ["Sản phẩm mới", "/#san-pham-moi"],
              ["Bán chạy", "/#ban-chay"],
              ["Khuyến mãi", "/#khuyen-mai"],
              ["Tin tức", "/#tin-tuc"],
              ["Liên hệ", "/#lien-he"],
            ].map(([label, href]) => (
              <li
                key={label}
                className="flex shrink-0"
              >
                <Link
                  href={href}
                  className={`flex h-full items-center border-b-2 text-sm font-semibold transition ${currentPath === href ? "border-primary text-primary" : "border-transparent text-ink hover:text-primary"}`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-line bg-surface lg:hidden">
          <div
            className="hide-scrollbar mx-auto flex max-w-container gap-2 overflow-x-auto px-4 py-2 md:px-6"
            aria-label="Danh mục sản phẩm"
          >
            {categories.map(([key, info]) => (
              <Link
                key={key}
                href={`/san-pham?category=${key}`}
                className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-line bg-white px-3 text-xs font-semibold text-navy hover:border-primary"
              >
                <span aria-hidden="true">{info.icon}</span>
                {info.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
