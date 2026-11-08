import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CategoryPageView from "@/components/products/CategoryPageView";

type Props = {
  params: { slug: string };
  searchParams?: { q?: string };
};

export const metadata: Metadata = {
  title: "Danh mục sản phẩm — KhaiHoanShop",
  description: "Xem sản phẩm theo danh mục tại KhaiHoanShop.",
};

export default function CategoryPage({ params, searchParams }: Props) {
  const q = typeof searchParams?.q === "string" ? searchParams.q : "";

  return (
    <>
      <Header currentPath={`/danh-muc/${params.slug}`} />
      <main className="bg-surface pb-16 pt-5">
        <div className="mx-auto w-full max-w-container px-4 md:px-6 lg:px-8">
          <CategoryPageView
            slug={params.slug}
            initialSearch={q}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
