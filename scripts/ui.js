// ============================================================
// THÀNH PHẦN GIAO DIỆN DÙNG CHUNG
// Thông báo, hộp thoại, ô nhập liệu, bảng, nhãn trạng thái, xử lý nút bấm và form.
// ============================================================

// ---------- Thông báo (toast) ----------

let toastTimer;

function toast(text, kind = "success") {
  const element = document.getElementById("toast");

  element.textContent = text;
  element.className = kind === "error" ? "toast toast-error" : "toast";
  element.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    element.hidden = true;
  }, 3200);
}

// ---------- Hộp thoại dùng chung ----------

const modalDialog = document.getElementById("modal-dialog");
const modalContent = document.getElementById("modal-content");

// size: "sm" | "md" | "lg"
function openModal(title, bodyHtml, size = "md") {
  modalDialog.className = "modal modal-" + size;
  modalContent.innerHTML = /* HTML */ `
    <div class="dialog-head">
      <h2>${esc(title)}</h2>
      <button
        type="button"
        class="close"
        data-close
        aria-label="Đóng"
      >
        ×
      </button>
    </div>
    <div class="modal-body">${bodyHtml}</div>
  `;

  if (!modalDialog.open) {
    modalDialog.showModal();
  }
}

function closeModal() {
  if (modalDialog.open) {
    modalDialog.close();
  }
}

// Bấm vào nền tối bên ngoài hộp thoại thì đóng lại.
modalDialog.addEventListener("click", (event) => {
  if (event.target === modalDialog) {
    closeModal();
  }
});

// Hộp thoại xác nhận trước khi xóa hoặc thực hiện thao tác quan trọng.
let confirmCallback = null;

function confirmDialog({
  title,
  message,
  confirmLabel = "Xác nhận",
  danger = false,
  onConfirm,
}) {
  confirmCallback = onConfirm;
  openModal(
    title,
    /* HTML */ `
      <p class="modal-message">${esc(message)}</p>
      <div class="modal-actions">
        <button
          type="button"
          class="btn light"
          data-close
        >
          Hủy
        </button>
        <button
          type="button"
          class="btn ${danger ? "danger" : ""}"
          data-action="confirm-yes"
        >
          ${esc(confirmLabel)}
        </button>
      </div>
    `,
    "sm",
  );
}

// ---------- Xử lý nút bấm và form theo tên ----------
// Nút có data-action="ten" sẽ gọi actions.ten(nút). Form có data-form="ten" gọi formHandlers.ten(form).

const actions = {};
const formHandlers = {};

actions["confirm-yes"] = () => {
  const callback = confirmCallback;

  confirmCallback = null;
  closeModal();

  if (callback) {
    callback();
  }
};

document.addEventListener("click", (event) => {
  const element = event.target.closest("[data-action]");

  if (!element) {
    return;
  }

  const handler = actions[element.dataset.action];

  if (handler) {
    event.preventDefault();
    handler(element);
  }
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("form[data-form]");

  if (!form) {
    return;
  }

  event.preventDefault();

  const handler = formHandlers[form.dataset.form];

  if (handler) {
    handler(form);
  }
});

// Chuyển trang bằng hash. Nếu đang ở đúng hash đó thì vẽ lại trang.
function goTo(hash) {
  if (location.hash === hash || (hash === "#" && location.hash === "")) {
    route();
  } else {
    location.hash = hash;
  }
}

// ---------- Ô nhập liệu ----------

function fieldHtml({
  name,
  label,
  type = "text",
  value = "",
  placeholder = "",
  hint = "",
  autocomplete = "",
  min = "",
  disabled = false,
}) {
  return /* HTML */ `
    <div class="field">
      <label for="f-${name}">${esc(label)}</label>
      <input
        id="f-${name}"
        name="${name}"
        type="${type}"
        value="${esc(value)}"
        placeholder="${esc(placeholder)}"
        ${autocomplete ? 'autocomplete="' + autocomplete + '"' : ""}
        ${min !== "" ? 'min="' + min + '"' : ""}
        ${disabled ? "disabled" : ""}
      />
      ${hint ? '<p class="field-hint">' + esc(hint) + "</p>" : ""}
      <p
        class="field-error"
        data-error-for="${name}"
      ></p>
    </div>
  `;
}

function selectHtml({ name, label, value = "", options, hint = "" }) {
  const optionsHtml = options
    .map(
      (option) => /* HTML */ `
        <option
          value="${esc(option.value)}"
          ${option.value === value ? "selected" : ""}
        >
          ${esc(option.label)}
        </option>
      `,
    )
    .join("");

  return /* HTML */ `
    <div class="field">
      <label for="f-${name}">${esc(label)}</label>
      <select
        id="f-${name}"
        name="${name}"
      >
        ${optionsHtml}
      </select>
      ${hint ? '<p class="field-hint">' + esc(hint) + "</p>" : ""}
      <p
        class="field-error"
        data-error-for="${name}"
      ></p>
    </div>
  `;
}

function textareaHtml({ name, label, value = "", rows = 3, hint = "" }) {
  return /* HTML */ `
    <div class="field">
      <label for="f-${name}">${esc(label)}</label>
      <textarea
        id="f-${name}"
        name="${name}"
        rows="${rows}"
      >
${esc(value)}</textarea
      >
      ${hint ? '<p class="field-hint">' + esc(hint) + "</p>" : ""}
      <p
        class="field-error"
        data-error-for="${name}"
      ></p>
    </div>
  `;
}

// Đọc toàn bộ giá trị của form thành một object { tên: giá trị }. Ô tick cho giá trị true/false.
function readForm(form) {
  const values = {};

  for (const element of form.elements) {
    if (!element.name) {
      continue;
    }

    if (element.type === "checkbox") {
      values[element.name] = element.checked;
    } else if (element.type === "radio") {
      if (element.checked) {
        values[element.name] = element.value;
      }
    } else if (element.type !== "file") {
      values[element.name] = element.value;
    }
  }

  return values;
}

// Hiện lỗi dưới từng ô nhập. Trả về true nếu có lỗi (và đưa con trỏ vào ô lỗi đầu tiên).
function showFormErrors(form, errors) {
  form.querySelectorAll("[data-error-for]").forEach((paragraph) => {
    const name = paragraph.dataset.errorFor;
    const message = errors[name] || "";
    const input = form.elements[name];

    paragraph.textContent = message;

    if (input && input.setAttribute) {
      input.setAttribute("aria-invalid", message ? "true" : "false");
    }
  });

  const first = Object.keys(errors)[0];

  if (first && form.elements[first] && form.elements[first].focus) {
    form.elements[first].focus();
  }

  return Boolean(first);
}

// ---------- Ảnh tải từ máy ----------

// Đọc ảnh người dùng chọn và thu nhỏ để lưu vừa trong LocalStorage.
function resizeImageFile(file, maxSize = 640) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Vui lòng chọn một tệp ảnh (JPG, PNG...)."));

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5 MB."));

      return;
    }

    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Không đọc được tệp ảnh."));
    reader.onload = () => {
      // Ảnh SVG là dạng vector nên giữ nguyên.
      if (file.type === "image/svg+xml") {
        resolve(String(reader.result));

        return;
      }

      const image = new Image();

      image.onerror = () => reject(new Error("Tệp này không phải ảnh hợp lệ."));
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");

        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext("2d");

        // Nền trắng để ảnh PNG trong suốt không bị đen khi chuyển sang JPEG.
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

// ---------- Bảng và nhãn ----------

function statusBadge(status) {
  return (
    '<span class="status status-' + status + '">' + esc(statusLabel(status)) + "</span>"
  );
}

// Bảng dữ liệu. rowsHtml là các thẻ <tr>; rowCount = 0 thì hiện emptyMessage.
function tableHtml(columns, rowsHtml, rowCount, emptyMessage = "Chưa có dữ liệu.") {
  const head = columns
    .map((column) => '<th scope="col">' + esc(column) + "</th>")
    .join("");

  return /* HTML */ `
    <div class="data-table">
      <div class="data-table-scroll">
        <table>
          <thead>
            <tr>${head}</tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
      ${rowCount === 0
        ? '<p class="data-table-empty">' + esc(emptyMessage) + "</p>"
        : ""}
    </div>
  `;
}

// Thanh theo dõi tiến trình đơn hàng.
function orderTrackerHtml(status) {
  if (status === "cancelled") {
    return '<p class="order-cancelled" role="status">Đơn hàng này đã bị hủy.</p>';
  }

  const currentIndex = TRACKING_STEPS.indexOf(status);
  const steps = TRACKING_STEPS.map((step, index) => {
    const isDone = index <= currentIndex;
    const isCurrent = index === currentIndex;

    return /* HTML */ `
      <li class="${isDone ? "done" : ""} ${isCurrent ? "current" : ""}">
        <span>${isDone ? "✓" : index + 1}</span>
        <small>${esc(statusLabel(step))}</small>
      </li>
    `;
  }).join("");

  return (
    '<ol class="order-tracker" aria-label="Tiến trình đơn hàng">' + steps + "</ol>"
  );
}

// Chi tiết một đơn hàng: người nhận, địa chỉ, sản phẩm và tổng tiền.
function orderDetailHtml(order) {
  const shipping = order.shipping;
  const addressLine = [
    shipping.address,
    shipping.ward,
    shipping.district,
    shipping.province,
  ]
    .filter(Boolean)
    .join(", ");
  const paymentText =
    order.payment === "bank"
      ? "Chuyển khoản ngân hàng"
      : "Thanh toán khi nhận hàng (COD)";
  const infoRows = [
    ["Mã đơn hàng", order.id],
    ["Ngày đặt", formatDateTime(order.createdAt)],
    ["Người nhận", order.customer.fullName],
    ["Số điện thoại", order.customer.phone],
    ["Email", order.customer.email],
    ["Địa chỉ giao hàng", addressLine],
    ["Thanh toán", paymentText],
    ["Ghi chú", order.note || "Không có"],
  ]
    .map(
      ([label, value]) =>
        "<div><dt>" + esc(label) + "</dt><dd>" + esc(value) + "</dd></div>",
    )
    .join("");
  const itemRows = order.items
    .map(
      (item) => /* HTML */ `
        <li>
          <img
            src="${imageSrc(item.image)}"
            alt="${esc(item.name)}"
          />
          <div>
            <strong>${esc(item.name)}</strong>
            <span>${esc(item.pack)} · ${money(item.price)} × ${item.quantity}</span>
          </div>
          <b>${money(item.price * item.quantity)}</b>
        </li>
      `,
    )
    .join("");

  return /* HTML */ `
    <dl class="info-grid">${infoRows}</dl>
    <ul class="order-items">
      ${itemRows}
    </ul>
    <dl class="order-totals">
      <div>
        <dt>Tạm tính</dt>
        <dd>${money(order.subtotal)}</dd>
      </div>
      <div>
        <dt>Phí vận chuyển</dt>
        <dd>${money(order.shippingFee)}</dd>
      </div>
      <div>
        <dt>Giảm giá</dt>
        <dd>−${money(order.discount)}</dd>
      </div>
      <div class="grand">
        <dt>Tổng cộng</dt>
        <dd>${money(order.total)}</dd>
      </div>
    </dl>
  `;
}
