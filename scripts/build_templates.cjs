const XLSX = require('xlsx-js-style');
const fs = require('fs');
const path = require('path');

const thinBorder = {
  top: { style: 'thin', color: { rgb: '000000' } },
  bottom: { style: 'thin', color: { rgb: '000000' } },
  left: { style: 'thin', color: { rgb: '000000' } },
  right: { style: 'thin', color: { rgb: '000000' } },
};

function createStyledWorksheet(title, columns, sampleRows) {
  const sheetData = [
    [], // Dòng 1: Đệm
    [title], // Dòng 2: Tiêu đề biểu mẫu
    [], // Dòng 3: Đệm
    columns.map((c) => c.header), // Dòng 4: Tiêu đề cột
    columns.map((c) => c.key),    // Dòng 5: Mã trường hệ thống
    ...sampleRows,                // Dòng 6+: Dữ liệu mẫu
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  ws['!merges'] = [
    { s: { r: 1, c: 0 }, e: { r: 1, c: columns.length - 1 } },
  ];

  ws['!rows'] = [
    { hpx: 12 },
    { hpx: 36 },
    { hpx: 12 },
    { hpx: 32 },
    { hpx: 20 },
    ...sampleRows.map(() => ({ hpx: 24 })),
  ];

  ws['!cols'] = columns.map((c) => ({ wch: c.width }));

  const lastColLetter = XLSX.utils.encode_col(columns.length - 1);
  const lastRowNum = 5 + sampleRows.length;
  ws['!autofilter'] = { ref: `A4:${lastColLetter}${lastRowNum}` };

  // Tiêu đề Dòng 2
  ws['A2'].s = {
    font: { name: 'Times New Roman', sz: 14, bold: true, color: { rgb: '000000' } },
    alignment: { horizontal: 'center', vertical: 'center' },
  };

  for (let c = 0; c < columns.length; c++) {
    const colLetter = XLSX.utils.encode_col(c);
    const colDef = columns[c];

    // Dòng 4
    const cellR4 = ws[`${colLetter}4`];
    if (cellR4) {
      cellR4.s = {
        font: { name: 'Times New Roman', sz: 11, bold: true, color: { rgb: '000000' } },
        fill: colDef.isYellow
          ? { fgColor: { rgb: 'FFFF99' } }
          : { fgColor: { rgb: 'FFFFFF' } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: thinBorder,
      };
    }

    // Dòng 5
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

    // Dòng 6+
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
}

const currentPeriodName = 'Học kỳ 1 2026-2027';

const templates = [
  {
    fileName: 'Mau_Thanh_Toan_Gio_Giang_TDU_2026_2027.xlsx',
    aliases: ['Mau_Thanh_Toan_Gio_Giang_TDU.xlsx', 'Mau_Ke_Khai_Tong_Hop_TDU.xlsx'],
    title: `MẪU THÊM KHỐI LƯỢNG GIẢNG DẠY & THÙ LAO (${currentPeriodName.toUpperCase()})`,
    columns: [
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
    ],
    sampleRows: [
      [1, 'TDU00128', 'Mai Như Long', 'Phát triển Hệ thống Thông tin Doanh nghiệp', 'CNTT14A', 65, 1, 45, 30, 1.25, 1.0, 'Lý thuyết', 'TS', 'Khoa Công nghệ thông tin', '102874639912', 'VietinBank CN Cần Thơ', currentPeriodName, 'Giảng dạy lý thuyết chính khóa'],
      [2, 'TDU00128', 'Mai Như Long', 'Phát triển Hệ thống Thông tin Doanh nghiệp (Lab)', 'CNTT14A_LAB', 65, 2, 30, 30, 1.35, 1.1, 'Thực hành', 'TS', 'Khoa Công nghệ thông tin', '102874639912', 'VietinBank CN Cần Thơ', currentPeriodName, 'Thực hành phòng máy 2 nhóm'],
      [3, 'TDU00089', 'Trần Thanh Dũng', 'Dược lý học đại cương', 'DUOC12A', 80, 1, 60, 45, 1.30, 1.0, 'Lý thuyết', 'PGS.TS', 'Khoa Dược - Điều dưỡng', '101994827110', 'Vietcombank CN Cần Thơ', currentPeriodName, 'Giảng dạy chính khóa'],
      [4, 'TDU00318', 'Nguyễn Thị Cẩm Tú', 'Quản trị Chiến lược Doanh nghiệp', 'QTKD15B', 55, 1, 45, 45, 1.15, 1.0, 'Lý thuyết', 'ThS', 'Khoa Quản trị kinh doanh', '190334812903', 'Techcombank CN Cần Thơ', currentPeriodName, 'Giảng dạy chính khóa'],
      [5, 'TDU00215', 'Nguyễn Văn Hải', 'Lập trình Ứng dụng Di động Flutter', 'CNTT15A', 50, 1, 45, 45, 1.15, 1.0, 'Lý thuyết', 'ThS', 'Khoa Công nghệ thông tin', '103847291048', 'BIDV CN Tây Đô', currentPeriodName, 'Giảng dạy chính khóa'],
    ]
  },
  {
    fileName: 'Mau_Khao_Thi_Coi_Cham_Thi_TDU_2026_2027.xlsx',
    aliases: ['Mau_Khao_Thi_Coi_Cham_Thi_TDU.xlsx'],
    title: `MẪU THÊM CÔNG TÁC RA ĐỀ, COI THI & CHẤM THI (${currentPeriodName.toUpperCase()})`,
    columns: [
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
    ],
    sampleRows: [
      [1, 'TDU00128', 'Mai Như Long', '18/09/1982', '092082001245', 'TS', 'Khoa Công nghệ thông tin', 'Hệ thống thông tin doanh nghiệp', 4, 120, 2, currentPeriodName, 'Coi thi ca sáng + Chấm thi tự luận'],
      [2, 'TDU00215', 'Nguyễn Văn Hải', '10/05/1987', '092087003412', 'ThS', 'Khoa Công nghệ thông tin', 'Lập trình Web nâng cao', 6, 95, 1, currentPeriodName, 'Coi thi học kỳ tập trung'],
      [3, 'TDU00089', 'Trần Thanh Dũng', '12/03/1975', '092075001188', 'PGS.TS', 'Khoa Dược - Điều dưỡng', 'Dược lý học đại cương', 3, 150, 2, currentPeriodName, 'Ra đề tự luận + chấm thi'],
    ]
  },
  {
    fileName: 'Mau_Do_An_Khoa_Luan_Tot_Nghiep_TDU_2026_2027.xlsx',
    aliases: ['Mau_Do_An_Khoa_Luan_Tot_Nghiep_TDU.xlsx'],
    title: `MẪU THÊM HƯỚNG DẪN & CHẤM ĐỒ ÁN, KHÓA LUẬN TỐT NGHIỆP (${currentPeriodName.toUpperCase()})`,
    columns: [
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
    ],
    sampleRows: [
      [1, 'TDU00128', 'Mai Như Long', 'TS', 'Khoa Công nghệ thông tin', 'Hướng dẫn Khóa luận tốt nghiệp đại học ngành HTTT', 'KLTN_HTTT_K14', 2, 0, 'Hướng dẫn chính', 24, '12 giờ quy đổi / 1 SV'],
      [2, 'TDU00128', 'Mai Như Long', 'TS', 'Khoa Công nghệ thông tin', 'Phản biện Khóa luận tốt nghiệp đại học K14', 'PB_KLTN_K14', 0, 3, 'Cán bộ phản biện', 9, '3 giờ quy đổi / 1 SV'],
      [3, 'TDU00089', 'Trần Thanh Dũng', 'PGS.TS', 'Khoa Dược - Điều dưỡng', 'Chủ tịch Hội đồng khóa luận tốt nghiệp Dược sĩ', 'HD_KLTN_DUOC', 0, 4, 'Chủ tịch hội đồng', 6, '1.5 giờ quy đổi / 1 SV'],
    ]
  },
  {
    fileName: 'Mau_NCKH_Sau_Dai_Hoc_TDU_2026_2027.xlsx',
    aliases: ['Mau_NCKH_Sau_Dai_Hoc_TDU.xlsx'],
    title: `MẪU THÊM HOẠT ĐỘNG NGHIÊN CỨU KHOA HỌC & ĐỀ TÀI (${currentPeriodName.toUpperCase()})`,
    columns: [
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
    ],
    sampleRows: [
      [1, 'TDU00089', 'Trần Thanh Dũng', 'PGS.TS', 'Khoa Dược - Điều dưỡng', 'Chủ nhiệm đề tài NCKH cấp Bộ: "Khảo sát và chiết xuất hoạt chất thảo dược"', 'Đề tài NCKH cấp Bộ', 'NCKH_DUOC_01', 220, 'Hoàn thành', 'Chủ nhiệm đề tài (Nghiệm thu Đạt)'],
      [2, 'TDU00089', 'Trần Thanh Dũng', 'PGS.TS', 'Khoa Dược - Điều dưỡng', 'Bài báo khoa học ISI/Scopus: "Bioactive compounds from Mekong Delta medicinal plants"', 'Bài báo quốc tế ISI/Scopus (Q1)', 'ISSN 1872-2040', 180, 'Hoàn thành', 'Tác giả chính (First Author)'],
      [3, 'TDU00128', 'Mai Như Long', 'TS', 'Khoa Công nghệ thông tin', 'Bài báo khoa học quốc tế: "AI and Cloud Architectures in Modern University Management"', 'Bài báo quốc tế ISI/Scopus (Q1)', 'NCKH_SCOPUS_01', 180, 'Hoàn thành', 'Tác giả chính (Q1)'],
      [4, 'TDU00128', 'Mai Như Long', 'TS', 'Khoa Công nghệ thông tin', 'Hướng dẫn 02 Học viên cao học bảo vệ thành công Luận văn Thạc sĩ ngành HTTT', 'Hướng dẫn luận văn Thạc sĩ', 'SDH_CH_HTTT12', 40, 'Hoàn thành', 'Cán bộ hướng dẫn chính'],
      [5, 'TDU00318', 'Nguyễn Thị Cẩm Tú', 'ThS', 'Khoa Quản trị kinh doanh', 'Bài báo: "Nghiên cứu các yếu tố ảnh hưởng đến quyết định mua sắm trực tuyến"', 'Bài báo tạp chí chuyên ngành', 'NCKH_KTE_02', 60, 'Hoàn thành', 'Tác giả'],
    ]
  },
  {
    fileName: 'Mau_Co_Van_Hoc_Tap_TDU_2026_2027.xlsx',
    aliases: ['Mau_Co_Van_Hoc_Tap_TDU.xlsx'],
    title: `MẪU THÊM CÔNG TÁC CỐ VẤN HỌC TẬP (${currentPeriodName.toUpperCase()})`,
    columns: [
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
    ],
    sampleRows: [
      [1, 'TDU00128', 'Mai Như Long', 'TS', 'Khoa Công nghệ thông tin', 'CNTT14A', 65, currentPeriodName, 20, 180000, 'Theo Quyết định phân công Cố vấn học tập TDU'],
      [2, 'TDU00318', 'Nguyễn Thị Cẩm Tú', 'ThS', 'Khoa Quản trị kinh doanh', 'QTKD15B', 55, currentPeriodName, 20, 150000, 'Theo Quyết định phân công Cố vấn học tập TDU'],
    ]
  },
  {
    fileName: 'Mau_Tuyen_Sinh_Truyen_Thong_TDU_2026_2027.xlsx',
    aliases: ['Mau_Tuyen_Sinh_Truyen_Thong_TDU.xlsx'],
    title: `MẪU THÊM CÔNG TÁC TƯ VẤN TUYỂN SINH & HƯỚNG NGHIỆP (${currentPeriodName.toUpperCase()})`,
    columns: [
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
    ],
    sampleRows: [
      [1, 'TDU00318', 'Nguyễn Thị Cẩm Tú', '22/11/1988', '092088005671', 'ThS', 'Khoa Quản trị kinh doanh', 'Tư vấn hướng nghiệp tuyển sinh ĐBSCL', 5, 'Cụm trường THPT Hậu Giang & Sóc Trăng', currentPeriodName, 'Tư vấn trực tiếp tại các trường THPT'],
      [2, 'TDU00215', 'Nguyễn Văn Hải', '10/05/1987', '092087003412', 'ThS', 'Khoa Công nghệ thông tin', 'Trực gian hàng tư vấn Ngày hội tuyển sinh', 3, 'Khuôn viên Trường ĐH Cần Thơ & ĐH Tây Đô', currentPeriodName, 'Tư vấn khối ngành Kỹ thuật - Công nghệ'],
    ]
  },
  {
    fileName: 'Mau_Cong_Tac_Khac_TDU_2026_2027.xlsx',
    sheetName: 'Mau_Kekhai_Cong_Tac_Khac',
    aliases: ['Mau_Cong_Tac_Kiem_Nhiem_DBCL_TDU.xlsx'],
    title: `MẪU THÊM CÔNG TÁC KHÁC & QUY ĐỔI GIỜ CHUẨN (${currentPeriodName.toUpperCase()})`,
    columns: [
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
    ],
    sampleRows: [
      [1, 'TDU00128', 'Mai Như Long', 'TS', 'Khoa Công nghệ thông tin', 'HDTT', 'Hướng dẫn thực tập tốt nghiệp / thực tế', 15, '1 ngày / 1 GV', 'Đợt 1 (15 ngày)', 30, '2 giờ quy đổi / 1 ngày'],
      [2, 'TDU00128', 'Mai Như Long', 'TS', 'Khoa Công nghệ thông tin', 'DAC1', 'Đồ án môn học - Chấm 1', 6, '3 sinh viên', currentPeriodName, 6, '3 giờ / 3 SV'],
      [3, 'TDU00128', 'Mai Như Long', 'TS', 'Khoa Công nghệ thông tin', 'NLC1', 'Niên luận ngành - Chấm 1', 2, '1 sinh viên', currentPeriodName, 8, '4 giờ / 1 SV'],
      [4, 'TDU00128', 'Mai Như Long', 'TS', 'Khoa Công nghệ thông tin', 'HDDA', 'Đồ án, khóa luận tốt nghiệp - Hướng dẫn', 2, '1 sinh viên', currentPeriodName, 24, '12 giờ / 1 SV'],
      [5, 'TDU00215', 'Nguyễn Văn Hải', 'ThS', 'Khoa Công nghệ thông tin', 'QPTN', 'Quản lý phòng thí nghiệm máy tính Lab 03', 1, '1 năm', 'Cả năm học (QĐ số 118/QĐ-ĐHTĐ)', 40, '40 giờ quy đổi / 1 năm'],
      [6, 'TDU00089', 'Trần Thanh Dũng', 'PGS.TS', 'Khoa Dược - Điều dưỡng', 'CTDG', 'Chủ tịch Hội đồng đánh giá ĐBCL', 1, '1 hội đồng', 'Cả năm học (QĐ số 45/QĐ-ĐHTĐ)', 20, '20 giờ quy chuẩn / 1 năm'],
    ],
    extraSheets: [
      {
        sheetName: 'DanhMuc_TraCuu_MaCV',
        title: 'BẢNG TRA CỨU MÃ CÔNG VIỆC & HỆ SỐ QUY ĐỔI GIỜ CHUẨN - TRƯỜNG ĐH TÂY ĐÔ',
        columns: [
          { header: 'STT', key: 'stt', width: 6, align: 'center' },
          { header: 'Mã công việc (*)', key: 'ma_cv', width: 16, isYellow: true, align: 'center' },
          { header: 'Tên nhiệm vụ / Hoạt động', key: 'ten_cv', width: 45, align: 'left' },
          { header: 'Nhóm công tác', key: 'nhom_cv', width: 22, align: 'center' },
          { header: 'Định mức / Điều kiện tính', key: 'dieu_kien', width: 22, align: 'center' },
          { header: 'Hệ số giờ quy đổi', key: 'he_so_gio', width: 18, isYellow: true, align: 'right' },
          { header: 'Đơn vị quản lý', key: 'don_vi_quan_ly', width: 20, align: 'center' },
          { header: 'Ghi chú áp dụng', key: 'ghi_chu', width: 35, align: 'left' },
        ],
        sampleRows: [
          [1, 'HDTT', 'Hướng dẫn thực tập tốt nghiệp / thực tế chuyên môn', 'Thực tập', '1 ngày / 1 giáo viên', 2.0, 'Khoa chuyên môn', 'Theo kế hoạch đi thực tập của Khoa'],
          [2, 'TTC1', 'Thực tập tốt nghiệp - Chấm 1', 'Thực tập', '1 sinh viên', 4.0, 'Khoa chuyên môn', 'Chấm báo cáo thực tập tốt nghiệp'],
          [3, 'TTC2', 'Thực tập tốt nghiệp - Chấm 2', 'Thực tập', '1 sinh viên', 1.0, 'Khoa chuyên môn', 'Chấm độc lập lần 2'],
          [4, 'HDBT', 'Hướng dẫn bài tập lớn', 'Đồ án - Chuyên đề', '3 sinh viên', 1.0, 'Khoa chuyên môn', 'Bài tập lớn học phần chuyên ngành'],
          [5, 'DAC1', 'Đồ án môn học - Chấm 1', 'Đồ án - Chuyên đề', '3 sinh viên', 3.0, 'Khoa chuyên môn', 'Chấm chính đồ án môn học'],
          [6, 'DAC2', 'Đồ án môn học - Chấm 2', 'Đồ án - Chuyên đề', '3 sinh viên', 1.0, 'Khoa chuyên môn', 'Chấm phản biện / chéo'],
          [7, 'CDC1', 'Chuyên đề năm 3 - Chấm 1', 'Đồ án - Chuyên đề', '3 sinh viên', 5.0, 'Khoa chuyên môn', 'Chấm chuyên đề thực tập / nghiên cứu'],
          [8, 'CDC2', 'Chuyên đề năm 3 - Chấm 2', 'Đồ án - Chuyên đề', '3 sinh viên', 1.0, 'Khoa chuyên môn', 'Chấm độc lập lần 2'],
          [9, 'NLC1', 'Niên luận - Chấm 1', 'Đồ án - Chuyên đề', '1 sinh viên', 4.0, 'Khoa chuyên môn', 'Chấm niên luận ngành'],
          [10, 'NLC2', 'Niên luận - Chấm 2', 'Đồ án - Chuyên đề', '1 sinh viên', 1.5, 'Khoa chuyên môn', 'Chấm độc lập lần 2'],
          [11, 'HDDA', 'Đồ án, khóa luận tốt nghiệp - Hướng dẫn', 'Đồ án - Chuyên đề', '1 sinh viên', 12.0, 'Khoa chuyên môn', 'Hướng dẫn chính đồ án / khóa luận TN'],
          [12, 'PBDA', 'Đồ án, khóa luận tốt nghiệp - Phản biện', 'Đồ án - Chuyên đề', '1 sinh viên', 3.0, 'Khoa chuyên môn', 'Đọc và chấm phản biện'],
          [13, 'CTHD', 'Hội đồng bảo vệ Đồ án/Khóa luận - Chủ tịch', 'Đồ án - Chuyên đề', '1 sinh viên', 1.5, 'Khoa chuyên môn', 'Chủ tịch HĐ chấm bảo vệ tốt nghiệp'],
          [14, 'TKHD', 'Hội đồng bảo vệ Đồ án/Khóa luận - Thư ký', 'Đồ án - Chuyên đề', '1 sinh viên', 1.0, 'Khoa chuyên môn', 'Thư ký HĐ bảo vệ tốt nghiệp'],
          [15, 'HTL1', 'Hội giảng / Thi giảng viên dạy giỏi - Cấp Khoa', 'Đảm bảo chất lượng', '1 tiết giảng', 1.0, 'Ban ĐBCL', 'Ban giám khảo hội thi giảng cấp Khoa'],
          [16, 'HTL2', 'Hội giảng / Thi giảng viên dạy giỏi - Cấp Trường', 'Đảm bảo chất lượng', '1 tiết giảng', 2.0, 'Ban ĐBCL', 'Ban giám khảo cấp Trường'],
          [17, 'QPTN', 'Quản lý phòng thí nghiệm, thực hành, vườn dược', 'Phòng thí nghiệm', '1 năm', 40.0, 'Phòng Thí nghiệm', 'Theo quyết định phụ trách PTN'],
          [18, 'CTDG', 'Hội đồng Đánh giá ĐBCL Khoa - Chủ tịch', 'Đảm bảo chất lượng', '1 hội đồng', 20.0, 'Ban ĐBCL', 'Chủ trì tổ chức ĐBCL đơn vị'],
          [19, 'TGHG', 'Tham gia dự giờ đồng nghiệp theo kế hoạch', 'Đảm bảo chất lượng', '1 tiết', 0.5, 'Ban ĐBCL', 'Biên bản dự giờ lưu hồ sơ ĐBCL'],
          [20, 'DBTT', 'Tổ Đảm bảo chất lượng Khoa - Tổ trưởng', 'Đảm bảo chất lượng', '1 năm', 18.0, 'Ban ĐBCL', 'Nhiệm vụ ĐBCL thường trực'],
          [21, 'DBTV', 'Tổ Đảm bảo chất lượng Khoa - Thành viên', 'Đảm bảo chất lượng', '1 năm', 12.0, 'Ban ĐBCL', 'Thành viên tổ ĐBCL Khoa'],
          [22, 'HDCT', 'Biên soạn, rà soát CTĐT mới - Chủ trì', 'Đổi mới CTĐT', '1 chương trình', 50.0, 'Khoa chuyên môn', 'Đề cương & CTĐT nghiệm thu'],
          [23, 'HPCT', 'Biên soạn, rà soát CTĐT mới - Thành viên', 'Đổi mới CTĐT', '1 chương trình', 25.0, 'Khoa chuyên môn', 'Thành viên ban soạn thảo'],
          [24, 'HDTK', 'Hội đồng ĐBCL Trường - Thường trực', 'Đảm bảo chất lượng', '1 năm', 24.0, 'Ban ĐBCL', 'Thường trực HĐ ĐBCL Trường'],
          [25, 'HDTV', 'Hội đồng ĐBCL Trường - Thành viên', 'Đảm bảo chất lượng', '1 năm', 10.0, 'Ban ĐBCL', 'Thành viên HĐ ĐBCL Trường'],
          [26, 'CTKD', 'Đóng góp công tác tự đánh giá & kiểm định CTĐT', 'Đảm bảo chất lượng', '1 năm', 1.0, 'Ban ĐBCL', 'Minh chứng và báo cáo tự đánh giá'],
        ]
      }
    ]
  }
];

const targetDirs = [
  path.join(__dirname, '..', 'public', 'templates'),
  path.join(__dirname, '..', 'dist', 'templates')
];

for (const dir of targetDirs) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

for (const item of templates) {
  const wb = XLSX.utils.book_new();
  const ws = createStyledWorksheet(item.title, item.columns, item.sampleRows);
  XLSX.utils.book_append_sheet(wb, ws, item.sheetName || 'Template');

  if (item.extraSheets) {
    for (const es of item.extraSheets) {
      const wsExtra = createStyledWorksheet(es.title, es.columns, es.sampleRows);
      XLSX.utils.book_append_sheet(wb, wsExtra, es.sheetName);
    }
  }

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

  for (const dir of targetDirs) {
    const mainPath = path.join(dir, item.fileName);
    fs.writeFileSync(mainPath, buf);
    console.log('Saved:', mainPath);

    if (item.aliases) {
      for (const alias of item.aliases) {
        const aliasPath = path.join(dir, alias);
        fs.writeFileSync(aliasPath, buf);
        console.log('Saved alias:', aliasPath);
      }
    }
  }
}

console.log('ALL TEMPLATES GENERATED SUCCESSFULLY!');

