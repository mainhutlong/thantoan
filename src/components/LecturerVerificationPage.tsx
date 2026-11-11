import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Users,
  Coins,
  Percent,
  BookOpen,
  GraduationCap,
  Megaphone,
  FlaskConical,
  Briefcase,
  Send,
  Building,
  CreditCard,
  User,
  ShieldCheck,
  Clock,
  Printer,
  ChevronRight,
  ExternalLink,
  Info,
  Check,
  UserCheck,
  RotateCw,
  Eye,
  CheckSquare,
  Lock,
  FileSpreadsheet
} from 'lucide-react';
import { TeachingRecord, FeedbackItem, UserRole, UserAccount } from '../types';
import { TeachingScheduleReport } from './TeachingScheduleReport';
import { TeachingScheduleModal } from './TeachingScheduleModal';
import { ResearchScheduleReport } from './ResearchScheduleReport';
import { ResearchScheduleModal } from './ResearchScheduleModal';

interface LecturerVerificationPageProps {
  records: TeachingRecord[];
  initialMaGV?: string;
  onSendFeedback?: (feedback: Partial<FeedbackItem>) => void;
  onConfirmVerification?: (maGV: string, category?: string) => void;
  onNavigateToFinance?: (maGV: string) => void;
  currentRole?: UserRole;
  currentAccount?: UserAccount;
}

type TabKey =
  | 'tong_quan'
  | 'dao_tao'
  | 'khao_thi'
  | 'tuyen_sinh'
  | 'nckh'
  | 'co_van_hoc_tap'
  | 'cong_tac_khac';

interface CategoryApprovalStatus {
  status: 'pending' | 'confirmed' | 'disputed';
  confirmedAt?: string;
  disputeNote?: string;
  disputeDate?: string;
}

export const LecturerVerificationPage: React.FC<LecturerVerificationPageProps> = ({
  records,
  initialMaGV = 'TDU00128',
  onSendFeedback,
  onConfirmVerification,
  onNavigateToFinance,
  currentRole,
  currentAccount,
}) => {
  // If the logged in user is a lecturer with a specific maGV, use their maGV
  const effectiveMaGV = useMemo(() => {
    if (currentAccount?.role === 'giang_vien' && currentAccount.maGV) {
      return currentAccount.maGV;
    }
    return initialMaGV;
  }, [currentAccount, initialMaGV]);

  const [searchQuery, setSearchQuery] = useState(effectiveMaGV);
  // Default first tab is 'tong_quan': Thống kê tổng tiền theo từng nội dung
  const [activeTab, setActiveTab] = useState<TabKey>('tong_quan');
  const [teachingViewMode, setTeachingViewMode] = useState<'excel_sheet' | 'compact_table'>('excel_sheet');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [researchViewMode, setResearchViewMode] = useState<'excel_sheet' | 'compact_table'>('excel_sheet');
  const [isResearchModalOpen, setIsResearchModalOpen] = useState(false);

  // Feedback form state
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState<
    'sai_so_tiet' | 'thieu_lop' | 'sai_he_so' | 'sai_don_gia' | 'khac'
  >('sai_so_tiet');
  const [feedbackTargetTab, setFeedbackTargetTab] = useState<TabKey>('tong_quan');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Per-Lecturer & Per-Category approval states
  const [categoryStates, setCategoryStates] = useState<
    Record<string, Record<TabKey, CategoryApprovalStatus>>
  >({
    TDU00128: {
      tong_quan: { status: 'confirmed', confirmedAt: '17/10/2024 14:32' },
      dao_tao: { status: 'confirmed', confirmedAt: '17/10/2024 14:30' },
      khao_thi: { status: 'confirmed', confirmedAt: '17/10/2024 14:31' },
      tuyen_sinh: { status: 'confirmed', confirmedAt: '17/10/2024 14:32' },
      nckh: { status: 'confirmed', confirmedAt: '17/10/2024 14:32' },
      co_van_hoc_tap: { status: 'confirmed', confirmedAt: '17/10/2024 14:32' },
      cong_tac_khac: { status: 'confirmed', confirmedAt: '17/10/2024 14:32' },
    },
    TDU00245: {
      tong_quan: {
        status: 'disputed',
        disputeNote:
          'Học phần Dược lâm sàng nâng cao thiếu 5 tiết thảo luận lâm sàng bệnh viện.',
        disputeDate: '16/10/2024 09:15',
      },
      dao_tao: {
        status: 'disputed',
        disputeNote:
          'Học phần Dược lâm sàng nâng cao thiếu 5 tiết thảo luận lâm sàng bệnh viện.',
        disputeDate: '16/10/2024 09:15',
      },
      khao_thi: { status: 'pending' },
      tuyen_sinh: { status: 'pending' },
      nckh: { status: 'pending' },
      co_van_hoc_tap: { status: 'pending' },
      cong_tac_khac: { status: 'pending' },
    },
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Unique lecturers list for search quick selector
  const availableLecturers = useMemo(() => {
    const map = new Map<string, { maGV: string; hoTen: string; khoaBoMon: string }>();
    records.forEach((r) => {
      if (!map.has(r.maGV)) {
        map.set(r.maGV, { maGV: r.maGV, hoTen: r.hoTen, khoaBoMon: r.khoaBoMon });
      }
    });
    return Array.from(map.values());
  }, [records]);

  // Selected Lecturer
  const selectedLecturer = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const found = availableLecturers.find(
      (l) => l.maGV.toLowerCase() === q || l.hoTen.toLowerCase().includes(q)
    );
    return found || availableLecturers[0];
  }, [availableLecturers, searchQuery]);

  // All records for this lecturer
  const lecturerRecords = useMemo(() => {
    if (!selectedLecturer) return [];
    return records.filter((r) => r.maGV === selectedLecturer.maGV);
  }, [records, selectedLecturer]);

  // Sums across 6 modules for this lecturer
  const summary = useMemo(() => {
    let daoTaoAmt = 0;
    let daoTaoQC = 0;
    let khaoThiAmt = 0;
    let khaoThiQC = 0;
    let tuyenSinhAmt = 0;
    let tuyenSinhQC = 0;
    let nckhAmt = 0;
    let nckhQC = 0;
    let coVanHocTapAmt = 0;
    let coVanHocTapQC = 0;
    let congTacKhacAmt = 0;
    let congTacKhacQC = 0;
    let tongQC = 0;
    let tongThuLao = 0;
    let thueTNCN = 0;
    let thucNhan = 0;

    lecturerRecords.forEach((r) => {
      if (r.phongBanQuanLy === 'dao_tao') {
        daoTaoAmt += r.tongTienThuLao;
        daoTaoQC += r.tongTietQC;
      } else if (r.phongBanQuanLy === 'khao_thi') {
        khaoThiAmt += r.tongTienThuLao;
        khaoThiQC += r.tongTietQC;
      } else if (r.phongBanQuanLy === 'tuyen_sinh') {
        tuyenSinhAmt += r.tongTienThuLao;
        tuyenSinhQC += r.tongTietQC;
      } else if (r.phongBanQuanLy === 'nckh') {
        nckhAmt += r.tongTienThuLao;
        nckhQC += r.tongTietQC;
      } else if (r.phongBanQuanLy === 'co_van_hoc_tap') {
        coVanHocTapAmt += r.tongTienThuLao;
        coVanHocTapQC += r.tongTietQC;
      } else if (r.phongBanQuanLy === 'cong_tac_khac') {
        congTacKhacAmt += r.tongTienThuLao;
        congTacKhacQC += r.tongTietQC;
      }

      tongQC += r.tongTietQC;
      tongThuLao += r.tongTienThuLao;
      thueTNCN += r.thueTNCN;
      thucNhan += r.thucNhan;
    });

    const firstRec = lecturerRecords[0] || ({} as Partial<TeachingRecord>);

    const daoTaoRecords = lecturerRecords.filter((r) => r.phongBanQuanLy === 'dao_tao');
    const tongGioLT = daoTaoRecords
      .filter((r) => r.phanLoaiGiangDay === 'ly_thuyet')
      .reduce((sum, r) => sum + (r.soGioQuyChuan || r.tongTietQC || 0), 0);
    const tongGioTH = daoTaoRecords
      .filter((r) => r.phanLoaiGiangDay === 'thuc_hanh_thuc_tap')
      .reduce((sum, r) => sum + (r.soGioQuyChuan || r.tongTietQC || 0), 0);
    const tongGioGiangDayQC = daoTaoRecords.reduce(
      (sum, r) => sum + (r.soGioQuyChuan || r.tongTietQC || 0),
      0
    );

    const khaoThiRecords = lecturerRecords.filter((r) => r.phongBanQuanLy === 'khao_thi');
    const tongGioKhaoThi = khaoThiRecords.reduce(
      (sum, r) => sum + (r.tongSoGioTheoCV || r.tongTietQC || 0),
      0
    );

    const nckhRecords = lecturerRecords.filter((r) => r.phongBanQuanLy === 'nckh');
    const tongGioNCKH = nckhRecords.reduce(
      (sum, r) => sum + (r.soGioQCNCKH || r.tongTietQC || 0),
      0
    );
    const dinhMucNCKH = nckhRecords[0]?.dinhMucNCKH || 150;
    const mucDoHoanThanhNCKH: 'hoan_thanh' | 'khong_hoan_thanh' =
      tongGioNCKH >= dinhMucNCKH ? 'hoan_thanh' : 'khong_hoan_thanh';

    return {
      maGV: selectedLecturer?.maGV || '',
      hoTen: selectedLecturer?.hoTen || '',
      khoaBoMon: selectedLecturer?.khoaBoMon || '',
      hocHamHocVi: firstRec.hocHamHocVi || 'TS',
      soCCCD: firstRec.soCCCD || '092082001245',
      ngaySinh: firstRec.ngaySinh || '18/09/1982',
      soTaiKhoan: firstRec.soTaiKhoan || '102874639912',
      nganHang: firstRec.nganHang || 'VietinBank CN Cần Thơ',
      daoTaoAmt,
      daoTaoQC,
      tongGioLT,
      tongGioTH,
      tongGioGiangDayQC,
      khaoThiAmt,
      khaoThiQC,
      tongGioKhaoThi,
      tuyenSinhAmt,
      tuyenSinhQC,
      nckhAmt,
      nckhQC,
      tongGioNCKH,
      dinhMucNCKH,
      mucDoHoanThanhNCKH,
      coVanHocTapAmt,
      coVanHocTapQC,
      congTacKhacAmt,
      congTacKhacQC,
      tongQC,
      tongThuLao,
      thueTNCN,
      thucNhan,
    };
  }, [lecturerRecords, selectedLecturer]);

  // Current lecturer status map
  const currentLecturerStatuses = useMemo(() => {
    if (!selectedLecturer) return {} as Record<TabKey, CategoryApprovalStatus>;
    return (
      categoryStates[selectedLecturer.maGV] || {
        tong_quan: { status: 'pending' },
        dao_tao: { status: 'pending' },
        khao_thi: { status: 'pending' },
        tuyen_sinh: { status: 'pending' },
        nckh: { status: 'pending' },
        co_van_hoc_tap: { status: 'pending' },
        cong_tac_khac: { status: 'pending' },
      }
    );
  }, [selectedLecturer, categoryStates]);

  const getTabStatus = (tabKey: TabKey): CategoryApprovalStatus => {
    return currentLecturerStatuses[tabKey] || { status: 'pending' };
  };

  // Handle confirm agree
  const handleConfirmCategory = (tabKey: TabKey) => {
    if (!selectedLecturer) return;
    const now = new Date();
    const dateStr = `${now.toLocaleDateString('vi-VN')} ${now.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    setCategoryStates((prev) => {
      const lecturerMap = prev[selectedLecturer.maGV] || ({} as Record<TabKey, CategoryApprovalStatus>);
      const updated = {
        ...lecturerMap,
        [tabKey]: { status: 'confirmed' as const, confirmedAt: dateStr },
      };

      if (tabKey === 'tong_quan') {
        const allTabs: TabKey[] = [
          'dao_tao',
          'khao_thi',
          'tuyen_sinh',
          'nckh',
          'co_van_hoc_tap',
          'cong_tac_khac',
        ];
        allTabs.forEach((k) => {
          updated[k] = { status: 'confirmed', confirmedAt: dateStr };
        });
      }

      return {
        ...prev,
        [selectedLecturer.maGV]: updated,
      };
    });

    const categoryNames: Record<TabKey, string> = {
      tong_quan: 'Toàn bộ tổng hợp thù lao',
      dao_tao: 'Thanh toán giờ giảng',
      khao_thi: 'Coi thi, chấm thi, ra đề',
      tuyen_sinh: 'Công tác tuyển sinh',
      nckh: 'Nghiên cứu khoa học',
      co_van_hoc_tap: 'Cố vấn học tập',
      cong_tac_khac: 'Công tác khác',
    };

    showToast(`✔ Đã đồng ý xác nhận thành công: ${categoryNames[tabKey]}`);

    if (onConfirmVerification) {
      onConfirmVerification(selectedLecturer.maGV, tabKey);
    }
  };

  // Open feedback modal
  const handleOpenFeedbackForTab = (tabKey: TabKey) => {
    setFeedbackTargetTab(tabKey);
    const categoryNames: Record<TabKey, string> = {
      tong_quan: 'Thù lao tổng hợp các nguồn',
      dao_tao: 'Thanh toán giờ giảng dạy',
      khao_thi: 'Coi thi, chấm thi, ra đề thi',
      tuyen_sinh: 'Công tác tuyển sinh',
      nckh: 'Nghiên cứu khoa học',
      co_van_hoc_tap: 'Cố vấn học tập',
      cong_tac_khac: 'Nhiệm vụ công tác khác',
    };
    setFeedbackSubject(categoryNames[tabKey] || '');

    if (tabKey === 'dao_tao') setFeedbackCategory('sai_so_tiet');
    else if (tabKey === 'khao_thi') setFeedbackCategory('thieu_lop');
    else if (tabKey === 'nckh') setFeedbackCategory('sai_he_so');
    else if (tabKey === 'tuyen_sinh') setFeedbackCategory('sai_don_gia');
    else setFeedbackCategory('khac');

    setIsFeedbackOpen(true);
  };

  // Submit feedback
  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLecturer || !feedbackContent.trim()) return;

    const now = new Date();
    const dateStr = `${now.toLocaleDateString('vi-VN')} ${now.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    setCategoryStates((prev) => {
      const lecturerMap = prev[selectedLecturer.maGV] || ({} as Record<TabKey, CategoryApprovalStatus>);
      return {
        ...prev,
        [selectedLecturer.maGV]: {
          ...lecturerMap,
          [feedbackTargetTab]: {
            status: 'disputed',
            disputeNote: feedbackContent.trim(),
            disputeDate: dateStr,
          },
          tong_quan: {
            status: 'disputed',
            disputeNote: `[${feedbackSubject}] ${feedbackContent.trim()}`,
            disputeDate: dateStr,
          },
        },
      };
    });

    if (onSendFeedback) {
      onSendFeedback({
        maGV: selectedLecturer.maGV,
        hoTen: selectedLecturer.hoTen,
        tenHocPhan: feedbackSubject || 'Thù lao kê khai',
        noiDung: feedbackContent.trim(),
        loaiPhanHoi: feedbackCategory,
        ngayGui: dateStr,
        trangThai: 'cho_xu_ly',
      });
    }

    showToast('✉ Đã gửi phản hồi thành công đến Phòng Chuyên môn!');
    setIsFeedbackOpen(false);
    setFeedbackContent('');
  };

  // Current tab records
  const currentTabRecords = useMemo(() => {
    if (activeTab === 'tong_quan') return [];
    return lecturerRecords.filter((r) => r.phongBanQuanLy === activeTab);
  }, [lecturerRecords, activeTab]);

  const activeTabStatus = getTabStatus(activeTab);

  const tabsConfig: {
    key: TabKey;
    label: string;
    badgeName: string;
    icon: React.ReactNode;
    amount: number;
    qc: number;
    color: string;
    ringColor: string;
    count: number;
  }[] = [
    {
      key: 'tong_quan',
      label: 'Thống kê tổng tiền',
      badgeName: 'Tổng hợp 6 nguồn',
      icon: <DollarSign className="w-3.5 h-3.5" />,
      color: 'bg-[#005325] hover:bg-[#00421e]',
      ringColor: 'ring-[#005325]',
      amount: summary.thucNhan,
      qc: summary.tongQC,
      count: lecturerRecords.length,
    },
    {
      key: 'dao_tao',
      label: 'Thanh toán giờ giảng',
      badgeName: 'P. Đào tạo',
      icon: <BookOpen className="w-3.5 h-3.5" />,
      color: 'bg-[#16a34a] hover:bg-[#15803d]',
      ringColor: 'ring-[#16a34a]',
      amount: summary.daoTaoAmt > 0 ? summary.daoTaoAmt * 0.9 : 0,
      qc: summary.daoTaoQC,
      count: lecturerRecords.filter((r) => r.phongBanQuanLy === 'dao_tao').length,
    },
    {
      key: 'khao_thi',
      label: 'Coi thi, ra đề, chấm thi',
      badgeName: 'TT Khảo thí',
      icon: <GraduationCap className="w-3.5 h-3.5" />,
      color: 'bg-[#6d28d9] hover:bg-[#5b21b6]',
      ringColor: 'ring-[#6d28d9]',
      amount: summary.khaoThiAmt > 0 ? summary.khaoThiAmt * 0.9 : 0,
      qc: summary.khaoThiQC,
      count: lecturerRecords.filter((r) => r.phongBanQuanLy === 'khao_thi').length,
    },
    {
      key: 'tuyen_sinh',
      label: 'Công tác tuyển sinh',
      badgeName: 'P. Tuyển sinh',
      icon: <Megaphone className="w-3.5 h-3.5" />,
      color: 'bg-[#ea580c] hover:bg-[#c2410c]',
      ringColor: 'ring-[#ea580c]',
      amount: summary.tuyenSinhAmt > 0 ? summary.tuyenSinhAmt * 0.9 : 0,
      qc: summary.tuyenSinhQC,
      count: lecturerRecords.filter((r) => r.phongBanQuanLy === 'tuyen_sinh').length,
    },
    {
      key: 'nckh',
      label: 'Nghiên cứu khoa học',
      badgeName: 'P. NCKH',
      icon: <FlaskConical className="w-3.5 h-3.5" />,
      color: 'bg-[#0891b2] hover:bg-[#0e7490]',
      ringColor: 'ring-[#0891b2]',
      amount: summary.nckhAmt > 0 ? summary.nckhAmt * 0.9 : 0,
      qc: summary.nckhQC,
      count: lecturerRecords.filter((r) => r.phongBanQuanLy === 'nckh').length,
    },
    {
      key: 'co_van_hoc_tap',
      label: 'Cố vấn học tập',
      badgeName: 'P. CTSV',
      icon: <UserCheck className="w-3.5 h-3.5" />,
      color: 'bg-[#1e3a47] hover:bg-[#162c37]',
      ringColor: 'ring-[#1e3a47]',
      amount: summary.coVanHocTapAmt > 0 ? summary.coVanHocTapAmt * 0.9 : 0,
      qc: summary.coVanHocTapQC,
      count: lecturerRecords.filter((r) => r.phongBanQuanLy === 'co_van_hoc_tap').length,
    },
    {
      key: 'cong_tac_khac',
      label: 'Công tác khác',
      badgeName: 'HĐKH, Thanh tra',
      icon: <Briefcase className="w-3.5 h-3.5" />,
      color: 'bg-[#4f46e5] hover:bg-[#4338ca]',
      ringColor: 'ring-[#4f46e5]',
      amount: summary.congTacKhacAmt > 0 ? summary.congTacKhacAmt * 0.9 : 0,
      qc: summary.congTacKhacQC,
      count: lecturerRecords.filter((r) => r.phongBanQuanLy === 'cong_tac_khac').length,
    },
  ];

  const currentTabConfig = tabsConfig.find((t) => t.key === activeTab)!;

  return (
    <div className="flex-1 w-full max-w-full min-w-0 bg-white flex flex-col min-h-0 select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#005325] text-white px-3.5 py-2 rounded shadow-md flex items-center gap-2 text-[12px] animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. KHUNG THÔNG TIN GIẢNG VIÊN (1 Khung duy nhất gồm đúng 6 mục yêu cầu)    */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 1. KHUNG THÔNG TIN GIẢNG VIÊN (TRÌNH BÀY GỌN GÀNG, DỄ NHÌN - 1 CỘT DUY NHẤT) */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-[#cbd5e1] px-3 sm:px-4 py-3 w-full max-w-full min-w-0">
        <div className="bg-gradient-to-r from-slate-50 via-slate-50/90 to-white border border-slate-300 rounded-md p-3.5 sm:p-4 shadow-2xs">
          {/* Header of lecturer card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 mb-2.5 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="h-[26px] px-2.5 bg-[#005325] text-white rounded-xs flex items-center gap-1.5 text-[11.5px] font-semibold tracking-wide shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>THÔNG TIN GIẢNG VIÊN</span>
              </span>
              <span className="text-[12px] text-slate-600 hidden md:inline font-normal">
                Tra cứu & Đối soát số liệu thù lao cá nhân
              </span>
            </div>

            {/* Quick Actions: Select lecturer (if admin/accountant) & Print */}
            <div className="flex items-center gap-2 flex-wrap">
              {currentRole !== 'lecturer' && (
                <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-sm px-2 h-[30px] shadow-2xs">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedLecturer?.maGV || ''}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-[11.5px] font-medium text-slate-800 focus:outline-none cursor-pointer"
                  >
                    {availableLecturers.map((l) => (
                      <option key={l.maGV} value={l.maGV}>
                        {l.maGV} - {l.hoTen} ({l.khoaBoMon})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={() => window.print()}
                className="h-[30px] px-3.5 bg-[#1e293b] hover:bg-[#0f172a] text-white rounded-sm flex items-center gap-1.5 text-[11.5px] font-medium cursor-pointer shadow-xs transition-colors"
                title="In phiếu xác nhận thù lao cá nhân"
              >
                <Printer className="w-3.5 h-3.5 text-slate-300" />
                <span>In phiếu xác nhận</span>
              </button>
            </div>
          </div>

          {/* 6 requested fields displayed strictly in 1 single neat vertical column */}
          <div className="flex flex-col divide-y divide-slate-200/80 max-w-2xl sm:max-w-3xl text-[12px]">
            {/* 1. Họ và tên */}
            <div className="py-2 px-2 hover:bg-white/80 rounded transition-colors flex items-center">
              <span className="text-slate-500 font-medium w-36 sm:w-44 shrink-0 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>Họ và tên:</span>
              </span>
              <span className="font-bold text-slate-900 text-[13px] sm:text-[13.5px]">
                {summary.hoTen}
              </span>
            </div>

            {/* 2. Mã GV */}
            <div className="py-2 px-2 hover:bg-white/80 rounded transition-colors flex items-center">
              <span className="text-slate-500 font-medium w-36 sm:w-44 shrink-0 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                <span>Mã GV:</span>
              </span>
              <span className="font-mono font-semibold text-slate-800 bg-white px-2.5 py-0.5 rounded border border-slate-300 shadow-2xs text-[11.5px]">
                {summary.maGV}
              </span>
            </div>

            {/* 3. Chức danh */}
            <div className="py-2 px-2 hover:bg-white/80 rounded transition-colors flex items-center">
              <span className="text-slate-500 font-medium w-36 sm:w-44 shrink-0 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>Chức danh:</span>
              </span>
              <span className="font-medium text-slate-800">
                {summary.hocHamHocVi === 'TS' ? 'Tiến sĩ' : summary.hocHamHocVi || 'Giảng viên'}
              </span>
            </div>

            {/* 4. Đơn vị */}
            <div className="py-2 px-2 hover:bg-white/80 rounded transition-colors flex items-center">
              <span className="text-slate-500 font-medium w-36 sm:w-44 shrink-0 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-600"></span>
                <span>Đơn vị:</span>
              </span>
              <span className="font-medium text-slate-800">{summary.khoaBoMon}</span>
            </div>

            {/* 5. Ngạch giảng viên */}
            <div className="py-2 px-2 hover:bg-white/80 rounded transition-colors flex items-center">
              <span className="text-slate-500 font-medium w-36 sm:w-44 shrink-0 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                <span>Ngạch giảng viên:</span>
              </span>
              <span className="font-medium text-slate-800">
                Giảng viên chính (Hạng II - V.07.01.02)
              </span>
            </div>

            {/* 6. Năm học */}
            <div className="py-2 px-2 hover:bg-white/80 rounded transition-colors flex items-center">
              <span className="text-slate-500 font-medium w-36 sm:w-44 shrink-0 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>Năm học:</span>
              </span>
              <span className="font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 text-[11.5px]">
                Học kỳ 2 · Năm học 2023 - 2024
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. BUTTON-STYLED HORIZONTAL TABS (Vibrant, 100% visible, no graying out)  */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-[#cbd5e1] px-3 sm:px-4 py-2.5 w-full max-w-full min-w-0">
        <div className="flex items-center flex-wrap gap-2">
          {tabsConfig.map((tab) => {
            const isActive = activeTab === tab.key;
            const tabStatus = getTabStatus(tab.key);
            const isConfirmed = tabStatus.status === 'confirmed';
            const isDisputed = tabStatus.status === 'disputed';

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`h-[32px] px-3 sm:px-3.5 rounded-sm text-white text-[12px] flex items-center gap-1.5 transition-all cursor-pointer opacity-100 font-medium ${tab.color} ${
                  isActive
                    ? 'ring-3 ring-amber-400 ring-offset-1 shadow-md font-bold scale-[1.03] z-10'
                    : 'shadow-xs hover:brightness-110 hover:-translate-y-0.5'
                }`}
                title={`Xem chi tiết: ${tab.label}`}
              >
                <span className="shrink-0">{tab.icon}</span>
                <span className="whitespace-nowrap">{tab.label}</span>

                {/* Status indicator dot */}
                {isConfirmed && !isActive ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-200 shrink-0 border border-emerald-400" title="Đã xác nhận" />
                ) : isDisputed && !isActive ? (
                  <span className="w-2 h-2 rounded-full bg-amber-200 shrink-0 border border-amber-400" title="Đang phản hồi" />
                ) : null}

                {/* Active indicator badge */}
                {isActive && (
                  <span className="px-1.5 py-0.2 bg-white/25 text-white rounded text-[10px] uppercase font-bold tracking-wider ml-0.5">
                    Đang xem
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ACTION BAR FOR CURRENT TAB (Fully visible action buttons, never gray)   */}
      {/* ========================================================================= */}
      <div className="bg-[#f8fafc] border-b border-[#e2e8f0] px-3 sm:px-4 py-2 flex items-center justify-between flex-wrap gap-2.5 w-full max-w-full">
        {/* Left: Tab Title & Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-[13px] font-semibold text-slate-800">
            {activeTab === 'tong_quan'
              ? 'Bảng đối soát tổng hợp 6 nguồn hoạt động'
              : `Bảng kê khai chi tiết: ${currentTabConfig.label}`}
          </h2>

          <span className="text-[11px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-medium border border-slate-300">
            {currentTabConfig.badgeName}
          </span>

          <span className="text-[11px] text-slate-500 hidden md:inline">
            ({currentTabRecords.length > 0 ? `${currentTabRecords.length} mục kê khai` : 'Dữ liệu toàn trường'})
          </span>
        </div>

        {/* Right: AGREE & FEEDBACK ACTION BUTTONS (Always vibrant and visible) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleOpenFeedbackForTab(activeTab)}
            className="h-[32px] px-3.5 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-sm flex items-center gap-1.5 text-[12px] font-medium shadow-xs transition-colors cursor-pointer"
            title="Gửi phản hồi / khiếu nại cho mục này"
          >
            <AlertCircle className="w-3.5 h-3.5 text-white" />
            <span>{activeTab === 'tong_quan' ? 'Gửi phản hồi / Khiếu nại' : 'Phản hồi mục này'}</span>
          </button>

          <button
            onClick={() => handleConfirmCategory(activeTab)}
            className="h-[32px] px-4 bg-[#005325] hover:bg-[#00421e] text-white rounded-sm flex items-center gap-1.5 text-[12px] font-semibold shadow-xs transition-colors cursor-pointer"
            title="Đồng ý xác nhận số liệu mục này"
          >
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5] text-emerald-200" />
            <span>{activeTab === 'tong_quan' ? 'Đồng ý xác nhận toàn bộ' : 'Đồng ý mục này'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TAB CONTENT: DATA TABLES & SUMMARY GRIDS                               */}
      {/* ========================================================================= */}
      <div className="flex-1 w-full max-w-full min-w-0 flex flex-col min-h-0 bg-white">
        {/* ===================================================================== */}
        {/* TAB 1: THỐNG KÊ TỔNG TIỀN (TAB ĐẦU TIÊN)                             */}
        {/* ===================================================================== */}
        {activeTab === 'tong_quan' && (
          <div className="p-3 sm:p-4 space-y-4 w-full max-w-full min-w-0">
            {/* Mục Tổng thù lao - Thiết kế chính xác theo mockup hình ảnh */}
            <div className="bg-[#f0fdfa]/40 border border-[#99f6e4] rounded-xl p-3 sm:p-4 px-4 sm:px-5 shadow-2xs">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                {/* Hero Stat: Tổng thực nhận */}
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#008f4c] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <DollarSign className="w-7 h-7 text-white stroke-[2.75]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[12px] font-bold text-[#0f4c81] uppercase tracking-wide">
                        TỔNG THU LAO THỰC NHẬN:
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#dcfce7] text-[#15803d] border border-[#86efac] flex items-center gap-1">
                        ✓ Khớp 100% dữ liệu UNC
                      </span>
                    </div>
                    <div className="text-[28px] sm:text-[32px] font-extrabold font-mono text-[#00875a] leading-none my-1 flex items-baseline gap-1.5">
                      <span>{summary.thucNhan.toLocaleString('vi-VN')}</span>
                      <span className="text-[15px] font-bold text-[#00875a]">VNĐ</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal">
                      (Đã trừ 10% thuế TNCN theo quy chế chi tiêu nội bộ Trường Đại học Tây Đô)
                    </p>
                  </div>
                </div>

                {/* Vách ngăn đứng giữa Hero Stat và 4 Metrics */}
                <div className="hidden xl:block w-px h-12 bg-emerald-200/80 self-center"></div>

                {/* 4 Chỉ số chi tiết với Icon tròn Pastel theo đúng ảnh */}
                <div className="flex flex-wrap items-center gap-x-5 sm:gap-x-6 gap-y-3 pt-3 xl:pt-0 border-t xl:border-t-0 border-emerald-100">
                  {/* 1. Khối lượng QC */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0">
                      <Users className="w-4.5 h-4.5 text-[#0284c7]" />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block leading-tight font-medium">Khối lượng QC</span>
                      <span className="text-[15px] font-bold font-mono text-[#1e3a8a] leading-tight block mt-0.5">
                        {summary.tongQC.toFixed(1)} tiết/h
                      </span>
                    </div>
                  </div>

                  {/* Vách ngăn 1 */}
                  <div className="hidden sm:block w-px h-9 bg-slate-200/80"></div>

                  {/* 2. Thù lao gộp */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#f3e8ff] text-[#9333ea] flex items-center justify-center shrink-0">
                      <Coins className="w-4.5 h-4.5 text-[#9333ea]" />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block leading-tight font-medium">Thù lao gộp</span>
                      <span className="text-[15px] font-bold font-mono text-[#1e3a8a] leading-tight block mt-0.5">
                        {summary.tongThuLao.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>

                  {/* Vách ngăn 2 */}
                  <div className="hidden sm:block w-px h-9 bg-slate-200/80"></div>

                  {/* 3. Thuế TNCN (10%) */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#ffe4e6] text-[#e11d48] flex items-center justify-center shrink-0">
                      <Percent className="w-4 h-4 text-[#e11d48] stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block leading-tight font-medium">Thuế TNCN (10%)</span>
                      <span className="text-[15px] font-bold font-mono text-[#e11d48] leading-tight block mt-0.5">
                        -{summary.thueTNCN.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>

                  {/* Vách ngăn 3 */}
                  <div className="hidden sm:block w-px h-9 bg-slate-200/80"></div>

                  {/* 4. Nguồn hoạt động */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0">
                      <Users className="w-4.5 h-4.5 text-[#16a34a]" />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block leading-tight font-medium">Nguồn hoạt động</span>
                      <span className="text-[15px] font-bold text-[#047857] leading-tight block mt-0.5">
                        6/6 nguồn
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Consolidated Table of All 6 Sources (Modern Dashboard Table) */}
            <div className="border border-slate-300 rounded-md overflow-hidden shadow-2xs bg-white">
              <div className="bg-slate-100/90 px-3.5 py-2.5 border-b border-slate-300 flex items-center justify-between text-[12px] flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">
                    Bảng tổng hợp đối soát chi tiết 6 khoản thù lao của Giảng viên
                  </span>
                  <span className="text-[10.5px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.2 rounded font-medium">
                    ✓ 6/6 Nguồn đã đối soát
                  </span>
                </div>
                <span className="text-slate-600 text-[11px] font-medium bg-white px-2.5 py-0.5 rounded border border-slate-200 shadow-2xs">
                  Học kỳ 2 · Năm học 2023 - 2024
                </span>
              </div>

              <div className="overflow-x-auto w-full max-w-full">
                <table className="w-full text-left border-collapse text-[12px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b-2 border-slate-300 font-semibold h-[38px] text-[11.5px] uppercase tracking-wider">
                      <th className="w-[45px] px-2 text-center border-r border-slate-200">STT</th>
                      <th className="px-3 border-r border-slate-200 min-w-[210px]">Nội dung thanh toán thù lao</th>
                      <th className="px-3 border-r border-slate-200 w-[180px]">Đơn vị phụ trách</th>
                      <th className="px-2.5 text-right border-r border-slate-200 w-[115px]">Khối lượng QC</th>
                      <th className="px-3 text-right border-r border-slate-200 w-[130px]">Thù lao gộp (VNĐ)</th>
                      <th className="px-2.5 text-right border-r border-slate-200 w-[115px]">Thuế 10%</th>
                      <th className="px-3 text-right border-r border-slate-200 w-[135px]">Thực nhận (VNĐ)</th>
                      <th className="px-2.5 text-center border-r border-slate-200 w-[120px]">Trạng thái</th>
                      <th className="px-2.5 text-center w-[100px]">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {/* Row 1: Giờ giảng */}
                    <tr className="h-[38px] hover:bg-emerald-50/50 even:bg-slate-50/40 transition-colors">
                      <td className="px-2 text-center font-mono border-r border-slate-200">1</td>
                      <td className="px-3 border-r border-slate-200 font-medium">Thanh toán giờ giảng (Lý thuyết & Thực hành)</td>
                      <td className="px-3 border-r border-slate-200 text-slate-600">Phòng Đào tạo</td>
                      <td className="px-2.5 text-right font-mono border-r border-slate-200 font-medium">{summary.daoTaoQC.toFixed(1)} tiết</td>
                      <td className="px-3 text-right font-mono border-r border-slate-200 font-medium">{summary.daoTaoAmt.toLocaleString('vi-VN')} đ</td>
                      <td className="px-2.5 text-right font-mono border-r border-slate-200 text-rose-600 font-medium">
                        -{(summary.daoTaoAmt * 0.1).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-3 text-right font-mono border-r border-slate-200 font-bold text-[#005325]">
                        {(summary.daoTaoAmt * 0.9).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-2.5 text-center border-r border-slate-200">
                        <span className="px-2 py-0.5 rounded text-[10.5px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          ✓ Đã xác nhận
                        </span>
                      </td>
                      <td className="px-2.5 text-center">
                        <button
                          onClick={() => setActiveTab('dao_tao')}
                          className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer shadow-2xs transition-colors"
                        >
                          Xem bảng →
                        </button>
                      </td>
                    </tr>

                    {/* Row 2: Khảo thí */}
                    <tr className="h-[38px] hover:bg-emerald-50/50 even:bg-slate-50/40 transition-colors">
                      <td className="px-2 text-center font-mono border-r border-slate-200">2</td>
                      <td className="px-3 border-r border-slate-200 font-medium">Coi thi, ra đề, chấm thi kết thúc HP</td>
                      <td className="px-3 border-r border-slate-200 text-slate-600">TT Khảo thí</td>
                      <td className="px-2.5 text-right font-mono border-r border-slate-200 font-medium">{summary.khaoThiQC.toFixed(1)} giờ</td>
                      <td className="px-3 text-right font-mono border-r border-slate-200 font-medium">{summary.khaoThiAmt.toLocaleString('vi-VN')} đ</td>
                      <td className="px-2.5 text-right font-mono border-r border-slate-200 text-rose-600 font-medium">
                        -{(summary.khaoThiAmt * 0.1).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-3 text-right font-mono border-r border-slate-200 font-bold text-[#005325]">
                        {(summary.khaoThiAmt * 0.9).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-2.5 text-center border-r border-slate-200">
                        <span className="px-2 py-0.5 rounded text-[10.5px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          ✓ Đã xác nhận
                        </span>
                      </td>
                      <td className="px-2.5 text-center">
                        <button
                          onClick={() => setActiveTab('khao_thi')}
                          className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 cursor-pointer shadow-2xs transition-colors"
                        >
                          Xem bảng →
                        </button>
                      </td>
                    </tr>

                    {/* Row 3: Tuyển sinh */}
                    <tr className="h-[38px] hover:bg-emerald-50/50 even:bg-slate-50/40 transition-colors">
                      <td className="px-2 text-center font-mono border-r border-slate-200">3</td>
                      <td className="px-3 border-r border-slate-200 font-medium">Công tác tuyển sinh & Truyền thông</td>
                      <td className="px-3 border-r border-slate-200 text-slate-600">P. Tuyển sinh & TT</td>
                      <td className="px-2.5 text-right font-mono border-r border-slate-200 font-medium">{summary.tuyenSinhQC.toFixed(1)} tiết</td>
                      <td className="px-3 text-right font-mono border-r border-slate-200 font-medium">{summary.tuyenSinhAmt.toLocaleString('vi-VN')} đ</td>
                      <td className="px-2.5 text-right font-mono border-r border-slate-200 text-rose-600 font-medium">
                        -{(summary.tuyenSinhAmt * 0.1).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-3 text-right font-mono border-r border-slate-200 font-bold text-[#005325]">
                        {(summary.tuyenSinhAmt * 0.9).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-2.5 text-center border-r border-slate-200">
                        <span className="px-2 py-0.5 rounded text-[10.5px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          ✓ Đã xác nhận
                        </span>
                      </td>
                      <td className="px-2.5 text-center">
                        <button
                          onClick={() => setActiveTab('tuyen_sinh')}
                          className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 cursor-pointer shadow-2xs transition-colors"
                        >
                          Xem bảng →
                        </button>
                      </td>
                    </tr>

                    {/* Row 4: NCKH */}
                    <tr className="h-[38px] hover:bg-emerald-50/50 even:bg-slate-50/40 transition-colors">
                      <td className="px-2 text-center font-mono border-r border-slate-200">4</td>
                      <td className="px-3 border-r border-slate-200 font-medium">Nghiên cứu khoa học (Bài báo, đề tài, luận văn)</td>
                      <td className="px-3 border-r border-slate-200 text-slate-600">Phòng NCKH & SĐH</td>
                      <td className="px-2.5 text-right font-mono border-r border-slate-200 font-medium">{summary.nckhQC.toFixed(1)} giờ</td>
                      <td className="px-3 text-right font-mono border-r border-slate-200 font-medium">{summary.nckhAmt.toLocaleString('vi-VN')} đ</td>
                      <td className="px-2.5 text-right font-mono border-r border-slate-200 text-rose-600 font-medium">
                        -{(summary.nckhAmt * 0.1).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-3 text-right font-mono border-r border-slate-200 font-bold text-[#005325]">
                        {(summary.nckhAmt * 0.9).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-2.5 text-center border-r border-slate-200">
                        <span className="px-2 py-0.5 rounded text-[10.5px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          ✓ Đã xác nhận
                        </span>
                      </td>
                      <td className="px-2.5 text-center">
                        <button
                          onClick={() => setActiveTab('nckh')}
                          className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 cursor-pointer shadow-2xs transition-colors"
                        >
                          Xem bảng →
                        </button>
                      </td>
                    </tr>

                    {/* Row 5: Cố vấn học tập */}
                    <tr className="h-[38px] hover:bg-emerald-50/50 even:bg-slate-50/40 transition-colors">
                      <td className="px-2 text-center font-mono border-r border-slate-200">5</td>
                      <td className="px-3 border-r border-slate-200 font-medium">Cố vấn học tập (CVHT lớp sinh viên)</td>
                      <td className="px-3 border-r border-slate-200 text-slate-600">P. CTSV & Đào tạo</td>
                      <td className="px-2.5 text-right font-mono border-r border-slate-200 font-medium">{summary.coVanHocTapQC.toFixed(1)} tiết</td>
                      <td className="px-3 text-right font-mono border-r border-slate-200 font-medium">{summary.coVanHocTapAmt.toLocaleString('vi-VN')} đ</td>
                      <td className="px-2.5 text-right font-mono border-r border-slate-200 text-rose-600 font-medium">
                        -{(summary.coVanHocTapAmt * 0.1).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-3 text-right font-mono border-r border-slate-200 font-bold text-[#005325]">
                        {(summary.coVanHocTapAmt * 0.9).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-2.5 text-center border-r border-slate-200">
                        <span className="px-2 py-0.5 rounded text-[10.5px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          ✓ Đã xác nhận
                        </span>
                      </td>
                      <td className="px-2.5 text-center">
                        <button
                          onClick={() => setActiveTab('co_van_hoc_tap')}
                          className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer shadow-2xs transition-colors"
                        >
                          Xem bảng →
                        </button>
                      </td>
                    </tr>

                    {/* Row 6: Công tác khác */}
                    <tr className="h-[38px] hover:bg-emerald-50/50 even:bg-slate-50/40 transition-colors">
                      <td className="px-2 text-center font-mono border-r border-slate-200">6</td>
                      <td className="px-3 border-r border-slate-200 font-medium">Công tác khác (HĐKH, Ban thanh tra thi)</td>
                      <td className="px-3 border-r border-slate-200 text-slate-600">Ban Giám hiệu & Các đơn vị</td>
                      <td className="px-2.5 text-right font-mono border-r border-slate-200 font-medium">{summary.congTacKhacQC.toFixed(1)} tiết</td>
                      <td className="px-3 text-right font-mono border-r border-slate-200 font-medium">{summary.congTacKhacAmt.toLocaleString('vi-VN')} đ</td>
                      <td className="px-2.5 text-right font-mono border-r border-slate-200 text-rose-600 font-medium">
                        -{(summary.congTacKhacAmt * 0.1).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-3 text-right font-mono border-r border-slate-200 font-bold text-[#005325]">
                        {(summary.congTacKhacAmt * 0.9).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-2.5 text-center border-r border-slate-200">
                        <span className="px-2 py-0.5 rounded text-[10.5px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          ✓ Đã xác nhận
                        </span>
                      </td>
                      <td className="px-2.5 text-center">
                        <button
                          onClick={() => setActiveTab('cong_tac_khac')}
                          className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer shadow-2xs transition-colors"
                        >
                          Xem bảng →
                        </button>
                      </td>
                    </tr>
                  </tbody>

                  {/* Total footer */}
                  <tfoot>
                    <tr className="bg-emerald-50/90 border-t-2 border-emerald-400 font-bold h-[40px] text-slate-900">
                      <td colSpan={3} className="px-3 text-right font-bold text-slate-900">
                        TỔNG CỘNG THÙ LAO (6 NGUỒN HOẠT ĐỘNG):
                      </td>
                      <td className="px-2.5 text-right font-mono font-bold text-slate-900">
                        {summary.tongQC.toFixed(1)}
                      </td>
                      <td className="px-3 text-right font-mono font-bold text-slate-900">
                        {summary.tongThuLao.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-2.5 text-right font-mono font-bold text-rose-600">
                        -{summary.thueTNCN.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-3 text-right font-mono text-[#005325] font-extrabold text-[14px]">
                        {summary.thucNhan.toLocaleString('vi-VN')} đ
                      </td>
                      <td colSpan={2} className="px-2.5 text-center text-emerald-800 text-[11px] font-semibold">
                        ✓ Khớp 100% lệnh UNC
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 2 -> TAB 7: CÁC TAB CHI TIẾT TRÌNH BÀY BẢNG ĐẦY ĐỦ                */}
        {/* ===================================================================== */}
        {activeTab !== 'tong_quan' && (
          <div className="flex-1 w-full max-w-full min-w-0 flex flex-col overflow-hidden">
            {/* Responsive scroll hint banner */}
            <div className="xl:hidden flex items-center justify-between px-3 py-1.5 bg-emerald-50/80 border-b border-emerald-200 text-[11px] text-emerald-900 font-medium">
              <span>↔ Bảng có thể cuộn ngang để kiểm tra chi tiết tất cả các cột dữ liệu</span>
              <span className="text-[10px] bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded font-semibold">
                Cuộn ngang
              </span>
            </div>
            <div className="flex-1 w-full max-w-full min-w-0 overflow-x-auto">
              {/* Tab 2: Giờ giảng (BẢNG THỐNG KÊ CÔNG TÁC GIẢNG DẠY - Theo mẫu hình ảnh chuẩn) */}
              {activeTab === 'dao_tao' && (
                <div className="w-full flex flex-col">
                  {/* View mode toggle toolbar */}
                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">Chế độ hiển thị:</span>
                      <button
                        onClick={() => setTeachingViewMode('excel_sheet')}
                        className={`px-2.5 py-1 rounded text-xs cursor-pointer flex items-center gap-1 transition-colors ${
                          teachingViewMode === 'excel_sheet'
                            ? 'bg-[#005325] text-white font-medium shadow-2xs'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Mẫu Bảng thống kê chuẩn (Hình ảnh)</span>
                      </button>
                      <button
                        onClick={() => setTeachingViewMode('compact_table')}
                        className={`px-2.5 py-1 rounded text-xs cursor-pointer flex items-center gap-1 transition-colors ${
                          teachingViewMode === 'compact_table'
                            ? 'bg-[#005325] text-white font-medium shadow-2xs'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>Danh sách rút gọn</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setIsScheduleModalOpen(true)}
                      className="px-2.5 py-1 rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer flex items-center gap-1 text-xs"
                      title="Mở toàn màn hình / Cửa sổ riêng"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#005325]" />
                      <span>Xem dạng cửa sổ riêng</span>
                    </button>
                  </div>

                  {teachingViewMode === 'excel_sheet' ? (
                    <div className="p-2 sm:p-4 bg-slate-100/50">
                      <TeachingScheduleReport
                        maGV={selectedLecturer?.maGV}
                        records={records}
                        allLecturers={availableLecturers.map((l) => {
                          const r = records.find((rec) => rec.maGV === l.maGV);
                          return {
                            maGV: l.maGV,
                            hoTen: l.hoTen,
                            khoaBoMon: l.khoaBoMon,
                            hocHamHocVi: r?.hocHamHocVi || '',
                          };
                        })}
                        onSelectLecturer={(newMa) => setSearchQuery(newMa)}
                      />
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse min-w-[1100px] text-[12px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800 border-b-2 border-slate-300 font-semibold h-[38px] text-[11.5px] uppercase tracking-wider">
                          <th className="w-[45px] px-2 text-center border-r border-slate-200">STT</th>
                          <th className="px-3 border-r border-slate-200 min-w-[220px]">Môn giảng dạy</th>
                          <th className="px-2.5 text-center border-r border-slate-200 w-[130px]">Phân loại</th>
                          <th className="px-2.5 border-r border-slate-200 w-[115px]">Lớp học phần</th>
                          <th className="px-2 text-center border-r border-slate-200 w-[65px]">Số SV</th>
                          <th className="px-2 text-center border-r border-slate-200 w-[65px]">Số nhóm</th>
                          <th className="px-2 text-center border-r border-slate-200 w-[75px]">Số giờ MH</th>
                          <th className="px-2 text-center border-r border-slate-200 w-[80px]">Giờ thực giảng</th>
                          <th className="px-2 text-center border-r border-slate-200 w-[80px]">Hệ số nhóm</th>
                          <th className="px-2 text-center border-r border-slate-200 w-[70px]">Hệ số TC</th>
                          <th className="px-2.5 text-right border-r border-slate-200 w-[95px]">Số giờ QC</th>
                          <th className="px-3 text-right border-r border-slate-200 w-[125px]">Thù lao (VNĐ)</th>
                          <th className="px-3 text-right w-[125px]">Thực nhận (VNĐ)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e2e8f0]">
                        {currentTabRecords.length === 0 ? (
                          <tr>
                            <td colSpan={13} className="py-10 text-center text-slate-500 font-normal">
                              Chưa có dữ liệu kê khai giờ giảng cho Thầy/Cô trong học kỳ này.
                            </td>
                          </tr>
                        ) : (
                          currentTabRecords.map((rec, idx) => (
                            <tr key={rec.id} className="h-[38px] hover:bg-emerald-50/50 even:bg-slate-50/40 transition-colors">
                              <td className="px-2 text-center font-mono border-r border-[#f1f5f9]">{idx + 1}</td>
                              <td className="px-3 border-r border-[#f1f5f9] whitespace-nowrap font-normal">
                                <span className="truncate block max-w-[250px]" title={rec.tenHocPhan}>
                                  {rec.tenHocPhan}
                                </span>
                              </td>
                              <td className="px-2.5 text-center border-r border-[#f1f5f9] whitespace-nowrap">
                                {rec.phanLoaiGiangDay === 'thuc_hanh_thuc_tap' ? (
                                  <span className="px-2 py-0.5 rounded text-[10.5px] bg-slate-100 border border-slate-300">
                                    Thực hành, thực tập
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10.5px] bg-slate-100 border border-slate-300">
                                    Lý thuyết
                                  </span>
                                )}
                              </td>
                              <td className="px-2.5 font-mono border-r border-[#f1f5f9] whitespace-nowrap">
                                {rec.maLopHocPhan}
                              </td>
                              <td className="px-2 text-center font-mono border-r border-[#f1f5f9]">
                                {rec.soSinhVien || 60}
                              </td>
                              <td className="px-2 text-center font-mono border-r border-[#f1f5f9]">
                                {rec.soNhom || 1}
                              </td>
                              <td className="px-2 text-center font-mono border-r border-[#f1f5f9]">
                                {rec.soGioMonHoc || 45} h
                              </td>
                              <td className="px-2 text-center font-mono border-r border-[#f1f5f9]">
                                {rec.soGioThucGiang || 30} h
                              </td>
                              <td className="px-2 text-center font-mono border-r border-[#f1f5f9]">
                                {rec.heSoLopNhom || rec.heSoLop || 1.25}
                              </td>
                              <td className="px-2 text-center font-mono border-r border-[#f1f5f9]">
                                {rec.heSoTinChi || 1.0}
                              </td>
                              <td className="px-2.5 text-right font-mono border-r border-[#f1f5f9]">
                                {(rec.soGioQuyChuan || rec.tongTietQC).toFixed(1)}
                              </td>
                              <td className="px-3 text-right font-mono border-r border-[#f1f5f9]">
                                {rec.tongTienThuLao.toLocaleString('vi-VN')} đ
                              </td>
                              <td className="px-3 text-right font-mono font-normal">
                                {rec.thucNhan.toLocaleString('vi-VN')} đ
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Tab 3: Khảo thí */}
              {activeTab === 'khao_thi' && (
                <table className="w-full text-left border-collapse min-w-[1100px] text-[12px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b-2 border-slate-300 font-semibold h-[38px] text-[11.5px] uppercase tracking-wider">
                      <th className="w-[45px] px-2 text-center border-r border-slate-200">STT</th>
                      <th className="px-2.5 border-r border-slate-200 w-[140px]">Nhóm công việc</th>
                      <th className="px-2.5 border-r border-slate-200 w-[90px]">Mã CV</th>
                      <th className="px-3 border-r border-slate-200 min-w-[220px]">Tên công việc</th>
                      <th className="px-3 border-r border-slate-200 min-w-[170px]">Điều kiện thực hiện</th>
                      <th className="px-2 text-center border-r border-slate-200 w-[90px]">Quy đổi số giờ</th>
                      <th className="px-2 text-center border-r border-slate-200 w-[70px]">Số lượng</th>
                      <th className="px-2.5 border-r border-slate-200 w-[130px]">Ghi chú</th>
                      <th className="px-2.5 text-right border-r border-slate-200 w-[110px]">Số giờ theo CV</th>
                      <th className="px-3 text-right border-r border-slate-200 w-[125px]">Thù lao (VNĐ)</th>
                      <th className="px-3 text-right w-[125px]">Thực nhận (VNĐ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {currentTabRecords.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-10 text-center text-slate-500 font-normal">
                          Chưa có dữ liệu kê khai coi thi, ra đề hoặc chấm thi cho Thầy/Cô.
                        </td>
                      </tr>
                    ) : (
                      currentTabRecords.map((rec, idx) => (
                        <tr key={rec.id} className="h-[38px] hover:bg-emerald-50/50 even:bg-slate-50/40 transition-colors">
                          <td className="px-2 text-center font-mono border-r border-[#f1f5f9]">{idx + 1}</td>
                          <td className="px-2.5 border-r border-[#f1f5f9] whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10.5px] bg-slate-100 border border-slate-300">
                              {rec.nhomCongViec || rec.loaiHoatDong}
                            </span>
                          </td>
                          <td className="px-2.5 font-mono border-r border-[#f1f5f9] whitespace-nowrap">
                            {rec.maCV || 'CV_KT'}
                          </td>
                          <td className="px-3 border-r border-[#f1f5f9] whitespace-nowrap font-normal">
                            <span className="truncate block max-w-[240px]" title={rec.tenCongViec || rec.tenHocPhan}>
                              {rec.tenCongViec || rec.tenHocPhan}
                            </span>
                          </td>
                          <td className="px-3 border-r border-[#f1f5f9] whitespace-nowrap">
                            <span className="truncate block max-w-[180px]" title={rec.dieuKien || 'Theo quy chế TDU'}>
                              {rec.dieuKien || 'Theo quy chế TDU'}
                            </span>
                          </td>
                          <td className="px-2 text-center font-mono border-r border-[#f1f5f9]">
                            {rec.quyDoiSoGio || 1.5} h
                          </td>
                          <td className="px-2 text-center font-mono border-r border-[#f1f5f9]">
                            {rec.soLuong || 1}
                          </td>
                          <td className="px-2.5 border-r border-[#f1f5f9] whitespace-nowrap">
                            <span className="truncate block max-w-[130px]" title={rec.ghiChuThongTin || rec.maLopHocPhan}>
                              {rec.ghiChuThongTin || rec.maLopHocPhan}
                            </span>
                          </td>
                          <td className="px-2.5 text-right font-mono border-r border-[#f1f5f9]">
                            {(rec.tongSoGioTheoCV || rec.tongTietQC).toFixed(1)} h
                          </td>
                          <td className="px-3 text-right font-mono border-r border-[#f1f5f9]">
                            {rec.tongTienThuLao.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="px-3 text-right font-mono font-normal">
                            {rec.thucNhan.toLocaleString('vi-VN')} đ
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {/* Tab 4: Tuyển sinh */}
              {activeTab === 'tuyen_sinh' && (
                <table className="w-full text-left border-collapse min-w-[1100px] text-[12px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b-2 border-slate-300 font-semibold h-[38px] text-[11.5px] uppercase tracking-wider">
                      <th className="w-[45px] px-2 text-center border-r border-slate-200">STT</th>
                      <th className="px-3 border-r border-slate-200 min-w-[240px]">Nhiệm vụ công tác tuyển sinh</th>
                      <th className="px-3 border-r border-slate-200 w-[170px]">Địa bàn / Trường THPT</th>
                      <th className="px-2 text-center border-r border-slate-200 w-[90px]">Số ngày</th>
                      <th className="px-2.5 text-right border-r border-slate-200 w-[110px]">Tiết QC quy đổi</th>
                      <th className="px-3 text-right border-r border-slate-200 w-[110px]">Đơn giá tiết</th>
                      <th className="px-3 text-right border-r border-slate-200 w-[130px]">Tổng thù lao (VNĐ)</th>
                      <th className="px-2.5 text-right border-r border-slate-200 w-[110px]">Thuế 10%</th>
                      <th className="px-3 text-right w-[125px]">Thực nhận (VNĐ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {currentTabRecords.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-10 text-center text-slate-500 font-normal">
                          Chưa có dữ liệu kê khai công tác tuyển sinh cho Thầy/Cô.
                        </td>
                      </tr>
                    ) : (
                      currentTabRecords.map((rec, idx) => (
                        <tr key={rec.id} className="h-[38px] hover:bg-emerald-50/50 even:bg-slate-50/40 transition-colors">
                          <td className="px-2 text-center font-mono border-r border-[#f1f5f9]">{idx + 1}</td>
                          <td className="px-3 border-r border-[#f1f5f9] whitespace-nowrap font-normal">
                            <span className="truncate block max-w-[250px]" title={rec.tenHocPhan}>
                              {rec.tenHocPhan}
                            </span>
                          </td>
                          <td className="px-3 border-r border-[#f1f5f9] whitespace-nowrap">
                            {rec.maLopHocPhan}
                          </td>
                          <td className="px-2 text-center font-mono border-r border-[#f1f5f9]">
                            {rec.soTietLT} ngày
                          </td>
                          <td className="px-2.5 text-right font-mono border-r border-[#f1f5f9]">
                            {rec.tongTietQC}
                          </td>
                          <td className="px-3 text-right font-mono border-r border-[#f1f5f9]">
                            {rec.donGiaTiet.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="px-3 text-right font-mono border-r border-[#f1f5f9]">
                            {rec.tongTienThuLao.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="px-2.5 text-right font-mono border-r border-[#f1f5f9] text-rose-600">
                            -{rec.thueTNCN.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="px-3 text-right font-mono font-normal">
                            {rec.thucNhan.toLocaleString('vi-VN')} đ
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {/* Tab 5: NCKH (BẢNG THỐNG KÊ CÔNG TÁC NGHIÊN CỨU KHOA HỌC - Theo mẫu hình ảnh chuẩn) */}
              {activeTab === 'nckh' && (
                <div className="w-full flex flex-col">
                  {/* View mode toggle toolbar */}
                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">Chế độ hiển thị:</span>
                      <button
                        onClick={() => setResearchViewMode('excel_sheet')}
                        className={`px-2.5 py-1 rounded text-xs cursor-pointer flex items-center gap-1 transition-colors ${
                          researchViewMode === 'excel_sheet'
                            ? 'bg-purple-700 text-white font-medium shadow-2xs'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Mẫu Bảng thống kê NCKH (Hình ảnh)</span>
                      </button>
                      <button
                        onClick={() => setResearchViewMode('compact_table')}
                        className={`px-2.5 py-1 rounded text-xs cursor-pointer flex items-center gap-1 transition-colors ${
                          researchViewMode === 'compact_table'
                            ? 'bg-purple-700 text-white font-medium shadow-2xs'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>Danh sách rút gọn</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setIsResearchModalOpen(true)}
                      className="px-2.5 py-1 rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer flex items-center gap-1 text-xs"
                      title="Mở toàn màn hình / Cửa sổ riêng"
                    >
                      <Eye className="w-3.5 h-3.5 text-purple-700" />
                      <span>Xem dạng cửa sổ riêng</span>
                    </button>
                  </div>

                  {researchViewMode === 'excel_sheet' ? (
                    <div className="p-2 sm:p-4 bg-slate-100/50">
                      <ResearchScheduleReport
                        maGV={selectedLecturer?.maGV}
                        records={records}
                        allLecturers={availableLecturers.map((l) => {
                          const r = records.find((rec) => rec.maGV === l.maGV);
                          return {
                            maGV: l.maGV,
                            hoTen: l.hoTen,
                            khoaBoMon: l.khoaBoMon,
                            hocHamHocVi: r?.hocHamHocVi || '',
                          };
                        })}
                        onSelectLecturer={(newMa) => setSearchQuery(newMa)}
                        showInfoBox={false}
                      />
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse min-w-[1100px] text-[12px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800 border-b-2 border-slate-300 font-semibold h-[38px] text-[11.5px] uppercase tracking-wider">
                          <th className="w-[45px] px-2 text-center border-r border-slate-200">STT</th>
                          <th className="px-3 border-r border-slate-200 min-w-[260px]">Nội dung NCKH (Đề tài / Bài báo / Luận văn)</th>
                          <th className="px-3 border-r border-slate-200 w-[190px]">Thể loại</th>
                          <th className="px-2.5 text-right border-r border-slate-200 w-[110px]">Số giờ quy chuẩn</th>
                          <th className="px-2 text-center border-r border-slate-200 w-[100px]">Định mức</th>
                          <th className="px-2.5 text-center border-r border-slate-200 w-[130px]">Hoàn thành</th>
                          <th className="px-3 text-right border-r border-slate-200 w-[125px]">Thù lao / Thưởng</th>
                          <th className="px-3 text-right w-[125px]">Thực nhận (VNĐ)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e2e8f0]">
                        {currentTabRecords.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-10 text-center text-slate-500 font-normal">
                              Chưa có dữ liệu kê khai Nghiên cứu khoa học cho Thầy/Cô.
                            </td>
                          </tr>
                        ) : (
                          currentTabRecords.map((rec, idx) => (
                            <tr key={rec.id} className="h-[38px] hover:bg-emerald-50/50 even:bg-slate-50/40 transition-colors">
                              <td className="px-2 text-center font-mono border-r border-[#f1f5f9]">{idx + 1}</td>
                              <td className="px-3 border-r border-[#f1f5f9] whitespace-nowrap font-normal">
                                <span className="truncate block max-w-[280px]" title={rec.noiDungNCKH || rec.tenHocPhan}>
                                  {rec.noiDungNCKH || rec.tenHocPhan}
                                </span>
                              </td>
                              <td className="px-3 border-r border-[#f1f5f9] whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded text-[10.5px] bg-slate-100 border border-slate-300">
                                  {rec.theLoaiNCKH || 'Đề tài NCKH'}
                                </span>
                              </td>
                              <td className="px-2.5 text-right font-mono border-r border-[#f1f5f9]">
                                {rec.soGioQCNCKH || rec.tongTietQC} h
                              </td>
                              <td className="px-2 text-center font-mono border-r border-[#f1f5f9]">
                                {rec.dinhMucNCKH || 150} h
                              </td>
                              <td className="px-2.5 text-center border-r border-[#f1f5f9] whitespace-nowrap">
                                {(rec.mucDoHoanThanhNCKH === 'hoan_thanh' || (rec.soGioQCNCKH || rec.tongTietQC) >= 150) ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10.5px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    ✓ Hoàn thành
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10.5px] bg-amber-50 text-amber-800 border border-amber-200">
                                    Chưa hoàn thành
                                  </span>
                                )}
                              </td>
                              <td className="px-3 text-right font-mono border-r border-[#f1f5f9]">
                                {rec.tongTienThuLao.toLocaleString('vi-VN')} đ
                              </td>
                              <td className="px-3 text-right font-mono font-normal">
                                {rec.thucNhan.toLocaleString('vi-VN')} đ
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Tab 6: Cố vấn học tập */}
              {activeTab === 'co_van_hoc_tap' && (
                <table className="w-full text-left border-collapse min-w-[1100px] text-[12px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b-2 border-slate-300 font-semibold h-[38px] text-[11.5px] uppercase tracking-wider">
                      <th className="w-[45px] px-2 text-center border-r border-slate-200">STT</th>
                      <th className="px-3 border-r border-slate-200 min-w-[240px]">Nhiệm vụ Cố vấn học tập</th>
                      <th className="px-3 border-r border-slate-200 w-[150px]">Lớp phụ trách CVHT</th>
                      <th className="px-2 text-center border-r border-slate-200 w-[80px]">Số SV lớp</th>
                      <th className="px-2.5 text-right border-r border-slate-200 w-[110px]">Tiết định mức QC</th>
                      <th className="px-3 text-right border-r border-slate-200 w-[110px]">Đơn giá tiết</th>
                      <th className="px-3 text-right border-r border-slate-200 w-[130px]">Tổng thù lao (VNĐ)</th>
                      <th className="px-2.5 text-right border-r border-slate-200 w-[110px]">Thuế 10%</th>
                      <th className="px-3 text-right w-[125px]">Thực nhận (VNĐ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {currentTabRecords.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-10 text-center text-slate-500 font-normal">
                          Chưa có dữ liệu phân công Cố vấn học tập cho Thầy/Cô.
                        </td>
                      </tr>
                    ) : (
                      currentTabRecords.map((rec, idx) => (
                        <tr key={rec.id} className="h-[38px] hover:bg-emerald-50/50 even:bg-slate-50/40 transition-colors">
                          <td className="px-2 text-center font-mono border-r border-[#f1f5f9]">{idx + 1}</td>
                          <td className="px-3 border-r border-[#f1f5f9] whitespace-nowrap font-normal">
                            <span className="truncate block max-w-[260px]" title={rec.tenHocPhan}>
                              {rec.tenHocPhan}
                            </span>
                          </td>
                          <td className="px-3 font-mono border-r border-[#f1f5f9] whitespace-nowrap">
                            {rec.maLopHocPhan}
                          </td>
                          <td className="px-2 text-center font-mono border-r border-[#f1f5f9]">
                            {rec.soSinhVien || 60}
                          </td>
                          <td className="px-2.5 text-right font-mono border-r border-[#f1f5f9]">
                            {rec.tongTietQC}
                          </td>
                          <td className="px-3 text-right font-mono border-r border-[#f1f5f9]">
                            {rec.donGiaTiet.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="px-3 text-right font-mono border-r border-[#f1f5f9]">
                            {rec.tongTienThuLao.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="px-2.5 text-right font-mono border-r border-[#f1f5f9] text-rose-600">
                            -{rec.thueTNCN.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="px-3 text-right font-mono font-normal">
                            {rec.thucNhan.toLocaleString('vi-VN')} đ
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {/* Tab 7: Công tác khác */}
              {activeTab === 'cong_tac_khac' && (
                <table className="w-full text-left border-collapse min-w-[1100px] text-[12px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b-2 border-slate-300 font-semibold h-[38px] text-[11.5px] uppercase tracking-wider">
                      <th className="w-[45px] px-2 text-center border-r border-slate-200">STT</th>
                      <th className="px-3 border-r border-slate-200 min-w-[260px]">Nhiệm vụ công tác kiêm nhiệm</th>
                      <th className="px-3 border-r border-slate-200 w-[170px]">Căn cứ phân công / Quyết định</th>
                      <th className="px-2.5 text-right border-r border-slate-200 w-[110px]">Tiết định mức QC</th>
                      <th className="px-3 text-right border-r border-slate-200 w-[110px]">Đơn giá / Tiết</th>
                      <th className="px-3 text-right border-r border-slate-200 w-[130px]">Tổng thù lao (VNĐ)</th>
                      <th className="px-2.5 text-right border-r border-slate-200 w-[110px]">Thuế 10%</th>
                      <th className="px-3 text-right w-[125px]">Thực nhận (VNĐ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {currentTabRecords.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-slate-500 font-normal">
                          Chưa có dữ liệu kê khai công tác khác cho Thầy/Cô.
                        </td>
                      </tr>
                    ) : (
                      currentTabRecords.map((rec, idx) => (
                        <tr key={rec.id} className="h-[38px] hover:bg-emerald-50/50 even:bg-slate-50/40 transition-colors">
                          <td className="px-2 text-center font-mono border-r border-[#f1f5f9]">{idx + 1}</td>
                          <td className="px-3 border-r border-[#f1f5f9] whitespace-nowrap font-normal">
                            <span className="truncate block max-w-[280px]" title={rec.tenHocPhan}>
                              {rec.tenHocPhan}
                            </span>
                          </td>
                          <td className="px-3 border-r border-[#f1f5f9] whitespace-nowrap font-mono">
                            {rec.maLopHocPhan}
                          </td>
                          <td className="px-2.5 text-right font-mono border-r border-[#f1f5f9]">
                            {rec.tongTietQC}
                          </td>
                          <td className="px-3 text-right font-mono border-r border-[#f1f5f9]">
                            {rec.donGiaTiet.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="px-3 text-right font-mono border-r border-[#f1f5f9]">
                            {rec.tongTienThuLao.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="px-2.5 text-right font-mono border-r border-[#f1f5f9] text-rose-600">
                            -{rec.thueTNCN.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="px-3 text-right font-mono font-normal">
                            {rec.thucNhan.toLocaleString('vi-VN')} đ
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Sub-total summary footer matching DataTable */}
            <div className="bg-[#fcfcfd] border-t border-[#cbd5e1] px-4 py-2 flex items-center justify-between flex-wrap gap-2 text-[12px]">
              <span className="text-slate-600">
                Hiển thị {currentTabRecords.length} dòng kê khai chi tiết trong mục {currentTabConfig.label}.
              </span>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Khối lượng QC:</span>
                  <span className="font-mono text-slate-800 font-normal">
                    {currentTabRecords
                      .reduce(
                        (s, r) =>
                          s +
                          (r.soGioQuyChuan ||
                            r.soGioQCNCKH ||
                            r.tongSoGioTheoCV ||
                            r.tongTietQC ||
                            0),
                        0
                      )
                      .toFixed(1)}{' '}
                    tiết/giờ
                  </span>
                </div>

                <span className="text-slate-300">·</span>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Tổng thù lao gộp:</span>
                  <span className="font-mono text-slate-800 font-normal">
                    {currentTabRecords
                      .reduce((s, r) => s + r.tongTienThuLao, 0)
                      .toLocaleString('vi-VN')}{' '}
                    đ
                  </span>
                </div>

                <span className="text-slate-300">·</span>

                <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  <span className="text-emerald-800 font-normal">Thực nhận sau thuế:</span>
                  <span className="font-mono text-[#005325] font-semibold">
                    {currentTabRecords
                      .reduce((s, r) => s + r.thucNhan, 0)
                      .toLocaleString('vi-VN')}{' '}
                  </span>
                </div>

                <span className="text-slate-300 hidden md:inline">·</span>

                {/* Bottom Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenFeedbackForTab(activeTab)}
                    className="h-[28px] px-3 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-sm flex items-center gap-1.5 text-[11.5px] font-medium shadow-xs transition-colors cursor-pointer"
                    title="Gửi phản hồi / khiếu nại cho mục này"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-white" />
                    <span>Phản hồi mục này</span>
                  </button>

                  <button
                    onClick={() => handleConfirmCategory(activeTab)}
                    className="h-[28px] px-3.5 bg-[#005325] hover:bg-[#00421e] text-white rounded-sm flex items-center gap-1.5 text-[11.5px] font-semibold shadow-xs transition-colors cursor-pointer"
                    title="Đồng ý xác nhận số liệu mục này"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5] text-emerald-200" />
                    <span>Đồng ý mục này</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. COMPACT FEEDBACK MODAL                                                 */}
      {/* ========================================================================= */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-xl border border-slate-300 max-w-lg w-full overflow-hidden">
            <div className="bg-[#005325] text-white px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-300" />
                <h3 className="text-[13px] font-normal">
                  Gửi phản hồi / Khiếu nại số liệu thù lao
                </h3>
              </div>
              <button
                onClick={() => setIsFeedbackOpen(false)}
                className="text-white/80 hover:text-white text-base font-normal cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="p-4 space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded p-2 text-[11.5px] text-amber-900 font-normal">
                Ý kiến sẽ được chuyển trực tiếp đến ban chuyên môn đối soát và đính chính số liệu trước khi chốt chi trả.
              </div>

              <div>
                <label className="block text-[11.5px] font-normal text-slate-700 mb-0.5">
                  Giảng viên phản hồi
                </label>
                <input
                  type="text"
                  disabled
                  value={`${summary.hoTen} (${summary.maGV}) - ${summary.khoaBoMon}`}
                  className="w-full h-[30px] bg-slate-100 border border-slate-300 rounded px-2.5 text-[12px] text-slate-700 font-normal"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-normal text-slate-700 mb-0.5">
                  Nội dung / Học phần phản hồi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={feedbackSubject}
                  onChange={(e) => setFeedbackSubject(e.target.value)}
                  className="w-full h-[30px] border border-slate-300 rounded px-2.5 text-[12px] text-slate-800 font-normal focus:ring-1 focus:ring-[#005325] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-normal text-slate-700 mb-0.5">
                  Phân loại khiếu nại <span className="text-red-500">*</span>
                </label>
                <select
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value as any)}
                  className="w-full h-[30px] border border-slate-300 rounded px-2 text-[12px] bg-white text-slate-800 font-normal focus:outline-none focus:ring-1 focus:ring-[#005325]"
                >
                  <option value="sai_so_tiet">Sai số tiết giảng dạy / tiết quy chuẩn (QC)</option>
                  <option value="thieu_lop">Thiếu học phần / ca coi thi / nhiệm vụ kiêm nhiệm</option>
                  <option value="sai_he_so">Sai hệ số lớp đông hoặc hệ số chức danh</option>
                  <option value="sai_don_gia">Sai mức đơn giá thanh toán</option>
                  <option value="khac">Khác (Thông tin tài khoản ngân hàng, CCCD...)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11.5px] font-normal text-slate-700 mb-0.5">
                  Nội dung phản hồi chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Thầy/Cô vui lòng ghi rõ số tiết thực tế, chênh lệch hoặc minh chứng cần bổ sung..."
                  value={feedbackContent}
                  onChange={(e) => setFeedbackContent(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-[12px] text-slate-800 font-normal focus:ring-1 focus:ring-[#005325] focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFeedbackOpen(false)}
                  className="h-[30px] px-3 text-[12px] text-slate-600 font-normal hover:bg-slate-100 rounded border border-slate-300 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="h-[30px] px-4 bg-[#005325] hover:bg-[#00421e] text-white text-[12px] font-normal rounded shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi phản hồi ngay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teaching Schedule Modal (Exact sheet view) */}
      <TeachingScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        maGV={selectedLecturer?.maGV || ''}
        records={records}
        allLecturers={availableLecturers.map((l) => {
          const r = records.find((rec) => rec.maGV === l.maGV);
          return {
            maGV: l.maGV,
            hoTen: l.hoTen,
            khoaBoMon: l.khoaBoMon,
            hocHamHocVi: r?.hocHamHocVi || '',
          };
        })}
        onSelectLecturer={(newMa) => setSearchQuery(newMa)}
      />

      {/* Research Schedule Modal (Exact sheet view) */}
      <ResearchScheduleModal
        isOpen={isResearchModalOpen}
        onClose={() => setIsResearchModalOpen(false)}
        maGV={selectedLecturer?.maGV || ''}
        records={records}
        allLecturers={availableLecturers.map((l) => {
          const r = records.find((rec) => rec.maGV === l.maGV);
          return {
            maGV: l.maGV,
            hoTen: l.hoTen,
            khoaBoMon: l.khoaBoMon,
            hocHamHocVi: r?.hocHamHocVi || '',
          };
        })}
        onSelectLecturer={(newMa) => setSearchQuery(newMa)}
      />
    </div>
  );
};
