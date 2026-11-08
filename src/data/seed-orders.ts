import { calculateTotals } from "@/data/cart";
import { seedProducts } from "@/data/products";
import { seedUsers } from "@/data/seed-users";
import type { Order, OrderItem, OrderStatus } from "@/types/store";

// Một dòng đơn hàng mẫu: [mã sản phẩm, số lượng]
type SeedLine = [productId: string, quantity: number];

// Tạo dòng đơn hàng từ sản phẩm mẫu (lưu lại tên, giá, ảnh tại thời điểm mua).
function toItem([productId, quantity]: SeedLine): OrderItem {
  const product = seedProducts.find((item) => item.id === productId);

  if (!product) {
    throw new Error(`Sản phẩm mẫu không tồn tại: ${productId}`);
  }

  return {
    productId: product.id,
    name: product.name,
    image: product.image,
    pack: product.pack,
    price: product.price,
    quantity,
    stockUnits: 1,
  };
}

// Tạo một đơn hàng mẫu cho một tài khoản mẫu.
function makeOrder(
  id: string,
  userId: string,
  createdAt: string,
  status: OrderStatus,
  lines: SeedLine[],
): Order {
  const user = seedUsers.find((item) => item.id === userId);

  if (!user || !user.address) {
    throw new Error(`Tài khoản mẫu không có địa chỉ: ${userId}`);
  }

  const items = lines.map(toItem);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totals = calculateTotals(subtotal);

  return {
    id,
    userId,
    customer: {
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
    },
    shipping: user.address,
    note: "",
    payment: "cod",
    items,
    subtotal: totals.subtotal,
    shippingFee: totals.shipping,
    discount: totals.discount,
    total: totals.total,
    status,
    createdAt,
  };
}

// Đơn hàng mẫu trải đều từ tháng 6 đến tháng 11/2026 để biểu đồ doanh thu có dữ liệu.
export const seedOrders: Order[] = [
  makeOrder("DH-1001", "u-nguyenvana", "2026-06-12T09:00:00.000Z", "delivered", [
    ["vo-4-o-ly-96", 10],
    ["but-bi-tl-027", 20],
  ]),
  makeOrder("DH-1002", "u-tranthib", "2026-06-28T13:20:00.000Z", "delivered", [
    ["giay-a4-70", 3],
    ["dap-ghim-mini", 2],
  ]),
  makeOrder("DH-1003", "u-nguyenvana", "2026-07-15T10:10:00.000Z", "delivered", [
    ["balo-school-lite", 1],
    ["hop-but-canvas", 1],
  ]),
  makeOrder("DH-1004", "u-lethic", "2026-08-03T15:40:00.000Z", "delivered", [
    ["mau-nuoc-12", 2],
    ["sap-dau-24", 2],
    ["bo-co-6", 1],
  ]),
  makeOrder("DH-1005", "u-tranthib", "2026-08-21T08:30:00.000Z", "delivered", [
    ["so-tay-bia-da", 3],
    ["note-pastel-5", 5],
  ]),
  makeOrder("DH-1006", "u-nguyenvana", "2026-09-09T11:00:00.000Z", "delivered", [
    ["giay-a4-80", 5],
    ["keo-van-phong-18", 2],
  ]),
  makeOrder("DH-1007", "u-lethic", "2026-09-26T17:25:00.000Z", "cancelled", [
    ["bang-trang-a4", 1],
  ]),
  makeOrder("DH-1008", "u-tranthib", "2026-10-11T09:45:00.000Z", "delivered", [
    ["but-bi-bizner-biz-01", 1],
    ["so-lo-xo-b5", 4],
  ]),
  makeOrder("DH-1009", "u-nguyenvana", "2026-10-30T14:15:00.000Z", "shipping", [
    ["vo-ke-ngang-a5", 12],
    ["thuoc-20cm", 6],
  ]),
  makeOrder("DH-1010", "u-lethic", "2026-11-04T10:00:00.000Z", "confirmed", [
    ["giay-thu-cong-20", 4],
    ["bang-keo-trong", 3],
  ]),
  makeOrder("DH-1011", "u-nguyenvana", "2026-11-07T08:20:00.000Z", "pending", [
    ["but-gel-gel-012", 10],
    ["bo-hinh-hoc", 1],
  ]),
  makeOrder("DH-1012", "u-tranthib", "2026-11-07T16:05:00.000Z", "pending", [
    ["hop-but-canvas", 2],
  ]),
];
