"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Ba ảnh banner của slideshow. Mỗi ảnh dẫn tới một khu vực trên trang.
const slides = [
  {
    src: "/images/stationery/slide-1.jpg",
    href: "/san-pham",
    alt: "KhaiHoanShop — Đồng hành cùng bạn đến trường, với balo, vở, bút và dụng cụ học tập",
  },
  {
    src: "/images/stationery/slide-2.jpg",
    href: "#san-pham-moi",
    alt: "Hàng mới về, học tập hứng khởi — xem sản phẩm mới",
  },
  {
    src: "/images/stationery/slide-3.jpg",
    href: "#san-pham-khuyen-mai",
    alt: "Ưu đãi từ hãng, giảm đến 40% — săn ưu đãi ngay",
  },
];

// Tự chuyển ảnh sau mỗi 5 giây.
const INTERVAL = 5000;

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  // Tạm dừng khi người dùng rê chuột hoặc dùng bàn phím trên slideshow.
  const [paused, setPaused] = useState(false);

  // Đặt lại đồng hồ 5 giây mỗi khi ảnh đổi (kể cả khi người dùng tự bấm chuyển).
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (paused || reduceMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, INTERVAL);

    return () => window.clearInterval(timer);
  }, [paused, index]);

  function go(next: number) {
    setIndex((next + slides.length) % slides.length);
  }

  const arrowStyle =
    "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-2xl text-navy opacity-0 shadow-soft transition hover:bg-white focus-visible:opacity-100 group-hover:opacity-100";

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Banner nổi bật"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="group relative aspect-[2000/848] overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-soft md:rounded-3xl"
    >
      {slides.map((slide, slideIndex) => {
        const isActive = slideIndex === index;

        return (
          <Link
            key={slide.src}
            href={slide.href}
            aria-hidden={!isActive}
            aria-label={slide.alt}
            tabIndex={isActive ? 0 : -1}
            className={`absolute inset-0 block transition-opacity duration-700 ${
              isActive ? "z-[1] opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              width={2000}
              height={848}
              fetchPriority={slideIndex === 0 ? "high" : "auto"}
              className="block h-full w-full object-cover"
            />
          </Link>
        );
      })}

      <button
        type="button"
        aria-label="Ảnh trước"
        onClick={() => go(index - 1)}
        className={`${arrowStyle} left-3`}
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Ảnh tiếp theo"
        onClick={() => go(index + 1)}
        className={`${arrowStyle} right-3`}
      >
        ›
      </button>

      <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-2.5">
        {slides.map((slide, dotIndex) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Xem ảnh ${dotIndex + 1}`}
            aria-current={dotIndex === index}
            onClick={() => go(dotIndex)}
            className={`h-3 rounded-full shadow-[0_0_0_1px_rgba(0,0,0,0.2)] transition-all ${
              dotIndex === index ? "w-8 bg-white" : "w-3 bg-white/60 hover:bg-white/90"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
