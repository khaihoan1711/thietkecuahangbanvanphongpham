"use client";

import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import NewsSection from "@/components/home/NewsSection";
import ProductSection, { type SectionBanner } from "@/components/home/ProductSection";
import PromoBanner from "@/components/home/PromoBanner";
import TrustSection from "@/components/home/TrustSection";
import { useCatalog } from "@/context/CatalogContext";
import {
  getBestSellers,
  getFeaturedProducts,
  getNewProducts,
  getProductsByCategory,
  getSaleProducts,
} from "@/data/products";

// Ảnh banner ở góc trái của từng khu sản phẩm.
const banners: Record<string, SectionBanner> = {
  but: {
    src: "/images/stationery/banner.png",
    alt: "Bút viết — KhaiHoanShop",
    position: "96% 50%",
    caption: "Bút viết cho học tập & văn phòng",
  },
  voSo: {
    src: "/images/stationery/banner.png",
    alt: "Vở & sổ — KhaiHoanShop",
    position: "78% 40%",
    caption: "Vở & sổ cho năm học mới",
  },
  vanPhong: {
    src: "/images/stationery/banner.png",
    alt: "Giấy và dụng cụ văn phòng — KhaiHoanShop",
    position: "70% 90%",
    caption: "Giấy & dụng cụ văn phòng",
  },
};

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
      <ProductSection
        id="but-viet"
        eyebrow="Thiên Long · Bizner"
        title="Bút viết"
        products={getProductsByCategory(products, "but")}
        surface
        actionHref="/danh-muc/but"
        banner={banners.but}
      />
      <ProductSection
        eyebrow="Cho học tập"
        title="Vở & sổ"
        products={getProductsByCategory(products, "vo-so")}
        actionHref="/danh-muc/vo-so"
        banner={banners.voSo}
      />
      <ProductSection
        eyebrow="Cho văn phòng"
        title="Giấy & dụng cụ văn phòng"
        products={[
          ...getProductsByCategory(products, "giay"),
          ...getProductsByCategory(products, "dung-cu"),
        ]}
        actionHref="/danh-muc/giay"
        banner={banners.vanPhong}
      />
      <NewsSection />
    </main>
  );
}
