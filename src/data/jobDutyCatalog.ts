/**
 * Danh mục Bảng cấu hình Mã Công việc (Mã CV) & Hệ số giờ quy đổi chuẩn
 * Dành cho mục "Công tác khác" của Trường Đại học Tây Đô (TDU)
 *
 * Lưu ý:
 * - Các mảng lớn đã có module chuyên trách (Thanh toán giờ giảng, NCKH, Tuyển sinh,
 *   Coi thi chấm thi, Cố vấn học tập) KHÔNG nằm trong danh mục này để tránh trùng lặp 100%.
 * - Danh mục này quản lý các công tác do Khoa chuyên môn, Ban ĐBCL và Phòng thí nghiệm phụ trách.
 */

export interface JobDutyItem {
  id: string;
  stt: number;
  maCV: string;
  tenCV: string;
  nhomCV: string;
  dieuKien: string;
  heSoQuyDoi: number;
  donViQuanLy: 'khoa' | 'dbcl' | 'phong_thi_nghiem' | 'khac';
  trangThai: 'active' | 'inactive';
  ghiChu?: string;
}

export const INITIAL_JOB_DUTIES: JobDutyItem[] = [
  // 1. Thực tập & Thực tế chuyên môn (Khoa phụ trách)
  {
    id: 'cv-1',
    stt: 1,
    maCV: 'HDTT',
    tenCV: 'Hướng dẫn thực tập tốt nghiệp / thực tế chuyên môn',
    nhomCV: 'Thực tập',
    dieuKien: '1 ngày / 1 giáo viên',
    heSoQuyDoi: 2.0,
    donViQuanLy: 'khoa',
    trangThai: 'active',
    ghiChu: 'Theo kế hoạch đi thực tập của Khoa chuyên môn',
  },
  {
    id: 'cv-2',
    stt: 2,
    maCV: 'TTC1',
    tenCV: 'Thực tập tốt nghiệp - Chấm 1',
    nhomCV: 'Thực tập',
    dieuKien: '1 sinh viên',
    heSoQuyDoi: 4.0,
    donViQuanLy: 'khoa',
    trangThai: 'active',
    ghiChu: 'Chấm báo cáo thực tập tốt nghiệp',
  },
  {
    id: 'cv-3',
    stt: 3,
    maCV: 'TTC2',
    tenCV: 'Thực tập tốt nghiệp - Chấm 2',
    nhomCV: 'Thực tập',
    dieuKien: '1 sinh viên',
    heSoQuyDoi: 1.0,
    donViQuanLy: 'khoa',
    trangThai: 'active',
    ghiChu: 'Chấm độc lập lần 2',
  },

  // 2. Đồ án môn học, Niên luận & Chuyên đề (Khoa phụ trách)
  {
    id: 'cv-4',
    stt: 4,
    maCV: 'HDBT',
    tenCV: 'Hướng dẫn bài tập lớn',
    nhomCV: 'Đồ án - Chuyên đề',
    dieuKien: '3 sinh viên',
    heSoQuyDoi: 1.0,
    donViQuanLy: 'khoa',
    trangThai: 'active',
    ghiChu: 'Hướng dẫn bài tập lớn các học phần chuyên ngành',
  },
  {
    id: 'cv-5',
    stt: 5,
    maCV: 'DAC1',
    tenCV: 'Đồ án môn học - Chấm 1',
    nhomCV: 'Đồ án - Chuyên đề',
    dieuKien: '3 sinh viên',
    heSoQuyDoi: 3.0,
    donViQuanLy: 'khoa',
    trangThai: 'active',
    ghiChu: 'Chấm chính đồ án môn học',
  },
  {
    id: 'cv-6',
    stt: 6,
    maCV: 'DAC2',
    tenCV: 'Đồ án môn học - Chấm 2',
    nhomCV: 'Đồ án - Chuyên đề',
    dieuKien: '3 sinh viên',
    heSoQuyDoi: 1.0,
    donViQuanLy: 'khoa',
    trangThai: 'active',
    ghiChu: 'Chấm phản biện / chéo đồ án',
  },
  {
    id: 'cv-7',
    stt: 7,
    maCV: 'CDC1',
    tenCV: 'Chuyên đề năm 3 - Chấm 1',
    nhomCV: 'Đồ án - Chuyên đề',
    dieuKien: '3 sinh viên',
    heSoQuyDoi: 5.0,
    donViQuanLy: 'khoa',
    trangThai: 'active',
    ghiChu: 'Chấm chuyên đề thực tập / nghiên cứu năm 3',
  },
  {
    id: 'cv-8',
    stt: 8,
    maCV: 'CDC2',
    tenCV: 'Chuyên đề năm 3 - Chấm 2',
    nhomCV: 'Đồ án - Chuyên đề',
    dieuKien: '3 sinh viên',
    heSoQuyDoi: 1.0,
    donViQuanLy: 'khoa',
    trangThai: 'active',
  },
  {
    id: 'cv-9',
    stt: 9,
    maCV: 'NLC1',
    tenCV: 'Niên luận - Chấm 1',
    nhomCV: 'Đồ án - Chuyên đề',
    dieuKien: '1 sinh viên',
    heSoQuyDoi: 4.0,
    donViQuanLy: 'khoa',
    trangThai: 'active',
    ghiChu: 'Chấm niên luận ngành',
  },
  {
    id: 'cv-10',
    stt: 10,
    maCV: 'NLC2',
    tenCV: 'Niên luận - Chấm 2',
    nhomCV: 'Đồ án - Chuyên đề',
    dieuKien: '1 sinh viên',
    heSoQuyDoi: 1.5,
    donViQuanLy: 'khoa',
    trangThai: 'active',
  },
  {
    id: 'cv-11',
    stt: 11,
    maCV: 'HDDA',
    tenCV: 'Đồ án, khóa luận tốt nghiệp - Hướng dẫn',
    nhomCV: 'Đồ án - Chuyên đề',
    dieuKien: '1 sinh viên',
    heSoQuyDoi: 12.0,
    donViQuanLy: 'khoa',
    trangThai: 'active',
    ghiChu: 'Hướng dẫn chính đồ án / khóa luận tốt nghiệp ĐH',
  },
  {
    id: 'cv-12',
    stt: 12,
    maCV: 'PBDA',
    tenCV: 'Đồ án, khóa luận tốt nghiệp - Phản biện',
    nhomCV: 'Đồ án - Chuyên đề',
    dieuKien: '1 sinh viên',
    heSoQuyDoi: 3.0,
    donViQuanLy: 'khoa',
    trangThai: 'active',
    ghiChu: 'Đọc và chấm phản biện khóa luận',
  },
  {
    id: 'cv-13',
    stt: 13,
    maCV: 'CTHD',
    tenCV: 'Hội đồng bảo vệ Đồ án/Khóa luận - Chủ tịch',
    nhomCV: 'Đồ án - Chuyên đề',
    dieuKien: '1 sinh viên',
    heSoQuyDoi: 1.5,
    donViQuanLy: 'khoa',
    trangThai: 'active',
    ghiChu: 'Chủ tịch hội đồng chấm bảo vệ tốt nghiệp',
  },
  {
    id: 'cv-14',
    stt: 14,
    maCV: 'TKHD',
    tenCV: 'Hội đồng bảo vệ Đồ án/Khóa luận - Thư ký',
    nhomCV: 'Đồ án - Chuyên đề',
    dieuKien: '1 sinh viên',
    heSoQuyDoi: 1.0,
    donViQuanLy: 'khoa',
    trangThai: 'active',
    ghiChu: 'Thư ký hội đồng chấm bảo vệ tốt nghiệp',
  },
  {
    id: 'cv-15',
    stt: 15,
    maCV: 'HTL1',
    tenCV: 'Hướng dẫn chấm tiểu luận - Chấm 1',
    nhomCV: 'Đồ án - Chuyên đề',
    dieuKien: '1 sinh viên',
    heSoQuyDoi: 6.0,
    donViQuanLy: 'khoa',
    trangThai: 'active',
  },
  {
    id: 'cv-16',
    stt: 16,
    maCV: 'HTL2',
    tenCV: 'Hướng dẫn chấm tiểu luận - Chấm 2',
    nhomCV: 'Đồ án - Chuyên đề',
    dieuKien: '1 sinh viên',
    heSoQuyDoi: 1.5,
    donViQuanLy: 'khoa',
    trangThai: 'active',
  },

  // 3. Quản lý phòng thí nghiệm & Sinh hoạt học thuật
  {
    id: 'cv-17',
    stt: 17,
    maCV: 'QPTN',
    tenCV: 'Quản lý phòng thí nghiệm / xưởng thực hành',
    nhomCV: 'Quản lý PTN',
    dieuKien: '1 năm',
    heSoQuyDoi: 40.0,
    donViQuanLy: 'phong_thi_nghiem',
    trangThai: 'active',
    ghiChu: 'Định mức phụ cấp kiêm nhiệm quản lý lab',
  },
  {
    id: 'cv-18',
    stt: 18,
    maCV: 'CTDG',
    tenCV: 'Công tác dự giờ giảng viên',
    nhomCV: 'Học thuật & Giảng dạy',
    dieuKien: '1 lần',
    heSoQuyDoi: 1.0,
    donViQuanLy: 'khoa',
    trangThai: 'active',
    ghiChu: 'Có biên bản dự giờ được Khoa thông qua',
  },
  {
    id: 'cv-19',
    stt: 19,
    maCV: 'TGHG',
    tenCV: 'Tham gia hội giảng cấp Khoa / Trường',
    nhomCV: 'Học thuật & Giảng dạy',
    dieuKien: '1 lần',
    heSoQuyDoi: 1.0,
    donViQuanLy: 'khoa',
    trangThai: 'active',
    ghiChu: 'Hội giảng nâng cao nghiệp vụ sư phạm',
  },

  // 4. Ban Đảm bảo chất lượng & Kiểm định
  {
    id: 'cv-20',
    stt: 20,
    maCV: 'DBTT',
    tenCV: 'Tổ trưởng Tổ ĐBCL Khoa / Bộ môn',
    nhomCV: 'Đảm bảo chất lượng',
    dieuKien: '1 năm',
    heSoQuyDoi: 24.0,
    donViQuanLy: 'dbcl',
    trangThai: 'active',
    ghiChu: 'Quyết định bổ nhiệm của Hiệu trưởng',
  },
  {
    id: 'cv-21',
    stt: 21,
    maCV: 'DBTV',
    tenCV: 'Thành viên Tổ ĐBCL Khoa / Bộ môn',
    nhomCV: 'Đảm bảo chất lượng',
    dieuKien: '1 năm',
    heSoQuyDoi: 18.0,
    donViQuanLy: 'dbcl',
    trangThai: 'active',
    ghiChu: 'Thành viên tham gia kiểm định chất lượng',
  },
  {
    id: 'cv-22',
    stt: 22,
    maCV: 'HDCT',
    tenCV: 'Hội đồng ĐBCL Trường - Chủ tịch',
    nhomCV: 'Đảm bảo chất lượng',
    dieuKien: '1 năm',
    heSoQuyDoi: 20.0,
    donViQuanLy: 'dbcl',
    trangThai: 'active',
  },
  {
    id: 'cv-23',
    stt: 23,
    maCV: 'HPCT',
    tenCV: 'Hội đồng ĐBCL Trường - Phó Chủ tịch',
    nhomCV: 'Đảm bảo chất lượng',
    dieuKien: '1 năm',
    heSoQuyDoi: 15.0,
    donViQuanLy: 'dbcl',
    trangThai: 'active',
  },
  {
    id: 'cv-24',
    stt: 24,
    maCV: 'HDTK',
    tenCV: 'Hội đồng ĐBCL Trường - Thư ký',
    nhomCV: 'Đảm bảo chất lượng',
    dieuKien: '1 năm',
    heSoQuyDoi: 15.0,
    donViQuanLy: 'dbcl',
    trangThai: 'active',
  },
  {
    id: 'cv-25',
    stt: 25,
    maCV: 'HDTV',
    tenCV: 'Hội đồng ĐBCL Trường - Thành viên',
    nhomCV: 'Đảm bảo chất lượng',
    dieuKien: '1 năm',
    heSoQuyDoi: 10.0,
    donViQuanLy: 'dbcl',
    trangThai: 'active',
  },
  {
    id: 'cv-26',
    stt: 26,
    maCV: 'CTKD',
    tenCV: 'Đóng góp công tác tự đánh giá & kiểm định CTĐT',
    nhomCV: 'Đảm bảo chất lượng',
    dieuKien: '1 năm',
    heSoQuyDoi: 1.0,
    donViQuanLy: 'dbcl',
    trangThai: 'active',
    ghiChu: 'Đóng góp minh chứng và báo cáo tự đánh giá',
  },
];

/**
 * Tra cứu thông tin Mã công việc
 */
export function findJobDutyByCode(maCV: string, catalog = INITIAL_JOB_DUTIES): JobDutyItem | undefined {
  const code = maCV.trim().toUpperCase();
  return catalog.find((c) => c.maCV.toUpperCase() === code);
}

/**
 * Tính số giờ quy chuẩn tự động dựa trên Mã CV và Số lượng
 */
export function calculateDutyHours(maCV: string, soLuong: number, catalog = INITIAL_JOB_DUTIES): number {
  const item = findJobDutyByCode(maCV, catalog);
  if (!item || !soLuong || isNaN(soLuong)) return 0;
  return Number((item.heSoQuyDoi * soLuong).toFixed(2));
}

