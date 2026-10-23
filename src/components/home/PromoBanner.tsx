import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default function PromoBanner() {
  return (
    <section
      id="khuyen-mai"
      className="bg-surface py-6"
    >
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-9 text-white md:px-12 md:py-11">
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                Chọn món yêu thích · Giá thêm xinh
              </p>
              <h2 className="mt-3 text-3xl font-black leading-tight md:text-4xl">
                Góc ưu đãi của KhaiHoanShop
              </h2>
              <p className="mt-3 max-w-xl text-white/80">
                Bút viết, vở sổ và đồ dùng học tập đang có giá tốt. Khám phá các sản
                phẩm giảm giá ngay bên dưới.
              </p>
            </div>
            <Link
              href="#san-pham-khuyen-mai"
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 self-start rounded-full bg-white px-6 font-bold text-primary hover:bg-primary-soft md:self-auto"
            >
              Xem ưu đãi{" "}
              <Icon
                name="arrow"
                size={18}
              />
            </Link>
          </div>
          <div className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full border-[50px] border-white/5" />
        </div>
      </div>
    </section>
  );
}
