# 🧪 HƯỚNG DẪN KIỂM TRA CHỨC NĂNG SỔ TAY CÔNG TÁC

## ✅ Danh sách chức năng cần kiểm tra

### 1. **Điều hướng tuần (Week Navigation)**

#### Chức năng:
- ⬅️ Nút "Trước" (Prev Week): Chuyển về tuần trước
- ➡️ Nút "Sau" (Next Week): Chuyển sang tuần sau

#### Cách kiểm tra:
1. Mở trang `/workbook`
2. Xem ngày tháng hiện tại ở phần "Chọn tuần"
3. Click nút mũi tên trái ⬅️
   - ✅ **Kỳ vọng**: Trang reload với tuần trước đó
4. Click nút mũi tên phải ➡️
   - ✅ **Kỳ vọng**: Trang reload với tuần kế tiếp

#### Console logs:
```
⬅️ Previous week clicked
➡️ Next week clicked
```

---

### 2. **Chỉnh sửa ngày (Edit Day)**

#### Chức năng:
- ✏️ Nút edit trên mỗi card ngày
- Mở modal để nhập thông tin

#### Cách kiểm tra:
1. Tìm một card ngày (Thứ 2, Thứ 3, ...)
2. Click vào nút ✏️ (icon bút chì) ở góc trên bên phải card
3. ✅ **Kỳ vọng**: 
   - Modal hiện lên với animation
   - Tiêu đề modal hiển thị tên ngày (VD: "Chi tiết công việc - Thứ 2")
   - Form trống hoặc có dữ liệu cũ nếu đã lưu

#### Console logs:
```
✏️ Edit day: 1 Workbook: 123
✅ Modal opened for day: 1
📥 Loading data for day: 1
✅ Data loaded
```

---

### 3. **Thêm công việc (Add Task)**

#### Chức năng:
- ➕ Nút "Thêm công việc" trong modal
- Tạo thêm ô input cho công việc mới

#### Cách kiểm tra:
1. Mở modal edit một ngày
2. Tìm phần "Danh sách công việc"
3. Click nút "➕ Thêm công việc"
4. ✅ **Kỳ vọng**: 
   - Xuất hiện ô input mới
   - Có nút ❌ để xóa
   - Focus tự động vào ô input mới

#### Console logs:
```
➕ Adding new task input
```

#### Xóa công việc:
- Click nút ❌ bên cạnh ô input
- ✅ **Kỳ vọng**: Ô input bị xóa

#### Console logs:
```
🗑️ Task removed
```

---

### 4. **Thay đổi tiến độ (Progress Slider)**

#### Chức năng:
- Thanh kéo để cập nhật % hoàn thành
- Hiển thị số % theo thời gian thực

#### Cách kiểm tra:
1. Mở modal edit một ngày
2. Tìm phần "Tiến độ hoàn thành"
3. Kéo thanh slider từ 0% → 100%
4. ✅ **Kỳ vọng**: 
   - Số % bên cạnh cập nhật ngay lập tức
   - Màu gradient hiển thị đẹp

---

### 5. **Lưu dữ liệu (Save Entry)**

#### Chức năng:
- Lưu mục tiêu, công việc, ghi chú, tiến độ
- Gửi dữ liệu lên server
- Cập nhật card ngày

#### Cách kiểm tra:
1. Mở modal edit một ngày
2. Nhập các thông tin:
   - **Mục tiêu chính**: "Hoàn thành báo cáo tháng 10"
   - **Công việc** (thêm 3 công việc):
     - "Thu thập dữ liệu"
     - "Viết báo cáo"
     - "Trình bày kết quả"
   - **Ghi chú**: "Cần họp với trưởng phòng"
   - **Tiến độ**: 75%
3. Click nút "💾 Lưu"
4. ✅ **Kỳ vọng**: 
   - Thông báo "Đã lưu thành công!" xuất hiện góc phải màn hình
   - Modal đóng lại
   - Card ngày được cập nhật với thông tin mới
   - Progress bar hiển thị 75%

#### Console logs:
```
💾 Saving day entry...
📤 Sending data: {workbook_id: 123, day_of_week: 1, ...}
✅ Saved successfully: {entry_id: 456}
✅ Day card updated
```

#### Kiểm tra Network:
- Mở DevTools → Network tab
- Filter: `XHR`
- Tìm request: `POST /workbook/entry`
- Status: `200 OK`
- Response: `{success: true, message: "Đã lưu thành công", ...}`

---

### 6. **Đóng modal (Close Modal)**

#### Chức năng:
- Nút ❌ ở góc modal
- Nút "Hủy" ở footer
- Click vào backdrop (nền đen)
- Phím ESC

#### Cách kiểm tra:

**Cách 1 - Nút ❌:**
1. Mở modal
2. Click nút ❌ góc trên bên phải
3. ✅ **Kỳ vọng**: Modal đóng với animation

**Cách 2 - Nút "Hủy":**
1. Mở modal
2. Click nút "Hủy" ở dưới cùng
3. ✅ **Kỳ vọng**: Modal đóng với animation

**Cách 3 - Click backdrop:**
1. Mở modal
2. Click vào vùng tối bên ngoài modal
3. ✅ **Kỳ vọng**: Modal đóng

**Cách 4 - Phím ESC:**
1. Mở modal
2. Nhấn phím ESC
3. ✅ **Kỳ vọng**: Modal đóng

#### Console logs:
```
✅ Modal closed
```

---

### 7. **Thêm tuần mới (Add Week)**

#### Chức năng:
- Tạo sổ tay cho tuần tiếp theo

#### Cách kiểm tra:
1. Tìm nút "➕ Thêm tuần" ở sidebar
2. Click vào nút
3. ✅ **Kỳ vọng**: 
   - Hộp thoại xác nhận xuất hiện
   - Nội dung: "Bạn muốn tạo sổ tay cho tuần tiếp theo?"
4. Click "OK"
5. ✅ **Kỳ vọng**: 
   - Trang reload với tuần mới (tuần sau tuần hiện tại)
   - Các card ngày trống

#### Console logs:
```
➕ Add week clicked
```

---

### 8. **Gửi duyệt (Submit Workbook)**

#### Chức năng:
- Gửi sổ tay để phê duyệt
- Thay đổi trạng thái từ "Bản nháp" → "Chờ duyệt"

#### Cách kiểm tra:
1. Tìm nút "📤 Gửi duyệt" ở sidebar
2. Click vào nút
3. ✅ **Kỳ vọng**: 
   - Hộp thoại xác nhận: "Bạn muốn gửi sổ tay này để phê duyệt?"
4. Click "OK"
5. ✅ **Kỳ vọng**: 
   - Thông báo "Đã gửi sổ tay để phê duyệt!"
   - Trang reload sau 1.5 giây
   - Trạng thái thay đổi

#### Console logs:
```
📤 Submit workbook clicked
```

#### Kiểm tra Network:
- Request: `POST /workbook/:id/submit`
- Status: `200 OK`

---

### 9. **Lưu ghi chú nhanh (Quick Notes)**

#### Chức năng:
- Lưu ghi chú chung cho tuần
- Sử dụng localStorage

#### Cách kiểm tra:
1. Tìm ô "Ghi chú nhanh" ở sidebar phải
2. Nhập nội dung: "Tuần này cần tập trung vào dự án A"
3. Click nút "💾 Lưu ghi chú"
4. ✅ **Kỳ vọng**: 
   - Thông báo "Đã lưu ghi chú!"
5. Reload trang (F5)
6. ✅ **Kỳ vọng**: 
   - Ghi chú vẫn còn đó (lưu trong localStorage)

#### Console logs:
```
💾 Saving quick notes...
```

---

### 10. **Animation & UI/UX**

#### Kiểm tra hiệu ứng:

**Card hover:**
- Di chuột qua các card ngày
- ✅ **Kỳ vọng**: Card nâng lên, shadow tăng

**Button hover:**
- Di chuột qua các nút
- ✅ **Kỳ vọng**: 
  - Nút nâng lên
  - Shadow tăng
  - Màu sắc thay đổi

**Progress bar animation:**
- Khi load trang
- ✅ **Kỳ vọng**: Progress bar animate từ 0% → giá trị hiện tại

**Modal animation:**
- Mở modal
- ✅ **Kỳ vọng**: Scale từ 0.9 → 1, fade in
- Đóng modal
- ✅ **Kỳ vọng**: Scale từ 1 → 0.9, fade out

**Notification:**
- Khi lưu dữ liệu
- ✅ **Kỳ vọng**: 
  - Slide in từ phải
  - Hiển thị 3 giây
  - Slide out

---

## 🐛 Troubleshooting

### Vấn đề 1: Modal không mở
**Nguyên nhân:** JavaScript chưa load hoặc có lỗi

**Giải pháp:**
1. Mở Console (F12)
2. Kiểm tra có lỗi JavaScript không
3. Kiểm tra: `console.log('✅ Workbook module loaded successfully')`
4. Refresh lại trang với Ctrl+F5 (xóa cache)

### Vấn đề 2: Không lưu được dữ liệu
**Nguyên nhân:** Network error hoặc server không phản hồi

**Giải pháp:**
1. Mở DevTools → Network tab
2. Kiểm tra request POST /workbook/entry
3. Xem status code và response
4. Kiểm tra console có lỗi không

### Vấn đề 3: Giao diện không đẹp
**Nguyên nhân:** CSS bị cache

**Giải pháp:**
1. Hard refresh: Ctrl+Shift+R (hoặc Ctrl+F5)
2. Xóa cache browser
3. Kiểm tra file CSS có load không (DevTools → Network → CSS)

### Vấn đề 4: Thêm công việc không hoạt động
**Nguyên nhân:** Event listener chưa được gán

**Giải pháp:**
1. Kiểm tra console log: `➕ Adding new task input`
2. Refresh trang
3. Kiểm tra JavaScript có load không

---

## 📝 Checklist tổng hợp

- [ ] Week navigation (prev/next)
- [ ] Mở modal edit ngày
- [ ] Thêm công việc
- [ ] Xóa công việc
- [ ] Kéo progress slider
- [ ] Nhập mục tiêu
- [ ] Nhập ghi chú
- [ ] Lưu entry
- [ ] Đóng modal (4 cách)
- [ ] Thêm tuần mới
- [ ] Gửi duyệt
- [ ] Lưu ghi chú nhanh
- [ ] Card hover effects
- [ ] Button hover effects
- [ ] Modal animations
- [ ] Notifications
- [ ] Progress bar animations

---

## 🎯 Kết quả mong đợi

Sau khi test xong tất cả các chức năng:

✅ **Tất cả chức năng hoạt động trơn tru**
✅ **Giao diện đẹp, hiện đại**
✅ **Animations mượt mà**
✅ **UX tốt, dễ sử dụng**
✅ **Không có lỗi JavaScript**
✅ **Không có lỗi Network**

---

## 📞 Liên hệ hỗ trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra Console logs
2. Kiểm tra Network tab
3. Ghi lại bước tái hiện lỗi
4. Chụp màn hình nếu cần

**Version:** 2024.10.03
**Last Updated:** October 3, 2025
