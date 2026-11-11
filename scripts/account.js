// ============================================================
// NGƯỜI DÙNG: đăng ký, đăng nhập, trang tài khoản, thanh toán và đặt hàng
// ============================================================

const pageRoot = document.getElementById("page-view");

// Vẽ lại các liên kết tài khoản ở thanh trên cùng theo trạng thái đăng nhập.
function renderAccountLinks() {
  const element = document.getElementById("account-links");
  const user = currentUser();

  if (!user) {
    element.innerHTML = /* HTML */ `
      <a
        href="#"
        data-login
      >
        Đăng nhập
      </a>
      <a
        href="#"
        data-register
      >
        Đăng ký
      </a>
    `;

    return;
  }

  element.innerHTML = /* HTML */ `
    <span class="hello">
      Xin chào,
      <b>${esc(user.fullName)}</b>
    </span>
    ${user.role === "admin"
      ? '<a class="admin-link" href="#quan-tri">Quản trị</a>'
      : ""}
    <a href="#tai-khoan">Tài khoản</a>
    <button
      type="button"
      data-action="logout"
    >
      Đăng xuất
    </button>
  `;
}

// Gọi sau khi đăng nhập, đăng ký hoặc đăng xuất để cập nhật giao diện.
function afterAuthChange(goToAdmin) {
  renderAccountLinks();

  // Admin vừa đăng nhập từ trang bán hàng thì vào thẳng khu quản trị.
  if (goToAdmin && isAdmin() && currentView === "home") {
    goTo("#quan-tri");

    return;
  }

  route();
}

actions.logout = () => {
  logoutUser();
  renderAccountLinks();
  toast("Bạn đã đăng xuất.");
  goTo("#");
};

// ---------- Hộp thoại đăng nhập và đăng ký ----------

function openLoginModal() {
  openModal(
    "Đăng nhập",
    /* HTML */ `
      <form
        class="stack-form"
        data-form="login"
        novalidate
      >
        ${fieldHtml({
          name: "email",
          label: "Email",
          type: "email",
          autocomplete: "email",
        })}
        ${fieldHtml({
          name: "password",
          label: "Mật khẩu",
          type: "password",
          autocomplete: "current-password",
        })}
        <label class="check">
          <input
            type="checkbox"
            name="remember"
            checked
          />
          Ghi nhớ đăng nhập
        </label>
        <p
          class="form-error"
          data-form-error
          role="alert"
        ></p>
        <button
          class="btn"
          type="submit"
        >
          Đăng nhập
        </button>
        <p class="switch-auth">
          Chưa có tài khoản?
          <a
            href="#"
            data-register
          >
            Đăng ký
          </a>
        </p>
      </form>
    `,
    "sm",
  );
}

function openRegisterModal() {
  openModal(
    "Đăng ký",
    /* HTML */ `
      <form
        class="stack-form"
        data-form="register"
        novalidate
      >
        ${fieldHtml({ name: "fullName", label: "Họ và tên", autocomplete: "name" })}
        ${fieldHtml({
          name: "email",
          label: "Email",
          type: "email",
          autocomplete: "email",
        })}
        ${fieldHtml({
          name: "phone",
          label: "Số điện thoại",
          type: "tel",
          autocomplete: "tel",
        })}
        ${fieldHtml({
          name: "password",
          label: "Mật khẩu",
          type: "password",
          autocomplete: "new-password",
        })}
        ${fieldHtml({
          name: "confirmPassword",
          label: "Xác nhận mật khẩu",
          type: "password",
          autocomplete: "new-password",
        })}
        <p
          class="form-error"
          data-form-error
          role="alert"
        ></p>
        <button
          class="btn"
          type="submit"
        >
          Đăng ký
        </button>
        <p class="switch-auth">
          Đã có tài khoản?
          <a
            href="#"
            data-login
          >
            Đăng nhập
          </a>
        </p>
      </form>
    `,
    "sm",
  );
}

formHandlers.login = (form) => {
  const values = readForm(form);
  const errors = {};

  if (values.email.trim() === "") {
    errors.email = "Vui lòng nhập email";
  } else if (!isValidEmail(values.email)) {
    errors.email = "Email không hợp lệ (ví dụ: ten@email.com)";
  }

  if (values.password === "") {
    errors.password = "Vui lòng nhập mật khẩu";
  }

  if (showFormErrors(form, errors)) {
    return;
  }

  // Kiểm tra với danh sách tài khoản trong LocalStorage.
  const result = loginUser(values.email, values.password, values.remember);

  if (!result.ok) {
    form.querySelector("[data-form-error]").textContent = result.message;
    toast(result.message, "error");

    return;
  }

  closeModal();
  toast("Đăng nhập thành công!");
  afterAuthChange(true);
};

formHandlers.register = (form) => {
  const values = readForm(form);
  const errors = {};

  if (values.fullName.trim() === "") {
    errors.fullName = "Vui lòng nhập họ và tên";
  }

  if (values.email.trim() === "") {
    errors.email = "Vui lòng nhập email";
  } else if (!isValidEmail(values.email)) {
    errors.email = "Email không hợp lệ (ví dụ: ten@email.com)";
  }

  if (values.phone.trim() === "") {
    errors.phone = "Vui lòng nhập số điện thoại";
  } else if (!isValidPhone(values.phone)) {
    errors.phone = "Số điện thoại không hợp lệ (ví dụ: 0901234567)";
  }

  if (values.password === "") {
    errors.password = "Vui lòng nhập mật khẩu";
  } else if (values.password.length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
  }

  if (values.confirmPassword === "") {
    errors.confirmPassword = "Vui lòng xác nhận mật khẩu";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Mật khẩu xác nhận không khớp";
  }

  if (showFormErrors(form, errors)) {
    return;
  }

  // Lưu tài khoản mới vào LocalStorage (có kiểm tra email đã đăng ký) và đăng nhập luôn.
  const result = registerUser(values);

  if (!result.ok) {
    showFormErrors(form, { email: result.message });
    form.querySelector("[data-form-error]").textContent = result.message;

    return;
  }

  closeModal();
  toast("Đăng ký thành công! Chào mừng bạn đến KhaiHoanShop.");
  afterAuthChange(false);
};

// ---------- Trang yêu cầu đăng nhập ----------

// Hiện khi người chưa đăng nhập vào trang cần đăng nhập (tài khoản, quản trị).
function renderLoginRequired(message) {
  showView("page");
  pageRoot.innerHTML = /* HTML */ `
    <section class="page-section">
      <div class="wrap notice-box">
        <h1>Cần đăng nhập</h1>
        <p>${esc(message)}</p>
        <button
          type="button"
          class="btn"
          data-login
        >
          Đăng nhập
        </button>
      </div>
    </section>
  `;
}

// ---------- Trang tài khoản ----------

const accountTabs = [
  { id: "profile", label: "Thông tin cá nhân" },
  { id: "orders", label: "Đơn hàng của tôi" },
  { id: "address", label: "Địa chỉ" },
  { id: "password", label: "Đổi mật khẩu" },
];

// Mã đơn hàng đang mở chi tiết trong tab "Đơn hàng của tôi"
let openOrderId = null;

function renderAccountPage(tab) {
  const user = currentUser();

  if (!user) {
    renderLoginRequired("Vui lòng đăng nhập để xem tài khoản của bạn.");

    return;
  }

  const activeTab = accountTabs.some((item) => item.id === tab) ? tab : "profile";
  const nav = accountTabs
    .map(
      (item) => /* HTML */ `
        <a
          href="#tai-khoan/${item.id}"
          class="${item.id === activeTab ? "active" : ""}"
        >
          ${esc(item.label)}
        </a>
      `,
    )
    .join("");

  showView("page");
  document.title = "Tài khoản — KhaiHoanShop";
  pageRoot.innerHTML = /* HTML */ `
    <section class="page-section">
      <div class="wrap">
        <h1 class="page-title">Tài khoản của tôi</h1>
        <div class="account-layout">
          <nav
            class="account-nav"
            aria-label="Tài khoản"
          >
            ${nav}
            ${user.role === "admin" ? '<a href="#quan-tri">Khu vực quản trị</a>' : ""}
            <button
              type="button"
              data-action="logout"
            >
              Đăng xuất
            </button>
          </nav>
          <section
            class="account-panel"
            id="account-panel"
          >
            ${accountPanelHtml(activeTab, user)}
          </section>
        </div>
      </div>
    </section>
  `;
  window.scrollTo({ top: 0, behavior: "instant" });
}

function accountPanelHtml(tab, user) {
  if (tab === "orders") {
    return ordersPanelHtml(user);
  }

  const address = user.address || {};

  if (tab === "address") {
    return /* HTML */ `
      <form
        class="stack-form"
        data-form="address"
        novalidate
      >
        <h2>Địa chỉ</h2>
        <p class="muted">Địa chỉ nhận hàng mặc định của bạn.</p>
        ${fieldHtml({
          name: "province",
          label: "Tỉnh / Thành phố",
          value: address.province || "",
        })}
        ${fieldHtml({
          name: "district",
          label: "Quận / Huyện",
          value: address.district || "",
        })}
        ${fieldHtml({ name: "ward", label: "Phường / Xã", value: address.ward || "" })}
        ${fieldHtml({
          name: "address",
          label: "Địa chỉ cụ thể",
          value: address.address || "",
          autocomplete: "street-address",
        })}
        <button
          class="btn"
          type="submit"
        >
          Lưu địa chỉ
        </button>
      </form>
    `;
  }

  if (tab === "password") {
    return /* HTML */ `
      <form
        class="stack-form"
        data-form="password"
        novalidate
      >
        <h2>Đổi mật khẩu</h2>
        ${fieldHtml({
          name: "currentPassword",
          label: "Mật khẩu hiện tại",
          type: "password",
          autocomplete: "current-password",
        })}
        ${fieldHtml({
          name: "newPassword",
          label: "Mật khẩu mới",
          type: "password",
          autocomplete: "new-password",
        })}
        ${fieldHtml({
          name: "confirmPassword",
          label: "Xác nhận mật khẩu mới",
          type: "password",
          autocomplete: "new-password",
        })}
        <button
          class="btn"
          type="submit"
        >
          Đổi mật khẩu
        </button>
      </form>
    `;
  }

  return /* HTML */ `
    <form
      class="stack-form"
      data-form="profile"
      novalidate
    >
      <h2>Thông tin cá nhân</h2>
      ${fieldHtml({
        name: "fullName",
        label: "Họ và tên",
        value: user.fullName,
        autocomplete: "name",
      })}
      ${fieldHtml({
        name: "email",
        label: "Email",
        type: "email",
        value: user.email,
        autocomplete: "email",
      })}
      ${fieldHtml({
        name: "phone",
        label: "Số điện thoại",
        type: "tel",
        value: user.phone,
        autocomplete: "tel",
      })}
      <button
        class="btn"
        type="submit"
      >
        Lưu thay đổi
      </button>
    </form>
  `;
}

// Danh sách đơn hàng của người dùng, kèm theo dõi trạng thái và hủy đơn đang chờ xác nhận.
function ordersPanelHtml(user) {
  const list = getUserOrders(user);

  if (list.length === 0) {
    return /* HTML */ `
      <h2>Đơn hàng của tôi</h2>
      <p class="empty-note">
        Bạn chưa có đơn hàng nào.
        <a href="#tat-ca">Bắt đầu mua sắm</a>
      </p>
    `;
  }

  const cards = list
    .map((order) => {
      const isOpen = openOrderId === order.id;

      return /* HTML */ `
        <li class="order-card">
          <div class="order-card-head">
            <div>
              <strong>Mã đơn hàng: ${esc(order.id)}</strong>
              <span class="muted">Ngày đặt: ${formatDate(order.createdAt)}</span>
            </div>
            ${statusBadge(order.status)}
          </div>
          <div class="order-card-foot">
            <span>
              Tổng tiền:
              <b class="price">${money(order.total)}</b>
            </span>
            <span class="order-card-actions">
              ${order.status === "pending"
                ? '<button type="button" class="link-danger" data-action="cancel-order" data-id="' +
                  esc(order.id) +
                  '">Hủy đơn</button>'
                : ""}
              <button
                type="button"
                class="link"
                data-action="toggle-order"
                data-id="${esc(order.id)}"
                aria-expanded="${isOpen}"
              >
                ${isOpen ? "Ẩn chi tiết" : "Xem chi tiết"}
              </button>
            </span>
          </div>
          ${isOpen
            ? '<div class="order-card-detail">' +
              orderTrackerHtml(order.status) +
              orderDetailHtml(order) +
              "</div>"
            : ""}
        </li>
      `;
    })
    .join("");

  return '<h2>Đơn hàng của tôi</h2><ul class="order-list">' + cards + "</ul>";
}

// Vẽ lại riêng khung nội dung của trang tài khoản (không đổi tab).
function refreshAccountPanel() {
  const panel = document.getElementById("account-panel");
  const user = currentUser();

  if (panel && user) {
    panel.innerHTML = ordersPanelHtml(user);
  }
}

actions["toggle-order"] = (button) => {
  openOrderId = openOrderId === button.dataset.id ? null : button.dataset.id;
  refreshAccountPanel();
};

actions["cancel-order"] = (button) => {
  const orderId = button.dataset.id;

  confirmDialog({
    title: "Hủy đơn hàng",
    message:
      "Bạn có chắc muốn hủy đơn hàng " + orderId + "? Thao tác này không thể hoàn tác.",
    confirmLabel: "Hủy đơn hàng",
    danger: true,
    onConfirm: () => {
      const result = updateOrderStatus(orderId, "cancelled");

      if (result.ok) {
        toast("Đã hủy đơn hàng " + orderId + ".");
      } else {
        toast(result.message, "error");
      }

      refreshAccountPanel();
    },
  });
};

formHandlers.profile = (form) => {
  const values = readForm(form);
  const errors = {};

  if (values.fullName.trim() === "") {
    errors.fullName = "Vui lòng nhập họ và tên";
  }

  if (values.email.trim() === "") {
    errors.email = "Vui lòng nhập email";
  } else if (!isValidEmail(values.email)) {
    errors.email = "Email không hợp lệ (ví dụ: ten@email.com)";
  }

  if (values.phone.trim() === "") {
    errors.phone = "Vui lòng nhập số điện thoại";
  } else if (!isValidPhone(values.phone)) {
    errors.phone = "Số điện thoại không hợp lệ (ví dụ: 0901234567)";
  }

  if (showFormErrors(form, errors)) {
    return;
  }

  const result = updateProfile(values);

  if (!result.ok) {
    showFormErrors(form, { email: result.message });
    toast(result.message, "error");

    return;
  }

  renderAccountLinks();
  toast("Đã lưu thông tin cá nhân.");
};

formHandlers.address = (form) => {
  const values = readForm(form);
  const errors = {};
  const required = [
    ["province", "Vui lòng nhập tỉnh / thành phố"],
    ["district", "Vui lòng nhập quận / huyện"],
    ["ward", "Vui lòng nhập phường / xã"],
    ["address", "Vui lòng nhập địa chỉ cụ thể"],
  ];

  for (const [name, message] of required) {
    if (values[name].trim() === "") {
      errors[name] = message;
    }
  }

  if (showFormErrors(form, errors)) {
    return;
  }

  updateAddress({
    province: values.province.trim(),
    district: values.district.trim(),
    ward: values.ward.trim(),
    address: values.address.trim(),
  });
  toast("Đã lưu địa chỉ giao hàng.");
};

formHandlers.password = (form) => {
  const values = readForm(form);
  const errors = {};

  if (values.currentPassword === "") {
    errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
  }

  if (values.newPassword === "") {
    errors.newPassword = "Vui lòng nhập mật khẩu mới";
  } else if (values.newPassword.length < 6) {
    errors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
  }

  if (values.confirmPassword === "") {
    errors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
  } else if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = "Mật khẩu xác nhận không khớp";
  }

  if (showFormErrors(form, errors)) {
    return;
  }

  const result = changePassword(values.currentPassword, values.newPassword);

  if (!result.ok) {
    showFormErrors(form, { currentPassword: result.message });
    toast(result.message, "error");

    return;
  }

  form.reset();
  toast("Đổi mật khẩu thành công.");
};

// ---------- Thanh toán và đặt hàng ----------

// Mã đơn hàng vừa đặt (sau khi đặt, giỏ hàng được làm trống)
let placedOrderId = null;

const checkoutFields = [
  ["fullName", "Họ và tên", "Vui lòng nhập họ và tên"],
  ["phone", "Số điện thoại", "Vui lòng nhập số điện thoại"],
  ["email", "Email", "Vui lòng nhập email"],
  ["province", "Tỉnh / Thành phố", "Vui lòng nhập tỉnh / thành phố"],
  ["district", "Quận / Huyện", "Vui lòng nhập quận / huyện"],
  ["ward", "Phường / Xã", "Vui lòng nhập phường / xã"],
  ["address", "Địa chỉ cụ thể", "Vui lòng nhập địa chỉ cụ thể"],
];

function renderCheckoutPage() {
  const lines = cartLines();

  showView("page");
  document.title = "Thanh toán — KhaiHoanShop";
  window.scrollTo({ top: 0, behavior: "instant" });

  // Vừa đặt xong: giỏ hàng đã trống nên hiện thông báo thành công.
  if (placedOrderId && lines.length === 0) {
    const orderLink = currentUser()
      ? '<a class="btn" href="#tai-khoan/orders">Xem đơn hàng của tôi</a>'
      : "";

    pageRoot.innerHTML = /* HTML */ `
      <section class="page-section">
        <div class="wrap notice-box">
          <h1 role="status">Đặt hàng thành công!</h1>
          <p>
            Cảm ơn bạn đã mua sắm tại KhaiHoanShop. Mã đơn hàng của bạn là
            <strong>${esc(placedOrderId)}</strong>
            .
          </p>
          <div class="buttons center">
            ${orderLink}
            <a
              class="btn light"
              href="#tat-ca"
            >
              Tiếp tục mua sắm
            </a>
          </div>
        </div>
      </section>
    `;

    return;
  }

  if (lines.length === 0) {
    pageRoot.innerHTML = /* HTML */ `
      <section class="page-section">
        <div class="wrap notice-box">
          <h1>Giỏ hàng của bạn đang trống</h1>
          <a
            class="btn"
            href="#tat-ca"
          >
            Tiếp tục mua sắm
          </a>
        </div>
      </section>
    `;

    return;
  }

  // Người đã đăng nhập thì điền sẵn thông tin giao hàng từ tài khoản.
  const user = currentUser();
  const address = (user && user.address) || {};
  const prefill = {
    fullName: user ? user.fullName : "",
    phone: user ? user.phone : "",
    email: user ? user.email : "",
    province: address.province || "",
    district: address.district || "",
    ward: address.ward || "",
    address: address.address || "",
  };
  const totals = calculateTotals(lines);
  const fieldsHtml = checkoutFields
    .map(([name, label]) => {
      const type = name === "email" ? "email" : name === "phone" ? "tel" : "text";

      return fieldHtml({ name, label, type, value: prefill[name] });
    })
    .join("");
  const summaryItems = lines
    .map(
      (line) => /* HTML */ `
        <li>
          <div>
            <strong>${esc(line.product.name)}</strong>
            <span>${esc(line.product.pack)} · Số lượng: ${line.quantity}</span>
          </div>
          <b>${money(line.product.price * line.quantity)}</b>
        </li>
      `,
    )
    .join("");

  pageRoot.innerHTML = /* HTML */ `
    <section class="page-section">
      <div class="wrap">
        <h1 class="page-title">Thanh toán</h1>
        <form
          class="checkout-layout"
          data-form="checkout"
          novalidate
        >
          <div class="checkout-main">
            <section class="panel">
              <h2>Thông tin giao hàng</h2>
              <div class="form-grid">
                ${fieldsHtml}
                ${textareaHtml({
                  name: "note",
                  label: "Ghi chú đơn hàng (không bắt buộc)",
                })}
              </div>
            </section>
            <fieldset class="panel">
              <legend>Phương thức thanh toán</legend>
              <label class="check">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked
                />
                Thanh toán khi nhận hàng (COD)
              </label>
              <label class="check">
                <input
                  type="radio"
                  name="payment"
                  value="bank"
                />
                Chuyển khoản ngân hàng
              </label>
            </fieldset>
          </div>
          <aside class="panel checkout-summary">
            <h2>Đơn hàng của bạn</h2>
            <ul class="summary-items">
              ${summaryItems}
            </ul>
            <dl class="order-totals">
              <div>
                <dt>Tạm tính</dt>
                <dd>${money(totals.subtotal)}</dd>
              </div>
              <div>
                <dt>Phí vận chuyển</dt>
                <dd>${money(totals.shipping)}</dd>
              </div>
              <div>
                <dt>Giảm giá</dt>
                <dd>−${money(totals.discount)}</dd>
              </div>
              <div class="grand">
                <dt>Tổng cộng</dt>
                <dd>${money(totals.total)}</dd>
              </div>
            </dl>
            <p
              class="form-error"
              data-form-error
              role="alert"
            ></p>
            <button
              class="btn full"
              type="submit"
            >
              Đặt hàng
            </button>
            <a
              class="back-link"
              href="#"
              data-action="open-cart"
            >
              Quay lại giỏ hàng
            </a>
          </aside>
        </form>
      </div>
    </section>
  `;
}

actions["open-cart"] = () => {
  document.getElementById("cart-dialog").showModal();
};

formHandlers.checkout = (form) => {
  const values = readForm(form);
  const errors = {};

  for (const [name, , message] of checkoutFields) {
    if (values[name].trim() === "") {
      errors[name] = message;
    }
  }

  if (!errors.phone && !isValidPhone(values.phone)) {
    errors.phone = "Số điện thoại không hợp lệ (ví dụ: 0901234567)";
  }

  if (!errors.email && !isValidEmail(values.email)) {
    errors.email = "Email không hợp lệ (ví dụ: ten@email.com)";
  }

  const errorLine = form.querySelector("[data-form-error]");

  if (showFormErrors(form, errors)) {
    errorLine.textContent = "Vui lòng kiểm tra lại các thông tin được đánh dấu.";

    return;
  }

  errorLine.textContent = "";

  const lines = cartLines();
  const totals = calculateTotals(lines);
  const user = currentUser();

  // Tạo đơn hàng (lưu trong LocalStorage) rồi làm trống giỏ hàng.
  const order = placeOrder({
    userId: user ? user.id : null,
    customer: {
      fullName: values.fullName.trim(),
      phone: values.phone.trim(),
      email: normalizeEmail(values.email),
    },
    shipping: {
      province: values.province.trim(),
      district: values.district.trim(),
      ward: values.ward.trim(),
      address: values.address.trim(),
    },
    note: values.note.trim(),
    payment: values.payment,
    items: lines.map((line) => ({
      productId: line.product.id,
      name: line.product.name,
      image: line.product.image,
      pack: line.product.pack,
      price: line.product.price,
      quantity: line.quantity,
      stockUnits: line.product.count,
    })),
    subtotal: totals.subtotal,
    shippingFee: totals.shipping,
    discount: totals.discount,
    total: totals.total,
  });

  clearCart();
  placedOrderId = order.id;
  toast("Đặt hàng thành công. Mã đơn: " + order.id);
  renderCheckoutPage();
};
