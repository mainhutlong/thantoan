import React, { useState, useMemo } from 'react';
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
import { PaymentRulesModal } from './components/PaymentRulesModal';
import { StatisticsDashboard } from './components/StatisticsDashboard';
import { LecturerProfilesPage } from './components/LecturerProfilesPage';
import { FeedbackPageView } from './components/FeedbackPageView';
import { MinutesPageView } from './components/MinutesPageView';
import { TotalPaymentPage } from './components/TotalPaymentPage';
import { LecturerVerificationPage } from './components/LecturerVerificationPage';
import { FinanceDisbursementPage } from './components/FinanceDisbursementPage';
import { AccountPermissionPage } from './components/AccountPermissionPage';
import { TeachingScheduleModal } from './components/TeachingScheduleModal';
import { ResearchScheduleModal } from './components/ResearchScheduleModal';
import { SystemUsersPage } from './components/SystemUsersPage';
import { SystemRoleGroupPage } from './components/SystemRoleGroupPage';
import { SystemConfigPage } from './components/SystemConfigPage';
import { SystemAuditLogPage } from './components/SystemAuditLogPage';
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
} from './types';

export default function App() {
  // App Mode & Persona Role
  const appMode: AppMode = 'teaching_payment';
  const [currentRole, setCurrentRole] = useState<UserRole>('accountant_specialist');
  const [periodStatus, setPeriodStatus] = useState<PeriodStatus>('draft');

  // Accounts & Permission management
  const [accounts, setAccounts] = useState<UserAccount[]>(INITIAL_ACCOUNTS);
  const [currentAccount, setCurrentAccount] = useState<UserAccount>(INITIAL_ACCOUNTS[0]);
  const [selectedLecturerMa, setSelectedLecturerMa] = useState<string>('TDU00128');

  // Sidebar state - Default to 1st menu: Thanh toán giờ giảng
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>('ke_khai_upload');

  // Department Unit Selection ('all' | 'dao_tao' | 'khao_thi' | 'tuyen_sinh' | 'nckh' | 'cong_tac_khac')
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentUnit>('dao_tao');

  // Top Filter state - Khoa, Năm học, Học kỳ, Tên giảng viên, Môn giảng dạy
  const [filters, setFilters] = useState<FilterState>({
    department: 'all',
    faculty: 'all',
    academicYear: '2023 - 2024',
    semester: 'Học kỳ 2',
    paymentPhase: 'all',
    degreeLevel: 'all',
    activityType: 'all',
    dataQuality: 'all',
    lecturerName: '',
    subjectName: '',
  });

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
  const [isExcelImportOpen, setIsExcelImportOpen] = useState<boolean>(false);
  const [isAppendMode, setIsAppendMode] = useState<boolean>(false);
  const [isMinutesOpen, setIsMinutesOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  const [targetFeedbackRecord, setTargetFeedbackRecord] = useState<TeachingRecord | null>(null);
  const [isFeedbackListOpen, setIsFeedbackListOpen] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [selectedScheduleMaGV, setSelectedScheduleMaGV] = useState<string | null>(null);
  const [selectedResearchScheduleMaGV, setSelectedResearchScheduleMaGV] = useState<string | null>(null);

  // Role switching
  const handleChangeRole = (role: UserRole) => {
    setCurrentRole(role);
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

  // Filtered Teaching data
  const filteredTeaching = useMemo(() => {
    return teachingList.filter((item) => {
      // 1. Filter by department if a sub-menu in Sidebar is selected
      if (selectedDepartment !== 'all' && item.phongBanQuanLy !== selectedDepartment) {
        return false;
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
      if (filters.academicYear !== 'all' && !item.dotThanhToan?.includes(filters.academicYear)) {
        return false;
      }
      // Filter by Semester (Học kỳ)
      if (filters.semester !== 'all' && !item.dotThanhToan?.includes(filters.semester)) {
        return false;
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
      if (columnFilters.nguoiThucHien && !item.nguoiThucHien.toLowerCase().includes(columnFilters.nguoiThucHien.toLowerCase())) {
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

  // Compute status counts for StatusBar
  const statusCounts: StatusCounts = useMemo(() => {
    return {
      all: teachingList.length,
      hop_le: teachingList.filter((i) => i.trangThai === 'hop_le').length,
      khong_hop_le: teachingList.filter((i) => i.trangThai === 'khong_hop_le').length,
      trung_lap: teachingList.filter((i) => i.trangThai === 'trung_lap').length,
      da_so_hoa: teachingList.filter((i) => i.trangThai === 'da_so_hoa').length,
      chua_day_du: teachingList.filter((i) => i.trangThai === 'chua_day_du').length,
      chua_so_hoa: teachingList.filter((i) => i.trangThai === 'chua_so_hoa').length,
    };
  }, [teachingList]);

  // Pagination slice
  const currentTeachingSlice = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTeaching.slice(start, start + pageSize);
  }, [filteredTeaching, currentPage, pageSize]);

  // Pending feedback count
  const pendingFeedbackCount = useMemo(() => {
    return feedbacks.filter((f) => f.trangThai === 'cho_xu_ly').length;
  }, [feedbacks]);

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === currentTeachingSlice.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentTeachingSlice.map((item) => item.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // CRUD actions
  const handleSaveTeaching = (record: TeachingRecord) => {
    const exists = teachingList.some((r) => r.id === record.id);
    if (exists) {
      setTeachingList((prev) => prev.map((r) => (r.id === record.id ? record : r)));
    } else {
      setTeachingList((prev) => [record, ...prev]);
    }
  };

  const handleSaveVbcc = (_record: VbccRecord) => {};

  const handleEditRecord = (record: VbccRecord | TeachingRecord) => {
    setEditingRecord(record);
    setIsAddModalOpen(true);
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi này khỏi hệ thống thanh toán?')) {
      setTeachingList((prev) => prev.filter((item) => item.id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
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
  const handleClearData = () => {
    setTeachingList([]);
    setSelectedIds([]);
  };

  // Excel Template Download per Department
  const handleDownloadTemplate = () => {
    let headers: string[] = [];
    let sampleRow: any[] = [];
    let fileName = '';

    if (selectedDepartment === 'khao_thi') {
      headers = [
        'TT',
        'Mã GV',
        'Họ và tên Giảng viên',
        'Ngày sinh',
        'Số CCCD',
        'Học vị',
        'Khoa',
        'Tên học phần thi',
        'Số ca coi thi',
        'Số bài chấm thi',
        'Số đề thi ra',
        'Đợt thi',
      ];
      sampleRow = [
        1,
        'TDU00128',
        'TS. Mai Như Long',
        '18/09/1982',
        '092082001245',
        'TS',
        'Khoa CNTT',
        'Hệ thống thông tin doanh nghiệp',
        4,
        120,
        2,
        'Học kỳ 2 (2023 - 2024)',
      ];
      fileName = 'Mau_Khao_Thi_Coi_Cham_Thi_TDU_2024.xlsx';
    } else if (selectedDepartment === 'tuyen_sinh') {
      headers = [
        'TT',
        'Mã GV',
        'Họ và tên Giảng viên',
        'Ngày sinh',
        'Số CCCD',
        'Học vị',
        'Khoa',
        'Nội dung công tác tuyển sinh',
        'Số ngày công tác',
        'Địa bàn / Trường THPT',
        'Đợt tuyển sinh',
      ];
      sampleRow = [
        1,
        'TDU00318',
        'ThS. Nguyễn Thị Cẩm Tú',
        '22/11/1988',
        '092088005671',
        'ThS',
        'Khoa QTKD',
        'Tư vấn hướng nghiệp tuyển sinh ĐBSCL',
        5,
        'Cụm trường THPT Hậu Giang & Sóc Trăng',
        'Đợt 1 (2024)',
      ];
      fileName = 'Mau_Tuyen_Sinh_Truyen_Thong_TDU_2024.xlsx';
    } else if (selectedDepartment === 'nckh') {
      headers = [
        'TT',
        'Mã GV',
        'Họ và tên Giảng viên',
        'Học vị',
        'Khoa',
        'Tên đề tài / Bài báo ISI / Luận văn',
        'Mã đề tài',
        'Số giờ quy đổi',
        'Vai trò / Ghi chú',
      ];
      sampleRow = [
        1,
        'TDU00089',
        'PGS.TS. Trần Thanh Dũng',
        'PGS.TS',
        'Khoa Dược',
        'Nghiên cứu hoạt tính sinh học từ dược liệu ĐBSCL',
        'NCKH_DUOC_01',
        120,
        'Tác giả chính (Scopus Q1)',
      ];
      fileName = 'Mau_NCKH_Sau_Dai_Hoc_TDU_2024.xlsx';
    } else if (selectedDepartment === 'co_van_hoc_tap') {
      headers = [
        'TT',
        'Mã GV',
        'Họ và tên Giảng viên',
        'Học vị',
        'Khoa',
        'Lớp phụ trách CVHT',
        'Số sinh viên lớp',
        'Thời gian cố vấn (Học kỳ / Năm học)',
        'Số tiết định mức QC',
        'Đơn giá tiết (VNĐ)',
        'Ghi chú',
      ];
      sampleRow = [
        1,
        'TDU00128',
        'TS. Mai Như Long',
        'TS',
        'Khoa CNTT',
        'CNTT14A',
        65,
        'Học kỳ 2 (2023 - 2024)',
        20,
        180000,
        'Theo Quyết định phân công Cố vấn học tập TDU',
      ];
      fileName = 'Mau_Co_Van_Hoc_Tap_TDU_2024.xlsx';
    } else if (selectedDepartment === 'cong_tac_khac') {
      headers = [
        'TT',
        'Mã GV',
        'Họ và tên Giảng viên',
        'Học vị',
        'Khoa',
        'Nhiệm vụ công tác kiêm nhiệm',
        'Thời gian / Căn cứ phân công',
        'Số tiết QC quy đổi',
        'Ghi chú',
      ];
      sampleRow = [
        1,
        'TDU00215',
        'ThS. Nguyễn Văn Hải',
        'ThS',
        'Khoa CNTT',
        'Ban Thanh tra thi HK2 & Giám sát',
        'HK2 (QĐ số 118/QĐ-ĐHTĐ)',
        12,
        'Theo Quy chế chi tiêu nội bộ TDU',
      ];
      fileName = 'Mau_Cong_Tac_Khac_TDU_2024.xlsx';
    } else {
      // Default: Thanh toán giờ giảng (Phòng Đào tạo)
      headers = [
        'TT',
        'Mã GV',
        'Họ và tên Giảng viên',
        'Ngày sinh',
        'Số CCCD',
        'Tiết Lý thuyết',
        'Tiết Thực hành',
        'Học vị',
        'Khoa',
        'Tên học phần',
        'Mã lớp học phần',
      ];
      sampleRow = [
        1,
        'TDU00128',
        'TS. Mai Như Long',
        '18/09/1982',
        '092082001245',
        30,
        30,
        'TS',
        'Khoa CNTT',
        'Phát triển HTTT Doanh nghiệp',
        'CNTT14A_TDU',
      ];
      fileName = 'Mau_Ke_Khai_Dao_Tao_TDU_2024.xlsx';
    }

    const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Ke_Khai_TDU');
    XLSX.writeFile(wb, fileName);
  };

  const handleExportDataTemplate = () => {
    const wb = XLSX.utils.book_new();
    const rows = filteredTeaching.map((item, idx) => ({
      'TT': idx + 1,
      'Mã GV': item.maGV,
      'Họ và tên Giảng viên': item.hoTen,
      'Học vị': item.hocHamHocVi,
      'Khoa / Bộ môn': item.khoaBoMon,
      'Đơn vị kê khai': item.phongBanQuanLy === 'dao_tao' ? 'Phòng Đào tạo' : item.phongBanQuanLy === 'khao_thi' ? 'TT Khảo thí' : item.phongBanQuanLy === 'tuyen_sinh' ? 'Phòng Tuyển sinh' : 'Phòng NCKH',
      'Học phần / Hoạt động': item.tenHocPhan,
      'Lớp HP / Mã đợt': item.maLopHocPhan,
      'Số TC': item.soTinChi,
      'Tiết LT': item.soTietLT,
      'Tiết TH': item.soTietTH,
      'Tổng tiết QC': item.tongTietQC,
      'Đơn giá / tiết (VNĐ)': item.donGiaTiet,
      'Tổng thù lao (VNĐ)': item.tongTienThuLao,
      'Thuế TNCN 10% (VNĐ)': item.thueTNCN,
      'Thực nhận (VNĐ)': item.thucNhan,
      'Số tài khoản': item.soTaiKhoan || '',
      'Ngân hàng': item.nganHang || '',
      'Đợt thanh toán': item.dotThanhToan,
      'Trạng thái': item.trangThai === 'hop_le' ? 'Hợp lệ' : item.trangThai === 'da_so_hoa' ? 'Đã duyệt chi' : item.trangThai === 'trung_lap' ? 'Trùng lịch' : 'Cần đối soát',
    }));
    const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ 'Thông báo': 'Chưa có bản ghi nào' }]);
    XLSX.utils.book_append_sheet(wb, ws, 'Thanh_Toan_Gio_Giang_TDU');
    XLSX.writeFile(wb, `Bang_Thanh_Toan_Gio_Giang_TDU_2024.xlsx`);
  };

  const handleImportTeaching = (records: TeachingRecord[], isAppend: boolean) => {
    if (isAppend) {
      setTeachingList((prev) => [...prev, ...records]);
    } else {
      setTeachingList(records);
    }
  };

  return (
    <div className="h-screen bg-[#f1f5f9] flex flex-row font-sans text-slate-800 antialiased overflow-hidden">
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
        />

        {/* Main Center Content Zone */}
        <main className="flex-1 flex flex-col min-w-0 bg-white overflow-y-auto overflow-x-hidden">
          {activeSidebarItem === 'nhap_lieu_phu_luc' ? (
            <StatisticsDashboard
              records={teachingList}
              onNavigateToCategory={(dept) => {
                handleSelectSidebarItem('ke_khai_upload', dept);
              }}
            />
          ) : activeSidebarItem === 'tong_thanh_toan' ? (
            <TotalPaymentPage
              records={teachingList}
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
            <SystemConfigPage />
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
          ) : (
            <>
              {/* Top Filter Section adjusted specifically for University Teaching Hours */}
              <FilterSection
                filters={filters}
                onFilterChange={setFilters}
                onSearch={() => setCurrentPage(1)}
              />

              {/* Status Bar */}
              <StatusBar
                counts={statusCounts}
                currentFilter={filters.dataQuality}
                onSelectFilter={(quality) => setFilters((prev) => ({ ...prev, dataQuality: quality }))}
                periodStatus={periodStatus}
                pendingFeedbackCount={pendingFeedbackCount}
                onOpenFeedbacks={() => setIsFeedbackListOpen(true)}
                onTogglePeriodLock={handleTogglePeriodLock}
                canManagePeriod={currentRole === 'approver' || currentRole === 'accountant_specialist' || currentRole === 'admin'}
              />

              {/* Action Bar with Department context & 6 e-Gov action buttons */}
              <ActionBar
                totalRecords={filteredTeaching.length}
                totalQCHours={totalQCHours}
                totalPaymentVND={totalPaymentVND}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onAddNew={() => {
                  setEditingRecord(null);
                  setIsAddModalOpen(true);
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
              />

              {/* Data Table Grid with Column Headers and Inline Filters */}
              <DataTable
                appMode={appMode}
                selectedDepartment={selectedDepartment}
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
              />
            </>
          )}
        </main>
      </div>

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

      {/* Teaching Schedule Modal (Exact sheet view) */}
      <TeachingScheduleModal
        isOpen={!!selectedScheduleMaGV}
        onClose={() => setSelectedScheduleMaGV(null)}
        maGV={selectedScheduleMaGV || ''}
        records={teachingList}
        academicYear={filters.academicYear}
        onSaveRecords={(updated) => {
          setTeachingList((prev) => {
            const filtered = prev.filter((r) => r.maGV !== selectedScheduleMaGV || r.phongBanQuanLy !== 'dao_tao');
            return [...filtered, ...updated];
          });
        }}
      />

      {/* Research Schedule Modal (Exact sheet view) */}
      <ResearchScheduleModal
        isOpen={!!selectedResearchScheduleMaGV}
        onClose={() => setSelectedResearchScheduleMaGV(null)}
        maGV={selectedResearchScheduleMaGV || ''}
        records={teachingList}
        academicYear={filters.academicYear}
        onSaveRecords={(updated) => {
          setTeachingList((prev) => {
            const filtered = prev.filter((r) => r.maGV !== selectedResearchScheduleMaGV || r.phongBanQuanLy !== 'nckh');
            return [...filtered, ...updated];
          });
        }}
      />
    </div>
  );
}
