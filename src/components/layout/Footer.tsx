import Link from "next/link";
import Icon from "@/components/ui/Icon";

// Thông tin liên hệ cửa hàng. Bản HTML đọc các giá trị này khi chạy npm run html:sync.
const contact = {
  phone: "0365392002",
  email: "khaihoanhuetran@gmail.com",
  facebookUrl: "https://www.facebook.com/khai.hoan.05",
  facebookLabel: "Facebook KhaiHoanShop",
  hours: "08:00 - 21:00, Thứ 2 - Chủ nhật",
};

// Bấm vào email sẽ mở trang soạn thư của Gmail (trên web) gửi tới cửa hàng.
const gmailUrl = "https://mail.google.com/mail/?view=cm&fs=1&to=" + contact.email;

const contactLinkStyle = "hover:text-white hover:underline";

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
            className="text-2xl font-bold text-white"
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
              {contact.phone}
            </li>
            <li className="flex gap-2">
              <Icon
                name="mail"
                size={17}
              />{" "}
              <a
                href={gmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={contactLinkStyle}
              >
                {contact.email}
              </a>
            </li>
            <li className="flex gap-2">
              <Icon
                name="facebook"
                size={17}
              />{" "}
              <a
                href={contact.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={contactLinkStyle}
              >
                {contact.facebookLabel}
              </a>
            </li>
            <li className="flex gap-2">
              <Icon
                name="clock"
                size={17}
              />{" "}
              {contact.hours}
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
                href={name === "facebook" ? contact.facebookUrl : "#"}
                target={name === "facebook" ? "_blank" : undefined}
                rel={name === "facebook" ? "noopener noreferrer" : undefined}
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
