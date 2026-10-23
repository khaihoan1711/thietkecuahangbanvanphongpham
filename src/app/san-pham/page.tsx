import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductListing from "@/components/products/ProductListing";
import { allProducts, categoryInfo } from "@/data/products";
import type { ProductCategory } from "@/types/product";

export const metadata: Metadata = {
  title: "Sản phẩm — KhaiHoanShop",
  description: "Danh sách văn phòng phẩm, đồ dùng học tập và họa phẩm.",
};

export default function ProductListingPage({
  searchParams,
}: {
  searchParams?: { q?: string; category?: string };
}) {
  const q = typeof searchParams?.q === "string" ? searchParams.q : "";
  const rawCategory =
    typeof searchParams?.category === "string" ? searchParams.category : "all";
  const category =
    rawCategory in categoryInfo ? (rawCategory as ProductCategory) : "all";

  return (
    <>
      <Header currentPath="/san-pham" />
      <main className="bg-surface/50 py-10 lg:py-12">
        <div className="mx-auto w-full max-w-container px-4 md:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-wider text-primary">
              Cửa hàng
            </p>
            <h1 className="mt-1 text-3xl font-black text-navy md:text-4xl">
              Tất cả sản phẩm
            </h1>
            <p className="mt-2 max-w-2xl text-ink-muted">
              Tìm kiếm và lọc bút viết, vở sổ, giấy văn phòng, dụng cụ học tập, họa phẩm
              và phụ kiện.
            </p>
          </div>
          <ProductListing
            products={allProducts}
            initialSearch={q}
            initialCategory={category}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
