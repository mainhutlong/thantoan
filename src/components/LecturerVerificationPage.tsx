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
  FileSpreadsheet,
  MoreVertical,
  Edit3,
  Save,
  Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { TeachingRecord, FeedbackItem, UserRole, UserAccount } from '../types';
import { TeachingScheduleReport } from './TeachingScheduleReport';
import { ResearchScheduleReport } from './ResearchScheduleReport';

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
  const [isTopViewMenuOpen, setIsTopViewMenuOpen] = useState(false);
  const [isTopActionMenuOpen, setIsTopActionMenuOpen] = useState(false);
  const [isSheetEditable, setIsSheetEditable] = useState(true);

  // Feedback form state
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState<
    'sai_so_tiet' | 'thieu_lop' | 'sai_he_so' | 'sai_don_gia' | 'khac'
  >('sai_so_tiet');
  const [feedbackTargetTab, setFeedbackTargetTab] = useState<TabKey>('tong_quan');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Per-Lecturer & Per-Category approval states (default pending so buttons start recessed/unconfirmed)
  const [categoryStates, setCategoryStates] = useState<
    Record<string, Record<TabKey, CategoryApprovalStatus>>
  >({
    TDU00128: {
      tong_quan: { status: 'pending' },
      dao_tao: { status: 'pending' },
      khao_thi: { status: 'pending' },
      tuyen_sinh: { status: 'pending' },
      nckh: { status: 'pending' },
      co_van_hoc_tap: { status: 'pending' },
      cong_tac_khac: { status: 'pending' },
    },
    TDU00245: {
      tong_quan: { status: 'pending' },
      dao_tao: { status: 'pending' },
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

  const detailTabKeys: TabKey[] = [
    'dao_tao',
    'khao_thi',
    'tuyen_sinh',
    'nckh',
    'co_van_hoc_tap',
    'cong_tac_khac',
  ];

  const confirmedDetailCount = detailTabKeys.filter(
    (k) => getTabStatus(k).status === 'confirmed'
  ).length;
  const areAllDetailsConfirmed = confirmedDetailCount === detailTabKeys.length;

  // Handle confirm / unconfirm agree
  const handleConfirmCategory = (tabKey: TabKey) => {
    if (!selectedLecturer) return;

    const categoryNames: Record<TabKey, string> = {
      tong_quan: 'Toàn bộ tổng hợp thù lao',
      dao_tao: 'Thanh toán giờ giảng',
      khao_thi: 'Coi thi, chấm thi, ra đề',
      tuyen_sinh: 'Công tác tuyển sinh',
      nckh: 'Nghiên cứu khoa học',
      co_van_hoc_tap: 'Cố vấn học tập',
      cong_tac_khac: 'Công tác khác',
    };

    const currentStatus = getTabStatus(tabKey).status;

    // Nếu mục này đã đồng ý -> Bấm lại để Bỏ đồng ý
    if (currentStatus === 'confirmed') {
      setCategoryStates((prev) => {
        const lecturerMap = prev[selectedLecturer.maGV] || ({} as Record<TabKey, CategoryApprovalStatus>);
        const updated = {
          ...lecturerMap,
          [tabKey]: { status: 'pending' as const },
        };
        // Nếu bỏ đồng ý 1 mục con thì mục Thống kê tổng tiền cũng tự bỏ đồng ý toàn bộ
        if (tabKey !== 'tong_quan') {
          updated.tong_quan = { status: 'pending' as const };
        }
        return {
          ...prev,
          [selectedLecturer.maGV]: updated,
        };
      });
      showToast(`Đã bỏ đồng ý xác nhận: ${categoryNames[tabKey]}`);
      return;
    }

    if (tabKey === 'tong_quan' && !areAllDetailsConfirmed) {
      showToast(
        `Vui lòng bấm Đồng ý hết 6 mục chi tiết (hiện đã đồng ý ${confirmedDetailCount}/6 mục) trước khi Đồng ý toàn bộ!`
      );
      return;
    }

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

      return {
        ...prev,
        [selectedLecturer.maGV]: updated,
      };
    });

    showToast(`Đã đồng ý xác nhận thành công: ${categoryNames[tabKey]}`);

    if (onConfirmVerification) {
      onConfirmVerification(selectedLecturer.maGV, tabKey);
    }
  };

  // Toggle inline feedback form
  const handleOpenFeedbackForTab = (tabKey: TabKey) => {
    if (isFeedbackOpen && feedbackTargetTab === tabKey) {
      setIsFeedbackOpen(false);
      return;
    }
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

    showToast('Đã gửi phản hồi thành công đến Phòng Chuyên môn!');
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
    amount: number;
    qc: number;
    softStyle: string;
    confirmedStyle: string;
    count: number;
  }[] = [
    {
      key: 'tong_quan',
      label: 'Thống kê tổng tiền',
      badgeName: 'Tổng hợp 6 nguồn',
      softStyle: 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200',
      confirmedStyle: 'bg-[#005325] hover:bg-[#00421e] text-white border border-[#005325]',
      amount: summary.thucNhan,
      qc: summary.tongQC,
      count: lecturerRecords.length,
    },
    {
      key: 'dao_tao',
      label: 'Thanh toán giờ giảng',
      badgeName: 'P. Đào tạo',
      softStyle: 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200',
      confirmedStyle: 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600',
      amount: summary.daoTaoAmt > 0 ? summary.daoTaoAmt * 0.9 : 0,
      qc: summary.daoTaoQC,
      count: lecturerRecords.filter((r) => r.phongBanQuanLy === 'dao_tao').length,
    },
    {
      key: 'khao_thi',
      label: 'Coi thi, ra đề, chấm thi',
      badgeName: 'TT Khảo thí',
      softStyle: 'bg-blue-50 hover:bg-blue-100/80 text-blue-700 border border-blue-200',
      confirmedStyle: 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-600',
      amount: summary.khaoThiAmt > 0 ? summary.khaoThiAmt * 0.9 : 0,
      qc: summary.khaoThiQC,
      count: lecturerRecords.filter((r) => r.phongBanQuanLy === 'khao_thi').length,
    },
    {
      key: 'tuyen_sinh',
      label: 'Công tác tuyển sinh',
      badgeName: 'P. Tuyển sinh',
      softStyle: 'bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 border border-indigo-200',
      confirmedStyle: 'bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600',
      amount: summary.tuyenSinhAmt > 0 ? summary.tuyenSinhAmt * 0.9 : 0,
      qc: summary.tuyenSinhQC,
      count: lecturerRecords.filter((r) => r.phongBanQuanLy === 'tuyen_sinh').length,
    },
    {
      key: 'nckh',
      label: 'Nghiên cứu khoa học',
      badgeName: 'P. NCKH',
      softStyle: 'bg-amber-50 hover:bg-amber-100/80 text-amber-800 border border-amber-200',
      confirmedStyle: 'bg-amber-600 hover:bg-amber-700 text-white border border-amber-600',
      amount: summary.nckhAmt > 0 ? summary.nckhAmt * 0.9 : 0,
      qc: summary.nckhQC,
      count: lecturerRecords.filter((r) => r.phongBanQuanLy === 'nckh').length,
    },
    {
      key: 'co_van_hoc_tap',
      label: 'Cố vấn học tập',
      badgeName: 'P. CTSV',
      softStyle: 'bg-teal-50 hover:bg-teal-100/80 text-teal-800 border border-teal-200',
      confirmedStyle: 'bg-teal-600 hover:bg-teal-700 text-white border border-teal-600',
      amount: summary.coVanHocTapAmt > 0 ? summary.coVanHocTapAmt * 0.9 : 0,
      qc: summary.coVanHocTapQC,
      count: lecturerRecords.filter((r) => r.phongBanQuanLy === 'co_van_hoc_tap').length,
    },
    {
      key: 'cong_tac_khac',
      label: 'Công tác khác',
      badgeName: 'HĐKH, Thanh tra',
      softStyle: 'bg-purple-50 hover:bg-purple-100/80 text-purple-700 border border-purple-200',
      confirmedStyle: 'bg-purple-600 hover:bg-purple-700 text-white border border-purple-600',
      amount: summary.congTacKhacAmt > 0 ? summary.congTacKhacAmt * 0.9 : 0,
      qc: summary.congTacKhacQC,
      count: lecturerRecords.filter((r) => r.phongBanQuanLy === 'cong_tac_khac').length,
    },
  ];

  const currentTabConfig = tabsConfig.find((t) => t.key === activeTab)!;

  return (
    <div className="flex-1 w-full max-w-full min-w-0 bg-white flex flex-col min-h-0 select-none">
      {/* Toast Notification (Text Only, No Icon) */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#005325] text-white px-4 py-2 rounded-lg shadow-md text-[12px] font-medium">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HORIZONTAL TABS ON A SINGLE ROW                                        */}
      {/*    - Chưa đồng ý & không chọn: ẩn xuống (mờ/xám nhạt, hạ thấp)            */}
      {/*    - Click vào: hiện nổi lên                                              */}
      {/*    - Đã bấm Đồng ý: hiện màu cố định luôn                                 */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-[#e2e8f0] px-3 py-2 w-full max-w-full min-w-0 flex items-center gap-1.5 flex-wrap">
        <div className="flex items-center flex-wrap gap-1.5 text-[11.5px]">
          {tabsConfig.map((tab) => {
            const isActive = activeTab === tab.key;
            const isConfirmed = getTabStatus(tab.key).status === 'confirmed';

            let buttonStyle = '';
            if (isConfirmed) {
              // Đã bấm đồng ý -> Hiện màu đậm nổi bật cố định luôn
              buttonStyle = isActive
                ? `${tab.confirmedStyle} -translate-y-[1.5px] shadow-sm ring-2 ring-offset-1 ring-slate-300 font-semibold opacity-100`
                : `${tab.confirmedStyle} translate-y-0 shadow-xs font-semibold opacity-100`;
            } else if (isActive) {
              // Chưa đồng ý nhưng đang click vào xem -> Hiện nổi lên với màu pastel rõ
              buttonStyle = `${tab.softStyle} -translate-y-[1.5px] shadow-xs ring-1 ring-current/25 font-semibold opacity-100`;
            } else {
              // Chưa đồng ý và chuyển qua nút khác -> Ẩn xuống với màu pastel nhẹ dịu (không nổi bật như khi bấm đồng ý)
              buttonStyle = `${tab.softStyle} translate-y-[1.5px] opacity-65 hover:opacity-90 font-normal shadow-none`;
            }

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`h-[30px] px-2.5 rounded-lg flex items-center transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${buttonStyle}`}
                title={`Xem chi tiết: ${tab.label}`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ACTION BAR FOR CURRENT TAB                                             */}
      {/* ========================================================================= */}
      <div className="bg-[#f8fafc] border-b border-[#e2e8f0] px-3 py-1.5 flex items-center justify-between flex-wrap gap-2 w-full max-w-full">
        {/* Left: Tab Title & Lecturer Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-[12.5px] font-semibold text-slate-800">
            {activeTab === 'tong_quan'
              ? 'Bảng đối soát tổng hợp 6 nguồn hoạt động'
              : `Bảng kê khai chi tiết: ${currentTabConfig.label}`}
          </h2>

          {currentRole !== 'lecturer' ? (
            <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 h-[28px]">
              <select
                value={selectedLecturer?.maGV || ''}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-[11.5px] font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                {availableLecturers.map((l) => (
                  <option key={l.maGV} value={l.maGV}>
                    {l.maGV} - {l.hoTen}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span className="text-[11.5px] text-slate-500">
              ({summary.hoTen} · {summary.maGV})
            </span>
          )}
        </div>

        {/* Right: AGREE & FEEDBACK ACTION BUTTONS + EYE (CHẾ ĐỘ HIỂN THỊ) & 3 DOTS (TÙY CHỌN) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => handleOpenFeedbackForTab(activeTab)}
            className={`h-[30px] px-3 rounded-lg flex items-center text-[11.5px] font-medium transition-colors cursor-pointer whitespace-nowrap border ${
              isFeedbackOpen
                ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
            }`}
            title="Gửi phản hồi / khiếu nại cho mục này"
          >
            <span>
              {isFeedbackOpen
                ? 'Đóng phản hồi'
                : activeTab === 'tong_quan'
                ? 'Gửi phản hồi / Khiếu nại'
                : 'Phản hồi mục này'}
            </span>
          </button>

          <button
            onClick={() => handleConfirmCategory(activeTab)}
            disabled={activeTab === 'tong_quan' && !areAllDetailsConfirmed && activeTabStatus.status !== 'confirmed'}
            className={`h-[30px] px-3 rounded-lg flex items-center text-[11.5px] font-medium transition-colors whitespace-nowrap ${
              activeTabStatus.status === 'confirmed'
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 cursor-pointer'
                : activeTab === 'tong_quan' && !areAllDetailsConfirmed
                ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                : 'bg-[#005325] hover:bg-[#00421e] text-white shadow-2xs cursor-pointer'
            }`}
            title={
              activeTabStatus.status === 'confirmed'
                ? 'Bấm để bỏ đồng ý xác nhận mục này'
                : activeTab === 'tong_quan' && !areAllDetailsConfirmed
                ? `Cần đồng ý hết 6 mục chi tiết (${confirmedDetailCount}/6) trước khi đồng ý toàn bộ`
                : 'Đồng ý xác nhận số liệu mục này'
            }
          >
            <span>
              {activeTab === 'tong_quan'
                ? activeTabStatus.status === 'confirmed'
                  ? 'Bỏ đồng ý toàn bộ'
                  : areAllDetailsConfirmed
                  ? 'Đồng ý xác nhận toàn bộ'
                  : `Đồng ý xác nhận toàn bộ (${confirmedDetailCount}/6)`
                : activeTabStatus.status === 'confirmed'
                ? 'Bỏ đồng ý mục này'
                : 'Đồng ý mục này'}
            </span>
          </button>

          {/* Nút Con mắt: Chế độ hiển thị (kế bên dấu 3 chấm dọc) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsTopViewMenuOpen((prev) => !prev);
                setIsTopActionMenuOpen(false);
              }}
              className="w-[30px] h-[30px] rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer flex items-center justify-center transition-colors shadow-2xs"
              title="Chế độ hiển thị"
            >
              <Eye className="w-4 h-4 text-slate-700" />
            </button>

            {isTopViewMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsTopViewMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-40 flex flex-col">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Chế độ hiển thị
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTeachingViewMode('excel_sheet');
                      setResearchViewMode('excel_sheet');
                      if (activeTab === 'tong_quan') {
                        setActiveTab('dao_tao');
                      }
                      setIsTopViewMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-xs text-left hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors ${
                      (activeTab === 'nckh' ? researchViewMode : teachingViewMode) === 'excel_sheet'
                        ? 'text-[#005325] font-semibold bg-emerald-50/50'
                        : 'text-slate-700'
                    }`}
                  >
                    <span>Mẫu Bảng thống kê chuẩn</span>
                    {(activeTab === 'nckh' ? researchViewMode : teachingViewMode) === 'excel_sheet' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#005325]" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTeachingViewMode('compact_table');
                      setResearchViewMode('compact_table');
                      setIsTopViewMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-xs text-left hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors ${
                      (activeTab === 'nckh' ? researchViewMode : teachingViewMode) === 'compact_table'
                        ? 'text-[#005325] font-semibold bg-emerald-50/50'
                        : 'text-slate-700'
                    }`}
                  >
                    <span>Danh sách rút gọn</span>
                    {(activeTab === 'nckh' ? researchViewMode : teachingViewMode) === 'compact_table' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#005325]" />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Nút Dấu 3 chấm dọc: Đang bật nhập liệu, Lưu bảng, Xuất Excel, In biểu mẫu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsTopActionMenuOpen((prev) => !prev);
                setIsTopViewMenuOpen(false);
              }}
              className="w-[30px] h-[30px] rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer flex items-center justify-center transition-colors shadow-2xs"
              title="Tùy chọn thao tác"
            >
              <MoreVertical className="w-4 h-4 text-slate-700" />
            </button>

            {isTopActionMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsTopActionMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-40 flex flex-col">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSheetEditable((prev) => !prev);
                      setIsTopActionMenuOpen(false);
                      showToast(!isSheetEditable ? 'Đã bật chế độ nhập dữ liệu' : 'Đã chuyển sang chế độ xem');
                    }}
                    className="w-full px-3 py-2 text-xs text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors text-slate-700"
                  >
                    <Edit3 className={`w-3.5 h-3.5 ${isSheetEditable ? 'text-amber-600' : 'text-slate-500'}`} />
                    <span className={isSheetEditable ? 'font-medium text-amber-800' : ''}>
                      {isSheetEditable ? 'Đang bật nhập liệu' : 'Chế độ xem'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsTopActionMenuOpen(false);
                      showToast('Đã lưu bảng dữ liệu thành công!');
                    }}
                    className="w-full px-3 py-2 text-xs text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors text-slate-700"
                  >
                    <Save className="w-3.5 h-3.5 text-[#005325]" />
                    <span>Lưu bảng</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsTopActionMenuOpen(false);
                      const exportRows = (activeTab === 'tong_quan' ? lecturerRecords : currentTabRecords).map((r, i) => ({
                        STT: i + 1,
                        'Mã GV': r.maGV,
                        'Họ và tên': r.hoTen,
                        'Nội dung / Học phần': r.tenHocPhan || r.noiDungNCKH || r.tenCongViec || '',
                        'Lớp / Mã': r.maLopHocPhan || '',
                        'Số tiết / Giờ QC': r.tongTietQC,
                        'Thù lao gộp (VNĐ)': r.tongTienThuLao,
                        'Thuế TNCN (VNĐ)': r.thueTNCN,
                        'Thực nhận (VNĐ)': r.thucNhan,
                      }));
                      const wb = XLSX.utils.book_new();
                      const ws = XLSX.utils.json_to_sheet(exportRows.length > 0 ? exportRows : [{ 'Thông báo': 'Chưa có dữ liệu' }]);
                      XLSX.utils.book_append_sheet(wb, ws, 'Bang_Ke_Giang_Vien');
                      XLSX.writeFile(wb, `Bang_Thong_Ke_${summary.maGV || 'TDU'}.xlsx`);
                    }}
                    className="w-full px-3 py-2 text-xs text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors text-slate-700"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Xuất Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsTopActionMenuOpen(false);
                      window.print();
                    }}
                    className="w-full px-3 py-2 text-xs text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors text-slate-700"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>In biểu mẫu</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2B. INLINE FEEDBACK PANEL (Hiển thị trực tiếp trên giao diện, gọn đẹp)    */}
      {/* ========================================================================= */}
      {isFeedbackOpen && (
        <div className="bg-slate-50/90 border-b border-slate-200 px-3.5 py-2.5 w-full max-w-full">
          <form
            onSubmit={handleSubmitFeedback}
            className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-amber-500 shadow-xs px-4 py-3 space-y-2.5"
          >
            {/* Dòng tiêu đề + thông tin người gửi */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 text-[12px]">
                <span className="font-semibold text-slate-800">Phản hồi / Đề xuất điều chỉnh số liệu</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600 font-normal">
                  Giảng viên: <strong className="font-medium text-slate-800">{summary.hoTen}</strong> ({summary.maGV})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-[11.5px] font-normal cursor-pointer px-2 py-0.5 rounded hover:bg-slate-100 transition-colors"
              >
                Đóng
              </button>
            </div>

            {/* Các trường nhập liệu trên bố cục lưới gọn gàng */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-start">
              <div className="lg:col-span-4">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Mục / Học phần cần phản hồi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={feedbackSubject}
                  onChange={(e) => setFeedbackSubject(e.target.value)}
                  className="w-full h-[31px] border border-slate-200 rounded-lg px-2.5 text-[12px] text-slate-800 font-normal bg-slate-50/50 focus:bg-white focus:border-[#005325] focus:outline-none transition-colors"
                />
              </div>

              <div className="lg:col-span-3">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Phân loại phản hồi <span className="text-rose-500">*</span>
                </label>
                <select
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value as any)}
                  className="w-full h-[31px] border border-slate-200 rounded-lg px-2 text-[12px] bg-slate-50/50 focus:bg-white text-slate-800 font-normal focus:outline-none focus:border-[#005325] transition-colors"
                >
                  <option value="sai_so_tiet">Sai số tiết / giờ quy chuẩn</option>
                  <option value="thieu_lop">Thiếu lớp / nhiệm vụ / coi thi</option>
                  <option value="sai_he_so">Sai hệ số lớp đông / chức danh</option>
                  <option value="sai_don_gia">Sai mức đơn giá thanh toán</option>
                  <option value="khac">Khác (Tài khoản NH, CCCD...)</option>
                </select>
              </div>

              <div className="lg:col-span-5">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Nội dung chi tiết <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ghi rõ số tiết thực tế, nội dung chênh lệch hoặc minh chứng..."
                  value={feedbackContent}
                  onChange={(e) => setFeedbackContent(e.target.value)}
                  className="w-full h-[31px] border border-slate-200 rounded-lg px-2.5 text-[12px] bg-slate-50/50 focus:bg-white text-slate-800 font-normal focus:border-[#005325] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Chân khung phản hồi */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
              <span className="text-[11px] text-slate-400 font-normal">
                Nội dung phản hồi được gửi trực tiếp về bộ phận chuyên môn để đối soát và điều chỉnh.
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsFeedbackOpen(false)}
                  className="h-[28px] px-3 text-[11.5px] text-slate-600 font-normal hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer bg-white transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="h-[28px] px-3.5 bg-[#005325] hover:bg-[#00421e] text-white text-[11.5px] font-medium rounded-lg shadow-2xs cursor-pointer transition-colors"
                >
                  Gửi phản hồi
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB CONTENT: DATA TABLES & SUMMARY GRIDS                               */}
      {/* ========================================================================= */}
      <div className="flex-1 w-full max-w-full min-w-0 flex flex-col min-h-0 bg-white">
        {/* ===================================================================== */}
        {/* TAB 1: THỐNG KÊ TỔNG TIỀN (GỌN GÀNG, ĐƠN GIẢN)                        */}
        {/* ===================================================================== */}
        {activeTab === 'tong_quan' && (
          <div className="p-4 space-y-3 w-full max-w-full min-w-0">
            {/* Compact & Minimal Total Summary Bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-[12.5px]">
              <div className="flex items-baseline gap-2">
                <span className="text-slate-600 font-medium">Tổng thực nhận (sau thuế 10%):</span>
                <span className="text-[18px] font-bold text-[#005325]">
                  {summary.thucNhan.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-5 text-[12px] text-slate-600">
                <div>
                  <span>Tổng khối lượng QC: </span>
                  <span className="font-semibold text-slate-800">{summary.tongQC.toFixed(1)} tiết/h</span>
                </div>
                <span className="text-slate-300">|</span>
                <div>
                  <span>Thù lao gộp: </span>
                  <span className="font-semibold text-slate-800">{summary.tongThuLao.toLocaleString('vi-VN')} đ</span>
                </div>
                <span className="text-slate-300">|</span>
                <div>
                  <span>Thuế TNCN (10%): </span>
                  <span className="font-semibold text-slate-800">-{summary.thueTNCN.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>

            {/* Consolidated Table of All 6 Sources */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="overflow-x-auto w-full max-w-full">
                <table className="w-full text-left border-collapse text-[12.5px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b border-slate-200 font-semibold h-[38px]">
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
                    <tr className="h-[38px] hover:bg-slate-50 transition-colors">
                      <td className="px-2 text-center border-r border-slate-200">1</td>
                      <td className="px-3 border-r border-slate-200">Thanh toán giờ giảng (Lý thuyết & Thực hành)</td>
                      <td className="px-3 border-r border-slate-200">Phòng Đào tạo</td>
                      <td className="px-2.5 text-right border-r border-slate-200">{summary.daoTaoQC.toFixed(1)} tiết</td>
                      <td className="px-3 text-right border-r border-slate-200">{summary.daoTaoAmt.toLocaleString('vi-VN')} đ</td>
                      <td className="px-2.5 text-right border-r border-slate-200">
                        -{(summary.daoTaoAmt * 0.1).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-3 text-right border-r border-slate-200">
                        {(summary.daoTaoAmt * 0.9).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-2.5 text-center border-r border-slate-200">
                        {getTabStatus('dao_tao').status === 'confirmed' ? 'Đã đồng ý' : 'Chưa đồng ý'}
                      </td>
                      <td className="px-2.5 text-center">
                        <button
                          onClick={() => setActiveTab('dao_tao')}
                          className="hover:underline cursor-pointer"
                        >
                          Xem bảng →
                        </button>
                      </td>
                    </tr>

                    {/* Row 2: Khảo thí */}
                    <tr className="h-[38px] hover:bg-slate-50 transition-colors">
                      <td className="px-2 text-center border-r border-slate-200">2</td>
                      <td className="px-3 border-r border-slate-200">Coi thi, ra đề, chấm thi kết thúc HP</td>
                      <td className="px-3 border-r border-slate-200">TT Khảo thí</td>
                      <td className="px-2.5 text-right border-r border-slate-200">{summary.khaoThiQC.toFixed(1)} giờ</td>
                      <td className="px-3 text-right border-r border-slate-200">{summary.khaoThiAmt.toLocaleString('vi-VN')} đ</td>
                      <td className="px-2.5 text-right border-r border-slate-200">
                        -{(summary.khaoThiAmt * 0.1).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-3 text-right border-r border-slate-200">
                        {(summary.khaoThiAmt * 0.9).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-2.5 text-center border-r border-slate-200">
                        {getTabStatus('khao_thi').status === 'confirmed' ? 'Đã đồng ý' : 'Chưa đồng ý'}
                      </td>
                      <td className="px-2.5 text-center">
                        <button
                          onClick={() => setActiveTab('khao_thi')}
                          className="hover:underline cursor-pointer"
                        >
                          Xem bảng →
                        </button>
                      </td>
                    </tr>

                    {/* Row 3: Tuyển sinh */}
                    <tr className="h-[38px] hover:bg-slate-50 transition-colors">
                      <td className="px-2 text-center border-r border-slate-200">3</td>
                      <td className="px-3 border-r border-slate-200">Công tác tuyển sinh & Truyền thông</td>
                      <td className="px-3 border-r border-slate-200">P. Tuyển sinh & TT</td>
                      <td className="px-2.5 text-right border-r border-slate-200">{summary.tuyenSinhQC.toFixed(1)} tiết</td>
                      <td className="px-3 text-right border-r border-slate-200">{summary.tuyenSinhAmt.toLocaleString('vi-VN')} đ</td>
                      <td className="px-2.5 text-right border-r border-slate-200">
                        -{(summary.tuyenSinhAmt * 0.1).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-3 text-right border-r border-slate-200">
                        {(summary.tuyenSinhAmt * 0.9).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-2.5 text-center border-r border-slate-200">
                        {getTabStatus('tuyen_sinh').status === 'confirmed' ? 'Đã đồng ý' : 'Chưa đồng ý'}
                      </td>
                      <td className="px-2.5 text-center">
                        <button
                          onClick={() => setActiveTab('tuyen_sinh')}
                          className="hover:underline cursor-pointer"
                        >
                          Xem bảng →
                        </button>
                      </td>
                    </tr>

                    {/* Row 4: NCKH */}
                    <tr className="h-[38px] hover:bg-slate-50 transition-colors">
                      <td className="px-2 text-center border-r border-slate-200">4</td>
                      <td className="px-3 border-r border-slate-200">Nghiên cứu khoa học (Bài báo, đề tài, luận văn)</td>
                      <td className="px-3 border-r border-slate-200">Phòng NCKH & SĐH</td>
                      <td className="px-2.5 text-right border-r border-slate-200">{summary.nckhQC.toFixed(1)} giờ</td>
                      <td className="px-3 text-right border-r border-slate-200">{summary.nckhAmt.toLocaleString('vi-VN')} đ</td>
                      <td className="px-2.5 text-right border-r border-slate-200">
                        -{(summary.nckhAmt * 0.1).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-3 text-right border-r border-slate-200">
                        {(summary.nckhAmt * 0.9).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-2.5 text-center border-r border-slate-200">
                        {getTabStatus('nckh').status === 'confirmed' ? 'Đã đồng ý' : 'Chưa đồng ý'}
                      </td>
                      <td className="px-2.5 text-center">
                        <button
                          onClick={() => setActiveTab('nckh')}
                          className="hover:underline cursor-pointer"
                        >
                          Xem bảng →
                        </button>
                      </td>
                    </tr>

                    {/* Row 5: Cố vấn học tập */}
                    <tr className="h-[38px] hover:bg-slate-50 transition-colors">
                      <td className="px-2 text-center border-r border-slate-200">5</td>
                      <td className="px-3 border-r border-slate-200">Cố vấn học tập (CVHT lớp sinh viên)</td>
                      <td className="px-3 border-r border-slate-200">P. CTSV & Đào tạo</td>
                      <td className="px-2.5 text-right border-r border-slate-200">{summary.coVanHocTapQC.toFixed(1)} tiết</td>
                      <td className="px-3 text-right border-r border-slate-200">{summary.coVanHocTapAmt.toLocaleString('vi-VN')} đ</td>
                      <td className="px-2.5 text-right border-r border-slate-200">
                        -{(summary.coVanHocTapAmt * 0.1).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-3 text-right border-r border-slate-200">
                        {(summary.coVanHocTapAmt * 0.9).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-2.5 text-center border-r border-slate-200">
                        {getTabStatus('co_van_hoc_tap').status === 'confirmed' ? 'Đã đồng ý' : 'Chưa đồng ý'}
                      </td>
                      <td className="px-2.5 text-center">
                        <button
                          onClick={() => setActiveTab('co_van_hoc_tap')}
                          className="hover:underline cursor-pointer"
                        >
                          Xem bảng →
                        </button>
                      </td>
                    </tr>

                    {/* Row 6: Công tác khác */}
                    <tr className="h-[38px] hover:bg-slate-50 transition-colors">
                      <td className="px-2 text-center border-r border-slate-200">6</td>
                      <td className="px-3 border-r border-slate-200">Công tác khác (HĐKH, Ban thanh tra thi)</td>
                      <td className="px-3 border-r border-slate-200">Ban Giám hiệu & Các đơn vị</td>
                      <td className="px-2.5 text-right border-r border-slate-200">{summary.congTacKhacQC.toFixed(1)} tiết</td>
                      <td className="px-3 text-right border-r border-slate-200">{summary.congTacKhacAmt.toLocaleString('vi-VN')} đ</td>
                      <td className="px-2.5 text-right border-r border-slate-200">
                        -{(summary.congTacKhacAmt * 0.1).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-3 text-right border-r border-slate-200">
                        {(summary.congTacKhacAmt * 0.9).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-2.5 text-center border-r border-slate-200">
                        {getTabStatus('cong_tac_khac').status === 'confirmed' ? 'Đã đồng ý' : 'Chưa đồng ý'}
                      </td>
                      <td className="px-2.5 text-center">
                        <button
                          onClick={() => setActiveTab('cong_tac_khac')}
                          className="hover:underline cursor-pointer"
                        >
                          Xem bảng →
                        </button>
                      </td>
                    </tr>
                  </tbody>

                  {/* Total footer */}
                  <tfoot>
                    <tr className="bg-slate-100 border-t border-slate-300 font-semibold h-[38px] text-slate-900">
                      <td colSpan={3} className="px-3 text-right">
                        Tổng cộng (6 nguồn hoạt động):
                      </td>
                      <td className="px-2.5 text-right">
                        {summary.tongQC.toFixed(1)}
                      </td>
                      <td className="px-3 text-right">
                        {summary.tongThuLao.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-2.5 text-right">
                        -{summary.thueTNCN.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-3 text-right">
                        {summary.thucNhan.toLocaleString('vi-VN')} đ
                      </td>
                      <td colSpan={2} className="px-2.5 text-center text-[11.5px]">
                        {getTabStatus('tong_quan').status === 'confirmed'
                          ? 'Đã đồng ý toàn bộ'
                          : `Đã đồng ý ${confirmedDetailCount}/6 mục`}
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
                <div className="w-full max-w-full min-w-0 flex flex-col overflow-x-hidden">
                  <div className="w-full max-w-full min-w-0 p-2 sm:p-4 bg-slate-100/50">
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
                      viewMode={teachingViewMode}
                      onViewModeChange={setTeachingViewMode}
                      compactContent={
                        <div className="w-full max-w-full min-w-0 overflow-x-auto relative">
                          <table className="w-max min-w-full text-left border-separate border-spacing-0 text-[12px]">
                            <thead>
                              <tr className="bg-[#f8fafc] text-[#1e293b] font-semibold h-[38px] text-[12px]">
                                <th className="sticky top-0 z-10 w-[42px] min-w-[42px] max-w-[42px] px-2 text-center border-b border-r border-slate-200 bg-[#f8fafc]">
                                  STT
                                </th>
                                <th className="sticky top-0 z-10 w-[95px] min-w-[95px] max-w-[95px] px-2.5 border-b border-r border-slate-200 bg-[#f8fafc] whitespace-nowrap">
                                  Mã GV
                                </th>
                                <th className="sticky top-0 z-10 w-[185px] min-w-[185px] max-w-[185px] px-3 border-b border-r border-slate-200 bg-[#f8fafc] whitespace-nowrap">
                                  Họ và tên giảng viên
                                </th>
                                <th className="w-[75px] min-w-[75px] px-2 text-center border-b border-r border-slate-200 bg-[#f8fafc] whitespace-nowrap">
                                  Học vị
                                </th>
                                <th className="min-w-[155px] px-2.5 border-b border-r border-slate-200 bg-[#f8fafc] whitespace-nowrap">
                                  Khoa / Bộ môn
                                </th>
                                <th className="min-w-[230px] px-3 border-b border-r border-slate-200 bg-[#f8fafc] whitespace-nowrap">
                                  Môn giảng dạy
                                </th>
                                <th className="min-w-[130px] px-2.5 text-center border-b border-r border-slate-200 bg-[#f8fafc] whitespace-nowrap">
                                  Phân loại
                                </th>
                                <th className="min-w-[115px] px-2.5 text-center border-b border-r border-slate-200 bg-[#f8fafc] whitespace-nowrap">
                                  Lớp học phần
                                </th>
                                <th className="w-[65px] min-w-[65px] px-2 text-center border-b border-r border-slate-200 bg-[#f8fafc] whitespace-nowrap">
                                  Số TC
                                </th>
                                <th className="w-[65px] min-w-[65px] px-2 text-center border-b border-r border-slate-200 bg-[#f8fafc] whitespace-nowrap">
                                  Số SV
                                </th>
                                <th className="w-[70px] min-w-[70px] px-2 text-center border-b border-r border-slate-200 bg-[#f8fafc] whitespace-nowrap">
                                  Số nhóm
                                </th>
                                <th className="w-[80px] min-w-[80px] px-2 text-center border-b border-r border-slate-200 bg-[#f8fafc] whitespace-nowrap">
                                  Số giờ MH
                                </th>
                                <th className="w-[95px] min-w-[95px] px-2 text-center border-b border-r border-slate-200 bg-[#f8fafc] whitespace-nowrap">
                                  Giờ thực giảng
                                </th>
                                <th className="w-[65px] min-w-[65px] px-2 text-center border-b border-r border-slate-200 bg-[#f8fafc] whitespace-nowrap">
                                  Tiết LT
                                </th>
                                <th className="w-[65px] min-w-[65px] px-2 text-center border-b border-r border-slate-200 bg-[#f8fafc] whitespace-nowrap">
                                  Tiết TH
                                </th>
                                <th className="w-[85px] min-w-[85px] px-2 text-center border-b border-r border-slate-200 bg-[#f8fafc] whitespace-nowrap">
                                  Hệ số nhóm
                                </th>
                                <th className="w-[75px] min-w-[75px] px-2 text-center border-b border-r border-slate-200 bg-[#f8fafc] whitespace-nowrap">
                                  Hệ số TC
                                </th>
                                <th className="w-[95px] min-w-[95px] px-2.5 text-right border-b border-r border-slate-200 bg-[#f8fafc] whitespace-nowrap">
                                  Số giờ QC
                                </th>
                                <th className="w-[105px] min-w-[105px] px-2.5 text-right border-b border-r border-slate-200 bg-[#f8fafc] whitespace-nowrap">
                                  Đơn giá/tiết
                                </th>
                                <th className="w-[120px] min-w-[120px] px-3 text-right border-b border-r border-slate-200 bg-[#f8fafc] whitespace-nowrap">
                                  Thù lao (VNĐ)
                                </th>
                                <th className="w-[110px] min-w-[110px] px-2.5 text-right border-b border-r border-slate-200 bg-[#f8fafc] whitespace-nowrap">
                                  Thuế 10%
                                </th>
                                <th className="w-[120px] min-w-[120px] px-3 text-right border-b border-r border-slate-200 bg-[#f8fafc] whitespace-nowrap">
                                  Thực nhận (VNĐ)
                                </th>
                                <th className="min-w-[155px] px-2.5 border-b border-slate-200 bg-[#f8fafc] whitespace-nowrap">
                                  Đợt thanh toán
                                </th>
                              </tr>
                            </thead>
                            <tbody className="text-[#475569] font-normal">
                              {currentTabRecords.length === 0 ? (
                                <tr>
                                  <td colSpan={23} className="py-10 text-center text-slate-500 font-normal border-b border-slate-200">
                                    Chưa có dữ liệu kê khai giờ giảng cho Thầy/Cô trong học kỳ này.
                                  </td>
                                </tr>
                              ) : (
                                currentTabRecords.map((rec, idx) => (
                                  <tr key={rec.id} className="group h-[38px] bg-white hover:bg-[#f8fafc] transition-colors">
                                    <td className="w-[42px] min-w-[42px] max-w-[42px] px-2 text-center font-mono border-b border-r border-[#e2e8f0]">
                                      {idx + 1}
                                    </td>
                                    <td className="w-[95px] min-w-[95px] max-w-[95px] px-2.5 font-mono text-slate-700 border-b border-r border-slate-200 whitespace-nowrap">
                                      {rec.maGV}
                                    </td>
                                    <td className="w-[185px] min-w-[185px] max-w-[185px] px-3 text-slate-700 border-b border-r border-slate-200 whitespace-nowrap">
                                      <span className="truncate block w-full" title={rec.hoTen}>
                                        {rec.hoTen}
                                      </span>
                                    </td>
                                    <td className="px-2 text-center border-b border-r border-[#f1f5f9] whitespace-nowrap">
                                      {rec.hocHamHocVi || '—'}
                                    </td>
                                    <td className="px-2.5 border-b border-r border-[#f1f5f9] whitespace-nowrap">
                                      {rec.khoaBoMon}
                                    </td>
                                    <td className="px-3 border-b border-r border-[#f1f5f9] whitespace-nowrap font-normal text-slate-700">
                                      <span className="truncate block max-w-[250px]" title={rec.tenHocPhan}>
                                        {rec.tenHocPhan}
                                      </span>
                                    </td>
                                    <td className="px-2.5 text-center border-b border-r border-[#f1f5f9] whitespace-nowrap">
                                      {rec.phanLoaiGiangDay === 'thuc_hanh_thuc_tap'
                                        ? 'Thực hành, thực tập'
                                        : 'Lý thuyết'}
                                    </td>
                                    <td className="px-2.5 text-center font-mono border-b border-r border-[#f1f5f9] whitespace-nowrap">
                                      {rec.maLopHocPhan}
                                    </td>
                                    <td className="px-2 text-center font-mono border-b border-r border-[#f1f5f9]">
                                      {rec.soTinChi ?? 3}
                                    </td>
                                    <td className="px-2 text-center font-mono border-b border-r border-[#f1f5f9]">
                                      {rec.soSinhVien || 60}
                                    </td>
                                    <td className="px-2 text-center font-mono border-b border-r border-[#f1f5f9]">
                                      {rec.soNhom || 1}
                                    </td>
                                    <td className="px-2 text-center font-mono border-b border-r border-[#f1f5f9]">
                                      {rec.soGioMonHoc || 45}
                                    </td>
                                    <td className="px-2 text-center font-mono border-b border-r border-[#f1f5f9]">
                                      {rec.soGioThucGiang || 30}
                                    </td>
                                    <td className="px-2 text-center font-mono border-b border-r border-[#f1f5f9]">
                                      {rec.soTietLT ?? 0}
                                    </td>
                                    <td className="px-2 text-center font-mono border-b border-r border-[#f1f5f9]">
                                      {rec.soTietTH ?? 0}
                                    </td>
                                    <td className="px-2 text-center font-mono border-b border-r border-[#f1f5f9]">
                                      {rec.heSoLopNhom || rec.heSoLop || 1.25}
                                    </td>
                                    <td className="px-2 text-center font-mono border-b border-r border-[#f1f5f9]">
                                      {rec.heSoTinChi || 1.0}
                                    </td>
                                    <td className="px-2.5 text-right font-mono tabular-nums border-b border-r border-[#f1f5f9]">
                                      {(rec.soGioQuyChuan || rec.tongTietQC).toFixed(1)}
                                    </td>
                                    <td className="px-2.5 text-right font-mono tabular-nums border-b border-r border-[#f1f5f9]">
                                      {(rec.donGiaTiet || 0).toLocaleString('vi-VN')}
                                    </td>
                                    <td className="px-3 text-right font-mono tabular-nums border-b border-r border-[#f1f5f9]">
                                      {rec.tongTienThuLao.toLocaleString('vi-VN')}
                                    </td>
                                    <td className="px-2.5 text-right font-mono tabular-nums text-rose-600 border-b border-r border-[#f1f5f9]">
                                      -{(rec.thueTNCN || 0).toLocaleString('vi-VN')}
                                    </td>
                                    <td className="px-3 text-right font-mono tabular-nums text-[#005325] border-b border-r border-[#f1f5f9]">
                                      {rec.thucNhan.toLocaleString('vi-VN')}
                                    </td>
                                    <td className="px-2.5 border-b border-[#f1f5f9] whitespace-nowrap">
                                      {rec.dotThanhToan || '—'}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      }
                    />
                  </div>
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
                <div className="w-full max-w-full min-w-0 flex flex-col overflow-x-hidden">
                  <div className="w-full max-w-full min-w-0 p-2 sm:p-4 bg-slate-100/50">
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
                      viewMode={researchViewMode}
                      onViewModeChange={setResearchViewMode}
                      compactContent={
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
                      }
                    />
                  </div>
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

                {/* Bottom Action buttons (Text Only, No Icons) */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleOpenFeedbackForTab(activeTab)}
                    className="h-[28px] px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg flex items-center text-[11.5px] font-medium transition-colors cursor-pointer whitespace-nowrap"
                    title="Gửi phản hồi / khiếu nại cho mục này"
                  >
                    <span>{isFeedbackOpen ? 'Đóng phản hồi' : 'Phản hồi mục này'}</span>
                  </button>

                  <button
                    onClick={() => handleConfirmCategory(activeTab)}
                    className={`h-[28px] px-3 rounded-lg flex items-center text-[11.5px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      activeTabStatus.status === 'confirmed'
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300'
                        : 'bg-[#005325] hover:bg-[#00421e] text-white shadow-2xs'
                    }`}
                    title={
                      activeTabStatus.status === 'confirmed'
                        ? 'Bấm để bỏ đồng ý xác nhận mục này'
                        : 'Đồng ý xác nhận số liệu mục này'
                    }
                  >
                    <span>{activeTabStatus.status === 'confirmed' ? 'Bỏ đồng ý mục này' : 'Đồng ý mục này'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
