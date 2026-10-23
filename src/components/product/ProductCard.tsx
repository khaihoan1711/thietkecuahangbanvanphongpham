import Link from "next/link";
import AddToCartButton from "@/components/product/AddToCartButton";
import CategoryBadge from "@/components/product/CategoryBadge";
import { formatVND } from "@/lib/format";
import type { Product } from "@/types/product";

export default function ProductCard({ product }: { product: Product }) {
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;
  const detailUrl = `/san-pham/${product.id}`;

  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-line bg-white transition duration-200 hover:-translate-y-1 hover:shadow-card">
      <div className="relative overflow-hidden bg-surface">
        <Link
          href={detailUrl}
          className="block"
        >
          <img
            src={product.image}
            alt={product.alt}
            loading="lazy"
            className="aspect-square w-full object-contain bg-white transition-transform duration-300 group-hover:scale-[1.035]"
          />
        </Link>
        <CategoryBadge
          category={product.category}
          className="absolute left-3 top-3 bg-white/95 shadow-soft"
        />
        {product.isNew && (
          <span className="absolute right-3 top-3 rounded-full bg-navy px-2.5 py-1 text-xs font-bold text-white">
            MỚI
          </span>
        )}
        {discount > 0 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-white">
            -{discount}%
          </span>
        )}
        {product.rank && (
          <span className="absolute bottom-3 right-3 rounded-full bg-yellow px-2.5 py-1 text-xs font-bold text-ink">
            Top {product.rank}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          {product.brand} · {product.sku}
        </p>
        <h3 className="mt-2 min-h-[52px] text-base font-semibold leading-snug text-ink">
          <Link
            href={detailUrl}
            className="hover:text-primary"
          >
            {product.name}
          </Link>
        </h3>
        <span className="mt-1 block text-sm text-ink-muted">{product.pack}</span>

        <div className="mb-4 mt-3 flex flex-wrap items-baseline gap-2">
          <span className="whitespace-nowrap text-xl font-bold text-primary">
            {formatVND(product.price)}
          </span>
          {product.oldPrice && (
            <span className="whitespace-nowrap text-sm text-ink-muted line-through">
              {formatVND(product.oldPrice)}
            </span>
          )}
        </div>

        {product.units ? (
          <Link
            href={detailUrl}
            className="mt-auto flex min-h-10 w-full items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white hover:bg-primary-dark"
          >
            Chọn mua
          </Link>
        ) : (
          <AddToCartButton productId={product.id} />
        )}
      </div>
    </article>
  );
}
