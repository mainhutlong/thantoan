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
  AlertCircle,
  Bell,
  Lock,
  Clock
} from 'lucide-react';
import { SystemConfiguration } from '../types';

export const INITIAL_SYSTEM_CONFIG: SystemConfiguration = {
  academicYear: '2025 - 2026',
  semester: 'Học kỳ 1',
  submissionDeadline: '15/12/2025',
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

export const SystemConfigPage: React.FC = () => {
  const [config, setConfig] = useState<SystemConfiguration>(INITIAL_SYSTEM_CONFIG);
  const [activeTab, setActiveTab] = useState<'period' | 'quota' | 'rates' | 'security'>('period');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Khôi phục cấu hình về giá trị mặc định của Trường ĐH Tây Đô?')) {
      setConfig(INITIAL_SYSTEM_CONFIG);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] overflow-y-auto">
      {/* 1. Header Zone */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#0284c7] border border-sky-200/80 flex items-center justify-center shadow-2xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-slate-900 leading-tight">
                CẤU HÌNH THÔNG SỐ HỆ THỐNG
              </h1>
              <p className="text-[12px] text-slate-500">
                Thiết lập năm học hiện hành, định mức giờ chuẩn, barem đơn giá tiết, quy chế NCKH và bảo mật
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSaved && (
              <span className="text-[12px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-600" /> Đã cập nhật cấu hình hệ thống!
              </span>
            )}
            <button
              onClick={handleReset}
              className="h-[34px] px-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[12.5px] font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Mặc định</span>
            </button>
            <button
              onClick={handleSave}
              className="h-[34px] px-4 rounded-xl bg-[#005325] hover:bg-[#00421e] text-white text-[12.5px] font-medium flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <Save className="w-4 h-4" />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </div>

        {/* 2. Config Category Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 overflow-x-auto text-[12.5px]">
          <button
            onClick={() => setActiveTab('period')}
            className={`px-3.5 py-1.5 rounded-xl font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'period'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Năm học & Kỳ thanh toán</span>
          </button>

          <button
            onClick={() => setActiveTab('quota')}
            className={`px-3.5 py-1.5 rounded-xl font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'quota'
                ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4 text-purple-600" />
            <span>Định mức giờ chuẩn & Giảm trừ</span>
          </button>

          <button
            onClick={() => setActiveTab('rates')}
            className={`px-3.5 py-1.5 rounded-xl font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'rates'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Barem đơn giá & Thù lao</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-1.5 rounded-xl font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-600" />
            <span>Thông báo & Bảo mật</span>
          </button>
        </div>
      </div>

      {/* 3. Form Content */}
      <form onSubmit={handleSave} className="p-6 max-w-[1000px] space-y-6 text-[12.5px]">
        {/* TAB 1: NĂM HỌC & KỲ THANH TOÁN */}
        {activeTab === 'period' && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-[14px] text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-blue-600" /> Thông tin Năm học & Kỳ làm việc
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Năm học hiện hành</label>
                <input
                  type="text"
                  value={config.academicYear}
                  onChange={(e) => setConfig({ ...config, academicYear: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Học kỳ làm việc</label>
                <select
                  value={config.semester}
                  onChange={(e) => setConfig({ ...config, semester: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium"
                >
                  <option value="Học kỳ 1">Học kỳ 1</option>
                  <option value="Học kỳ 2">Học kỳ 2</option>
                  <option value="Học kỳ hè">Học kỳ hè</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Hạn chót nộp hồ sơ kê khai</label>
                <input
                  type="text"
                  value={config.submissionDeadline}
                  onChange={(e) => setConfig({ ...config, submissionDeadline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="autoLock"
                  checked={config.isAutoLock}
                  onChange={(e) => setConfig({ ...config, isAutoLock: e.target.checked })}
                  className="w-4 h-4 rounded text-[#005325] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="autoLock" className="text-slate-700 font-medium cursor-pointer">
                  Tự động khóa kỳ thanh toán sau hạn chót nộp
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ĐỊNH MỨC GIỜ CHUẨN & GIẢM TRỪ */}
        {activeTab === 'quota' && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-[14px] text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Award className="w-4 h-4 text-purple-600" /> Định mức giờ chuẩn giảng dạy & Nghiên cứu khoa học
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Định mức chuẩn Giảng viên cơ hữu (tiết/năm)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={config.baseQuotaStandard}
                    onChange={(e) => setConfig({ ...config, baseQuotaStandard: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400">tiết/năm</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Định mức Nghiên cứu khoa học (giờ/năm)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={config.researchStandardQuota}
                    onChange={(e) => setConfig({ ...config, researchStandardQuota: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400">giờ/năm</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Tỷ lệ giảm trừ: Ban Giám hiệu kiêm nhiệm (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={config.baseQuotaDeanReduction}
                    onChange={(e) => setConfig({ ...config, baseQuotaDeanReduction: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400">%</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Tỷ lệ giảm trừ: Trưởng khoa kiêm nhiệm (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={config.baseQuotaFacultyHeadReduction}
                    onChange={(e) => setConfig({ ...config, baseQuotaFacultyHeadReduction: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400">%</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Tỷ lệ giảm trừ: Phó Trưởng khoa / Trưởng bộ môn (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={config.baseQuotaDeptHeadReduction}
                    onChange={(e) => setConfig({ ...config, baseQuotaDeptHeadReduction: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400">%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BAREM ĐƠN GIÁ & THÙ LAO */}
        {activeTab === 'rates' && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-[14px] text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Barem đơn giá tiết giảng dạy theo học hàm, học vị
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Giáo sư (GS)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={config.rates.professor}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        rates: { ...config.rates, professor: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400">đ/tiết</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Phó Giáo sư (PGS)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={config.rates.associateProfessor}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        rates: { ...config.rates, associateProfessor: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400">đ/tiết</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Tiến sĩ (TS)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={config.rates.doctor}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        rates: { ...config.rates, doctor: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400">đ/tiết</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Thạc sĩ (ThS)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={config.rates.master}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        rates: { ...config.rates, master: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400">đ/tiết</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Đại học / Cử nhân</label>
                <div className="relative">
                  <input
                    type="number"
                    value={config.rates.bachelor}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        rates: { ...config.rates, bachelor: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400">đ/tiết</span>
                </div>
              </div>
            </div>

            <h3 className="font-bold text-[14px] text-slate-800 flex items-center gap-2 pt-4 pb-2 border-b border-slate-100">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Thù lao Coi thi, Chấm thi & Ra đề
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Coi thi</label>
                <div className="relative">
                  <input
                    type="number"
                    value={config.examRates.invigilation}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        examRates: { ...config.examRates, invigilation: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400">đ/ca</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Chấm thi tự luận</label>
                <div className="relative">
                  <input
                    type="number"
                    value={config.examRates.markingWritten}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        examRates: { ...config.examRates, markingWritten: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400">đ/bài</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Chấm thi trắc nghiệm</label>
                <div className="relative">
                  <input
                    type="number"
                    value={config.examRates.markingMultipleChoice}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        examRates: { ...config.examRates, markingMultipleChoice: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400">đ/bài</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Ra đề thi chuẩn</label>
                <div className="relative">
                  <input
                    type="number"
                    value={config.examRates.questionMaking}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        examRates: { ...config.examRates, questionMaking: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400">đ/đề</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: THÔNG BÁO & BẢO MẬT */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-[14px] text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Shield className="w-4 h-4 text-amber-600" /> Cài đặt thông báo & Bảo mật hệ thống
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-semibold text-slate-800">Email thông báo khi có phản hồi mới</div>
                    <div className="text-[11.5px] text-slate-500">
                      Tự động gửi email đến chuyên viên phụ trách khi giảng viên gửi thắc mắc đối soát
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.notifyEmailOnFeedback}
                  onChange={(e) => setConfig({ ...config, notifyEmailOnFeedback: e.target.checked })}
                  className="w-4 h-4 rounded text-[#005325] focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="font-semibold text-slate-800">SMS & Email khi hoàn tất chi trả tài chính</div>
                    <div className="text-[11.5px] text-slate-500">
                      Báo cho giảng viên biết khi phòng Kế hoạch - Tài chính đã chuyển khoản thành công
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.notifySmsOnDisbursement}
                  onChange={(e) => setConfig({ ...config, notifySmsOnDisbursement: e.target.checked })}
                  className="w-4 h-4 rounded text-[#005325] focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-semibold text-slate-800">Bắt buộc xác thực hai yếu tố (2FA)</div>
                    <div className="text-[11.5px] text-slate-500">
                      Áp dụng cho tài khoản thuộc nhóm Quản trị viên và Kế toán chi trả
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.require2FA}
                  onChange={(e) => setConfig({ ...config, require2FA: e.target.checked })}
                  className="w-4 h-4 rounded text-[#005325] focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-slate-600" />
                  <div>
                    <div className="font-semibold text-slate-800">Thời gian hết hạn phiên làm việc</div>
                    <div className="text-[11.5px] text-slate-500">
                      Tự động đăng xuất sau khoảng thời gian không thao tác
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={config.sessionTimeoutMinutes}
                    onChange={(e) => setConfig({ ...config, sessionTimeoutMinutes: Number(e.target.value) })}
                    className="w-20 px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-mono text-center"
                  />
                  <span className="text-slate-500 text-[12px]">phút</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

