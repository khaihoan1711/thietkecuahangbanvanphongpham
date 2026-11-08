# KhaiHoan Stationery — KhaiHoanShop

KhaiHoanShop — website bán văn phòng phẩm, dụng cụ học tập và họa phẩm. Trang chủ sử dụng tông xanh dương, nền xanh nhạt, banner KhaiHoanShop và các khu sản phẩm bán chạy, mới, khuyến mãi.

## Công nghệ

- HTML/CSS thông qua JSX/TSX
- JavaScript / TypeScript
- React 18
- Next.js 14
- Tailwind CSS 3
- LocalStorage để lưu giỏ hàng tạm thời trên trình duyệt

## Chức năng chính

- Trang chủ có banner, danh mục, sản phẩm bán chạy, sản phẩm mới, khuyến mãi và tin tức
- Danh sách sản phẩm có tìm kiếm, lọc theo danh mục, thương hiệu, giá và sắp xếp
- Trang chi tiết sản phẩm
- Thêm/xóa/cập nhật số lượng trong giỏ hàng bằng LocalStorage
- Trang thanh toán Front-end có kiểm tra dữ liệu nhập
- Đăng ký, đăng nhập, đăng xuất; giữ trạng thái đăng nhập khi tải lại trang
- Quản lý tài khoản: sửa thông tin, đổi mật khẩu, địa chỉ, lịch sử và theo dõi đơn hàng
- Đặt hàng từ giỏ hàng hoặc trang thanh toán, đơn hàng được lưu vào LocalStorage
- Khu quản trị `/quan-tri` (chỉ Admin): dashboard, quản lý sản phẩm, danh mục, đơn hàng, người dùng
- Responsive cho máy tính và thiết bị di động

## Tài khoản mẫu

| Quyền   | Email                    | Mật khẩu   |
| ------- | ------------------------ | ---------- |
| Admin   | admin@khaihoanshop.vn    | Admin@123  |
| User    | nguyenvana@example.com   | User@123   |
| Bị khóa | phamvand@example.com     | User@123   |

Trong trang Tổng quan của Admin có nút "Khôi phục dữ liệu mẫu" để đưa mọi dữ liệu về ban đầu.

## Cách dữ liệu được lưu (không có backend)

Toàn bộ dữ liệu nằm trong LocalStorage của trình duyệt, dùng các khóa sau:

- `khaihoanshop-products`: sản phẩm
- `khaihoanshop-categories`: danh mục
- `khaihoanshop-users`: tài khoản (mật khẩu lưu dạng chữ thường vì chỉ để mô phỏng)
- `khaihoanshop-orders`: đơn hàng
- `khaihoanshop-session`: người đang đăng nhập
- `khaihoanstatinery-cart`: giỏ hàng

Dữ liệu mẫu nằm trong `src/data/products.ts`, `src/data/seed-users.ts` và `src/data/seed-orders.ts`.
Admin thêm, sửa, xóa sản phẩm hoặc danh mục thì trang bán hàng đổi theo ngay.

## Chạy dự án

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

## Lưu ý

Đây là đồ án Front-end. Không có backend, API hay database. Đăng nhập và phân quyền chỉ là mô phỏng ở trình duyệt nên không bảo mật thật sự.


## Thư mục dự án

Giải nén vào thư mục `khaihoanstatinery`, mở thư mục này và chạy `npm install`, sau đó `npm run dev`. Tên cửa hàng hiển thị là KhaiHoanShop.
