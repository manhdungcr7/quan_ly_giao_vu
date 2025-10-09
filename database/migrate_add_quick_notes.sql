-- Thêm trường quick_notes vào bảng workbooks nếu chưa có
ALTER TABLE workbooks ADD COLUMN quick_notes LONGTEXT COMMENT 'Ghi chú nhanh cho tuần';
