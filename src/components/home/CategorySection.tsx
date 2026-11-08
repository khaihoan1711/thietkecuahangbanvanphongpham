"use client";

import Link from "next/link";
import { useCatalog } from "@/context/CatalogContext";

export default function CategorySection() {
  const { categories } = useCatalog();

  return (
    <section className="py-12">
      <div className="mx-auto w-full max-w-container px-4 md:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-primary">
              Mua theo danh mục
            </p>
            <h2 className="mt-1 text-2xl font-black text-navy md:text-3xl">
              Danh mục sản phẩm
            </h2>
          </div>
          <Link
            href="/san-pham"
            className="text-sm font-bold text-primary hover:underline"
          >
            Xem tất cả
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/danh-muc/${category.id}`}
              className="group rounded-xl border border-line bg-white p-5 text-center transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-card"
            >
              <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-surface text-3xl font-bold text-navy transition group-hover:bg-primary-soft group-hover:text-primary">
                {category.icon}
              </span>
              <strong className="mt-3 block text-sm text-ink">{category.label}</strong>
              <span className="mt-1 hidden text-xs text-ink-muted md:block">
                {category.short}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
