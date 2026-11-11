import React from 'react';
import { TeachingRecord } from '../types';
import { TeachingScheduleReport } from './TeachingScheduleReport';
import { TDUEmblem } from './TDUEmblem';
import { X } from 'lucide-react';

interface TeachingScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  maGV: string;
  records: TeachingRecord[];
  allLecturers?: { maGV: string; hoTen: string; khoaBoMon: string; hocHamHocVi: string }[];
  onSelectLecturer?: (maGV: string) => void;
  onSaveRecords?: (updatedRecords: TeachingRecord[]) => void;
  academicYear?: string;
}

export const TeachingScheduleModal: React.FC<TeachingScheduleModalProps> = ({
  isOpen,
  onClose,
  maGV,
  records,
  allLecturers,
  onSelectLecturer,
  onSaveRecords,
  academicYear = '2025 - 2026',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-[1180px] max-h-[88vh] flex flex-col overflow-hidden border border-slate-300">
        {/* Modal Header */}
        <div className="bg-[#005325] text-white px-4 py-3 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-2.5">
            <TDUEmblem size={24} />
            <div>
              <h3 className="font-semibold text-[14px] leading-tight">
                BẢNG THỐNG KÊ CÔNG TÁC GIẢNG DẠY - TRƯỜNG ĐẠI HỌC TÂY ĐÔ
              </h3>
              <p className="text-[11px] text-emerald-200">
                Chi tiết kê khai giờ giảng theo biểu mẫu chuẩn ĐHTĐ (Lý thuyết & Thực hành)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-md cursor-pointer transition-colors"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Zone */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-slate-100/60">
          <div className="bg-white rounded-md shadow-xs border border-slate-200 overflow-hidden">
            <TeachingScheduleReport
              maGV={maGV}
              records={records}
              allLecturers={allLecturers}
              onSelectLecturer={onSelectLecturer}
              onSaveRecords={onSaveRecords}
              isModal={true}
              onClose={onClose}
              academicYear={academicYear}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

