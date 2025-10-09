# Module Nghiên cứu khoa học

Trang **Nghiên cứu khoa học** cung cấp bảng điều khiển hợp nhất cho hoạt động nghiên cứu của khoa, bao gồm đề tài giảng viên, sáng kiến sinh viên, mốc thời gian quan trọng và các kết quả khoa học mới nhất.

> ✅ Từ tháng 10/2024, người quản trị có thể truy cập trang **/research/manage** để thêm mới, cập nhật hoặc xoá dữ liệu nghiên cứu trực tiếp trên hệ thống. Các thay đổi được đồng bộ hoá ngay lập tức lên dashboard chính.

## Thành phần chính

- **Tổng quan nhanh**: Thống kê số đề tài, trạng thái và phân bổ lĩnh vực.
- **Cảnh báo điều hành**: Phát hiện đề tài quá hạn, tiến độ thấp.
- **Dòng thời gian milestone**: Hiển thị hạn nghiệm thu, kiểm tra tình trạng từng mốc.
- **Leaderboard giảng viên**: Sắp xếp giảng viên theo số đề tài và tiến độ trung bình.
- **Đề tài sinh viên & kết quả khoa học**: Theo dõi tiến độ nhóm sinh viên, bài báo, giải thưởng.

## Cấu trúc dữ liệu

Các bảng MySQL được đề xuất nằm trong `database/schema_optimized.sql`:

- `projects`, `project_milestones`, `project_members` (đề tài giảng viên).
- `student_research_projects` (đề tài sinh viên).
- `student_research_outputs` (bài báo, giải thưởng, sáng chế).

> Nếu hệ thống hiện tại chưa có hai bảng sinh viên mới, trang sẽ hiển thị thông báo trống và không lỗi.

## Seed dữ liệu mẫu

Bạn có thể thêm bản ghi thử nghiệm theo ví dụ:

```sql
INSERT INTO student_research_projects (project_code, title, field, supervisor_name, lead_student, team_size, status, progress, start_date)
VALUES ('SV-2025-01', N'Nghiên cứu an ninh mạng khu vực', N'An ninh mạng', N'TS. Nguyễn Văn A', N'Lê Thị Bích', 3, 'in_progress', 55, '2025-01-10');

INSERT INTO student_research_outputs (project_id, type, title, publish_date, lead_author)
VALUES (1, 'paper', N'Giải pháp phát hiện sớm tấn công phishing', '2025-06-20', N'Lê Thị Bích');
```

## Chạy thử

Sau khi cập nhật dữ liệu, đăng nhập hệ thống và truy cập đường dẫn:

```
http://localhost:3000/research
```

Trang sẽ tự động tổng hợp dữ liệu từ các model:

- `Project` – danh sách đề tài, milestone, thống kê.
- `StudentResearch` – đề tài sinh viên, kết quả đầu ra.

## Tùy biến

- Điều chỉnh layout hoặc màu sắc tại `public/css/research.css`.
- Bổ sung logic xử lý dữ liệu trong `app/controllers/ResearchController.js`.
- Thay đổi giới hạn hiển thị (số đề tài, kết quả) bằng cách chỉnh tham số trong controller.

## Ghi chú

- Module ưu tiên đọc dữ liệu, chưa hỗ trợ CRUD đầy đủ.
- Nếu muốn quản trị đề tài sinh viên trực tiếp trên hệ thống, hãy mở rộng controller để cung cấp API hoặc giao diện nhập liệu.
