import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FavoritesView from "@/components/product/FavoritesView";

export const metadata: Metadata = { title: "Sản phẩm yêu thích — KhaiHoanShop" };

export default function FavoritesPage() {
  return (
    <>
      <Header currentPath="/yeu-thich" />
      <main className="bg-surface/60 py-10 lg:py-12">
        <div className="mx-auto w-full max-w-container px-4 md:px-6 lg:px-8">
          <h1 className="mb-2 text-3xl font-bold text-navy">Sản phẩm yêu thích</h1>
          <FavoritesView />
        </div>
      </main>
      <Footer />
    </>
  );
}
