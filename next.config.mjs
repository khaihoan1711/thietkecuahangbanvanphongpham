import { readFileSync } from "node:fs";

// Ảnh bút đã chuyển từ /images/products/pens/ sang /images/products/but/.
// Sản phẩm và đơn hàng đã lưu trong trình duyệt của khách vẫn giữ đường dẫn cũ,
// nên đường dẫn cũ được chuyển tiếp sang ảnh mới để không bị vỡ ảnh.
const movedImages = JSON.parse(
  readFileSync(new URL("./src/data/moved-images.json", import.meta.url), "utf8"),
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return Object.entries(movedImages).map(([source, destination]) => ({
      source,
      destination,
      permanent: false,
    }));
  },
};

export default nextConfig;
