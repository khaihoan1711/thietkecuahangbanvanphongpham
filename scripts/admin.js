// ============================================================
// KHU QUẢN TRỊ (#quan-tri): chỉ tài khoản Admin vào được
// Dashboard, quản lý sản phẩm, danh mục, đơn hàng và người dùng.
// ============================================================

const adminRoot = document.getElementById("admin-root");

// Từ mức tồn kho này trở xuống được coi là sắp hết hàng.
const LOW_STOCK_LIMIT = 20;

const adminSections = [
  { id: "", label: "Tổng quan", icon: "▦", href: "#quan-tri" },
  { id: "san-pham", label: "Sản phẩm", icon: "✎", href: "#quan-tri/san-pham" },
  { id: "danh-muc", label: "Danh mục", icon: "☰", href: "#quan-tri/danh-muc" },
  { id: "don-hang", label: "Đơn hàng", icon: "▣", href: "#quan-tri/don-hang" },
  { id: "nguoi-dung", label: "Người dùng", icon: "☺", href: "#quan-tri/nguoi-dung" },
];

// Bộ lọc và trạng thái hiện tại của các trang quản trị.
const adminState = {
  section: "",
  search: "",
  category: "all",
  stock: "all",
  orderStatus: "all",
  role: "all",
  expandedCategoryId: null,
};

function resetAdminFilters() {
  adminState.search = "";
  adminState.category = "all";
  adminState.stock = "all";
  adminState.orderStatus = "all";
  adminState.role = "all";
  adminState.expandedCategoryId = null;
}

// ---------- Khung trang quản trị ----------

function renderNoPermission() {
  showView("page");
  pageRoot.innerHTML = /* HTML */ `
    <section class="page-section">
      <div class="wrap notice-box">
        <h1>Bạn không có quyền truy cập</h1>
        <p>Trang này chỉ dành cho quản trị viên.</p>
        <a
          class="btn"
          href="#"
        >
          Về trang chủ
        </a>
      </div>
    </section>
  `;
}

// Vẽ trang quản trị. keepScroll = true khi chỉ cập nhật lại sau một thao tác.
function renderAdminPage(sectionId, keepScroll = false) {
  const user = currentUser();

  if (!user) {
    renderLoginRequired("Vui lòng đăng nhập bằng tài khoản Admin để vào khu quản trị.");

    return;
  }

  if (user.role !== "admin") {
    renderNoPermission();

    return;
  }

  const section =
    adminSections.find((item) => item.id === sectionId) || adminSections[0];

  if (adminState.section !== section.id) {
    resetAdminFilters();
    adminState.section = section.id;
  }

  const pendingCount = orders.filter((order) => order.status === "pending").length;
  const links = adminSections
    .map(
      (item) => /* HTML */ `
        <a
          href="${item.href}"
          class="${item.id === section.id ? "active" : ""}"
        >
          <span aria-hidden="true">${item.icon}</span>
          <em>${item.label}</em>
          ${item.id === "don-hang" && pendingCount > 0
            ? "<b>" + pendingCount + "</b>"
            : ""}
        </a>
      `,
    )
    .join("");

  showView("admin");
  document.title = section.label + " — Quản trị KhaiHoanShop";
  adminRoot.innerHTML = /* HTML */ `
    <div class="admin-layout">
      <div
        class="admin-overlay"
        data-action="admin-menu-close"
      ></div>
      <aside
        class="admin-sidebar"
        id="admin-sidebar"
        aria-label="Menu quản trị"
      >
        <a
          class="admin-brand"
          href="#quan-tri"
        >
          KhaiHoanShop
          <small>QUẢN TRỊ</small>
        </a>
        <nav>${links}</nav>
        <a
          class="admin-store-link"
          href="#"
        >
          <span aria-hidden="true">↗</span>
          <em>Xem cửa hàng</em>
        </a>
      </aside>
      <div class="admin-main">
        <header class="admin-header">
          <button
            type="button"
            class="admin-burger"
            data-action="admin-menu"
            aria-label="Mở menu quản trị"
          >
            ☰
          </button>
          <h1>${section.label}</h1>
          <div class="admin-user">
            <span>${esc(user.fullName)}</span>
            <button
              type="button"
              data-action="logout"
            >
              Đăng xuất
            </button>
          </div>
        </header>
        <main
          class="admin-content"
          id="admin-content"
        >
          ${adminSectionHtml(section.id)}
        </main>
      </div>
    </div>
  `;
  refreshAdminTable();

  if (!keepScroll) {
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}

function adminSectionHtml(sectionId) {
  if (sectionId === "san-pham") return productsSectionHtml();
  if (sectionId === "danh-muc") return categoriesSectionHtml();
  if (sectionId === "don-hang") return ordersSectionHtml();
  if (sectionId === "nguoi-dung") return usersSectionHtml();

  return dashboardHtml();
}

// Vẽ lại riêng phần bảng (khi gõ tìm kiếm hoặc đổi bộ lọc) để ô nhập không bị mất con trỏ.
function refreshAdminTable() {
  if (adminState.section === "san-pham") refreshProductsTable();
  if (adminState.section === "danh-muc") refreshCategoriesTable();
  if (adminState.section === "don-hang") refreshOrdersTable();
  if (adminState.section === "nguoi-dung") refreshUsersTable();
}

function rerenderAdmin() {
  renderAdminPage(adminState.section, true);
}

actions["admin-menu"] = () => {
  document.getElementById("admin-sidebar").classList.add("open");
  document.querySelector(".admin-overlay").classList.add("open");
};

actions["admin-menu-close"] = () => {
  const sidebar = document.getElementById("admin-sidebar");
  const overlay = document.querySelector(".admin-overlay");

  if (sidebar) sidebar.classList.remove("open");
  if (overlay) overlay.classList.remove("open");
};

// Gõ vào ô tìm kiếm hoặc đổi bộ lọc thì cập nhật bảng.
function handleAdminFilter(event) {
  const name = event.target.dataset.adminFilter;

  if (!name) {
    return;
  }

  adminState[name] = event.target.value;
  refreshAdminTable();
}

// Bấm một liên kết trong menu bên trái thì đóng ngăn kéo (trên điện thoại).
adminRoot.addEventListener("click", (event) => {
  if (event.target.closest(".admin-sidebar a")) {
    actions["admin-menu-close"]();
  }
});

adminRoot.addEventListener("input", handleAdminFilter);
adminRoot.addEventListener("change", handleAdminFilter);

function pageHeaderHtml(title, description, actionHtml = "") {
  return /* HTML */ `
    <div class="admin-page-head">
      <div>
        <h2>${esc(title)}</h2>
        <p>${esc(description)}</p>
      </div>
      ${actionHtml}
    </div>
  `;
}

// ---------- Dashboard ----------

// 1.250.000 -> "1,3 tr", 85.000 -> "85k"
function formatShort(value) {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1).replace(".0", "").replace(".", ",") + " tr";
  }

  if (value >= 1000) {
    return Math.round(value / 1000) + "k";
  }

  return String(value);
}

// Biểu đồ cột doanh thu theo tháng, vẽ bằng SVG (không cần thư viện biểu đồ).
function revenueChartHtml(data) {
  const chartHeight = 180;
  const barWidth = 44;
  const slotWidth = 90;
  const width = data.length * slotWidth;
  const max = Math.max(...data.map((item) => item.revenue), 1);
  const gridLines = [0, 0.5, 1]
    .map((ratio) => {
      const y = 30 + chartHeight * ratio;

      return (
        '<line x1="0" x2="' +
        width +
        '" y1="' +
        y +
        '" y2="' +
        y +
        '" stroke="#E6E8EC"' +
        (ratio === 1 ? "" : ' stroke-dasharray="4 4"') +
        "/>"
      );
    })
    .join("");
  const bars = data
    .map((item, index) => {
      const barHeight = Math.round((item.revenue / max) * chartHeight);
      const x = index * slotWidth + (slotWidth - barWidth) / 2;
      const y = 30 + chartHeight - barHeight;
      const center = x + barWidth / 2;

      return /* HTML */ `
        <g>
          <rect
            x="${x}"
            y="${y}"
            width="${barWidth}"
            height="${barHeight}"
            rx="6"
            fill="#176bc0"
          >
            <title>${esc(item.label)}: ${money(item.revenue)}</title>
          </rect>
          <text
            x="${center}"
            y="${y - 8}"
            text-anchor="middle"
            font-size="13"
            font-weight="700"
            fill="#14365b"
          >
            ${item.revenue > 0 ? formatShort(item.revenue) : ""}
          </text>
          <text
            x="${center}"
            y="${chartHeight + 40}"
            text-anchor="middle"
            font-size="13"
            fill="#68707B"
          >
            ${esc(item.label)}
          </text>
        </g>
      `;
    })
    .join("");

  return /* HTML */ `
    <svg
      viewBox="0 0 ${width} ${chartHeight + 50}"
      role="img"
      aria-label="Biểu đồ doanh thu theo tháng"
      class="revenue-chart"
    >
      ${gridLines} ${bars}
    </svg>
  `;
}

function statCardHtml(label, value, icon, note = "") {
  return /* HTML */ `
    <div class="stat-card">
      <div>
        <p>${esc(label)}</p>
        <strong>${esc(value)}</strong>
      </div>
      <span aria-hidden="true">${icon}</span>
      ${note ? "<small>" + esc(note) + "</small>" : ""}
    </div>
  `;
}

function dashboardHtml() {
  const pendingCount = orders.filter((order) => order.status === "pending").length;
  const recent = [...orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);
  const lowStock = products
    .filter(
      (product) => product.stock !== undefined && product.stock <= LOW_STOCK_LIMIT,
    )
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 6);
  const lowStockHtml =
    lowStock.length === 0
      ? '<p class="muted">Tồn kho các sản phẩm đều ổn.</p>'
      : '<ul class="low-stock">' +
        lowStock
          .map(
            (product) =>
              "<li><span>" +
              esc(product.name) +
              "</span><b>Còn " +
              product.stock +
              "</b></li>",
          )
          .join("") +
        "</ul>";
  const recentRows = recent
    .map(
      (order) => /* HTML */ `
        <tr>
          <td><strong>${esc(order.id)}</strong></td>
          <td>${esc(order.customer.fullName)}</td>
          <td>${formatDate(order.createdAt)}</td>
          <td><strong>${money(order.total)}</strong></td>
          <td>${statusBadge(order.status)}</td>
        </tr>
      `,
    )
    .join("");

  return /* HTML */ `
    ${pageHeaderHtml(
      "Tổng quan",
      "Số liệu cập nhật theo dữ liệu đang lưu trong trình duyệt.",
      '<button type="button" class="btn light small" data-action="reset-data">Khôi phục dữ liệu mẫu</button>',
    )}
    <div class="stat-grid">
      ${statCardHtml("Tổng sản phẩm", String(products.length), "✎")}
      ${statCardHtml(
        "Tổng đơn hàng",
        String(orders.length),
        "▣",
        pendingCount + " đơn đang chờ xác nhận",
      )}
      ${statCardHtml("Tổng người dùng", String(users.length), "☺")}
      ${statCardHtml(
        "Tổng doanh thu",
        money(getTotalRevenue()),
        "₫",
        "Chỉ tính các đơn đã giao hàng",
      )}
    </div>
    <div class="admin-two-col">
      <section class="panel">
        <h3>Doanh thu 6 tháng gần nhất</h3>
        ${revenueChartHtml(getMonthlyRevenue())}
      </section>
      <section class="panel">
        <h3>Sản phẩm sắp hết hàng</h3>
        ${lowStockHtml}
      </section>
    </div>
    <section>
      <div class="admin-section-head">
        <h3>Đơn hàng gần đây</h3>
        <a href="#quan-tri/don-hang">Xem tất cả</a>
      </div>
      ${tableHtml(
        ["Mã đơn", "Khách hàng", "Ngày đặt", "Tổng tiền", "Trạng thái"],
        recentRows,
        recent.length,
        "Chưa có đơn hàng nào.",
      )}
    </section>
  `;
}

actions["reset-data"] = () => {
  confirmDialog({
    title: "Khôi phục dữ liệu mẫu",
    message:
      "Toàn bộ sản phẩm, danh mục, đơn hàng và tài khoản sẽ được đưa về dữ liệu mẫu ban đầu. Bạn sẽ bị đăng xuất. Thao tác này không thể hoàn tác.",
    confirmLabel: "Khôi phục",
    danger: true,
    onConfirm: () => {
      resetAllData();
      renderAccountLinks();
      toast("Đã khôi phục dữ liệu mẫu. Vui lòng đăng nhập lại.");
      route();
    },
  });
};

// ---------- Quản lý sản phẩm ----------

function productsSectionHtml() {
  const categoryOptions = [{ value: "all", label: "Tất cả danh mục" }].concat(
    categories.map((category) => ({ value: category.id, label: category.label })),
  );
  const stockOptions = [
    { value: "all", label: "Mọi tồn kho" },
    { value: "low", label: "Sắp hết hàng" },
    { value: "out", label: "Hết hàng" },
    { value: "unlimited", label: "Không giới hạn" },
  ];

  return /* HTML */ `
    ${pageHeaderHtml(
      "Quản lý sản phẩm",
      "Thêm, sửa, xóa sản phẩm. Thay đổi hiển thị ngay ở trang bán hàng.",
      '<button type="button" class="btn small" data-action="product-new">+ Thêm sản phẩm</button>',
    )}
    <div class="admin-toolbar">
      <input
        type="search"
        aria-label="Tìm sản phẩm"
        placeholder="Tìm theo tên, mã, thương hiệu..."
        value="${esc(adminState.search)}"
        data-admin-filter="search"
      />
      ${filterSelectHtml(
        "category",
        "Lọc theo danh mục",
        categoryOptions,
        adminState.category,
      )}
      ${filterSelectHtml("stock", "Lọc theo tồn kho", stockOptions, adminState.stock)}
    </div>
    <p
      class="muted"
      id="admin-count"
    ></p>
    <div id="admin-table"></div>
  `;
}

// Ô chọn dùng làm bộ lọc ở thanh công cụ.
function filterSelectHtml(filterName, label, options, current) {
  const optionsHtml = options
    .map(
      (option) =>
        '<option value="' +
        esc(option.value) +
        '"' +
        (option.value === current ? " selected" : "") +
        ">" +
        esc(option.label) +
        "</option>",
    )
    .join("");

  return (
    '<select aria-label="' +
    esc(label) +
    '" data-admin-filter="' +
    filterName +
    '">' +
    optionsHtml +
    "</select>"
  );
}

function matchesStock(product, filter) {
  if (filter === "unlimited") return product.stock === undefined;
  if (filter === "out") return product.stock === 0;
  if (filter === "low") {
    return (
      product.stock !== undefined &&
      product.stock > 0 &&
      product.stock <= LOW_STOCK_LIMIT
    );
  }

  return true;
}

function refreshProductsTable() {
  const needle = simplify(adminState.search.trim());
  const visible = products.filter(
    (product) =>
      (!needle ||
        simplify(product.name + " " + product.sku + " " + product.brand).includes(
          needle,
        )) &&
      (adminState.category === "all" || product.category === adminState.category) &&
      matchesStock(product, adminState.stock),
  );
  const rows = visible
    .map((product) => {
      const stockHtml =
        product.stock === undefined
          ? '<span class="muted">Không giới hạn</span>'
          : '<span class="' +
            (product.stock <= LOW_STOCK_LIMIT ? "stock-low" : "") +
            '">' +
            product.stock +
            "</span>";

      return /* HTML */ `
        <tr>
          <td>
            <div class="cell-product">
              <img
                src="${imageSrc(product.image)}"
                alt=""
              />
              <div>
                <strong>${esc(product.name)}</strong>
                <small>${esc(product.sku)}</small>
              </div>
            </div>
          </td>
          <td>${esc(categoryLabel(product.category))}</td>
          <td>${esc(product.brand)}</td>
          <td>
            <strong>${money(product.price)}</strong>
            ${product.oldPrice ? "<del>" + money(product.oldPrice) + "</del>" : ""}
          </td>
          <td>${stockHtml}</td>
          <td class="cell-actions">
            <button
              type="button"
              class="link"
              data-action="product-edit"
              data-id="${esc(product.id)}"
            >
              Sửa
            </button>
            <button
              type="button"
              class="link-danger"
              data-action="product-delete"
              data-id="${esc(product.id)}"
            >
              Xóa
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  document.getElementById("admin-count").innerHTML =
    "Hiển thị <strong>" +
    visible.length +
    "</strong> / " +
    products.length +
    " sản phẩm";
  document.getElementById("admin-table").innerHTML = tableHtml(
    ["Sản phẩm", "Danh mục", "Thương hiệu", "Giá", "Tồn kho", "Thao tác"],
    rows,
    visible.length,
    "Không tìm thấy sản phẩm phù hợp.",
  );
}

actions["product-new"] = () => openProductForm(null);

actions["product-edit"] = (button) => openProductForm(getProduct(button.dataset.id));

actions["product-delete"] = (button) => {
  const product = getProduct(button.dataset.id);

  if (!product) {
    return;
  }

  confirmDialog({
    title: "Xóa sản phẩm",
    message:
      'Bạn có chắc muốn xóa "' +
      product.name +
      '"? Sản phẩm sẽ biến mất khỏi trang bán hàng. Thao tác này không thể hoàn tác.',
    confirmLabel: "Xóa sản phẩm",
    danger: true,
    onConfirm: () => {
      deleteProduct(product.id);
      toast('Đã xóa sản phẩm "' + product.name + '".');
      rerenderAdmin();
    },
  });
};

// Form thêm mới (product = null) hoặc chỉnh sửa sản phẩm.
function openProductForm(product) {
  // Sản phẩm có nhiều đơn vị (hộp, cây...) thì giá hiển thị là giá của đơn vị đầu tiên.
  const firstUnit = product && product.units ? product.units[0] : null;
  const price = firstUnit ? firstUnit.price : product ? product.price : "";
  const oldPrice = (firstUnit ? firstUnit.oldPrice : product && product.oldPrice) || "";
  const image = product ? product.image : "";
  const isUploaded = image.startsWith("data:");
  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.label,
  }));

  openModal(
    product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm",
    /* HTML */ `
      <form
        class="stack-form"
        data-form="product"
        data-id="${esc(product ? product.id : "")}"
        novalidate
      >
        <div class="form-grid">
          <div class="span-2">
            ${fieldHtml({
              name: "name",
              label: "Tên sản phẩm",
              value: product ? product.name : "",
            })}
          </div>
          ${fieldHtml({
            name: "sku",
            label: "Mã sản phẩm (SKU)",
            value: product ? product.sku : "",
          })}
          ${fieldHtml({
            name: "brand",
            label: "Thương hiệu",
            value: product ? product.brand : "",
          })}
          ${selectHtml({
            name: "category",
            label: "Danh mục",
            value: product ? product.category : categoryOptions[0].value,
            options: categoryOptions,
          })}
          ${fieldHtml({
            name: "pack",
            label: "Quy cách",
            value: product ? product.pack : "",
            placeholder: "Ví dụ: Cuốn, Hộp, 1 cây",
          })}
          ${fieldHtml({
            name: "price",
            label: "Giá bán (₫)",
            type: "number",
            min: 0,
            value: String(price),
            hint: firstUnit
              ? "Sản phẩm có nhiều đơn vị: đây là giá của đơn vị đầu tiên."
              : "",
          })}
          ${fieldHtml({
            name: "oldPrice",
            label: "Giá cũ (₫, nếu đang giảm giá)",
            type: "number",
            min: 0,
            value: String(oldPrice),
          })}
          ${fieldHtml({
            name: "stock",
            label: "Số lượng tồn kho",
            type: "number",
            min: 0,
            value: product && product.stock !== undefined ? String(product.stock) : "",
            hint: "Để trống nếu không giới hạn số lượng.",
          })}
        </div>
        ${textareaHtml({
          name: "shortDescription",
          label: "Mô tả ngắn",
          rows: 2,
          value: product ? product.shortDescription : "",
        })}
        ${textareaHtml({
          name: "description",
          label: "Mô tả chi tiết",
          rows: 4,
          value: product ? product.description.join("\n\n") : "",
          hint: "Cách nhau một dòng trống để tách thành các đoạn.",
        })}
        <fieldset class="image-field">
          <legend>Hình ảnh</legend>
          <div class="image-field-row">
            <img
              id="image-preview"
              src="${image ? imageSrc(image) : ""}"
              alt="Ảnh sản phẩm"
              ${image ? "" : "hidden"}
            />
            <div class="image-field-controls">
              <input
                type="hidden"
                name="image"
                value="${isUploaded ? esc(image) : ""}"
              />
              ${fieldHtml({
                name: "imageUrl",
                label: "Đường dẫn ảnh",
                value: isUploaded ? "" : image,
                placeholder: "/images/products/ten-anh.jpg hoặc https://...",
              })}
              <label class="btn light small file-button">
                Tải ảnh từ máy
                <input
                  type="file"
                  accept="image/*"
                  data-image-file
                />
              </label>
            </div>
          </div>
        </fieldset>
        <fieldset class="check-row">
          <legend>Nhãn hiển thị</legend>
          <label class="check">
            <input
              type="checkbox"
              name="isHot"
              ${product && product.isHot ? "checked" : ""}
            />
            Nổi bật
          </label>
          <label class="check">
            <input
              type="checkbox"
              name="isNew"
              ${product && product.isNew ? "checked" : ""}
            />
            Sản phẩm mới
          </label>
          <label class="check">
            <input
              type="checkbox"
              name="isBestSeller"
              ${product && product.isBestSeller ? "checked" : ""}
            />
            Bán chạy
          </label>
        </fieldset>
        <p
          class="form-error"
          data-form-error
          role="alert"
        ></p>
        <div class="modal-actions">
          <button
            type="button"
            class="btn light"
            data-close
          >
            Hủy
          </button>
          <button
            type="submit"
            class="btn"
          >
            ${product ? "Xác nhận cập nhật" : "Xác nhận thêm sản phẩm"}
          </button>
        </div>
      </form>
    `,
    "lg",
  );
}

// Chọn ảnh từ máy: thu nhỏ rồi lưu dạng base64 vào ô ẩn.
modalContent.addEventListener("change", async (event) => {
  if (!event.target.matches("[data-image-file]")) {
    return;
  }

  const form = event.target.closest("form");
  const file = event.target.files[0];

  event.target.value = "";

  if (!file) {
    return;
  }

  try {
    const dataUrl = await resizeImageFile(file);
    const preview = document.getElementById("image-preview");

    form.elements.image.value = dataUrl;
    form.elements.imageUrl.value = "";
    preview.src = dataUrl;
    preview.hidden = false;
    showFormErrors(form, {});
  } catch (error) {
    showFormErrors(form, { imageUrl: error.message });
  }
});

// Gõ đường dẫn ảnh thì cập nhật ảnh xem trước và bỏ ảnh đã tải lên.
modalContent.addEventListener("input", (event) => {
  if (event.target.name !== "imageUrl") {
    return;
  }

  const form = event.target.closest("form");
  const preview = document.getElementById("image-preview");

  form.elements.image.value = "";
  preview.src = event.target.value ? imageSrc(event.target.value.trim()) : "";
  preview.hidden = !event.target.value;
});

function isWholeNumber(text) {
  return /^\d+$/.test(String(text).trim());
}

formHandlers.product = (form) => {
  const values = readForm(form);
  const existing = form.dataset.id ? getProduct(form.dataset.id) : null;
  const errors = {};
  const image = values.image || values.imageUrl.trim();
  const skuTaken = products.some(
    (item) =>
      (!existing || item.id !== existing.id) &&
      item.sku.toLowerCase() === values.sku.trim().toLowerCase(),
  );

  if (values.name.trim() === "") errors.name = "Vui lòng nhập tên sản phẩm";

  if (values.sku.trim() === "") errors.sku = "Vui lòng nhập mã sản phẩm";
  else if (skuTaken) errors.sku = "Mã sản phẩm này đã tồn tại";

  if (values.brand.trim() === "") errors.brand = "Vui lòng nhập thương hiệu";
  if (values.category === "") errors.category = "Vui lòng chọn danh mục";
  if (values.pack.trim() === "")
    errors.pack = "Vui lòng nhập quy cách (ví dụ: Cuốn, Hộp)";

  if (!isWholeNumber(values.price) || Number(values.price) <= 0) {
    errors.price = "Giá phải là số nguyên lớn hơn 0";
  }

  if (values.oldPrice.trim() !== "") {
    if (!isWholeNumber(values.oldPrice)) {
      errors.oldPrice = "Giá cũ phải là số nguyên";
    } else if (Number(values.oldPrice) <= Number(values.price)) {
      errors.oldPrice = "Giá cũ phải lớn hơn giá bán";
    }
  }

  if (values.stock.trim() !== "" && !isWholeNumber(values.stock)) {
    errors.stock = "Số lượng phải là số nguyên không âm";
  }

  if (values.shortDescription.trim() === "") {
    errors.shortDescription = "Vui lòng nhập mô tả ngắn";
  }

  if (image === "") errors.imageUrl = "Vui lòng nhập đường dẫn hoặc tải ảnh lên";

  const errorLine = form.querySelector("[data-form-error]");

  if (showFormErrors(form, errors)) {
    errorLine.textContent = "Vui lòng kiểm tra lại các thông tin được đánh dấu.";

    return;
  }

  const price = Number(values.price);
  const oldPrice = values.oldPrice.trim() === "" ? undefined : Number(values.oldPrice);
  const stock = values.stock.trim() === "" ? undefined : Number(values.stock);
  const shortDescription = values.shortDescription.trim();
  const paragraphs = values.description
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const saved = {
    // Giữ nguyên các trường form không chỉnh sửa (ảnh phụ, màu sắc, xếp hạng...)
    ...existing,
    id: existing
      ? existing.id
      : uniqueSlug(
          values.name,
          products.map((item) => item.id),
        ),
    sku: values.sku.trim(),
    name: values.name.trim(),
    brand: values.brand.trim(),
    category: values.category,
    pack: values.pack.trim(),
    price,
    oldPrice,
    stock,
    shortDescription,
    description: paragraphs.length > 0 ? paragraphs : [shortDescription],
    image,
    alt: values.name.trim(),
    isHot: values.isHot,
    isNew: values.isNew,
    isBestSeller: values.isBestSeller,
  };

  // Sản phẩm có nhiều đơn vị: cập nhật giá của đơn vị đầu tiên, các đơn vị khác giữ nguyên.
  if (existing && existing.units) {
    saved.units = existing.units.map((unit, index) =>
      index === 0 ? { ...unit, price, oldPrice } : unit,
    );
  }

  saveProduct(saved);
  closeModal();
  toast(existing ? "Đã cập nhật sản phẩm." : "Đã thêm sản phẩm mới.");
  rerenderAdmin();
};

// ---------- Quản lý danh mục ----------

function categoriesSectionHtml() {
  return /* HTML */ `
    ${pageHeaderHtml(
      "Quản lý danh mục",
      "Danh mục hiển thị trên thanh menu và trang chủ của cửa hàng.",
      '<button type="button" class="btn small" data-action="category-new">+ Thêm danh mục</button>',
    )}
    <div id="admin-table"></div>
  `;
}

function refreshCategoriesTable() {
  const rows = categories
    .map((category) => {
      const list = products.filter((product) => product.category === category.id);
      const isExpanded = adminState.expandedCategoryId === category.id;
      const productsHtml =
        list.length === 0
          ? '<p class="muted">Danh mục này chưa có sản phẩm.</p>'
          : '<ul class="mini-products">' +
            list
              .map(
                (product) =>
                  '<li><img src="' +
                  imageSrc(product.image) +
                  '" alt=""><div><strong>' +
                  esc(product.name) +
                  "</strong><small>" +
                  money(product.price) +
                  "</small></div></li>",
              )
              .join("") +
            "</ul>";

      return /* HTML */ `
        <tr>
          <td>
            <div class="cell-product">
              <span
                class="cat-icon"
                aria-hidden="true"
              >
                ${esc(category.icon)}
              </span>
              <div>
                <strong>${esc(category.label)}</strong>
                <small>${esc(category.short)}</small>
              </div>
            </div>
          </td>
          <td class="muted">#danh-muc/${esc(category.id)}</td>
          <td>
            <button
              type="button"
              class="link"
              data-action="category-toggle"
              data-id="${esc(category.id)}"
              aria-expanded="${isExpanded}"
            >
              ${list.length} sản phẩm ${isExpanded ? "▴" : "▾"}
            </button>
          </td>
          <td class="cell-actions">
            <button
              type="button"
              class="link"
              data-action="category-edit"
              data-id="${esc(category.id)}"
            >
              Sửa
            </button>
            <button
              type="button"
              class="link-danger"
              data-action="category-delete"
              data-id="${esc(category.id)}"
            >
              Xóa
            </button>
          </td>
        </tr>
        ${isExpanded
          ? '<tr class="expanded-row"><td colspan="4">' + productsHtml + "</td></tr>"
          : ""}
      `;
    })
    .join("");

  document.getElementById("admin-table").innerHTML = tableHtml(
    ["Danh mục", "Mã (đường dẫn)", "Số sản phẩm", "Thao tác"],
    rows,
    categories.length,
    "Chưa có danh mục nào.",
  );
}

actions["category-toggle"] = (button) => {
  adminState.expandedCategoryId =
    adminState.expandedCategoryId === button.dataset.id ? null : button.dataset.id;
  refreshCategoriesTable();
};

actions["category-new"] = () => openCategoryForm(null);

actions["category-edit"] = (button) => openCategoryForm(getCategory(button.dataset.id));

actions["category-delete"] = (button) => {
  const category = getCategory(button.dataset.id);

  if (!category) {
    return;
  }

  confirmDialog({
    title: "Xóa danh mục",
    message:
      'Bạn có chắc muốn xóa danh mục "' +
      category.label +
      '"? Danh mục còn sản phẩm sẽ không xóa được.',
    confirmLabel: "Xóa danh mục",
    danger: true,
    onConfirm: () => {
      const result = deleteCategory(category.id);

      if (result.ok) {
        toast('Đã xóa danh mục "' + category.label + '".');
      } else {
        toast(result.message, "error");
      }

      rerenderAdmin();
    },
  });
};

function openCategoryForm(category) {
  openModal(
    category ? "Chỉnh sửa danh mục" : "Thêm danh mục",
    /* HTML */ `
      <form
        class="stack-form"
        data-form="category"
        data-id="${esc(category ? category.id : "")}"
        novalidate
      >
        ${fieldHtml({
          name: "label",
          label: "Tên danh mục",
          value: category ? category.label : "",
        })}
        ${fieldHtml({
          name: "short",
          label: "Mô tả ngắn",
          value: category ? category.short : "",
          placeholder: "Ví dụ: Bút bi, bút gel, bút chì",
        })}
        ${fieldHtml({
          name: "icon",
          label: "Biểu tượng (không bắt buộc)",
          value: category ? category.icon : "",
          hint: "Một ký tự hoặc emoji hiển thị ở trang chủ.",
        })}
        <div class="modal-actions">
          <button
            type="button"
            class="btn light"
            data-close
          >
            Hủy
          </button>
          <button
            type="submit"
            class="btn"
          >
            ${category ? "Xác nhận cập nhật" : "Xác nhận thêm danh mục"}
          </button>
        </div>
      </form>
    `,
    "sm",
  );
}

formHandlers.category = (form) => {
  const values = readForm(form);
  const existing = form.dataset.id ? getCategory(form.dataset.id) : null;
  const errors = {};
  const labelTaken = categories.some(
    (item) =>
      (!existing || item.id !== existing.id) &&
      item.label.toLowerCase() === values.label.trim().toLowerCase(),
  );

  if (values.label.trim() === "") errors.label = "Vui lòng nhập tên danh mục";
  else if (labelTaken) errors.label = "Tên danh mục này đã tồn tại";

  if (values.short.trim() === "") errors.short = "Vui lòng nhập mô tả ngắn";
  if (values.icon.trim().length > 2) errors.icon = "Biểu tượng tối đa 2 ký tự";

  if (showFormErrors(form, errors)) {
    return;
  }

  saveCategory({
    // Mã danh mục dùng trong đường dẫn nên không đổi khi sửa.
    id: existing
      ? existing.id
      : uniqueSlug(
          values.label,
          categories.map((item) => item.id),
        ),
    label: values.label.trim(),
    short: values.short.trim(),
    icon: values.icon.trim() || "◆",
  });
  closeModal();
  toast(existing ? "Đã cập nhật danh mục." : "Đã thêm danh mục mới.");
  rerenderAdmin();
};

// ---------- Quản lý đơn hàng ----------

function ordersSectionHtml() {
  const statusOptions = [{ value: "all", label: "Tất cả trạng thái" }].concat(
    ORDER_STATUSES.map((status) => ({ value: status.value, label: status.label })),
  );

  return /* HTML */ `
    ${pageHeaderHtml(
      "Quản lý đơn hàng",
      "Xem chi tiết và cập nhật trạng thái các đơn hàng.",
    )}
    <div class="admin-toolbar">
      <input
        type="search"
        aria-label="Tìm đơn hàng"
        placeholder="Tìm theo mã đơn, tên, số điện thoại..."
        value="${esc(adminState.search)}"
        data-admin-filter="search"
      />
      ${filterSelectHtml(
        "orderStatus",
        "Lọc theo trạng thái",
        statusOptions,
        adminState.orderStatus,
      )}
    </div>
    <p
      class="muted"
      id="admin-count"
    ></p>
    <div id="admin-table"></div>
  `;
}

function refreshOrdersTable() {
  const needle = simplify(adminState.search.trim());
  const visible = orders
    .filter(
      (order) =>
        (!needle ||
          simplify(
            order.id + " " + order.customer.fullName + " " + order.customer.phone,
          ).includes(needle)) &&
        (adminState.orderStatus === "all" || order.status === adminState.orderStatus),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const rows = visible
    .map(
      (order) => /* HTML */ `
        <tr>
          <td><strong>${esc(order.id)}</strong></td>
          <td>
            <strong>${esc(order.customer.fullName)}</strong>
            <small>${esc(order.customer.phone)}</small>
          </td>
          <td>${formatDateTime(order.createdAt)}</td>
          <td><strong>${money(order.total)}</strong></td>
          <td>${statusBadge(order.status)}</td>
          <td class="cell-actions">
            <button
              type="button"
              class="link"
              data-action="order-open"
              data-id="${esc(order.id)}"
            >
              Chi tiết
            </button>
          </td>
        </tr>
      `,
    )
    .join("");

  document.getElementById("admin-count").innerHTML =
    "Hiển thị <strong>" + visible.length + "</strong> / " + orders.length + " đơn hàng";
  document.getElementById("admin-table").innerHTML = tableHtml(
    ["Mã đơn", "Khách hàng", "Ngày đặt", "Tổng tiền", "Trạng thái", "Thao tác"],
    rows,
    visible.length,
    "Không tìm thấy đơn hàng phù hợp.",
  );
}

actions["order-open"] = (button) => openOrderModal(button.dataset.id);

// Hộp thoại chi tiết đơn hàng, cho phép Admin cập nhật trạng thái.
function openOrderModal(orderId) {
  const order = orders.find((item) => item.id === orderId);

  if (!order) {
    return;
  }

  const locked = isFinalStatus(order.status);

  openModal(
    "Đơn hàng " + order.id,
    /* HTML */ `
      ${orderTrackerHtml(order.status)}
      <div class="status-editor">
        ${selectHtml({
          name: "status",
          label: "Trạng thái đơn hàng",
          value: order.status,
          options: ORDER_STATUSES.map((status) => ({
            value: status.value,
            label: status.label,
          })),
        }).replace("<select", locked ? "<select disabled" : "<select")}
        <button
          type="button"
          class="btn small"
          data-action="order-save-status"
          data-id="${esc(order.id)}"
          ${locked ? "disabled" : ""}
        >
          Cập nhật trạng thái
        </button>
      </div>
      ${locked
        ? '<p class="muted">Đơn đã giao hoặc đã hủy nên không thể đổi trạng thái.</p>'
        : ""}
      ${orderDetailHtml(order)}
    `,
    "lg",
  );
}

actions["order-save-status"] = (button) => {
  const orderId = button.dataset.id;
  const select = document.getElementById("f-status");
  const order = orders.find((item) => item.id === orderId);

  if (!order || select.value === order.status) {
    return;
  }

  const result = updateOrderStatus(orderId, select.value);

  if (result.ok) {
    toast("Đã cập nhật đơn " + orderId + ".");
  } else {
    toast(result.message, "error");
  }

  rerenderAdmin();
  openOrderModal(orderId);
};

// ---------- Quản lý người dùng ----------

function usersSectionHtml() {
  const roleOptions = [
    { value: "all", label: "Mọi quyền" },
    { value: "admin", label: "Admin" },
    { value: "user", label: "User" },
  ];

  return /* HTML */ `
    ${pageHeaderHtml(
      "Quản lý người dùng",
      "Khóa/mở khóa tài khoản và phân biệt quyền Admin, User.",
    )}
    <div class="admin-toolbar">
      <input
        type="search"
        aria-label="Tìm người dùng"
        placeholder="Tìm theo tên, email, số điện thoại..."
        value="${esc(adminState.search)}"
        data-admin-filter="search"
      />
      ${filterSelectHtml("role", "Lọc theo quyền", roleOptions, adminState.role)}
    </div>
    <p
      class="muted"
      id="admin-count"
    ></p>
    <div id="admin-table"></div>
  `;
}

function refreshUsersTable() {
  const needle = simplify(adminState.search.trim());
  const me = currentUser();
  const visible = users.filter(
    (user) =>
      (!needle ||
        simplify(user.fullName + " " + user.email + " " + user.phone).includes(
          needle,
        )) &&
      (adminState.role === "all" || user.role === adminState.role),
  );
  const rows = visible
    .map((user) => {
      const isSelf = me && user.id === me.id;
      const disabled = isSelf ? "disabled" : "";

      return /* HTML */ `
        <tr>
          <td>
            <strong>
              ${esc(user.fullName)}${isSelf ? " <small>(Bạn)</small>" : ""}
            </strong>
            <small>${esc(user.email)}</small>
          </td>
          <td>${esc(user.phone)}</td>
          <td>
            <span class="role role-${user.role}">
              ${user.role === "admin" ? "Admin" : "User"}
            </span>
          </td>
          <td>
            <span
              class="status ${user.isLocked ? "status-cancelled" : "status-delivered"}"
            >
              ${user.isLocked ? "Đã khóa" : "Hoạt động"}
            </span>
          </td>
          <td>${formatDate(user.createdAt)}</td>
          <td class="cell-actions">
            <button
              type="button"
              class="link"
              data-action="user-view"
              data-id="${esc(user.id)}"
            >
              Xem
            </button>
            <button
              type="button"
              class="link-danger"
              data-action="${user.isLocked ? "user-unlock" : "user-lock"}"
              data-id="${esc(user.id)}"
              ${disabled}
            >
              ${user.isLocked ? "Mở khóa" : "Khóa"}
            </button>
            <button
              type="button"
              class="link"
              data-action="user-role"
              data-id="${esc(user.id)}"
              ${disabled}
            >
              ${user.role === "admin" ? "Thu quyền" : "Cấp Admin"}
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  document.getElementById("admin-count").innerHTML =
    "Hiển thị <strong>" + visible.length + "</strong> / " + users.length + " tài khoản";
  document.getElementById("admin-table").innerHTML = tableHtml(
    ["Người dùng", "Số điện thoại", "Quyền", "Trạng thái", "Ngày tạo", "Thao tác"],
    rows,
    visible.length,
    "Không tìm thấy người dùng phù hợp.",
  );
}

// Xác nhận rồi chạy một thao tác trên tài khoản.
function confirmUserAction(userId, config) {
  const user = users.find((item) => item.id === userId);

  if (!user) {
    return;
  }

  confirmDialog({
    title: config.title,
    message: config.message(user),
    confirmLabel: config.confirmLabel(user),
    danger: Boolean(config.danger),
    onConfirm: () => {
      const result = config.run(user);

      if (result.ok) {
        toast("Đã cập nhật tài khoản.");
      } else {
        toast(result.message, "error");
      }

      rerenderAdmin();
    },
  });
}

actions["user-lock"] = (button) =>
  confirmUserAction(button.dataset.id, {
    title: "Khóa tài khoản",
    message: (user) =>
      "Khóa tài khoản của " +
      user.fullName +
      "? Người này sẽ không thể đăng nhập cho đến khi được mở khóa.",
    confirmLabel: () => "Khóa tài khoản",
    danger: true,
    run: (user) => setUserLocked(user.id, true),
  });

actions["user-unlock"] = (button) =>
  confirmUserAction(button.dataset.id, {
    title: "Mở khóa tài khoản",
    message: (user) =>
      "Mở khóa tài khoản của " +
      user.fullName +
      "? Người này có thể đăng nhập trở lại.",
    confirmLabel: () => "Mở khóa",
    run: (user) => setUserLocked(user.id, false),
  });

actions["user-role"] = (button) =>
  confirmUserAction(button.dataset.id, {
    title: "Đổi quyền tài khoản",
    message: (user) =>
      user.role === "user"
        ? "Cấp quyền Admin cho " +
          user.fullName +
          "? Người này sẽ vào được khu vực quản trị."
        : "Thu hồi quyền Admin của " +
          user.fullName +
          "? Người này sẽ trở thành người dùng thường.",
    confirmLabel: (user) =>
      user.role === "user" ? "Cấp quyền Admin" : "Thu hồi quyền",
    run: (user) => setUserRole(user.id, user.role === "admin" ? "user" : "admin"),
  });

// Hộp thoại xem thông tin tài khoản và các đơn hàng của người dùng.
actions["user-view"] = (button) => {
  const user = users.find((item) => item.id === button.dataset.id);

  if (!user) {
    return;
  }

  const list = getUserOrders(user);
  const spent = list
    .filter((order) => order.status === "delivered")
    .reduce((sum, order) => sum + order.total, 0);
  const address = user.address
    ? [
        user.address.address,
        user.address.ward,
        user.address.district,
        user.address.province,
      ]
        .filter(Boolean)
        .join(", ")
    : "Chưa cập nhật";
  const infoRows = [
    ["Họ và tên", user.fullName],
    ["Email", user.email],
    ["Số điện thoại", user.phone],
    ["Quyền", user.role === "admin" ? "Quản trị viên (Admin)" : "Người dùng (User)"],
    ["Trạng thái", user.isLocked ? "Đã bị khóa" : "Đang hoạt động"],
    ["Ngày tạo", formatDate(user.createdAt)],
    ["Địa chỉ", address],
    ["Tổng đã mua (đơn đã giao)", money(spent)],
  ]
    .map(
      ([label, value]) =>
        "<div><dt>" + esc(label) + "</dt><dd>" + esc(value) + "</dd></div>",
    )
    .join("");
  const orderRows =
    list.length === 0
      ? '<p class="muted">Người dùng này chưa có đơn hàng nào.</p>'
      : '<ul class="user-orders">' +
        list
          .map(
            (order) =>
              "<li><strong>" +
              esc(order.id) +
              "</strong><span>" +
              formatDate(order.createdAt) +
              "</span><b>" +
              money(order.total) +
              "</b>" +
              statusBadge(order.status) +
              "</li>",
          )
          .join("") +
        "</ul>";

  openModal(
    "Thông tin tài khoản",
    '<dl class="info-grid">' +
      infoRows +
      "</dl><h3>Đơn hàng (" +
      list.length +
      ")</h3>" +
      orderRows,
    "md",
  );
};
