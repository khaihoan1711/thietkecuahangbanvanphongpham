// MOCK DATA for the account page prototype. Nothing here is real.
// Replace it with the logged-in user's data from the backend once authentication exists.

export const mockProfile = {
  fullName: "Nguyễn Văn A",
  email: "nguyenvana@example.com",
  phone: "0901234567",
};

export type OrderStatus = "Chờ xác nhận" | "Đang giao" | "Hoàn thành";

export type MockOrder = {
  id: string;
  date: string;
  total: number; // in VND
  status: OrderStatus;
  items: { name: string; quantity: number }[];
};

export const mockOrders: MockOrder[] = [
  {
    id: "TT-240915",
    date: "15/09/2026",
    total: 860000,
    status: "Chờ xác nhận",
    items: [
      { name: "Chè Thái Nguyên", quantity: 2 },
      { name: "Ô mai chanh đào", quantity: 4 },
    ],
  },
  {
    id: "TT-240902",
    date: "02/09/2026",
    total: 245000,
    status: "Đang giao",
    items: [
      { name: "Bánh pía", quantity: 1 },
      { name: "Nước mắm cá cơm", quantity: 1 },
    ],
  },
  {
    id: "TT-240811",
    date: "11/08/2026",
    total: 165000,
    status: "Hoàn thành",
    items: [{ name: "Kẹo dừa", quantity: 3 }],
  },
];
