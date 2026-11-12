import XLSX from 'xlsx-js-style';
import { DepartmentUnit } from '../types/index';

/**
 * Biểu mẫu Excel chuẩn hóa cho Trường Đại học Tây Đô (TDU)
 * Thiết kế hiện đại, chuyên nghiệp, đồng nhất font chữ Times New Roman:
 * - Hàng 1: Khoảng trống đệm
 * - Hàng 2: Tiêu đề biểu mẫu (In hoa, in đậm, căn giữa, merge toàn bộ cột)
 * - Hàng 3: Khoảng trống đệm
 * - Hàng 4: Tiêu đề cột tiếng Việt (Các cột bắt buộc có nền vàng nhạt #FFFF99 giống ảnh mẫu)
 * - Hàng 5: Mã trường dữ liệu hệ thống (In nghiêng, màu xám thanh lịch)
 * - Hàng 6 trở đi: Dữ liệu mẫu thực tế của giảng viên TDU, viền ô mỏng sắc nét (thin border)
 */

export interface TemplateColumn {
  header: string; // Tên hiển thị (Dòng 4), ví dụ: 'Họ tên giảng viên'
  key: string;    // Mã trường dữ liệu (Dòng 5), ví dụ: 'ho_va_ten'
  width: number;  // Độ rộng cột wch
  isYellow?: boolean; // Ô màu vàng nhạt #FFFF99 như trong ảnh mẫu
  align?: 'left' | 'center' | 'right';
}

const thinBorder = {
  top: { style: 'thin', color: { rgb: '000000' } },
  bottom: { style: 'thin', color: { rgb: '000000' } },
  left: { style: 'thin', color: { rgb: '000000' } },
  right: { style: 'thin', color: { rgb: '000000' } },
};

export const createStyledWorksheet = (
  title: string,
  columns: TemplateColumn[],
  sampleRows: any[][]
): XLSX.WorkSheet => {
  const sheetData: any[][] = [
    [], // Dòng 1: Khoảng cách đệm
    [title], // Dòng 2: Tiêu đề chính
    [], // Dòng 3: Khoảng cách đệm
    columns.map((c) => c.header), // Dòng 4: Tiêu đề cột tiếng Việt
    columns.map((c) => c.key),    // Dòng 5: Mã trường hệ thống
    ...sampleRows,                // Dòng 6+: Dữ liệu mẫu thực tế
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Merge dòng 2 (Tiêu đề) từ cột đầu đến cột cuối
  ws['!merges'] = [
    { s: { r: 1, c: 0 }, e: { r: 1, c: columns.length - 1 } },
  ];

  // Chiều cao các hàng (Rows height)
  ws['!rows'] = [
    { hpx: 12 }, // R1 - Đệm
    { hpx: 36 }, // R2 - Tiêu đề
    { hpx: 12 }, // R3 - Đệm
    { hpx: 32 }, // R4 - Headers
    { hpx: 20 }, // R5 - Field keys
    ...sampleRows.map(() => ({ hpx: 24 })), // R6+
  ];

  // Độ rộng các cột
  ws['!cols'] = columns.map((c) => ({ wch: c.width }));

  // Autofilter trên dòng 4
  const lastColLetter = XLSX.utils.encode_col(columns.length - 1);
  const lastRowNum = 5 + sampleRows.length;
  ws['!autofilter'] = { ref: `A4:${lastColLetter}${lastRowNum}` };

  // 1. Định dạng Tiêu đề chính (Dòng 2)
  ws['A2'].s = {
    font: { name: 'Times New Roman', sz: 14, bold: true, color: { rgb: '000000' } },
    alignment: { horizontal: 'center', vertical: 'center' },
  };

  // 2. Định dạng Dòng 4 (Header), Dòng 5 (Field key) và Dữ liệu mẫu (Dòng 6+)
  for (let c = 0; c < columns.length; c++) {
    const colLetter = XLSX.utils.encode_col(c);
    const colDef = columns[c];

    // Dòng 4: Header chính tiếng Việt
    const cellR4 = ws[`${colLetter}4`];
    if (cellR4) {
      cellR4.s = {
        font: { name: 'Times New Roman', sz: 11, bold: true, color: { rgb: '000000' } },
        fill: colDef.isYellow
          ? { fgColor: { rgb: 'FFFF99' } } // Vàng nhạt giống hệt ảnh mẫu
          : { fgColor: { rgb: 'FFFFFF' } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: thinBorder,
      };
    }

    // Dòng 5: Mã trường hệ thống (In thẳng, không in nghiêng)
    const cellR5 = ws[`${colLetter}5`];
    if (cellR5) {
      cellR5.s = {
        font: { name: 'Times New Roman', sz: 9, bold: false, italic: false, color: { rgb: '7F8C8D' } },
        fill: colDef.isYellow
          ? { fgColor: { rgb: 'FFFDE7' } }
          : { fgColor: { rgb: 'FFFFFF' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: thinBorder,
      };
    }

    // Dòng 6+: Các dòng dữ liệu
    for (let r = 0; r < sampleRows.length; r++) {
      const cellData = ws[`${colLetter}${6 + r}`];
      if (cellData) {
        cellData.s = {
          font: { name: 'Times New Roman', sz: 10, color: { rgb: '000000' } },
          alignment: {
            vertical: 'center',
            horizontal: colDef.align || (c === 0 ? 'center' : 'left'),
          },
          border: thinBorder,
        };
      }
    }
  }

  return ws;
};

export const getDepartmentTemplateFileName = (dept: DepartmentUnit): string => {
  switch (dept) {
    case 'khao_thi':
      return 'Mau_Khao_Thi_Coi_Cham_Thi_TDU_2026_2027.xlsx';
    case 'nckh':
      return 'Mau_NCKH_Sau_Dai_Hoc_TDU_2026_2027.xlsx';
    case 'do_an':
      return 'Mau_Do_An_Khoa_Luan_Tot_Nghiep_TDU_2026_2027.xlsx';
    case 'co_van_hoc_tap':
      return 'Mau_Co_Van_Hoc_Tap_TDU_2026_2027.xlsx';
    case 'tuyen_sinh':
      return 'Mau_Tuyen_Sinh_Truyen_Thong_TDU_2026_2027.xlsx';
    case 'cong_tac_khac':
      return 'Mau_Cong_Tac_Khac_TDU_2026_2027.xlsx';
    default:
      return 'Mau_Thanh_Toan_Gio_Giang_TDU_2026_2027.xlsx';
  }
};

export const saveWorkbookToFile = (wb: XLSX.WorkBook, fileName: string) => {
  if (typeof window === 'undefined') return;

  // 1. Nếu là file mẫu, ưu tiên tải file tĩnh có sẵn từ /templates/ để 100% không bị IDM hay popup chặn
  if (fileName.startsWith('Mau_')) {
    try {
      const link = document.createElement('a');
      link.href = `/templates/${fileName}`;
      link.download = fileName;
      link.style.position = 'fixed';
      link.style.left = '-9999px';
      link.style.top = '-9999px';
      link.style.opacity = '0';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        try {
          if (link.parentNode) link.parentNode.removeChild(link);
        } catch (e) {}
      }, 1500);
      return;
    } catch (e) {
      console.warn('Static download link fallback:', e);
    }
  }

  // 2. Phương án Base64 Data URI: Tương thích cao nhất trong trình duyệt không phụ thuộc vào Blob registry
  try {
    const b64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
    const link = document.createElement('a');
    link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${b64}`;
    link.download = fileName;
    link.style.position = 'fixed';
    link.style.left = '-9999px';
    link.style.top = '-9999px';
    link.style.opacity = '0';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        if (link.parentNode) link.parentNode.removeChild(link);
      } catch (e) {}
    }, 3000);
    return;
  } catch (b64Err) {
    console.warn('Base64 URI download failed, trying Blob:', b64Err);
  }

  // 3. Phương án Blob URL
  try {
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.position = 'fixed';
    link.style.left = '-9999px';
    link.style.top = '-9999px';
    link.style.opacity = '0';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      try {
        if (link.parentNode) link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (e) {}
    }, 60000);
    return;
  } catch (blobErr) {
    console.warn('Blob URL download failed, trying XLSX.writeFile:', blobErr);
  }

  // 4. Phương án dự phòng cuối: XLSX.writeFile của SheetJS
  try {
    XLSX.writeFile(wb, fileName);
  } catch (err) {
    console.error('All file download attempts failed:', err);
  }
};

export const generateDepartmentExcelTemplate = (dept: DepartmentUnit, currentPeriodName: string = 'Học kỳ 1 2026-2027') => {
  const wb = XLSX.utils.book_new();

  if (dept === 'khao_thi') {
    // 1. TRUNG TÂM KHẢO THÍ & ĐBCL
    const columns: TemplateColumn[] = [
      { header: 'STT', key: 'stt', width: 6, align: 'center' },
      { header: 'Mã giảng viên (*)', key: 'ma_giang_vien', width: 15, isYellow: true, align: 'center' },
      { header: 'Họ tên giảng viên (*)', key: 'ho_va_ten', width: 28, isYellow: true, align: 'left' },
      { header: 'Ngày sinh', key: 'ngay_sinh', width: 14, align: 'center' },
      { header: 'Số CCCD (*)', key: 'so_cccd', width: 18, isYellow: true, align: 'center' },
      { header: 'Học vị (*)', key: 'hoc_vi', width: 12, isYellow: true, align: 'center' },
      { header: 'Khoa / Bộ môn (*)', key: 'khoa_bo_mon', width: 26, isYellow: true, align: 'left' },
      { header: 'Tên học phần thi (*)', key: 'ten_hoc_phan_thi', width: 38, isYellow: true, align: 'left' },
      { header: 'Số ca coi thi', key: 'so_ca_coi_thi', width: 14, align: 'center' },
      { header: 'Số bài chấm thi', key: 'so_bai_cham_thi', width: 16, align: 'center' },
      { header: 'Số đề thi ra', key: 'so_de_thi_ra', width: 14, align: 'center' },
      { header: 'Đợt thi (*)', key: 'dot_thi', width: 22, isYellow: true, align: 'center' },
      { header: 'Ghi chú', key: 'ghi_chu', width: 32, align: 'left' },
    ];

    const sampleRows: any[][] = [
      [1, 'TDU00128', 'TS. Mai Như Long', '18/09/1982', '092082001245', 'TS', 'Khoa Công nghệ thông tin', 'Hệ thống thông tin doanh nghiệp', 4, 120, 2, currentPeriodName, 'Coi thi ca sáng + Chấm thi tự luận'],
      [2, 'TDU00215', 'ThS. Nguyễn Văn Hải', '10/05/1987', '092087003412', 'ThS', 'Khoa Công nghệ thông tin', 'Lập trình Web nâng cao', 6, 95, 1, currentPeriodName, 'Coi thi học kỳ tập trung'],
      [3, 'TDU00089', 'PGS.TS. Trần Thanh Dũng', '12/03/1975', '092075001188', 'PGS.TS', 'Khoa Dược - Điều dưỡng', 'Dược lý học đại cương', 3, 150, 2, currentPeriodName, 'Ra đề tự luận + chấm thi'],
    ];

    const ws = createStyledWorksheet(
      `MẪU THÊM CÔNG TÁC RA ĐỀ, COI THI & CHẤM THI (${currentPeriodName.toUpperCase()})`,
      columns,
      sampleRows
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Khao_Thi');
    saveWorkbookToFile(wb, 'Mau_Khao_Thi_Coi_Cham_Thi_TDU_2026_2027.xlsx');
  } else if (dept === 'nckh') {
    // 2. PHÒNG QL NCKH & SAU ĐẠI HỌC
    const columns: TemplateColumn[] = [
      { header: 'STT', key: 'stt', width: 6, align: 'center' },
      { header: 'Mã giảng viên (*)', key: 'ma_giang_vien', width: 15, isYellow: true, align: 'center' },
      { header: 'Họ tên giảng viên (*)', key: 'ho_va_ten', width: 28, isYellow: true, align: 'left' },
      { header: 'Học vị (*)', key: 'hoc_vi', width: 12, isYellow: true, align: 'center' },
      { header: 'Khoa / Bộ môn (*)', key: 'khoa_bo_mon', width: 26, isYellow: true, align: 'left' },
      { header: 'Tên đề tài / Bài báo ISI / Luận văn (*)', key: 'ten_de_tai_bai_bao', width: 48, isYellow: true, align: 'left' },
      { header: 'Thể loại NCKH', key: 'the_loai_nckh', width: 28, align: 'left' },
      { header: 'Mã đề tài / Số ISSN', key: 'ma_de_tai_issn', width: 20, align: 'center' },
      { header: 'Số giờ quy đổi (*)', key: 'so_gio_quy_doi', width: 18, isYellow: true, align: 'center' },
      { header: 'Mức độ hoàn thành (*)', key: 'muc_do_hoan_thanh', width: 20, isYellow: true, align: 'center' },
      { header: 'Ghi chú / Vai trò', key: 'ghi_chu_vai_tro', width: 34, align: 'left' },
    ];

    const sampleRows: any[][] = [
      [1, 'TDU00089', 'PGS.TS. Trần Thanh Dũng', 'PGS.TS', 'Khoa Dược - Điều dưỡng', 'Chủ nhiệm đề tài NCKH cấp Bộ: "Khảo sát và chiết xuất hoạt chất thảo dược"', 'Đề tài NCKH cấp Bộ', 'NCKH_DUOC_01', 220, 'Hoàn thành', 'Chủ nhiệm đề tài (Nghiệm thu Đạt)'],
      [2, 'TDU00089', 'PGS.TS. Trần Thanh Dũng', 'PGS.TS', 'Khoa Dược - Điều dưỡng', 'Bài báo khoa học ISI/Scopus: "Bioactive compounds from Mekong Delta medicinal plants"', 'Bài báo quốc tế ISI/Scopus (Q1)', 'ISSN 1872-2040', 180, 'Hoàn thành', 'Tác giả chính (First Author)'],
      [3, 'TDU00128', 'TS. Mai Như Long', 'TS', 'Khoa Công nghệ thông tin', 'Bài báo khoa học quốc tế: "AI and Cloud Architectures in Modern University Management"', 'Bài báo quốc tế ISI/Scopus (Q1)', 'NCKH_SCOPUS_01', 180, 'Hoàn thành', 'Tác giả chính (Q1)'],
      [4, 'TDU00128', 'TS. Mai Như Long', 'TS', 'Khoa Công nghệ thông tin', 'Hướng dẫn 02 Học viên cao học bảo vệ thành công Luận văn Thạc sĩ ngành HTTT', 'Hướng dẫn luận văn Thạc sĩ', 'SDH_CH_HTTT12', 40, 'Hoàn thành', 'Cán bộ hướng dẫn chính'],
      [5, 'TDU00318', 'ThS. Nguyễn Thị Cẩm Tú', 'ThS', 'Khoa Quản trị kinh doanh', 'Bài báo: "Nghiên cứu các yếu tố ảnh hưởng đến quyết định mua sắm trực tuyến"', 'Bài báo tạp chí chuyên ngành', 'NCKH_KTE_02', 60, 'Hoàn thành', 'Tác giả'],
    ];

    const ws = createStyledWorksheet(
      `MẪU THÊM HOẠT ĐỘNG NGHIÊN CỨU KHOA HỌC & ĐỀ TÀI (${currentPeriodName.toUpperCase()})`,
      columns,
      sampleRows
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_NCKH');
    saveWorkbookToFile(wb, 'Mau_NCKH_Sau_Dai_Hoc_TDU_2026_2027.xlsx');
  } else if (dept === 'do_an') {
    // 3. ĐỒ ÁN & KHÓA LUẬN
    const columns: TemplateColumn[] = [
      { header: 'STT', key: 'stt', width: 6, align: 'center' },
      { header: 'Mã giảng viên (*)', key: 'ma_giang_vien', width: 15, isYellow: true, align: 'center' },
      { header: 'Họ tên giảng viên (*)', key: 'ho_va_ten', width: 28, isYellow: true, align: 'left' },
      { header: 'Học vị (*)', key: 'hoc_vi', width: 12, isYellow: true, align: 'center' },
      { header: 'Khoa / Bộ môn (*)', key: 'khoa_bo_mon', width: 26, isYellow: true, align: 'left' },
      { header: 'Nhiệm vụ / Học phần (*)', key: 'nhiem_vu_hoc_phan', width: 42, isYellow: true, align: 'left' },
      { header: 'Mã học phần / Lớp', key: 'ma_hoc_phan_lop', width: 18, align: 'center' },
      { header: 'Số sinh viên / Đề tài', key: 'so_sinh_vien', width: 18, align: 'center' },
      { header: 'Số lượt chấm / HĐ', key: 'so_luot_cham', width: 16, align: 'center' },
      { header: 'Vai trò (HD, PB, CTHD, TKHD)', key: 'vai_tro', width: 24, align: 'center' },
      { header: 'Số giờ quy chuẩn (*)', key: 'so_gio_quy_chuan', width: 18, isYellow: true, align: 'center' },
      { header: 'Ghi chú', key: 'ghi_chu', width: 30, align: 'left' },
    ];

    const sampleRows: any[][] = [
      [1, 'TDU00128', 'TS. Mai Như Long', 'TS', 'Khoa Công nghệ thông tin', 'Hướng dẫn Khóa luận tốt nghiệp đại học ngành HTTT', 'KLTN_HTTT_K14', 2, 0, 'Hướng dẫn chính', 24, '12 giờ quy đổi / 1 SV'],
      [2, 'TDU00128', 'TS. Mai Như Long', 'TS', 'Khoa Công nghệ thông tin', 'Phản biện Khóa luận tốt nghiệp đại học K14', 'PB_KLTN_K14', 0, 3, 'Cán bộ phản biện', 9, '3 giờ quy đổi / 1 SV'],
      [3, 'TDU00089', 'PGS.TS. Trần Thanh Dũng', 'PGS.TS', 'Khoa Dược - Điều dưỡng', 'Chủ tịch Hội đồng khóa luận tốt nghiệp Dược sĩ', 'HD_KLTN_DUOC', 0, 4, 'Chủ tịch hội đồng', 6, '1.5 giờ quy đổi / 1 SV'],
    ];

    const ws = createStyledWorksheet(
      `MẪU THÊM HƯỚNG DẪN & CHẤM ĐỒ ÁN, KHÓA LUẬN TỐT NGHIỆP (${currentPeriodName.toUpperCase()})`,
      columns,
      sampleRows
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Do_An_Khoa_Luan');
    saveWorkbookToFile(wb, 'Mau_Do_An_Khoa_Luan_Tot_Nghiep_TDU_2026_2027.xlsx');
  } else if (dept === 'co_van_hoc_tap') {
    // 4. CỐ VẤN HỌC TẬP
    const columns: TemplateColumn[] = [
      { header: 'STT', key: 'stt', width: 6, align: 'center' },
      { header: 'Mã giảng viên (*)', key: 'ma_giang_vien', width: 15, isYellow: true, align: 'center' },
      { header: 'Họ tên giảng viên (*)', key: 'ho_va_ten', width: 28, isYellow: true, align: 'left' },
      { header: 'Học vị (*)', key: 'hoc_vi', width: 12, isYellow: true, align: 'center' },
      { header: 'Khoa / Bộ môn (*)', key: 'khoa_bo_mon', width: 26, isYellow: true, align: 'left' },
      { header: 'Lớp phụ trách CVHT (*)', key: 'lop_phu_trach_cvht', width: 20, isYellow: true, align: 'center' },
      { header: 'Số sinh viên lớp', key: 'so_sinh_vien', width: 16, align: 'center' },
      { header: 'Thời gian cố vấn', key: 'thoi_gian_co_van', width: 24, align: 'center' },
      { header: 'Số tiết định mức QC (*)', key: 'so_tiet_dinh_muc_qc', width: 20, isYellow: true, align: 'center' },
      { header: 'Đơn giá tiết (VNĐ)', key: 'don_gia_tiet', width: 18, align: 'right' },
      { header: 'Ghi chú', key: 'ghi_chu', width: 34, align: 'left' },
    ];

    const sampleRows: any[][] = [
      [1, 'TDU00128', 'TS. Mai Như Long', 'TS', 'Khoa Công nghệ thông tin', 'CNTT14A', 65, currentPeriodName, 20, 180000, 'Theo Quyết định phân công Cố vấn học tập TDU'],
      [2, 'TDU00318', 'ThS. Nguyễn Thị Cẩm Tú', 'ThS', 'Khoa Quản trị kinh doanh', 'QTKD15B', 55, currentPeriodName, 20, 150000, 'Theo Quyết định phân công Cố vấn học tập TDU'],
    ];

    const ws = createStyledWorksheet(
      `MẪU THÊM CÔNG TÁC CỐ VẤN HỌC TẬP (${currentPeriodName.toUpperCase()})`,
      columns,
      sampleRows
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Co_Van_Hoc_Tap');
    saveWorkbookToFile(wb, 'Mau_Co_Van_Hoc_Tap_TDU_2026_2027.xlsx');
  } else if (dept === 'tuyen_sinh') {
    // 5. TUYỂN SINH
    const columns: TemplateColumn[] = [
      { header: 'STT', key: 'stt', width: 6, align: 'center' },
      { header: 'Mã giảng viên (*)', key: 'ma_giang_vien', width: 15, isYellow: true, align: 'center' },
      { header: 'Họ tên giảng viên (*)', key: 'ho_va_ten', width: 28, isYellow: true, align: 'left' },
      { header: 'Ngày sinh', key: 'ngay_sinh', width: 14, align: 'center' },
      { header: 'Số CCCD (*)', key: 'so_cccd', width: 18, isYellow: true, align: 'center' },
      { header: 'Học vị (*)', key: 'hoc_vi', width: 12, isYellow: true, align: 'center' },
      { header: 'Khoa / Bộ môn (*)', key: 'khoa_bo_mon', width: 26, isYellow: true, align: 'left' },
      { header: 'Nhiệm vụ tuyển sinh (*)', key: 'nhiem_vu_tuyen_sinh', width: 36, isYellow: true, align: 'left' },
      { header: 'Số ngày công tác (*)', key: 'so_ngay_cong_tac', width: 18, isYellow: true, align: 'center' },
      { header: 'Địa bàn / Trường THPT', key: 'dia_ban_truong_thpt', width: 36, align: 'left' },
      { header: 'Đợt tuyển sinh (*)', key: 'dot_tuyen_sinh', width: 22, isYellow: true, align: 'center' },
      { header: 'Ghi chú', key: 'ghi_chu', width: 30, align: 'left' },
    ];

    const sampleRows: any[][] = [
      [1, 'TDU00318', 'ThS. Nguyễn Thị Cẩm Tú', '22/11/1988', '092088005671', 'ThS', 'Khoa Quản trị kinh doanh', 'Tư vấn hướng nghiệp tuyển sinh ĐBSCL', 5, 'Cụm trường THPT Hậu Giang & Sóc Trăng', currentPeriodName, 'Tư vấn trực tiếp tại các trường THPT'],
      [2, 'TDU00215', 'ThS. Nguyễn Văn Hải', '10/05/1987', '092087003412', 'ThS', 'Khoa Công nghệ thông tin', 'Trực gian hàng tư vấn Ngày hội tuyển sinh', 3, 'Khuôn viên Trường ĐH Cần Thơ & ĐH Tây Đô', currentPeriodName, 'Tư vấn khối ngành Kỹ thuật - Công nghệ'],
    ];

    const ws = createStyledWorksheet(
      `MẪU THÊM CÔNG TÁC TƯ VẤN TUYỂN SINH & HƯỚNG NGHIỆP (${currentPeriodName.toUpperCase()})`,
      columns,
      sampleRows
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Tuyen_Sinh');
    saveWorkbookToFile(wb, 'Mau_Tuyen_Sinh_Truyen_Thong_TDU_2026_2027.xlsx');
  } else if (dept === 'cong_tac_khac') {
    // 6. CÔNG TÁC KHÁC (40 mục)
    const columns: TemplateColumn[] = [
      { header: 'STT', key: 'stt', width: 6, align: 'center' },
      { header: 'Mã giảng viên (*)', key: 'ma_giang_vien', width: 15, isYellow: true, align: 'center' },
      { header: 'Họ tên giảng viên (*)', key: 'ho_va_ten', width: 28, isYellow: true, align: 'left' },
      { header: 'Học vị (*)', key: 'hoc_vi', width: 12, isYellow: true, align: 'center' },
      { header: 'Khoa / Bộ môn (*)', key: 'khoa_bo_mon', width: 26, isYellow: true, align: 'left' },
      { header: 'Nhiệm vụ công tác kiêm nhiệm (*)', key: 'nhiem_vu_kiem_nhiem', width: 42, isYellow: true, align: 'left' },
      { header: 'Thời gian / Căn cứ phân công', key: 'thoi_gian_phan_cong', width: 30, align: 'left' },
      { header: 'Số tiết QC quy đổi (*)', key: 'so_tiet_qc_quy_doi', width: 20, isYellow: true, align: 'center' },
      { header: 'Ghi chú', key: 'ghi_chu', width: 32, align: 'left' },
    ];

    const sampleRows: any[][] = [
      [1, 'TDU00215', 'ThS. Nguyễn Văn Hải', 'ThS', 'Khoa Công nghệ thông tin', 'Quản lý phòng thí nghiệm máy tính Lab 03', 'Cả năm học (QĐ số 118/QĐ-ĐHTĐ)', 40, '40 giờ quy đổi / 1 năm'],
      [2, 'TDU00128', 'TS. Mai Như Long', 'TS', 'Khoa Công nghệ thông tin', 'Thành viên Tổ đảm bảo chất lượng Khoa CNTT', 'Cả năm học', 18, '18 giờ quy chuẩn / 1 năm'],
      [3, 'TDU00089', 'PGS.TS. Trần Thanh Dũng', 'PGS.TS', 'Khoa Dược - Điều dưỡng', 'Chủ tịch Hội đồng Đảm bảo chất lượng Trường', 'Cả năm học (QĐ số 45/QĐ-ĐHTĐ)', 20, '20 giờ quy chuẩn / 1 năm'],
    ];

    const ws = createStyledWorksheet(
      `MẪU THÊM NHIỆM VỤ CÔNG TÁC KIÊM NHIỆM & KHÁC (${currentPeriodName.toUpperCase()})`,
      columns,
      sampleRows
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Cong_Tac_Khac');
    saveWorkbookToFile(wb, 'Mau_Cong_Tac_Khac_TDU_2026_2027.xlsx');
  } else {
    // 7. DEFAULT: PHÒNG ĐÀO TẠO - THANH TOÁN GIỜ GIẢNG
    const columns: TemplateColumn[] = [
      { header: 'STT', key: 'stt', width: 6, align: 'center' },
      { header: 'Mã giảng viên (*)', key: 'ma_giang_vien', width: 15, isYellow: true, align: 'center' },
      { header: 'Họ tên giảng viên (*)', key: 'ho_va_ten', width: 28, isYellow: true, align: 'left' },
      { header: 'Môn giảng dạy (*)', key: 'mon_giang_day', width: 40, isYellow: true, align: 'left' },
      { header: 'Lớp học phần (*)', key: 'ma_lop_hoc_phan', width: 18, isYellow: true, align: 'center' },
      { header: 'Số SV', key: 'so_sinh_vien', width: 10, align: 'center' },
      { header: 'Số nhóm', key: 'so_nhom', width: 10, align: 'center' },
      { header: 'Số giờ MH', key: 'so_gio_mon_hoc', width: 14, align: 'center' },
      { header: 'Số giờ thực giảng (*)', key: 'so_gio_thuc_giang', width: 20, isYellow: true, align: 'center' },
      { header: 'Hệ số lớp', key: 'he_so_lop', width: 12, align: 'center' },
      { header: 'Hệ số TC', key: 'he_so_tin_chi', width: 12, align: 'center' },
      { header: 'Phân loại giảng dạy', key: 'phan_loai_giang_day', width: 22, align: 'center' },
      { header: 'Học vị (*)', key: 'hoc_vi', width: 12, isYellow: true, align: 'center' },
      { header: 'Khoa / Bộ môn (*)', key: 'khoa_bo_mon', width: 28, isYellow: true, align: 'left' },
      { header: 'Số tài khoản', key: 'so_tai_khoan', width: 18, align: 'center' },
      { header: 'Ngân hàng', key: 'ngan_hang', width: 24, align: 'left' },
      { header: 'Đợt thanh toán', key: 'dot_thanh_toan', width: 22, align: 'center' },
      { header: 'Ghi chú', key: 'ghi_chu', width: 32, align: 'left' },
    ];

    const sampleRows: any[][] = [
      [1, 'TDU00128', 'TS. Mai Như Long', 'Phát triển Hệ thống Thông tin Doanh nghiệp', 'CNTT14A', 65, 1, 45, 30, 1.25, 1.0, 'Lý thuyết', 'TS', 'Khoa Công nghệ thông tin', '102874639912', 'VietinBank CN Cần Thơ', currentPeriodName, 'Giảng dạy lý thuyết chính khóa'],
      [2, 'TDU00128', 'TS. Mai Như Long', 'Phát triển Hệ thống Thông tin Doanh nghiệp (Lab)', 'CNTT14A_LAB', 65, 2, 30, 30, 1.35, 1.1, 'Thực hành', 'TS', 'Khoa Công nghệ thông tin', '102874639912', 'VietinBank CN Cần Thơ', currentPeriodName, 'Thực hành phòng máy 2 nhóm'],
      [3, 'TDU00089', 'PGS.TS. Trần Thanh Dũng', 'Dược lý học đại cương', 'DUOC12A', 80, 1, 60, 45, 1.30, 1.0, 'Lý thuyết', 'PGS.TS', 'Khoa Dược - Điều dưỡng', '101994827110', 'Vietcombank CN Cần Thơ', currentPeriodName, 'Giảng dạy chính khóa'],
      [4, 'TDU00318', 'ThS. Nguyễn Thị Cẩm Tú', 'Quản trị Chiến lược Doanh nghiệp', 'QTKD15B', 55, 1, 45, 45, 1.15, 1.0, 'Lý thuyết', 'ThS', 'Khoa Quản trị kinh doanh', '190334812903', 'Techcombank CN Cần Thơ', currentPeriodName, 'Giảng dạy chính khóa'],
      [5, 'TDU00215', 'ThS. Nguyễn Văn Hải', 'Lập trình Ứng dụng Di động Flutter', 'CNTT15A', 50, 1, 45, 45, 1.15, 1.0, 'Lý thuyết', 'ThS', 'Khoa Công nghệ thông tin', '103847291048', 'BIDV CN Tây Đô', currentPeriodName, 'Giảng dạy chính khóa'],
    ];

    const ws = createStyledWorksheet(
      `MẪU THÊM KHỐI LƯỢNG GIẢNG DẠY & THÙ LAO (${currentPeriodName.toUpperCase()})`,
      columns,
      sampleRows
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Thanh_Toan_Gio_Giang');
    saveWorkbookToFile(wb, 'Mau_Thanh_Toan_Gio_Giang_TDU_2026_2027.xlsx');
  }
};
