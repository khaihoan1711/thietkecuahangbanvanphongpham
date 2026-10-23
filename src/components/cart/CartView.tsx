"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { calculateTotals } from "@/data/cart";
import { categoryInfo } from "@/data/products";
import { formatVND } from "@/lib/format";
import { cartKey, maxCartQuantity, selectedProduct } from "@/lib/product-options";
import type { CartItem, Product } from "@/types/product";

function CartRow({
  product,
  quantity,
  item,
  maximum,
}: {
  product: Product;
  quantity: number;
  item: CartItem;
  maximum: number;
}) {
  const { setQuantity, removeFromCart } = useCart();
  const [draft, setDraft] = useState(String(quantity));
  useEffect(() => setDraft(String(quantity)), [quantity]);
  return (
    <li className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
      <Link
        href={`/san-pham/${product.id}`}
        className="shrink-0"
      >
        <img
          src={product.image}
          alt={product.alt}
          className="h-24 w-24 rounded-xl border border-line bg-surface object-contain"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">
          {categoryInfo[product.category].label}
        </p>
        <h2 className="mt-1 font-bold text-navy">
          <Link href={`/san-pham/${product.id}`}>{product.name}</Link>
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          {product.brand} · {product.sku}
        </p>
        <p className="text-sm text-ink-muted">{product.pack}</p>
        <p className="mt-1 font-bold text-primary">{formatVND(product.price)}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
        <div className="flex items-center rounded-lg border border-line bg-white">
          <button
            type="button"
            disabled={quantity <= 1}
            onClick={() => setQuantity(product.id, quantity - 1, item)}
            className="h-10 w-10 font-bold disabled:opacity-30"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            max={maximum}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              const n = Math.floor(Number(e.target.value));
              if (n >= 1) setQuantity(product.id, n, item);
            }}
            onBlur={() => setDraft(String(quantity))}
            className="h-10 w-12 border-x border-line text-center outline-none"
          />
          <button
            type="button"
            disabled={quantity >= maximum}
            onClick={() => setQuantity(product.id, quantity + 1, item)}
            className="h-10 w-10 font-bold"
          >
            +
          </button>
        </div>
        <span className="font-black text-navy">
          {formatVND(product.price * quantity)}
        </span>
        <button
          type="button"
          onClick={() => removeFromCart(product.id, item)}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Xóa
        </button>
      </div>
    </li>
  );
}

export default function CartView({ products }: { products: Product[] }) {
  const { items, isReady } = useCart();
  if (!isReady) return <p className="py-16 text-ink-muted">Đang tải giỏ hàng…</p>;
  const lines = items.flatMap((item) => {
    const product = products.find((p) => p.id === item.productId);
    return product
      ? [
          {
            product: selectedProduct(product, item),
            quantity: item.quantity,
            item,
            maximum: maxCartQuantity(product, items, item),
          },
        ]
      : [];
  });
  if (!lines.length)
    return (
      <div className="rounded-xl border border-line bg-white px-6 py-16 text-center">
        <p className="text-2xl font-black text-navy">Giỏ hàng của bạn đang trống</p>
        <Link
          href="/san-pham"
          className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 font-bold text-white"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  const { subtotal, shipping, discount, total } = calculateTotals(
    lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
  );
  return (
    <div className="grid items-start gap-7 lg:grid-cols-[1fr_350px]">
      <ul className="divide-y divide-line rounded-xl border border-line bg-white px-5">
        {lines.map((line) => (
          <CartRow
            key={cartKey(line.item)}
            {...line}
          />
        ))}
      </ul>
      <aside className="rounded-xl border border-line bg-white p-6 lg:sticky lg:top-40">
        <h2 className="text-xl font-black text-navy">Tổng đơn hàng</h2>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Tạm tính</dt>
            <dd className="font-semibold">{formatVND(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Phí vận chuyển</dt>
            <dd className="font-semibold">{formatVND(shipping)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Giảm giá</dt>
            <dd className="font-semibold text-primary">−{formatVND(discount)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-4 text-lg">
            <dt className="font-bold">Tổng cộng</dt>
            <dd className="font-black text-primary">{formatVND(total)}</dd>
          </div>
        </dl>
        <Link
          href="/thanh-toan"
          className="mt-6 flex min-h-12 items-center justify-center rounded-lg bg-primary px-5 font-bold text-white hover:bg-primary-dark"
        >
          Tiến hành thanh toán
        </Link>
        <Link
          href="/san-pham"
          className="mt-4 block text-center text-sm font-semibold text-navy hover:underline"
        >
          Tiếp tục mua sắm
        </Link>
      </aside>
    </div>
  );
}
