"use client";

import Link from "next/link";
import CategoryListing from "@/components/products/CategoryListing";
import { useCatalog } from "@/context/CatalogContext";

// Nội dung trang /danh-muc/[slug]: đường dẫn, tiêu đề và danh sách sản phẩm của danh mục.
// Dữ liệu lấy từ kho chung nên danh mục và sản phẩm do Admin thêm cũng hiển thị ở đây.
export default function CategoryPageView({
  slug,
  initialSearch,
}: {
  slug: string;
  initialSearch: string;
}) {
  const { categories, products, isReady } = useCatalog();
  const category = categories.find((item) => item.id === slug);

  // Chờ đọc LocalStorage để tránh báo "không tìm thấy" sai khi vừa tải trang.
  if (!isReady) {
    return <p className="py-16 text-center text-ink-muted">Đang tải danh mục…</p>;
  }

  if (!category) {
    return (
      <div className="rounded-xl border border-line bg-white px-6 py-16 text-center">
        <p className="text-2xl font-black text-navy">Không tìm thấy danh mục</p>
        <p className="mt-2 text-ink-muted">
          Danh mục này không tồn tại hoặc đã bị xóa.
        </p>
        <Link
          href="/san-pham"
          className="mt-6 inline-block font-semibold text-primary hover:underline"
        >
          Xem tất cả sản phẩm
        </Link>
      </div>
    );
  }

  const categoryProducts = products.filter(
    (product) => product.category === category.id,
  );

  return (
    <>
      <nav
        aria-label="Đường dẫn"
        className="text-sm text-ink"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href="/"
              className="hover:text-primary"
            >
              Trang chủ
            </Link>
          </li>
          <li
            aria-hidden="true"
            className="text-ink-muted"
          >
            /
          </li>
          <li>
            <Link
              href="/san-pham"
              className="hover:text-primary"
            >
              Danh mục
            </Link>
          </li>
          <li
            aria-hidden="true"
            className="text-ink-muted"
          >
            /
          </li>
          <li aria-current="page">{category.label}</li>
        </ol>
      </nav>

      <h1 className="my-6 text-center text-3xl font-black text-ink md:text-5xl lg:pl-[284px]">
        {category.label}
      </h1>

      <CategoryListing
        key={`${category.id}-${initialSearch}`}
        products={categoryProducts}
        initialSearch={initialSearch}
        bannerSrc="/images/stationery/banner.png"
        bannerAlt={`Banner danh mục ${category.label}`}
      />
    </>
  );
}
