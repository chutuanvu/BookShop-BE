# Comic Store API

API cho ứng dụng web bán truyện tranh với đầy đủ chức năng quản lý:

## Tính năng

-   **Quản lý người dùng**: Đăng ký, đăng nhập, quản lý hồ sơ
-   **Quản lý thể loại truyện**: Thêm, sửa, xóa, xem danh sách thể loại
-   **Quản lý truyện**: Thêm, sửa, xóa, xem danh sách với bộ lọc và phân trang
-   **Quản lý giỏ hàng**: Thêm, xóa, cập nhật sản phẩm trong giỏ hàng
-   **Quản lý địa chỉ giao hàng**: Thêm, sửa, xóa, đặt địa chỉ mặc định
-   **Quản lý hóa đơn**: Tạo đơn hàng, cập nhật trạng thái, hủy đơn hàng
-   **Báo cáo thống kê**: Doanh thu, tồn kho, thể loại, người dùng

## Công nghệ

-   Node.js & Express.js
-   Prisma ORM
-   SQL Server
-   JWT Authentication

## Cài đặt

1. Cài đặt thư viện: `npm install`
2. Cấu hình database trong `.env`
3. Chạy script Prisma: `./prisma-setup.sh`
4. Khởi động server: `npm run dev`
