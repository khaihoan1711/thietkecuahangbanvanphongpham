import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import ProductSection from "@/components/home/ProductSection";
import PromoBanner from "@/components/home/PromoBanner";
import TrustSection from "@/components/home/TrustSection";
import NewsSection from "@/components/home/NewsSection";
import {
  allProducts,
  bestSellers,
  featuredProducts,
  getProductsByCategory,
  newProducts,
} from "@/data/products";

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <HeroSection />
        <TrustSection />
        <CategorySection />
        <ProductSection
          id="noi-bat"
          eyebrow="Lựa chọn từ cửa hàng"
          title="Sản phẩm nổi bật"
          products={featuredProducts}
        />
        <ProductSection
          id="ban-chay"
          eyebrow="Góc yêu thích"
          title="Sản phẩm bán chạy"
          products={bestSellers}
          surface
        />
        <PromoBanner />
        <ProductSection
          id="san-pham-khuyen-mai"
          eyebrow="Mua sắm tiết kiệm"
          title="Sản phẩm khuyến mãi"
          products={allProducts.filter(
            (product) => product.oldPrice && product.oldPrice > product.price,
          )}
        />
        <ProductSection
          id="san-pham-moi"
          eyebrow="Vừa lên kệ"
          title="Sản phẩm mới"
          products={newProducts}
        />
        <ProductSection
          id="but-viet"
          eyebrow="Thiên Long · Bizner"
          title="Bút viết"
          products={getProductsByCategory("but")}
          surface
          actionHref="/san-pham?category=but"
        />
        <ProductSection
          eyebrow="Cho học tập"
          title="Vở & sổ"
          products={getProductsByCategory("vo-so")}
          actionHref="/san-pham?category=vo-so"
        />
        <ProductSection
          eyebrow="Cho văn phòng"
          title="Giấy & dụng cụ văn phòng"
          products={[
            ...getProductsByCategory("giay"),
            ...getProductsByCategory("dung-cu"),
          ]}
          actionHref="/san-pham?category=giay"
        />
        <NewsSection />
      </main>
      <Footer />
    </>
  );
}
