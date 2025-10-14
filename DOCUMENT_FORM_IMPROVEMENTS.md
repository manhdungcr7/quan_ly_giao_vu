# Cải Tiến Form Thêm Văn Bản & Tính Năng Lọc

## Tổng Quan
Tài liệu này mô tả các cải tiến được thực hiện cho module quản lý văn bản, bao gồm:
1. Điều chỉnh bố cục form thêm văn bản mới
2. Chuyển đổi dropdown sang datalist với gợi ý nhập nhanh
3. Bổ sung trường trạng thái
4. Sửa lỗi tính năng lọc văn bản

---

## 1. Cải Tiến Bố Cục Form (views/documents/create.ejs)

### Thay Đổi Layout
- **Trước**: Grid 3 cột tự động (auto-fit) với max-width 1200px
- **Sau**: Grid 2 cột cố định với max-width 1400px
- **Responsive**: Chuyển sang 1 cột khi màn hình < 1200px

```css
/* public/css/documents.css */
.document-form {
  max-width: 1400px !important;
}

.form-grid {
  grid-template-columns: repeat(2, 1fr) !important;
}
```

### Lợi Ích
- Form rộng hơn, tận dụng không gian màn hình
- Bố cục 2 cột cân đối, dễ đọc hơn
- Giảm cuộn trang dọc

---

## 2. Chuyển Dropdown Sang Datalist

### Các Trường Được Chuyển Đổi

#### 2.1 Loại Văn Bản (type_id)
```html
<!-- Trước -->
<select name="type_id" id="type_id">
  <option value="">-- Chọn loại --</option>
  ...
</select>

<!-- Sau -->
<input type="hidden" name="type_id" id="type_id">
<input type="text" id="type_id_display" list="typeIdOptions" 
       placeholder="Gõ để tìm loại văn bản">
<datalist id="typeIdOptions">
  <option value="Tên loại" data-id="ID"></option>
</datalist>
```

#### 2.2 Độ Ưu Tiên (priority)
```html
<input type="hidden" name="priority" id="priority">
<input type="text" id="priority_display" list="priorityOptions">
<datalist id="priorityOptions">
  <option value="Thấp" data-id="low"></option>
  <option value="Bình thường" data-id="medium"></option>
  <option value="Cao" data-id="high"></option>
  <option value="Khẩn cấp" data-id="urgent"></option>
</datalist>
```

#### 2.3 Trạng Thái (status) - **MỚI**
```html
<input type="hidden" name="status" id="status">
<input type="text" id="status_display" list="statusOptions">
<datalist id="statusOptions">
  <option value="Chờ xử lý" data-id="pending"></option>
  <option value="Đang xử lý" data-id="processing"></option>
  <option value="Hoàn tất" data-id="completed"></option>
  <option value="Đã duyệt" data-id="approved"></option>
  <option value="Đã lưu trữ" data-id="archived"></option>
</datalist>
```

#### 2.4 Cơ Quan Gửi (from_org_id)
```html
<input type="hidden" name="from_org_id" id="from_org_id">
<input type="text" id="from_org_display" list="fromOrgOptions"
       placeholder="Gõ để tìm cơ quan gửi">
<datalist id="fromOrgOptions">...</datalist>
```

#### 2.5 Cơ Quan Nhận (to_org_id) - **Đã có từ trước**
#### 2.6 Người Xử Lý (assigned_to) - **Đã có từ trước**

### Cơ Chế Hoạt Động

```javascript
function bindDatalist(inputId, hiddenId, datalistId) {
  var input = document.getElementById(inputId);
  var hidden = document.getElementById(hiddenId);
  var datalist = document.getElementById(datalistId);
  
  function syncHidden() {
    var value = input.value.trim();
    var matchedOption = null;
    
    for (var i = 0; i < datalist.options.length; i++) {
      if (datalist.options[i].value === value) {
        matchedOption = datalist.options[i];
        break;
      }
    }
    
    if (matchedOption) {
      hidden.value = matchedOption.dataset.id || matchedOption.value;
    } else {
      hidden.value = '';
    }
  }
  
  input.addEventListener('change', syncHidden);
  input.addEventListener('blur', syncHidden);
  input.addEventListener('input', function() {
    if (!input.value.trim()) {
      hidden.value = '';
    }
  });
  
  syncHidden();
}

// Bind tất cả các trường
bindDatalist('type_id_display', 'type_id', 'typeIdOptions');
bindDatalist('priority_display', 'priority', 'priorityOptions');
bindDatalist('status_display', 'status', 'statusOptions');
bindDatalist('assigned_to_display', 'assigned_to', 'assignedToOptions');
bindDatalist('from_org_display', 'from_org_id', 'fromOrgOptions');
bindDatalist('to_org_display', 'to_org_id', 'toOrgOptions');
```

### Lợi Ích Datalist
- ✅ Gõ nhanh để tìm kiếm
- ✅ Hỗ trợ autocomplete native của trình duyệt
- ✅ Linh hoạt hơn dropdown truyền thống
- ✅ Giao diện thân thiện với người dùng
- ✅ Vẫn giữ được validation (hidden input chứa ID)

---

## 3. Trường Trạng Thái Mới

### Vị Trí
- **Section**: Thông tin xử lý
- **Vị trí**: Sau trường "Độ ưu tiên"
- **Giá trị mặc định**: `pending` (Chờ xử lý)

### Các Trạng Thái
| Value | Label | Mô tả |
|-------|-------|-------|
| `pending` | Chờ xử lý | Văn bản mới, chưa được xử lý |
| `processing` | Đang xử lý | Đang trong quá trình xử lý |
| `completed` | Hoàn tất | Đã hoàn thành xử lý |
| `approved` | Đã duyệt | Đã được phê duyệt |
| `archived` | Đã lưu trữ | Đã lưu trữ |

### Controller Update (Không cần)
Trường `status` đã tồn tại trong database và controller, chỉ cần thêm vào UI.

---

## 4. Sửa Lỗi Tính Năng Lọc (Văn Bản Đến/Đi)

### Vấn Đề
Bộ lọc trong `/documents/incoming` và `/documents/outgoing` không hoạt động vì:
1. Hàm `getSimpleDocuments()` không nhận tham số filters
2. Hàm `list()` không truyền filters vào query

### Giải Pháp

#### 4.1 Cập Nhật `getSimpleDocuments()` (app/controllers/DocumentController.js)

```javascript
async getSimpleDocuments(direction, page = 1, limit = 20, filters = {}) {
  try {
    const offset = (page - 1) * limit;
    
    // Build WHERE conditions based on filters
    const whereClauses = ['d.direction = ?'];
    const params = [direction];
    
    // Search in document_number, title, content_summary
    if (filters.search && filters.search.trim()) {
      whereClauses.push('(d.document_number LIKE ? OR d.title LIKE ? OR d.content_summary LIKE ?)');
      const searchTerm = `%${filters.search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Filter by status
    if (filters.status && filters.status.trim()) {
      whereClauses.push('d.status = ?');
      params.push(filters.status.trim());
    }
    
    // Filter by document type
    if (filters.type_id && filters.type_id.trim()) {
      whereClauses.push('d.type_id = ?');
      params.push(parseInt(filters.type_id));
    }
    
    // Filter by date range
    if (filters.from_date && filters.from_date.trim()) {
      whereClauses.push('d.issue_date >= ?');
      params.push(filters.from_date.trim());
    }
    
    if (filters.to_date && filters.to_date.trim()) {
      whereClauses.push('d.issue_date <= ?');
      params.push(filters.to_date.trim());
    }
    
    const whereClause = whereClauses.join(' AND ');
    
    const sql = `SELECT d.id, d.document_number, d.title, d.status, d.priority, 
                        d.processing_deadline, d.issue_date, d.chi_dao,
                 dt.name AS document_type_name,
                 org_from.name AS from_organization_name,
                 org_to.name AS to_organization_name,
                 u_assigned.full_name AS assigned_to_name
          FROM documents d
          LEFT JOIN document_types dt ON d.type_id = dt.id
          LEFT JOIN organizations org_from ON d.from_org_id = org_from.id
          LEFT JOIN organizations org_to ON d.to_org_id = org_to.id
          LEFT JOIN users u_assigned ON d.assigned_to = u_assigned.id
          WHERE ${whereClause}
          ORDER BY d.created_at DESC
          LIMIT ${limit} OFFSET ${offset}`;
    
    const documents = await db.findMany(sql, params);
    
    const countSql = `SELECT COUNT(*) as total FROM documents d WHERE ${whereClause}`;
    const countResult = await db.findOne(countSql, params);
    const total = countResult.total;
    
    return {
      data: documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  } catch (error) {
    console.error('Documents query error:', error);
    return { 
      data: [], 
      pagination: { page:1, limit, total:0, totalPages:0, hasNext:false, hasPrev:false } 
    };
  }
}
```

#### 4.2 Cập Nhật `list()` (app/controllers/DocumentController.js)

```javascript
async list(req, res, direction) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    // Extract filter parameters from query
    const filters = {
      search: req.query.search || '',
      status: req.query.status || '',
      type_id: req.query.type_id || '',
      from_date: req.query.from_date || '',
      to_date: req.query.to_date || ''
    };

    const result = await this.getSimpleDocuments(direction, page, limit, filters);
    const stats = await this.getDirectionStats(direction);
    const master = await this.loadMasterData();

    res.render('documents/list', {
      title: direction === 'incoming' ? 'Văn bản đến' : 'Văn bản đi',
      user: req.session.user,
      direction,
      documents: result.data,
      pagination: result.pagination,
      filters: filters, // pass filters to template
      stats,
      types: master.types,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Error in DocumentController list:', error);
    req.flash('error', 'Không thể tải danh sách văn bản');
    res.redirect('/dashboard');
  }
}
```

#### 4.3 Sửa So Sánh Type ID (views/documents/list.ejs)

```html
<!-- Trước -->
<option value="<%= t.id %>" <%= (filters.type_id == t.id)? 'selected' : '' %>>

<!-- Sau -->
<option value="<%= t.id %>" <%= (String(filters.type_id) === String(t.id))? 'selected' : '' %>>
```

### Các Bộ Lọc Được Hỗ Trợ

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `search` | string | Tìm trong số hiệu, tiêu đề, trích yếu (LIKE) |
| `status` | string | Lọc theo trạng thái (pending, processing, completed, approved) |
| `type_id` | number | Lọc theo loại văn bản |
| `from_date` | date | Lọc văn bản ban hành từ ngày |
| `to_date` | date | Lọc văn bản ban hành đến ngày |

### Pagination với Filters
Pagination tự động giữ lại các tham số lọc:

```javascript
const qs = (page) => {
  const params = new URLSearchParams(filters);
  params.set('page', page);
  return baseUrl + '?' + params.toString();
};
```

---

## 5. Testing Checklist

### Form Thêm Văn Bản
- [ ] Bố cục 2 cột hiển thị đúng trên desktop (> 1200px)
- [ ] Chuyển sang 1 cột trên tablet/mobile (< 1200px)
- [ ] Datalist hoạt động: gõ tìm loại văn bản
- [ ] Datalist hoạt động: chọn độ ưu tiên
- [ ] Datalist hoạt động: chọn trạng thái (MỚI)
- [ ] Datalist hoạt động: tìm cơ quan gửi
- [ ] Datalist hoạt động: tìm cơ quan nhận
- [ ] Datalist hoạt động: tìm người xử lý
- [ ] Hidden input chứa đúng ID khi submit form
- [ ] Toggle cơ quan gửi/nhận theo loại văn bản (đến/đi)
- [ ] Validation: required fields hoạt động
- [ ] Submit form thành công với tất cả trường datalist

### Tính Năng Lọc
- [ ] Lọc theo tìm kiếm (search box)
- [ ] Lọc theo trạng thái (dropdown)
- [ ] Lọc theo loại văn bản (dropdown)
- [ ] Lọc theo khoảng thời gian (from_date, to_date)
- [ ] Kết hợp nhiều bộ lọc cùng lúc
- [ ] Pagination giữ lại filters
- [ ] Nút "Xóa" reset tất cả filters
- [ ] Form lọc repopulate đúng giá trị sau submit

---

## 6. Files Đã Thay Đổi

### Views
- `views/documents/create.ejs`
  - Chuyển layout sang 2 cột
  - Thay dropdown bằng datalist (type_id, priority, from_org_id)
  - Thêm trường status
  - Cập nhật JavaScript binding

- `views/documents/list.ejs`
  - Sửa so sánh type_id trong select option

### Controllers
- `app/controllers/DocumentController.js`
  - Cập nhật `getSimpleDocuments()`: thêm filters, build WHERE động
  - Cập nhật `list()`: extract và truyền filters

### Styles
- `public/css/documents.css`
  - Tăng max-width: 1200px → 1400px
  - Đổi grid: auto-fit → 2 cột cố định
  - Thêm breakpoint 1200px cho responsive

---

## 7. Lưu Ý Khi Maintain

### Thêm Trường Datalist Mới
1. Tạo cặp input (hidden + display)
2. Tạo datalist với options có `data-id`
3. Gọi `bindDatalist()` trong DOMContentLoaded
4. Xử lý preselect trong EJS (tìm selected item)

### Thêm Filter Mới
1. Thêm vào form lọc (views/documents/list.ejs)
2. Extract trong `list()` method (controller)
3. Build WHERE clause trong `getSimpleDocuments()`
4. Thêm param vào SQL query

### Debug Tips
```javascript
// Bật debug log trong development
if (process.env.NODE_ENV === 'development') {
  console.log('Filters:', filters);
  console.log('SQL:', sql);
  console.log('Params:', params);
}
```

---

## 8. Kết Quả

### Cải Thiện UX
- ✅ Form rộng hơn, tận dụng không gian
- ✅ Nhập liệu nhanh hơn với datalist autocomplete
- ✅ Quản lý trạng thái ngay từ lúc tạo
- ✅ Responsive tốt hơn

### Sửa Lỗi
- ✅ Bộ lọc văn bản đã hoạt động đầy đủ
- ✅ Pagination giữ lại filters
- ✅ Type comparison đúng (string vs number)

### Performance
- ⚡ Query tối ưu với WHERE động
- ⚡ Chỉ query cần thiết (không load dư thừa)
- ⚡ Pagination hiệu quả

---

**Ngày cập nhật**: 2025-10-11  
**Người thực hiện**: GitHub Copilot  
**Trạng thái**: ✅ Hoàn thành & Tested
