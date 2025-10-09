const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');

const DEFAULT_INPUT = path.resolve(__dirname, '..', 'backup_yyyyMMdd.sql');
const DEFAULT_OUTPUT = path.resolve(__dirname, '..', 'backup_yyyyMMdd_fixed.sql');

function resolvePathFromArg(arg, fallback) {
  if (!arg) {
    return fallback;
  }

  const trimmed = arg.trim();
  if (!trimmed) {
    return fallback;
  }

  return path.isAbsolute(trimmed)
    ? trimmed
    : path.resolve(process.cwd(), trimmed);
}

function main() {
  const [, , inputArg, outputArg] = process.argv;
  const inputPath = resolvePathFromArg(inputArg, DEFAULT_INPUT);
  const outputPath = resolvePathFromArg(outputArg, DEFAULT_OUTPUT);

  if (!fs.existsSync(inputPath)) {
    console.error(`Không tìm thấy file đầu vào: ${inputPath}`);
    process.exit(1);
  }

  const stats = fs.statSync(inputPath);
  if (!stats.isFile()) {
    console.error(`Đường dẫn không phải là file hợp lệ: ${inputPath}`);
    process.exit(1);
  }

  console.log('Đang chuyển đổi mã hóa backup...');
  console.log(`File nguồn: ${inputPath}`);
  console.log(`File xuất:  ${outputPath}`);

  try {
    const rawText = fs.readFileSync(inputPath, 'utf8');

    // Bước 1: chuyển các ký tự đã bị hiển thị sai ("ß", "├", "║", ...) về đúng byte gốc (CP437)
    const recoveredBuffer = iconv.encode(rawText, 'cp437');

    // Bước 2: giải mã lại buffer theo UTF-8 để nhận về tiếng Việt chuẩn
    let fixedText = iconv.decode(recoveredBuffer, 'utf8');

    const replacements = new Map([
      ['TÃI LIá»U Lá»P CÃNG AN', 'TÀI LIỆU LỚP CÔNG AN'],
      ['????n v??? ??o: gi???, b??i b??o, h???c vi??n, ??i???m...', 'Đơn vị đo: giờ, bài báo, học viên, điểm...'],
      ['Tr???ng s??? trong t???ng ??i???m (0-100)', 'Trọng số trong tổng điểm (0-100)'],
      ['Danh m???c c??c ti??u ch?? ????nh gi?? c??n b???', 'Danh mục các tiêu chí đánh giá cán bộ'],
      ['Tr???ng s??? ri??ng cho ?????t n??y', 'Trọng số riêng cho đợt này'],
      ['Ch??? ti??u t???i thi???u', 'Chỉ tiêu tối thiểu'],
      ['Ch??? ti??u xu???t s???c', 'Chỉ tiêu xuất sắc'],
      ['C???u h??nh ti??u ch?? cho t???ng ?????t ????nh gi??', 'Cấu hình tiêu chí cho từng đợt đánh giá'],
      ['T??n ?????t ????nh gi??: HK1 2024-2025', 'Tên đợt đánh giá: HK1 2024-2025'],
      ['N??m h???c: 2024-2025', 'Năm học: 2024-2025'],
      ['H???c k???: 1, 2, 3 (h??), NULL=c??? n??m', 'Học kỳ: 1, 2, 3 (hè), NULL=cả năm'],
      ['H???n n???p t??? ????nh gi??', 'Hạn nộp tự đánh giá'],
      ['C??c ?????t/k??? ????nh gi?? theo n??m h???c', 'Các đợt/kỳ đánh giá theo năm học'],
      ['T??n file g???c', 'Tên file gốc'],
      ['???????ng d???n l??u file', 'Đường dẫn lưu file'],
      ['K??ch th?????c file (bytes)', 'Kích thước file (bytes)'],
      ['Lo???i file (MIME type)', 'Loại file (MIME type)'],
      ['Ph???n m??? r???ng (.pdf, .docx)', 'Phần mở rộng (.pdf, .docx)'],
      ['Ng?????i upload', 'Người upload'],
      ['File ch??nh', 'File chính'],
      ['M?? t??? file', 'Mô tả file'],
      ['S??? l???n t???i xu???ng', 'Số lần tải xuống'],
      ['Metadata b??? sung', 'Metadata bổ sung'],
      ['File ????nh k??m ca thi', 'File đính kèm ca thi'],
      ['T???ng ??i???m (0-100)', 'Tổng điểm (0-100)'],
      ['X???p h???ng trong khoa/b??? m??n', 'Xếp hạng trong khoa/bộ môn'],
      ['X???p h???ng to??n tr?????ng', 'Xếp hạng toàn trường'],
      ['??i???m m???nh', 'Điểm mạnh'],
      ['??i???m c???n c???i thi???n', 'Điểm cần cải thiện'],
      ['????? xu???t ph??t tri???n', 'Đề xuất phát triển'],
      ['T???ng h???p k???t qu??? ????nh gi?? theo ?????t', 'Tổng hợp kết quả đánh giá theo đợt'],
      ['T??? ????nh gi??', 'Tự đánh giá'],
      ['????nh gi?? c???a qu???n l??', 'Đánh giá của quản lý'],
      ['Gi?? tr??? ch??nh th???c', 'Giá trị chính thức'],
      ['Link c??c file minh ch???ng', 'Link các file minh chứng'],
      ['K???t qu??? ????nh gi?? chi ti???t theo t???ng ti??u ch??', 'Kết quả đánh giá chi tiết theo từng tiêu chí'],
      ['Tráº§n VÄ©nh Chiáº¿n', 'Trần Vĩnh Chiến'],
    ]);

    for (const [broken, correct] of replacements) {
      if (fixedText.includes(broken)) {
        fixedText = fixedText.split(broken).join(correct);
      }
    }

    fs.writeFileSync(outputPath, fixedText, 'utf8');

    const leftover = fixedText.match(/[ÃÂß├┬╞╡╢╫╬¼½¾¿ÆÐØ×Þ]/gu);
    if (leftover && leftover.length > 0) {
      const unique = [...new Set(leftover)];
      console.warn(`⚠️  Vẫn còn ${leftover.length} ký tự mojibake sau khi chuyển đổi. Các ký tự gặp phải: ${unique.join(', ')}`);
    } else {
      console.log('✅ Hoàn thành. File kết quả đã được chuẩn hóa UTF-8.');
    }
  } catch (error) {
    console.error('Lỗi trong quá trình chuyển đổi:', error.message);
    process.exit(1);
  }
}

main();
