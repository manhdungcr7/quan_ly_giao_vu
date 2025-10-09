# Hướng dẫn Debug các nút chức năng

## 🐛 Vấn đề hiện tại
Các nút "Thêm tuần", "Thêm công việc", "Lưu ghi chú" chưa hoạt động

## ✅ Cập nhật mới nhất (v2024100305)

### Thay đổi:
1. **Nút "Lưu ghi chú"**: Đã thêm `data-action="save-notes"` và logging chi tiết
2. **JavaScript version**: Cập nhật lên v2024100305
3. **Console logging**: Đã thêm log toàn diện để debug

### Các nút đã được kiểm tra:
- ✅ Nút "Thêm công việc" có `data-action="add-task"` (trong modal)
- ✅ Nút "Thêm tuần" có `data-action="add-week"` 
- ✅ Nút "Lưu ghi chú" có `data-action="save-notes"`
- ✅ Nút "Nộp sổ" có `data-action="submit-workbook"`

## 🔍 Các bước Debug

### Bước 1: Reload trang mới
1. Nhấn `Ctrl + F5` để xóa cache và reload trang
2. Đảm bảo file JavaScript mới được tải (check Network tab)

### Bước 2: Mở Console
1. Nhấn `F12` để mở DevTools
2. Chọn tab **Console**
3. Kiểm tra các log sau:

#### Log khởi tạo:
```
🚀 Workbook Enhanced v2.0 initialized
Current workbook ID: [số ID]
```

#### Log setup event listeners:
```
🔧 Setting up event listeners...
Prev week button: [element hoặc null]
Next week button: [element hoặc null]
Add week button: [element hoặc null]
Submit button: [element hoặc null]
Edit buttons found: 7
Modal close buttons found: [số lượng]
Add task button: [element hoặc null]
Save notes button: [element hoặc null]
Toggle buttons found: [số lượng]
✅ Prev week button listener added
✅ Next week button listener added
✅ Add week button listener added
✅ Submit button listener added
✅ Add task button listener added
✅ Save notes button listener added
```

### Bước 3: Test từng nút

#### Test nút "Thêm tuần":
1. Click vào nút "Thêm tuần"
2. Console sẽ hiện: `➕ Adding new week...`
3. Notification hiện: "Chức năng thêm tuần mới đang được phát triển"

#### Test nút "Thêm công việc" (trong modal):
1. Click nút "Chỉnh sửa" trên một ngày bất kỳ
2. Modal sẽ mở ra
3. Click nút "Thêm công việc"
4. Console sẽ hiện: `➕ Adding task field with value: undefined`
5. Một ô input mới sẽ xuất hiện
6. Console sẽ hiện: `✅ Task field added`

#### Test nút "Lưu ghi chú":
1. Nhập text vào ô "Ghi chú nhanh"
2. Click nút "Lưu ghi chú"
3. Console sẽ hiện:
   ```
   💾 Saving quick notes...
   Notes content: [nội dung bạn nhập]
   ✅ Notes saved to localStorage
   ```
4. Notification hiện: "Chức năng lưu ghi chú nhanh đang được phát triển"

#### Test nút "Nộp sổ":
1. Click nút "Nộp sổ"
2. Console sẽ hiện: `📤 Submitting workbook...`
3. Nếu thành công: `✅ Workbook submitted successfully!`

### Bước 4: Kiểm tra lỗi

#### Nếu không thấy log khởi tạo:
- JavaScript không được tải hoặc có lỗi syntax
- Check tab **Console** xem có lỗi màu đỏ không
- Check tab **Network** xem file `workbook-enhanced.js` có status 200 không

#### Nếu button là `null`:
- Element không tồn tại trong DOM
- Kiểm tra lại HTML có đúng `data-action` không
- Check xem JavaScript có chạy trước khi DOM ready không

#### Nếu không thấy log khi click:
- Event listener không được gắn
- Có thể có element khác đang chặn click event
- Check z-index và position của các element

## 🔧 Cách fix thông thường

### Fix 1: Clear cache hoàn toàn
```
1. Mở DevTools (F12)
2. Click chuột phải vào nút Refresh
3. Chọn "Empty Cache and Hard Reload"
```

### Fix 2: Kiểm tra JavaScript được load
```javascript
// Trong Console, gõ:
window.WorkbookApp
// Phải trả về object với các function
```

### Fix 3: Test event listener thủ công
```javascript
// Trong Console, gõ:
const addWeekBtn = document.querySelector('[data-action="add-week"]');
console.log(addWeekBtn);
// Phải trả về element, không phải null
```

## 📊 Trạng thái chức năng

### Hoạt động đầy đủ:
- ✅ Chỉnh sửa ngày (Edit day) - Mở modal
- ✅ Lưu thông tin ngày - Gửi POST /workbook/entry
- ✅ Nộp sổ - Gửi PUT /workbook/:id/status
- ✅ Đóng modal
- ✅ Thay đổi view (grid/list)
- ✅ Progress slider

### Hoạt động frontend (chưa có backend):
- ⚠️ Thêm tuần - Hiện thông báo
- ⚠️ Navigation tuần (◄ ►) - Hiện thông báo
- ⚠️ Lưu ghi chú nhanh - Lưu localStorage
- ✅ Thêm công việc - Thêm input field

### Cần kiểm tra:
- 🔍 Event listeners có gắn đúng không
- 🔍 Buttons có tồn tại trong DOM không
- 🔍 JavaScript có lỗi runtime không

## 📝 Kết quả mong đợi

Sau khi reload trang (`Ctrl+F5`), Console phải hiện:

```
🚀 Workbook Enhanced v2.0 initialized
Current workbook ID: 1
🔧 Setting up event listeners...
Prev week button: <button data-action="prev-week">...</button>
Next week button: <button data-action="next-week">...</button>
Add week button: <button data-action="add-week">...</button>
Submit button: <button data-action="submit-workbook">...</button>
Edit buttons found: 7
Modal close buttons found: 2
Add task button: <button data-action="add-task">...</button>
Save notes button: <button data-action="save-notes">...</button>
Toggle buttons found: 2
✅ Prev week button listener added
✅ Next week button listener added
✅ Add week button listener added
✅ Submit button listener added
✅ Add task button listener added
✅ Save notes button listener added
```

## 🆘 Nếu vẫn không hoạt động

Gửi cho tôi:
1. Screenshot của Console tab
2. Screenshot của Network tab (filter: JS)
3. Thông tin trình duyệt (Chrome/Edge/Firefox version)
4. Có thấy log "🚀 Workbook Enhanced v2.0 initialized" không?
5. Khi click nút có thấy log gì trong Console không?

---
**Version**: v2024100305
**Last Updated**: 2024-10-03
