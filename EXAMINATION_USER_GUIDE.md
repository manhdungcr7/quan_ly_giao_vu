# HƯỚNG DẪN SỬ DỤNG MODULE CÔNG TÁC KHẢO THÍ (Đã Cải Tiến)

## 🎯 Tổng Quan

Module **Công tác khảo thí** đã được cải tiến với các tính năng mới:
- ✅ Quản lý ca thi CRUD hoàn chỉnh
- ✅ Phân công cán bộ chấm thi
- ✅ Thiết lập hạn chấm bài
- ✅ Gửi nhắc việc tự động
- ✅ Theo dõi tiến độ chấm bài
- ✅ Giao diện thân thiện, responsive

## 📊 Các Cột Dữ Liệu Mới

### Database Schema
Đã thêm các cột sau vào bảng `examination_sessions`:

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `grader_id` | INT | ID cán bộ chấm thi |
| `grading_deadline` | DATE | Hạn chấm bài |
| `reminder_sent` | BOOLEAN | Đã gửi nhắc việc chưa |
| `reminder_sent_at` | TIMESTAMP | Thời gian gửi nhắc |
| `building` | VARCHAR(100) | Tòa nhà (đã có sẵn) |

### Bảng Mới: `examination_reminders`
Lưu lịch sử nhắc việc:
- `session_id`: ID ca thi
- `reminder_type`: Loại nhắc (grading, invigilator, paper)
- `recipient_id`: ID người nhận
- `recipient_email`: Email người nhận
- `subject`, `message`: Tiêu đề và nội dung
- `status`: Trạng thái (sent, failed, pending)
- `sent_at`: Thời gian gửi

## 🎨 Giao Diện Trang Danh Sách

### Các Cột Hiển Thị (Đã Cập Nhật)

| Cột | Mô tả | Hiển thị |
|-----|-------|----------|
| **Tên ca thi** | Tên bài thi | Link đến chi tiết |
| **Mã môn** | Mã môn học | subject_code |
| **Lớp** | Mã lớp học | class_code |
| **Môn học** | Tên môn học | subject_name |
| **SL SV** | Số lượng sinh viên | student_count |
| **Cán bộ chấm** ⭐ NEW | Người chấm bài | Icon + Tên hoặc "Chưa phân công" |
| **Hạn chấm** ⭐ NEW | Thời hạn hoàn thành | Badge màu theo độ khẩn cấp |
| **Ngày thi** | Ngày & giờ thi | Định dạng vi-VN |
| **Link** | Link thi online | Icon external link |
| **Thao tác** | Các nút chức năng | Sửa, Nhắc việc, Xóa, Backup |

### Badge Hạn Chấm (Màu Tự Động)

```javascript
- Màu ĐỎ (badge-danger): Quá hạn (< 0 ngày)
- Màu VÀNG (badge-warning): Khẩn cấp (≤ 3 ngày)
- Màu XANH NHẠT (badge-info): Sắp đến hạn (≤ 7 ngày)
- Màu XÁM (badge-secondary): Bình thường (> 7 ngày)
```

### Nút Nhắc Việc (Thông Minh)

**Hiển thị khi:**
- ✅ Đã phân công cán bộ chấm (`grader_id` ≠ null)
- ✅ Đã thiết lập hạn chấm (`grading_deadline` ≠ null)
- ✅ Chưa gửi nhắc việc (`reminder_sent` = false)

**Icon:**
- 🔔 Vàng (`fa-bell`): Sẵn sàng gửi nhắc
- 🔕 Xám disabled (`fa-bell-slash`): Đã gửi nhắc

## 📝 Form Tạo/Sửa Ca Thi

### Bố Cục 2 Cột

#### Cột Trái: Thông Tin Cơ Bản
1. **Mã ca thi*** (required)
2. **Tên ca thi*** (required)
3. **Kỳ thi*** (dropdown - từ `examination_periods`)
4. **Môn học*** (dropdown - từ `subjects`)
5. **Lớp học** (dropdown - từ `classes`, optional)
6. **Ngày thi*** + **Giờ thi*** (date + time picker)
7. **Thời lượng** (phút, mặc định 90)
8. **Số lượng SV** (mặc định 0)

#### Cột Phải: Chi Tiết & Phân Công
1. **Phòng thi** + **Tòa nhà**
2. **Dự kiến số bản in**
3. **Cán bộ chấm thi** ⭐ (dropdown users với role admin/staff)
4. **Hạn chấm bài** ⭐ (date picker)
5. **Hình thức thi** (offline/online/hybrid)
6. **Link thi online**
7. **Trạng thái** (scheduled/in_progress/completed/cancelled)
8. **Ghi chú** (textarea)

### Validation
- Mã ca thi: unique, không trống
- Ngày thi, giờ thi: bắt buộc
- Thời lượng: 30-240 phút, step 15
- Hạn chấm: phải sau ngày thi (client-side suggestion)

## 🔔 Chức Năng Nhắc Việc

### Cách Hoạt Động

1. **Kiểm tra điều kiện:**
   ```javascript
   - grader_id IS NOT NULL
   - grading_deadline IS NOT NULL
   - reminder_sent = FALSE
   - DATEDIFF(grading_deadline, CURDATE()) <= 3 (còn ≤3 ngày)
   ```

2. **Khi bấm nút "Nhắc việc":**
   - Gửi POST request đến `/examination/:id/reminder`
   - Backend lưu vào `examination_reminders`
   - Cập nhật `reminder_sent = TRUE`, `reminder_sent_at = NOW()`
   - Hiển thị thông báo thành công
   - Reload trang để cập nhật UI

3. **Nội dung nhắc việc:**
   ```
   Subject: Nhắc việc: Hạn chấm bài thi - {exam_name}
   
   Kính gửi {grader_name},
   
   Đây là nhắc việc về ca thi:
   - Môn: {subject_name}
   - Ngày thi: {exam_date}
   - Hạn chấm: {grading_deadline}
   
   Vui lòng hoàn thành chấm bài đúng hạn.
   
   Trân trọng.
   ```

### API Endpoint
```javascript
POST /examination/:id/reminder
Auth: Required
Response: { success: true, message: "Đã gửi nhắc việc thành công" }
```

## 🗄️ Migration Database

### Chạy Script Cập Nhật

```bash
# Thêm các cột mới và bảng examination_reminders
node scripts/importExaminationEnhancement.js
```

**Kết quả:**
```
✅ grader_id (INT) added
✅ grading_deadline (DATE) added
✅ reminder_sent (BOOLEAN) added
✅ reminder_sent_at (TIMESTAMP) added
✅ examination_reminders table created
✅ v_examination_sessions_with_grader view created
```

### Rollback (Nếu cần)
```sql
ALTER TABLE examination_sessions 
DROP COLUMN grader_id,
DROP COLUMN grading_deadline,
DROP COLUMN reminder_sent,
DROP COLUMN reminder_sent_at;

DROP TABLE examination_reminders;
DROP VIEW v_examination_sessions_with_grader;
```

## 📡 API Endpoints

### List & Filter
```javascript
GET /examination
Query params: ?period_id=1&status=scheduled&search=keyword
Response: Render list view with sessions
```

### Create
```javascript
GET /examination/create
Response: Render form with dropdowns (periods, subjects, classes, graders)

POST /examination
Body: { exam_code, exam_name, period_id, subject_id, grader_id, grading_deadline, ... }
Response: { success: true, session_id: 123 }
```

### Read
```javascript
GET /examination/:id
Response: Render detail view (TODO)
```

### Update
```javascript
GET /examination/:id/edit
Response: Render form with existing data

PUT /examination/:id
Body: { grader_id, grading_deadline, ... }
Response: { success: true, message: "Cập nhật thành công" }
```

### Delete
```javascript
DELETE /examination/:id
Response: { success: true, message: "Xóa thành công" }
```

### Send Reminder
```javascript
POST /examination/:id/reminder
Response: { success: true, message: "Đã gửi nhắc việc thành công" }
```

## 🎯 Use Cases

### UC1: Tạo Ca Thi Mới Với Phân Công Chấm
1. Click "➕ Thêm ca thi"
2. Điền thông tin cơ bản: mã, tên, kỳ thi, môn, ngày giờ
3. **Chọn cán bộ chấm** từ dropdown
4. **Đặt hạn chấm** (ví dụ: 7 ngày sau ngày thi)
5. Click "💾 Tạo mới"
6. ✅ Ca thi được lưu vào DB

### UC2: Gửi Nhắc Việc Cho Cán Bộ Chấm
1. Vào trang danh sách `/examination`
2. Tìm ca thi có:
   - Badge hạn chấm màu VÀNG (còn ≤3 ngày)
   - Nút 🔔 màu vàng hiển thị
3. Click nút 🔔 "Nhắc việc"
4. Confirm "Gửi nhắc việc đến cán bộ chấm thi?"
5. ✅ Nhắc việc được gửi, nút chuyển sang 🔕 disabled

### UC3: Theo Dõi Tiến Độ Chấm Bài
1. Vào `/examination`, xem cột **Hạn chấm**
2. **Badge đỏ**: Quá hạn → Liên hệ ngay
3. **Badge vàng**: Còn 1-3 ngày → Gửi nhắc việc
4. **Badge xanh**: Còn 4-7 ngày → Theo dõi
5. Khi hoàn thành: Sửa trạng thái → "Hoàn thành"

## 🐛 Troubleshooting

### Không thấy dropdown "Cán bộ chấm"
**Nguyên nhân:** Không có user nào với `role_id IN (1,2)` và `is_active=1`
**Giải pháp:** Kiểm tra bảng `users`, đảm bảo có admin/staff

### Nút nhắc việc không hiện
**Kiểm tra:**
```sql
SELECT grader_id, grading_deadline, reminder_sent 
FROM examination_sessions 
WHERE id = ?;
```
Cả 3 điều kiện phải thỏa mãn

### Lỗi khi gửi nhắc việc
**Kiểm tra logs:**
```javascript
console.error('Error sending reminder:', error);
```
**Lỗi thường gặp:**
- grader_id = NULL
- grading_deadline = NULL
- Cán bộ không tồn tại trong DB

## 📈 Thống Kê & Báo Cáo (Tính Năng Tương Lai)

### Dashboard Khảo Thí
- Số ca thi đang diễn ra
- Số ca thi quá hạn chấm
- Tỷ lệ hoàn thành chấm bài
- Top cán bộ chấm nhiều nhất

### Export Excel
- Danh sách ca thi theo kỳ
- Báo cáo phân công chấm thi
- Lịch sử nhắc việc

## 🎓 Best Practices

1. **Đặt hạn chấm hợp lý:** 5-7 ngày sau ngày thi
2. **Phân công trước 2 tuần:** Đảm bảo cán bộ sắp xếp thời gian
3. **Nhắc việc kịp thời:** Khi còn 3 ngày
4. **Theo dõi tiến độ:** Check daily với badge màu đỏ/vàng
5. **Backup dữ liệu:** Định kỳ export Excel

## 📞 Hỗ Trợ

**File liên quan:**
- Model: `app/models/ExaminationSession.js`
- Controller: `app/controllers/ExaminationController.js`
- Routes: `app/routes/web.js` (line 250-258)
- View list: `views/examination/list.ejs`
- View form: `views/examination/form.ejs`
- Migration: `database/examination_enhancement.sql`
- Script: `scripts/importExaminationEnhancement.js`

**Lệnh hữu ích:**
```bash
# Khởi động server
node server.js

# Chạy migration
node scripts/importExaminationEnhancement.js

# Seed data mẫu (nếu cần)
node scripts/seedExaminationDataSimple.js

# Kiểm tra database
mysql -u root -p quan_ly_giao_vu
> SELECT * FROM examination_sessions LIMIT 5;
> SELECT * FROM examination_reminders LIMIT 5;
```

---

**Version:** 2.0 (Enhanced)  
**Last Updated:** 2025-10-04  
**Status:** ✅ Production Ready
