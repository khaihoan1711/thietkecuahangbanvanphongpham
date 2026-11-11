import Link from "next/link";
import CartLink from "@/components/layout/CartLink";
import CategoryNav from "@/components/layout/CategoryNav";
import HeaderAccount from "@/components/layout/HeaderAccount";
import Icon from "@/components/ui/Icon";

export default function Header({ currentPath = "/" }: { currentPath?: string }) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_1px_0_rgba(0,0,0,0.08)]">
      <div className="bg-navy text-white">
        <div className="mx-auto flex min-h-9 w-full max-w-container items-center justify-between gap-4 px-4 text-xs md:px-6 lg:px-8">
          <span className="truncate">
            Chào mừng đến KhaiHoanShop — Giao hàng toàn quốc
          </span>
          <HeaderAccount />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-container flex-wrap items-center gap-3 px-4 py-3 md:px-6 lg:h-[82px] lg:flex-nowrap lg:gap-8 lg:px-8 lg:py-0">
        <Link
          href="/"
          aria-label="KhaiHoanShop — Trang chủ"
          className="shrink-0 leading-none"
        >
          <span className="block text-[21px] font-bold tracking-tight text-navy md:text-[29px]">
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
          <CartLink />
        </div>
      </div>

      <CategoryNav currentPath={currentPath} />
    </header>
  );
}
