"use client";

import { useState } from "react";

export default function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [selected, setSelected] = useState(0);
  return (
    <div>
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-line bg-white p-5 md:p-8">
        <img
          src={images[selected]}
          alt={alt}
          className="h-full w-full object-contain"
        />
      </div>
      <div
        className="mt-4 flex gap-3 overflow-x-auto pb-2"
        aria-label="Ảnh sản phẩm"
      >
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            aria-label={`Xem ảnh ${index + 1}`}
            aria-pressed={index === selected}
            onClick={() => setSelected(index)}
            className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-white p-1 ${index === selected ? "border-primary" : "border-line"}`}
          >
            <img
              src={image}
              alt={`${alt} — ảnh ${index + 1}`}
              className="h-full w-full object-contain"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
