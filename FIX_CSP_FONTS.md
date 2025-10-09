# ✅ Fix CSP Font Loading Error

## 🐛 Vấn đề
Lỗi: "Refused to load the font because it violates the following Content Security Policy directive: font-src"

## 🔧 Nguyên nhân
- Content Security Policy (CSP) trong `server.js` chưa cho phép load fonts từ Google Fonts
- File `views/workbook/index.ejs` đang import font Inter từ `fonts.googleapis.com`
- Font files thực tế được serve từ `fonts.gstatic.com`

## ✅ Giải pháp đã áp dụng

### 1. Cập nhật CSP trong `server.js`

**Trước:**
```javascript
"font-src": ["'self'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net", "data:"],
```

**Sau:**
```javascript
"font-src": ["'self'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com", "https://fonts.gstatic.com", "data:"],
```

### 2. Các domain đã được thêm vào whitelist:
- ✅ `https://fonts.googleapis.com` - CSS của Google Fonts
- ✅ `https://fonts.gstatic.com` - Font files (.woff2, .woff, .ttf)

## 🚀 Cách áp dụng

### Bước 1: Restart server
```powershell
# Trong terminal đang chạy server, nhấn Ctrl+C để dừng
# Sau đó chạy lại:
npm run dev
```

### Bước 2: Clear browser cache
```
1. Mở DevTools (F12)
2. Right-click nút Refresh
3. Chọn "Empty Cache and Hard Reload"
```

### Bước 3: Kiểm tra
1. Reload trang workbook
2. Mở Console (F12)
3. Không còn thấy lỗi CSP font nữa
4. Font Inter sẽ load thành công

## 📊 Kết quả mong đợi

### Trước khi fix:
```
❌ Refused to load the font '<URL>' because it violates CSP directive: "font-src"
❌ Font Inter không load được
❌ Fallback sang system font
```

### Sau khi fix:
```
✅ Không có lỗi CSP
✅ Font Inter load thành công từ Google Fonts
✅ Giao diện hiển thị đúng typography
```

## 🔍 Kiểm tra font đã load

### Trong DevTools:
1. Mở tab **Network**
2. Filter: **Font**
3. Reload trang
4. Sẽ thấy các file font từ `fonts.gstatic.com`:
   - `Inter-Regular.woff2`
   - `Inter-Medium.woff2`
   - `Inter-SemiBold.woff2`
   - `Inter-Bold.woff2`
   - `Inter-ExtraBold.woff2`

### Kiểm tra trong Console:
```javascript
// Kiểm tra font đã được apply
const element = document.querySelector('.workbook-container');
const style = window.getComputedStyle(element);
console.log(style.fontFamily);
// Kết quả mong đợi: "Inter", sans-serif
```

## 📝 Chi tiết CSP hiện tại

```javascript
contentSecurityPolicy: {
    useDefaults: true,
    directives: {
        "default-src": ["'self'"],
        "style-src": [
            "'self'", 
            "'unsafe-inline'", 
            "https://cdnjs.cloudflare.com", 
            "https://cdn.jsdelivr.net", 
            "https://fonts.googleapis.com"
        ],
        "font-src": [
            "'self'",                           // Local fonts
            "https://cdnjs.cloudflare.com",     // Font Awesome
            "https://cdn.jsdelivr.net",         // CDN fonts
            "https://fonts.googleapis.com",     // Google Fonts CSS
            "https://fonts.gstatic.com",        // Google Fonts files
            "data:"                             // Base64 embedded fonts
        ],
        "script-src": [
            "'self'", 
            "'unsafe-inline'", 
            "https://cdnjs.cloudflare.com", 
            "https://cdn.jsdelivr.net"
        ],
        "img-src": ["'self'", "data:", "https:"],
        "connect-src": ["'self'"],
    }
}
```

## 🎯 Tại sao cần 2 domain cho Google Fonts?

1. **fonts.googleapis.com**:
   - Serve CSS file chứa @font-face rules
   - Ví dụ: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap`
   - Cần có trong `style-src` (đã có) và `font-src`

2. **fonts.gstatic.com**:
   - Serve font files thực tế (.woff2, .woff, .ttf)
   - Ví dụ: `https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjg.woff2`
   - Cần có trong `font-src`

## 🔒 Bảo mật

CSP vẫn duy trì bảo mật tốt:
- ✅ Chỉ cho phép fonts từ trusted CDNs
- ✅ Không cho phép inline fonts nguy hiểm
- ✅ Whitelist rõ ràng các domains
- ✅ Không mở rộng quá mức (không dùng wildcard *)

## 🆘 Nếu vẫn có lỗi

### Lỗi vẫn xuất hiện sau khi restart:
1. Kiểm tra server đã restart thành công chưa
2. Check `server.js` đã được lưu chưa
3. Clear browser cache hoàn toàn
4. Thử incognito mode

### Font không hiển thị đúng:
1. Check Network tab xem font có load về không
2. Kiểm tra lỗi CORS (không nên có với Google Fonts)
3. Xem có lỗi 404 không

### Muốn dùng local fonts thay vì Google Fonts:
1. Download font Inter từ Google Fonts
2. Đặt vào `public/fonts/`
3. Update CSS dùng local path
4. Không cần `fonts.googleapis.com` và `fonts.gstatic.com` trong CSP

---
**Version**: Fixed CSP v1.0
**Last Updated**: 2024-10-03
**Status**: ✅ Ready to test
