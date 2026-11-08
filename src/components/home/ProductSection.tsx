import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types/product";

export interface SectionBanner {
  src: string;
  alt: string;
  /** Vị trí cắt ảnh, ví dụ "85% 50%" — dùng khi ảnh banner rộng hơn khung. */
  position?: string;
  caption?: string;
}

export default function ProductSection({
  id,
  eyebrow,
  title,
  products,
  surface = false,
  actionHref = "/san-pham",
  banner,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  products: Product[];
  surface?: boolean;
  actionHref?: string;
  /** Có banner thì khu sản phẩm hiện ảnh ở góc trái và hàng sản phẩm cuộn ngang. */
  banner?: SectionBanner;
}) {
  return (
    <section
      id={id}
      className={surface ? "bg-surface py-14 lg:py-16" : "py-14 lg:py-16"}
    >
      <div className="mx-auto w-full max-w-container px-4 md:px-6 lg:px-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-primary">
              {eyebrow}
            </p>
            <h2
              className={`mt-1 text-2xl font-black md:text-3xl ${banner ? "uppercase text-ink" : "text-navy"}`}
            >
              {title}
            </h2>
          </div>
          <Link
            href={actionHref}
            className={
              banner
                ? "rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white hover:bg-primary"
                : "rounded-lg border border-line bg-white px-4 py-2 text-sm font-bold text-primary hover:border-primary hover:bg-primary-soft"
            }
          >
            {banner ? "Xem tất cả →" : "Xem tất cả"}
          </Link>
        </div>

        {banner ? (
          <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
            <Link
              href={actionHref}
              aria-label={banner.alt}
              className="group relative block h-52 overflow-hidden rounded-xl bg-navy lg:h-auto lg:min-h-[420px]"
            >
              <img
                src={banner.src}
                alt={banner.alt}
                loading="lazy"
                style={{ objectPosition: banner.position ?? "center" }}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/90 to-transparent p-5 pt-16 text-white">
                <span className="block text-lg font-black leading-tight">
                  {banner.caption ?? title}
                </span>
                <span className="mt-1 block text-sm font-semibold text-white/85">
                  Xem tất cả →
                </span>
              </span>
            </Link>
            <div className="hide-scrollbar -mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-3 sm:gap-4">
              {products.slice(0, 8).map((product) => (
                <div
                  key={product.id}
                  className="flex w-[200px] shrink-0 snap-start sm:w-[230px]"
                >
                  <div className="flex w-full">
                    <ProductCard product={product} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {products.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
