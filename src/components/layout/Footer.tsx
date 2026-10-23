import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default function Footer() {
  const policies = [
    "Hướng dẫn đặt hàng",
    "Phương thức thanh toán",
    "Chính sách vận chuyển",
    "Đổi trả & hoàn tiền",
    "Bảo mật thông tin",
  ];
  const support = [
    "Giới thiệu cửa hàng",
    "Câu hỏi thường gặp",
    "Theo dõi đơn hàng",
    "Liên hệ hỗ trợ",
    "Sơ đồ website",
  ];

  return (
    <footer
      id="lien-he"
      className="mt-16 bg-footer text-footer-text"
    >
      <div className="border-b border-white/10 bg-[#101B29]">
        <div className="mx-auto grid w-full max-w-container gap-5 px-4 py-8 md:grid-cols-3 md:px-6 lg:px-8">
          <div>
            <p className="font-bold text-white">Đăng ký nhận tin</p>
            <p className="mt-1 text-sm text-footer-muted">
              Nhận thông tin sản phẩm mới và ưu đãi.
            </p>
          </div>
          <form
            className="flex md:col-span-2"
            action="#"
          >
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="h-12 min-w-0 flex-1 rounded-l-lg border-0 px-4 text-ink outline-none"
            />
            <button className="h-12 rounded-r-lg bg-primary px-5 font-bold text-white hover:bg-primary-dark">
              Đăng ký
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-container gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 md:px-6 lg:px-8">
        <div>
          <Link
            href="/"
            className="text-2xl font-black text-white"
          >
            KhaiHoanShop{" "}
            <span className="mt-1 block text-xs uppercase tracking-widest text-white/70">
              KhaiHoan Stationery
            </span>
          </Link>
          <p className="mt-4 text-sm leading-6 text-footer-muted">
            Đồ dùng học tập, văn phòng phẩm và họa phẩm cho những ý tưởng mỗi ngày. Tìm
            nhanh, chọn dễ cùng KhaiHoanShop.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-footer-muted">
            <li className="flex gap-2">
              <Icon
                name="phone"
                size={17}
              />{" "}
              0365392002
            </li>
            <li className="flex gap-2">
              <Icon
                name="mail"
                size={17}
              />{" "}
              khaihoanhuetran@gmail.com
            </li>
            <li className="flex gap-2">
              <Icon
                name="clock"
                size={17}
              />{" "}
              08:00 - 21:00, Thứ 2 - Chủ nhật
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-white">Chính sách bán hàng</h3>
          <ul className="mt-4 space-y-2 text-sm text-footer-muted">
            {policies.map((x) => (
              <li key={x}>
                <a
                  href="#"
                  className="hover:text-white"
                >
                  {x}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-white">Hỗ trợ khách hàng</h3>
          <ul className="mt-4 space-y-2 text-sm text-footer-muted">
            {support.map((x) => (
              <li key={x}>
                <a
                  href="#"
                  className="hover:text-white"
                >
                  {x}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-white">Kết nối với chúng tôi</h3>
          <div className="mt-4 flex gap-2">
            {["facebook", "instagram", "youtube"].map((name) => (
              <a
                key={name}
                href="#"
                aria-label={name}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 hover:bg-white/10"
              >
                <Icon name={name as "facebook" | "instagram" | "youtube"} />
              </a>
            ))}
          </div>
          <div className="mt-6 rounded-lg bg-white/5 p-4 text-sm text-footer-muted">
            <strong className="block text-white">Thanh toán</strong>
            <span className="mt-2 block">COD · Chuyển khoản ngân hàng</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-footer-muted">
        © 2026 KhaiHoanShop. Website mẫu phục vụ đồ án Front-end.
      </div>
    </footer>
  );
}
