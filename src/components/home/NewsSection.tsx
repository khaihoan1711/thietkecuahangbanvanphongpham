const posts = [
  {
    date: "05/10/2026",
    title: "5 món văn phòng phẩm nên có trên bàn học",
    excerpt: "Gợi ý những vật dụng cơ bản giúp góc học tập gọn gàng và dễ sử dụng hơn.",
  },
  {
    date: "02/10/2026",
    title: "Cách chọn giấy in A4 cho nhu cầu học tập và văn phòng",
    excerpt:
      "Phân biệt định lượng giấy và chọn loại phù hợp cho in tài liệu hằng ngày.",
  },
  {
    date: "28/09/2026",
    title: "Sắp xếp hộp bút gọn hơn chỉ với vài bước đơn giản",
    excerpt: "Một số mẹo nhỏ để phân loại bút viết, thước và phụ kiện học tập.",
  },
];

export default function NewsSection() {
  return (
    <section
      id="tin-tuc"
      className="bg-surface py-14 lg:py-16"
    >
      <div className="mx-auto w-full max-w-container px-4 md:px-6 lg:px-8">
        <div className="mb-7">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">
            Góc chia sẻ
          </p>
          <h2 className="mt-1 text-2xl font-black text-navy md:text-3xl">
            Tin tức mới nhất
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {posts.map((post, index) => (
            <article
              key={post.title}
              className="overflow-hidden rounded-xl border border-line bg-white"
            >
              <div
                className={`h-36 ${index === 0 ? "bg-[#e8f2ff]" : index === 1 ? "bg-[#fff0f2]" : "bg-[#fff6d9]"} flex items-center justify-center text-5xl`}
              >
                {index === 0 ? "✎" : index === 1 ? "▱" : "▤"}
              </div>
              <div className="p-5">
                <time className="text-xs font-semibold text-ink-muted">
                  {post.date}
                </time>
                <h3 className="mt-2 text-lg font-bold leading-snug text-navy">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-ink-muted">{post.excerpt}</p>
                <a
                  href="#"
                  className="mt-4 inline-block text-sm font-bold text-primary hover:underline"
                >
                  Xem thêm
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
