# 🐛 BUGFIX: Schedule 500 Error & Favicon SSL

## ❌ Lỗi ban đầu

```
schedule:1  Failed to load resource: the server responded with a status of 500 (Internal Server Error)
:3000/favicon.svg:1  Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR
```

## 🔍 Nguyên nhân

### 1. Controller không được khởi tạo đúng
- `ScheduleController` được import nhưng không được sử dụng đúng
- File `app/controllers/ScheduleController.js` export **instance** (`module.exports = new ScheduleController()`)
- Nhưng trong `app/routes/web.js` lại cố gắng tạo instance mới: `new ScheduleController()` → **TypeError: not a constructor**

### 2. Route gọi sai class thay vì instance
- `router.get('/schedule', requireAuth, (req, res) => ScheduleController.index(req, res))`
- Gọi static method thay vì instance method → **index is not a function**

### 3. Favicon SSL Protocol Error
- Browser tự động request favicon với HTTPS
- Server chỉ có HTTP → mismatch protocol

## ✅ Giải pháp đã áp dụng

### 1. Sửa controller reference trong web.js

**Trước:**
```javascript
const ScheduleController = require('../controllers/ScheduleController');
// ...
const scheduleController = new ScheduleController(); // ❌ Error
```

**Sau:**
```javascript
const ScheduleController = require('../controllers/ScheduleController');
// ...
const scheduleController = ScheduleController; // ✅ Đã là instance rồi
```

### 2. Sửa route call đúng instance

**Trước:**
```javascript
router.get('/schedule', requireAuth, (req, res) => ScheduleController.index(req, res)); // ❌
```

**Sau:**
```javascript
router.get('/schedule', requireAuth, (req, res) => scheduleController.index(req, res)); // ✅
```

### 3. Thêm redirect cho legacy route

```javascript
router.get('/schedules', requireAuth, (req, res) => res.redirect(301, '/schedule'));
```

### 4. Fix favicon với inline base64

**Trước:**
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg"> <!-- ❌ SSL error -->
```

**Sau:**
```html
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📅</text></svg>">
```

## 📊 Kết quả

### ✅ Đã sửa
- Server start bình thường
- Trang `/schedule` load thành công (200 OK)
- Calendar FullCalendar hiển thị đúng
- Không còn 500 error
- Favicon load inline, không có SSL error

### 🧪 Test cases passed
```bash
# 1. Server start
npm start  # ✅ No errors

# 2. Schedule page
curl http://localhost:3000/schedule  # ✅ 200 OK

# 3. Legacy redirect
curl -I http://localhost:3000/schedules  # ✅ 301 → /schedule

# 4. Favicon
# Browser không còn request HTTPS favicon nữa
```

## 📝 Files đã sửa

1. **app/routes/web.js**
   - Sửa `scheduleController` reference (không dùng `new`)
   - Sửa route call từ `ScheduleController` → `scheduleController`
   - Thêm redirect `/schedules` → `/schedule`

2. **app/views/schedule/index.ejs**
   - Thêm inline favicon base64 (emoji 📅)

## 💡 Bài học

### Pattern Export Controller

**Option A: Export class** (như DashboardController, UserController...)
```javascript
class MyController { ... }
module.exports = MyController;

// Usage:
const myController = new MyController();
```

**Option B: Export instance** (như ScheduleController)
```javascript
class MyController { ... }
module.exports = new MyController();

// Usage:
const myController = MyController; // Không dùng new
```

⚠️ **Cần nhất quán pattern trong toàn bộ project**

### Favicon best practice

1. **Inline base64** (dev) - tránh HTTP/HTTPS mismatch
2. **Static file với explicit route** (production)
3. **CDN favicon** (scale)

---

**Status:** ✅ Hoàn thành  
**Time:** 10 phút  
**Root Cause:** Constructor pattern inconsistency  
**Impact:** Page 500 error → Users không thể truy cập lịch công tác
