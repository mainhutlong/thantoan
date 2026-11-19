import XLSX from 'xlsx-js-style';
import { DepartmentUnit, TeachingRecord, LecturerPaymentSummary } from '../types/index';
import { INITIAL_JOB_DUTIES } from '../data/jobDutyCatalog';

/**
 * Loại bỏ học hàm / học vị / chức danh viết tắt phía trước họ tên giảng viên
 * Ví dụ: 'TS. Mai Như Long' -> 'Mai Như Long', 'PGS.TS. Trần Thanh Dũng' -> 'Trần Thanh Dũng'
 */
export const stripAcademicTitle = (name: string): string => {
  if (!name) return '';
  return name
    .replace(/^(PGS\.TS\.|GS\.TS\.|TS\.|ThS\.|PGS\.|GS\.|BSCKII\.|BSCKI\.|BS\.|CN\.)\s*/i, '')
    .replace(/^(PGS\.TS|GS\.TS|TS|ThS|PGS|GS|BSCKII|BSCKI|BS|CN)\s+/i, '')
    .trim();
};

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
  header: string; // Tên hiển thị (Dòng 8), ví dụ: 'Họ tên giảng viên'
  key: string;    // Mã trường dữ liệu (Dòng 9), ví dụ: 'ho_va_ten'
  width: number;  // Độ rộng cột wch
  isYellow?: boolean; // Ô màu vàng nhạt #FFFF99 như trong ảnh mẫu
  align?: 'left' | 'center' | 'right';
}

export interface StyledWorksheetOptions {
  subTitle?: string;
  unitName?: string;
  documentNo?: string;
  locationDate?: string;
  hasSignatures?: boolean;
}

const thinBorder = {
  top: { style: 'thin', color: { rgb: 'CBD5E1' } },
  bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
  left: { style: 'thin', color: { rgb: 'CBD5E1' } },
  right: { style: 'thin', color: { rgb: 'CBD5E1' } },
};

const headerBorder = {
  top: { style: 'thin', color: { rgb: '003314' } },
  bottom: { style: 'medium', color: { rgb: '003314' } },
  left: { style: 'thin', color: { rgb: '00401C' } },
  right: { style: 'thin', color: { rgb: '00401C' } },
};

const summaryBorder = {
  top: { style: 'thin', color: { rgb: '005325' } },
  bottom: { style: 'double', color: { rgb: '005325' } },
  left: { style: 'thin', color: { rgb: 'CBD5E1' } },
  right: { style: 'thin', color: { rgb: 'CBD5E1' } },
};

export const createStyledWorksheet = (
  title: string,
  columns: TemplateColumn[],
  sampleRows: any[][],
  summaryRow?: any[],
  options?: StyledWorksheetOptions
): XLSX.WorkSheet => {
  const colCount = columns.length;
  const splitCol = Math.max(3, Math.floor(colCount / 2));
  const subTitle = options?.subTitle || 'Học kỳ II - Năm học 2026 - 2027';
  const unitName = options?.unitName || 'PHÒNG QUẢN LÝ ĐÀO TẠO';
  const docNo = options?.documentNo || 'Số: ...... /TDU-TTTL';
  const dateStr = options?.locationDate || 'Cần Thơ, ngày ..... tháng ..... năm 2026';
  const withSignatures = options?.hasSignatures !== false;

  // 1. Tạo mảng dữ liệu AOA
  const row0 = new Array(colCount).fill('');
  row0[0] = 'TRƯỜNG ĐẠI HỌC TÂY ĐÔ';
  row0[splitCol] = 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM';

  const row1 = new Array(colCount).fill('');
  row1[0] = `ĐƠN VỊ: ${unitName.toUpperCase()}`;
  row1[splitCol] = 'Độc lập - Tự do - Hạnh phúc';

  const row2 = new Array(colCount).fill('');
  row2[0] = docNo;
  row2[splitCol] = dateStr;

  const row3 = new Array(colCount).fill(''); // Khoảng trống đệm

  const row4 = new Array(colCount).fill('');
  row4[0] = title.toUpperCase(); // Tiêu đề chính

  const row5 = new Array(colCount).fill('');
  row5[0] = subTitle; // Phụ đề học kỳ / năm học

  const row6 = new Array(colCount).fill(''); // Khoảng trống đệm

  const row7 = columns.map((c) => c.header); // Headers tiếng Việt
  const row8 = columns.map((c) => c.key);    // System field keys

  const sheetData: any[][] = [
    row0,
    row1,
    row2,
    row3,
    row4,
    row5,
    row6,
    row7,
    row8,
    ...sampleRows,
  ];

  if (summaryRow && summaryRow.length > 0) {
    sheetData.push(summaryRow);
  }

  // Khối chữ ký hành chính 4 cột
  let sigStartRow = 0;
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = colCount;
  if (withSignatures) {
    b1 = Math.max(1, Math.floor(colCount * 0.25));
    b2 = Math.max(b1 + 1, Math.floor(colCount * 0.50));
    b3 = Math.max(b2 + 1, Math.floor(colCount * 0.75));
    b4 = colCount;

    sheetData.push(new Array(colCount).fill('')); // Buffer 1
    sheetData.push(new Array(colCount).fill('')); // Buffer 2

    // Dòng ngày tháng phía trên cột Ban Giám hiệu
    const sigDateRow = new Array(colCount).fill('');
    sigDateRow[b3] = dateStr;
    sheetData.push(sigDateRow);

    sigStartRow = sheetData.length;

    // Dòng chức danh
    const sigTitlesRow = new Array(colCount).fill('');
    sigTitlesRow[b0] = 'NGƯỜI LẬP BẢNG';
    sigTitlesRow[b1] = 'TRƯỞNG KHOA / ĐƠN VỊ';
    sigTitlesRow[b2] = 'PHÒNG QUẢN LÝ ĐÀO TẠO';
    sigTitlesRow[b3] = 'BAN GIÁM HIỆU PHÊ DUYỆT';
    sheetData.push(sigTitlesRow);

    // Dòng ghi chú ký
    const sigNotesRow = new Array(colCount).fill('');
    sigNotesRow[b0] = '(Ký, ghi rõ họ tên)';
    sigNotesRow[b1] = '(Ký, ghi rõ họ tên)';
    sigNotesRow[b2] = '(Ký, ghi rõ họ tên)';
    sigNotesRow[b3] = '(Ký, đóng dấu)';
    sheetData.push(sigNotesRow);

    // 2 dòng trống tạo khoảng ký
    sheetData.push(new Array(colCount).fill(''));
    sheetData.push(new Array(colCount).fill(''));
  }

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // 2. Thiết lập Merges
  const merges: XLSX.Range[] = [
    // Header trái
    { s: { r: 0, c: 0 }, e: { r: 0, c: splitCol - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: splitCol - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: splitCol - 1 } },
    // Header phải (Quốc hiệu)
    { s: { r: 0, c: splitCol }, e: { r: 0, c: colCount - 1 } },
    { s: { r: 1, c: splitCol }, e: { r: 1, c: colCount - 1 } },
    { s: { r: 2, c: splitCol }, e: { r: 2, c: colCount - 1 } },
    // Tiêu đề & phụ đề
    { s: { r: 4, c: 0 }, e: { r: 4, c: colCount - 1 } },
    { s: { r: 5, c: 0 }, e: { r: 5, c: colCount - 1 } },
  ];

  if (withSignatures && sigStartRow > 0) {
    const dateRowIdx = sigStartRow - 1;
    merges.push({ s: { r: dateRowIdx, c: b3 }, e: { r: dateRowIdx, c: b4 - 1 } });

    // 4 chức danh ký
    merges.push({ s: { r: sigStartRow, c: b0 }, e: { r: sigStartRow, c: b1 - 1 } });
    merges.push({ s: { r: sigStartRow, c: b1 }, e: { r: sigStartRow, c: b2 - 1 } });
    merges.push({ s: { r: sigStartRow, c: b2 }, e: { r: sigStartRow, c: b3 - 1 } });
    merges.push({ s: { r: sigStartRow, c: b3 }, e: { r: sigStartRow, c: b4 - 1 } });

    // 4 dòng hướng dẫn ký
    merges.push({ s: { r: sigStartRow + 1, c: b0 }, e: { r: sigStartRow + 1, c: b1 - 1 } });
    merges.push({ s: { r: sigStartRow + 1, c: b1 }, e: { r: sigStartRow + 1, c: b2 - 1 } });
    merges.push({ s: { r: sigStartRow + 1, c: b2 }, e: { r: sigStartRow + 1, c: b3 - 1 } });
    merges.push({ s: { r: sigStartRow + 1, c: b3 }, e: { r: sigStartRow + 1, c: b4 - 1 } });
  }

  ws['!merges'] = merges;

  // 3. Chiều cao các hàng (Rows height)
  const rowsHeights: { hpx: number }[] = [
    { hpx: 24 }, // R0: ĐH Tây Đô / Quốc hiệu
    { hpx: 22 }, // R1: Đơn vị / Độc lập
    { hpx: 20 }, // R2: Số / Cần Thơ
    { hpx: 10 }, // R3: Đệm
    { hpx: 36 }, // R4: Tiêu đề chính
    { hpx: 22 }, // R5: Phụ đề
    { hpx: 10 }, // R6: Đệm
    { hpx: 34 }, // R7: Headers tiếng Việt
    { hpx: 20 }, // R8: Field keys
    ...sampleRows.map(() => ({ hpx: 24 })), // Data rows
    ...(summaryRow ? [{ hpx: 28 }] : []), // Summary row
  ];

  if (withSignatures) {
    rowsHeights.push({ hpx: 16 }); // Buffer 1
    rowsHeights.push({ hpx: 12 }); // Buffer 2
    rowsHeights.push({ hpx: 22 }); // Date row
    rowsHeights.push({ hpx: 24 }); // Sig titles
    rowsHeights.push({ hpx: 18 }); // Sig notes
    rowsHeights.push({ hpx: 65 }); // Sig space
    rowsHeights.push({ hpx: 20 }); // Bottom buffer
  }

  ws['!rows'] = rowsHeights;
  ws['!cols'] = columns.map((c) => ({ wch: c.width }));

  // Autofilter trên dòng 8 (headers)
  const lastColLetter = XLSX.utils.encode_col(columns.length - 1);
  const dataEndRow = 9 + sampleRows.length;
  ws['!autofilter'] = { ref: `A8:${lastColLetter}${dataEndRow}` };

  // 4. Style: Letterhead & Title
  const cellA1 = ws['A1'];
  if (cellA1) {
    cellA1.s = {
      font: { name: 'Times New Roman', sz: 11, bold: true, color: { rgb: '005325' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };
  }
  const splitColLetter = XLSX.utils.encode_col(splitCol);
  const cellQG1 = ws[`${splitColLetter}1`];
  if (cellQG1) {
    cellQG1.s = {
      font: { name: 'Times New Roman', sz: 11, bold: true, color: { rgb: '000000' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };
  }

  const cellA2 = ws['A2'];
  if (cellA2) {
    cellA2.s = {
      font: { name: 'Times New Roman', sz: 10.5, bold: true, color: { rgb: '1E3A8A' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };
  }
  const cellQG2 = ws[`${splitColLetter}2`];
  if (cellQG2) {
    cellQG2.s = {
      font: { name: 'Times New Roman', sz: 11, bold: true, underline: true, color: { rgb: '000000' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };
  }

  const cellA3 = ws['A3'];
  if (cellA3) {
    cellA3.s = {
      font: { name: 'Times New Roman', sz: 9.5, italic: true, color: { rgb: '64748B' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };
  }
  const cellQG3 = ws[`${splitColLetter}3`];
  if (cellQG3) {
    cellQG3.s = {
      font: { name: 'Times New Roman', sz: 10, italic: true, color: { rgb: '334155' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };
  }

  // Tiêu đề chính (Dòng 5 -> A5)
  const cellA5 = ws['A5'];
  if (cellA5) {
    cellA5.s = {
      font: { name: 'Times New Roman', sz: 15, bold: true, color: { rgb: '005325' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };
  }

  // Phụ đề (Dòng 6 -> A6)
  const cellA6 = ws['A6'];
  if (cellA6) {
    cellA6.s = {
      font: { name: 'Times New Roman', sz: 11, italic: true, bold: true, color: { rgb: '475569' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };
  }

  // 5. Style: Headers (Dòng 8), System Keys (Dòng 9), Dữ liệu (Dòng 10+) và Dòng Tổng cộng
  for (let c = 0; c < columns.length; c++) {
    const colLetter = XLSX.utils.encode_col(c);
    const colDef = columns[c];

    // Dòng 8: Header chính tiếng Việt
    const cellR8 = ws[`${colLetter}8`];
    if (cellR8) {
      cellR8.s = {
        font: {
          name: 'Times New Roman',
          sz: 10.5,
          bold: true,
          color: colDef.isYellow ? { rgb: '000000' } : { rgb: 'FFFFFF' },
        },
        fill: colDef.isYellow
          ? { fgColor: { rgb: 'FFFF99' } } // Vàng nhạt cho cột bắt buộc/nhập liệu
          : { fgColor: { rgb: '005325' } }, // TDU Green cho cột khác
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: headerBorder,
      };
    }

    // Dòng 9: Mã trường hệ thống
    const cellR9 = ws[`${colLetter}9`];
    if (cellR9) {
      cellR9.s = {
        font: { name: 'Times New Roman', sz: 9, bold: false, italic: false, color: { rgb: '64748B' } },
        fill: { fgColor: { rgb: 'F1F5F9' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: thinBorder,
      };
    }

    // Dòng 10+: Dữ liệu thực tế / mẫu kèm Zebra striping
    for (let r = 0; r < sampleRows.length; r++) {
      const cellData = ws[`${colLetter}${10 + r}`];
      if (cellData) {
        const isNum = typeof cellData.v === 'number';
        const isEven = r % 2 === 0;
        cellData.s = {
          font: { name: 'Times New Roman', sz: 10, color: { rgb: '000000' } },
          fill: { fgColor: { rgb: isEven ? 'FFFFFF' : 'F8FAFC' } },
          alignment: {
            vertical: 'center',
            horizontal: colDef.align || (c === 0 ? 'center' : 'left'),
          },
          border: thinBorder,
        };
        // Định dạng số hiển thị cho cột số liệu căn phải
        if (isNum && colDef.align === 'right') {
          cellData.z = Number.isInteger(cellData.v) ? '#,##0' : '#,##0.0';
        }
      }
    }

    // Dòng Tổng cộng (nếu có)
    if (summaryRow) {
      const summaryRowNum = 10 + sampleRows.length;
      const cellSum = ws[`${colLetter}${summaryRowNum}`];
      if (cellSum) {
        const isNum = typeof cellSum.v === 'number';
        cellSum.s = {
          font: { name: 'Times New Roman', sz: 11, bold: true, color: { rgb: '005325' } },
          fill: { fgColor: { rgb: 'FEF3C7' } },
          alignment: {
            vertical: 'center',
            horizontal: colDef.align || (c === 0 ? 'center' : 'left'),
          },
          border: summaryBorder,
        };
        if (isNum && colDef.align === 'right') {
          cellSum.z = Number.isInteger(cellSum.v) ? '#,##0' : '#,##0.0';
        }
      }
    }
  }

  // 6. Style: Khối chữ ký hành chính 4 cột
  if (withSignatures && sigStartRow > 0) {
    // Dòng ngày tháng trên chữ ký
    const dateCellLetter = XLSX.utils.encode_col(b3);
    const dateCell = ws[`${dateCellLetter}${sigStartRow}`];
    if (dateCell) {
      dateCell.s = {
        font: { name: 'Times New Roman', sz: 10, italic: true, color: { rgb: '334155' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };
    }

    // 4 Tiêu đề chức danh
    const sigColStarts = [b0, b1, b2, b3];
    sigColStarts.forEach((colIdx) => {
      const cLetter = XLSX.utils.encode_col(colIdx);
      const titleCell = ws[`${cLetter}${sigStartRow + 1}`];
      if (titleCell) {
        titleCell.s = {
          font: { name: 'Times New Roman', sz: 11, bold: true, color: { rgb: '005325' } },
          alignment: { horizontal: 'center', vertical: 'center' },
        };
      }

      const noteCell = ws[`${cLetter}${sigStartRow + 2}`];
      if (noteCell) {
        noteCell.s = {
          font: { name: 'Times New Roman', sz: 9.5, italic: true, color: { rgb: '64748B' } },
          alignment: { horizontal: 'center', vertical: 'center' },
        };
      }
    });
  }

  return ws;
};

export const getDepartmentTemplateFileName = (
  dept: DepartmentUnit,
  nckhTab?: 'all' | 'bai_bao' | 'seminar' | 'de_tai'
): string => {
  switch (dept) {
    case 'khao_thi':
      return 'Mau_Khao_Thi_Coi_Cham_Thi_TDU_2026_2027.xlsx';
    case 'nckh':
      if (nckhTab === 'bai_bao') return 'Mau_NCKH_Bai_Bao_Khoa_Hoc_TDU_2026_2027.xlsx';
      if (nckhTab === 'seminar') return 'Mau_NCKH_Seminar_Chuyen_De_TDU_2026_2027.xlsx';
      return 'Mau_NCKH_De_Tai_Nghien_Cuu_TDU_2026_2027.xlsx';
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

function s2ab(s: string): ArrayBuffer {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i !== s.length; ++i) {
    view[i] = s.charCodeAt(i) & 0xff;
  }
  return buf;
}

export const saveWorkbookToFile = (wb: XLSX.WorkBook, fileName: string) => {
  if (typeof window === 'undefined') return;

  // Xuất trực tiếp file Excel động đã được định dạng chuẩn thẩm mỹ TDU qua SheetJS và Blob
  try {
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });

    // Hỗ trợ IE / Edge cũ
    if ((window.navigator as any)?.msSaveBlob) {
      (window.navigator as any).msSaveBlob(blob, fileName);
      return;
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.position = 'fixed';
    link.style.top = '-9999px';
    link.style.left = '-9999px';
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
  } catch (err) {
    console.warn('Phương án 1 (binary buffer) thất bại, thử phương án 2 (array buffer):', err);
  }

  // 3. Phương án dự phòng qua type: 'array'
  try {
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.position = 'fixed';
    link.style.top = '-9999px';
    link.style.left = '-9999px';
    link.style.opacity = '0';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        if (link.parentNode) link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (e) {}
    }, 60000);
  } catch (err2) {
    console.error('Tất cả phương án xuất Excel đều thất bại:', err2);
    alert('Không thể lưu file Excel về máy: ' + (err2 as any)?.message);
  }
};

export const generateDepartmentExcelTemplate = (
  dept: DepartmentUnit,
  currentPeriodName: string = 'Học kỳ 1 2026-2027',
  nckhTab?: 'all' | 'bai_bao' | 'seminar' | 'de_tai'
) => {
  const periodLabel = currentPeriodName || 'Học kỳ 1 2026-2027';
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
      [1, 'TDU00128', 'Mai Như Long', '18/09/1982', '092082001245', 'TS', 'Khoa Công nghệ thông tin', 'Hệ thống thông tin doanh nghiệp', 4, 120, 2, periodLabel, 'Coi thi ca sáng + Chấm thi tự luận'],
      [2, 'TDU00215', 'Nguyễn Văn Hải', '10/05/1987', '092087003412', 'ThS', 'Khoa Công nghệ thông tin', 'Lập trình Web nâng cao', 6, 95, 1, periodLabel, 'Coi thi học kỳ tập trung'],
      [3, 'TDU00089', 'Trần Thanh Dũng', '12/03/1975', '092075001188', 'PGS.TS', 'Khoa Dược - Điều dưỡng', 'Dược lý học đại cương', 3, 150, 2, periodLabel, 'Ra đề tự luận + chấm thi'],
    ];

    const ws = createStyledWorksheet(
      `MẪU THÊM CÔNG TÁC RA ĐỀ, COI THI & CHẤM THI (${periodLabel.toUpperCase()})`,
      columns,
      sampleRows
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Khao_Thi');
    saveWorkbookToFile(wb, 'Mau_Khao_Thi_Coi_Cham_Thi_TDU_2026_2027.xlsx');
  } else if (dept === 'nckh') {
    // 2. PHÒNG QL NCKH & SAU ĐẠI HỌC (3 biểu mẫu rút gọn: Bài báo, Seminar, Đề tài NCKH)
    if (nckhTab === 'bai_bao') {
      const columns: TemplateColumn[] = [
        { header: 'STT', key: 'stt', width: 6, align: 'center' },
        { header: 'Mã giảng viên (*)', key: 'ma_giang_vien', width: 16, isYellow: true, align: 'center' },
        { header: 'Họ tên giảng viên (*)', key: 'ho_va_ten', width: 28, isYellow: true, align: 'left' },
        { header: 'Học vị (*)', key: 'hoc_vi', width: 14, isYellow: true, align: 'center' },
        { header: 'Đơn vị (*)', key: 'don_vi', width: 28, isYellow: true, align: 'left' },
        { header: 'Tên bài báo khoa học (*)', key: 'ten_bai_bao', width: 52, isYellow: true, align: 'left' },
        { header: 'Số giờ quy đổi (*)', key: 'so_gio_quy_doi', width: 18, isYellow: true, align: 'center' },
        { header: 'Ghi chú', key: 'ghi_chu', width: 34, align: 'left' },
      ];

      const sampleRows: any[][] = [
        [1, 'TDU00089', 'Trần Thanh Dũng', 'PGS.TS', 'Khoa Dược - Điều dưỡng', 'Bioactive compounds from Mekong Delta medicinal plants (Scopus Q1)', 180, 'Tác giả chính (First Author)'],
        [2, 'TDU00128', 'Mai Như Long', 'TS', 'Khoa Công nghệ thông tin', 'AI and Cloud Architectures in Modern University Management (ISI Q1)', 180, 'Tác giả chính (Q1)'],
        [3, 'TDU00318', 'Nguyễn Thị Cẩm Tú', 'ThS', 'Khoa Quản trị kinh doanh', 'Nghiên cứu các yếu tố ảnh hưởng đến quyết định mua sắm trực tuyến của Gen Z', 60, 'Tác giả liên hệ'],
      ];

      const ws = createStyledWorksheet(
        `MẪU NHẬP LIỆU BÀI BÁO KHOA HỌC (SCOPUS/ISI/TẠP CHÍ) (${periodLabel.toUpperCase()})`,
        columns,
        sampleRows
      );
      XLSX.utils.book_append_sheet(wb, ws, 'Mau_Bai_Bao_NCKH');
      saveWorkbookToFile(wb, 'Mau_NCKH_Bai_Bao_Khoa_Hoc_TDU_2026_2027.xlsx');
    } else if (nckhTab === 'seminar') {
      const columns: TemplateColumn[] = [
        { header: 'STT', key: 'stt', width: 6, align: 'center' },
        { header: 'Mã giảng viên (*)', key: 'ma_giang_vien', width: 16, isYellow: true, align: 'center' },
        { header: 'Họ tên giảng viên (*)', key: 'ho_va_ten', width: 28, isYellow: true, align: 'left' },
        { header: 'Học vị (*)', key: 'hoc_vi', width: 14, isYellow: true, align: 'center' },
        { header: 'Đơn vị (*)', key: 'don_vi', width: 28, isYellow: true, align: 'left' },
        { header: 'Tên bài báo cáo Seminar (*)', key: 'ten_bai_seminar', width: 52, isYellow: true, align: 'left' },
        { header: 'Số giờ quy đổi (*)', key: 'so_gio_quy_doi', width: 18, isYellow: true, align: 'center' },
        { header: 'Ghi chú', key: 'ghi_chu', width: 34, align: 'left' },
      ];

      const sampleRows: any[][] = [
        [1, 'TDU00128', 'Mai Như Long', 'TS', 'Khoa Công nghệ thông tin', 'Ứng dụng Trí tuệ Nhân tạo và Dữ liệu lớn trong Giáo dục đại học', 30, 'Báo cáo viên chính cấp Khoa'],
        [2, 'TDU00089', 'Trần Thanh Dũng', 'PGS.TS', 'Khoa Dược - Điều dưỡng', 'Phương pháp nghiên cứu phát triển thuốc mới từ dược liệu Tây Nam Bộ', 30, 'Báo cáo viên chuyên đề'],
        [3, 'TDU00215', 'Nguyễn Văn Hải', 'ThS', 'Khoa Công nghệ thông tin', 'Xu hướng phát triển ứng dụng di động đa nền tảng với Flutter & React Native', 20, 'Báo cáo viên Seminar'],
      ];

      const ws = createStyledWorksheet(
        `MẪU NHẬP LIỆU BÁO CÁO SEMINAR & HỘI THẢO CHUYÊN ĐỀ (${periodLabel.toUpperCase()})`,
        columns,
        sampleRows
      );
      XLSX.utils.book_append_sheet(wb, ws, 'Mau_Seminar_NCKH');
      saveWorkbookToFile(wb, 'Mau_NCKH_Seminar_Chuyen_De_TDU_2026_2027.xlsx');
    } else {
      // Default: Đề tài NCKH
      const columns: TemplateColumn[] = [
        { header: 'STT', key: 'stt', width: 6, align: 'center' },
        { header: 'Mã giảng viên (*)', key: 'ma_giang_vien', width: 16, isYellow: true, align: 'center' },
        { header: 'Họ tên giảng viên (*)', key: 'ho_va_ten', width: 28, isYellow: true, align: 'left' },
        { header: 'Học vị (*)', key: 'hoc_vi', width: 14, isYellow: true, align: 'center' },
        { header: 'Đơn vị (*)', key: 'don_vi', width: 28, isYellow: true, align: 'left' },
        { header: 'Tên đề tài NCKH (*)', key: 'ten_de_tai_nckh', width: 52, isYellow: true, align: 'left' },
        { header: 'Số giờ quy đổi (*)', key: 'so_gio_quy_doi', width: 18, isYellow: true, align: 'center' },
        { header: 'Ghi chú', key: 'ghi_chu', width: 34, align: 'left' },
      ];

      const sampleRows: any[][] = [
        [1, 'TDU00089', 'Trần Thanh Dũng', 'PGS.TS', 'Khoa Dược - Điều dưỡng', 'Khảo sát và chiết xuất hoạt chất thảo dược phòng chống oxy hóa tại ĐBSCL', 220, 'Chủ nhiệm đề tài cấp Bộ (Nghiệm thu Đạt)'],
        [2, 'TDU00128', 'Mai Như Long', 'TS', 'Khoa Công nghệ thông tin', 'Xây dựng hệ thống quản lý đào tạo và đối soát thanh toán thù lao TDU', 160, 'Chủ nhiệm đề tài cấp Trường'],
        [3, 'TDU00128', 'Mai Như Long', 'TS', 'Khoa Công nghệ thông tin', 'Hướng dẫn 02 Học viên cao học bảo vệ thành công Luận văn Thạc sĩ ngành HTTT', 40, 'Cán bộ hướng dẫn chính (20 giờ/HV)'],
      ];

      const ws = createStyledWorksheet(
        `MẪU NHẬP LIỆU ĐỀ TÀI NGHIÊN CỨU KHOA HỌC & CÔNG TRÌNH (${periodLabel.toUpperCase()})`,
        columns,
        sampleRows
      );
      XLSX.utils.book_append_sheet(wb, ws, 'Mau_De_Tai_NCKH');
      saveWorkbookToFile(wb, 'Mau_NCKH_De_Tai_Nghien_Cuu_TDU_2026_2027.xlsx');
    }
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
      [1, 'TDU00128', 'Mai Như Long', 'TS', 'Khoa Công nghệ thông tin', 'Hướng dẫn Khóa luận tốt nghiệp đại học ngành HTTT', 'KLTN_HTTT_K14', 2, 0, 'Hướng dẫn chính', 24, '12 giờ quy đổi / 1 SV'],
      [2, 'TDU00128', 'Mai Như Long', 'TS', 'Khoa Công nghệ thông tin', 'Phản biện Khóa luận tốt nghiệp đại học K14', 'PB_KLTN_K14', 0, 3, 'Cán bộ phản biện', 9, '3 giờ quy đổi / 1 SV'],
      [3, 'TDU00089', 'Trần Thanh Dũng', 'PGS.TS', 'Khoa Dược - Điều dưỡng', 'Chủ tịch Hội đồng khóa luận tốt nghiệp Dược sĩ', 'HD_KLTN_DUOC', 0, 4, 'Chủ tịch hội đồng', 6, '1.5 giờ quy đổi / 1 SV'],
    ];

    const ws = createStyledWorksheet(
      `MẪU THÊM HƯỚNG DẪN & CHẤM ĐỒ ÁN, KHÓA LUẬN TỐT NGHIỆP (${periodLabel.toUpperCase()})`,
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
      [1, 'TDU00128', 'Mai Như Long', 'TS', 'Khoa Công nghệ thông tin', 'CNTT14A', 65, periodLabel, 20, 180000, 'Theo Quyết định phân công Cố vấn học tập TDU'],
      [2, 'TDU00318', 'Nguyễn Thị Cẩm Tú', 'ThS', 'Khoa Quản trị kinh doanh', 'QTKD15B', 55, periodLabel, 20, 150000, 'Theo Quyết định phân công Cố vấn học tập TDU'],
    ];

    const ws = createStyledWorksheet(
      `MẪU THÊM CÔNG TÁC CỐ VẤN HỌC TẬP (${periodLabel.toUpperCase()})`,
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
      [1, 'TDU00318', 'Nguyễn Thị Cẩm Tú', '22/11/1988', '092088005671', 'ThS', 'Khoa Quản trị kinh doanh', 'Tư vấn hướng nghiệp tuyển sinh ĐBSCL', 5, 'Cụm trường THPT Hậu Giang & Sóc Trăng', periodLabel, 'Tư vấn trực tiếp tại các trường THPT'],
      [2, 'TDU00215', 'Nguyễn Văn Hải', '10/05/1987', '092087003412', 'ThS', 'Khoa Công nghệ thông tin', 'Trực gian hàng tư vấn Ngày hội tuyển sinh', 3, 'Khuôn viên Trường ĐH Cần Thơ & ĐH Tây Đô', periodLabel, 'Tư vấn khối ngành Kỹ thuật - Công nghệ'],
    ];

    const ws = createStyledWorksheet(
      `MẪU THÊM CÔNG TÁC TƯ VẤN TUYỂN SINH & HƯỚNG NGHIỆP (${periodLabel.toUpperCase()})`,
      columns,
      sampleRows
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Tuyen_Sinh');
    saveWorkbookToFile(wb, 'Mau_Tuyen_Sinh_Truyen_Thong_TDU_2026_2027.xlsx');
  } else if (dept === 'cong_tac_khac') {
    // 6. CÔNG TÁC KHÁC (HƯỚNG DẪN THỰC TẬP, ĐỒ ÁN MÔN HỌC, NIÊN LUẬN, CHUYÊN ĐỀ, PTN, ĐBCL...)
    const columns: TemplateColumn[] = [
      { header: 'STT', key: 'stt', width: 6, align: 'center' },
      { header: 'Mã giảng viên (*)', key: 'ma_giang_vien', width: 15, isYellow: true, align: 'center' },
      { header: 'Họ tên giảng viên (*)', key: 'ho_va_ten', width: 28, isYellow: true, align: 'left' },
      { header: 'Học vị (*)', key: 'hoc_vi', width: 12, isYellow: true, align: 'center' },
      { header: 'Khoa / Bộ môn (*)', key: 'khoa_bo_mon', width: 26, isYellow: true, align: 'left' },
      { header: 'Mã công việc (*)', key: 'ma_cv', width: 16, isYellow: true, align: 'center' },
      { header: 'Tên nhiệm vụ / Công tác (*)', key: 'ten_nhiem_vu', width: 44, isYellow: true, align: 'left' },
      { header: 'Số lượng (SV/Lượt/Ngày) (*)', key: 'so_luong', width: 22, isYellow: true, align: 'center' },
      { header: 'Đơn vị tính / Định mức', key: 'dieu_kien', width: 22, align: 'center' },
      { header: 'Thời gian / Căn cứ phân công', key: 'thoi_gian_phan_cong', width: 30, align: 'left' },
      { header: 'Số tiết QC quy đổi (*)', key: 'so_tiet_qc_quy_doi', width: 20, isYellow: true, align: 'right' },
      { header: 'Ghi chú', key: 'ghi_chu', width: 32, align: 'left' },
    ];

    const sampleRows: any[][] = [
      [1, 'TDU00128', 'Mai Như Long', 'TS', 'Khoa Công nghệ thông tin', 'HDTT', 'Hướng dẫn thực tập tốt nghiệp / thực tế', 15, '1 ngày / 1 GV', 'Đợt 1 (15 ngày)', 30, '2 giờ quy đổi / 1 ngày'],
      [2, 'TDU00128', 'Mai Như Long', 'TS', 'Khoa Công nghệ thông tin', 'DAC1', 'Đồ án môn học - Chấm 1', 6, '3 sinh viên', periodLabel, 6, '3 giờ / 3 SV'],
      [3, 'TDU00128', 'Mai Như Long', 'TS', 'Khoa Công nghệ thông tin', 'NLC1', 'Niên luận ngành - Chấm 1', 2, '1 sinh viên', periodLabel, 8, '4 giờ / 1 SV'],
      [4, 'TDU00128', 'Mai Như Long', 'TS', 'Khoa Công nghệ thông tin', 'HDDA', 'Đồ án, khóa luận tốt nghiệp - Hướng dẫn', 2, '1 sinh viên', periodLabel, 24, '12 giờ / 1 SV'],
      [5, 'TDU00215', 'Nguyễn Văn Hải', 'ThS', 'Khoa Công nghệ thông tin', 'QPTN', 'Quản lý phòng thí nghiệm máy tính Lab 03', 1, '1 năm', 'Cả năm học (QĐ số 118/QĐ-ĐHTĐ)', 40, '40 giờ quy đổi / 1 năm'],
      [6, 'TDU00089', 'Trần Thanh Dũng', 'PGS.TS', 'Khoa Dược - Điều dưỡng', 'CTDG', 'Chủ tịch Hội đồng đánh giá ĐBCL', 1, '1 hội đồng', 'Cả năm học (QĐ số 45/QĐ-ĐHTĐ)', 20, '20 giờ quy chuẩn / 1 năm'],
    ];

    const ws = createStyledWorksheet(
      `MẪU THÊM CÔNG TÁC KHÁC & QUY ĐỔI GIỜ CHUẨN (${periodLabel.toUpperCase()})`,
      columns,
      sampleRows
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Kekhai_Cong_Tac_Khac');

    // Thêm Sheet 2: DanhMuc_TraCuu_MaCV để đơn vị tiện tra cứu 26 mã công việc chuẩn
    const catalogColumns: TemplateColumn[] = [
      { header: 'STT', key: 'stt', width: 6, align: 'center' },
      { header: 'Mã công việc (*)', key: 'ma_cv', width: 16, isYellow: true, align: 'center' },
      { header: 'Tên nhiệm vụ / Hoạt động', key: 'ten_cv', width: 45, align: 'left' },
      { header: 'Nhóm công tác', key: 'nhom_cv', width: 22, align: 'center' },
      { header: 'Định mức / Điều kiện tính', key: 'dieu_kien', width: 22, align: 'center' },
      { header: 'Hệ số giờ quy đổi', key: 'he_so_gio', width: 18, isYellow: true, align: 'right' },
      { header: 'Đơn vị quản lý', key: 'don_vi_quan_ly', width: 20, align: 'center' },
      { header: 'Ghi chú áp dụng', key: 'ghi_chu', width: 35, align: 'left' },
    ];

    const catalogRows = INITIAL_JOB_DUTIES.map((item, idx) => [
      idx + 1,
      item.maCV,
      item.tenCV,
      item.nhomCV,
      item.dieuKien,
      item.heSoQuyDoi,
      item.donViQuanLy === 'khoa' ? 'Khoa chuyên môn' : item.donViQuanLy === 'dbcl' ? 'Ban ĐBCL' : 'Phòng Thí nghiệm',
      item.ghiChu || '',
    ]);

    const wsCatalog = createStyledWorksheet(
      'BẢNG TRA CỨU MÃ CÔNG VIỆC & HỆ SỐ QUY ĐỔI GIỜ CHUẨN - TRƯỜNG ĐH TÂY ĐÔ',
      catalogColumns,
      catalogRows
    );
    XLSX.utils.book_append_sheet(wb, wsCatalog, 'DanhMuc_TraCuu_MaCV');

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
      [1, 'TDU00128', 'Mai Như Long', 'Phát triển Hệ thống Thông tin Doanh nghiệp', 'CNTT14A', 65, 1, 45, 30, 1.25, 1.0, 'Lý thuyết', 'TS', 'Khoa Công nghệ thông tin', '102874639912', 'VietinBank CN Cần Thơ', periodLabel, 'Giảng dạy lý thuyết chính khóa'],
      [2, 'TDU00128', 'Mai Như Long', 'Phát triển Hệ thống Thông tin Doanh nghiệp (Lab)', 'CNTT14A_LAB', 65, 2, 30, 30, 1.35, 1.1, 'Thực hành', 'TS', 'Khoa Công nghệ thông tin', '102874639912', 'VietinBank CN Cần Thơ', periodLabel, 'Thực hành phòng máy 2 nhóm'],
      [3, 'TDU00089', 'Trần Thanh Dũng', 'Dược lý học đại cương', 'DUOC12A', 80, 1, 60, 45, 1.30, 1.0, 'Lý thuyết', 'PGS.TS', 'Khoa Dược - Điều dưỡng', '101994827110', 'Vietcombank CN Cần Thơ', periodLabel, 'Giảng dạy chính khóa'],
      [4, 'TDU00318', 'Nguyễn Thị Cẩm Tú', 'Quản trị Chiến lược Doanh nghiệp', 'QTKD15B', 55, 1, 45, 45, 1.15, 1.0, 'Lý thuyết', 'ThS', 'Khoa Quản trị kinh doanh', '190334812903', 'Techcombank CN Cần Thơ', periodLabel, 'Giảng dạy chính khóa'],
      [5, 'TDU00215', 'Nguyễn Văn Hải', 'Lập trình Ứng dụng Di động Flutter', 'CNTT15A', 50, 1, 45, 45, 1.15, 1.0, 'Lý thuyết', 'ThS', 'Khoa Công nghệ thông tin', '103847291048', 'BIDV CN Tây Đô', periodLabel, 'Giảng dạy chính khóa'],
    ];

    const ws = createStyledWorksheet(
      `MẪU THÊM KHỐI LƯỢNG GIẢNG DẠY & THÙ LAO (${periodLabel.toUpperCase()})`,
      columns,
      sampleRows
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Thanh_Toan_Gio_Giang');
    saveWorkbookToFile(wb, 'Mau_Thanh_Toan_Gio_Giang_TDU_2026_2027.xlsx');
  }
};

/**
 * XUẤT FILE EXCEL DỮ LIỆU THỰC TẾ THEO ĐÚNG BIỂU MẪU CHUẨN TDU:
 * - Font chữ Times New Roman đồng nhất
 * - Hàng 2: Tiêu đề In hoa, In đậm, merge toàn bộ cột
 * - Hàng 4: Tiêu đề tiếng Việt, viền mỏng đen, nền màu vàng nhạt/trắng
 * - Hàng 5: Mã trường hệ thống in thẳng
 * - Hàng 6+: Dữ liệu thực tế được định dạng số / tiền tệ / căn lề chuẩn mực
 * - Hàng cuối: Dòng TỔNG CỘNG kế toán (viền dưới đôi, in đậm, tổng QC, tổng thù lao, thuế, thực nhận)
 */
export const exportDepartmentDataExcel = (
  dept: DepartmentUnit,
  rawRecords: TeachingRecord[],
  currentPeriodName: string = 'Học kỳ 1 2026-2027'
) => {
  const periodLabel = currentPeriodName || 'Học kỳ 1 2026-2027';
  const records = Array.isArray(rawRecords) ? rawRecords : [];
  const wb = XLSX.utils.book_new();

  if (dept === 'khao_thi') {
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
      { header: 'Tổng tiết QC (*)', key: 'tong_tiet_qc', width: 18, isYellow: true, align: 'right' },
      { header: 'Đơn giá / tiết (VNĐ)', key: 'don_gia_tiet', width: 18, align: 'right' },
      { header: 'Tổng thù lao (VNĐ) (*)', key: 'tong_thu_lao', width: 20, isYellow: true, align: 'right' },
      { header: 'Thuế TNCN 10% (VNĐ)', key: 'thue_tncn', width: 18, align: 'right' },
      { header: 'Thực nhận (VNĐ) (*)', key: 'thuc_nhan', width: 20, isYellow: true, align: 'right' },
      { header: 'Số tài khoản', key: 'so_tai_khoan', width: 18, align: 'center' },
      { header: 'Ngân hàng', key: 'ngan_hang', width: 22, align: 'left' },
      { header: 'Đợt thi (*)', key: 'dot_thi', width: 22, isYellow: true, align: 'center' },
      { header: 'Ghi chú', key: 'ghi_chu', width: 30, align: 'left' },
    ];

    const dataRows = records.map((r, idx) => [
      idx + 1,
      r.maGV || '',
      stripAcademicTitle(r.hoTen || ''),
      r.ngaySinh || '—',
      r.soCCCD || '—',
      r.hocHamHocVi || '',
      r.khoaBoMon || '',
      r.tenHocPhan || r.tenCongViec || '—',
      Number(r.soLuong) || 0,
      Number(r.soTietTH) || 0,
      Number(r.soTietLT) || 0,
      Number(r.tongTietQC) || 0,
      Number(r.donGiaTiet) || 150000,
      Number(r.tongTienThuLao) || 0,
      Number(r.thueTNCN) || 0,
      Number(r.thucNhan) || 0,
      r.soTaiKhoan || '—',
      r.nganHang || '—',
      r.dotThanhToan || periodLabel,
      r.ghiChu || r.ghiChuThongTin || '',
    ]);

    const sumCoi = records.reduce((s, r) => s + (Number(r.soLuong) || 0), 0);
    const sumCham = records.reduce((s, r) => s + (Number(r.soTietTH) || 0), 0);
    const sumDe = records.reduce((s, r) => s + (Number(r.soTietLT) || 0), 0);
    const sumQC = records.reduce((s, r) => s + (Number(r.tongTietQC) || 0), 0);
    const sumThuLao = records.reduce((s, r) => s + (Number(r.tongTienThuLao) || 0), 0);
    const sumThue = records.reduce((s, r) => s + (Number(r.thueTNCN) || 0), 0);
    const sumThucNhan = records.reduce((s, r) => s + (Number(r.thucNhan) || 0), 0);

    const summaryRow = [
      `TỔNG CỘNG (${records.length} bản ghi)`,
      '', '', '', '', '', '', '',
      sumCoi, sumCham, sumDe, sumQC, '', sumThuLao, sumThue, sumThucNhan,
      '', '', '', ''
    ];

    const ws = createStyledWorksheet(
      `BẢNG KÊ CHI TIẾT THANH TOÁN THÙ LAO KHẢO THÍ & ĐBCL (${periodLabel.toUpperCase()})`,
      columns,
      dataRows.length > 0 ? dataRows : [['Chưa có bản ghi nào']],
      dataRows.length > 0 ? summaryRow : undefined
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Bang_Ke_Khao_Thi');
    saveWorkbookToFile(wb, `Bang_Ke_Chi_Tiet_Khao_Thi_Coi_Cham_Thi_TDU_2026_2027.xlsx`);
  } else if (dept === 'nckh') {
    const columns: TemplateColumn[] = [
      { header: 'STT', key: 'stt', width: 6, align: 'center' },
      { header: 'Mã giảng viên (*)', key: 'ma_giang_vien', width: 15, isYellow: true, align: 'center' },
      { header: 'Họ tên giảng viên (*)', key: 'ho_va_ten', width: 28, isYellow: true, align: 'left' },
      { header: 'Học vị (*)', key: 'hoc_vi', width: 12, isYellow: true, align: 'center' },
      { header: 'Khoa / Bộ môn (*)', key: 'khoa_bo_mon', width: 26, isYellow: true, align: 'left' },
      { header: 'Tên đề tài / Bài báo ISI / Luận văn (*)', key: 'ten_de_tai_bai_bao', width: 46, isYellow: true, align: 'left' },
      { header: 'Thể loại NCKH', key: 'the_loai_nckh', width: 26, align: 'left' },
      { header: 'Mã đề tài / Số ISSN', key: 'ma_de_tai_issn', width: 20, align: 'center' },
      { header: 'Số giờ quy đổi (*)', key: 'so_gio_quy_doi', width: 18, isYellow: true, align: 'right' },
      { header: 'Định mức NCKH', key: 'dinh_muc_nckh', width: 16, align: 'center' },
      { header: 'Mức độ hoàn thành (*)', key: 'muc_do_hoan_thanh', width: 20, isYellow: true, align: 'center' },
      { header: 'Đơn giá / tiết (VNĐ)', key: 'don_gia_tiet', width: 18, align: 'right' },
      { header: 'Tổng thù lao (VNĐ) (*)', key: 'tong_thu_lao', width: 20, isYellow: true, align: 'right' },
      { header: 'Thuế TNCN 10% (VNĐ)', key: 'thue_tncn', width: 18, align: 'right' },
      { header: 'Thực nhận (VNĐ) (*)', key: 'thuc_nhan', width: 20, isYellow: true, align: 'right' },
      { header: 'Số tài khoản', key: 'so_tai_khoan', width: 18, align: 'center' },
      { header: 'Ngân hàng', key: 'ngan_hang', width: 22, align: 'left' },
      { header: 'Đợt thanh toán', key: 'dot_thanh_toan', width: 22, align: 'center' },
      { header: 'Ghi chú / Vai trò', key: 'ghi_chu_vai_tro', width: 32, align: 'left' },
    ];

    const dataRows = records.map((r, idx) => [
      idx + 1,
      r.maGV || '',
      stripAcademicTitle(r.hoTen || ''),
      r.hocHamHocVi || '',
      r.khoaBoMon || '',
      r.tenHocPhan || r.noiDungNCKH || '—',
      r.theLoaiNCKH || 'Bài báo khoa học',
      r.maLopHocPhan || '—',
      Number(r.soGioQCNCKH || r.tongTietQC) || 0,
      Number(r.dinhMucNCKH) || 150,
      r.mucDoHoanThanhNCKH === 'hoan_thanh' ? 'Hoàn thành' : 'Chưa hoàn thành',
      Number(r.donGiaTiet) || 180000,
      Number(r.tongTienThuLao) || 0,
      Number(r.thueTNCN) || 0,
      Number(r.thucNhan) || 0,
      r.soTaiKhoan || '—',
      r.nganHang || '—',
      r.dotThanhToan || periodLabel,
      r.ghiChu || 'Chủ nhiệm / Tác giả',
    ]);

    const sumQC = records.reduce((s, r) => s + (Number(r.soGioQCNCKH || r.tongTietQC) || 0), 0);
    const sumThuLao = records.reduce((s, r) => s + (Number(r.tongTienThuLao) || 0), 0);
    const sumThue = records.reduce((s, r) => s + (Number(r.thueTNCN) || 0), 0);
    const sumThucNhan = records.reduce((s, r) => s + (Number(r.thucNhan) || 0), 0);

    const summaryRow = [
      `TỔNG CỘNG (${records.length} bản ghi NCKH)`,
      '', '', '', '', '', '', '',
      sumQC, '', '', '', sumThuLao, sumThue, sumThucNhan,
      '', '', '', ''
    ];

    const ws = createStyledWorksheet(
      `BẢNG KÊ CHI TIẾT THANH TOÁN THÙ LAO NGHIÊN CỨU KHOA HỌC (${periodLabel.toUpperCase()})`,
      columns,
      dataRows.length > 0 ? dataRows : [['Chưa có bản ghi nào']],
      dataRows.length > 0 ? summaryRow : undefined
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Bang_Ke_NCKH');
    saveWorkbookToFile(wb, `Bang_Ke_Chi_Tiet_NCKH_Sau_Dai_Hoc_TDU_2026_2027.xlsx`);
  } else if (dept === 'do_an') {
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
      { header: 'Vai trò', key: 'vai_tro', width: 20, align: 'center' },
      { header: 'Số giờ quy chuẩn (*)', key: 'so_gio_quy_chuan', width: 18, isYellow: true, align: 'right' },
      { header: 'Đơn giá / tiết (VNĐ)', key: 'don_gia_tiet', width: 18, align: 'right' },
      { header: 'Tổng thù lao (VNĐ) (*)', key: 'tong_thu_lao', width: 20, isYellow: true, align: 'right' },
      { header: 'Thuế TNCN 10% (VNĐ)', key: 'thue_tncn', width: 18, align: 'right' },
      { header: 'Thực nhận (VNĐ) (*)', key: 'thuc_nhan', width: 20, isYellow: true, align: 'right' },
      { header: 'Số tài khoản', key: 'so_tai_khoan', width: 18, align: 'center' },
      { header: 'Ngân hàng', key: 'ngan_hang', width: 22, align: 'left' },
      { header: 'Ghi chú', key: 'ghi_chu', width: 30, align: 'left' },
    ];

    const dataRows = records.map((r, idx) => [
      idx + 1,
      r.maGV || '',
      stripAcademicTitle(r.hoTen || ''),
      r.hocHamHocVi || '',
      r.khoaBoMon || '',
      r.tenHocPhan || 'Hướng dẫn KLTN / Đồ án',
      r.maLopHocPhan || '—',
      Number(r.soDeTaiHuongDan || r.soSinhVien) || 0,
      Number(r.soLuotChamHoiDong) || 0,
      r.vaiTroDoAn || 'Hướng dẫn chính',
      Number(r.tongTietQC) || 0,
      Number(r.donGiaTiet) || 160000,
      Number(r.tongTienThuLao) || 0,
      Number(r.thueTNCN) || 0,
      Number(r.thucNhan) || 0,
      r.soTaiKhoan || '—',
      r.nganHang || '—',
      r.ghiChu || '',
    ]);

    const sumSV = records.reduce((s, r) => s + (Number(r.soDeTaiHuongDan || r.soSinhVien) || 0), 0);
    const sumHD = records.reduce((s, r) => s + (Number(r.soLuotChamHoiDong) || 0), 0);
    const sumQC = records.reduce((s, r) => s + (Number(r.tongTietQC) || 0), 0);
    const sumThuLao = records.reduce((s, r) => s + (Number(r.tongTienThuLao) || 0), 0);
    const sumThue = records.reduce((s, r) => s + (Number(r.thueTNCN) || 0), 0);
    const sumThucNhan = records.reduce((s, r) => s + (Number(r.thucNhan) || 0), 0);

    const summaryRow = [
      `TỔNG CỘNG (${records.length} bản ghi đồ án)`,
      '', '', '', '', '', '',
      sumSV, sumHD, '', sumQC, '', sumThuLao, sumThue, sumThucNhan,
      '', '', ''
    ];

    const ws = createStyledWorksheet(
      `BẢNG KÊ CHI TIẾT THANH TOÁN THÙ LAO ĐỒ ÁN & KHÓA LUẬN (${periodLabel.toUpperCase()})`,
      columns,
      dataRows.length > 0 ? dataRows : [['Chưa có bản ghi nào']],
      dataRows.length > 0 ? summaryRow : undefined
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Bang_Ke_Do_An');
    saveWorkbookToFile(wb, `Bang_Ke_Chi_Tiet_Do_An_Khoa_Luan_Tot_Nghiep_TDU_2026_2027.xlsx`);
  } else if (dept === 'co_van_hoc_tap') {
    const columns: TemplateColumn[] = [
      { header: 'STT', key: 'stt', width: 6, align: 'center' },
      { header: 'Mã giảng viên (*)', key: 'ma_giang_vien', width: 15, isYellow: true, align: 'center' },
      { header: 'Họ tên giảng viên (*)', key: 'ho_va_ten', width: 28, isYellow: true, align: 'left' },
      { header: 'Học vị (*)', key: 'hoc_vi', width: 12, isYellow: true, align: 'center' },
      { header: 'Khoa / Bộ môn (*)', key: 'khoa_bo_mon', width: 26, isYellow: true, align: 'left' },
      { header: 'Lớp phụ trách CVHT (*)', key: 'lop_phu_trach_cvht', width: 20, isYellow: true, align: 'center' },
      { header: 'Số sinh viên lớp', key: 'so_sinh_vien', width: 16, align: 'center' },
      { header: 'Xếp loại CVHT', key: 'xep_loai_cvht', width: 18, align: 'center' },
      { header: 'Số tiết định mức QC (*)', key: 'so_tiet_dinh_muc_qc', width: 20, isYellow: true, align: 'right' },
      { header: 'Đơn giá tiết (VNĐ)', key: 'don_gia_tiet', width: 18, align: 'right' },
      { header: 'Tổng thù lao (VNĐ) (*)', key: 'tong_thu_lao', width: 20, isYellow: true, align: 'right' },
      { header: 'Thuế TNCN 10% (VNĐ)', key: 'thue_tncn', width: 18, align: 'right' },
      { header: 'Thực nhận (VNĐ) (*)', key: 'thuc_nhan', width: 20, isYellow: true, align: 'right' },
      { header: 'Số tài khoản', key: 'so_tai_khoan', width: 18, align: 'center' },
      { header: 'Ngân hàng', key: 'ngan_hang', width: 22, align: 'left' },
      { header: 'Đợt thanh toán', key: 'dot_thanh_toan', width: 22, align: 'center' },
      { header: 'Ghi chú', key: 'ghi_chu', width: 34, align: 'left' },
    ];

    const dataRows = records.map((r, idx) => [
      idx + 1,
      r.maGV || '',
      stripAcademicTitle(r.hoTen || ''),
      r.hocHamHocVi || '',
      r.khoaBoMon || '',
      r.lopCVHT || r.maLopHocPhan || '—',
      Number(r.soSinhVien) || 0,
      r.xepLoaiCVHT || 'Hoàn thành tốt',
      Number(r.tongTietQC) || 0,
      Number(r.donGiaTiet) || 150000,
      Number(r.tongTienThuLao) || 0,
      Number(r.thueTNCN) || 0,
      Number(r.thucNhan) || 0,
      r.soTaiKhoan || '—',
      r.nganHang || '—',
      r.dotThanhToan || periodLabel,
      r.ghiChu || 'Theo Quyết định phân công Cố vấn học tập TDU',
    ]);

    const sumSV = records.reduce((s, r) => s + (Number(r.soSinhVien) || 0), 0);
    const sumQC = records.reduce((s, r) => s + (Number(r.tongTietQC) || 0), 0);
    const sumThuLao = records.reduce((s, r) => s + (Number(r.tongTienThuLao) || 0), 0);
    const sumThue = records.reduce((s, r) => s + (Number(r.thueTNCN) || 0), 0);
    const sumThucNhan = records.reduce((s, r) => s + (Number(r.thucNhan) || 0), 0);

    const summaryRow = [
      `TỔNG CỘNG (${records.length} giảng viên CVHT)`,
      '', '', '', '', '',
      sumSV, '', sumQC, '', sumThuLao, sumThue, sumThucNhan,
      '', '', '', ''
    ];

    const ws = createStyledWorksheet(
      `BẢNG KÊ CHI TIẾT THANH TOÁN THÙ LAO CỐ VẤN HỌC TẬP (${periodLabel.toUpperCase()})`,
      columns,
      dataRows.length > 0 ? dataRows : [['Chưa có bản ghi nào']],
      dataRows.length > 0 ? summaryRow : undefined
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Bang_Ke_CVHT');
    saveWorkbookToFile(wb, `Bang_Ke_Chi_Tiet_Co_Van_Hoc_Tap_TDU_2026_2027.xlsx`);
  } else if (dept === 'tuyen_sinh') {
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
      { header: 'Tổng tiết QC (*)', key: 'tong_tiet_qc', width: 18, isYellow: true, align: 'right' },
      { header: 'Đơn giá tiết (VNĐ)', key: 'don_gia_tiet', width: 18, align: 'right' },
      { header: 'Tổng thù lao (VNĐ) (*)', key: 'tong_thu_lao', width: 20, isYellow: true, align: 'right' },
      { header: 'Thuế TNCN 10% (VNĐ)', key: 'thue_tncn', width: 18, align: 'right' },
      { header: 'Thực nhận (VNĐ) (*)', key: 'thuc_nhan', width: 20, isYellow: true, align: 'right' },
      { header: 'Số tài khoản', key: 'so_tai_khoan', width: 18, align: 'center' },
      { header: 'Ngân hàng', key: 'ngan_hang', width: 22, align: 'left' },
      { header: 'Đợt tuyển sinh (*)', key: 'dot_tuyen_sinh', width: 22, isYellow: true, align: 'center' },
      { header: 'Ghi chú', key: 'ghi_chu', width: 30, align: 'left' },
    ];

    const dataRows = records.map((r, idx) => [
      idx + 1,
      r.maGV || '',
      stripAcademicTitle(r.hoTen || ''),
      r.ngaySinh || '—',
      r.soCCCD || '—',
      r.hocHamHocVi || '',
      r.khoaBoMon || '',
      r.tenHocPhan || 'Tư vấn hướng nghiệp tuyển sinh ĐBSCL',
      Number(r.soNgayCongTac) || 1,
      r.diaBanTuyenSinh || 'Trường THPT ĐBSCL',
      Number(r.tongTietQC) || 0,
      Number(r.donGiaTiet) || 160000,
      Number(r.tongTienThuLao) || 0,
      Number(r.thueTNCN) || 0,
      Number(r.thucNhan) || 0,
      r.soTaiKhoan || '—',
      r.nganHang || '—',
      r.dotThanhToan || periodLabel,
      r.ghiChu || '',
    ]);

    const sumNgay = records.reduce((s, r) => s + (Number(r.soNgayCongTac) || 0), 0);
    const sumQC = records.reduce((s, r) => s + (Number(r.tongTietQC) || 0), 0);
    const sumThuLao = records.reduce((s, r) => s + (Number(r.tongTienThuLao) || 0), 0);
    const sumThue = records.reduce((s, r) => s + (Number(r.thueTNCN) || 0), 0);
    const sumThucNhan = records.reduce((s, r) => s + (Number(r.thucNhan) || 0), 0);

    const summaryRow = [
      `TỔNG CỘNG (${records.length} lượt công tác)`,
      '', '', '', '', '', '', '',
      sumNgay, '', sumQC, '', sumThuLao, sumThue, sumThucNhan,
      '', '', '', ''
    ];

    const ws = createStyledWorksheet(
      `BẢNG KÊ CHI TIẾT THANH TOÁN THÙ LAO CÔNG TÁC TUYỂN SINH (${periodLabel.toUpperCase()})`,
      columns,
      dataRows.length > 0 ? dataRows : [['Chưa có bản ghi nào']],
      dataRows.length > 0 ? summaryRow : undefined
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Bang_Ke_Tuyen_Sinh');
    saveWorkbookToFile(wb, `Bang_Ke_Chi_Tiet_Tuyen_Sinh_Truyen_Thong_TDU_2026_2027.xlsx`);
  } else if (dept === 'cong_tac_khac') {
    const columns: TemplateColumn[] = [
      { header: 'STT', key: 'stt', width: 6, align: 'center' },
      { header: 'Mã giảng viên (*)', key: 'ma_giang_vien', width: 15, isYellow: true, align: 'center' },
      { header: 'Họ tên giảng viên (*)', key: 'ho_va_ten', width: 28, isYellow: true, align: 'left' },
      { header: 'Học vị (*)', key: 'hoc_vi', width: 12, isYellow: true, align: 'center' },
      { header: 'Khoa / Bộ môn (*)', key: 'khoa_bo_mon', width: 26, isYellow: true, align: 'left' },
      { header: 'Mã công việc (*)', key: 'ma_cv', width: 16, isYellow: true, align: 'center' },
      { header: 'Tên nhiệm vụ / Hoạt động (*)', key: 'ten_nhiem_vu', width: 44, isYellow: true, align: 'left' },
      { header: 'Số lượng (SV/Lượt/Ngày)', key: 'so_luong', width: 20, align: 'center' },
      { header: 'Thời gian / Căn cứ phân công', key: 'thoi_gian_phan_cong', width: 30, align: 'left' },
      { header: 'Số tiết QC quy đổi (*)', key: 'so_tiet_qc_quy_doi', width: 20, isYellow: true, align: 'right' },
      { header: 'Đơn giá tiết (VNĐ)', key: 'don_gia_tiet', width: 18, align: 'right' },
      { header: 'Tổng thù lao (VNĐ) (*)', key: 'tong_thu_lao', width: 20, isYellow: true, align: 'right' },
      { header: 'Thuế TNCN 10% (VNĐ)', key: 'thue_tncn', width: 18, align: 'right' },
      { header: 'Thực nhận (VNĐ) (*)', key: 'thuc_nhan', width: 20, isYellow: true, align: 'right' },
      { header: 'Số tài khoản', key: 'so_tai_khoan', width: 18, align: 'center' },
      { header: 'Ngân hàng', key: 'ngan_hang', width: 22, align: 'left' },
      { header: 'Đợt thanh toán', key: 'dot_thanh_toan', width: 22, align: 'center' },
      { header: 'Ghi chú', key: 'ghi_chu', width: 32, align: 'left' },
    ];

    const dataRows = records.map((r, idx) => [
      idx + 1,
      r.maGV || '',
      stripAcademicTitle(r.hoTen || ''),
      r.hocHamHocVi || '',
      r.khoaBoMon || '',
      r.maCV || r.maLopHocPhan || 'HDTT',
      r.tenHocPhan || r.tenCongViec || r.nhiemVuKiemNhiem || 'Công tác khác & ĐBCL',
      Number(r.soLuong || r.soSinhVien || r.soDeTaiHuongDan) || 1,
      r.ghiChu || 'Cả năm học',
      Number(r.tongTietQC) || 0,
      Number(r.donGiaTiet) || 150000,
      Number(r.tongTienThuLao) || 0,
      Number(r.thueTNCN) || 0,
      Number(r.thucNhan) || 0,
      r.soTaiKhoan || '—',
      r.nganHang || '—',
      r.dotThanhToan || periodLabel,
      r.ghiChu || '',
    ]);

    const sumSL = records.reduce((s, r) => s + (Number(r.soLuong || r.soSinhVien || r.soDeTaiHuongDan) || 1), 0);
    const sumQC = records.reduce((s, r) => s + (Number(r.tongTietQC) || 0), 0);
    const sumThuLao = records.reduce((s, r) => s + (Number(r.tongTienThuLao) || 0), 0);
    const sumThue = records.reduce((s, r) => s + (Number(r.thueTNCN) || 0), 0);
    const sumThucNhan = records.reduce((s, r) => s + (Number(r.thucNhan) || 0), 0);

    const summaryRow = [
      `TỔNG CỘNG (${records.length} nhiệm vụ)`,
      '', '', '', '', '', '',
      sumSL, '', sumQC, '', sumThuLao, sumThue, sumThucNhan,
      '', '', '', ''
    ];

    const ws = createStyledWorksheet(
      `BẢNG KÊ CHI TIẾT THANH TOÁN THÙ LAO CÔNG TÁC KHÁC (${periodLabel.toUpperCase()})`,
      columns,
      dataRows.length > 0 ? dataRows : [['Chưa có bản ghi nào']],
      dataRows.length > 0 ? summaryRow : undefined
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Bang_Ke_Cong_Tac_Khac');
    saveWorkbookToFile(wb, `Bang_Ke_Chi_Tiet_Cong_Tac_Khac_TDU_2026_2027.xlsx`);
  } else if (dept === 'dao_tao') {
    const columns: TemplateColumn[] = [
      { header: 'STT', key: 'stt', width: 6, align: 'center' },
      { header: 'Mã giảng viên (*)', key: 'ma_giang_vien', width: 15, isYellow: true, align: 'center' },
      { header: 'Họ tên giảng viên (*)', key: 'ho_va_ten', width: 28, isYellow: true, align: 'left' },
      { header: 'Môn giảng dạy (*)', key: 'mon_giang_day', width: 38, isYellow: true, align: 'left' },
      { header: 'Lớp học phần (*)', key: 'ma_lop_hoc_phan', width: 18, isYellow: true, align: 'center' },
      { header: 'Phân loại GD', key: 'phan_loai_giang_day', width: 16, align: 'center' },
      { header: 'Số SV', key: 'so_sinh_vien', width: 10, align: 'center' },
      { header: 'Số nhóm', key: 'so_nhom', width: 10, align: 'center' },
      { header: 'Số giờ MH', key: 'so_gio_mon_hoc', width: 12, align: 'center' },
      { header: 'Số giờ thực giảng (*)', key: 'so_gio_thuc_giang', width: 20, isYellow: true, align: 'center' },
      { header: 'Hệ số lớp', key: 'he_so_lop', width: 12, align: 'center' },
      { header: 'Hệ số TC', key: 'he_so_tin_chi', width: 12, align: 'center' },
      { header: 'Tổng tiết QC (*)', key: 'tong_tiet_qc', width: 16, isYellow: true, align: 'right' },
      { header: 'Đơn giá tiết (VNĐ)', key: 'don_gia_tiet', width: 18, align: 'right' },
      { header: 'Tổng thù lao (VNĐ) (*)', key: 'tong_thu_lao', width: 20, isYellow: true, align: 'right' },
      { header: 'Thuế TNCN 10% (VNĐ)', key: 'thue_tncn', width: 18, align: 'right' },
      { header: 'Thực nhận (VNĐ) (*)', key: 'thuc_nhan', width: 20, isYellow: true, align: 'right' },
      { header: 'Học vị (*)', key: 'hoc_vi', width: 12, isYellow: true, align: 'center' },
      { header: 'Khoa / Bộ môn (*)', key: 'khoa_bo_mon', width: 26, isYellow: true, align: 'left' },
      { header: 'Số tài khoản', key: 'so_tai_khoan', width: 18, align: 'center' },
      { header: 'Ngân hàng', key: 'ngan_hang', width: 22, align: 'left' },
      { header: 'Đợt thanh toán', key: 'dot_thanh_toan', width: 22, align: 'center' },
      { header: 'Trạng thái', key: 'trang_thai', width: 16, align: 'center' },
      { header: 'Ghi chú', key: 'ghi_chu', width: 30, align: 'left' },
    ];

    const dataRows = records.map((r, idx) => [
      idx + 1,
      r.maGV || '',
      stripAcademicTitle(r.hoTen || ''),
      r.tenHocPhan || '',
      r.maLopHocPhan || '',
      r.phanLoaiGiangDay === 'thuc_hanh_thuc_tap' ? 'Thực hành' : 'Lý thuyết',
      Number(r.soSinhVien) || 0,
      Number(r.soNhom) || 1,
      Number(r.soGioMonHoc) || 0,
      Number(r.soGioThucGiang || r.tongTietQC) || 0,
      Number(r.heSoLop || r.heSoLopNhom) || 1.0,
      Number(r.heSoTinChi) || 1.0,
      Number(r.tongTietQC) || 0,
      Number(r.donGiaTiet) || 150000,
      Number(r.tongTienThuLao) || 0,
      Number(r.thueTNCN) || 0,
      Number(r.thucNhan) || 0,
      r.hocHamHocVi || '',
      r.khoaBoMon || '',
      r.soTaiKhoan || '—',
      r.nganHang || '—',
      r.dotThanhToan || periodLabel,
      r.trangThai === 'hop_le' ? 'Hợp lệ' : r.trangThai === 'da_so_hoa' ? 'Đã duyệt chi' : r.trangThai === 'trung_lap' ? 'Trùng lịch' : 'Cần đối soát',
      r.ghiChu || '',
    ]);

    const sumSV = records.reduce((s, r) => s + (Number(r.soSinhVien) || 0), 0);
    const sumThucGiang = records.reduce((s, r) => s + (Number(r.soGioThucGiang || r.tongTietQC) || 0), 0);
    const sumQC = records.reduce((s, r) => s + (Number(r.tongTietQC) || 0), 0);
    const sumThuLao = records.reduce((s, r) => s + (Number(r.tongTienThuLao) || 0), 0);
    const sumThue = records.reduce((s, r) => s + (Number(r.thueTNCN) || 0), 0);
    const sumThucNhan = records.reduce((s, r) => s + (Number(r.thucNhan) || 0), 0);

    const summaryRow = [
      `TỔNG CỘNG (${records.length} lớp học phần)`,
      '', '', '', '', '',
      sumSV, '', '', sumThucGiang, '', '', sumQC, '', sumThuLao, sumThue, sumThucNhan,
      '', '', '', '', '', '', ''
    ];

    const ws = createStyledWorksheet(
      `BẢNG KÊ CHI TIẾT THANH TOÁN THÙ LAO GIỜ GIẢNG (${periodLabel.toUpperCase()})`,
      columns,
      dataRows.length > 0 ? dataRows : [['Chưa có bản ghi nào']],
      dataRows.length > 0 ? summaryRow : undefined
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Bang_Ke_Gio_Giang');
    saveWorkbookToFile(wb, `Bang_Ke_Chi_Tiet_Thanh_Toan_Gio_Giang_TDU_2026_2027.xlsx`);
  } else {
    // all
    const columns: TemplateColumn[] = [
      { header: 'STT', key: 'stt', width: 6, align: 'center' },
      { header: 'Mã giảng viên (*)', key: 'ma_giang_vien', width: 15, isYellow: true, align: 'center' },
      { header: 'Họ tên giảng viên (*)', key: 'ho_va_ten', width: 28, isYellow: true, align: 'left' },
      { header: 'Học vị (*)', key: 'hoc_vi', width: 12, isYellow: true, align: 'center' },
      { header: 'Khoa / Bộ môn (*)', key: 'khoa_bo_mon', width: 26, isYellow: true, align: 'left' },
      { header: 'Đơn vị kê khai', key: 'don_vi_ke_khai', width: 22, align: 'left' },
      { header: 'Học phần / Hoạt động (*)', key: 'hoc_phan_hoat_dong', width: 36, isYellow: true, align: 'left' },
      { header: 'Lớp HP / Mã đợt', key: 'ma_lop_hp', width: 18, align: 'center' },
      { header: 'Tổng tiết QC (*)', key: 'tong_tiet_qc', width: 16, isYellow: true, align: 'right' },
      { header: 'Đơn giá / tiết (VNĐ)', key: 'don_gia_tiet', width: 18, align: 'right' },
      { header: 'Tổng thù lao (VNĐ) (*)', key: 'tong_thu_lao', width: 20, isYellow: true, align: 'right' },
      { header: 'Thuế TNCN 10% (VNĐ)', key: 'thue_tncn', width: 18, align: 'right' },
      { header: 'Thực nhận (VNĐ) (*)', key: 'thuc_nhan', width: 20, isYellow: true, align: 'right' },
      { header: 'Số tài khoản', key: 'so_tai_khoan', width: 18, align: 'center' },
      { header: 'Ngân hàng', key: 'ngan_hang', width: 22, align: 'left' },
      { header: 'Đợt thanh toán', key: 'dot_thanh_toan', width: 22, align: 'center' },
      { header: 'Trạng thái', key: 'trang_thai', width: 16, align: 'center' },
    ];

    const dataRows = records.map((r, idx) => [
      idx + 1,
      r.maGV || '',
      stripAcademicTitle(r.hoTen || ''),
      r.hocHamHocVi || '',
      r.khoaBoMon || '',
      r.phongBanQuanLy === 'dao_tao' ? 'Phòng Đào tạo' : r.phongBanQuanLy === 'khao_thi' ? 'TT Khảo thí' : r.phongBanQuanLy === 'tuyen_sinh' ? 'Phòng Tuyển sinh' : r.phongBanQuanLy === 'nckh' ? 'Phòng QL NCKH' : r.phongBanQuanLy === 'do_an' ? 'Bộ phận Đồ án' : r.phongBanQuanLy === 'co_van_hoc_tap' ? 'Phòng CTSV' : 'Ban Thanh tra',
      r.tenHocPhan || '',
      r.maLopHocPhan || '—',
      Number(r.tongTietQC) || 0,
      Number(r.donGiaTiet) || 150000,
      Number(r.tongTienThuLao) || 0,
      Number(r.thueTNCN) || 0,
      Number(r.thucNhan) || 0,
      r.soTaiKhoan || '—',
      r.nganHang || '—',
      r.dotThanhToan || periodLabel,
      r.trangThai === 'hop_le' ? 'Hợp lệ' : r.trangThai === 'da_so_hoa' ? 'Đã duyệt chi' : r.trangThai === 'trung_lap' ? 'Trùng lịch' : 'Cần đối soát',
    ]);

    const sumQC = records.reduce((s, r) => s + (Number(r.tongTietQC) || 0), 0);
    const sumThuLao = records.reduce((s, r) => s + (Number(r.tongTienThuLao) || 0), 0);
    const sumThue = records.reduce((s, r) => s + (Number(r.thueTNCN) || 0), 0);
    const sumThucNhan = records.reduce((s, r) => s + (Number(r.thucNhan) || 0), 0);

    const summaryRow = [
      `TỔNG CỘNG (${records.length} bản ghi)`,
      '', '', '', '', '', '', '',
      sumQC, '', sumThuLao, sumThue, sumThucNhan,
      '', '', '', ''
    ];

    const ws = createStyledWorksheet(
      `BẢNG KÊ TỔNG HỢP THANH TOÁN THÙ LAO TOÀN TRƯỜNG (${periodLabel.toUpperCase()})`,
      columns,
      dataRows.length > 0 ? dataRows : [['Chưa có bản ghi nào']],
      dataRows.length > 0 ? summaryRow : undefined
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Bang_Ke_Tong_Hop');
    saveWorkbookToFile(wb, `Bang_Ke_Tong_Hop_Thanh_Toan_Toan_Truong_TDU_2026_2027.xlsx`);
  }
};

/**
 * XUẤT FILE EXCEL BẢNG TỔNG HỢP THANH TOÁN 6 CHUYÊN MỤC TOÀN TRƯỜNG:
 * 1. Giờ giảng | 2. NCKH | 3. Tuyển sinh | 4. Coi/chấm/ra đề thi | 5. Cố vấn HT | 6. Công tác khác
 */
export const exportTotalPaymentDataExcel = (
  rawSummaries: LecturerPaymentSummary[],
  currentPeriodName: string = 'Học kỳ 1 2026-2027'
) => {
  const periodLabel = currentPeriodName || 'Học kỳ 1 2026-2027';
  const summaries = Array.isArray(rawSummaries) ? rawSummaries : [];
  const wb = XLSX.utils.book_new();

  const columns: TemplateColumn[] = [
    { header: 'STT', key: 'stt', width: 6, align: 'center' },
    { header: 'Mã GV (*)', key: 'ma_gv', width: 14, isYellow: true, align: 'center' },
    { header: 'Họ và tên Giảng viên (*)', key: 'ho_va_ten', width: 28, isYellow: true, align: 'left' },
    { header: 'Học hàm / Học vị (*)', key: 'hoc_ham_hoc_vi', width: 16, isYellow: true, align: 'center' },
    { header: 'Khoa / Đơn vị (*)', key: 'khoa_don_vi', width: 26, isYellow: true, align: 'left' },
    { header: 'Số CCCD', key: 'so_cccd', width: 18, align: 'center' },
    { header: 'Số tài khoản', key: 'so_tai_khoan', width: 18, align: 'center' },
    { header: 'Ngân hàng', key: 'ngan_hang', width: 22, align: 'left' },
    { header: '1. Giờ giảng (VNĐ)', key: 'gio_giang_vnd', width: 18, align: 'right' },
    { header: '2. NCKH (VNĐ)', key: 'nckh_vnd', width: 18, align: 'right' },
    { header: '3. Tuyển sinh (VNĐ)', key: 'tuyen_sinh_vnd', width: 18, align: 'right' },
    { header: '4. Coi/chấm/ra đề (VNĐ)', key: 'khao_thi_vnd', width: 18, align: 'right' },
    { header: '5. Cố vấn HT (VNĐ)', key: 'co_van_vnd', width: 18, align: 'right' },
    { header: '6. Công tác khác (VNĐ)', key: 'cong_tac_khac_vnd', width: 20, align: 'right' },
    { header: 'Tổng tiết QC (*)', key: 'tong_tiet_qc', width: 16, isYellow: true, align: 'right' },
    { header: 'Tổng thù lao gộp (VNĐ) (*)', key: 'tong_thu_lao_gop', width: 22, isYellow: true, align: 'right' },
    { header: 'Thuế TNCN 10% (VNĐ)', key: 'thue_tncn_10', width: 18, align: 'right' },
    { header: 'Tổng thực nhận (VNĐ) (*)', key: 'tong_thuc_nhan', width: 22, isYellow: true, align: 'right' },
    { header: 'Xác nhận của GV', key: 'xac_nhan_gv', width: 20, align: 'center' },
    { header: 'Tình trạng thanh toán', key: 'tinh_trang_thanh_toan', width: 22, align: 'center' },
  ];

  const dataRows = summaries.map((s, idx) => [
    idx + 1,
    s.maGV,
    stripAcademicTitle(s.hoTen),
    s.hocHamHocVi,
    s.khoaBoMon,
    s.soCCCD || '',
    s.soTaiKhoan || '',
    s.nganHang || '',
    s.daoTaoAmount,
    s.nckhAmount,
    s.tuyenSinhAmount,
    s.khaoThiAmount,
    s.coVanHocTapAmount,
    (s.congTacKhacAmount || 0) + (s.doAnAmount || 0),
    s.tongQC,
    s.tongThuLao,
    s.thueTNCN,
    s.thucNhan,
    s.confirmationStatus === 'confirmed' ? 'Đã đồng ý xác nhận' : s.confirmationStatus === 'disputed' ? 'Có khiếu nại' : 'Chờ GV kiểm tra',
    s.paymentStatus === 'paid' ? 'Đã thanh toán (UNC)' : 'Chờ chi trả'
  ]);

  const sumDaoTao = summaries.reduce((s, r) => s + (r.daoTaoAmount || 0), 0);
  const sumNCKH = summaries.reduce((s, r) => s + (r.nckhAmount || 0), 0);
  const sumTS = summaries.reduce((s, r) => s + (r.tuyenSinhAmount || 0), 0);
  const sumKhaoThi = summaries.reduce((s, r) => s + (r.khaoThiAmount || 0), 0);
  const sumCVHT = summaries.reduce((s, r) => s + (r.coVanHocTapAmount || 0), 0);
  const sumKhac = summaries.reduce((s, r) => s + ((r.congTacKhacAmount || 0) + (r.doAnAmount || 0)), 0);
  const sumQC = summaries.reduce((s, r) => s + (r.tongQC || 0), 0);
  const sumGop = summaries.reduce((s, r) => s + (r.tongThuLao || 0), 0);
  const sumThue = summaries.reduce((s, r) => s + (r.thueTNCN || 0), 0);
  const sumThucNhan = summaries.reduce((s, r) => s + (r.thucNhan || 0), 0);

  const summaryRow = [
    `TỔNG CỘNG TOÀN TRƯỜNG (${summaries.length} giảng viên)`,
    '', '', '', '', '', '', '',
    sumDaoTao, sumNCKH, sumTS, sumKhaoThi, sumCVHT, sumKhac,
    sumQC, sumGop, sumThue, sumThucNhan,
    '', ''
  ];

  const ws = createStyledWorksheet(
    `BẢNG TỔNG HỢP THANH TOÁN THÙ LAO 6 CHUYÊN MỤC - TRƯỜNG ĐẠI HỌC TÂY ĐÔ (${periodLabel.toUpperCase()})`,
    columns,
    dataRows.length > 0 ? dataRows : [['Chưa có dữ liệu']],
    dataRows.length > 0 ? summaryRow : undefined
  );

  XLSX.utils.book_append_sheet(wb, ws, 'Tong_Hop_Thanh_Toan');
  saveWorkbookToFile(wb, `Bang_Tong_Hop_Thanh_Toan_6_Chuyen_Muc_TDU_2026_2027.xlsx`);
};
