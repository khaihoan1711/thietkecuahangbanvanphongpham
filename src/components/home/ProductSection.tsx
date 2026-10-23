import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types/product";

export default function ProductSection({
  id,
  eyebrow,
  title,
  products,
  surface = false,
  actionHref = "/san-pham",
}: {
  id?: string;
  eyebrow: string;
  title: string;
  products: Product[];
  surface?: boolean;
  actionHref?: string;
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
            <h2 className="mt-1 text-2xl font-black text-navy md:text-3xl">{title}</h2>
          </div>
          <Link
            href={actionHref}
            className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-bold text-primary hover:border-primary hover:bg-primary-soft"
          >
            Xem tất cả
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
