import Icon, { type IconName } from "@/components/ui/Icon";

const items: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "truck",
    title: "Giao hàng toàn quốc",
    text: "Hỗ trợ giao hàng đến nhiều tỉnh thành.",
  },
  {
    icon: "shield",
    title: "Sản phẩm rõ thông tin",
    text: "Hiển thị mã hàng, thương hiệu và quy cách.",
  },
  {
    icon: "headset",
    title: "Hỗ trợ mua hàng",
    text: "Giao diện dễ tìm kiếm, lọc và xem chi tiết.",
  },
  {
    icon: "check",
    title: "Lưu giỏ hàng tiện lợi",
    text: "Giữ những món yêu thích cho lần mua tiếp theo.",
  },
];

export default function TrustSection() {
  return (
    <section className="border-y border-line bg-white py-9">
      <div className="mx-auto grid w-full max-w-container gap-6 px-4 sm:grid-cols-2 md:px-6 lg:grid-cols-4 lg:px-8">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex gap-3"
          >
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Icon name={item.icon} />
            </span>
            <div>
              <h3 className="font-bold text-ink">{item.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
