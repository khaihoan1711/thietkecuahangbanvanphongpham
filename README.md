## KhaiHoanShop - Website bán văn phòng phẩm

## 1. Giới thiệu

KhaiHoanShop là Website bán văn phòng phẩm, dụng cụ học tập và họa phẩm.

Website được xây dựng theo hướng Front-end, giao diện đơn giản, dễ sử dụng và hỗ trợ hiển thị trên máy tính và thiết bị di động.

## 2. Công nghệ sử dụng

HTML/CSS thông qua JSX/TSX.

JavaScript.

TypeScript.

React 18.

Next.js 14.

Tailwind CSS 3.

LocalStorage để lưu giỏ hàng tạm thời.

## 3. Chức năng chính

## Trang chủ

Banner.

Danh mục sản phẩm.

Sản phẩm bán chạy.

Sản phẩm mới.

Sản phẩm khuyến mãi.

Tin tức.

## Danh sách sản phẩm

Hiển thị danh sách sản phẩm.

Tìm kiếm sản phẩm.

Lọc theo danh mục.

Lọc theo thương hiệu.

Lọc theo giá.

Sắp xếp sản phẩm.

## Chi tiết sản phẩm

Hiển thị hình ảnh sản phẩm.

Tên sản phẩm.

Giá sản phẩm.

Mô tả sản phẩm.

Thêm sản phẩm vào giỏ hàng.

## Giỏ hàng

Thêm sản phẩm.

Xóa sản phẩm.

Cập nhật số lượng.

Tính tổng tiền.

Lưu giỏ hàng bằng LocalStorage.

##  Thanh toán

Thêm vào giỏ hàng

Đặt hàng

##  Đăng nhập và đăng ký

Giao diện đăng nhập.

Giao diện đăng ký.

##  Responsive

Hỗ trợ hiển thị trên máy tính.

Hỗ trợ hiển thị trên thiết bị di động.

## 4. Dữ liệu sản phẩm

Dữ liệu sản phẩm hiện được lưu trong:

src/data/products.ts

Dữ liệu này được sử dụng để hiển thị, tìm kiếm, lọc, xem chi tiết và thêm sản phẩm vào giỏ hàng.

## 5. Phạm vi dự án

Dự án tập trung vào phần Front-end của Website bán văn phòng phẩm.

Hiện tại dự án chưa có:

Backend.

Cơ sở dữ liệu.

Xác thực tài khoản thật.

Quản lý đơn hàng thực tế.

Thanh toán trực tuyến thực tế.

##  6. Kết quả

Website cung cấp các chức năng cơ bản của một Website bán văn phòng phẩm như xem sản phẩm, tìm kiếm, lọc, xem chi tiết, giỏ hàng, thanh toán Front-end, đăng nhập, đăng ký và Responsive trên nhiều thiết bị.

## 7. Chức năng bổ sung (phần Người dùng và Quản trị)

Phần này được thêm sau bản ban đầu, vẫn chỉ là Front-end và lưu dữ liệu bằng LocalStorage.

- Đăng ký, đăng nhập, đăng xuất; giữ trạng thái đăng nhập khi tải lại trang.
- Quản lý tài khoản: sửa thông tin, đổi mật khẩu, địa chỉ, lịch sử và theo dõi đơn hàng.
- Đặt hàng từ giỏ hàng hoặc trang thanh toán; đơn hàng được lưu vào LocalStorage.
- Khu quản trị `/quan-tri` (chỉ Admin): dashboard, quản lý sản phẩm, danh mục, đơn hàng, người dùng.
- Trang chủ có slideshow 3 ảnh tự chuyển sau 5 giây.
- Danh mục 60 sản phẩm thật, ảnh nằm trong `public/images/stationery` và `public/images/products` (nguồn ảnh ghi trong `public/images/products/CREDITS.md`).
- Chân trang có liên kết Gmail và Facebook.

Tài khoản Admin mẫu và dữ liệu mẫu nằm trong `src/data/seed-users.ts`, `src/data/seed-orders.ts`. Trong trang Tổng quan của Admin có nút "Khôi phục dữ liệu mẫu".

## 8. Bản HTML mở thẳng bằng Chrome

File `khaihoanstationery.html` là bản độc lập, chỉ cần bấm đúp để mở bằng Chrome, không cần chạy `npm`. Mở khu quản trị bằng `khaihoanstationery.html#quan-tri`.

File này được ghép tự động từ `templates/storefront.html`, `scripts/*.css` và `scripts/*.js`. Sau khi sửa các file nguồn, chạy:

```bash
npm run html:sync
```

## 9. Chạy dự án

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`. Kiểm tra bản build bằng `npm run build`.
