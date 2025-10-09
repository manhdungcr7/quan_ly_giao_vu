# 🐛 DEBUG: Dữ Liệu Không Hiển Thị Sau Khi Lưu

## 📋 Vấn đề

Khi nhấn nút "Lưu thay đổi" trong modal ca thi:
- ✅ Dữ liệu được lưu vào database
- ❌ Dữ liệu không hiển thị trên giao diện danh sách

## 🔍 Nguyên nhân đã kiểm tra

### 1. Flow hoạt động hiện tại

```
User nhấn "Lưu" 
  → examination-enhanced.js::save()
  → POST/PUT /api/examination
  → ExaminationController::store/update
  → ExaminationSession::create/update
  → window.location.reload()
  → GET /examination
  → ExaminationController::index
  → ExaminationSession::findAll()
  → Render examination/list.ejs
```

### 2. Vấn đề đã phát hiện

#### ❌ Thiếu `file_count` trong query
**File**: `app/models/ExaminationSession.js`

Query `findAll()` không có subquery để đếm số file đính kèm, trong khi view `list.ejs` cần hiển thị:

```html
<% if (session.file_count && session.file_count > 0) { %>
  <button class="btn btn-sm btn-outline-primary">
    <i class="fas fa-paperclip"></i>
    <span class="badge bg-primary"><%= session.file_count %></span>
  </button>
<% } %>
```

**✅ ĐÃ SỬA**: Thêm subquery đếm file vào query findAll()

```sql
(SELECT COUNT(*) FROM examination_files ef 
 WHERE ef.session_id = es.id AND ef.status = 'active') as file_count
```

## 🧪 Các bước kiểm tra tiếp theo

### Test 1: Kiểm tra dữ liệu trong database

```sql
SELECT * FROM examination_sessions 
ORDER BY created_at DESC 
LIMIT 5;
```

Xem có record mới tạo không?

### Test 2: Kiểm tra console browser

1. Mở Developer Tools (F12)
2. Tab Console
3. Nhấn "Lưu thay đổi"
4. Xem logs:
   - `💾 Saving examination session:` - Dữ liệu gửi đi
   - `📤 Request:` - URL và method
   - `📥 Response:` - Kết quả từ server

### Test 3: Kiểm tra console server

Xem terminal chạy Node.js, tìm logs:
```
📋 Examination index - Start
📋 Sessions retrieved: X
```

Nếu `X = 0` → Không load được data
Nếu `X > 0` → Data đã load, kiểm tra view

### Test 4: Kiểm tra Network tab

1. F12 → Tab Network
2. Nhấn "Lưu thay đổi"
3. Xem request `/api/examination` hoặc `/api/examination/XX`
   - Status: 200 OK?
   - Response: `{"success": true}`?

## 🔧 Các vấn đề có thể xảy ra

### Vấn đề 1: Session không được tạo
**Triệu chứng**: Không có record mới trong database

**Nguyên nhân có thể**:
- Validation fail (required fields missing)
- Database constraint error
- Foreign key không tồn tại (period_id, subject_id)

**Kiểm tra**:
```javascript
// Trong browser console sau khi nhấn Lưu
// Xem response.error
```

### Vấn đề 2: Reload quá nhanh
**Triệu chứng**: Trang reload trước khi server xử lý xong

**Fix hiện tại**:
```javascript
if (result.success) {
  this.showNotification('Lưu thành công!', 'success');
  setTimeout(() => {
    window.location.reload();
  }, 1000); // Đợi 1 giây
}
```

**Có thể tăng thời gian**:
```javascript
setTimeout(() => {
  window.location.reload();
}, 2000); // Đợi 2 giây
```

### Vấn đề 3: Query findAll() lỗi
**Triệu chứng**: Server log có lỗi SQL

**Kiểm tra**: 
- JOIN tables có đúng không?
- Column names có đúng không?
- LEFT JOIN vs INNER JOIN

### Vấn đề 4: View render sai
**Triệu chứng**: Có data nhưng không hiển thị

**Kiểm tra `list.ejs`**:
```html
<% if (sessions && sessions.length > 0) { %>
  <!-- Show table -->
<% } else { %>
  <tr><td>Không có dữ liệu</td></tr>
<% } %>
```

## 🎯 Giải pháp đề xuất

### Giải pháp 1: Thay vì reload, load data qua AJAX ✅ RECOMMENDED

Thay vì:
```javascript
window.location.reload();
```

Làm:
```javascript
// Đóng modal
examinationModalManager.close();

// Load lại danh sách qua AJAX
await examinationModalManager.refreshList();

// Hoặc redirect về list page
window.location.href = '/examination';
```

### Giải pháp 2: Thêm cache buster

```javascript
window.location.href = `/examination?t=${Date.now()}`;
```

Tránh browser cache trang cũ.

### Giải pháp 3: Thêm debug logs

Trong `ExaminationController::index()`:
```javascript
console.log('📋 Sessions data:', JSON.stringify(sessions, null, 2));
console.log('📋 Total sessions:', sessions.length);
```

Trong `list.ejs` đầu file:
```html
<script>
console.log('🎨 View received sessions:', <%- JSON.stringify(sessions) %>);
console.log('🎨 Total:', <%= sessions ? sessions.length : 0 %>);
</script>
```

## 📝 Checklist kiểm tra

- [x] Query có `file_count` subquery
- [ ] Server logs không có lỗi SQL
- [ ] Browser console không có JS errors
- [ ] Network tab shows 200 OK response
- [ ] Database có record mới sau khi lưu
- [ ] `sessions` variable trong view không empty
- [ ] Reload delay đủ thời gian (1-2 giây)

## 🚀 Thử nghiệm

1. **Restart server** để apply changes:
   ```powershell
   cd "d:\PHAN MEM\quan_ly_giao_vu_new\quan_ly_giao_vu_mvc"
   npm start
   ```

2. **Truy cập trang**: `http://localhost:XXXX/examination`

3. **Nhấn nút "Lưu thay đổi"**

4. **Quan sát**:
   - Console logs (F12)
   - Server terminal
   - Danh sách có cập nhật không?

5. **Nếu vẫn không hiển thị**, gửi cho tôi:
   - Screenshot console browser
   - Copy logs từ terminal server
   - Screenshot trang danh sách

---

**Updated**: 2025-10-05
**Status**: INVESTIGATING
