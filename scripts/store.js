// ============================================================
// KHO DỮ LIỆU CỦA BẢN HTML
// Sản phẩm, danh mục, tài khoản, đơn hàng và đăng nhập được lưu trong LocalStorage.
// Không có backend: mọi thứ chỉ chạy trong trình duyệt (mở thẳng file .html bằng Chrome được).
// ============================================================

const STORAGE_KEYS = {
  products: "khaihoanshop-html-products-v3",
  categories: "khaihoanshop-html-categories",
  users: "khaihoanshop-html-users-v2",
  orders: "khaihoanshop-html-orders",
  // Id người đang đăng nhập
  session: "khaihoanshop-html-session",
  cart: "khaihoanshop-html-cart",
  // Mã các sản phẩm yêu thích
  favorites: "khaihoanshop-html-favorites",
  // Đánh dấu đã gán tồn kho ban đầu cho sản phẩm đã lưu (xem bên dưới)
  stockFilled: "khaihoanshop-html-stock-filled",
};

// Phí vận chuyển và giảm giá mẫu, dùng chung cho giỏ hàng và thanh toán.
const SHIPPING_FEE = 30000;
const DISCOUNT = 20000;

// ---------- Hàm tiện ích ----------

function money(value) {
  return new Intl.NumberFormat("vi-VN").format(value) + "₫";
}

// Chống chèn mã HTML khi hiển thị dữ liệu người dùng nhập.
function esc(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

    return map[character];
  });
}

// Bỏ dấu tiếng Việt để tìm kiếm: "Bút Gel" -> "but gel"
function simplify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");
}

// "Bút lông & Bảng" -> "but-long-bang"
function slugify(text) {
  return simplify(text)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Tạo mã chưa trùng với danh sách `existing` bằng cách thêm hậu tố -2, -3...
function uniqueSlug(text, existing) {
  const base = slugify(text) || "muc";
  let candidate = base;
  let counter = 2;

  while (existing.includes(candidate)) {
    candidate = base + "-" + counter;
    counter += 1;
  }

  return candidate;
}

function pad(number) {
  return String(number).padStart(2, "0");
}

// "2026-11-08T09:30:00.000Z" -> "08/11/2026"
function formatDate(iso) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return (
    pad(date.getDate()) + "/" + pad(date.getMonth() + 1) + "/" + date.getFullYear()
  );
}

// "2026-11-08T09:30:00.000Z" -> "08/11/2026 16:30"
function formatDateTime(iso) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return formatDate(iso) + " " + pad(date.getHours()) + ":" + pad(date.getMinutes());
}

// Email của khách bắt buộc là Gmail: ten@gmail.com (không phân biệt chữ hoa/thường).
function isValidEmail(email) {
  return /^[a-z0-9._%+-]+@gmail\.com$/i.test(String(email).trim());
}

// Chỉ kiểm tra định dạng chung, dùng cho ô đăng nhập để tài khoản cũ vẫn đăng nhập được.
function isEmailFormat(email) {
  return /^\S+@\S+\.\S+$/.test(String(email).trim());
}

// Số điện thoại Việt Nam: 10 số bắt đầu bằng 0 (hoặc +84 và 9 số).
function isValidPhone(phone) {
  return /^(0|\+84)\d{9}$/.test(String(phone).replace(/[\s.-]/g, ""));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

// Ảnh sản phẩm mẫu được nhúng sẵn trong file HTML (productImages),
// ảnh Admin tải lên là dữ liệu base64 nên dùng trực tiếp.
// movedImages: đường dẫn ảnh cũ (còn lưu trong LocalStorage) -> đường dẫn mới.
function imageSrc(path) {
  return productImages[movedImages[path] || path] || path;
}

// ---------- Dữ liệu mẫu ----------

const seedCategories = [
  {
    id: "but",
    label: "Bút viết",
    short: "Bút bi, bút gel, bút chì, highlight",
    icon: "✎",
  },
  { id: "vo-so", label: "Vở & Sổ", short: "Vở học sinh, sổ tay, sổ lò xo", icon: "▤" },
  {
    id: "giay",
    label: "Giấy văn phòng",
    short: "Giấy in, giấy note, giấy màu",
    icon: "▱",
  },
  { id: "dung-cu", label: "Dụng cụ", short: "Kéo, thước, dập ghim, compa", icon: "⌁" },
  { id: "hoa-pham", label: "Họa phẩm", short: "Màu vẽ, cọ, sáp màu", icon: "◉" },
  { id: "balo", label: "Balo & Hộp bút", short: "Balo, túi bút, phụ kiện", icon: "▣" },
];

// Tài khoản mẫu (chỉ mô phỏng):
//   Admin   : khaihoanhuetran@gmail.com (mật khẩu đặt ở bên dưới)
//   User    : nguyenvana@gmail.com      / User@123
//   Bị khóa : phamvand@gmail.com        / User@123
const seedUsers = [
  {
    id: "u-admin",
    fullName: "Quản trị viên",
    email: "khaihoanhuetran@gmail.com",
    phone: "0365392002",
    password: "Hoan1711@",
    role: "admin",
    isLocked: false,
    createdAt: "2026-05-01T08:00:00.000Z",
  },
  {
    id: "u-nguyenvana",
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    phone: "0901234567",
    password: "User@123",
    role: "user",
    isLocked: false,
    createdAt: "2026-05-20T09:15:00.000Z",
    address: {
      province: "Thừa Thiên Huế",
      district: "Thành phố Huế",
      ward: "Phường Vĩnh Ninh",
      address: "12 Lê Lợi",
    },
  },
  {
    id: "u-tranthib",
    fullName: "Trần Thị B",
    email: "tranthib@gmail.com",
    phone: "0912345678",
    password: "User@123",
    role: "user",
    isLocked: false,
    createdAt: "2026-06-02T10:30:00.000Z",
    address: {
      province: "Đà Nẵng",
      district: "Quận Hải Châu",
      ward: "Phường Thạch Thang",
      address: "45 Trần Phú",
    },
  },
  {
    id: "u-lethic",
    fullName: "Lê Thị C",
    email: "lethic@gmail.com",
    phone: "0987654321",
    password: "User@123",
    role: "user",
    isLocked: false,
    createdAt: "2026-07-18T14:00:00.000Z",
    address: {
      province: "Hà Nội",
      district: "Quận Cầu Giấy",
      ward: "Phường Dịch Vọng",
      address: "8 Xuân Thủy",
    },
  },
  {
    id: "u-phamvand",
    fullName: "Phạm Văn D",
    email: "phamvand@gmail.com",
    phone: "0935551122",
    password: "User@123",
    role: "user",
    isLocked: true,
    createdAt: "2026-09-05T16:45:00.000Z",
  },
];

// Tạo một đơn hàng mẫu: lines là danh sách [mã sản phẩm, số lượng].
function seedOrder(id, userId, createdAt, status, lines) {
  const user = seedUsers.find((item) => item.id === userId);
  const items = lines.map(([productId, quantity]) => {
    const product = seedProducts.find((item) => item.id === productId);

    return {
      productId: product.id,
      name: product.name,
      image: product.image,
      pack: product.pack,
      price: product.price,
      quantity,
      stockUnits: 1,
    };
  });
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    id,
    userId,
    customer: { fullName: user.fullName, phone: user.phone, email: user.email },
    shipping: { ...user.address },
    note: "",
    payment: "cod",
    items,
    subtotal,
    shippingFee: SHIPPING_FEE,
    discount: DISCOUNT,
    total: subtotal + SHIPPING_FEE - DISCOUNT,
    status,
    createdAt,
  };
}

// Đơn hàng mẫu từ tháng 6 đến tháng 11/2026 để Dashboard có dữ liệu.
const seedOrders = [
  seedOrder("DH-1001", "u-nguyenvana", "2026-06-12T09:00:00.000Z", "delivered", [
    ["tap-diem-10-96-trang-tp-nb-072", 10],
    ["but-bi-tl-027", 20],
  ]),
  seedOrder("DH-1002", "u-tranthib", "2026-06-28T13:20:00.000Z", "delivered", [
    ["giay-in-double-a-a4-70gsm", 3],
    ["bam-kim-mini-so-10-thien-long", 2],
  ]),
  seedOrder("DH-1003", "u-nguyenvana", "2026-07-15T10:10:00.000Z", "delivered", [
    ["balo-thien-long-lite-bp-038", 1],
    ["hop-but-diem-10-tp-pca016", 1],
  ]),
  seedOrder("DH-1004", "u-lethic", "2026-08-03T15:40:00.000Z", "delivered", [
    ["mau-nuoc-pentel-12-mau", 2],
    ["sap-24-mau-colokit-cr-c09", 2],
    ["tui-2-co-ve-colokit-brw-c01", 1],
  ]),
  seedOrder("DH-1005", "u-tranthib", "2026-08-21T08:30:00.000Z", "delivered", [
    ["so-lo-xo-thien-long-a5-120-trang", 3],
    ["giay-ghi-chu-neon-thien-long", 5],
  ]),
  seedOrder("DH-1006", "u-nguyenvana", "2026-09-09T11:00:00.000Z", "delivered", [
    ["giay-in-double-a-a4-80gsm", 5],
    ["keo-van-phong-thien-long-sc-021", 2],
  ]),
  seedOrder("DH-1007", "u-lethic", "2026-09-26T17:25:00.000Z", "cancelled", [
    ["dao-roc-giay-flexoffice-fo-kn03b", 1],
  ]),
  seedOrder("DH-1008", "u-tranthib", "2026-10-11T09:45:00.000Z", "delivered", [
    ["but-bi-bizner-biz-01", 1],
    ["so-lo-xo-klong-b5-120-trang", 4],
  ]),
  seedOrder("DH-1009", "u-nguyenvana", "2026-10-30T14:15:00.000Z", "shipping", [
    ["tap-thien-long-buddies-travel-200-trang-nb-153", 12],
    ["thuoc-ke-nhua-thien-long-sr-02-20cm", 6],
  ]),
  seedOrder("DH-1010", "u-lethic", "2026-11-04T10:00:00.000Z", "confirmed", [
    ["giay-phan-trang-thien-long-sn-011", 4],
    ["bang-keo-duc-opp-flexoffice-fo-bkd06", 3],
  ]),
  seedOrder("DH-1011", "u-nguyenvana", "2026-11-07T08:20:00.000Z", "pending", [
    ["but-gel-gel-012", 10],
    ["bo-compa-chi-kim-deli", 1],
  ]),
  seedOrder("DH-1012", "u-tranthib", "2026-11-07T16:05:00.000Z", "pending", [
    ["hop-but-diem-10-tp-pca016", 2],
  ]),
  // Thêm sau: đơn đã giao từ 28/09/2026 đến nay (biểu đồ doanh thu tính từ ngày này).
  seedOrder("DH-2001", "u-nguyenvana", "2026-09-28T02:30:00.000Z", "delivered", [
    ["tap-diem-10-96-trang-tp-nb-072", 10],
    ["but-bi-tl-027", 10],
  ]),
  seedOrder("DH-2002", "u-tranthib", "2026-09-30T08:10:00.000Z", "delivered", [
    ["giay-in-double-a-a4-80gsm", 2],
    ["bam-kim-mini-so-10-thien-long", 1],
  ]),
  seedOrder("DH-2003", "u-lethic", "2026-10-05T03:20:00.000Z", "delivered", [
    ["balo-thien-long-charmie-bp-039", 1],
    ["hop-but-diem-10-tp-pca016", 1],
  ]),
  seedOrder("DH-2004", "u-nguyenvana", "2026-10-19T12:45:00.000Z", "delivered", [
    ["may-tinh-van-phong-thien-long-flexio-cal-009", 1],
    ["but-gel-thien-long-gel-070", 5],
  ]),
  seedOrder("DH-2005", "u-tranthib", "2026-10-26T01:15:00.000Z", "delivered", [
    ["mau-gouache-tuyp-12ml-colokit", 1],
    ["but-long-mau-fiber-brush-colokit-classic", 2],
  ]),
  seedOrder("DH-2006", "u-lethic", "2026-11-03T07:00:00.000Z", "delivered", [
    ["balo-chong-gu-clever-hippo-fancy", 1],
  ]),
  seedOrder("DH-2007", "u-nguyenvana", "2026-11-10T04:30:00.000Z", "delivered", [
    ["giay-a4-80gsm-ik-copy", 3],
    ["kep-buom-flexoffice-25mm-fo-dc03", 2],
  ]),
  seedOrder("DH-2008", "u-tranthib", "2026-11-16T09:40:00.000Z", "delivered", [
    ["tap-thien-long-kindays-96-trang-nb-130", 20],
  ]),
  seedOrder("DH-2009", "u-lethic", "2026-11-21T02:05:00.000Z", "delivered", [
    ["so-cong-binder-campus-a5", 2],
    ["but-xoa-cp-02", 3],
  ]),
];

// Trạng thái đơn hàng, dùng chung cho trang tài khoản và trang quản trị.
const ORDER_STATUSES = [
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "shipping", label: "Đang giao hàng" },
  { value: "delivered", label: "Đã giao hàng" },
  { value: "cancelled", label: "Đã hủy" },
];

// Các bước theo dõi đơn hàng (không gồm "Đã hủy").
const TRACKING_STEPS = ["pending", "confirmed", "shipping", "delivered"];

function statusLabel(status) {
  const found = ORDER_STATUSES.find((item) => item.value === status);

  return found ? found.label : status;
}

// Đơn đã giao hoặc đã hủy thì không đổi trạng thái được nữa.
function isFinalStatus(status) {
  return status === "delivered" || status === "cancelled";
}

// ---------- Trạng thái và lưu trữ ----------

// Đọc một danh sách từ LocalStorage. Chưa có hoặc bị hỏng thì dùng dữ liệu mẫu.
function loadList(key, seed) {
  try {
    const raw = localStorage.getItem(key);

    if (raw) {
      const saved = JSON.parse(raw);

      if (Array.isArray(saved)) {
        return saved;
      }
    }
  } catch {
    // Dữ liệu hỏng thì dùng dữ liệu mẫu bên dưới.
  }

  return clone(seed);
}

function saveList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));

    return true;
  } catch {
    return false;
  }
}

let products = loadList(STORAGE_KEYS.products, seedProducts);

// Chạy một lần trên mỗi trình duyệt: sản phẩm đã lưu từ trước khi có số lượng tồn kho
// nhận số tồn kho ban đầu, để khách mua hàng thì tồn kho giảm. Sau lần này,
// Admin vẫn có thể để trống số lượng (không giới hạn) mà không bị đặt lại.
try {
  if (!localStorage.getItem(STORAGE_KEYS.stockFilled)) {
    products = products.map((product) => {
      const seed = seedProducts.find((item) => item.id === product.id);

      return product.stock === undefined && seed && seed.stock !== undefined
        ? { ...product, stock: seed.stock }
        : product;
    });
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
    localStorage.setItem(STORAGE_KEYS.stockFilled, "1");
  }
} catch {
  // Trình duyệt chặn LocalStorage: dùng dữ liệu đang có.
}
let categories = loadList(STORAGE_KEYS.categories, seedCategories);
let users = loadList(STORAGE_KEYS.users, seedUsers);
let orders = loadList(STORAGE_KEYS.orders, seedOrders);

// Trình duyệt đã lưu đơn hàng từ trước vẫn nhận thêm các đơn mẫu mới (theo mã đơn).
// Không đơn nào bị xóa hay sửa, nên đơn thật của khách được giữ nguyên.
orders = orders.concat(
  seedOrders.filter((seed) => !orders.some((order) => order.id === seed.id)).map(clone),
);

// Tăng lên mỗi khi dữ liệu thay đổi, để trang bán hàng biết cần vẽ lại.
let dataVersion = 0;

// Lưu một danh sách và đánh dấu dữ liệu đã đổi.
function commit(key, list) {
  dataVersion += 1;

  if (!saveList(key, list)) {
    toast("Không lưu được dữ liệu (bộ nhớ trình duyệt đầy hoặc bị chặn).", "error");
  }
}

// ---------- Sản phẩm và danh mục ----------

function getProduct(id) {
  return products.find((product) => product.id === id);
}

function getCategory(id) {
  return categories.find((category) => category.id === id);
}

function categoryExists(id) {
  return Boolean(getCategory(id));
}

// Tên danh mục để hiển thị. Danh mục đã bị xóa thì hiện chính mã đó.
function categoryLabel(id) {
  const category = getCategory(id);

  return category ? category.label : id;
}

// Thêm mới hoặc cập nhật (nếu mã sản phẩm đã có).
function saveProduct(product) {
  const exists = products.some((item) => item.id === product.id);

  products = exists
    ? products.map((item) => (item.id === product.id ? product : item))
    : [product, ...products];
  commit(STORAGE_KEYS.products, products);
}

function deleteProduct(id) {
  products = products.filter((product) => product.id !== id);
  commit(STORAGE_KEYS.products, products);
}

// Cộng hoặc trừ tồn kho (delta âm là trừ). Sản phẩm không theo dõi tồn kho thì bỏ qua.
function adjustStock(productId, delta) {
  products = products.map((product) => {
    if (product.id !== productId || product.stock === undefined) {
      return product;
    }

    return { ...product, stock: Math.max(0, product.stock + delta) };
  });
  commit(STORAGE_KEYS.products, products);
}

function saveCategory(category) {
  const exists = categories.some((item) => item.id === category.id);

  categories = exists
    ? categories.map((item) => (item.id === category.id ? category : item))
    : [...categories, category];
  commit(STORAGE_KEYS.categories, categories);
}

// Không cho xóa danh mục còn sản phẩm.
function deleteCategory(id) {
  const count = products.filter((product) => product.category === id).length;

  if (count > 0) {
    return {
      ok: false,
      message:
        "Danh mục còn " + count + " sản phẩm. Hãy chuyển hoặc xóa sản phẩm trước.",
    };
  }

  categories = categories.filter((category) => category.id !== id);
  commit(STORAGE_KEYS.categories, categories);

  return { ok: true };
}

// ---------- Đăng nhập, đăng ký, tài khoản ----------

function readSession() {
  try {
    return (
      localStorage.getItem(STORAGE_KEYS.session) ||
      sessionStorage.getItem(STORAGE_KEYS.session)
    );
  } catch {
    return null;
  }
}

let sessionUserId = readSession();

// Người đang đăng nhập (null nếu chưa đăng nhập hoặc tài khoản bị khóa).
function currentUser() {
  const user = users.find((item) => item.id === sessionUserId);

  return user && !user.isLocked ? user : null;
}

function isAdmin() {
  const user = currentUser();

  return Boolean(user) && user.role === "admin";
}

// Thông báo khi tài khoản quản trị viên cố mua hàng.
const ADMIN_CANNOT_BUY =
  "Tài khoản quản trị viên không thể mua hàng. Vui lòng dùng tài khoản khách hàng.";

// "Ghi nhớ đăng nhập" lưu ở localStorage, nếu không thì chỉ lưu đến khi đóng tab.
function startSession(userId, remember) {
  try {
    localStorage.removeItem(STORAGE_KEYS.session);
    sessionStorage.removeItem(STORAGE_KEYS.session);
    (remember ? localStorage : sessionStorage).setItem(STORAGE_KEYS.session, userId);
  } catch {
    // Không lưu được thì đăng nhập chỉ có hiệu lực đến khi tải lại trang.
  }

  sessionUserId = userId;
}

function logoutUser() {
  try {
    localStorage.removeItem(STORAGE_KEYS.session);
    sessionStorage.removeItem(STORAGE_KEYS.session);
  } catch {
    // Không có gì để xóa.
  }

  sessionUserId = null;
}

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function registerUser(input) {
  const email = normalizeEmail(input.email);

  if (users.some((user) => user.email === email)) {
    return { ok: false, message: "Email này đã được đăng ký." };
  }

  const user = {
    id: "u-" + Date.now().toString(36),
    fullName: input.fullName.trim(),
    email,
    phone: input.phone.trim(),
    password: input.password,
    role: "user",
    isLocked: false,
    createdAt: new Date().toISOString(),
  };

  users = [...users, user];
  commit(STORAGE_KEYS.users, users);
  // Đăng ký xong thì đăng nhập luôn.
  startSession(user.id, true);

  return { ok: true };
}

function loginUser(email, password, remember) {
  const user = users.find((item) => item.email === normalizeEmail(email));

  if (!user || user.password !== password) {
    return { ok: false, message: "Email hoặc mật khẩu không đúng." };
  }

  if (user.isLocked) {
    return {
      ok: false,
      message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ cửa hàng.",
    };
  }

  startSession(user.id, remember);

  return { ok: true };
}

// Cập nhật một phần thông tin của người đang đăng nhập.
function patchCurrentUser(patch) {
  const current = currentUser();

  if (!current) {
    return;
  }

  users = users.map((user) => (user.id === current.id ? { ...user, ...patch } : user));
  commit(STORAGE_KEYS.users, users);
}

function updateProfile(input) {
  const current = currentUser();

  if (!current) {
    return { ok: false, message: "Bạn cần đăng nhập để thực hiện thao tác này." };
  }

  const email = normalizeEmail(input.email);

  if (users.some((user) => user.id !== current.id && user.email === email)) {
    return { ok: false, message: "Email này đã được dùng bởi tài khoản khác." };
  }

  patchCurrentUser({
    fullName: input.fullName.trim(),
    email,
    phone: input.phone.trim(),
  });

  return { ok: true };
}

function updateAddress(address) {
  patchCurrentUser({ address });
}

function changePassword(currentPassword, newPassword) {
  const current = currentUser();

  if (!current) {
    return { ok: false, message: "Bạn cần đăng nhập để thực hiện thao tác này." };
  }

  if (current.password !== currentPassword) {
    return { ok: false, message: "Mật khẩu hiện tại không đúng." };
  }

  patchCurrentUser({ password: newPassword });

  return { ok: true };
}

function setUserLocked(userId, locked) {
  const current = currentUser();

  if (locked && current && current.id === userId) {
    return { ok: false, message: "Bạn không thể khóa chính tài khoản của mình." };
  }

  users = users.map((user) =>
    user.id === userId ? { ...user, isLocked: locked } : user,
  );
  commit(STORAGE_KEYS.users, users);

  return { ok: true };
}

function setUserRole(userId, role) {
  const current = currentUser();

  if (current && current.id === userId) {
    return { ok: false, message: "Bạn không thể đổi quyền của chính mình." };
  }

  users = users.map((user) => (user.id === userId ? { ...user, role } : user));
  commit(STORAGE_KEYS.users, users);

  return { ok: true };
}

// ---------- Đơn hàng ----------

// Mã đơn hàng mới, ví dụ "DHMIDC3K8A7F".
// Không có máy chủ nên mỗi trình duyệt tự tạo mã: dùng thời điểm đặt (mili giây, hệ 36)
// cộng 2 ký tự ngẫu nhiên để mã của các khách không trùng nhau. Chỉ gồm chữ in hoa
// và số để ngân hàng nào cũng giữ nguyên khi dùng làm nội dung chuyển khoản.
function newOrderId(existing) {
  let id = "";

  do {
    const time = Date.now().toString(36).toUpperCase();
    const random = Math.floor(Math.random() * 36 * 36)
      .toString(36)
      .toUpperCase()
      .padStart(2, "0");

    id = "DH" + time + random;
  } while (existing.some((order) => order.id === id));

  return id;
}

// Tạo đơn hàng mới (trạng thái "Chờ xác nhận") và trừ tồn kho.
function placeOrder(input) {
  const order = {
    ...input,
    id: newOrderId(orders),
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  orders = [order, ...orders];
  commit(STORAGE_KEYS.orders, orders);

  for (const item of order.items) {
    adjustStock(item.productId, -(item.quantity * item.stockUnits));
  }

  return order;
}

// Đổi trạng thái. Hủy đơn thì trả hàng về kho.
function updateOrderStatus(orderId, status) {
  const order = orders.find((item) => item.id === orderId);

  if (!order) {
    return { ok: false, message: "Không tìm thấy đơn hàng." };
  }

  if (isFinalStatus(order.status)) {
    return {
      ok: false,
      message: "Đơn hàng đã giao hoặc đã hủy nên không thể đổi trạng thái.",
    };
  }

  if (status === "cancelled") {
    for (const item of order.items) {
      adjustStock(item.productId, item.quantity * item.stockUnits);
    }
  }

  orders = orders.map((item) => (item.id === orderId ? { ...item, status } : item));
  commit(STORAGE_KEYS.orders, orders);

  return { ok: true };
}

// Đơn của người dùng gồm đơn gắn với tài khoản và đơn đặt bằng cùng email lúc chưa đăng nhập.
function getUserOrders(user) {
  return orders
    .filter((order) => order.userId === user.id || order.customer.email === user.email)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ---------- Thống kê cho Dashboard ----------

// Doanh thu chỉ tính các đơn đã giao hàng thành công.
function getTotalRevenue() {
  return orders
    .filter((order) => order.status === "delivered")
    .reduce((sum, order) => sum + order.total, 0);
}

function monthKey(date) {
  return date.getFullYear() + "-" + pad(date.getMonth() + 1);
}

// Biểu đồ doanh thu tính từ ngày này (giờ Việt Nam) đến hôm nay.
const REVENUE_START = new Date("2026-09-28T00:00:00+07:00");

// Doanh thu từng tháng, từ tháng của REVENUE_START đến tháng hiện tại (tháng cũ nhất đứng đầu).
// Chỉ tính các đơn đã giao đặt từ ngày REVENUE_START trở đi.
function getMonthlyRevenue() {
  const now = new Date();
  const result = [];
  const date = new Date(REVENUE_START.getFullYear(), REVENUE_START.getMonth(), 1);

  while (date <= now) {
    result.push({
      label: "T" + (date.getMonth() + 1) + "/" + String(date.getFullYear()).slice(-2),
      key: monthKey(date),
      revenue: 0,
    });
    date.setMonth(date.getMonth() + 1);
  }

  for (const order of orders) {
    const createdAt = new Date(order.createdAt);

    if (order.status !== "delivered" || createdAt < REVENUE_START) {
      continue;
    }

    const entry = result.find((item) => item.key === monthKey(createdAt));

    if (entry) {
      entry.revenue += order.total;
    }
  }

  return result;
}

// Đưa toàn bộ dữ liệu về dữ liệu mẫu và đăng xuất.
function resetAllData() {
  products = clone(seedProducts);
  categories = clone(seedCategories);
  users = clone(seedUsers);
  orders = clone(seedOrders);
  commit(STORAGE_KEYS.products, products);
  commit(STORAGE_KEYS.categories, categories);
  commit(STORAGE_KEYS.users, users);
  commit(STORAGE_KEYS.orders, orders);
  logoutUser();
}

// ---------- Thống kê bán hàng theo sản phẩm ----------

// Thống kê bán hàng tính các đơn chưa bị hủy (đơn hủy đã được hoàn lại kho).
function getSoldOrders() {
  return orders.filter((order) => order.status !== "cancelled");
}

// Doanh số từng sản phẩm, bán nhiều nhất đứng đầu.
// sold: số sản phẩm đã bán (hộp 10 cây được tính là 10); revenue: tiền hàng của sản phẩm.
function getProductSales() {
  const byProduct = new Map();

  for (const order of getSoldOrders()) {
    const counted = new Set();

    for (const item of order.items) {
      const entry = byProduct.get(item.productId) || {
        productId: item.productId,
        name: item.name,
        image: item.image,
        sold: 0,
        orderCount: 0,
        revenue: 0,
      };

      entry.sold += item.quantity * item.stockUnits;
      entry.revenue += item.price * item.quantity;

      if (!counted.has(item.productId)) {
        entry.orderCount += 1;
        counted.add(item.productId);
      }

      byProduct.set(item.productId, entry);
    }
  }

  return [...byProduct.values()].sort(
    (a, b) => b.sold - a.sold || b.revenue - a.revenue,
  );
}
