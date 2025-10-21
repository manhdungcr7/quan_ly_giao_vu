/**
 * Quick test script for Excel import header mapping
 * Run: node test-excel-mapping.js
 */

// Simulate the header mapping
const IMPORT_HEADER_MAP = {
  'mã ca thi': 'exam_code',
  'ma ca thi': 'exam_code',
  'tên ca thi': 'exam_name',
  'ten ca thi': 'exam_name',
  'kỳ thi': 'period_name',
  'ky thi': 'period_name',
  'môn học': 'subject_name',
  'mon hoc': 'subject_name',
  'học phần': 'subject_name',
  'hoc phan': 'subject_name',
  'mã môn': 'subject_code',
  'ma mon': 'subject_code',
  'tín chỉ': 'subject_credits',
  'tin chi': 'subject_credits',
  'lớp': 'class_code',
  'lop': 'class_code',
  'ngày thi': 'exam_date',
  'ngay thi': 'exam_date',
  'giờ thi': 'exam_time',
  'gio thi': 'exam_time',
  'thời lượng': 'duration',
  'thoi luong': 'duration',
  'phòng': 'room',
  'phong': 'room',
  'tòa nhà': 'building',
  'toa nha': 'building',
  'số sv': 'student_count',
  'so sv': 'student_count',
  'bản in dự kiến': 'expected_copies',
  'ban in du kien': 'expected_copies',
  'cbct1': 'grader_name',
  'cbct2': 'grader2_name',
  'hạn chấm': 'grading_deadline',
  'han cham': 'grading_deadline',
  'hình thức thi': 'exam_type',
  'hinh thuc thi': 'exam_type',
  'trạng thái': 'status',
  'trang thai': 'status',
  'link': 'link',
  'ghi chú': 'notes',
  'ghi chu': 'notes'
};

function normalizeHeaderKey(key) {
  if (!key && key !== 0) {
    return '';
  }
  return String(key).trim().toLowerCase();
}

// Test với các header từ template
const templateHeaders = [
  'Mã ca thi',
  'Tên ca thi',
  'Kỳ thi',
  'Mã môn',
  'Học phần',
  'Tín chỉ',
  'Lớp',
  'Ngày thi',
  'Giờ thi',
  'Thời lượng',
  'Phòng',
  'Tòa nhà',
  'Số SV',
  'Bản in dự kiến',
  'CBCT1',
  'CBCT2',
  'Hạn chấm',
  'Hình thức thi',
  'Trạng thái',
  'Link',
  'Ghi chú'
];

console.log('🧪 Testing Excel Header Mapping\n');
console.log('=' .repeat(70));

let successCount = 0;
let failCount = 0;

templateHeaders.forEach((header, index) => {
  const normalized = normalizeHeaderKey(header);
  const mapped = IMPORT_HEADER_MAP[normalized];
  
  if (mapped) {
    console.log(`✅ [${index + 1}] "${header}" → "${normalized}" → ${mapped}`);
    successCount++;
  } else {
    console.log(`❌ [${index + 1}] "${header}" → "${normalized}" → NOT MAPPED`);
    failCount++;
  }
});

console.log('=' .repeat(70));
console.log(`\n📊 Results: ${successCount} mapped, ${failCount} failed\n`);

if (failCount === 0) {
  console.log('✅ All headers are properly mapped!');
} else {
  console.log('❌ Some headers are not mapped. Please update IMPORT_HEADER_MAP.');
}
