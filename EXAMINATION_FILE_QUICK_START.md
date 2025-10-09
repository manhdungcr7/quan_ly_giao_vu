# 🚀 QUICK START - Examination File Upload

## ⚡ 5 Phút Để Bắt Đầu

### 1. ✅ Kiểm tra Database Migration
```bash
# Kiểm tra bảng examination_files
mysql -u root -pLoc15031992 quan_ly_giao_vu -e "DESCRIBE examination_files;"

# Kiểm tra cột file_count
mysql -u root -pLoc15031992 quan_ly_giao_vu -e "SHOW COLUMNS FROM examination_sessions LIKE 'file_count';"
```

**Expected output:**
- ✅ Bảng `examination_files` có 14 columns
- ✅ Cột `file_count` tồn tại trong `examination_sessions`

---

### 2. 🔄 Khởi động Server
```bash
cd "d:\PHAN MEM\quan_ly_giao_vu_new\quan_ly_giao_vu_mvc"
npm start
# hoặc
node server.js
```

**Server should start on:** http://localhost:3000

---

### 3. 🔑 Login
- Navigate to: http://localhost:3000/auth/login
- Username: admin
- Password: (your password)

---

### 4. 📋 Truy cập Công tác khảo thí
- Sidebar → "Công tác khảo thí"
- URL: http://localhost:3000/examination

---

### 5. 🎯 Sử dụng Tính năng

#### A. **Thêm File vào Ca thi**

**Cách 1: Từ nút Edit**
1. Click nút **Edit** (icon 🖊️) ở cột "Thao tác"
2. Modal mở ra với form 2 cột
3. Scroll xuống section "Tài liệu đính kèm"
4. Click button **"Thêm file"**
5. Chọn file PDF hoặc Word
6. File tự động upload và hiện trong list

**Cách 2: Drag & Drop**
1. Mở modal edit
2. Kéo file vào vùng upload (có viền đứt nét)
3. Drop file
4. File tự động upload

**Cách 3: Từ cột Link**
1. Click button **Upload** (icon ⬆️) ở cột "Link"
2. Modal mở, thêm file như trên

#### B. **Quản lý File**

**Preview file:**
- Click icon 👁️ (Eye) → Mở preview modal
  - PDF: Hiển thị trực tiếp
  - Word: Dùng Office Online Viewer

**Download file:**
- Click icon ⬇️ (Download) → File tải về

**Đặt file chính:**
- Click icon ⭐ (Star) → File được đánh dấu "CHÍNH"
- Badge màu tím hiện bên cạnh tên file

**Xóa file:**
- Click icon 🗑️ (Trash) → Confirm → File bị xóa (soft delete)

#### C. **Xem File Count**
- Ở cột "Link" trong list view
- Badge hiển thị số lượng file: **📎 3**
- Click badge → Mở modal với file list

---

## 🎨 UI Features

### Modal Design
```
┌─────────────────────────────────────────────────────────┐
│  🎓 Chi tiết ca thi                                 ❌  │ ← Gradient header
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────┬──────────────────┐               │
│  │ 📋 Thông tin cơ  │ ⚙️ Chi tiết &    │               │ ← 2 columns
│  │    bản           │    Tài liệu      │               │
│  ├──────────────────┼──────────────────┤               │
│  │ Mã ca thi        │ Phòng thi        │               │
│  │ Tên ca thi       │ Tòa nhà          │               │
│  │ Kỳ thi           │ Dự kiến bản in   │               │
│  │ Môn học          │ Cán bộ chấm      │               │
│  │ Lớp học          │ Hạn chấm bài     │               │
│  │ Ngày thi | Giờ   │ Hình thức thi    │               │
│  │ Thời lượng | SV  │ Link online      │               │
│  │                  │ Trạng thái       │               │
│  │                  │ Ghi chú          │               │
│  └──────────────────┴──────────────────┘               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📎 Tài liệu đính kèm                          3 │   │ ← Full width
│  │ ┌───────────────────────────────────────────┐   │   │
│  │ │  ☁️ Kéo thả file hoặc click để chọn      │   │   │ ← Upload zone
│  │ │  PDF, Word (.doc, .docx) - Tối đa 10MB   │   │   │
│  │ │          [➕ Thêm file]                   │   │   │
│  │ └───────────────────────────────────────────┘   │   │
│  │ ┌──────────────────────────────────────────────┐│   │
│  │ │📄 document.pdf [CHÍNH]                     ││   │ ← File item
│  │ │2.5 MB • 05/10/2025 07:45                   ││   │
│  │ │         [👁️] [⬇️] [🗑️]                    ││   │
│  │ └──────────────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│                            [❌ Hủy] [💾 Lưu thay đổi]  │ ← Footer
└─────────────────────────────────────────────────────────┘
```

### File List View
```
┌────────────────────────────────────────────────────────┐
│ Tên ca thi    │ Mã môn │ ... │ Link         │ Thao tác│
├────────────────────────────────────────────────────────┤
│ Ca thi Toán   │ MAT101 │ ... │ [📎 3] [🔗]  │ [🖊️]   │ ← File count badge
│ Ca thi Lý     │ PHY102 │ ... │ [⬆️]         │ [🖊️]   │ ← Upload button
└────────────────────────────────────────────────────────┘
```

---

## 🎯 Quick Test Scenarios

### ✅ Scenario 1: Upload First File
1. Open modal cho ca thi chưa có file
2. Upload 1 file PDF
3. ✅ File hiển thị với badge "CHÍNH"
4. ✅ File count = 1 trong list view

### ✅ Scenario 2: Upload Multiple Files
1. Upload thêm 2 files nữa
2. ✅ Tổng 3 files hiển thị
3. ✅ File đầu tiên vẫn là "CHÍNH"
4. ✅ File count = 3

### ✅ Scenario 3: Set Primary
1. Click ⭐ ở file thứ 2
2. ✅ File thứ 2 có badge "CHÍNH"
3. ✅ File đầu tiên mất badge

### ✅ Scenario 4: Preview
1. Click 👁️ ở file PDF
2. ✅ Preview modal mở
3. ✅ PDF hiển thị đầy đủ
4. Close modal → Return to file list

### ✅ Scenario 5: Download
1. Click ⬇️
2. ✅ File tải về với tên gốc
3. ✅ Download count tăng lên

### ✅ Scenario 6: Delete
1. Click 🗑️
2. Confirm
3. ✅ File biến mất
4. ✅ File count giảm

---

## 🐛 Common Issues & Fixes

### Issue 1: "Không thể tải file"
**Cause:** Server chưa chạy hoặc API error
**Fix:**
```bash
# Check server logs
npm start
# Look for errors in console
```

### Issue 2: Preview không hiện
**Cause:** File path không đúng hoặc CORS
**Fix:**
- Check file exists: `ls public/uploads/examination/`
- Check browser console for errors
- For Word: Check internet connection (Office Viewer requires online)

### Issue 3: File count không update
**Cause:** Database sync issue
**Fix:**
```sql
UPDATE examination_sessions 
SET file_count = (
    SELECT COUNT(*) 
    FROM examination_files 
    WHERE session_id = examination_sessions.id 
    AND status = 'active'
);
```

### Issue 4: Upload fails silently
**Cause:** Multer middleware issue
**Fix:**
- Check file size < 10MB
- Check file type (PDF, Word only)
- Check upload folder permissions

---

## 📊 Monitoring

### Check File Count
```sql
SELECT 
    es.id,
    es.exam_name,
    es.file_count,
    (SELECT COUNT(*) FROM examination_files 
     WHERE session_id = es.id AND status = 'active') as actual_count
FROM examination_sessions es;
```

### View Recent Uploads
```sql
SELECT 
    ef.*,
    es.exam_name,
    u.username
FROM examination_files ef
JOIN examination_sessions es ON ef.session_id = es.id
LEFT JOIN users u ON ef.uploaded_by = u.id
WHERE ef.status = 'active'
ORDER BY ef.uploaded_at DESC
LIMIT 10;
```

### Check Primary Files
```sql
SELECT 
    es.exam_name,
    ef.file_name,
    ef.file_size,
    ef.uploaded_at
FROM examination_files ef
JOIN examination_sessions es ON ef.session_id = es.id
WHERE ef.is_primary = TRUE
AND ef.status = 'active';
```

---

## 🎯 Next Steps

### After Basic Testing
1. ✅ Upload nhiều loại file (PDF, DOC, DOCX)
2. ✅ Test file size limits (9MB OK, 11MB reject)
3. ✅ Test invalid file types (.txt, .jpg)
4. ✅ Test preview trên mobile
5. ✅ Test concurrent uploads (multiple users)

### Production Checklist
- [ ] Backup database before deploying
- [ ] Test on staging environment
- [ ] Monitor disk space (uploads folder)
- [ ] Set up file cleanup cron (deleted files)
- [ ] Configure CDN for large files (optional)
- [ ] Enable virus scanning (future)

---

## 📞 Support

### Debugging Tips
1. **Enable detailed logging:**
   ```javascript
   console.log('Upload payload:', formData);
   console.log('Server response:', data);
   ```

2. **Check network tab:**
   - F12 → Network → Filter: XHR
   - Look for failed API calls
   - Check response bodies

3. **Check server logs:**
   ```bash
   tail -f logs/app.log
   # or
   npm start (watch console)
   ```

### Common Console Messages
```
✅ Database connected successfully
✅ File uploaded: document.pdf (2.5 MB)
✅ File count updated: 3 → 4
⚠️  File too large: rejected.pdf (12 MB)
❌ Upload failed: Invalid file type
```

---

## 🎉 Success Indicators

Bạn đã setup thành công khi:
- ✅ Modal mở ra smooth, không lag
- ✅ Upload file < 3 giây (local)
- ✅ Preview PDF hiển thị ngay lập tức
- ✅ File count badge update real-time
- ✅ Notifications xuất hiện và tự tắt
- ✅ No errors in console
- ✅ Database file_count khớp với actual count

---

**🚀 Ready to go! Happy uploading!**

*Generated: 2025-01-05*
*Version: 1.0.0*
