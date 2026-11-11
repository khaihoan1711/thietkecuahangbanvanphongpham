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

| Quyền   | Email                     | Mật khẩu                           |
| ------- | ------------------------- | ---------------------------------- |
| Admin   | khaihoanhuetran@gmail.com | đặt trong `src/data/seed-users.ts` |
| User    | nguyenvana@gmail.com      | User@123                           |
| Bị khóa | phamvand@gmail.com        | User@123                           |

Trong trang Tổng quan của Admin có nút "Khôi phục dữ liệu mẫu" để đưa mọi dữ liệu về ban đầu.

## Cách dữ liệu được lưu (không có backend)

Toàn bộ dữ liệu nằm trong LocalStorage của trình duyệt, dùng các khóa sau:

- `khaihoanshop-products-v3`: sản phẩm
- `khaihoanshop-categories`: danh mục
- `khaihoanshop-users-v3`: tài khoản (mật khẩu lưu dạng chữ thường vì chỉ để mô phỏng)
- `khaihoanshop-orders-v2`: đơn hàng
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

## Bản HTML mở thẳng bằng Chrome

File `khaihoanstationery.html` là bản độc lập: ảnh, CSS và JavaScript đều nằm trong một file nên chỉ cần bấm đúp để mở bằng Chrome, không cần chạy `npm`. Bản này có đủ phần User (đăng ký, đăng nhập, tài khoản, thanh toán, đơn hàng) và Admin (mở bằng `khaihoanstationery.html#quan-tri`), dùng cùng tài khoản mẫu ở trên.

File này được ghép tự động từ `templates/storefront.html`, `scripts/*.css` và `scripts/*.js`. Sửa các file nguồn đó rồi chạy:

```bash
npm run html:sync
```

Dữ liệu của bản HTML lưu trong LocalStorage với các khóa bắt đầu bằng `khaihoanshop-html-`, tách riêng với bản Next.js.

## Lưu ý

Đây là đồ án Front-end. Không có backend, API hay database. Đăng nhập và phân quyền chỉ là mô phỏng ở trình duyệt nên không bảo mật thật sự.

## Thư mục dự án

Giải nén vào thư mục `khaihoanstatinery`, mở thư mục này và chạy `npm install`, sau đó `npm run dev`. Tên cửa hàng hiển thị là KhaiHoanShop.

## Sản phẩm và ảnh

Cửa hàng có 60 sản phẩm thật chia đều ở 6 danh mục. Ảnh nằm trong `public/images/products/`, danh sách nguồn từng ảnh (thienlong.vn, các cửa hàng văn phòng phẩm và ảnh do chủ cửa hàng cung cấp) ghi trong `public/images/products/CREDITS.md`. Bản quyền ảnh thuộc về các nguồn đó, chỉ dùng cho đồ án học tập.
