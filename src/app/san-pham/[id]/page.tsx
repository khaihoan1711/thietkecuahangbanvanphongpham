import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import PenDetail from "@/components/product/PenDetail";
import ProductGallery from "@/components/product/ProductGallery";
import ProductPurchase from "@/components/product/ProductPurchase";
import { categoryInfo, getProductById, getRelatedProducts } from "@/data/products";
import { formatVND } from "@/lib/format";

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const product = getProductById(params.id);
  return {
    title: product ? `${product.name} — KhaiHoanShop` : "Không tìm thấy sản phẩm",
    description: product?.shortDescription,
  };
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = getProductById(params.id);
  if (!product) notFound();
  const category = categoryInfo[product.category].label;
  const related = getRelatedProducts(product);
  const images = Array.from(new Set([product.image, ...(product.images ?? [])]));
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;
  const rows = [
    ["Mã sản phẩm", product.sku],
    ["Thương hiệu", product.brand],
    ["Danh mục", category],
    ["Quy cách", product.units?.map((unit) => unit.label).join(" / ") ?? product.pack],
  ];
  return (
    <>
      <Header currentPath="/san-pham" />
      <main id="main-content">
        <section className="border-b border-blue-100 bg-gradient-to-r from-blue-100 via-white to-sky-100 py-8 text-center md:py-12">
          <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
            <p className="text-2xl font-black uppercase text-navy">{category}</p>
            <nav
              aria-label="Đường dẫn sản phẩm"
              className="mt-4 flex flex-wrap justify-center gap-x-2 gap-y-1 text-sm text-ink-muted"
            >
              <Link
                href="/"
                className="hover:text-primary"
              >
                Trang chủ
              </Link>
              <span aria-hidden="true">›</span>
              <Link
                href="/san-pham"
                className="hover:text-primary"
              >
                Sản phẩm
              </Link>
              <span aria-hidden="true">›</span>
              <Link
                href={`/san-pham?category=${product.category}`}
                className="hover:text-primary"
              >
                {category}
              </Link>
              <span aria-hidden="true">›</span>
              <span
                aria-current="page"
                className="text-primary"
              >
                {product.name}
              </span>
            </nav>
          </div>
        </section>
        <section className="bg-white py-8 md:py-12">
          {product.units ? (
            <PenDetail
              key={product.id}
              product={product}
            />
          ) : (
            <div className="mx-auto grid max-w-container items-start gap-8 px-4 md:grid-cols-2 md:px-6 lg:gap-14 lg:px-8">
              <ProductGallery
                key={product.id}
                images={images}
                alt={product.alt}
              />
              <div className="py-2 lg:py-5">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">
                  KhaiHoan Stationery · {product.sku}
                </p>
                <h1 className="mt-3 text-3xl font-bold leading-tight text-navy md:text-4xl">
                  {product.name}
                </h1>
                <p className="mt-3 text-sm text-ink-muted">Chưa có đánh giá</p>
                <div className="mt-6 flex flex-wrap items-baseline gap-3">
                  <span className="text-4xl font-black text-primary">
                    {formatVND(product.price)}
                  </span>
                  {product.oldPrice && (
                    <del className="text-lg text-ink-muted">
                      {formatVND(product.oldPrice)}
                    </del>
                  )}
                  {discount > 0 && (
                    <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-bold text-primary">
                      Giảm {discount}%
                    </span>
                  )}
                </div>
                <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border-y border-line py-4 text-sm">
                  <p>
                    <span className="text-ink-muted">Thương hiệu: </span>
                    {product.brand}
                  </p>
                  <p>
                    <span className="text-ink-muted">Quy cách: </span>
                    {product.pack}
                  </p>
                </div>
                <p className="mt-6 leading-8 text-ink-muted">
                  {product.shortDescription}
                </p>
                <ProductPurchase
                  key={product.id}
                  productId={product.id}
                />
                <Link
                  href={`/san-pham?category=${product.category}`}
                  className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
                >
                  ← Xem thêm {category.toLowerCase()}
                </Link>
              </div>
            </div>
          )}
        </section>
        <section className="py-10 md:py-14">
          <div className="mx-auto grid max-w-container gap-8 px-4 md:px-6 lg:grid-cols-[1.5fr_1fr] lg:px-8">
            <div className="rounded-2xl border border-line bg-white p-6 md:p-8">
              <h2 className="text-2xl font-bold text-navy">Mô tả sản phẩm</h2>
              <div className="mt-5 space-y-4 leading-8 text-ink-muted">
                {product.description.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-white p-6 md:p-8">
              <h2 className="text-2xl font-bold text-navy">Thông tin sản phẩm</h2>
              <dl className="mt-5 divide-y divide-line">
                {rows.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between gap-4 py-3"
                  >
                    <dt className="text-sm text-ink-muted">{label}</dt>
                    <dd className="text-right text-sm font-semibold text-navy">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
        <section className="pb-10 md:pb-14">
          <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
            <h2 className="mb-6 text-2xl font-bold text-navy">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
