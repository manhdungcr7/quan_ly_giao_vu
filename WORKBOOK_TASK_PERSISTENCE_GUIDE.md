# HƯỚNG DẪN SỬA LỖI: Công việc trong thẻ ngày không được lưu

## 🔍 Vấn đề
Khi nhập công việc vào các thẻ ngày (Thứ 2, Thứ 3, ...) trong trang "Sổ tay công tác", dữ liệu không được lưu vào cơ sở dữ liệu và mất khi reload trang.

## ✅ Giải pháp đã triển khai

### 1. Thêm Quick Task Manager vào frontend

File: `public/js/workbook-enhanced.js`

Đã thêm module `quickTaskManager` với các chức năng:
- `addTaskEnhanced()` - Thêm công việc mới
- `toggleTask()` - Đánh dấu hoàn thành/chưa hoàn thành
- `editTask()` - Chỉnh sửa công việc
- `deleteTask()` - Xóa công việc
- `addBatchTasks()` - Thêm nhiều công việc cùng lúc
- `applyQuickTemplate()` - Áp dụng mẫu công việc

### 2. Cách hoạt động

**Khi thêm công việc mới:**
1. User nhập text vào ô "Thêm nhanh"
2. Nhấn Enter hoặc nút "+"
3. JavaScript gọi `quickTaskManager.addTaskEnhanced(day, workbookId)`
4. Hàm này:
   - Lấy dữ liệu hiện tại từ server: `GET /workbook/entry?workbook_id=X&day_of_week=Y`
   - Thêm task mới vào mảng tasks
   - Lưu vào DB: `POST /workbook/entry` với body:
     ```json
     {
       "workbook_id": 123,
       "day_of_week": 2,
       "main_focus": "...",
       "tasks": "[{\"text\":\"Task text\",\"completed\":false,\"priority\":\"medium\"}]",
       "notes": "...",
       "progress": 50
     }
     ```
   - Refresh hiển thị trên trang

**Khi load trang:**
- Backend (`WorkbookController.index()` hoặc `.show()`) đã truy vấn DB và render tasks trong EJS
- Tasks được hiển thị với checkboxes và buttons delete/edit
- JavaScript events được gắn vào các elements để handle interactions

### 3. Backend API đã có sẵn

File: `app/controllers/WorkbookController.js`

- `POST /workbook/entry` - Lưu hoặc cập nhật entry (đã có từ trước)
- `GET /workbook/entry` - Lấy entry theo ngày (đã có từ trước)

File: `app/models/WorkbookEntry.js`

- `createOrUpdate()` - Tự động INSERT hoặc UPDATE dựa trên entry đã tồn tại
- Lưu trường `tasks` dưới dạng JSON string

### 4. Schema Database

File: `database/workbook_schema.sql`

```sql
CREATE TABLE `workbook_entries` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `workbook_id` int unsigned NOT NULL,
  `day_of_week` tinyint(1) NOT NULL,
  `main_focus` text,
  `tasks` longtext,  -- ← Lưu JSON array of tasks
  `notes` longtext,
  `progress` tinyint(3) unsigned DEFAULT 0,
  ...
)
```

## 📋 Test thủ công

### Bước 1: Khởi động server
```powershell
cd "d:\PHAN MEM\quan_ly_giao_vu_new\quan_ly_giao_vu_mvc"
node server.js
```

### Bước 2: Đăng nhập
- Mở trình duyệt: http://localhost:3000 (hoặc port hiện tại)
- Đăng nhập với user: `admin` / password: `admin123`

### Bước 3: Mở trang Sổ tay công tác
- Click menu "Sổ tay công tác"
- Hoặc truy cập: http://localhost:3000/workbook

### Bước 4: Thêm công việc vào thẻ ngày
1. Tìm thẻ "Thứ 2" (29-09)
2. Scroll xuống phần "CÔNG VIỆC"
3. Nhập vào ô "Thêm nhanh": `Test công việc 1`
4. Nhấn Enter hoặc click nút "+"
5. **Kiểm tra**: Công việc hiện ra trong danh sách với checkbox

### Bước 5: Kiểm tra lưu trữ
**Cách 1: Reload trang**
- Nhấn F5 để reload
- **Kỳ vọng**: Công việc "Test công việc 1" vẫn còn trong danh sách

**Cách 2: Kiểm tra Network tab**
- Mở DevTools (F12)
- Tab Network
- Thêm công việc mới
- **Kỳ vọng**: Thấy request `POST /workbook/entry` với Status 200
- Click vào request, xem Response:
  ```json
  {
    "success": true,
    "message": "Đã lưu thành công",
    "entry_id": 123,
    "progress": 50
  }
  ```

**Cách 3: Kiểm tra Database**
```sql
-- Kết nối MySQL và chạy query
SELECT * FROM workbook_entries 
WHERE day_of_week = 2  -- Thứ 2
ORDER BY updated_at DESC 
LIMIT 1;

-- Xem nội dung tasks (JSON)
SELECT id, day_of_week, tasks, progress 
FROM workbook_entries 
WHERE workbook_id = <your_workbook_id>;
```

## 🐛 Troubleshooting

### Vấn đề 1: Công việc không hiện sau khi thêm
**Nguyên nhân**: JavaScript không được load
**Kiểm tra**:
1. DevTools Console - Có lỗi JavaScript không?
2. Network tab - File `/js/workbook-enhanced.js?v=2024100402` có status 200 không?
3. Console gõ: `window.quickTaskManager` - Kỳ vọng: trả về object với các methods

**Giải pháp**:
- Hard refresh: Ctrl+Shift+R
- Clear cache
- Kiểm tra file tồn tại: `public/js/workbook-enhanced.js`

### Vấn đề 2: Thêm được nhưng mất sau khi reload
**Nguyên nhân**: API call thất bại hoặc session hết hạn
**Kiểm tra**:
1. Network tab - Request `/workbook/entry` có status 200 không?
2. Response có `"success": true` không?
3. Console có lỗi 403 Forbidden hoặc 401 Unauthorized không?

**Giải pháp**:
- Đăng xuất và đăng nhập lại
- Kiểm tra session middleware trong `server.js`
- Xem server logs có lỗi gì không

### Vấn đề 3: Lỗi 500 khi save
**Nguyên nhân**: Lỗi backend hoặc DB
**Kiểm tra**:
1. Server logs (terminal chạy `node server.js`)
2. Database connection
3. Quyền ghi vào bảng `workbook_entries`

**Giải pháp**:
```powershell
# Test database connection
node -e "const db = require('./config/database'); db.query('SELECT 1').then(() => console.log('DB OK')).catch(err => console.error(err));"
```

## 🎯 Các tính năng đã hoạt động

### ✅ Thêm công việc
- Nhập text và nhấn Enter
- Click nút "+"
- Hiển thị ngay lập tức
- Lưu vào DB tự động

### ✅ Toggle hoàn thành
- Click vào checkbox
- Task được đánh dấu completed (gạch ngang)
- Lưu state vào DB

### ✅ Chỉnh sửa
- Double-click vào text của task
- Text biến thành input field
- Sửa và nhấn Enter hoặc click ra ngoài
- Lưu vào DB

### ✅ Xóa
- Click nút X bên cạnh task
- Task bị xóa khỏi danh sách
- Xóa khỏi DB

### ✅ Thêm hàng loạt
- Click icon "Thêm nhiều công việc"
- Nhập nhiều dòng (mỗi dòng 1 task)
- Click "Thêm tất cả"
- Tất cả tasks được lưu

### ✅ Sử dụng mẫu
- Click icon "Mẫu công việc"
- Chọn template (Họp, Giảng dạy, Nghiên cứu, Hành chính)
- Các tasks mẫu được thêm vào
- Lưu vào DB

## 📝 Code snippet quan trọng

### Frontend - Thêm task
```javascript
// File: public/js/workbook-enhanced.js
async function addTaskEnhanced(day, workbookId) {
  const input = getQuickInputEl(day);
  const text = input.value.trim();
  if (!text) return;
  
  const entry = await fetchEntry(workbookId, day);
  entry.tasks.push({ text, completed: false, priority: 'medium' });
  
  const ok = await persistEntry(workbookId, day, entry);
  if (ok) {
    renderTaskList(day, workbookId, entry.tasks);
    input.value = '';
  }
}
```

### Backend - Lưu entry
```javascript
// File: app/controllers/WorkbookController.js
async saveEntry(req, res) {
  const { workbook_id, day_of_week, tasks } = req.body;
  
  // Verify ownership
  const workbook = await getWorkbook(workbook_id);
  if (workbook.user_id !== req.session.user.id) {
    return res.status(403).json({ success: false });
  }
  
  // Save
  const entryId = await WorkbookEntry.createOrUpdate({
    workbook_id,
    day_of_week,
    tasks: JSON.stringify(tasks),
    ...
  });
  
  res.json({ success: true, entry_id: entryId });
}
```

## 🚀 Next Steps

### Nâng cao thêm:
1. **Real-time sync**: Sử dụng WebSocket để sync giữa nhiều tabs
2. **Undo/Redo**: Thêm stack để undo xóa task
3. **Drag & Drop**: Sắp xếp lại thứ tự tasks
4. **Due dates**: Thêm deadline cho từng task
5. **Reminders**: Gửi thông báo cho tasks chưa hoàn thành

### Performance:
1. **Debounce**: Delay save khi user gõ nhanh
2. **Batch updates**: Gộp nhiều changes thành 1 request
3. **Optimistic UI**: Update UI trước, gọi API sau

## 📞 Support

Nếu vẫn gặp vấn đề:
1. Kiểm tra console logs (browser và server)
2. Xem Network tab cho requests
3. Test trực tiếp API bằng Postman hoặc curl
4. Kiểm tra database có dữ liệu không

---
**Ngày cập nhật**: 2024-10-04
**Version**: workbook-enhanced.js v2024100402
