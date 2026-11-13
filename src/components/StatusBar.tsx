import React from 'react';
import { Info, Lock } from 'lucide-react';
import { DataQuality, PeriodStatus } from '../types';

export interface StatusCounts {
  all: number;
  facultyCount?: number;
  hop_le: number;
  khong_hop_le: number;
  trung_lap: number;
  da_so_hoa: number;
  chua_day_du: number;
  chua_so_hoa: number;
}

interface StatusBarProps {
  counts: StatusCounts;
  currentFilter: DataQuality;
  onSelectFilter: (quality: DataQuality) => void;
  periodStatus: PeriodStatus;
  pendingFeedbackCount?: number;
  onOpenFeedbacks?: () => void;
  onTogglePeriodLock?: () => void;
  canManagePeriod?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  counts,
  currentFilter,
  onSelectFilter,
  periodStatus,
}) => {
  const getPeriodBadge = () => {
    switch (periodStatus) {
      case 'draft':
        return (
          <span className="px-2 py-0.5 rounded text-[11.5px] font-normal bg-amber-50 text-amber-800 border border-amber-300">
            Đang kê khai dữ liệu
          </span>
        );
      case 'reviewing':
        return (
          <span className="px-2 py-0.5 rounded text-[11.5px] font-normal bg-blue-50 text-blue-700 border border-blue-200">
            Đang đối soát & xử lý phản hồi
          </span>
        );
      case 'submitted':
        return (
          <span className="px-2 py-0.5 rounded text-[11.5px] font-normal bg-purple-50 text-purple-700 border border-purple-200">
            Đã trình Ban Giám Hiệu phê duyệt
          </span>
        );
      case 'locked':
        return (
          <span className="px-2 py-0.5 rounded text-[11.5px] font-normal bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-700" />
            Đã chốt kỳ (Khóa chỉnh sửa)
          </span>
        );
    }
  };

  return (
    <div className="bg-[#fcfcfd] border-b border-[#e2e8f0] px-4 py-2.5 flex items-center justify-between flex-wrap gap-x-4 gap-y-2 text-[12px] select-none text-black font-normal">
      {/* Left side: Tình trạng & Counters */}
      <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
        {/* Tình trạng */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Info className="w-4 h-4 text-amber-500 fill-amber-100 shrink-0" />
          <span className="font-normal text-slate-700">Tình trạng:</span>
          {getPeriodBadge()}
        </div>

        {/* Counters */}
        <div className="flex items-center flex-wrap gap-x-3.5 gap-y-1.5 text-slate-700 font-normal">
          {/* Tất cả (Số lượng GV) */}
          <button
            onClick={() => onSelectFilter('all')}
            className={`flex items-center gap-1.5 transition-opacity cursor-pointer font-normal ${
              currentFilter === 'all' ? 'text-[#0284c7] font-semibold underline' : 'text-slate-700 opacity-85 hover:opacity-100'
            }`}
            title="Thống kê tất cả số lượng giảng viên"
          >
            <span>Tất cả (Số lượng GV)</span>
            <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-[#0284c7] text-white text-[11px] font-semibold flex items-center justify-center">
              {counts.all}
            </span>
          </button>

          {/* Số lượng Khoa */}
          {counts.facultyCount !== undefined && (
            <div className="flex items-center gap-1.5 text-slate-700 font-normal pl-2 border-l border-slate-300">
              <span className="text-slate-600 font-medium">Số lượng Khoa:</span>
              <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-slate-700 text-white text-[11px] font-semibold flex items-center justify-center">
                {counts.facultyCount}
              </span>
            </div>
          )}

          {/* Hợp lệ */}
          <button
            onClick={() => onSelectFilter('hop_le')}
            className={`flex items-center gap-1.5 transition-opacity cursor-pointer font-normal ${
              currentFilter === 'hop_le' ? 'text-[#16a34a] font-normal underline' : 'text-slate-700 opacity-85 hover:opacity-100'
            }`}
          >
            <span>Hợp lệ</span>
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#16a34a] text-white text-[11px] font-normal flex items-center justify-center">
              {counts.hop_le}
            </span>
          </button>

          {/* Không hợp lệ */}
          <button
            onClick={() => onSelectFilter('khong_hop_le')}
            className={`flex items-center gap-1.5 transition-opacity cursor-pointer font-normal ${
              currentFilter === 'khong_hop_le' ? 'text-[#dc2626] font-normal underline' : 'text-slate-700 opacity-85 hover:opacity-100'
            }`}
          >
            <span>Không hợp lệ</span>
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#dc2626] text-white text-[11px] font-normal flex items-center justify-center">
              {counts.khong_hop_le}
            </span>
          </button>

          {/* Dữ liệu trùng */}
          <button
            onClick={() => onSelectFilter('trung_lap')}
            className={`flex items-center gap-1.5 transition-opacity cursor-pointer font-normal ${
              currentFilter === 'trung_lap' ? 'text-[#ca8a04] font-normal underline' : 'text-slate-700 opacity-85 hover:opacity-100'
            }`}
          >
            <span>Dữ liệu trùng</span>
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#ca8a04] text-white text-[11px] font-normal flex items-center justify-center">
              {counts.trung_lap}
            </span>
          </button>

          {/* Đã số hóa đầy đủ, chính xác */}
          <button
            onClick={() => onSelectFilter('da_so_hoa')}
            className={`flex items-center gap-1.5 transition-opacity cursor-pointer font-normal ${
              currentFilter === 'da_so_hoa' ? 'text-[#16a34a] font-normal underline' : 'text-slate-700 opacity-85 hover:opacity-100'
            }`}
          >
            <span>Đã duyệt chi</span>
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#16a34a] text-white text-[11px] font-normal flex items-center justify-center">
              {counts.da_so_hoa}
            </span>
          </button>

          {/* Số hóa chưa đầy đủ, chính xác */}
          <button
            onClick={() => onSelectFilter('chua_day_du')}
            className={`flex items-center gap-1.5 transition-opacity cursor-pointer font-normal ${
              currentFilter === 'chua_day_du' ? 'text-[#16a34a] font-normal underline' : 'text-slate-700 opacity-85 hover:opacity-100'
            }`}
          >
            <span>Cần bổ sung</span>
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#16a34a] text-white text-[11px] font-normal flex items-center justify-center">
              {counts.chua_day_du}
            </span>
          </button>

          {/* Chưa số hóa */}
          <button
            onClick={() => onSelectFilter('chua_so_hoa')}
            className={`flex items-center gap-1.5 transition-opacity cursor-pointer font-normal ${
              currentFilter === 'chua_so_hoa' ? 'text-[#ca8a04] font-normal underline' : 'text-slate-700 opacity-85 hover:opacity-100'
            }`}
          >
            <span>Chưa nghiệm thu</span>
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#ca8a04] text-white text-[11px] font-normal flex items-center justify-center">
              {counts.chua_so_hoa}
            </span>
          </button>
        </div>
      </div>

    </div>
  );
};
