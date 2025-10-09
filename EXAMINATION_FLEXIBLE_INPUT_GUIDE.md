# 🎯 FLEXIBLE INPUT - Examination Modal

## 📋 Tổng quan

Modal "Chỉnh sửa ca thi" đã được nâng cấp với **Flexible Input** - cho phép:
- ✅ **Chọn từ danh sách có sẵn** (autocomplete)
- ✅ **Nhập thủ công** nếu không có trong danh sách
- ✅ **Tự động tạo mới** khi nhập thủ công
- ✅ **Tìm kiếm nhanh** trong danh sách

---

## 🎨 Các Trường Hỗ Trợ Flexible Input

### 1. **Kỳ thi** (Period)
**Input type:** Text với datalist
**Behavior:**
- Nhập text → Hiện gợi ý từ danh sách kỳ thi có sẵn
- Chọn từ gợi ý → Tự động lấy ID
- Nhập mới → Tự động tạo kỳ thi mới trong database

**Example:**
```
Có sẵn: "Kỳ thi giữa kỳ 2024"
Nhập mới: "Kỳ thi cuối kỳ 2025" → Tự động tạo
```

### 2. **Môn học** (Subject)
**Input type:** Text với datalist
**Format:** `CODE - TÊN MÔN`
**Behavior:**
- Gợi ý format: `MAT101 - Toán cao cấp`
- Nhập đúng format → Tách code và tên
- Nhập không có code → Tự tạo code (10 ký tự đầu, uppercase)

**Example:**
```
Có sẵn: "PHY102 - Vật lý đại cương"
Nhập mới: "CHEM101 - Hóa học" → Tự động tạo
Nhập mới: "Sinh học" → Code = "SINH HOC", Name = "Sinh học"
```

### 3. **Lớp học** (Class)
**Input type:** Text với datalist
**Format:** `CODE - TÊN LỚP`
**Behavior:**
- Gợi ý format: `CS101 - Khoa học máy tính`
- Logic tương tự môn học

**Example:**
```
Có sẵn: "IT2024 - Công nghệ thông tin"
Nhập mới: "SEC2025 - An ninh mạng" → Tự động tạo
```

### 4. **Cán bộ chấm thi** (Grader)
**Input type:** Text với datalist
**Format:** `TÊN (EMAIL)`
**Behavior:**
- Gợi ý: `Nguyễn Văn A (nguyenvana@example.com)`
- Nhập thủ công → Lưu tên người dùng nhập
- **Lưu ý:** Không tự động tạo user mới (chỉ lưu tên)

**Example:**
```
Có sẵn: "Trần Thị B (tranthib@example.com)"
Nhập mới: "Phạm Văn C" → Lưu tên, grader_id = NULL
```

---

## 🔧 Cách Hoạt Động

### Client-side (JavaScript)

#### 1. **Load Reference Data**
```javascript
async loadReferenceData() {
  // Fetch từ API
  const [periods, subjects, classes, graders] = await Promise.all([
    fetch('/api/examination/periods'),
    fetch('/api/examination/subjects'),
    fetch('/api/examination/classes'),
    fetch('/api/examination/graders')
  ]);
  
  // Populate datalists
  this.populateDatalist('periodsList', periods.data, 'id', 'name');
  // ...
}
```

#### 2. **Populate Datalist**
```javascript
populateDatalist(datalistId, items, valueField, labelField) {
  const datalist = document.getElementById(datalistId);
  datalist.innerHTML = items.map(item => {
    const label = typeof labelField === 'function' 
      ? labelField(item) 
      : item[labelField];
    return `<option value="${label}" data-id="${item[valueField]}"></option>`;
  }).join('');
}
```

#### 3. **Find ID by Name**
```javascript
findIdByName(dataArray, inputValue, nameField, codeField) {
  // Try exact match
  let match = dataArray.find(item => {
    if (codeField) {
      return `${item[codeField]} - ${item[nameField]}` === inputValue;
    }
    return item[nameField] === inputValue;
  });
  
  // Try partial match
  if (!match) {
    match = dataArray.find(item => {
      return item[nameField].toLowerCase().includes(inputValue.toLowerCase());
    });
  }
  
  return match ? match.id : null;
}
```

#### 4. **Save Data**
```javascript
async save() {
  // Extract names from inputs
  const periodName = data.period_name;
  const periodId = data.period_id || this.findIdByName(...);
  
  // Build final data
  const finalData = {
    period_id: periodId || null,
    period_name: periodName,
    // ...
  };
  
  // Send to server
  await fetch('/api/examination', {
    method: 'POST',
    body: JSON.stringify(finalData)
  });
}
```

### Server-side (Controller)

#### 1. **Get Reference Data**
```javascript
async getReferenceData(req, res) {
  const type = req.params.type; // periods, subjects, classes, graders
  
  let data = [];
  switch (type) {
    case 'periods':
      data = await this.db.query(
        'SELECT id, name FROM examination_periods WHERE status = ?',
        ['active']
      );
      break;
    // ...
  }
  
  res.json({ success: true, data });
}
```

#### 2. **Create Session with Auto-creation**
```javascript
async store(req, res) {
  const data = { ...req.body };
  
  // If period_name provided but no period_id
  if (data.period_name && !data.period_id) {
    // Check if exists
    const existing = await this.db.query(
      'SELECT id FROM examination_periods WHERE name = ?',
      [data.period_name]
    );
    
    if (existing.length > 0) {
      data.period_id = existing[0].id;
    } else {
      // Create new
      const result = await this.db.query(
        'INSERT INTO examination_periods (name, status) VALUES (?, ?)',
        [data.period_name, 'active']
      );
      data.period_id = result.insertId;
    }
  }
  
  // Similar logic for subjects, classes
  
  await ExaminationSession.create(data);
}
```

---

## 🎯 Use Cases

### Use Case 1: Chọn từ danh sách có sẵn
**Steps:**
1. Mở modal → Danh sách load tự động
2. Click vào trường "Kỳ thi"
3. Gõ một vài ký tự → Gợi ý hiện ra
4. Click chọn từ gợi ý
5. ID tự động được set (hidden input)
6. Lưu → Dùng ID có sẵn

**Result:**
```json
{
  "period_id": 5,
  "period_name": "Kỳ thi giữa kỳ 2024"
}
```

### Use Case 2: Nhập thủ công (tạo mới)
**Steps:**
1. Mở modal
2. Nhập trực tiếp "Kỳ thi cuối kỳ 2025"
3. Không chọn từ gợi ý
4. Lưu → Server check không tồn tại
5. Tự động INSERT vào database
6. Dùng ID mới tạo

**Result:**
```json
{
  "period_id": 12,  // New ID
  "period_name": "Kỳ thi cuối kỳ 2025"
}
```

### Use Case 3: Nhập môn học với format
**Steps:**
1. Nhập "MATH201 - Giải tích"
2. Server parse:
   - code = "MATH201"
   - name = "Giải tích"
3. Check exists by code OR name
4. Nếu không tồn tại → Tạo mới

**Result:**
```json
{
  "subject_id": 23,
  "subject_name": "MATH201 - Giải tích"
}
// Database: subjects
// id: 23, code: "MATH201", name: "Giải tích"
```

### Use Case 4: Nhập môn học không có code
**Steps:**
1. Nhập "Lập trình Python"
2. Server auto-generate code:
   - name = "Lập trình Python"
   - code = "LAP TRINH" (10 chars, uppercase)
3. Tạo mới

**Result:**
```json
{
  "subject_id": 24,
  "subject_name": "Lập trình Python"
}
// Database: subjects
// id: 24, code: "LAP TRINH", name: "Lập trình Python"
```

---

## 📊 Database Schema Impact

### Bảng examination_periods
```sql
CREATE TABLE IF NOT EXISTS examination_periods (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  start_date DATE,
  end_date DATE,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Bảng subjects
```sql
CREATE TABLE IF NOT EXISTS subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active'
);
```

### Bảng classes
```sql
CREATE TABLE IF NOT EXISTS classes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active'
);
```

### Bảng examination_sessions
**Foreign keys vẫn giữ nguyên:**
```sql
period_id INT,
subject_id INT,
class_id INT,
grader_id INT,
FOREIGN KEY (period_id) REFERENCES examination_periods(id),
FOREIGN KEY (subject_id) REFERENCES subjects(id),
FOREIGN KEY (class_id) REFERENCES classes(id),
FOREIGN KEY (grader_id) REFERENCES users(id)
```

---

## 🎨 UI/UX Design

### Input Field Appearance
```html
<div class="form-group">
  <label>Môn học <span class="required">*</span></label>
  <input type="text" 
         name="subject_name" 
         class="form-control combo-input" 
         list="subjectsList" 
         placeholder="Nhập hoặc chọn môn học" 
         required>
  <datalist id="subjectsList">
    <option value="MAT101 - Toán cao cấp" data-id="1"></option>
    <option value="PHY102 - Vật lý đại cương" data-id="2"></option>
  </datalist>
  <input type="hidden" name="subject_id">
  <small class="form-hint">Có thể nhập thủ công hoặc chọn từ danh sách</small>
</div>
```

### CSS Styling
```css
.combo-input {
  /* Dropdown arrow icon */
  background-image: url("data:image/svg+xml,%3Csvg...%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}

.form-hint {
  font-size: 12px;
  color: #6c757d;
  font-style: italic;
  margin-top: 4px;
}
```

### Visual Feedback
```
┌─────────────────────────────────────┐
│ Môn học *                           │
│ ┌─────────────────────────────────┐ │
│ │ MAT101 - Toán cao cấp         ▼│ │ ← Dropdown arrow
│ └─────────────────────────────────┘ │
│ Có thể nhập thủ công hoặc chọn     │ ← Hint text
│ từ danh sách                        │
└─────────────────────────────────────┘

When typing "MAT":
┌─────────────────────────────────────┐
│ │ MAT                           ▼│ │
│ ├─────────────────────────────────┤ │
│ │ MAT101 - Toán cao cấp         │ │ ← Suggestion 1
│ │ MAT102 - Toán rời rạc         │ │ ← Suggestion 2
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 🔍 Validation & Error Handling

### Client-side Validation
```javascript
// Required field check
if (!periodName || periodName.trim() === '') {
  showNotification('Vui lòng nhập kỳ thi', 'error');
  return;
}

// Format check for subjects/classes
if (subjectName && !subjectName.match(/^[A-Z0-9]+\s*-\s*.+$/)) {
  showNotification('Format môn học: CODE - TÊN (VD: MAT101 - Toán)', 'info');
  // Still allow, just warning
}
```

### Server-side Validation
```javascript
// Duplicate check
const existing = await this.db.query(
  'SELECT id FROM subjects WHERE code = ? OR name = ?',
  [code, name]
);

if (existing.length > 0) {
  // Use existing
  data.subject_id = existing[0].id;
} else {
  // Create new
  const result = await this.db.query(...);
  data.subject_id = result.insertId;
}
```

### Error Messages
```javascript
// Success
showNotification('Đã tạo môn học mới: ' + subjectName, 'success');

// Error
showNotification('Lỗi khi tạo môn học: ' + error.message, 'error');

// Warning
showNotification('Môn học đã tồn tại, sử dụng bản ghi có sẵn', 'info');
```

---

## 📈 Performance Considerations

### 1. **Caching Reference Data**
```javascript
this.referenceData = {
  periods: [],
  subjects: [],
  classes: [],
  graders: []
};

// Load once when modal opens
// Reuse for subsequent operations
```

### 2. **Debounced Search**
```javascript
// If using custom autocomplete (not native datalist)
const debouncedSearch = debounce((query) => {
  searchReferenceData(query);
}, 300);
```

### 3. **Indexed Lookups**
```sql
-- Database indexes for fast lookups
CREATE INDEX idx_period_name ON examination_periods(name);
CREATE INDEX idx_subject_code ON subjects(code);
CREATE INDEX idx_subject_name ON subjects(name);
CREATE INDEX idx_class_code ON classes(code);
```

---

## 🧪 Testing Scenarios

### Test 1: Select from existing list
✅ Input: Click + Select "MAT101 - Toán"
✅ Expected: period_id = 1, subject_name filled
✅ Result: Saved with existing ID

### Test 2: Manual input (new)
✅ Input: Type "PHYS201 - Vật lý lượng tử"
✅ Expected: Auto-create subject
✅ Result: New ID generated, saved

### Test 3: Manual input (duplicate)
✅ Input: Type "MAT101 - Toán cao cấp" (already exists)
✅ Expected: Use existing ID
✅ Result: No duplicate created

### Test 4: Partial match
✅ Input: Type "Toán" → Select from dropdown
✅ Expected: Match found, ID extracted
✅ Result: Correct ID used

### Test 5: Format parsing
✅ Input: "CS101 - Computer Science"
✅ Expected: code = "CS101", name = "Computer Science"
✅ Result: Parsed correctly

### Test 6: No format (auto-generate code)
✅ Input: "Machine Learning"
✅ Expected: code = "MACHINE LE", name = "Machine Learning"
✅ Result: Auto-generated code

---

## 🎯 Best Practices

### For Users
1. **Chọn từ danh sách** nếu có sẵn (tránh trùng lặp)
2. **Nhập đúng format** cho môn học/lớp: `CODE - NAME`
3. **Kiểm tra gợi ý** trước khi nhập mới
4. **Xem preview** sau khi nhập để đảm bảo đúng

### For Developers
1. **Validate input** ở cả client và server
2. **Check duplicates** trước khi tạo mới
3. **Use transactions** khi tạo nhiều records
4. **Log auto-creation** để audit
5. **Clean up orphaned records** định kỳ

### For Admins
1. **Review auto-created records** định kỳ
2. **Merge duplicates** nếu có
3. **Standardize naming** conventions
4. **Monitor database growth**

---

## 🚀 Future Enhancements

### 1. **Smart Suggestions**
- ML-based autocomplete
- Frequency-based ranking
- Context-aware suggestions

### 2. **Bulk Import**
- CSV upload cho reference data
- Batch creation

### 3. **Advanced Validation**
- Regex patterns cho codes
- Character limits
- Blacklist words

### 4. **Duplicate Detection**
- Fuzzy matching
- Levenshtein distance
- "Did you mean?" suggestions

### 5. **Audit Trail**
- Log all auto-creations
- Track who created what
- Rollback capability

---

## 📚 API Reference

### GET `/api/examination/periods`
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Kỳ thi giữa kỳ 2024",
      "start_date": "2024-10-01",
      "end_date": "2024-10-15"
    }
  ]
}
```

### GET `/api/examination/subjects`
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "MAT101",
      "name": "Toán cao cấp"
    }
  ]
}
```

### POST `/api/examination`
**Request:**
```json
{
  "exam_code": "SEC401-CK-01",
  "exam_name": "Thi cuối kỳ An ninh mạng",
  "period_name": "Kỳ thi cuối kỳ 2025",
  "period_id": null,  // Will auto-create
  "subject_name": "SEC401 - An ninh mạng",
  "subject_id": null,  // Will auto-create
  "exam_date": "2025-12-27",
  "exam_time": "01:30 PM"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tạo ca thi thành công",
  "session_id": 15,
  "created_records": {
    "period_id": 8,  // New
    "subject_id": 12  // New
  }
}
```

---

## ✅ Summary

**Tính năng Flexible Input đã hoàn thiện:**
- ✅ 4 trường hỗ trợ: Period, Subject, Class, Grader
- ✅ Autocomplete với datalist native HTML5
- ✅ Auto-creation khi nhập thủ công
- ✅ Duplicate detection và reuse
- ✅ Format parsing (CODE - NAME)
- ✅ Validation ở cả client và server
- ✅ API endpoints đầy đủ
- ✅ UI hints và visual feedback

**Lợi ích:**
- 🚀 Tăng tốc nhập liệu
- 🎯 Linh hoạt cho nhiều tình huống
- 📊 Tự động mở rộng database
- ✨ UX tốt hơn với gợi ý

**Ready to use!** 🎉
