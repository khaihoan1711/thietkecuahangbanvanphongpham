"use client";

import Icon from "@/components/ui/Icon";
import { btnBase, btnPrimary, btnSmall } from "@/components/ui/buttons";
import { useCart } from "@/context/CartContext";

// The "Thêm vào giỏ" button of a product card. Adds 1 unit.
export default function AddToCartButton({
  productId,
  soldOut = false,
}: {
  productId: string;
  soldOut?: boolean;
}) {
  const { addToCart } = useCart();

  if (soldOut) {
    return (
      <button
        type="button"
        disabled
        className={`${btnBase} ${btnSmall} mt-auto w-full cursor-not-allowed bg-line text-ink-muted`}
      >
        Hết hàng
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => addToCart(productId, 1)}
      className={`${btnBase} ${btnPrimary} ${btnSmall} mt-auto w-full`}
    >
      <Icon
        name="plus"
        size={16}
      />{" "}
      Thêm vào giỏ
    </button>
  );
}
