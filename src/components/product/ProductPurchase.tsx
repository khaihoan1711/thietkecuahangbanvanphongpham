"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useCart } from "@/context/CartContext";

export default function ProductPurchase({ productId }: { productId: string }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState("1");
  const [message, setMessage] = useState("");
  function amount() {
    const value = Number(quantity);
    return Number.isFinite(value) ? Math.max(1, Math.min(999, Math.floor(value))) : 1;
  }
  function purchase(buyNow: boolean) {
    const value = amount();
    addToCart(productId, value);
    setQuantity(String(value));
    setMessage(`Đã thêm ${value} sản phẩm vào giỏ hàng.`);
    if (buyNow) router.push("/thanh-toan");
  }
  return (
    <div className="mt-7">
      <label
        htmlFor="quantity"
        className="mb-3 block text-sm font-semibold text-navy"
      >
        Số lượng
      </label>
      <div className="inline-flex overflow-hidden rounded-lg border border-line bg-white">
        <button
          type="button"
          aria-label="Giảm số lượng"
          disabled={amount() <= 1}
          onClick={() => setQuantity(String(amount() - 1))}
          className="h-12 w-12 text-xl disabled:opacity-30"
        >
          −
        </button>
        <input
          id="quantity"
          type="number"
          min={1}
          max={999}
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          onBlur={() => setQuantity(String(amount()))}
          className="h-12 w-20 border-x border-line text-center text-navy"
        />
        <button
          type="button"
          aria-label="Tăng số lượng"
          disabled={amount() >= 999}
          onClick={() => setQuantity(String(amount() + 1))}
          className="h-12 w-12 text-xl disabled:opacity-30"
        >
          +
        </button>
      </div>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => purchase(true)}
          className="flex min-h-12 items-center justify-center rounded-full bg-primary px-5 font-bold text-white hover:bg-primary-dark"
        >
          MUA NGAY
        </button>
        <button
          type="button"
          onClick={() => purchase(false)}
          className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-primary bg-white px-5 font-bold text-primary hover:bg-primary-soft"
        >
          <Icon
            name="bag"
            size={19}
          />{" "}
          Thêm vào giỏ
        </button>
      </div>
      <p
        role="status"
        className="mt-3 min-h-6 text-sm text-primary"
      >
        {message}
      </p>
    </div>
  );
}
