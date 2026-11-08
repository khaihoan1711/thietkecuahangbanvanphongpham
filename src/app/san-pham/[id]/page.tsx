import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductDetailView from "@/components/product/ProductDetailView";

export const metadata: Metadata = {
  title: "Chi tiết sản phẩm — KhaiHoanShop",
  description: "Xem thông tin, giá và đặt mua sản phẩm tại KhaiHoanShop.",
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return (
    <>
      <Header currentPath="/san-pham" />
      <ProductDetailView productId={params.id} />
      <Footer />
    </>
  );
}
