"use client";

import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import NewsSection from "@/components/home/NewsSection";
import ProductSection from "@/components/home/ProductSection";
import PromoBanner from "@/components/home/PromoBanner";
import TrustSection from "@/components/home/TrustSection";
import { useCatalog } from "@/context/CatalogContext";
import {
  getBestSellers,
  getFeaturedProducts,
  getNewProducts,
  getSaleProducts,
} from "@/data/products";

// Nội dung trang chủ. Sản phẩm lấy từ kho dữ liệu chung nên luôn khớp với trang Admin.
export default function HomeView() {
  const { products } = useCatalog();

  return (
    <main id="main-content">
      <HeroSection />
      <TrustSection />
      <CategorySection />
      <ProductSection
        id="noi-bat"
        eyebrow="Lựa chọn từ cửa hàng"
        title="Sản phẩm nổi bật"
        products={getFeaturedProducts(products)}
      />
      <ProductSection
        id="ban-chay"
        eyebrow="Góc yêu thích"
        title="Sản phẩm bán chạy"
        products={getBestSellers(products)}
        surface
      />
      <PromoBanner />
      <ProductSection
        id="san-pham-khuyen-mai"
        eyebrow="Mua sắm tiết kiệm"
        title="Sản phẩm khuyến mãi"
        products={getSaleProducts(products)}
      />
      <ProductSection
        id="san-pham-moi"
        eyebrow="Vừa lên kệ"
        title="Sản phẩm mới"
        products={getNewProducts(products)}
      />
      <NewsSection />
    </main>
  );
}
