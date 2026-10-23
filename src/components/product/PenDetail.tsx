"use client";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { cartKey, maxCartQuantity, selectedProduct } from "@/lib/product-options";
import { formatVND } from "@/lib/format";
import type { Product } from "@/types/product";

export default function PenDetail({ product }: { product: Product }) {
  const { items, addToCart, isReady } = useCart();
  const [unitId, setUnitId] = useState(product.units?.[0]?.id);
  const [colorId, setColorId] = useState(product.colors?.[0]?.id);
  const selected = selectedProduct(product, { unitId, colorId });
  const images = Array.from(new Set([product.image, ...(product.images ?? [])]));
  const [image, setImage] = useState(selected.image);
  const [quantity, setQuantity] = useState("1");
  const [message, setMessage] = useState("");
  const key = cartKey({ productId: product.id, unitId, colorId });
  const alreadyAdded = items.find((item) => cartKey(item) === key)?.quantity ?? 0;
  const available = maxCartQuantity(product, items, { unitId, colorId }) - alreadyAdded;
  const limit = Math.max(1, available);
  const clean = (value: string | number) =>
    Math.max(1, Math.min(limit, Math.floor(Number(value)) || 1));
  function chooseImage(next: string) {
    setImage(next);
    const color = product.colors?.find((value) => value.image === next);
    if (color) setColorId(color.id);
    setQuantity("1");
    setMessage("");
  }
  function buy() {
    if (!isReady || available < 1) return;
    const amount = clean(quantity);
    addToCart(product.id, amount, { unitId, colorId });
    setQuantity("1");
    setMessage(`Đã thêm ${amount} ${selected.pack.toLowerCase()} vào giỏ hàng.`);
  }
  return (
    <div className="mx-auto grid max-w-container items-start gap-8 px-4 md:grid-cols-2 md:px-6 lg:gap-14 lg:px-8">
      <div>
        <div className="relative flex aspect-square items-center justify-center bg-white p-5 md:p-8">
          <img
            src={image}
            alt={`${product.name} — ảnh sản phẩm`}
            className="h-full w-full object-contain"
          />
          {images.length > 1 &&
            [-1, 1].map((direction) => (
              <button
                key={direction}
                type="button"
                aria-label={direction < 0 ? "Ảnh trước" : "Ảnh tiếp theo"}
                onClick={() =>
                  chooseImage(
                    images[
                      (images.indexOf(image) + direction + images.length) %
                        images.length
                    ],
                  )
                }
                className={`absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-600 hover:bg-blue-100 ${direction < 0 ? "left-0" : "right-0"}`}
              >
                {direction < 0 ? "‹" : "›"}
              </button>
            ))}
        </div>
        <div
          className="mt-5 flex gap-3 overflow-x-auto pb-2"
          aria-label="Ảnh sản phẩm"
        >
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              aria-label={`Xem ảnh ${index + 1}`}
              aria-pressed={image === src}
              onClick={() => chooseImage(src)}
              className={`h-24 w-28 shrink-0 overflow-hidden rounded-md border bg-white p-2 ${image === src ? "border-orange-500" : "border-line"}`}
            >
              <img
                src={src}
                alt={`${product.name} — ảnh ${index + 1}`}
                className="h-full w-full object-contain"
              />
            </button>
          ))}
        </div>
      </div>
      <div className="min-w-0 py-2">
        <h1 className="text-3xl font-medium leading-tight text-navy md:text-4xl">
          {product.name}
        </h1>
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <p>
            Thương hiệu: <span className="text-orange-600">{product.brand}</span>
          </p>
          <p>
            Tình trạng:{" "}
            <span className="text-orange-600">
              {product.stock ? "Còn hàng" : "Hết hàng"}
            </span>
          </p>
        </div>
        <div
          className="mt-5 flex flex-wrap items-baseline gap-4 rounded-md bg-gray-100 px-5 py-3"
          aria-live="polite"
        >
          <strong className="text-4xl text-orange-600">
            {formatVND(selected.price)}
          </strong>
          {selected.oldPrice && (
            <del className="text-ink-muted">{formatVND(selected.oldPrice)}</del>
          )}
        </div>
        <p className="my-6 leading-7 text-ink">{product.shortDescription}</p>
        <fieldset className="flex flex-wrap items-center gap-3 border-y border-line py-4">
          <legend className="sr-only">Đơn vị tính</legend>
          <span className="min-w-[100px] font-semibold">Đơn vị tính:</span>
          {product.units?.map((unit) => (
            <button
              key={unit.id}
              type="button"
              aria-pressed={unitId === unit.id}
              onClick={() => {
                setUnitId(unit.id);
                setQuantity("1");
                setMessage("");
              }}
              className={`rounded-md border px-4 py-2 ${unitId === unit.id ? "border-orange-500 bg-orange-50 text-orange-600" : "border-line"}`}
            >
              {unit.label}
              {unitId === unit.id && <span aria-hidden="true"> ✓</span>}
            </button>
          ))}
        </fieldset>
        {!!product.colors?.length && (
          <fieldset className="flex flex-wrap items-center gap-3 border-b border-line py-4">
            <legend className="sr-only">Màu mực</legend>
            <span className="min-w-[100px] font-semibold">Màu mực:</span>
            {product.colors.map((color) => (
              <button
                key={color.id}
                type="button"
                title={color.label}
                aria-label={`Màu ${color.label}`}
                aria-pressed={colorId === color.id}
                onClick={() => {
                  setColorId(color.id);
                  setImage(color.image);
                  setQuantity("1");
                  setMessage("");
                }}
                style={{ backgroundColor: color.hex }}
                className={`flex h-10 w-10 items-center justify-center rounded-md border-2 text-white ${colorId === color.id ? "border-orange-500 ring-2 ring-orange-200" : "border-transparent"}`}
              >
                {colorId === color.id && (
                  <span
                    aria-hidden="true"
                    className="rounded-full bg-black/50 px-1"
                  >
                    ✓
                  </span>
                )}
              </button>
            ))}
            <span className="text-sm text-ink-muted">
              {product.colors.find((color) => color.id === colorId)?.label}
            </span>
          </fieldset>
        )}
        <div className="mt-5">
          <label
            htmlFor="pen-quantity"
            className="mb-3 block"
          >
            Số lượng:
          </label>
          <div className="inline-flex overflow-hidden rounded border border-slate-300">
            <button
              type="button"
              aria-label="Giảm số lượng"
              disabled={clean(quantity) <= 1}
              onClick={() => setQuantity(String(clean(Number(quantity) - 1)))}
              className="h-10 w-10 disabled:opacity-30"
            >
              −
            </button>
            <input
              id="pen-quantity"
              type="number"
              min={1}
              max={limit}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              onBlur={() => setQuantity(String(clean(quantity)))}
              className="h-10 w-20 border-x border-slate-300 text-center outline-none"
            />
            <button
              type="button"
              aria-label="Tăng số lượng"
              disabled={clean(quantity) >= limit}
              onClick={() => setQuantity(String(clean(Number(quantity) + 1)))}
              className="h-10 w-10 disabled:opacity-30"
            >
              +
            </button>
          </div>
          <p className="mt-2 text-sm text-ink-muted">Có sẵn: {product.stock} cây</p>
        </div>
        <button
          type="button"
          disabled={!isReady || available <= 0}
          onClick={buy}
          className="mt-5 min-h-14 w-full rounded-md bg-orange-600 px-6 py-4 font-bold text-white hover:bg-orange-700 disabled:opacity-50 sm:max-w-sm"
        >
          {available <= 0 ? "ĐÃ CHỌN HẾT SỐ LƯỢNG CÓ SẴN" : "THÊM VÀO GIỎ HÀNG"}
        </button>
        <p
          role="status"
          className="mt-3 min-h-6 text-sm text-primary"
        >
          {message}
        </p>
      </div>
    </div>
  );
}
