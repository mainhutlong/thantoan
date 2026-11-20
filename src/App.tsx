import React, { useState, useMemo, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { FilterSection, FilterState } from './components/FilterSection';
import { StatusBar, StatusCounts } from './components/StatusBar';
import { ActionBar } from './components/ActionBar';
import { DataTable, ColumnFilters } from './components/DataTable';
import { AddRecordModal } from './components/AddRecordModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { MinutesModal } from './components/MinutesModal';
import { ColumnSettingsModal } from './components/ColumnSettingsModal';
import { FeedbackModal } from './components/FeedbackModal';
import { FeedbackListModal } from './components/FeedbackListModal';
import { HomePage } from './components/HomePage';
import { PaymentRulesModal } from './components/PaymentRulesModal';
import { StatisticsDashboard } from './components/StatisticsDashboard';
import { LecturerProfilesPage } from './components/LecturerProfilesPage';
import { FeedbackPageView } from './components/FeedbackPageView';
import { MinutesPageView } from './components/MinutesPageView';
import { TotalPaymentPage } from './components/TotalPaymentPage';
import { LecturerVerificationPage } from './components/LecturerVerificationPage';
import { FinanceDisbursementPage } from './components/FinanceDisbursementPage';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AccountPermissionPage } from './components/AccountPermissionPage';
import { TeachingScheduleReport } from './components/TeachingScheduleReport';
import { ResearchScheduleReport } from './components/ResearchScheduleReport';
import { ExamScheduleReport } from './components/ExamScheduleReport';
import { ThesisScheduleReport } from './components/ThesisScheduleReport';
import { AdvisorScheduleReport } from './components/AdvisorScheduleReport';
import { AdmissionScheduleReport } from './components/AdmissionScheduleReport';
import { OtherDutiesScheduleReport } from './components/OtherDutiesScheduleReport';
import { generateDepartmentExcelTemplate, exportDepartmentDataExcel, saveWorkbookToFile } from './utils/excelTemplateGenerator';
import { SystemUsersPage } from './components/SystemUsersPage';
import { SystemRoleGroupPage } from './components/SystemRoleGroupPage';
import { SystemConfigPage, DEFAULT_PERIODS } from './components/SystemConfigPage';
import { SystemAuditLogPage } from './components/SystemAuditLogPage';
import { UserProfileView } from './components/UserProfileView';
import { TduSsoLoginModal } from './components/TduSsoLoginModal';
import { LoginPage } from './components/LoginPage';
import { useConfirmDelete } from './context/ConfirmDialogContext';
import { INITIAL_VBCC_DATA, INITIAL_TEACHING_DATA, INITIAL_ACCOUNTS } from './data/mockData';
import {
  VbccRecord,
  TeachingRecord,
  AppMode,
  DataQuality,
  UserRole,
  PeriodStatus,
  FeedbackItem,
  PaymentRuleConfig,
  DepartmentUnit,
  UserAccount,
  PaymentPeriod,
} from './types';

export default function App() {
  const { confirmDelete } = useConfirmDelete();
  // App Mode & Persona Role
  const appMode: AppMode = 'teaching_payment';
  // Authentication gate state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const userStr = localStorage.getItem('tdu_auth_user');
      const tokenStr = localStorage.getItem('tdu_token');
      return !!(userStr && tokenStr);
    } catch {
      return false;
    }
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const userStr = localStorage.getItem('tdu_auth_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        const roles: string[] = Array.isArray(u.roles) ? u.roles : (u.vaiTroCode ? [u.vaiTroCode] : []);
        const uEmail = (u.email || '').toLowerCase().trim();
        const uCode = (u.maNhanSu || '').toLowerCase().trim();
        const uDonVi = (u.donVi || '').toLowerCase().trim();
        const uChucVu = (u.chucVu || '').toLowerCase().trim();

        let isCustomAdmin = false;
        try {
          const customRoles = JSON.parse(localStorage.getItem('tdu_custom_role_members') || '{}');
          const adminMembers = customRoles['quan_tri_vien_he_thong'] || [];
          if (
            adminMembers.some(
              (m: any) =>
                (m.email && m.email.toLowerCase().trim() === uEmail) ||
                (m.code && m.code.toLowerCase().trim() === uCode)
            )
          ) {
            isCustomAdmin = true;
          }
          const fullRolesCache = JSON.parse(localStorage.getItem('tdu_roles_state_v3') || '[]');
          const adminObj = fullRolesCache.find((r: any) => r.id === 'quan_tri_vien_he_thong' || r.code === 'QUAN_TRI_VIEN_HE_THONG' || r.id === 1);
          if (adminObj && Array.isArray(adminObj.members)) {
            if (
              adminObj.members.some(
                (m: any) =>
                  (m.email && m.email.toLowerCase().trim() === uEmail) ||
                  (m.code && m.code.toLowerCase().trim() === uCode)
              )
            ) {
              isCustomAdmin = true;
            }
          }
        } catch {}

        if (
          uEmail === 'mnlong@tdu.edu.vn' ||
          uEmail === 'lvlinh@tdu.edu.vn' ||
          uEmail === 'cvdanh@tdu.edu.vn' ||
          uCode === '01067017' ||
          roles.includes('QUAN_TRI_VIEN_HE_THONG') ||
          roles.includes('SUPER_ADMIN') ||
          isCustomAdmin
        ) {
          return 'admin';
        }

        if (
          roles.includes('BAN_GIAM_HIEU') ||
          roles.includes('HOI_DONG_TRUONG') ||
          roles.includes('HOI_DONG_CO_VAN') ||
          roles.includes('LANH_DAO_KHOA') ||
          uDonVi.includes('ban giám hiệu') ||
          uDonVi.includes('hội đồng')
        ) {
          return 'approver';
        }

        if (
          roles.some((r) =>
            r.includes('DAO_TAO') ||
            r.includes('TAI_CHINH') ||
            r.includes('KHAO_THI') ||
            r.includes('TO_CHUC') ||
            r.includes('DBCLGD') ||
            r.includes('QTTB') ||
            r.includes('CTCT') ||
            r.includes('TUYEN_SINH')
          ) ||
          uDonVi.includes('đào tạo') ||
          uDonVi.includes('tài chính') ||
          uDonVi.includes('khảo thí') ||
          uDonVi.includes('tổ chức') ||
          uDonVi.includes('hành chính') ||
          uChucVu.includes('chuyên viên')
        ) {
          return 'accountant_specialist';
        }

        if (
          roles.some((r) => r.startsWith('KHOA_') || r.includes('QLKH')) ||
          uDonVi.includes('khoa') ||
          uDonVi.includes('qlkh')
        ) {
          return 'dean_faculty';
        }

        return 'lecturer';
      }
    } catch {}
    return 'lecturer';
  });

  const [periodStatus, setPeriodStatus] = useState<PeriodStatus>('draft');

  // Accounts & Permission management
  const [accounts, setAccounts] = useState<UserAccount[]>(INITIAL_ACCOUNTS);
  const [currentAccount, setCurrentAccount] = useState<UserAccount>(() => {
    try {
      const userStr = localStorage.getItem('tdu_auth_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        const roles: string[] = Array.isArray(u.roles) ? u.roles : (u.vaiTroCode ? [u.vaiTroCode] : []);
        const uEmail = (u.email || '').toLowerCase().trim();
        const uCode = (u.maNhanSu || '').toLowerCase().trim();
        let isCustomAdmin = false;
        try {
          const customRoles = JSON.parse(localStorage.getItem('tdu_custom_role_members') || '{}');
          const adminMembers = customRoles['quan_tri_vien_he_thong'] || [];
          if (
            adminMembers.some(
              (m: any) =>
                m.email?.toLowerCase().trim() === uEmail ||
                m.code?.toLowerCase().trim() === uCode
            )
          ) {
            isCustomAdmin = true;
          }
          const fullRolesCache = JSON.parse(localStorage.getItem('tdu_roles_state_v3') || '[]');
          const adminObj = fullRolesCache.find((r: any) => r.id === 'quan_tri_vien_he_thong' || r.code === 'QUAN_TRI_VIEN_HE_THONG' || r.id === 1);
          if (adminObj && Array.isArray(adminObj.members)) {
            if (
              adminObj.members.some(
                (m: any) =>
                  m.email?.toLowerCase().trim() === uEmail ||
                  m.code?.toLowerCase().trim() === uCode
              )
            ) {
              isCustomAdmin = true;
            }
          }
        } catch {}

        const uDonVi = (u.donVi || '').toLowerCase().trim();
        const uChucVu = (u.chucVu || '').toLowerCase().trim();

        let mappedRole: UserRole = 'lecturer';
        if (
          uEmail === 'mnlong@tdu.edu.vn' ||
          uEmail === 'lvlinh@tdu.edu.vn' ||
          uEmail.includes('lvlinh') ||
          uEmail === 'cvdanh@tdu.edu.vn' ||
          uCode === '01067017' ||
          roles.includes('QUAN_TRI_VIEN_HE_THONG') ||
          roles.includes('SUPER_ADMIN') ||
          isCustomAdmin
        ) {
          mappedRole = 'admin';
        } else if (
          roles.includes('BAN_GIAM_HIEU') ||
          roles.includes('HOI_DONG_TRUONG') ||
          roles.includes('HOI_DONG_CO_VAN') ||
          roles.includes('LANH_DAO_KHOA') ||
          uDonVi.includes('ban giám hiệu') ||
          uDonVi.includes('hội đồng')
        ) {
          mappedRole = 'approver';
        } else if (
          roles.some((r) =>
            r.includes('DAO_TAO') ||
            r.includes('TAI_CHINH') ||
            r.includes('KHAO_THI') ||
            r.includes('TO_CHUC') ||
            r.includes('DBCLGD') ||
            r.includes('QTTB') ||
            r.includes('CTCT') ||
            r.includes('TUYEN_SINH')
          ) ||
          uDonVi.includes('đào tạo') ||
          uDonVi.includes('tài chính') ||
          uDonVi.includes('khảo thí') ||
          uDonVi.includes('tổ chức') ||
          uDonVi.includes('hành chính') ||
          uChucVu.includes('chuyên viên')
        ) {
          mappedRole = 'accountant_specialist';
        } else if (
          roles.some((r) => r.startsWith('KHOA_') || r.includes('QLKH')) ||
          uDonVi.includes('khoa') ||
          uDonVi.includes('qlkh')
        ) {
          mappedRole = 'dean_faculty';
        } else {
          mappedRole = 'lecturer';
        }

        return {
          id: String(u.id || '1'),
          username: (u.email || 'mnlong@tdu.edu.vn').split('@')[0],
          fullName: u.hoTen || u.name || 'Người dùng TDU',
          email: u.email || 'canbo@tdu.edu.vn',
          role: mappedRole as any,
          departmentName: u.donVi || 'Trường Đại học Tây Đô',
          chucVu: u.chucVu || 'Giảng viên',
          assignedModule: u.chucVu || 'Giảng viên',
          maGV: u.maNhanSu || 'TDU00128',
          status: 'active',
          lastLogin: new Date().toLocaleString('vi-VN'),
          roles: mappedRole === 'admin' && !roles.includes('QUAN_TRI_VIEN_HE_THONG') ? [...roles, 'QUAN_TRI_VIEN_HE_THONG'] : roles,
        };
      }
    } catch {}
    return INITIAL_ACCOUNTS[0];
  });
  const [selectedLecturerMa, setSelectedLecturerMa] = useState<string>('TDU00128');

  // Sidebar state - Default: Open on Desktop (>=1024px), Closed on Mobile (<1024px)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  });
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>('trang_chu');

  // Department Unit Selection ('all' | 'dao_tao' | 'khao_thi' | 'tuyen_sinh' | 'nckh' | 'cong_tac_khac')
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentUnit>('dao_tao');

  // NCKH Sub-Tabs ('all' | 'bai_bao' | 'seminar' | 'de_tai')
  const [nckhTab, setNckhTab] = useState<'all' | 'bai_bao' | 'seminar' | 'de_tai'>('all');

  // Top Filter state - Khoa, Năm học, Học kỳ, Tên giảng viên, Môn giảng dạy
  const [filters, setFilters] = useState<FilterState>({
    department: 'all',
    faculty: 'all',
    academicYear: '2026 - 2027',
    semester: 'Học kỳ 1',
    paymentPhase: 'all',
    degreeLevel: 'all',
    activityType: 'all',
    dataQuality: 'all',
    lecturerName: '',
    subjectName: '',
  });

  // Payment periods management (Lưu trữ và phân loại dữ liệu theo đợt)
  const [periods, setPeriods] = useState<PaymentPeriod[]>(DEFAULT_PERIODS);
  const [currentPeriodId, setCurrentPeriodId] = useState<string>('period-hk1-2026-2027');
  const currentPeriodName = periods.find((p) => p.id === currentPeriodId)?.name || 'Học kỳ 1 2026-2027';

  // Column level filter inputs
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({
    hoTen: '',
    ngaySinh: '',
    soCCCD: '',
    col5: '',
    col6: '',
    col7: '',
    col8: '',
    nguoiThucHien: '',
  });

  // Data lists
  const [teachingList, setTeachingList] = useState<TeachingRecord[]>(INITIAL_TEACHING_DATA);

  // Sync NCKH data from MySQL DB API
  const fetchNckhFromDb = useCallback(async () => {
    try {
      const res = await fetch('/api/nckh');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const dbRecords: TeachingRecord[] = json.data.map((row: any) => ({
          id: `nckh-${(row.loai_hoat_dong || 'bb').toLowerCase()}-${row.ban_ghi_id}`,
          tt: row.ban_ghi_id,
          maGV: row.ma_giang_vien,
          hoTen: row.ho_ten,
          ngaySinh: '01/01/1980',
          soCCCD: '',
          hocHamHocVi: row.hoc_vi || 'ThS',
          khoaBoMon: row.don_vi || 'Trường Đại học Tây Đô',
          phongBanQuanLy: 'nckh',
          loaiHoatDong:
            row.loai_hoat_dong === 'BAI_BAO'
              ? 'Bài báo khoa học'
              : row.loai_hoat_dong === 'SEMINAR'
              ? 'Báo cáo Seminar'
              : 'Đề tài NCKH',
          tenHocPhan: row.ten_cong_trinh,
          maLopHocPhan: `NCKH_${row.ban_ghi_id}`,
          noiDungNCKH: row.ten_cong_trinh,
          theLoaiNCKH: row.phan_loai,
          soGioQCNCKH: Number(row.gio_quy_doi) || 0,
          tongTietQC: Number(row.gio_quy_doi) || 0,
          donGiaTiet: Number(row.don_gia) || 180000,
          tongTienThuLao: Number(row.thanh_tien) || Number(row.gio_quy_doi) * Number(row.don_gia),
          thueTNCN: Math.round((Number(row.thanh_tien) || 0) * 0.1),
          thucNhan: Math.round((Number(row.thanh_tien) || 0) * 0.9),
          trangThai: 'da_so_hoa',
          dotThanhToan: currentPeriodName,
          fileMinhChungUrl: row.file_minh_chung_url,
          tenFileMinhChung: row.ten_file_minh_chung,
          dungLuongFile: row.dung_luong_file,
          ngayUploadMinhChung: row.ngay_upload_minh_chung,
        }));

        setTeachingList((prev) => {
          const nonNckh = prev.filter((r) => r.phongBanQuanLy !== 'nckh');
          return [...nonNckh, ...dbRecords];
        });
      }
    } catch (err) {
      console.warn('Chưa thể kết nối API /api/nckh (chế độ offline mock):', err);
    }
  }, [currentPeriodName]);

  useEffect(() => {
    fetchNckhFromDb();
  }, [fetchNckhFromDb]);

  // Đồng bộ phân quyền từ MySQL Database qua API /api/roles
  useEffect(() => {
    fetch('/api/roles')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          try {
            const cached = localStorage.getItem('tdu_roles_state_v3');
            let parsed: any[] = [];
            if (cached) {
              try {
                parsed = JSON.parse(cached);
              } catch {}
            }
            if (!Array.isArray(parsed)) parsed = [];

            // 1. Cập nhật các vai trò hiện có trong parsed
            const updated = parsed.map((r: any) => {
              const fromApi = data.data.find(
                (d: any) =>
                  d.code?.toLowerCase() === r.code?.toLowerCase() ||
                  d.name?.toLowerCase() === r.name?.toLowerCase() ||
                  String(d.id) === String(r.id)
              );
              if (fromApi) {
                const apiMembers = Array.isArray(fromApi.members) ? fromApi.members : [];
                return {
                  ...r,
                  name: fromApi.name || r.name,
                  members: apiMembers,
                  disabledPermissions: Array.isArray(r.disabledPermissions) ? r.disabledPermissions : [],
                };
              }
              return r;
            });

            // 2. Tự động bổ sung các vai trò từ MySQL nếu chưa có trong parsed
            data.data.forEach((d: any) => {
              const alreadyExists = updated.some(
                (u: any) =>
                  u.code?.toLowerCase() === d.code?.toLowerCase() ||
                  String(u.id) === String(d.id) ||
                  u.name?.toLowerCase() === d.name?.toLowerCase()
              );
              if (!alreadyExists) {
                updated.push({
                  id: String(d.id),
                  name: d.name,
                  code: d.code,
                  description: d.description || `Nhóm vai trò ${d.name} trên hệ thống TDU.`,
                  dotColor: d.dotColor || '#2563eb',
                  badgeBg: d.badgeBg || '#eff6ff',
                  badgeText: d.badgeText || '#2563eb',
                  members: Array.isArray(d.members) ? d.members : [],
                  disabledPermissions: Array.isArray(d.disabledPermissions) ? d.disabledPermissions : [],
                });
              }
            });

            localStorage.setItem('tdu_roles_state_v3', JSON.stringify(updated));
          } catch {}

          const adminRole = data.data.find(
            (r: any) =>
              r.code === 'QUAN_TRI_VIEN_HE_THONG' ||
              r.id === 1 ||
              r.id === 'quan_tri_vien_he_thong'
          );
          if (adminRole && Array.isArray(adminRole.members)) {
            const myEmail = (currentAccount?.email || '').toLowerCase().trim();
            const myCode = (currentAccount?.maGV || '').toLowerCase().trim();
            const isMemberAdmin = adminRole.members.some(
              (m: any) =>
                (m.email && m.email.toLowerCase().trim() === myEmail) ||
                (m.code && m.code.toLowerCase().trim() === myCode) ||
                (m.id && String(m.id) === String(currentAccount?.id))
            );
            if (isMemberAdmin) {
              if (currentRole !== 'admin') {
                setCurrentRole('admin');
              }
              setCurrentAccount((prev) => {
                const existingRoles = (prev as any).roles || [];
                const updatedRoles = existingRoles.includes('QUAN_TRI_VIEN_HE_THONG')
                  ? existingRoles
                  : [...existingRoles, 'QUAN_TRI_VIEN_HE_THONG'];
                return {
                  ...prev,
                  role: 'admin' as any,
                  roles: updatedRoles,
                };
              });

              // Cập nhật tdu_auth_user trong localStorage
              try {
                const authStr = localStorage.getItem('tdu_auth_user');
                if (authStr) {
                  const authUser = JSON.parse(authStr);
                  if (
                    authUser.email?.toLowerCase().trim() === myEmail ||
                    authUser.maNhanSu?.toLowerCase().trim() === myCode
                  ) {
                    const rList = Array.isArray(authUser.roles) ? authUser.roles : [];
                    if (!rList.includes('QUAN_TRI_VIEN_HE_THONG')) {
                      authUser.roles = [...rList, 'QUAN_TRI_VIEN_HE_THONG'];
                      localStorage.setItem('tdu_auth_user', JSON.stringify(authUser));
                    }
                  }
                }
              } catch {}
            }
          }
        }
      })
      .catch((err) => {
        console.warn('Could not sync /api/roles on mount:', err);
      });
  }, [currentAccount?.email, currentAccount?.maGV]);

  // Selected row IDs for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination
  const [pageSize, setPageSize] = useState<number>(150);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Payment Rules Configuration state (Internal expenditure regulation of Tay Do University)
  const [paymentRules, setPaymentRules] = useState<PaymentRuleConfig>({
    rates: {
      'GS.TS': 260000,
      'PGS.TS': 220000,
      'TS': 180000,
      'ThS': 140000,
      'CN': 120000,
    },
    theoryCoeff: 1.0,
    practiceCoeff: 0.7,
    taxRate: 0.1,
  });

  // Lecturer Feedbacks State
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([
    {
      id: 'fb-1',
      teachingRecordId: 'tdu-tc-1',
      maGV: 'TDU00128',
      hoTen: 'TS. Mai Như Long',
      tenHocPhan: 'Phát triển Hệ thống Thông tin Doanh nghiệp',
      loaiPhanHoi: 'sai_so_tiet',
      noiDung: 'Số tiết thực hành thực tế tại phòng lab máy 30 tiết thay vì 15 tiết. Đã có phiếu xác nhận ký duyệt của Ban chủ nhiệm Khoa CNTT.',
      ngayGui: '12/10/2026 14:30',
      trangThai: 'cho_xu_ly',
    },
    {
      id: 'fb-2',
      teachingRecordId: 'tdu-tc-5',
      maGV: 'TDU00512',
      hoTen: 'ThS. Đặng Thị Hồng Nhung',
      tenHocPhan: 'Tiếng Anh Giao tiếp Chuyên ngành 2',
      loaiPhanHoi: 'sai_he_so',
      noiDung: 'Lớp NNA16B có 75 sinh viên nên hệ số quy mô lớp theo quy chế chi tiêu TDU là 1.2 thay vì 1.1.',
      ngayGui: '11/10/2026 09:15',
      trangThai: 'da_xac_minh',
      phanHoiXuLy: 'Phòng Đào tạo đã đối chiếu danh sách thi thực tế 75 sinh viên và đồng ý áp dụng hệ số 1.2.',
      nguoiXuLy: 'Đại diện Phòng Đào tạo TDU',
      ngayXuLy: '12/10/2026',
    },
  ]);

  // Modal dialog states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<VbccRecord | TeachingRecord | null>(null);
  const [isAddingInline, setIsAddingInline] = useState<boolean>(false);
  const [inlineNotice, setInlineNotice] = useState<string | null>(null);
  const [isExcelImportOpen, setIsExcelImportOpen] = useState<boolean>(false);
  const [isSsoModalOpen, setIsSsoModalOpen] = useState<boolean>(false);

  const handleSsoLoginSuccess = (user: any) => {
    if (!user) return;
    const roles: string[] = Array.isArray(user.roles) ? user.roles : (user.vaiTroCode ? [user.vaiTroCode] : []);
    const emailLower = (user.email || '').toLowerCase().trim();
    const uCode = (user.maNhanSu || '').toLowerCase().trim();

    let isCustomAdmin = false;
    try {
      const customRoles = JSON.parse(localStorage.getItem('tdu_custom_role_members') || '{}');
      const adminMembers = customRoles['quan_tri_vien_he_thong'] || [];
      if (
        adminMembers.some(
          (m: any) =>
            m.email?.toLowerCase().trim() === emailLower ||
            m.code?.toLowerCase().trim() === uCode
        )
      ) {
        isCustomAdmin = true;
      }
      const fullRolesCache = JSON.parse(localStorage.getItem('tdu_roles_state_v3') || '[]');
      const adminObj = fullRolesCache.find((r: any) => r.id === 'quan_tri_vien_he_thong' || r.code === 'QUAN_TRI_VIEN_HE_THONG' || r.id === 1);
      if (adminObj && Array.isArray(adminObj.members)) {
        if (
          adminObj.members.some(
            (m: any) =>
              m.email?.toLowerCase().trim() === emailLower ||
              m.code?.toLowerCase().trim() === uCode
          )
        ) {
          isCustomAdmin = true;
        }
      }
    } catch {}

    let mappedRole: UserRole = 'lecturer';
    if (
      emailLower === 'mnlong@tdu.edu.vn' ||
      emailLower === 'cvdanh@tdu.edu.vn' ||
      uCode === '01067017' ||
      roles.includes('QUAN_TRI_VIEN_HE_THONG') ||
      roles.includes('SUPER_ADMIN') ||
      isCustomAdmin
    ) {
      mappedRole = 'admin';
    } else if (roles.includes('BAN_GIAM_HIEU') || roles.includes('LANH_DAO_KHOA') || user.vaiTroCode === 'truong_khoa' || user.vaiTroCode === 'truong_phong') {
      mappedRole = 'approver';
    } else if (
      roles.some((r) =>
        r.includes('DAO_TAO') ||
        r.includes('TAI_CHINH') ||
        r.includes('KHAO_THI') ||
        r.includes('TO_CHUC') ||
        r.includes('DBCLGD')
      ) ||
      (user.donVi || '').toLowerCase().includes('đào tạo') ||
      (user.donVi || '').toLowerCase().includes('tài chính') ||
      user.vaiTroCode === 'chuyen_vien'
    ) {
      mappedRole = 'accountant_specialist';
    } else if (roles.includes('PHONG_QLKH') || user.vaiTroCode === 'tro_ly') {
      mappedRole = 'dean_faculty';
    } else {
      mappedRole = 'lecturer';
    }

    const matchedAccount: UserAccount = {
      id: String(user.id || '1'),
      username: (user.email || 'canbo@tdu.edu.vn').split('@')[0],
      fullName: user.hoTen || user.name || 'Người dùng TDU',
      email: user.email || 'canbo@tdu.edu.vn',
      role: mappedRole as any,
      departmentName: user.donVi || 'Trường Đại học Tây Đô',
      chucVu: user.chucVu || 'Giảng viên',
      assignedModule: user.chucVu || 'Giảng viên',
      maGV: user.maNhanSu || 'TDU00128',
      status: 'active',
      lastLogin: new Date().toLocaleString('vi-VN'),
      roles: mappedRole === 'admin' && !roles.includes('QUAN_TRI_VIEN_HE_THONG') ? [...roles, 'QUAN_TRI_VIEN_HE_THONG'] : roles,
    };
    setCurrentAccount(matchedAccount);
    setCurrentRole(mappedRole);
    if (user.maNhanSu) {
      setSelectedLecturerMa(user.maNhanSu);
    }
    setIsAuthenticated(true);

    // Tự động định tuyến ban đầu thông minh theo phân quyền đơn vị
    const deptLower = (user.donVi || '').toLowerCase().trim();
    const isSuper =
      emailLower === 'mnlong@tdu.edu.vn' ||
      emailLower === 'cvdanh@tdu.edu.vn' ||
      uCode === '01067017' ||
      roles.includes('QUAN_TRI_VIEN_HE_THONG') ||
      roles.includes('SUPER_ADMIN') ||
      mappedRole === 'admin' ||
      isCustomAdmin;

    const isDaoTao = !isSuper && deptLower.includes('đào tạo');
    const isQLKH = !isSuper && (deptLower.includes('khoa học') || deptLower.includes('qlkh'));
    const isTaiChinh = !isSuper && (deptLower.includes('tài chính') || deptLower.includes('kế hoạch'));

    if (isDaoTao) {
      setActiveSidebarItem('ke_khai_upload');
      setSelectedDepartment('dao_tao');
    } else if (isQLKH) {
      setActiveSidebarItem('ke_khai_upload');
      setSelectedDepartment('nckh');
    } else if (isTaiChinh) {
      setActiveSidebarItem('tong_thanh_toan');
    } else if (!isSuper) {
      setActiveSidebarItem('tra_cuu_giang_vien');
    } else {
      setActiveSidebarItem('trang_chu');
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('tdu_auth_user');
      localStorage.removeItem('tdu_token');
    } catch {}
    setIsAuthenticated(false);
  };
  const [isAppendMode, setIsAppendMode] = useState<boolean>(false);
  const [isMinutesOpen, setIsMinutesOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  const [targetFeedbackRecord, setTargetFeedbackRecord] = useState<TeachingRecord | null>(null);
  const [isFeedbackListOpen, setIsFeedbackListOpen] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [selectedScheduleMaGV, setSelectedScheduleMaGV] = useState<string | null>(null);
  const [selectedResearchScheduleMaGV, setSelectedResearchScheduleMaGV] = useState<string | null>(null);
  const [selectedExamScheduleMaGV, setSelectedExamScheduleMaGV] = useState<string | null>(null);
  const [selectedThesisScheduleMaGV, setSelectedThesisScheduleMaGV] = useState<string | null>(null);
  const [selectedAdvisorScheduleMaGV, setSelectedAdvisorScheduleMaGV] = useState<string | null>(null);
  const [selectedAdmissionScheduleMaGV, setSelectedAdmissionScheduleMaGV] = useState<string | null>(null);
  const [selectedOtherDutiesScheduleMaGV, setSelectedOtherDutiesScheduleMaGV] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Role switching
  const handleChangeRole = (role: UserRole) => {
    setCurrentRole(role);
    setIsProfileOpen(false);
    // If switched to lecturer, preset filter to that lecturer for demo ease and open lecturer verification page
    if (role === 'lecturer') {
      setColumnFilters((prev) => ({ ...prev, hoTen: 'Mai Như Long' }));
      setSelectedLecturerMa('TDU00128');
      setActiveSidebarItem('tra_cuu_giang_vien');
    } else {
      setColumnFilters((prev) => ({ ...prev, hoTen: '' }));
    }
  };

  // Switch account user with auto role & view routing
  const handleSwitchUser = (acc: UserAccount) => {
    setCurrentAccount(acc);
    setIsProfileOpen(false);
    if (acc.role === 'admin') {
      setCurrentRole('admin');
    } else if (acc.role === 'tai_chinh') {
      setCurrentRole('accountant_specialist');
      setActiveSidebarItem('chi_tra_tai_chinh');
    } else if (acc.role === 'giang_vien') {
      setCurrentRole('lecturer');
      if (acc.maGV) setSelectedLecturerMa(acc.maGV);
      setActiveSidebarItem('tra_cuu_giang_vien');
    } else if (acc.role.startsWith('upload_')) {
      setCurrentRole('accountant_specialist');
      const dept = acc.role.replace('upload_', '') as DepartmentUnit;
      setActiveSidebarItem('ke_khai_upload');
      setSelectedDepartment(dept);
    }
  };

  // Sidebar item selection with sub-department handling
  const handleSelectSidebarItem = (itemKey: string, department?: DepartmentUnit) => {
    setActiveSidebarItem(itemKey);
    setIsProfileOpen(false);
    setSelectedScheduleMaGV(null);
    setSelectedResearchScheduleMaGV(null);
    setSelectedExamScheduleMaGV(null);
    setSelectedThesisScheduleMaGV(null);
    setSelectedAdvisorScheduleMaGV(null);
    setSelectedAdmissionScheduleMaGV(null);
    setSelectedOtherDutiesScheduleMaGV(null);
    if (department) {
      setSelectedDepartment(department);
    }
    if (itemKey === 'ke_khai_upload') {
      if (department) {
        setSelectedDepartment(department);
      }
    } else if (itemKey === 'nhap_lieu_phu_luc') {
      setSelectedDepartment('all');
    }
  };

  // Toggle period lock / approval
  const handleTogglePeriodLock = () => {
    setPeriodStatus((prev) => {
      if (prev === 'locked') return 'reviewing';
      return 'locked';
    });
  };

  // Helper to match NCKH 3 sub-tabs: Bài báo, Seminar, Nghiên cứu khoa học
  const matchesNckhCategory = (item: TeachingRecord, tab: 'all' | 'bai_bao' | 'seminar' | 'de_tai') => {
    if (tab === 'all') return true;
    const text = `${item.tenHocPhan || ''} ${item.noiDungNCKH || ''} ${item.theLoaiNCKH || ''} ${item.loaiHoatDong || ''} ${item.maLopHocPhan || ''}`.toLowerCase();
    if (tab === 'bai_bao') {
      return text.includes('bài báo') || text.includes('scopus') || text.includes('isi') || text.includes('tạp chí') || text.includes('paper');
    }
    if (tab === 'seminar') {
      return text.includes('seminar') || text.includes('hội thảo') || text.includes('tọa đàm') || text.includes('chuyên đề');
    }
    if (tab === 'de_tai') {
      return text.includes('đề tài') || text.includes('luận văn') || text.includes('thạc sĩ') || text.includes('tiến sĩ') || text.includes('sáng kiến') || (!text.includes('bài báo') && !text.includes('seminar') && !text.includes('hội thảo'));
    }
    return true;
  };

  // Filtered Teaching data
  const filteredTeaching = useMemo(() => {
    return teachingList.filter((item) => {
      // 1. Filter by department if a sub-menu in Sidebar is selected
      if (selectedDepartment !== 'all' && item.phongBanQuanLy !== selectedDepartment) {
        return false;
      }
      // NCKH 3 sub-tabs filter: Bài báo, Seminar, Nghiên cứu khoa học
      if (selectedDepartment === 'nckh' && nckhTab !== 'all') {
        if (!matchesNckhCategory(item, nckhTab)) {
          return false;
        }
      }
      // 2. Filter by department in FilterSection
      if (filters.department !== 'all' && item.phongBanQuanLy !== filters.department) {
        return false;
      }
      // 3. Filter by Faculty (Khoa / Bộ môn)
      if (filters.faculty !== 'all' && item.khoaBoMon !== filters.faculty) {
        return false;
      }
      // Filter by Academic Year (Năm học)
      if (filters.academicYear !== 'all') {
        const yearNorm = filters.academicYear.replace(/\s+/g, '');
        const itemDot = (item.dotThanhToan || '').replace(/\s+/g, '');
        if (!itemDot.includes(yearNorm) && !itemDot.includes(filters.academicYear)) {
          return false;
        }
      }
      // Filter by Semester (Học kỳ)
      if (filters.semester !== 'all') {
        const semNorm = filters.semester.replace(/\s+/g, '').toLowerCase();
        const itemDot = (item.dotThanhToan || '').replace(/\s+/g, '').toLowerCase();
        if (!itemDot.includes(semNorm) && !itemDot.includes(filters.semester.toLowerCase())) {
          return false;
        }
      }
      // Filter by Lecturer Name (Họ tên Giảng viên)
      if (filters.lecturerName && !item.hoTen.toLowerCase().includes(filters.lecturerName.trim().toLowerCase())) {
        return false;
      }
      // Filter by Subject Name (Môn giảng dạy)
      if (filters.subjectName && !item.tenHocPhan.toLowerCase().includes(filters.subjectName.trim().toLowerCase())) {
        return false;
      }
      // 4. Filter by Quality / Status
      if (filters.dataQuality !== 'all' && item.trangThai !== filters.dataQuality) {
        return false;
      }
      // 5. Filter by Activity Type
      if (filters.activityType !== 'all') {
        const act = filters.activityType;
        if (act === 'giang_day' && item.phongBanQuanLy !== 'dao_tao') return false;
        if (act === 'coi_cham_thi' && item.phongBanQuanLy !== 'khao_thi') return false;
        if (act === 'tuyen_sinh' && item.phongBanQuanLy !== 'tuyen_sinh') return false;
        if (act === 'nckh' && item.phongBanQuanLy !== 'nckh') return false;
        if (act === 'co_van_hoc_tap' && item.phongBanQuanLy !== 'co_van_hoc_tap') return false;
      }

      // 6. Column filters
      if (columnFilters.hoTen && !item.hoTen.toLowerCase().includes(columnFilters.hoTen.toLowerCase())) {
        return false;
      }
      if (columnFilters.ngaySinh && !item.ngaySinh.toLowerCase().includes(columnFilters.ngaySinh.toLowerCase())) {
        return false;
      }
      if (columnFilters.soCCCD && !item.soCCCD.includes(columnFilters.soCCCD)) {
        return false;
      }
      if (columnFilters.col5 && !(item.maGV.toLowerCase().includes(columnFilters.col5.toLowerCase()) || item.hocHamHocVi.toLowerCase().includes(columnFilters.col5.toLowerCase()))) {
        return false;
      }
      if (columnFilters.col6 && !(item.tenHocPhan.toLowerCase().includes(columnFilters.col6.toLowerCase()) || item.maLopHocPhan.toLowerCase().includes(columnFilters.col6.toLowerCase()))) {
        return false;
      }
      if (columnFilters.col7 && !String(item.tongTietQC).includes(columnFilters.col7)) {
        return false;
      }
      if (columnFilters.col8 && !String(item.thucNhan).includes(columnFilters.col8)) {
        return false;
      }
      if (columnFilters.nguoiThucHien && !(item.nguoiThucHien || '').toLowerCase().includes(columnFilters.nguoiThucHien.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [teachingList, selectedDepartment, filters, columnFilters]);

  // Compute summary stats
  const totalQCHours = useMemo(() => {
    return filteredTeaching.reduce((acc, item) => acc + (item.tongTietQC || 0), 0);
  }, [filteredTeaching]);

  const totalPaymentVND = useMemo(() => {
    return filteredTeaching.reduce((acc, item) => acc + (item.thucNhan || 0), 0);
  }, [filteredTeaching]);

  // Compute status counts for StatusBar: Thống kê số lượng Giảng viên và số lượng Khoa
  const statusCounts: StatusCounts = useMemo(() => {
    const lecturerMap = new Map<string, TeachingRecord>();
    const facultySet = new Set<string>();

    teachingList.forEach((r) => {
      const key = (r.maGV || r.hoTen || r.id).trim();
      if (!lecturerMap.has(key)) {
        lecturerMap.set(key, r);
      }
      const fac = (r.khoaBoMon || '').trim();
      if (fac) facultySet.add(fac);
    });

    const uniqueLecturers = Array.from(lecturerMap.values());

    return {
      all: uniqueLecturers.length,
      facultyCount: facultySet.size || (uniqueLecturers.length > 0 ? 8 : 0),
      hop_le: uniqueLecturers.filter((i) => i.trangThai === 'hop_le').length,
      khong_hop_le: uniqueLecturers.filter((i) => i.trangThai === 'khong_hop_le').length,
      trung_lap: uniqueLecturers.filter((i) => i.trangThai === 'trung_lap').length,
      da_so_hoa: uniqueLecturers.filter((i) => i.trangThai === 'da_so_hoa').length,
      chua_day_du: uniqueLecturers.filter((i) => i.trangThai === 'chua_day_du').length,
      chua_so_hoa: uniqueLecturers.filter((i) => i.trangThai === 'chua_so_hoa').length,
    };
  }, [teachingList]);

  // Group by lecturer: Mỗi người chỉ đúng 1 hàng dữ liệu theo yêu cầu
  const lecturerGroups = useMemo(() => {
    const map = new Map<string, TeachingRecord[]>();
    filteredTeaching.forEach((r) => {
      const key = (r.maGV || r.hoTen || r.id).trim();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    return Array.from(map.entries()).map(([key, recs]) => {
      const primary = recs[0];
      const uniqueSubjects = new Set(
        recs
          .map((r) => (r.tenHocPhan || r.noiDungNCKH || r.tenCongViec || '').trim())
          .filter(Boolean)
      );
      const tongSoMon = uniqueSubjects.size || recs.length;
      const tongSoSinhVien = recs.reduce((sum, r) => sum + (Number(r.soSinhVien) || 0), 0);
      const tongSoTiet = recs.reduce(
        (sum, r) =>
          sum +
          ((Number(r.soTietLT) || 0) + (Number(r.soTietTH) || 0) ||
            Number(r.soGioMonHoc) ||
            Number(r.tongTietQC) ||
            0),
        0
      );
      const tongGioGiangDay = recs.reduce(
        (sum, r) =>
          sum +
          (Number(r.soGioThucGiang) ||
            ((Number(r.soTietLT) || 0) + (Number(r.soTietTH) || 0)) ||
            Number(r.tongTietQC) ||
            0),
        0
      );

      return {
        key,
        maGV: primary.maGV,
        hoTen: primary.hoTen,
        records: recs,
        primaryRecord: primary,
        tongSoMon,
        tongSoSinhVien,
        tongSoTiet,
        tongGioGiangDay,
      };
    });
  }, [filteredTeaching]);

  // Pagination slice of lecturers
  const currentTeachingSlice = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const slicedLecturers = lecturerGroups.slice(start, start + pageSize);
    return slicedLecturers.flatMap((l) => l.records);
  }, [lecturerGroups, currentPage, pageSize]);

  // Pending feedback count
  const pendingFeedbackCount = useMemo(() => {
    return feedbacks.filter((f) => f.trangThai === 'cho_xu_ly').length;
  }, [feedbacks]);

  // Selection handlers
  const handleToggleSelectAll = () => {
    const currentPageRecordIds = currentTeachingSlice.map((r) => r.id);
    const isAllSelected =
      currentPageRecordIds.length > 0 &&
      currentPageRecordIds.every((id) => selectedIds.includes(id));
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentPageRecordIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageRecordIds])));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    const target = teachingList.find((r) => r.id === id);
    const relatedIds = target?.maGV
      ? teachingList.filter((r) => r.maGV === target.maGV).map((r) => r.id)
      : [id];

    const isSelected = relatedIds.some((rId) => selectedIds.includes(rId));
    if (isSelected) {
      setSelectedIds((prev) => prev.filter((rId) => !relatedIds.includes(rId)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...relatedIds])));
    }
  };

  // CRUD actions
  const handleSaveTeaching = async (record: TeachingRecord) => {
    const currentPeriod = periods.find((p) => p.id === currentPeriodId);
    const withPeriod = {
      ...record,
      dotThanhToan: record.dotThanhToan || currentPeriod?.name || 'Học kỳ 1 2026-2027',
    };
    if (withPeriod.phongBanQuanLy === 'nckh') {
      try {
        await fetch('/api/nckh/batch-import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ records: [withPeriod] }),
        });
      } catch (err) {
        console.warn('Lỗi lưu NCKH đơn lẻ lên DB:', err);
      }
    }
    const exists = teachingList.some((r) => r.id === withPeriod.id);
    if (exists) {
      setTeachingList((prev) => prev.map((r) => (r.id === withPeriod.id ? withPeriod : r)));
    } else {
      setTeachingList((prev) => [withPeriod, ...prev]);
    }
  };

  const handleSaveVbcc = (_record: VbccRecord) => {};

  const handleEditRecord = (record: VbccRecord | TeachingRecord) => {
    setEditingRecord(record);
    setIsAddModalOpen(true);
  };

  const handleDeleteRecord = async (id: string) => {
    const target = teachingList.find((item) => item.id === id);
    if (!target) return;
    const deptName =
      selectedDepartment === 'nckh'
        ? nckhTab === 'bai_bao'
          ? 'Bài báo khoa học'
          : nckhTab === 'seminar'
          ? 'Báo cáo Seminar'
          : nckhTab === 'de_tai'
          ? 'Đề tài NCKH'
          : 'Nghiên cứu khoa học'
        : selectedDepartment === 'khao_thi'
        ? 'Khảo thí'
        : selectedDepartment === 'dao_tao'
        ? 'Giờ giảng'
        : selectedDepartment === 'do_an'
        ? 'Đồ án & Khóa luận'
        : selectedDepartment === 'tuyen_sinh'
        ? 'Tuyển sinh'
        : selectedDepartment === 'co_van_hoc_tap'
        ? 'Cố vấn học tập'
        : selectedDepartment === 'cong_tac_khac'
        ? 'Công tác khác'
        : 'nhiệm vụ này';

    const ok = await confirmDelete({
      title: `Xác nhận xóa dữ liệu [${deptName}]`,
      targetName: `${target.hoTen} (${target.maGV})`,
      targetType: deptName,
      message: `Bạn có chắc chắn muốn xóa bản ghi thù lao ${deptName} của giảng viên này khỏi hệ thống không?`,
      dangerNotice: 'Thao tác này sẽ xóa bản ghi khỏi hệ thống và không thể hoàn tác.',
      confirmText: 'Xóa bản ghi',
    });

    if (!ok) {
      return;
    }

    const maGV = target.maGV;
    if (selectedDepartment === 'nckh' && maGV) {
      try {
        const deleteUrl =
          nckhTab !== 'all'
            ? `/api/nckh/lecturer/${maGV}?category=${nckhTab}`
            : `/api/nckh/lecturer/${maGV}`;
        await fetch(deleteUrl, { method: 'DELETE' });
      } catch (err) {
        console.warn('Lỗi khi xóa dữ liệu NCKH của GV trên DB:', err);
      }
    }
    setTeachingList((prev) =>
      prev.filter((item) => {
        if (selectedDepartment === 'nckh' && nckhTab !== 'all') {
          if (item.maGV === maGV && item.phongBanQuanLy === 'nckh') {
            return !matchesNckhCategory(item, nckhTab);
          }
          return true;
        }
        if (selectedDepartment !== 'all') {
          return !(item.maGV === maGV && item.phongBanQuanLy === selectedDepartment);
        }
        return maGV ? item.maGV !== maGV : item.id !== id;
      })
    );
    setSelectedIds((prev) =>
      prev.filter((item) => (maGV ? item !== maGV : item !== id))
    );
  };

  const handleRefresh = () => {
    setColumnFilters({
      hoTen: '',
      ngaySinh: '',
      soCCCD: '',
      col5: '',
      col6: '',
      col7: '',
      col8: '',
      nguoiThucHien: '',
    });
    setSelectedDepartment('all');
    setFilters((prev) => ({ ...prev, department: 'all', dataQuality: 'all', faculty: 'all', activityType: 'all' }));
  };

  const handleSaveRules = (newConfig: PaymentRuleConfig) => {
    setPaymentRules(newConfig);
    // Recalculate all records based on updated rates
    setTeachingList((prev) =>
      prev.map((rec) => {
        const rate = newConfig.rates[rec.hocHamHocVi] || 140000;
        const total = Math.round(rec.tongTietQC * rate);
        const tax = Math.round(total * newConfig.taxRate);
        const net = total - tax;
        return {
          ...rec,
          donGiaTiet: rate,
          tongTienThuLao: total,
          thueTNCN: tax,
          thucNhan: net,
        };
      })
    );
  };

  // Feedback Handlers
  const handleSubmitFeedback = (feedback: Omit<FeedbackItem, 'id' | 'ngayGui' | 'trangThai'>) => {
    const newFb: FeedbackItem = {
      ...feedback,
      id: `fb-${Date.now()}`,
      ngayGui: new Date().toLocaleString('vi-VN'),
      trangThai: 'cho_xu_ly',
    };
    setFeedbacks((prev) => [newFb, ...prev]);

    // Mark record with feedback flag
    setTeachingList((prev) =>
      prev.map((rec) =>
        rec.id === feedback.teachingRecordId ? { ...rec, hasFeedback: true, trangThai: 'chua_day_du' } : rec
      )
    );
  };

  const handleUpdateFeedbackStatus = (
    id: string,
    newStatus: FeedbackItem['trangThai'],
    responseNote: string
  ) => {
    setFeedbacks((prev) =>
      prev.map((fb) =>
        fb.id === id
          ? {
              ...fb,
              trangThai: newStatus,
              phanHoiXuLy: responseNote,
              nguoiXuLy: currentRole === 'accountant_specialist' ? 'Phòng Đào tạo TDU' : 'Khoa chuyên môn TDU',
              ngayXuLy: new Date().toLocaleDateString('vi-VN'),
            }
          : fb
      )
    );
  };

  const handleQuickAdjustRecord = (recordId: string) => {
    const rec = teachingList.find((r) => r.id === recordId);
    if (rec) {
      setEditingRecord(rec);
      setIsFeedbackListOpen(false);
      setIsAddModalOpen(true);
    }
  };

  // Load sample data
  const handleLoadSampleData = () => {
    setTeachingList(INITIAL_TEACHING_DATA);
  };

  // Clear data back to empty state
  const handleClearData = async () => {
    if (selectedDepartment !== 'all') {
      const deptName =
        selectedDepartment === 'nckh'
          ? nckhTab === 'bai_bao'
            ? 'Bài báo khoa học'
            : nckhTab === 'seminar'
            ? 'Báo cáo Seminar'
            : nckhTab === 'de_tai'
            ? 'Đề tài NCKH'
            : 'Nghiên cứu khoa học'
          : selectedDepartment === 'khao_thi'
          ? 'Khảo thí'
          : selectedDepartment === 'dao_tao'
          ? 'Đào tạo (Giờ giảng)'
          : selectedDepartment === 'do_an'
          ? 'Đồ án & Khóa luận'
          : selectedDepartment === 'tuyen_sinh'
          ? 'Tuyển sinh'
          : selectedDepartment === 'co_van_hoc_tap'
          ? 'Cố vấn học tập'
          : selectedDepartment === 'cong_tac_khac'
          ? 'Công tác khác'
          : selectedDepartment;
      const ok = await confirmDelete({
        title: `Làm sạch chuyên mục [${deptName}]`,
        targetName: `Chuyên mục: ${deptName}`,
        targetType: 'Toàn bộ chuyên mục',
        message: `Bạn có chắc chắn muốn xóa toàn bộ dữ liệu của chuyên mục [${deptName}] trong đợt này để nhập lại từ đầu không?`,
        dangerNotice: 'CẢNH BÁO: Toàn bộ dữ liệu của chuyên mục này sẽ bị xóa sạch và không thể hoàn tác.',
        confirmText: 'Đồng ý xóa toàn bộ',
      });

      if (!ok) {
        return;
      }

      if (selectedDepartment === 'nckh') {
        try {
          const clearUrl = nckhTab !== 'all' ? `/api/nckh/clear?category=${nckhTab}` : '/api/nckh/clear';
          await fetch(clearUrl, { method: 'DELETE' });
        } catch (err) {
          console.warn('Lỗi khi xóa bảng NCKH DB:', err);
        }
      }
      setTeachingList((prev) => {
        if (selectedDepartment === 'nckh' && nckhTab !== 'all') {
          return prev.filter((r) => {
            if (r.phongBanQuanLy !== 'nckh') return true;
            return !matchesNckhCategory(r, nckhTab);
          });
        }
        return prev.filter((r) => r.phongBanQuanLy !== selectedDepartment);
      });
      setSelectedIds([]);
    } else {
      const ok = await confirmDelete({
        title: 'Làm sạch toàn bộ bảng thanh toán',
        targetName: 'Tất cả các khối / chuyên mục',
        targetType: 'Thao tác nguy hiểm',
        message: 'Bạn có chắc chắn muốn xóa toàn bộ dữ liệu của tất cả các khối để làm lại từ đầu không?',
        dangerNotice: 'CẢNH BÁO: Toàn bộ dữ liệu bảng thanh toán hiện tại sẽ bị xóa sạch hoàn toàn.',
        confirmText: 'Đồng ý xóa toàn bộ',
      });

      if (!ok) {
        return;
      }
      setTeachingList([]);
      setSelectedIds([]);
    }
  };

  // Excel Template Download per Department
  const handleDownloadTemplate = () => {
    generateDepartmentExcelTemplate(selectedDepartment, currentPeriodName, nckhTab);
  };

  const handleExportDataTemplate = () => {
    try {
      exportDepartmentDataExcel(selectedDepartment, filteredTeaching, currentPeriodName);
    } catch (err: any) {
      console.error('Lỗi khi xuất file Excel:', err);
      alert('Không thể xuất file Excel: ' + (err?.message || String(err)));
    }
  };

  const handleImportTeaching = async (records: TeachingRecord[], isAppend: boolean) => {
    if (selectedDepartment === 'nckh') {
      try {
        if (!isAppend) {
          const clearUrl = nckhTab !== 'all' ? `/api/nckh/clear?category=${nckhTab}` : '/api/nckh/clear';
          await fetch(clearUrl, { method: 'DELETE' });
        }
        await fetch('/api/nckh/batch-import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ records, nckh_tab: nckhTab }),
        });
      } catch (err) {
        console.warn('Lỗi đồng bộ DB NCKH khi import:', err);
      }
    }

    if (isAppend) {
      setTeachingList((prev) => [...prev, ...records]);
    } else {
      if (selectedDepartment !== 'all') {
        // Thay thế chuyên biệt cho chuyên mục/phòng ban đang chọn (ví dụ NCKH), bảo lưu các chuyên mục khác
        setTeachingList((prev) => {
          const keepOtherDepts = prev.filter((r) => r.phongBanQuanLy !== selectedDepartment);
          return [...keepOtherDepts, ...records];
        });
      } else {
        setTeachingList(records);
      }
    }
  };

  // Bắt buộc đăng nhập bằng SSO: Nếu chưa đăng nhập thì hiển thị giao diện Đăng nhập
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleSsoLoginSuccess} />;
  }

  return (
    <div className="h-screen h-[100dvh] bg-[#f1f5f9] flex flex-row font-sans text-slate-800 antialiased overflow-hidden min-w-0">
      {/* 1. Left Sidebar: With official TDU logo, title & "Danh mục thống kê" tab */}
      <Sidebar
        isOpen={sidebarOpen}
        activeItem={activeSidebarItem}
        onSelectItem={handleSelectSidebarItem}
        pendingFeedbackCount={pendingFeedbackCount}
        periodStatus={periodStatus}
        currentRole={currentRole}
        selectedDepartment={selectedDepartment}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        currentAccount={currentAccount}
        nckhTab={nckhTab}
        onSelectNckhTab={setNckhTab}
      />

      {/* 2. Right Workspace Container: Top Header + Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header: 1. Icon Thông báo - 2. Icon Chấm hỏi gửi phản hồi - 3. Thông tin cá nhân (Tên và Chức vụ) */}
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          currentAccount={currentAccount}
          currentRole={currentRole}
          onChangeRole={handleChangeRole}
          pendingFeedbackCount={pendingFeedbackCount}
          onOpenFeedbacks={() => setIsFeedbackListOpen(true)}
          onSendFeedback={() => setIsFeedbackModalOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenSsoModal={() => setIsSsoModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Main Center Content Zone */}
        <main className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
          {activeSidebarItem === 'trang_chu' ? (
            <HomePage
              onNavigate={(itemKey, dept) => handleSelectSidebarItem(itemKey, dept)}
              currentAccount={currentAccount}
              currentRole={currentRole}
            />
          ) : activeSidebarItem === 'nhap_lieu_phu_luc' ? (
            <StatisticsDashboard
              records={teachingList}
              onNavigateToCategory={(dept) => {
                handleSelectSidebarItem('ke_khai_upload', dept);
              }}
            />
          ) : activeSidebarItem === 'tong_thanh_toan' ? (
            <TotalPaymentPage
              records={teachingList}
              currentPeriodName={currentPeriodName}
              onNavigateToLecturerCheck={(maGV) => {
                setSelectedLecturerMa(maGV);
                setActiveSidebarItem('tra_cuu_giang_vien');
              }}
              onNavigateToFinance={() => {
                setActiveSidebarItem('chi_tra_tai_chinh');
              }}
            />
          ) : activeSidebarItem === 'tra_cuu_giang_vien' ? (
            <LecturerVerificationPage
              records={teachingList}
              initialMaGV={selectedLecturerMa}
              currentRole={currentRole}
              currentAccount={currentAccount}
              onSendFeedback={(fb) => {
                const newFb: FeedbackItem = {
                  id: `fb-${Date.now()}`,
                  teachingRecordId: '',
                  maGV: fb.maGV || '',
                  hoTen: fb.hoTen || '',
                  tenHocPhan: fb.tenHocPhan || '',
                  noiDung: fb.noiDung || '',
                  loaiPhanHoi: fb.loaiPhanHoi || 'khac',
                  ngayGui: fb.ngayGui || '',
                  trangThai: 'cho_xu_ly',
                };
                setFeedbacks((prev) => [newFb, ...prev]);
              }}
              onNavigateToFinance={() => {
                setActiveSidebarItem('chi_tra_tai_chinh');
              }}
            />
          ) : activeSidebarItem === 'chi_tra_tai_chinh' ? (
            <FinanceDisbursementPage
              records={teachingList}
              onNavigateToLecturerCheck={(maGV) => {
                setSelectedLecturerMa(maGV);
                setActiveSidebarItem('tra_cuu_giang_vien');
              }}
              onNavigateToTotalPayment={() => {
                setActiveSidebarItem('tong_thanh_toan');
              }}
            />
          ) : activeSidebarItem === 'quan_ly_tai_khoan' || activeSidebarItem === 'ho_so_giang_vien' ? (
            <AccountPermissionPage
              accounts={accounts}
              currentUsername={currentAccount.username}
              onSwitchUser={handleSwitchUser}
              onUpdateAccounts={setAccounts}
            />
          ) : activeSidebarItem === 'he_thong_nguoi_dung' ? (
            <SystemUsersPage />
          ) : activeSidebarItem === 'he_thong_phan_quyen' ? (
            <SystemRoleGroupPage />
          ) : activeSidebarItem === 'he_thong_cau_hinh' ? (
            <SystemConfigPage
              periods={periods}
              currentPeriodId={currentPeriodId}
              onSelectPeriod={(id) => {
                setCurrentPeriodId(id);
                setPeriods((prev) =>
                  prev.map((p) => ({ ...p, isCurrent: p.id === id }))
                );
                const found = periods.find((p) => p.id === id);
                if (found) {
                  setFilters((prev) => ({
                    ...prev,
                    academicYear: found.academicYear,
                    semester: found.semester,
                  }));
                }
              }}
              onCreatePeriod={(newPeriod) => {
                setPeriods((prev) => {
                  const updated = newPeriod.isCurrent
                    ? prev.map((p) => ({ ...p, isCurrent: false }))
                    : [...prev];
                  return [newPeriod, ...updated];
                });
                if (newPeriod.isCurrent) {
                  setCurrentPeriodId(newPeriod.id);
                  setFilters((prev) => ({
                    ...prev,
                    academicYear: newPeriod.academicYear,
                    semester: newPeriod.semester,
                  }));
                }
              }}
              onToggleLockPeriod={(id) => {
                setPeriods((prev) =>
                  prev.map((p) =>
                    p.id === id
                      ? { ...p, status: p.status === 'locked' ? 'active' : 'locked' }
                      : p
                  )
                );
              }}
              onDeletePeriod={(id) => {
                setPeriods((prev) => prev.filter((p) => p.id !== id));
              }}
            />
          ) : activeSidebarItem === 'he_thong_nhat_ky' ? (
            <SystemAuditLogPage />
          ) : activeSidebarItem === 'quan_ly_phan_hoi' ? (
            <FeedbackPageView
              feedbacks={feedbacks}
              onUpdateFeedbackStatus={handleUpdateFeedbackStatus}
              onQuickAdjustRecord={handleQuickAdjustRecord}
            />
          ) : activeSidebarItem === 'bien_ban_so_hoa' ? (
            <MinutesPageView
              teachingData={teachingList}
              periodStatus={periodStatus}
              onTogglePeriodLock={handleTogglePeriodLock}
              canManagePeriod={
                currentRole === 'approver' ||
                currentRole === 'accountant_specialist' ||
                currentRole === 'admin'
              }
            />
          ) : selectedResearchScheduleMaGV ? (
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-100">
              <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shrink-0 sticky top-0 z-40 shadow-xs">
                <button
                  onClick={() => setSelectedResearchScheduleMaGV(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[12.5px] font-bold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại danh sách</span>
                </button>
                <span className="text-[12.5px] font-bold text-[#005325]">
                  Chi tiết bảng kê {nckhTab === 'bai_bao' ? 'Bài báo khoa học' : nckhTab === 'seminar' ? 'Báo cáo Seminar & Hội thảo' : nckhTab === 'de_tai' ? 'Đề tài Nghiên cứu khoa học' : 'Nghiên cứu Khoa học'} — Mã GV: {selectedResearchScheduleMaGV}
                </span>
              </div>
              <div className="flex-1 w-full max-w-full min-w-0 overflow-auto p-2">
                <ResearchScheduleReport
                  maGV={selectedResearchScheduleMaGV}
                  records={teachingList}
                  academicYear={filters.academicYear}
                  nckhTab={nckhTab}
                  onSelectNckhTab={setNckhTab}
                  onClose={() => setSelectedResearchScheduleMaGV(null)}
                  onSaveRecords={async (updated) => {
                    if (selectedResearchScheduleMaGV) {
                      try {
                        await fetch('/api/nckh/save-lecturer', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            ma_giang_vien: selectedResearchScheduleMaGV,
                            records: updated,
                          }),
                        });
                      } catch (err) {
                        console.warn('Lỗi đồng bộ DB ResearchScheduleReport:', err);
                      }
                    }
                    setTeachingList((prev) => {
                      const filtered = prev.filter(
                        (r) => r.maGV !== selectedResearchScheduleMaGV || r.phongBanQuanLy !== 'nckh'
                      );
                      return [...filtered, ...updated];
                    });
                  }}
                />
              </div>
            </div>
          ) : selectedExamScheduleMaGV ? (
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-100">
              <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shrink-0 sticky top-0 z-40 shadow-xs">
                <button
                  onClick={() => setSelectedExamScheduleMaGV(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[12.5px] font-bold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại danh sách</span>
                </button>
                <span className="text-[12.5px] font-bold text-[#005325]">
                  Chi tiết bảng kê Coi thi - Chấm thi - Ra đề — Mã GV: {selectedExamScheduleMaGV}
                </span>
              </div>
              <div className="flex-1 w-full max-w-full min-w-0 overflow-auto p-2">
                <ExamScheduleReport
                  maGV={selectedExamScheduleMaGV}
                  records={teachingList}
                  academicYear={filters.academicYear}
                  onClose={() => setSelectedExamScheduleMaGV(null)}
                  onSaveRecords={(updated) => {
                    setTeachingList((prev) => {
                      const filtered = prev.filter(
                        (r) => r.maGV !== selectedExamScheduleMaGV || r.phongBanQuanLy !== 'khao_thi'
                      );
                      return [...filtered, ...updated];
                    });
                  }}
                />
              </div>
            </div>
          ) : selectedThesisScheduleMaGV ? (
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-100">
              <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shrink-0 sticky top-0 z-40 shadow-xs">
                <button
                  onClick={() => setSelectedThesisScheduleMaGV(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[12.5px] font-bold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại danh sách</span>
                </button>
                <span className="text-[12.5px] font-bold text-[#005325]">
                  Chi tiết bảng kê Hướng dẫn & Chấm Đồ án / KLTN — Mã GV: {selectedThesisScheduleMaGV}
                </span>
              </div>
              <div className="flex-1 w-full max-w-full min-w-0 overflow-auto p-2">
                <ThesisScheduleReport
                  maGV={selectedThesisScheduleMaGV}
                  records={teachingList}
                  academicYear={filters.academicYear}
                  onClose={() => setSelectedThesisScheduleMaGV(null)}
                  onSaveRecords={(updated) => {
                    setTeachingList((prev) => {
                      const filtered = prev.filter(
                        (r) => r.maGV !== selectedThesisScheduleMaGV || r.phongBanQuanLy !== 'do_an'
                      );
                      return [...filtered, ...updated];
                    });
                  }}
                />
              </div>
            </div>
          ) : selectedAdvisorScheduleMaGV ? (
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-100">
              <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shrink-0 sticky top-0 z-40 shadow-xs">
                <button
                  onClick={() => setSelectedAdvisorScheduleMaGV(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[12.5px] font-bold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại danh sách</span>
                </button>
                <span className="text-[12.5px] font-bold text-[#005325]">
                  Chi tiết bảng kê Cố vấn học tập & Quản lý lớp — Mã GV: {selectedAdvisorScheduleMaGV}
                </span>
              </div>
              <div className="flex-1 w-full max-w-full min-w-0 overflow-auto p-2">
                <AdvisorScheduleReport
                  maGV={selectedAdvisorScheduleMaGV}
                  records={teachingList}
                  academicYear={filters.academicYear}
                  onClose={() => setSelectedAdvisorScheduleMaGV(null)}
                  onSaveRecords={(updated) => {
                    setTeachingList((prev) => {
                      const filtered = prev.filter(
                        (r) => r.maGV !== selectedAdvisorScheduleMaGV || r.phongBanQuanLy !== 'co_van_hoc_tap'
                      );
                      return [...filtered, ...updated];
                    });
                  }}
                />
              </div>
            </div>
          ) : selectedAdmissionScheduleMaGV ? (
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-100">
              <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shrink-0 sticky top-0 z-40 shadow-xs">
                <button
                  onClick={() => setSelectedAdmissionScheduleMaGV(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[12.5px] font-bold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại danh sách</span>
                </button>
                <span className="text-[12.5px] font-bold text-[#005325]">
                  Chi tiết bảng kê Tư vấn Tuyển sinh & Hướng nghiệp — Mã GV: {selectedAdmissionScheduleMaGV}
                </span>
              </div>
              <div className="flex-1 w-full max-w-full min-w-0 overflow-auto p-2">
                <AdmissionScheduleReport
                  maGV={selectedAdmissionScheduleMaGV}
                  records={teachingList}
                  academicYear={filters.academicYear}
                  onClose={() => setSelectedAdmissionScheduleMaGV(null)}
                  onSaveRecords={(updated) => {
                    setTeachingList((prev) => {
                      const filtered = prev.filter(
                        (r) => r.maGV !== selectedAdmissionScheduleMaGV || r.phongBanQuanLy !== 'tuyen_sinh'
                      );
                      return [...filtered, ...updated];
                    });
                  }}
                />
              </div>
            </div>
          ) : selectedOtherDutiesScheduleMaGV ? (
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-100">
              <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shrink-0 sticky top-0 z-40 shadow-xs">
                <button
                  onClick={() => setSelectedOtherDutiesScheduleMaGV(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[12.5px] font-bold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại danh sách</span>
                </button>
                <span className="text-[12.5px] font-bold text-[#005325]">
                  Chi tiết bảng kê Công tác khác (40 mục) — Mã GV: {selectedOtherDutiesScheduleMaGV}
                </span>
              </div>
              <div className="flex-1 w-full max-w-full min-w-0 overflow-auto p-2">
                <OtherDutiesScheduleReport
                  maGV={selectedOtherDutiesScheduleMaGV}
                  records={teachingList}
                  academicYear={filters.academicYear}
                  onClose={() => setSelectedOtherDutiesScheduleMaGV(null)}
                />
              </div>
            </div>
          ) : selectedScheduleMaGV ? (
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-100">
              <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shrink-0 sticky top-0 z-40 shadow-xs">
                <button
                  onClick={() => setSelectedScheduleMaGV(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[12.5px] font-bold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại danh sách</span>
                </button>
                <span className="text-[12.5px] font-bold text-[#005325]">
                  Chi tiết bảng kê Giờ giảng dạy — Mã GV: {selectedScheduleMaGV}
                </span>
              </div>
              <div className="flex-1 w-full max-w-full min-w-0 overflow-auto p-2">
                <TeachingScheduleReport
                  maGV={selectedScheduleMaGV}
                  records={teachingList}
                  academicYear={filters.academicYear}
                  onClose={() => setSelectedScheduleMaGV(null)}
                  onSaveRecords={(updated) => {
                    setTeachingList((prev) => {
                      const filtered = prev.filter(
                        (r) => r.maGV !== selectedScheduleMaGV || r.phongBanQuanLy !== 'dao_tao'
                      );
                      return [...filtered, ...updated];
                    });
                  }}
                />
              </div>
            </div>
          ) : (
            <div
              className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-white"
              onWheel={(e) => {
                const tableScrollEl = document.getElementById('main-datatable-scroll-container');
                if (tableScrollEl && !tableScrollEl.contains(e.target as Node)) {
                  tableScrollEl.scrollTop += e.deltaY;
                }
              }}
            >
              {/* Top Filter Section adjusted specifically for University Teaching Hours */}
              <div className="shrink-0">
                <FilterSection
                  filters={filters}
                  onFilterChange={setFilters}
                  onSearch={() => setCurrentPage(1)}
                />
              </div>

              {/* Action Bar with Department context & 6 e-Gov action buttons */}
              <div className="shrink-0">
                <ActionBar
                  totalRecords={lecturerGroups.length}
                  totalFaculties={statusCounts.facultyCount}
                  totalQCHours={totalQCHours}
                  totalPaymentVND={totalPaymentVND}
                  pageSize={pageSize}
                  onPageSizeChange={setPageSize}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  onAddNew={() => {
                    setEditingRecord(null);
                    setCurrentPage(1);
                    setIsAddingInline(true);
                  }}
                  onDownloadTemplate={handleDownloadTemplate}
                  onImportExcel={() => {
                    setIsAppendMode(false);
                    setIsExcelImportOpen(true);
                  }}
                  onImportAppendExcel={() => {
                    setIsAppendMode(true);
                    setIsExcelImportOpen(true);
                  }}
                  onExportDataTemplate={handleExportDataTemplate}
                  onPackageAndGenerateMinutes={() => setActiveSidebarItem('bien_ban_so_hoa')}
                  onLoadSampleData={handleLoadSampleData}
                  onClearData={handleClearData}
                  selectedDepartment={selectedDepartment}
                  nckhTab={nckhTab}
                />
              </div>

              {/* Inline save notification banner */}
              {inlineNotice && (
                <div className="mx-3 mt-2 mb-1 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-[#005325] text-[12px] flex items-center justify-between animate-fadeIn shrink-0">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">{inlineNotice}</span>
                  </div>
                  <button
                    onClick={() => setInlineNotice(null)}
                    className="text-emerald-700 hover:text-emerald-900 text-sm px-1.5 cursor-pointer font-bold leading-none"
                    title="Đóng thông báo"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Data Table Grid with Column Headers and Inline Filters */}
              <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
                <DataTable
                  appMode={appMode}
                  selectedDepartment={selectedDepartment}
                  nckhTab={nckhTab}
                  onSelectNckhTab={setNckhTab}
                  vbccData={INITIAL_VBCC_DATA}
                  teachingData={currentTeachingSlice}
                  columnFilters={columnFilters}
                  onColumnFilterChange={setColumnFilters}
                  selectedIds={selectedIds}
                  onToggleSelectAll={handleToggleSelectAll}
                  onToggleSelectRow={handleToggleSelectRow}
                  onRefresh={handleRefresh}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  onEditRecord={handleEditRecord}
                  onDeleteRecord={handleDeleteRecord}
                  onViewTeachingSchedule={(maGV) => setSelectedScheduleMaGV(maGV)}
                  onViewResearchSchedule={(maGV) => setSelectedResearchScheduleMaGV(maGV)}
                  onViewRecordDetail={(record) => {
                    if ('maGV' in record && record.maGV) {
                      if (selectedDepartment === 'nckh') {
                        setSelectedResearchScheduleMaGV(record.maGV);
                      } else if (selectedDepartment === 'khao_thi') {
                        setSelectedExamScheduleMaGV(record.maGV);
                      } else if (selectedDepartment === 'do_an') {
                        setSelectedThesisScheduleMaGV(record.maGV);
                      } else if (selectedDepartment === 'co_van_hoc_tap') {
                        setSelectedAdvisorScheduleMaGV(record.maGV);
                      } else if (selectedDepartment === 'tuyen_sinh') {
                        setSelectedAdmissionScheduleMaGV(record.maGV);
                      } else if (selectedDepartment === 'cong_tac_khac') {
                        setSelectedOtherDutiesScheduleMaGV(record.maGV);
                      } else {
                        setSelectedScheduleMaGV(record.maGV);
                      }
                    }
                  }}
                  onRequestFeedback={(record) => {
                    if ('maGV' in record) {
                      setSelectedLecturerMa(record.maGV);
                      setIsFeedbackModalOpen(true);
                    }
                  }}
                  periodStatus={periodStatus}
                  currentRole={currentRole}
                  isAddingInline={isAddingInline}
                  onCancelAddInline={() => setIsAddingInline(false)}
                  onSaveInlineRecord={(newRec) => {
                    handleSaveTeaching(newRec);
                    setIsAddingInline(false);
                    setInlineNotice(`Đã lưu thành công dòng kê khai mới: ${newRec.hoTen} — ${newRec.tenHocPhan}`);
                    setTimeout(() => setInlineNotice(null), 4500);
                  }}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* User Profile & Settings Modal */}
      {isProfileOpen && (
        <UserProfileView
          currentAccount={currentAccount}
          currentRole={currentRole}
          onClose={() => setIsProfileOpen(false)}
          onUpdateAccount={(updated) => setCurrentAccount(updated)}
        />
      )}

      {/* Add / Edit Record Modal */}
      <AddRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaveVbcc={handleSaveVbcc}
        onSaveTeaching={handleSaveTeaching}
        editingRecord={editingRecord}
        appMode={appMode}
      />

      {/* Excel Import with Validation Engine Modal */}
      <ExcelImportModal
        isOpen={isExcelImportOpen}
        onClose={() => setIsExcelImportOpen(false)}
        onImportTeaching={handleImportTeaching}
        isAppendMode={isAppendMode}
        appMode={appMode}
        currentRecords={teachingList}
        config={paymentRules}
        departmentUnit={selectedDepartment === 'all' ? 'dao_tao' : selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        currentPeriodName={currentPeriodName}
        onDownloadTemplate={handleDownloadTemplate}
        nckhTab={nckhTab}
      />

      {/* Official Acceptance & Payment Minutes Modal */}
      <MinutesModal
        isOpen={isMinutesOpen}
        onClose={() => setIsMinutesOpen(false)}
        vbccData={INITIAL_VBCC_DATA}
        teachingData={filteredTeaching}
        appMode={appMode}
        institutionName="TRƯỜNG ĐẠI HỌC TÂY ĐÔ (TDU)"
        year={filters.academicYear}
      />

      {/* Lecturer Feedback Submission Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => {
          setIsFeedbackModalOpen(false);
          setTargetFeedbackRecord(null);
        }}
        record={targetFeedbackRecord}
        onSubmitFeedback={handleSubmitFeedback}
      />

      {/* Department & Specialist Feedback Review Modal */}
      <FeedbackListModal
        isOpen={isFeedbackListOpen}
        onClose={() => setIsFeedbackListOpen(false)}
        feedbacks={feedbacks}
        onUpdateFeedbackStatus={handleUpdateFeedbackStatus}
        onQuickAdjustRecord={handleQuickAdjustRecord}
      />

      {/* Payment Rules & Rates Configuration Modal */}
      <PaymentRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        config={paymentRules}
        onSaveConfig={handleSaveRules}
      />

      {/* Column Display Settings Modal */}
      <ColumnSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* TDU SSO Google & Email Login Modal */}
      <TduSsoLoginModal
        isOpen={isSsoModalOpen}
        onClose={() => setIsSsoModalOpen(false)}
        onLoginSuccess={handleSsoLoginSuccess}
      />
    </div>
  );
}
