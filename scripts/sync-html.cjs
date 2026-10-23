// Đồng bộ thông tin cửa hàng, dữ liệu sản phẩm và bản xem trước HTML.
// Không biên dịch JSX và không xuất toàn bộ ứng dụng Next.js.
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { execFile } = require("node:child_process");
const { randomBytes } = require("node:crypto");
const { parseArgs } = require("node:util");

const footerPattern = /<footer\b[^>]*\bid=["']lien-he["'][^>]*>[\s\S]*?<\/footer>/i;
function text(value) {
  const result = value.replace(/\{\s*["']\s*["']\s*\}/g, " ").trim();
  if (!result || /[<>{}]/.test(result))
    throw new Error(
      "Chỉ hỗ trợ văn bản trực tiếp trong các trường thông tin Footer.tsx.",
    );
  return result.replace(
    /&(?:amp|lt|gt|quot|apos|#39|nbsp);/g,
    (entity) =>
      ({
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&apos;": "'",
        "&#39;": "'",
        "&nbsp;": " ",
      })[entity],
  );
}
function extract(source, expression, name) {
  const match = source.match(expression);
  if (!match)
    throw new Error(`Không tìm thấy ${name} trong Footer.tsx. HTML được giữ nguyên.`);
  return text(match[1]);
}
function readInfo(source) {
  const brand = source.match(
    /<Link\b[^>]*\bhref=["']\/["'][^>]*>\s*([^<]+)<span\b[^>]*>([^<]+)<\/span>\s*<\/Link>/,
  );
  if (!brand)
    throw new Error(
      "Không tìm thấy tên cửa hàng trong Footer.tsx. HTML được giữ nguyên.",
    );
  const contact = (name) =>
    extract(
      source,
      new RegExp(`<Icon\\b[^>]*\\bname=["']${name}["'][^>]*\\/>([^<]+)<\\/li>`),
      name,
    );
  return {
    name: text(brand[1]),
    tagline: text(brand[2]),
    description: extract(source, /<\/Link>\s*<p\b[^>]*>([^<]+)<\/p>/, "mô tả cửa hàng"),
    phone: contact("phone"),
    email: contact("mail"),
    hours: contact("clock"),
    copyright: extract(source, /<div\b[^>]*>\s*(©[^<]+)<\/div>/, "bản quyền"),
  };
}
const escapeHTML = (value) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
function updateFooter(footer, data) {
  function replaceRequired(expression, make, name) {
    if (!expression.test(footer))
      throw new Error(`HTML thiếu ${name}. Chưa ghi thay đổi.`);
    footer = footer.replace(expression, make);
  }
  replaceRequired(
    /(<div\b[^>]*class=["']logo["'][^>]*>)[\s\S]*?(<small\b[^>]*>)[\s\S]*?<\/small>\s*<\/div>/,
    (_, opening, small) =>
      `${opening}${escapeHTML(data.name)}${small}${escapeHTML(data.tagline)}</small></div>`,
    "logo",
  );
  replaceRequired(
    /(<\/small>\s*<\/div>\s*<p\b[^>]*>)[\s\S]*?<\/p>/,
    (_, opening) => `${opening}${escapeHTML(data.description)}</p>`,
    "mô tả",
  );
  replaceRequired(
    /(<strong>Liên hệ cửa hàng<\/strong>\s*<p\b[^>]*>)[\s\S]*?<\/p>/,
    (_, opening) =>
      `${opening}${escapeHTML(data.phone)}<br>${escapeHTML(data.email)}<br>${escapeHTML(data.hours)}</p>`,
    "thông tin liên hệ",
  );
  replaceRequired(
    /<strong>Mua sắm cùng [\s\S]*?<\/strong>/,
    () => `<strong>Mua sắm cùng ${escapeHTML(data.name)}</strong>`,
    "tiêu đề mua sắm",
  );
  replaceRequired(
    /(<div\b[^>]*class=["']copyright["'][^>]*>)[\s\S]*?<\/div>/,
    (_, opening) => `${opening}${escapeHTML(data.copyright)}</div>`,
    "bản quyền",
  );
  return footer;
}
function syncFooter(project, htmlFile) {
  const source = fs.readFileSync(
    path.join(project, "src/components/layout/Footer.tsx"),
    "utf8",
  );
  const html = fs.readFileSync(htmlFile, "utf8");
  const footer = html.match(footerPattern);
  if (!footer) throw new Error('Không tìm thấy <footer id="lien-he"> trong HTML.');
  const info = readInfo(source);
  const updated = updateFooter(footer[0], info);
  const result = html.replace(footerPattern, () => updated);
  if (result !== html) {
    const temporary = htmlFile + ".sync.tmp";
    fs.writeFileSync(temporary, result, "utf8");
    fs.renameSync(temporary, htmlFile);
  }
  return { changed: result !== html, info };
}

function startPreview({
  project,
  htmlFile,
  port = 8787,
  open = true,
  pollInterval = 500,
}) {
  const catalogSource = path.join(project, "src/data/pens.json");
  const catalogExporter = path.join(project, "scripts/export-pens-html.cjs");
  const hasCatalog = fs.existsSync(catalogSource) && fs.existsSync(catalogExporter);
  let catalogSignature = "";
  function catalogFiles() {
    if (!hasCatalog) return [];
    const otherSource = path.join(project, "src/data/other-products.json");
    const products = [
      ...JSON.parse(fs.readFileSync(catalogSource, "utf8")),
      ...JSON.parse(fs.readFileSync(otherSource, "utf8")),
    ];
    return [
      catalogSource,
      otherSource,
      path.join(project, "templates/storefront.html"),
      path.join(project, "public/images/stationery/banner.png"),
      ...["layout.css", "storefront.js", "storefront.css", "cart-options.js"].map(
        (file) => path.join(project, "scripts", file),
      ),
      ...new Set(
        products
          .flatMap((product) => [
            product.image,
            ...(product.images || []),
            ...(product.colors || []).map((color) => color.image),
          ])
          .map((src) => path.join(project, "public", src)),
      ),
    ];
  }
  function updateCatalog() {
    if (!hasCatalog) return;
    const signature = catalogFiles()
      .map((file) => {
        const stat = fs.statSync(file);
        return file + ":" + stat.mtimeMs + ":" + stat.size;
      })
      .join("|");
    if (signature !== catalogSignature) {
      require(catalogExporter).exportPens(project, htmlFile);
      catalogSignature = signature;
    }
  }
  updateCatalog();
  syncFooter(project, htmlFile);
  const sourceFile = path.join(project, "src/components/layout/Footer.tsx");
  const session = randomBytes(8).toString("hex");
  const version = () => {
    const stat = fs.statSync(htmlFile);
    return session + ":" + stat.mtimeMs + ":" + stat.size;
  };
  let lastError = "";
  const watch = () => {
    try {
      const result = syncFooter(project, htmlFile);
      updateCatalog();
      registerWatches();
      if (result.changed)
        console.log("Đã đồng bộ Footer.tsx → HTML. Trang xem trước sẽ tự làm mới.");
      lastError = "";
    } catch (error) {
      if (error.message !== lastError) console.error(error.message);
      lastError = error.message;
    }
  };
  const watchedFiles = new Set();
  function registerWatches() {
    for (const file of [sourceFile, ...catalogFiles()]) {
      if (!watchedFiles.has(file)) {
        fs.watchFile(file, { interval: pollInterval }, watch);
        watchedFiles.add(file);
      }
    }
  }
  function unwatch() {
    for (const file of watchedFiles) fs.unwatchFile(file, watch);
  }
  registerWatches();
  const server = http.createServer((request, response) => {
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    if (!["GET", "HEAD"].includes(request.method)) {
      response.writeHead(405);
      response.end();
      return;
    }
    let pathname;
    try {
      pathname = new URL(request.url, "http://127.0.0.1").pathname;
    } catch {
      response.writeHead(400);
      response.end();
      return;
    }
    try {
      if (pathname === "/__khaihoan/version") {
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        response.end(
          request.method === "HEAD" ? "" : JSON.stringify({ version: version() }),
        );
        return;
      }
      if (
        pathname !== "/" &&
        pathname !== "/" + encodeURIComponent(path.basename(htmlFile))
      ) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }
      const initial = version();
      const reload = `<script id="khaihoan-live-reload">(() => { const initial = ${JSON.stringify(initial)}; let checking = false; setInterval(async () => { if (checking) return; checking = true; try { const response = await fetch('/__khaihoan/version', { cache: 'no-store' }); if (response.ok && (await response.json()).version !== initial) location.reload(); } catch {} finally { checking = false; } }, 1000); })();</script>`;
      const html = fs
        .readFileSync(htmlFile, "utf8")
        .replace(/<\/body>/i, () => reload + "</body>");
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      response.end(request.method === "HEAD" ? "" : html);
    } catch (error) {
      response.writeHead(500);
      response.end("Không đọc được HTML. Vui lòng xem cửa sổ đồng bộ.");
    }
  });
  let readyResolve, readyReject;
  const ready = new Promise((resolve, reject) => {
    readyResolve = resolve;
    readyReject = reject;
  });
  let candidate = port;
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && port !== 0 && candidate < port + 10) {
      candidate++;
      server.listen(candidate, "127.0.0.1");
    } else {
      unwatch();
      readyReject(error);
    }
  });
  server.once("listening", () => {
    const url = `http://127.0.0.1:${server.address().port}/`;
    console.log(
      `\nKhaiHoanShop: ${url}\nSửa Footer.tsx hoặc src/data/pens.json rồi nhấn Ctrl + S.\nGiữ cửa sổ này mở. Nhấn Ctrl + C để dừng.\n`,
    );
    if (open && process.platform === "win32")
      execFile("cmd.exe", ["/d", "/c", "start", "", url], (error) => {
        if (error) console.log("Hãy mở địa chỉ trên trong trình duyệt.");
      });
    readyResolve(url);
  });
  server.listen(candidate, "127.0.0.1");
  return {
    ready,
    close: () => {
      unwatch();
      return new Promise((resolve) => server.close(resolve));
    },
  };
}
module.exports = { readInfo, updateFooter, syncFooter, startPreview };

if (require.main === module) {
  try {
    const { values } = parseArgs({
      options: {
        once: { type: "boolean" },
        "no-open": { type: "boolean" },
        project: { type: "string" },
        html: { type: "string" },
        port: { type: "string" },
      },
    });
    const project = path.resolve(values.project || path.join(__dirname, ".."));
    const candidates = [
      path.join(project, "khaihoanstationery.html"),
      path.join(project, "..", path.basename(project) + ".html"),
      path.join(project, "..", "khaihoanstationery.html"),
      path.join(project, "..", "khaihoanstatinery.html"),
    ];
    const htmlFile = path.resolve(
      values.html || candidates.find((file) => fs.existsSync(file)) || candidates[0],
    );
    if (values.once) {
      const exporter = path.join(project, "scripts/export-pens-html.cjs");
      if (fs.existsSync(exporter)) require(exporter).exportPens(project, htmlFile);
      syncFooter(project, htmlFile);
      console.log(`Đã cập nhật ${htmlFile}`);
    } else {
      const port = values.port === undefined ? 8787 : Number(values.port);
      if (!Number.isInteger(port) || port < 0 || port > 65535)
        throw new Error("Cổng không hợp lệ.");
      const preview = startPreview({
        project,
        htmlFile,
        port,
        open: !values["no-open"],
      });
      preview.ready.catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
      });
      const stop = () => preview.close().then(() => process.exit());
      process.once("SIGINT", stop);
      process.once("SIGTERM", stop);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
