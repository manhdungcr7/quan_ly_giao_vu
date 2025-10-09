# Sửa lỗi hiển thị tiếng Việt (UTF-8) cho trang Thiết lập tiêu chí

Nếu bạn thấy chữ Việt bị lỗi (kiểu "H??ng d?n"), nguyên nhân là dữ liệu đã được chèn vào MySQL bằng session không phải UTF-8. Mã nguồn hiện đã cấu hình đầy đủ UTF-8 (utf8mb4) từ kết nối tới HTML; bạn chỉ cần làm sạch dữ liệu bằng cách reseed.

## Cách làm an toàn

- Sao lưu (nếu cần) các bảng sau: `evaluation_criteria`, `evaluation_periods`, `evaluation_period_criteria`, `staff_evaluations`, `staff_evaluation_summary`.
- Chạy lệnh reseed với cờ xác nhận `--yes`. Script sẽ:
  - Thiết lập session `utf8mb4` (SET NAMES/CHARACTER SET/collation_connection).
  - TRUNCATE các bảng đánh giá.
  - Import lại file `database/staff_evaluation_system.sql` (đã gồm SET NAMES đầu file).

## Các bước (PowerShell trên Windows)

- Dry-run (không thay đổi dữ liệu, chỉ xem trước một vài dòng):

  npm run db:reseed:evaluation -- --dry-run

- Thực thi reseed (có xác nhận):

  npm run db:reseed:evaluation -- --yes

Sau khi chạy xong, refresh trang Thiết lập tiêu chí; tiếng Việt sẽ hiển thị đúng.

## Ghi chú

- Ứng dụng dùng `utf8mb4` end-to-end: cấu hình pool MySQL, `<meta charset="UTF-8">` trong layout, và schema mặc định.
- Nếu vẫn còn bản ghi cũ bị lỗi (ngoài phạm vi các bảng trên), hãy cập nhật chúng bằng một session UTF-8: `SET NAMES utf8mb4;` rồi `UPDATE` thủ công.
