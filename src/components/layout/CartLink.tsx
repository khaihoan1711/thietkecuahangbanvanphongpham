"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useCart } from "@/context/CartContext";

const iconButton =
  "relative inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-surface";

// Cart icon in the header: links to /gio-hang and shows the real item count.
export default function CartLink() {
  const { totalQuantity, isReady } = useCart();
  // Hidden while empty, and until the saved cart is loaded (avoids a wrong badge on first paint)
  const showBadge = isReady && totalQuantity > 0;

  return (
    <Link
      href="/gio-hang"
      aria-label={showBadge ? `Giỏ hàng, ${totalQuantity} sản phẩm` : "Giỏ hàng"}
      className={iconButton}
    >
      <Icon
        name="bag"
        size={24}
      />
      {showBadge && (
        <span
          aria-hidden="true"
          className="absolute right-0 top-0.5 h-5 min-w-5 rounded-full bg-primary px-1 text-center text-xs font-semibold leading-5 text-white"
        >
          {totalQuantity}
        </span>
      )}
    </Link>
  );
}
