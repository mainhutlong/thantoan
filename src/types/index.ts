export type DataQuality =
  | 'all'
  | 'hop_le'
  | 'khong_hop_le'
  | 'trung_lap'
  | 'da_so_hoa'
  | 'chua_day_du'
  | 'chua_so_hoa';

export type UserRole =
  | 'accountant_specialist' // Chuyên viên tổng hợp
  | 'dean_faculty'         // Đại diện Phòng/Khoa/Trung tâm
  | 'lecturer'             // Giảng viên
  | 'approver'             // Người kiểm tra và phê duyệt
  | 'admin';               // Quản trị viên hệ thống

export type PeriodStatus =
  | 'draft'       // Đang kê khai
  | 'reviewing'   // Đang đối soát & xử lý phản hồi
  | 'submitted'   // Đã trình phê duyệt
  | 'locked';     // Đã chốt kỳ & khóa thanh toán

export interface PaymentPeriod {
  id: string;
  name: string; // e.g. "Học kỳ 1 2026-2027"
  semester: string; // "Học kỳ 1"
  academicYear: string; // "2026 - 2027"
  status: 'active' | 'locked' | 'archived';
  submissionDeadline?: string;
  isCurrent?: boolean;
  totalRecords?: number;
  note?: string;
}

export type DepartmentUnit = 'all' | 'dao_tao' | 'khao_thi' | 'do_an' | 'tuyen_sinh' | 'nckh' | 'co_van_hoc_tap' | 'cong_tac_khac';

export interface FeedbackItem {
  id: string;
  teachingRecordId: string;
  maGV: string;
  hoTen: string;
  tenHocPhan: string;
  noiDung: string;
  loaiPhanHoi: 'sai_so_tiet' | 'thieu_lop' | 'sai_he_so' | 'sai_don_gia' | 'khac';
  ngayGui: string;
  trangThai: 'cho_xu_ly' | 'da_xac_minh' | 'da_dieu_chinh' | 'tu_choi';
  phanHoiXuLy?: string;
  nguoiXuLy?: string;
  ngayXuLy?: string;
}

export interface VbccRecord {
  id: string;
  tt: number;
  hoTen: string;
  ngaySinh: string;
  soCCCD: string;
  soHieuVbccDaCap: string;
  soHieuVbccCapLai: string;
  soVaoSoGocMoi: string;
  noiDungCapLaiChinhSua: string;
  nguoiThucHien: string;
  trangThai: DataQuality;
  ghiChu?: string;
}

export interface TeachingRecord {
  id: string;
  tt: number;
  maGV: string;
  hoTen: string;
  ngaySinh: string;
  soCCCD: string;
  hocHamHocVi: string;
  khoaBoMon: string;
  phongBanQuanLy: DepartmentUnit; // 'dao_tao' | 'khao_thi' | 'tuyen_sinh' | 'nckh' | 'cong_tac_khac'
  loaiHoatDong: string;          // Giờ giảng dạy, Coi thi, Chấm thi, Tư vấn tuyển sinh...
  tenHocPhan: string;
  maLopHocPhan: string;
  soTinChi: number;
  soTietLT: number;
  soTietTH: number;
  heSoLop: number;
  tongTietQC: number;
  donGiaTiet: number;
  tongTienThuLao: number;
  thueTNCN: number;
  thucNhan: number;
  soTaiKhoan?: string;
  nganHang?: string;
  nguoiThucHien: string;
  trangThai: DataQuality;
  dotThanhToan: string;
  ghiChu?: string;
  hasFeedback?: boolean;

  // 1. Fields for Teaching (Giờ giảng dạy: Lý thuyết và Thực hành, thực tập)
  phanLoaiGiangDay?: 'ly_thuyet' | 'thuc_hanh_thuc_tap'; // Môn giảng dạy chia làm 2: Lý thuyết và Thực hành, thực tập
  soSinhVien?: number;      // Số SV
  soNhom?: number;          // Số nhóm
  soGioMonHoc?: number;     // Số giờ môn học
  soGioThucGiang?: number;  // Số giờ thực giảng
  heSoLopNhom?: number;     // Hệ số lớp, nhóm
  heSoTinChi?: number;      // Hệ số tín chỉ
  soGioQuyChuan?: number;   // Số giờ quy chuẩn (= Số giờ thực giảng * heSoLopNhom * heSoTinChi)

  // 2. Fields for Research (Nghiên cứu khoa học)
  noiDungNCKH?: string;     // Nội dung
  theLoaiNCKH?: string;     // Thể loại (ISI/Scopus, Bài báo trong nước, Đề tài cấp trường, Giáo trình, Hướng dẫn ThS...)
  soGioQCNCKH?: number;     // Số giờ quy chuẩn NCKH
  mucDoHoanThanhNCKH?: 'hoan_thanh' | 'khong_hoan_thanh'; // Mức độ hoàn thành hoặc không hoàn thành
  dinhMucNCKH?: number;     // Định mức NCKH theo ngạch chức danh (vd: 150 giờ)

  // 3. Fields for Exam & Evaluation (Coi thi, Chấm thi, Ra đề)
  nhomCongViec?: string;    // Nhóm công việc: Ra đề thi, Duyệt đề thi, Coi thi kết thúc HP, Chấm thi tự luận, Chấm thi thực hành...
  maCV?: string;            // Mã CV (ví dụ: CV_RA_DE, CV_COI_THI, CV_CHAM_THI, CV_DUYET_DE...)
  tenCongViec?: string;     // Tên công việc
  dieuKien?: string;        // Điều kiện (Tiêu chuẩn quy cách: Phòng thi >= 30 SV, Chuẩn đề kèm ma trận & đáp án...)
  quyDoiSoGio?: number;     // Quy đổi số giờ (định mức giờ quy đổi cho 1 đơn vị)
  soLuong?: number;         // Số lượng (số ca, số bài, số đề)
  ghiChuThongTin?: string;  // Ghi chú thông tin (phòng thi, môn thi, hình thức...)
  tongSoGioTheoCV?: number; // Tổng số giờ theo công việc (= Quy đổi số giờ * Số lượng)

  // 4. Fields for Thesis & Projects (Đồ án, Khóa luận tốt nghiệp)
  soDeTaiHuongDan?: number; // Số đề tài / sinh viên hướng dẫn
  soLuotChamHoiDong?: number; // Số lượt chấm / phản biện / hội đồng
  vaiTroDoAn?: string;      // Hướng dẫn, Phản biện, Chủ tịch, Thư ký

  // 5. Fields for Advisor (Cố vấn học tập)
  lopCVHT?: string;
  soLopCVHT?: number;
  xepLoaiCVHT?: string;     // Xuất sắc, Hoàn thành tốt, Hoàn thành
  soHocKyCVHT?: number;

  // 6. Fields for Admissions (Tuyển sinh)
  soNgayCongTac?: number;
  diaBanTuyenSinh?: string;

  // 7. Fields for Other / Quality Assurance (Công tác kiêm nhiệm & ĐBCL)
  nhiemVuKiemNhiem?: string;
  soNhiemVuKiemNhiem?: number;
}

export interface PaymentRuleConfig {
  rates: { [key: string]: number };
  theoryCoeff: number;
  practiceCoeff: number;
  taxRate: number;
}

export type AppMode = 'teaching_payment' | 'vbcc_image';

export interface LecturerPaymentSummary {
  maGV: string;
  hoTen: string;
  ngaySinh?: string;
  soCCCD?: string;
  hocHamHocVi: string;
  khoaBoMon: string;
  soTaiKhoan?: string;
  nganHang?: string;
  // Giờ giảng chi tiết (LT + TH)
  tongGioLyThuyet: number;
  tongGioThucHanh: number;
  tongGioGiangDay: number;
  daoTaoAmount: number;
  daoTaoQC: number;
  // Coi thi chấm thi ra đề
  tongGioKhaoThi: number;
  khaoThiAmount: number;
  khaoThiQC: number;
  // NCKH
  tongGioNCKH: number;
  dinhMucNCKH: number;
  mucDoHoanThanhNCKH: 'hoan_thanh' | 'khong_hoan_thanh';
  nckhAmount: number;
  nckhQC: number;
  // Tuyển sinh & Khác
  tuyenSinhAmount: number;
  tuyenSinhQC: number;
  // Cố vấn học tập (CVHT)
  coVanHocTapAmount: number;
  coVanHocTapQC: number;
  congTacKhacAmount: number;
  congTacKhacQC: number;
  // Totals
  tongQC: number;
  tongThuLao: number;
  thueTNCN: number;
  thucNhan: number;
  // Lecturer confirmation status
  confirmationStatus: 'pending' | 'confirmed' | 'disputed';
  confirmationDate?: string;
  feedbackNote?: string;
  // Finance payout status
  paymentStatus: 'unpaid' | 'paid';
  paymentDate?: string;
  transactionRef?: string;
}

export type AccountRoleType =
  | 'admin'
  | 'upload_dao_tao'
  | 'upload_khao_thi'
  | 'upload_tuyen_sinh'
  | 'upload_nckh'
  | 'upload_co_van_hoc_tap'
  | 'upload_cong_tac_khac'
  | 'tai_chinh'
  | 'giang_vien';

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: AccountRoleType;
  departmentName: string;
  assignedModule: string;
  maGV?: string;
  status: 'active' | 'locked';
  lastLogin?: string;
}

// ==========================================
// THÔNG TIN HỒ SƠ NGƯỜI DÙNG / NHÂN SỰ THEO FILE CHUẨN CỦA TRƯỜNG
// ==========================================
export interface SystemUserProfile {
  id: string;
  stt: number;
  hoTen: string;
  chucVu: string;
  donVi: string;
  maNhanSu: string;
  gioiTinh: 'Nam' | 'Nữ';
  ngaySinh: string;
  hocHam: string; // 'Giáo sư' | 'Phó Giáo sư' | ''
  hocVi: string; // 'Tiến sĩ' | 'Thạc sĩ' | 'Đại học' | 'Bác sĩ CKII'...
  chuyenMon: string;
  namTuyenDung: number | string;
  ngayKyHDLD: string;
  namTotNghiep: number | string;
  namCongNhanPGS?: number | string;
  namCongNhanGS?: number | string;
  ccsp: string; // Chứng chỉ sư phạm
  anhVan: string; // B2, IELTS 6.5, C1...
  tinHoc: string; // Chuẩn CNTT cơ bản, Nâng cao, MOS...
  kiemNhiem: string;
  donViKiemNhiem: string;
  trangThai?: 'hoat_dong' | 'tam_khoa' | 'nghi_viec';
}

// Phân quyền theo Group
export interface RoleGroupPermission {
  id: string;
  name: string;
  code: string;
  description: string;
  memberCount: number;
  members?: string[];
  permissions: {
    moduleId: string;
    moduleName: string;
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
    export: boolean;
  }[];
}

// Nhật ký hệ thống (Audit Logs)
export interface SystemAuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userCode: string;
  ipAddress: string;
  action: string;
  module: string;
  detail: string;
  status: 'success' | 'warning' | 'error';
}

// Cấu hình hệ thống
export interface SystemConfiguration {
  academicYear: string;
  semester: string;
  submissionDeadline: string;
  isAutoLock: boolean;
  baseQuotaStandard: number;
  baseQuotaFacultyHeadReduction: number;
  baseQuotaDeptHeadReduction: number;
  baseQuotaDeanReduction: number;
  researchStandardQuota: number;
  rates: {
    professor: number;
    associateProfessor: number;
    doctor: number;
    master: number;
    bachelor: number;
  };
  examRates: {
    invigilation: number;
    markingWritten: number;
    markingMultipleChoice: number;
    questionMaking: number;
  };
  notifyEmailOnFeedback: boolean;
  notifySmsOnDisbursement: boolean;
  sessionTimeoutMinutes: number;
  require2FA: boolean;
}
