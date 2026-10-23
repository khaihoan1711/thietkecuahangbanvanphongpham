// Tạo bản HTML độc lập từ các file nguồn dễ đọc.
const fs = require("node:fs");
const path = require("node:path");

function exportPens(
  project = path.join(__dirname, ".."),
  target = path.join(project, "khaihoanstationery.html"),
) {
  function read(file) {
    return fs.readFileSync(path.join(project, file), "utf8");
  }

  const pens = JSON.parse(read("src/data/pens.json"));
  const otherProducts = JSON.parse(read("src/data/other-products.json"));
  const products = [...pens, ...otherProducts];
  const images = {};

  function embedImage(source) {
    if (!source.startsWith("/images/") || source.includes("..")) {
      throw new Error("Đường dẫn ảnh không hợp lệ.");
    }

    if (!images[source]) {
      const extension = path.extname(source).toLowerCase();
      const imageTypes = {
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
      };
      const type = imageTypes[extension];

      if (!type) {
        throw new Error("Định dạng ảnh chưa được hỗ trợ.");
      }

      const file = path.join(project, "public", source);
      const base64 = fs.readFileSync(file).toString("base64");
      images[source] = `data:${type};base64,${base64}`;
    }

    return images[source];
  }

  for (const product of products) {
    embedImage(product.image);

    for (const image of product.images || []) {
      embedImage(image);
    }

    for (const color of product.colors || []) {
      embedImage(color.image);
    }
  }

  const productImages = { ...images };
  let html = read("templates/storefront.html");
  html = html.replace(/src="(\/images\/[^\"]+)"/g, (_, source) => {
    return `src="${embedImage(source)}"`;
  });

  // Giữ thông tin liên hệ đã được đồng bộ từ Footer.tsx.
  const footerPattern = /<footer\b[^>]*>[\s\S]*?<\/footer>/;
  if (fs.existsSync(target)) {
    const current = fs.readFileSync(target, "utf8").match(footerPattern);
    if (current) {
      html = html.replace(footerPattern, () => current[0]);
    }
  }

  function json(value) {
    return JSON.stringify(value, null, 2).replace(/</g, "\\u003c");
  }

  const styles = [read("scripts/layout.css"), read("scripts/storefront.css")];
  const scripts = [
    `const products = ${json(products)};`,
    `const productImages = ${json(productImages)};`,
    read("scripts/cart-options.js"),
    read("scripts/storefront.js"),
  ];

  html = html.replace("<!-- SHOP_STYLES -->", () => {
    return `<style id="pen-storefront-style">\n${styles.join("\n")}\n</style>`;
  });
  html = html.replace("<!-- SHOP_SCRIPT -->", () => {
    return `<script id="khaihoan-storefront">\n${scripts.join("\n")}\n</script>`;
  });

  fs.writeFileSync(target, html, "utf8");
  return target;
}

module.exports = { exportPens };

if (require.main === module) {
  console.log("Đã cập nhật HTML: " + exportPens());
}
