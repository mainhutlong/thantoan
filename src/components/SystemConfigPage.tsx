import React, { useState } from 'react';
import {
  Sliders,
  Calendar,
  Award,
  DollarSign,
  Shield,
  Save,
  RotateCcw,
  Check,
  Lock,
  Unlock,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
  Bell,
  Mail,
  Smartphone,
  Info
} from 'lucide-react';
import { SystemConfiguration, PaymentPeriod } from '../types';

export const INITIAL_SYSTEM_CONFIG: SystemConfiguration = {
  academicYear: '2026 - 2027',
  semester: 'Học kỳ 1',
  submissionDeadline: '30/11/2026',
  isAutoLock: true,
  baseQuotaStandard: 270,
  baseQuotaFacultyHeadReduction: 50,
  baseQuotaDeptHeadReduction: 30,
  baseQuotaDeanReduction: 70,
  researchStandardQuota: 150,
  rates: {
    professor: 250000,
    associateProfessor: 220000,
    doctor: 180000,
    master: 140000,
    bachelor: 110000,
  },
  examRates: {
    invigilation: 120000,
    markingWritten: 15000,
    markingMultipleChoice: 5000,
    questionMaking: 350000,
  },
  notifyEmailOnFeedback: true,
  notifySmsOnDisbursement: true,
  sessionTimeoutMinutes: 30,
  require2FA: false,
};

export const DEFAULT_PERIODS: PaymentPeriod[] = [
  {
    id: 'period-hk1-2026-2027',
    name: 'Học kỳ 1 2026-2027',
    semester: 'Học kỳ 1',
    academicYear: '2026 - 2027',
    status: 'active',
    submissionDeadline: '30/11/2026',
    isCurrent: true,
    note: 'Đợt kê khai thanh toán chính thức Học kỳ 1 năm học 2026 - 2027'
  },
  {
    id: 'period-hk2-2025-2026',
    name: 'Học kỳ 2 2025-2026',
    semester: 'Học kỳ 2',
    academicYear: '2025 - 2026',
    status: 'locked',
    submissionDeadline: '15/06/2026',
    isCurrent: false,
    note: 'Đã hoàn tất đối soát và chi trả tài chính'
  },
  {
    id: 'period-hk1-2025-2026',
    name: 'Học kỳ 1 2025-2026',
    semester: 'Học kỳ 1',
    academicYear: '2025 - 2026',
    status: 'archived',
    submissionDeadline: '15/12/2025',
    isCurrent: false,
    note: 'Dữ liệu đã đóng và lưu trữ hồ sơ số'
  }
];

interface SystemConfigPageProps {
  periods?: PaymentPeriod[];
  currentPeriodId?: string;
  onSelectPeriod?: (id: string) => void;
  onCreatePeriod?: (period: PaymentPeriod) => void;
  onToggleLockPeriod?: (id: string) => void;
  onDeletePeriod?: (id: string) => void;
}

export const SystemConfigPage: React.FC<SystemConfigPageProps> = ({
  periods: propPeriods,
  currentPeriodId: propCurrentPeriodId,
  onSelectPeriod: propOnSelectPeriod,
  onCreatePeriod: propOnCreatePeriod,
  onToggleLockPeriod: propOnToggleLockPeriod,
  onDeletePeriod: propOnDeletePeriod,
}) => {
  const [config, setConfig] = useState<SystemConfiguration>(INITIAL_SYSTEM_CONFIG);
  const [activeTab, setActiveTab] = useState<'period' | 'quota' | 'rates' | 'security'>('period');
  const [isSaved, setIsSaved] = useState(false);

  // Period management internal state (fallback if not controlled from props)
  const [internalPeriods, setInternalPeriods] = useState<PaymentPeriod[]>(DEFAULT_PERIODS);
  const [internalCurrentPeriodId, setInternalCurrentPeriodId] = useState<string>('period-hk1-2026-2027');

  const periodsList = propPeriods || internalPeriods;
  const activePeriodId = propCurrentPeriodId || internalCurrentPeriodId;
  const currentPeriod = periodsList.find((p) => p.id === activePeriodId) || periodsList[0];

  // New period modal/card state
  const [isCreatingPeriod, setIsCreatingPeriod] = useState(false);
  const [newPeriodName, setNewPeriodName] = useState('Học kỳ 2 2026-2027');
  const [newPeriodYear, setNewPeriodYear] = useState('2026 - 2027');
  const [newPeriodSemester, setNewPeriodSemester] = useState('Học kỳ 2');
  const [newPeriodDeadline, setNewPeriodDeadline] = useState('15/05/2027');
  const [newPeriodSetCurrent, setNewPeriodSetCurrent] = useState(true);

  const handleSelectPeriod = (id: string) => {
    if (propOnSelectPeriod) {
      propOnSelectPeriod(id);
    } else {
      setInternalCurrentPeriodId(id);
      setInternalPeriods((prev) =>
        prev.map((p) => ({ ...p, isCurrent: p.id === id }))
      );
    }
    const found = periodsList.find((p) => p.id === id);
    if (found) {
      setConfig((prev) => ({
        ...prev,
        academicYear: found.academicYear,
        semester: found.semester,
        submissionDeadline: found.submissionDeadline || prev.submissionDeadline,
      }));
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleToggleLock = (id: string) => {
    if (propOnToggleLockPeriod) {
      propOnToggleLockPeriod(id);
    } else {
      setInternalPeriods((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: p.status === 'locked' ? 'active' : 'locked' } : p))
      );
    }
  };

  const handleDeletePeriod = (id: string) => {
    if (id === activePeriodId) {
      alert('Không thể xóa đợt thanh toán đang là đợt hiện hành!');
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa đợt thanh toán này khỏi danh mục?')) {
      if (propOnDeletePeriod) {
        propOnDeletePeriod(id);
      } else {
        setInternalPeriods((prev) => prev.filter((p) => p.id !== id));
      }
    }
  };

  const handleCreatePeriodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriodName.trim()) {
      alert('Vui lòng nhập tên đợt thanh toán!');
      return;
    }

    const newPeriod: PaymentPeriod = {
      id: `period-${Date.now()}`,
      name: newPeriodName.trim(),
      academicYear: newPeriodYear,
      semester: newPeriodSemester,
      submissionDeadline: newPeriodDeadline,
      status: 'active',
      isCurrent: newPeriodSetCurrent,
      note: `Tạo vào ngày ${new Date().toLocaleDateString('vi-VN')}`,
    };

    if (propOnCreatePeriod) {
      propOnCreatePeriod(newPeriod);
    } else {
      setInternalPeriods((prev) => {
        const updated = newPeriodSetCurrent ? prev.map((p) => ({ ...p, isCurrent: false })) : [...prev];
        return [newPeriod, ...updated];
      });
      if (newPeriodSetCurrent) {
        setInternalCurrentPeriodId(newPeriod.id);
      }
    }

    if (newPeriodSetCurrent) {
      setConfig((prev) => ({
        ...prev,
        academicYear: newPeriodYear,
        semester: newPeriodSemester,
        submissionDeadline: newPeriodDeadline,
      }));
    }

    setIsCreatingPeriod(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Khôi phục toàn bộ thông số cấu hình về giá trị mặc định của Trường ĐH Tây Đô?')) {
      setConfig(INITIAL_SYSTEM_CONFIG);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] overflow-y-auto font-sans min-w-0">
      {/* 1. Header Zone: Clean Title & Action Buttons */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 shrink-0 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#005325] border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-2xs">
              <Sliders className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[17px] font-bold text-slate-900 tracking-tight">
                  CẤU HÌNH HỆ THỐNG
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-[#005325] border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Đợt hiện hành: {currentPeriod?.name || 'Học kỳ 1 2026-2027'}
                </span>
              </div>
              <p className="text-[12.5px] text-slate-500 mt-0.5">
                Quản lý các đợt thanh toán, định mức giờ chuẩn và quy chế chi tiêu Trường ĐH Tây Đô
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isSaved && (
              <span className="text-[12.5px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-600" /> Đã lưu cấu hình thành công!
              </span>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="h-[34px] px-3.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[13px] font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Khôi phục mặc định</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="h-[34px] px-4 rounded-lg bg-[#005325] hover:bg-[#00421e] text-white text-[13px] font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </div>

        {/* 2. Navigation Tabs */}
        <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 overflow-x-auto text-[13px]">
          <button
            type="button"
            onClick={() => setActiveTab('period')}
            className={`px-3.5 py-1.5 rounded-lg font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'period'
                ? 'bg-emerald-50 text-[#005325] border border-emerald-300 shadow-2xs font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#005325]" />
            <span>1. Năm học & Đợt thanh toán</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-mono bg-emerald-100 text-emerald-800">
              {periodsList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quota')}
            className={`px-3.5 py-1.5 rounded-lg font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'quota'
                ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4 text-purple-600" />
            <span>2. Định mức giờ chuẩn & Giảm trừ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rates')}
            className={`px-3.5 py-1.5 rounded-lg font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'rates'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4 text-blue-600" />
            <span>3. Barem đơn giá thù lao</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-1.5 rounded-lg font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-600" />
            <span>4. Cài đặt thông báo & Bảo mật</span>
          </button>
        </div>
      </div>

      {/* 3. Main Form Content */}
      <form onSubmit={handleSave} className="p-5 max-w-[1080px] w-full mx-auto space-y-4 text-[13px]">
        {/* ========================================================= */}
        {/* TAB 1: NĂM HỌC & ĐỢT THANH TOÁN (HỌC KỲ HIỆN TẠI)         */}
        {/* ========================================================= */}
        {activeTab === 'period' && (
          <div className="space-y-4">
            {/* Banner Đợt hiện hành - Gọn gàng, sang trọng */}
            <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#005325] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white bg-[#005325] px-2 py-0.5 rounded">
                      Đợt thanh toán hiện hành
                    </span>
                    <span className="text-[12px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      🟢 Đang mở tiếp nhận dữ liệu
                    </span>
                  </div>
                  <h2 className="text-[18px] font-bold text-slate-900 mt-1">
                    {currentPeriod?.name || 'Học kỳ 1 2026-2027'}
                  </h2>
                  <div className="text-[12.5px] text-slate-600 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    <span>Năm học: <strong className="text-slate-800">{currentPeriod?.academicYear}</strong></span>
                    <span>•</span>
                    <span>Học kỳ: <strong className="text-slate-800">{currentPeriod?.semester}</strong></span>
                    <span>•</span>
                    <span>Hạn nộp hồ sơ: <strong className="text-slate-800">{currentPeriod?.submissionDeadline || '30/11/2026'}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreatingPeriod(true)}
                  className="h-[36px] px-3.5 rounded-lg bg-[#005325] hover:bg-[#00421e] text-white text-[13px] font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Tạo đợt mới</span>
                </button>
              </div>
            </div>

            {/* FORM TẠO ĐỢT MỚI (INLINE MODAL/CARD) */}
            {isCreatingPeriod && (
              <div className="bg-white rounded-xl p-5 border-2 border-[#005325]/50 shadow-md animate-fadeIn space-y-4">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <h3 className="font-bold text-[14.5px] text-slate-900 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#005325]" /> Thiết lập Đợt thanh toán mới
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsCreatingPeriod(false)}
                    className="text-slate-400 hover:text-slate-600 text-sm px-2 cursor-pointer"
                  >
                    Đóng ×
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                  <div className="md:col-span-2">
                    <label className="block text-slate-700 font-medium mb-1 text-[12.5px]">
                      Tên đợt thanh toán <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newPeriodName}
                      onChange={(e) => setNewPeriodName(e.target.value)}
                      placeholder="Ví dụ: Học kỳ 2 2026-2027..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-[#005325] font-semibold text-slate-800 text-[13px]"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1 text-[12.5px]">Năm học</label>
                    <select
                      value={newPeriodYear}
                      onChange={(e) => setNewPeriodYear(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-[#005325] text-slate-800 text-[13px]"
                    >
                      <option value="2026 - 2027">2026 - 2027</option>
                      <option value="2027 - 2028">2027 - 2028</option>
                      <option value="2025 - 2026">2025 - 2026</option>
                      <option value="2024 - 2025">2024 - 2025</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1 text-[12.5px]">Học kỳ</label>
                    <select
                      value={newPeriodSemester}
                      onChange={(e) => setNewPeriodSemester(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-[#005325] text-slate-800 text-[13px]"
                    >
                      <option value="Học kỳ 1">Học kỳ 1</option>
                      <option value="Học kỳ 2">Học kỳ 2</option>
                      <option value="Học kỳ Hè">Học kỳ Hè</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-700 font-medium mb-1 text-[12.5px]">Hạn chót nộp hồ sơ kê khai</label>
                    <input
                      type="text"
                      value={newPeriodDeadline}
                      onChange={(e) => setNewPeriodDeadline(e.target.value)}
                      placeholder="dd/mm/yyyy (Ví dụ: 15/05/2027)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-[#005325] text-slate-800 text-[13px]"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="setCurrentCheckbox"
                      checked={newPeriodSetCurrent}
                      onChange={(e) => setNewPeriodSetCurrent(e.target.checked)}
                      className="w-4 h-4 rounded text-[#005325] focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="setCurrentCheckbox" className="text-slate-800 font-medium cursor-pointer text-[13px]">
                      Đặt làm <strong>Đợt hiện hành</strong> ngay sau khi tạo
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreatingPeriod(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 cursor-pointer text-[13px]"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleCreatePeriodSubmit}
                    className="px-4 py-1.5 rounded-lg bg-[#005325] hover:bg-[#00421e] text-white font-medium flex items-center gap-1.5 cursor-pointer shadow-xs text-[13px]"
                  >
                    <Check className="w-4 h-4" />
                    <span>Lưu đợt mới</span>
                  </button>
                </div>
              </div>
            )}

            {/* BẢNG DANH MỤC CÁC ĐỢT THANH TOÁN */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <span className="font-bold text-[14px] text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#005325]" /> Danh mục các Đợt thanh toán (Dữ liệu phân theo đợt)
                </span>
                <span className="text-[12px] text-slate-500 font-medium">
                  Tổng cộng: <strong className="text-slate-800">{periodsList.length}</strong> đợt
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px] border-collapse">
                  <thead>
                    <tr className="bg-[#f1f5f9] text-[#1e293b] font-semibold border-b border-slate-300 h-[38px]">
                      <th className="px-3 text-center w-[48px] border-r border-slate-200">STT</th>
                      <th className="px-4 border-r border-slate-200">Tên Đợt thanh toán</th>
                      <th className="px-3 text-center border-r border-slate-200 w-[110px]">Năm học</th>
                      <th className="px-3 text-center border-r border-slate-200 w-[100px]">Học kỳ</th>
                      <th className="px-3 text-center border-r border-slate-200 w-[120px]">Hạn chót nộp</th>
                      <th className="px-3 text-center border-r border-slate-200 w-[130px]">Trạng thái</th>
                      <th className="px-3 text-center w-[170px]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {periodsList.map((period, idx) => {
                      const isCurrent = period.id === activePeriodId;
                      return (
                        <tr
                          key={period.id}
                          className={`h-[42px] transition-colors ${
                            isCurrent ? 'bg-emerald-50/60 font-medium' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="px-3 text-center font-mono border-r border-slate-100 text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="px-4 border-r border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">{period.name}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[10.5px] font-bold bg-[#005325] text-white">
                                  Hiện hành
                                </span>
                              )}
                            </div>
                            {period.note && (
                              <div className="text-[11.5px] text-slate-500 mt-0.5">{period.note}</div>
                            )}
                          </td>
                          <td className="px-3 text-center font-mono border-r border-slate-100 text-slate-800">
                            {period.academicYear}
                          </td>
                          <td className="px-3 text-center border-r border-slate-100 text-slate-800">
                            {period.semester}
                          </td>
                          <td className="px-3 text-center font-mono border-r border-slate-100 text-slate-600">
                            {period.submissionDeadline || '—'}
                          </td>
                          <td className="px-3 text-center border-r border-slate-100">
                            {period.status === 'active' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-emerald-50 text-[#005325] border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Đang mở
                              </span>
                            ) : period.status === 'locked' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                <Lock className="w-3 h-3 text-amber-600" />
                                Đã khóa kỳ
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                Lưu trữ
                              </span>
                            )}
                          </td>
                          <td className="px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {!isCurrent ? (
                                <button
                                  type="button"
                                  onClick={() => handleSelectPeriod(period.id)}
                                  className="px-2.5 py-1 rounded bg-[#005325] hover:bg-[#00421e] text-white text-[12px] font-semibold cursor-pointer shadow-2xs transition-colors"
                                  title="Chọn làm đợt hiện hành"
                                >
                                  Chọn đợt này
                                </button>
                              ) : (
                                <span className="px-2 py-1 text-[12px] font-bold text-emerald-800 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đang dùng
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleToggleLock(period.id)}
                                title={period.status === 'locked' ? 'Mở khóa đợt này' : 'Khóa đợt này'}
                                className="w-7 h-7 rounded flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                              >
                                {period.status === 'locked' ? (
                                  <Unlock className="w-3.5 h-3.5 text-emerald-700" />
                                ) : (
                                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                                )}
                              </button>

                              {!isCurrent && (
                                <button
                                  type="button"
                                  onClick={() => handleDeletePeriod(period.id)}
                                  title="Xóa đợt này"
                                  className="w-7 h-7 rounded flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ĐỊNH MỨC GIỜ CHUẨN & GIẢM TRỪ                       */}
        {/* ========================================================= */}
        {activeTab === 'quota' && (
          <div className="space-y-4">
            {/* Card 1: Định mức chuẩn cơ bản */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3.5">
              <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-[14px] text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600" /> Định mức lao động chuẩn Giảng viên cơ hữu (Theo quy chế TDU)
                </span>
                <span className="text-[12px] text-slate-500">Áp dụng năm học {config.academicYear}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <label className="block text-slate-800 font-semibold mb-1 text-[13px]">
                    Định mức giảng dạy Giảng viên cơ hữu
                  </label>
                  <p className="text-[12px] text-slate-500 mb-2">
                    Số tiết quy chuẩn định mức tối thiểu phải hoàn thành trong năm học
                  </p>
                  <div className="relative">
                    <input
                      type="number"
                      value={config.baseQuotaStandard}
                      onChange={(e) => setConfig({ ...config, baseQuotaStandard: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:outline-none focus:border-[#005325] text-[14px]"
                    />
                    <span className="absolute right-3 top-2 text-slate-500 text-[12.5px] font-medium">tiết / năm</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <label className="block text-slate-800 font-semibold mb-1 text-[13px]">
                    Định mức Nghiên cứu khoa học (NCKH)
                  </label>
                  <p className="text-[12px] text-slate-500 mb-2">
                    Số giờ quy đổi đề tài, bài báo khoa học, biên soạn giáo trình bắt buộc
                  </p>
                  <div className="relative">
                    <input
                      type="number"
                      value={config.researchStandardQuota}
                      onChange={(e) => setConfig({ ...config, researchStandardQuota: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:outline-none focus:border-[#005325] text-[14px]"
                    />
                    <span className="absolute right-3 top-2 text-slate-500 text-[12.5px] font-medium">giờ / năm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Tỷ lệ miễn giảm theo chức vụ kiêm nhiệm */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3.5">
              <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-[14px] text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600" /> Tỷ lệ miễn giảm định mức theo chức vụ kiêm nhiệm
                </span>
                <span className="text-[12px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-medium">
                  Căn cứ Quy chế chi tiêu nội bộ
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-lg bg-purple-50/40 border border-purple-200">
                  <label className="block text-slate-800 font-semibold mb-1 text-[13px]">
                    Ban Giám hiệu kiêm nhiệm
                  </label>
                  <p className="text-[12px] text-slate-500 mb-2">Hiệu trưởng, Phó Hiệu trưởng</p>
                  <div className="relative">
                    <input
                      type="number"
                      value={config.baseQuotaDeanReduction}
                      onChange={(e) => setConfig({ ...config, baseQuotaDeanReduction: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg font-mono font-bold text-purple-900 focus:outline-none focus:border-purple-600 text-[14px]"
                    />
                    <span className="absolute right-3 top-2 text-purple-700 font-bold">%</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-purple-50/40 border border-purple-200">
                  <label className="block text-slate-800 font-semibold mb-1 text-[13px]">
                    Trưởng khoa / Viện trưởng
                  </label>
                  <p className="text-[12px] text-slate-500 mb-2">Quản lý chuyên môn cấp Khoa</p>
                  <div className="relative">
                    <input
                      type="number"
                      value={config.baseQuotaFacultyHeadReduction}
                      onChange={(e) => setConfig({ ...config, baseQuotaFacultyHeadReduction: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg font-mono font-bold text-purple-900 focus:outline-none focus:border-purple-600 text-[14px]"
                    />
                    <span className="absolute right-3 top-2 text-purple-700 font-bold">%</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-purple-50/40 border border-purple-200">
                  <label className="block text-slate-800 font-semibold mb-1 text-[13px]">
                    Phó Trưởng khoa / Trưởng bộ môn
                  </label>
                  <p className="text-[12px] text-slate-500 mb-2">Quản trị cấp Tổ / Bộ môn</p>
                  <div className="relative">
                    <input
                      type="number"
                      value={config.baseQuotaDeptHeadReduction}
                      onChange={(e) => setConfig({ ...config, baseQuotaDeptHeadReduction: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg font-mono font-bold text-purple-900 focus:outline-none focus:border-purple-600 text-[14px]"
                    />
                    <span className="absolute right-3 top-2 text-purple-700 font-bold">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: BAREM ĐƠN GIÁ THÙ LAO (QUY CHẾ CHI TIÊU TDU)       */}
        {/* ========================================================= */}
        {activeTab === 'rates' && (
          <div className="space-y-4">
            {/* 1. Barem giảng dạy theo học hàm, học vị */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3.5">
              <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-[14px] text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Barem đơn giá 1 tiết giảng dạy theo Học hàm / Học vị
                </span>
                <span className="text-[12px] text-slate-500 font-medium">Đơn vị: VNĐ / tiết QC</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {/* GS */}
                <div className="p-3 rounded-lg bg-emerald-50/40 border border-emerald-200">
                  <span className="block text-[12px] font-bold text-emerald-800 uppercase">Giáo sư (GS)</span>
                  <div className="relative mt-1.5">
                    <input
                      type="number"
                      value={config.rates.professor}
                      onChange={(e) => setConfig({ ...config, rates: { ...config.rates, professor: Number(e.target.value) } })}
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded font-mono font-bold text-slate-900 text-[13.5px] focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-500 block mt-1">
                      = {config.rates.professor.toLocaleString('vi-VN')} đ/tiết
                    </span>
                  </div>
                </div>

                {/* PGS */}
                <div className="p-3 rounded-lg bg-emerald-50/40 border border-emerald-200">
                  <span className="block text-[12px] font-bold text-emerald-800 uppercase">Phó Giáo sư (PGS)</span>
                  <div className="relative mt-1.5">
                    <input
                      type="number"
                      value={config.rates.associateProfessor}
                      onChange={(e) => setConfig({ ...config, rates: { ...config.rates, associateProfessor: Number(e.target.value) } })}
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded font-mono font-bold text-slate-900 text-[13.5px] focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-500 block mt-1">
                      = {config.rates.associateProfessor.toLocaleString('vi-VN')} đ/tiết
                    </span>
                  </div>
                </div>

                {/* TS */}
                <div className="p-3 rounded-lg bg-emerald-50/40 border border-emerald-200">
                  <span className="block text-[12px] font-bold text-emerald-800 uppercase">Tiến sĩ (TS)</span>
                  <div className="relative mt-1.5">
                    <input
                      type="number"
                      value={config.rates.doctor}
                      onChange={(e) => setConfig({ ...config, rates: { ...config.rates, doctor: Number(e.target.value) } })}
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded font-mono font-bold text-slate-900 text-[13.5px] focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-500 block mt-1">
                      = {config.rates.doctor.toLocaleString('vi-VN')} đ/tiết
                    </span>
                  </div>
                </div>

                {/* ThS */}
                <div className="p-3 rounded-lg bg-emerald-50/40 border border-emerald-200">
                  <span className="block text-[12px] font-bold text-emerald-800 uppercase">Thạc sĩ (ThS)</span>
                  <div className="relative mt-1.5">
                    <input
                      type="number"
                      value={config.rates.master}
                      onChange={(e) => setConfig({ ...config, rates: { ...config.rates, master: Number(e.target.value) } })}
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded font-mono font-bold text-slate-900 text-[13.5px] focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-500 block mt-1">
                      = {config.rates.master.toLocaleString('vi-VN')} đ/tiết
                    </span>
                  </div>
                </div>

                {/* Đại học / Cử nhân */}
                <div className="p-3 rounded-lg bg-emerald-50/40 border border-emerald-200">
                  <span className="block text-[12px] font-bold text-emerald-800 uppercase">Cử nhân / Kỹ sư</span>
                  <div className="relative mt-1.5">
                    <input
                      type="number"
                      value={config.rates.bachelor}
                      onChange={(e) => setConfig({ ...config, rates: { ...config.rates, bachelor: Number(e.target.value) } })}
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded font-mono font-bold text-slate-900 text-[13.5px] focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-500 block mt-1">
                      = {config.rates.bachelor.toLocaleString('vi-VN')} đ/tiết
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Barem Khảo thí: Coi thi, Chấm thi, Ra đề */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3.5">
              <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-[14px] text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Barem công tác Khảo thí (Coi thi, Chấm thi & Ra đề)
                </span>
                <span className="text-[12px] text-slate-500 font-medium">Theo định mức Phòng Khảo thí TDU</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <label className="block text-[12.5px] font-semibold text-slate-800">Coi thi kết thúc học phần</label>
                  <div className="relative mt-1.5">
                    <input
                      type="number"
                      value={config.examRates.invigilation}
                      onChange={(e) => setConfig({ ...config, examRates: { ...config.examRates, invigilation: Number(e.target.value) } })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900 text-[13.5px] focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-500 block mt-1">
                      = {config.examRates.invigilation.toLocaleString('vi-VN')} đ / ca
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <label className="block text-[12.5px] font-semibold text-slate-800">Chấm thi tự luận</label>
                  <div className="relative mt-1.5">
                    <input
                      type="number"
                      value={config.examRates.markingWritten}
                      onChange={(e) => setConfig({ ...config, examRates: { ...config.examRates, markingWritten: Number(e.target.value) } })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900 text-[13.5px] focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-500 block mt-1">
                      = {config.examRates.markingWritten.toLocaleString('vi-VN')} đ / bài
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <label className="block text-[12.5px] font-semibold text-slate-800">Chấm thi trắc nghiệm</label>
                  <div className="relative mt-1.5">
                    <input
                      type="number"
                      value={config.examRates.markingMultipleChoice}
                      onChange={(e) => setConfig({ ...config, examRates: { ...config.examRates, markingMultipleChoice: Number(e.target.value) } })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900 text-[13.5px] focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-500 block mt-1">
                      = {config.examRates.markingMultipleChoice.toLocaleString('vi-VN')} đ / bài
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <label className="block text-[12.5px] font-semibold text-slate-800">Ra đề thi chuẩn (kèm đáp án)</label>
                  <div className="relative mt-1.5">
                    <input
                      type="number"
                      value={config.examRates.questionMaking}
                      onChange={(e) => setConfig({ ...config, examRates: { ...config.examRates, questionMaking: Number(e.target.value) } })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900 text-[13.5px] focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-500 block mt-1">
                      = {config.examRates.questionMaking.toLocaleString('vi-VN')} đ / đề
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: THÔNG BÁO & BẢO MẬT HỆ THỐNG                       */}
        {/* ========================================================= */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-[14px] text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-600" /> Cài đặt Thông báo tự động & An toàn hệ thống
              </span>
              <span className="text-[12px] text-slate-500">Bảo mật tài khoản & Giao dịch</span>
            </div>

            <div className="space-y-3">
              {/* Option 1: Email feedback */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Mail className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-[13px]">Email thông báo khi có phản hồi đối soát mới</div>
                    <div className="text-[12px] text-slate-500">
                      Tự động gửi email đến chuyên viên quản lý khi giảng viên gửi thắc mắc về số giờ / hệ số
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.notifyEmailOnFeedback}
                  onChange={(e) => setConfig({ ...config, notifyEmailOnFeedback: e.target.checked })}
                  className="w-4.5 h-4.5 rounded text-[#005325] focus:ring-0 cursor-pointer"
                />
              </div>

              {/* Option 2: SMS disbursement */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Smartphone className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-[13px]">SMS & Email khi hoàn tất chi trả tài chính</div>
                    <div className="text-[12px] text-slate-500">
                      Báo cho giảng viên biết ngay khi phòng Kế hoạch - Tài chính TDU đã giải ngân thành công
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.notifySmsOnDisbursement}
                  onChange={(e) => setConfig({ ...config, notifySmsOnDisbursement: e.target.checked })}
                  className="w-4.5 h-4.5 rounded text-[#005325] focus:ring-0 cursor-pointer"
                />
              </div>

              {/* Option 3: 2FA */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Lock className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-[13px]">Bắt buộc xác thực hai yếu tố (2FA)</div>
                    <div className="text-[12px] text-slate-500">
                      Áp dụng cho tài khoản thuộc nhóm Quản trị viên và Kế toán chi trả tài chính
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.require2FA}
                  onChange={(e) => setConfig({ ...config, require2FA: e.target.checked })}
                  className="w-4.5 h-4.5 rounded text-[#005325] focus:ring-0 cursor-pointer"
                />
              </div>

              {/* Option 4: Session Timeout */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Clock className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-[13px]">Thời gian hết hạn phiên làm việc</div>
                    <div className="text-[12px] text-slate-500">
                      Tự động đăng xuất sau khoảng thời gian không có thao tác để đảm bảo an toàn dữ liệu
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={config.sessionTimeoutMinutes}
                    onChange={(e) => setConfig({ ...config, sessionTimeoutMinutes: Number(e.target.value) })}
                    className="w-16 px-2 py-1 bg-white border border-slate-300 rounded font-mono text-center font-bold text-slate-900"
                  />
                  <span className="text-slate-600 font-medium text-[12.5px]">phút</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
