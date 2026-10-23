import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CheckoutView from "@/components/checkout/CheckoutView";
import { allProducts } from "@/data/products";

export const metadata: Metadata = { title: "Thanh toán — KhaiHoanShop" };
export default function CheckoutPage() {
  return (
    <>
      <Header />
      <main className="bg-surface/60 py-10 lg:py-12">
        <div className="mx-auto w-full max-w-container px-4 md:px-6 lg:px-8">
          <h1 className="mb-7 text-3xl font-black text-navy">Thanh toán</h1>
          <CheckoutView products={allProducts} />
        </div>
      </main>
      <Footer />
    </>
  );
}
