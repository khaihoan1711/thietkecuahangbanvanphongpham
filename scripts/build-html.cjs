// Ghép bản HTML độc lập (mở thẳng bằng Chrome) từ các file nguồn:
//   templates/storefront.html  + scripts/*.css + scripts/*.js + src/data/*.json
// Mọi ảnh /images/... được nhúng vào file dưới dạng base64.
// Chạy: npm run html:sync
const fs = require("node:fs");
const path = require("node:path");

const project = path.join(__dirname, "..");
const target = path.join(project, "khaihoanstationery.html");

function read(file) {
  return fs.readFileSync(path.join(project, file), "utf8");
}

const imageTypes = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};
const images = {};

function embedImage(source) {
  if (!source.startsWith("/images/") || source.includes("..")) {
    throw new Error("Đường dẫn ảnh không hợp lệ: " + source);
  }

  if (!images[source]) {
    const type = imageTypes[path.extname(source).toLowerCase()];

    if (!type) {
      throw new Error("Định dạng ảnh chưa được hỗ trợ: " + source);
    }

    const base64 = fs
      .readFileSync(path.join(project, "public", source))
      .toString("base64");
    images[source] = `data:${type};base64,${base64}`;
  }

  return images[source];
}

const products = [
  ...JSON.parse(read("src/data/pens.json")),
  ...JSON.parse(read("src/data/other-products.json")),
];

for (const product of products) {
  embedImage(product.image);

  for (const image of product.images || []) {
    embedImage(image);
  }

  for (const color of product.colors || []) {
    embedImage(color.image);
  }
}

// Chỉ ảnh sản phẩm (chưa gồm ảnh trong template) được đưa vào productImages.
const productImages = { ...images };

function json(value) {
  return JSON.stringify(value, null, 2).replace(/</g, "\\u003c");
}

const styles = [
  read("scripts/layout.css"),
  read("scripts/storefront.css"),
  read("scripts/admin.css"),
];
// Thứ tự quan trọng: dữ liệu và kho (store.js) đứng trước, storefront.js đứng cuối
// vì nó khởi động trang (gọi route()).
const scripts = [
  `const seedProducts = ${json(products)};`,
  `const productImages = ${json(productImages)};`,
  `const movedImages = ${read("src/data/moved-images.json").trim()};`,
  read("scripts/cart-options.js"),
  read("scripts/store.js"),
  read("scripts/ui.js"),
  read("scripts/account.js"),
  read("scripts/admin.js"),
  read("scripts/storefront.js"),
];

const html = read("templates/storefront.html")
  .replace(/(src|href)="(\/images\/[^"]+)"/g, (_, attribute, source) => {
    return `${attribute}="${embedImage(source)}"`;
  })
  .replace("<!-- SHOP_STYLES -->", () => {
    return `<style id="pen-storefront-style">\n${styles.join("\n")}\n</style>`;
  })
  .replace("<!-- SHOP_SCRIPT -->", () => {
    return `<script id="khaihoan-storefront">\n${scripts.join("\n")}\n</script>`;
  });

fs.writeFileSync(target, html, "utf8");
console.log("Đã cập nhật " + target);
