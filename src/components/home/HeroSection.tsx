import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default function HeroSection() {
  return (
    <section
      className="bg-surface pb-8 pt-5 md:pb-12 md:pt-8"
      aria-labelledby="home-title"
    >
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <h1
          id="home-title"
          className="sr-only"
        >
          KhaiHoanShop — Đồng hành cùng bạn đến trường
        </h1>
        <Link
          href="/san-pham"
          aria-label="Khám phá đồ dùng học tập KhaiHoanShop"
          className="block overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-soft md:rounded-3xl"
        >
          <img
            src="/images/stationery/banner.png"
            alt="KhaiHoanShop — Đồng hành cùng bạn đến trường, với balo, vở, bút và dụng cụ học tập"
            width={3168}
            height={1344}
            fetchPriority="high"
            className="block h-auto w-full"
          />
        </Link>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/san-pham"
            className="inline-flex min-h-12 items-center gap-3 rounded-full bg-primary px-6 font-bold text-white hover:bg-primary-dark"
          >
            Khám phá sản phẩm{" "}
            <Icon
              name="arrow"
              size={18}
            />
          </Link>
          <Link
            href="#san-pham-khuyen-mai"
            className="inline-flex min-h-12 items-center rounded-full border border-primary/30 bg-white px-6 font-bold text-primary hover:bg-primary-soft"
          >
            Săn ưu đãi
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Link
            href="/san-pham?category=giay"
            className="flex items-center justify-between gap-4 rounded-2xl bg-blue-100 px-6 py-5 text-navy transition hover:shadow-soft"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Gọn gàng & hiệu quả
              </p>
              <h2 className="mt-1 text-lg font-bold">Đồ dùng cho văn phòng</h2>
            </div>
            <Icon name="arrow" />
          </Link>
          <Link
            href="/san-pham?category=hoa-pham"
            className="flex items-center justify-between gap-4 rounded-2xl bg-sky-100 px-6 py-5 text-navy transition hover:shadow-soft"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Thỏa sức sáng tạo
              </p>
              <h2 className="mt-1 text-lg font-bold">Sắc màu & họa phẩm</h2>
            </div>
            <Icon name="arrow" />
          </Link>
        </div>
      </div>
    </section>
  );
}
