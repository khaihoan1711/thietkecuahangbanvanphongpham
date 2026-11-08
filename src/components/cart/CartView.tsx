"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useCatalog } from "@/context/CatalogContext";
import { useOrders } from "@/context/OrderContext";
import { useToast } from "@/context/ToastContext";
import { calculateTotals } from "@/data/cart";
import { formatVND } from "@/lib/format";
import { cartKey } from "@/lib/product-options";
import { getCartLines, toOrderItems, type CartLine } from "@/lib/cart-lines";

function CartRow({ product, quantity, item, maximum }: CartLine) {
  const { setQuantity, removeFromCart } = useCart();
  const { getCategoryLabel } = useCatalog();
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
          {getCategoryLabel(product.category)}
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

export default function CartView() {
  const router = useRouter();
  const { items, isReady, clearCart } = useCart();
  const { products } = useCatalog();
  const { currentUser } = useAuth();
  const { placeOrder } = useOrders();
  const { showToast } = useToast();
  // Mã đơn hàng vừa đặt (sau khi đặt, giỏ hàng được làm trống)
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  if (!isReady) return <p className="py-16 text-ink-muted">Đang tải giỏ hàng…</p>;

  const lines = getCartLines(items, products);

  if (placedOrderId && lines.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-white px-6 py-16 text-center">
        <p
          role="status"
          className="text-2xl font-black text-primary"
        >
          Đặt hàng thành công!
        </p>
        <p className="mt-2 text-ink-muted">
          Mã đơn hàng của bạn là <strong className="text-navy">{placedOrderId}</strong>.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/tai-khoan?tab=orders"
            className="inline-flex rounded-lg bg-primary px-6 py-3 font-bold text-white hover:bg-primary-dark"
          >
            Xem đơn hàng của tôi
          </Link>
          <Link
            href="/san-pham"
            className="inline-flex rounded-lg border border-primary px-6 py-3 font-bold text-primary hover:bg-primary-soft"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

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

  // Đặt hàng nhanh bằng thông tin và địa chỉ đã lưu trong tài khoản.
  function handleQuickOrder() {
    if (!currentUser) {
      showToast("Vui lòng đăng nhập để đặt hàng.", "error");
      router.push("/dang-nhap?next=/gio-hang");
      return;
    }

    if (!currentUser.address) {
      showToast(
        "Bạn chưa có địa chỉ giao hàng. Vui lòng nhập ở bước thanh toán.",
        "error",
      );
      router.push("/thanh-toan");
      return;
    }

    const order = placeOrder({
      userId: currentUser.id,
      customer: {
        fullName: currentUser.fullName,
        phone: currentUser.phone,
        email: currentUser.email,
      },
      shipping: currentUser.address,
      note: "",
      payment: "cod",
      items: toOrderItems(lines),
      subtotal,
      shippingFee: shipping,
      discount,
      total,
    });

    clearCart();
    setPlacedOrderId(order.id);
    showToast(`Đặt hàng thành công. Mã đơn: ${order.id}`);
  }

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
        <button
          type="button"
          onClick={handleQuickOrder}
          className="mt-6 flex min-h-12 w-full items-center justify-center rounded-lg bg-primary px-5 font-bold text-white hover:bg-primary-dark"
        >
          Đặt hàng
        </button>
        <Link
          href="/thanh-toan"
          className="mt-3 flex min-h-12 items-center justify-center rounded-lg border border-primary bg-white px-5 font-bold text-primary hover:bg-primary-soft"
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
