// Đổi đường dẫn ảnh thành ảnh nhúng để HTML có thể mở độc lập.
for (const product of products) {
  product.image = productImages[product.image];
  product.images = (product.images || []).map((image) => productImages[image]);

  for (const color of product.colors || []) {
    color.image = productImages[color.image];
  }
}

const categories = {
  but: ["Bút viết", "✎"],
  "vo-so": ["Vở & Sổ", "▤"],
  giay: ["Giấy văn phòng", "▱"],
  "dung-cu": ["Dụng cụ", "⌁"],
  "hoa-pham": ["Họa phẩm", "◉"],
  balo: ["Balo & Hộp bút", "▣"],
};
const money = (n) => new Intl.NumberFormat("vi-VN").format(n) + "₫";
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
const card = (p) => /* HTML */ `
  <article class="card">
    <div class="card-art">
      <a
        href="#san-pham/${encodeURIComponent(p.id)}"
        aria-label="Xem chi tiết ${esc(p.name)}"
      >
        <img
          loading="lazy"
          src="${p.image}"
          alt="${esc(p.alt)}"
        />
      </a>
      <span class="badge">${categories[p.category][0]}</span>
      ${p.isNew ? '<span class="badge new">MỚI</span>' : ""}${p.oldPrice
        ? /* HTML */ `
            <span class="badge sale">
              -${Math.round((1 - p.price / p.oldPrice) * 100)}%
            </span>
          `
        : ""}
    </div>
    <div class="card-body">
      <span class="brand">${esc(p.brand)} · ${esc(p.sku)}</span>
      <h3><a href="#san-pham/${encodeURIComponent(p.id)}">${esc(p.name)}</a></h3>
      <span class="pack">${esc(p.pack)}</span>
      <div class="prices">
        <span class="price">${money(p.price)}</span>
        ${p.oldPrice
          ? /* HTML */ `
              <del>${money(p.oldPrice)}</del>
            `
          : ""}
      </div>
      ${p.units
        ? /* HTML */ `
            <a
              class="add choose-product"
              href="#san-pham/${encodeURIComponent(p.id)}"
            >
              Chọn mua
            </a>
          `
        : /* HTML */ `
            <button
              class="add"
              data-add="${esc(p.id)}"
            >
              + Thêm vào giỏ
            </button>
          `}
    </div>
  </article>
`;
const render = (id, list) =>
  (document.getElementById(id).innerHTML = list.map(card).join(""));
render("featured-grid", products.filter((p) => p.isHot).slice(0, 8));
render(
  "best-grid",
  products
    .filter((p) => p.isBestSeller || p.rank)
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
    .slice(0, 8),
);
render(
  "new-grid",
  products.filter((p) => p.isNew),
);
render("sale-grid", products.filter((p) => p.oldPrice > p.price).slice(0, 8));
render(
  "pen-grid",
  products.filter((p) => p.category === "but"),
);
document.getElementById("categories").innerHTML = Object.entries(categories)
  .map(
    ([id, [label, icon]]) => /* HTML */ `
      <button
        class="category"
        data-category="${id}"
      >
        <b aria-hidden="true">${icon}</b>
        <span>${label}</span>
      </button>
    `,
  )
  .join("");
document.getElementById("category-menu").innerHTML = Object.entries(categories)
  .map(
    ([id, [label, icon]]) => /* HTML */ `
      <button data-category="${id}">${icon} ${label}</button>
    `,
  )
  .join("");
document.getElementById("filter-category").innerHTML += Object.entries(categories)
  .map(
    ([id, [label]]) => /* HTML */ `
      <option value="${id}">${label}</option>
    `,
  )
  .join("");
const simplify = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
function catalog() {
  const q = simplify(document.getElementById("catalog-search").value.trim()),
    cat = document.getElementById("filter-category").value,
    sort = document.getElementById("sort").value;
  const list = products.filter(
    (p) =>
      (cat === "all" || cat === p.category) &&
      simplify(
        p.name + " " + p.brand + " " + p.sku + " " + p.shortDescription,
      ).includes(q),
  );
  if (sort === "asc") list.sort((a, b) => a.price - b.price);
  if (sort === "desc") list.sort((a, b) => b.price - a.price);
  if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name, "vi"));
  if (sort === "featured")
    list.sort((a, b) => Number(Boolean(b.isHot)) - Number(Boolean(a.isHot)));
  render("all-grid", list);
  if (!list.length)
    document.getElementById("all-grid").innerHTML =
      '<p class="empty">Không tìm thấy sản phẩm phù hợp.</p>';
  document.getElementById("results").textContent = list.length + " sản phẩm";
}
["catalog-search", "filter-category", "sort"].forEach((id) =>
  document
    .getElementById(id)
    .addEventListener(id === "catalog-search" ? "input" : "change", catalog),
);
catalog();
document.getElementById("header-search").addEventListener("submit", (e) => {
  e.preventDefault();
  showHome();
  location.hash = "tat-ca";
  document.getElementById("catalog-search").value = e.target.elements.q.value;
  document.getElementById("filter-category").value = "all";
  catalog();
  document.getElementById("tat-ca").scrollIntoView();
});
let cart = [];
try {
  const saved = JSON.parse(localStorage.getItem("khaihoanshop-html-cart") || "[]");
  cart = normalizeCart(
    Array.isArray(saved)
      ? saved.map(
          (i) =>
            i && {
              ...i,
              productId: i.productId ?? i.id,
              quantity: i.quantity ?? i.qty,
            },
        )
      : [],
    products,
  );
} catch {}
const detailRoot = document.getElementById("product-detail");
let activeProduct = null,
  activeImages = [],
  activeSelection = {},
  activeImage = "";
function save() {
  try {
    localStorage.setItem("khaihoanshop-html-cart", JSON.stringify(cart));
  } catch {}
  refreshCart();
  if (activeProduct) syncDetail();
}
function refreshCart() {
  document.getElementById("cart-count").textContent = cart.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  document.getElementById("cart-lines").innerHTML = cart.length
    ? cart
        .map((item) => {
          const base = products.find((p) => p.id === item.productId),
            p = selectedProduct(base, item),
            key = cartKey(item);
          return /* HTML */ `
            <div class="cart-line">
              <img
                src="${p.image}"
                alt="${esc(p.alt)}"
              />
              <div class="info">
                <a
                  href="#san-pham/${encodeURIComponent(p.id)}"
                  data-cart-detail
                >
                  <strong>${esc(p.name)}</strong>
                </a>
                <div class="muted">${esc(p.pack)}</div>
                <div class="muted">${money(p.price)} × ${item.quantity}</div>
                <strong>${money(p.price * item.quantity)}</strong>
              </div>
              <input
                aria-label="Số lượng ${esc(p.name)} ${esc(p.pack)}"
                type="number"
                min="1"
                max="${maxCartQuantity(base, cart, item)}"
                value="${item.quantity}"
                data-qty="${esc(key)}"
              />
              <button
                class="remove"
                data-remove="${esc(key)}"
                aria-label="Xóa ${esc(p.name)} ${esc(p.pack)}"
              >
                Xóa
              </button>
            </div>
          `;
        })
        .join("")
    : '<p class="empty">Giỏ hàng đang trống. Chọn món đồ bạn yêu thích nhé!</p>';
  document.getElementById("cart-total").textContent =
    "Tạm tính: " +
    money(
      cart.reduce(
        (sum, item) =>
          sum +
          selectedProduct(
            products.find((p) => p.id === item.productId),
            item,
          ).price *
            item.quantity,
        0,
      ),
    );
}
refreshCart();
let toastTimer;
function toast(text) {
  const el = document.getElementById("toast");
  el.textContent = text;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 2400);
}
function showHome() {
  document.getElementById("main").hidden = false;
  detailRoot.hidden = true;
  activeProduct = null;
  document.title = "KhaiHoanShop | KhaiHoan Stationery";
}
function remaining() {
  const existing = cart.find(
    (item) =>
      cartKey(item) ===
      cartKey({
        productId: activeProduct.id,
        ...selectionFor(activeProduct, activeSelection),
      }),
  );
  return (
    maxCartQuantity(activeProduct, cart, activeSelection) - (existing?.quantity ?? 0)
  );
}
function detailQuantity() {
  const n = Number(document.getElementById("detail-quantity").value);
  return Number.isFinite(n)
    ? Math.max(1, Math.min(Math.max(1, remaining()), Math.floor(n)))
    : 1;
}
function syncQuantity(value) {
  const limit = Math.max(1, remaining());
  document.getElementById("detail-quantity").value = Math.max(
    1,
    Math.min(limit, value),
  );
  document.getElementById("detail-quantity").max = limit;
  document.getElementById("quantity-minus").disabled = value <= 1;
  document.getElementById("quantity-plus").disabled = value >= limit;
}
function syncDetail() {
  const p = selectedProduct(activeProduct, activeSelection);
  document.getElementById("detail-image").src = activeImage;
  document.getElementById("selected-price").textContent = money(p.price);
  const old = document.getElementById("selected-old-price");
  old.textContent = p.oldPrice ? money(p.oldPrice) : "";
  old.hidden = !p.oldPrice;
  detailRoot
    .querySelectorAll("[data-gallery]")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(activeImages[Number(button.dataset.gallery)] === activeImage),
      ),
    );
  detailRoot
    .querySelectorAll("[data-unit]")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.unit === activeSelection.unitId),
      ),
    );
  detailRoot
    .querySelectorAll("[data-color]")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.color === activeSelection.colorId),
      ),
    );
  const name = document.getElementById("selected-color");
  if (name)
    name.textContent =
      activeProduct.colors.find((c) => c.id === activeSelection.colorId)?.label || "";
  detailRoot.querySelectorAll("[data-purchase]").forEach((button) => {
    button.disabled = remaining() <= 0;
  });
  const hint = document.getElementById("stock-hint");
  if (hint)
    hint.textContent =
      remaining() <= 0
        ? "Bạn đã chọn hết số lượng có sẵn."
        : `Có sẵn: ${activeProduct.stock} cây`;
  syncQuantity(detailQuantity());
}
function chooseImage(src) {
  activeImage = src;
  const color = activeProduct.colors?.find((c) => c.image === src);
  if (color) activeSelection.colorId = color.id;
  syncDetail();
  syncQuantity(1);
  document.getElementById("purchase-message").textContent = "";
}
function renderDetail(product) {
  activeProduct = product;
  activeSelection = selectionFor(product);
  activeImage = selectedProduct(product).image;
  activeImages = [...new Set([product.image, ...(product.images || [])])];
  const category = categories[product.category][0],
    isPen = !!product.units;
  const related = [
    ...products.filter((p) => p.id !== product.id && p.category === product.category),
    ...products.filter((p) => p.id !== product.id && p.category !== product.category),
  ].slice(0, 4);
  detailRoot.innerHTML = /* HTML */ `
    <section class="detail-heading">
      <div class="wrap">
        <h2>${esc(category)}</h2>
        <nav
          class="breadcrumbs"
          aria-label="Đường dẫn sản phẩm"
        >
          <a href="#">Trang chủ</a>
          <span aria-hidden="true">›</span>
          <a
            href="#tat-ca"
            data-category="${product.category}"
          >
            ${esc(category)}
          </a>
          <span aria-hidden="true">›</span>
          <span aria-current="page">${esc(product.name)}</span>
        </nav>
      </div>
    </section>
    <section class="detail-top ${isPen ? "pen-detail" : ""}">
      <div class="wrap detail-layout">
        <div>
          <div class="gallery-main">
            <img
              id="detail-image"
              src="${activeImage}"
              alt="${esc(product.alt)}"
            />
            ${activeImages.length > 1
              ? '<button type="button" class="gallery-arrow previous" data-gallery-step="-1" aria-label="Ảnh trước">‹</button><button type="button" class="gallery-arrow next" data-gallery-step="1" aria-label="Ảnh tiếp theo">›</button>'
              : ""}
          </div>
          <div
            class="gallery-thumbs"
            aria-label="Ảnh sản phẩm"
          >
            ${activeImages
              .map(
                (image, i) => /* HTML */ `
                  <button
                    type="button"
                    data-gallery="${i}"
                    aria-label="Xem ảnh ${i + 1}"
                    aria-pressed="${activeImage === image}"
                  >
                    <img
                      src="${image}"
                      alt="${esc(product.name)} — ảnh ${i + 1}"
                    />
                  </button>
                `,
              )
              .join("")}
          </div>
        </div>
        <div class="detail-info">
          <h1
            id="detail-title"
            tabindex="-1"
          >
            ${esc(product.name)}
          </h1>
          <div class="detail-meta">
            <div>
              Thương hiệu:
              <span>${esc(product.brand)}</span>
            </div>
            ${isPen
              ? /* HTML */ `
                  <div>
                    Tình trạng:
                    <span>${product.stock ? "Còn hàng" : "Hết hàng"}</span>
                  </div>
                `
              : /* HTML */ `
                  <div>
                    Quy cách:
                    <span>${esc(product.pack)}</span>
                  </div>
                `}
          </div>
          <div
            class="detail-price"
            aria-live="polite"
          >
            <strong id="selected-price">${money(product.price)}</strong>
            <del
              id="selected-old-price"
              ${product.oldPrice ? "" : "hidden"}
            >
              ${product.oldPrice ? money(product.oldPrice) : ""}
            </del>
          </div>
          <p class="detail-summary">${esc(product.shortDescription)}</p>
          ${isPen
            ? /* HTML */ `
                <fieldset class="option-row">
                  <legend class="sr-only">Đơn vị tính</legend>
                  <span class="option-label">Đơn vị tính:</span>
                  ${product.units
                    .map(
                      (unit) => /* HTML */ `
                        <button
                          type="button"
                          class="unit-option"
                          data-unit="${esc(unit.id)}"
                          aria-pressed="${unit.id === activeSelection.unitId}"
                        >
                          ${esc(unit.label)}
                        </button>
                      `,
                    )
                    .join("")}
                </fieldset>
              `
            : ""}
          ${product.colors?.length
            ? /* HTML */ `
                <fieldset class="option-row">
                  <legend class="sr-only">Màu mực</legend>
                  <span class="option-label">Màu mực:</span>
                  ${product.colors
                    .map(
                      (color) => /* HTML */ `
                        <button
                          type="button"
                          class="color-option"
                          data-color="${esc(color.id)}"
                          aria-label="Màu ${esc(color.label)}"
                          title="${esc(color.label)}"
                          style="background:${color.hex}"
                          aria-pressed="${color.id === activeSelection.colorId}"
                        ></button>
                      `,
                    )
                    .join("")}
                  <span
                    id="selected-color"
                    class="muted"
                  ></span>
                </fieldset>
              `
            : ""}
          <label
            class="quantity-label"
            for="detail-quantity"
          >
            Số lượng:
          </label>
          <div class="quantity-control">
            <button
              type="button"
              id="quantity-minus"
              data-step="-1"
              aria-label="Giảm số lượng"
              disabled
            >
              −
            </button>
            <input
              id="detail-quantity"
              type="number"
              min="1"
              max="999"
              value="1"
            />
            <button
              type="button"
              id="quantity-plus"
              data-step="1"
              aria-label="Tăng số lượng"
            >
              +
            </button>
          </div>
          ${isPen ? '<p id="stock-hint" class="muted"></p>' : ""}
          <div class="purchase-buttons">
            ${isPen
              ? '<button type="button" class="btn pen-add" data-purchase="add">THÊM VÀO GIỎ HÀNG</button>'
              : '<button type="button" class="btn" data-purchase="buy">MUA NGAY</button><button type="button" class="btn light" data-purchase="add">+ Thêm vào giỏ</button>'}
          </div>
          <p
            id="purchase-message"
            class="purchase-message"
            role="status"
          ></p>
          <a
            class="back-products"
            href="#tat-ca"
            data-category="${product.category}"
          >
            ← Xem thêm ${esc(category.toLowerCase())}
          </a>
        </div>
      </div>
    </section>
    <div class="wrap detail-sections">
      <section class="detail-panel">
        <h2>Mô tả sản phẩm</h2>
        ${product.description
          .map(
            (text) => /* HTML */ `
              <p>${esc(text)}</p>
            `,
          )
          .join("")}
      </section>
      <section class="detail-panel">
        <h2>Thông tin sản phẩm</h2>
        <dl>
          ${[
            ["Mã sản phẩm", product.sku],
            ["Thương hiệu", product.brand],
            ["Danh mục", category],
            [
              "Quy cách",
              isPen ? product.units.map((u) => u.label).join(" / ") : product.pack,
            ],
            ...(isPen ? [["Số lượng có sẵn", product.stock + " cây"]] : []),
          ]
            .map(
              ([label, value]) => /* HTML */ `
                <div>
                  <dt>${label}</dt>
                  <dd>${esc(value)}</dd>
                </div>
              `,
            )
            .join("")}
        </dl>
      </section>
    </div>
    <section class="section">
      <div class="wrap">
        <div class="section-head">
          <h2>Sản phẩm liên quan</h2>
          <a href="#tat-ca">Xem tất cả →</a>
        </div>
        <div class="grid">${related.map(card).join("")}</div>
      </div>
    </section>
  `;
  document.getElementById("main").hidden = true;
  detailRoot.hidden = false;
  document.title = product.name + " — KhaiHoanShop";
  syncDetail();
  window.scrollTo({ top: 0, behavior: "instant" });
  document.getElementById("detail-title").focus({ preventScroll: true });
}
function route() {
  if (location.hash.startsWith("#san-pham/")) {
    let id;
    try {
      id = decodeURIComponent(location.hash.slice(10));
    } catch {
      id = "";
    }
    const product = products.find((p) => p.id === id);
    if (product) {
      renderDetail(product);
      return;
    }
    showHome();
    toast("Không tìm thấy sản phẩm. Vui lòng chọn sản phẩm khác.");
    return;
  }
  const wasDetail = !detailRoot.hidden;
  showHome();
  if (wasDetail) {
    const target = document.getElementById(location.hash.slice(1));
    if (target) target.scrollIntoView();
    else window.scrollTo({ top: 0, behavior: "instant" });
  }
}
document.addEventListener("click", (event) => {
  const target = event.target;
  const add = target.closest("[data-add]");
  if (add) {
    const p = products.find((p) => p.id === add.dataset.add);
    if (p) {
      cart = putCartItem(cart, p, 1, {}, true);
      save();
      toast("Đã thêm sản phẩm vào giỏ hàng");
    }
  }
  const category = target.closest("[data-category]");
  if (category) {
    event.preventDefault();
    showHome();
    location.hash = "tat-ca";
    document.getElementById("filter-category").value = category.dataset.category;
    document.getElementById("catalog-search").value = "";
    catalog();
    document.getElementById("tat-ca").scrollIntoView();
  }
  const remove = target.closest("[data-remove]");
  if (remove) {
    cart = cart.filter((item) => cartKey(item) !== remove.dataset.remove);
    save();
  }
  if (target.closest("[data-login]")) {
    event.preventDefault();
    document.getElementById("login-dialog").showModal();
  }
  const close = target.closest("[data-close]");
  if (close) close.closest("dialog").close();
  if (target.closest("[data-cart-detail]"))
    document.getElementById("cart-dialog").close();
  if (!activeProduct) return;
  const thumb = target.closest("[data-gallery]");
  if (thumb) chooseImage(activeImages[Number(thumb.dataset.gallery)]);
  const arrow = target.closest("[data-gallery-step]");
  if (arrow)
    chooseImage(
      activeImages[
        (activeImages.indexOf(activeImage) +
          Number(arrow.dataset.galleryStep) +
          activeImages.length) %
          activeImages.length
      ],
    );
  const unit = target.closest("[data-unit]");
  if (unit) {
    activeSelection.unitId = unit.dataset.unit;
    syncDetail();
    syncQuantity(1);
    document.getElementById("purchase-message").textContent = "";
  }
  const color = target.closest("[data-color]");
  if (color) {
    activeSelection.colorId = color.dataset.color;
    chooseImage(activeProduct.colors.find((c) => c.id === color.dataset.color).image);
  }
  const step = target.closest("[data-step]");
  if (step) syncQuantity(detailQuantity() + Number(step.dataset.step));
  const purchase = target.closest("[data-purchase]");
  if (purchase && remaining() > 0) {
    const quantity = detailQuantity(),
      p = selectedProduct(activeProduct, activeSelection);
    cart = putCartItem(cart, activeProduct, quantity, activeSelection, true);
    save();
    syncQuantity(1);
    document.getElementById("purchase-message").textContent =
      `Đã thêm ${quantity} ${p.pack.toLowerCase()} vào giỏ hàng.`;
    if (purchase.dataset.purchase === "buy")
      document.getElementById("cart-dialog").showModal();
    else toast("Đã thêm sản phẩm vào giỏ hàng");
  }
});
document.addEventListener("change", (event) => {
  if (event.target.matches("[data-qty]")) {
    const item = cart.find((i) => cartKey(i) === event.target.dataset.qty);
    if (item) {
      cart = putCartItem(
        cart,
        products.find((p) => p.id === item.productId),
        Number(event.target.value),
        item,
      );
      save();
    }
  }
  if (event.target.id === "detail-quantity" && activeProduct)
    syncQuantity(detailQuantity());
});
document
  .getElementById("cart-button")
  .addEventListener("click", () => document.getElementById("cart-dialog").showModal());
document.getElementById("login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  document.getElementById("login-status").textContent =
    "Đây là form minh họa. Chưa xác thực hoặc lưu tài khoản.";
});
window.addEventListener("hashchange", route);
route();
