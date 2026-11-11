import type { User } from "@/types/store";

// Tài khoản mẫu để thử đăng nhập (chỉ mô phỏng, lưu trong LocalStorage):
//
//   Admin : khaihoanhuetran@gmail.com   (mật khẩu đặt ở bên dưới)
//   User  : nguyenvana@gmail.com  / User@123
//   User  : tranthib@gmail.com    / User@123
//   User  : lethic@gmail.com      / User@123
//   Bị khóa: phamvand@gmail.com   / User@123  (để thử mở khóa trong trang Admin)
export const seedUsers: User[] = [
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
