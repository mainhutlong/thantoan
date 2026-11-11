import React, { useState } from 'react';
import {
  RotateCw,
  Settings,
  ArrowUpDown,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  MessageSquare,
  FileSpreadsheet,
  Eye
} from 'lucide-react';
import { VbccRecord, TeachingRecord, AppMode, DataQuality, UserRole, PeriodStatus, DepartmentUnit } from '../types';

export interface ColumnFilters {
  hoTen: string;
  ngaySinh: string;
  soCCCD: string;
  col5: string;
  col6: string;
  col7: string;
  col8: string;
  nguoiThucHien: string;
}

interface DataTableProps {
  appMode: AppMode;
  selectedDepartment?: DepartmentUnit;
  vbccData: VbccRecord[];
  teachingData: TeachingRecord[];
  columnFilters: ColumnFilters;
  onColumnFilterChange: (filters: ColumnFilters) => void;
  selectedIds: string[];
  onToggleSelectAll: () => void;
  onToggleSelectRow: (id: string) => void;
  onRefresh: () => void;
  onOpenSettings: () => void;
  onEditRecord: (record: VbccRecord | TeachingRecord) => void;
  onDeleteRecord: (id: string) => void;
  onViewRecordDetail?: (record: VbccRecord | TeachingRecord) => void;
  onViewTeachingSchedule?: (maGV: string) => void;
  onViewResearchSchedule?: (maGV: string) => void;
  onRequestFeedback?: (record: TeachingRecord) => void;
  periodStatus: PeriodStatus;
  currentRole: UserRole;
}

export const DataTable: React.FC<DataTableProps> = ({
  appMode,
  selectedDepartment = 'all',
  vbccData,
  teachingData,
  selectedIds,
  onToggleSelectAll,
  onToggleSelectRow,
  onRefresh,
  onOpenSettings,
  onEditRecord,
  onDeleteRecord,
  onViewRecordDetail,
  onViewTeachingSchedule,
  onViewResearchSchedule,
  onRequestFeedback,
  periodStatus,
}) => {
  const [sortField, setSortField] = useState<string>('tt');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const isAllSelected =
    appMode === 'vbcc_image'
      ? vbccData.length > 0 && selectedIds.length === vbccData.length
      : teachingData.length > 0 && selectedIds.length === teachingData.length;

  const renderStatusBadge = (status: DataQuality, hasFeedback?: boolean) => {
    return (
      <div className="flex items-center justify-center gap-1 shrink-0 font-sans font-normal text-[12.5px] text-slate-700">
        {hasFeedback && (
          <span className="inline-flex items-center gap-0.5 font-normal text-slate-700 whitespace-nowrap">
            Phản hồi ·
          </span>
        )}
        {status === 'hop_le' || status === 'da_so_hoa' ? (
          <span className="inline-flex items-center gap-1 font-normal text-slate-700 whitespace-nowrap">
            {status === 'da_so_hoa' ? 'Đã duyệt' : 'Hợp lệ'}
          </span>
        ) : status === 'chua_day_du' || status === 'chua_so_hoa' ? (
          <span className="inline-flex items-center gap-1 font-normal text-slate-700 whitespace-nowrap">
            {status === 'chua_day_du' ? 'Bổ sung' : 'Chưa duyệt'}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 font-normal text-slate-700 whitespace-nowrap">
            {status === 'trung_lap' ? 'Trùng lịch' : 'Không hợp lệ'}
          </span>
        )}
      </div>
    );
  };

  // Render department badge for 'all' tab
  const renderDeptBadge = (dept: string) => {
    switch (dept) {
      case 'dao_tao':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10.5px] font-normal bg-slate-100 text-black border border-slate-300 whitespace-nowrap">
            P. Đào tạo
          </span>
        );
      case 'khao_thi':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10.5px] font-normal bg-slate-100 text-black border border-slate-300 whitespace-nowrap">
            TT Khảo thí
          </span>
        );
      case 'tuyen_sinh':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10.5px] font-normal bg-slate-100 text-black border border-slate-300 whitespace-nowrap">
            P. Tuyển sinh
          </span>
        );
      case 'nckh':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10.5px] font-normal bg-slate-100 text-black border border-slate-300 whitespace-nowrap">
            P. NCKH
          </span>
        );
      case 'co_van_hoc_tap':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10.5px] font-normal bg-slate-100 text-black border border-slate-300 whitespace-nowrap">
            Cố vấn HT
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10.5px] font-normal bg-slate-100 text-black border border-slate-300 whitespace-nowrap">
            Công tác khác
          </span>
        );
    }
  };

  return (
    <div className="flex-1 overflow-x-auto bg-white select-none flex flex-col">
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1180px]">
          {/* Table Header: Clean Single Row with 1 Line per Column Header */}
          <thead>
            <tr className="bg-[#f8fafc] text-black border-b border-[#cbd5e1] text-[12px] font-normal h-[36px]">
              {/* Col 0: Checkbox + Refresh */}
              <th className="w-[45px] px-2 text-center border-r border-[#e2e8f0]">
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onToggleSelectAll}
                    className="w-3.5 h-3.5 rounded-sm border-gray-300 text-black focus:ring-0 cursor-pointer"
                    title="Chọn tất cả"
                  />
                  <button
                    onClick={onRefresh}
                    title="Làm mới dữ liệu"
                    className="text-black hover:text-black p-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center justify-center"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>
                </div>
              </th>

              {/* Col 1: TT */}
              <th className="w-[42px] px-2 text-center border-r border-[#e2e8f0] text-black">TT</th>

              {/* Col 2: Mã GV */}
              <th
                onClick={() => handleSort('maGV')}
                className="w-[90px] px-2.5 border-r border-[#e2e8f0] cursor-pointer hover:bg-slate-200/50 transition-colors text-black"
              >
                <div className="flex items-center justify-between">
                  <span>Mã GV</span>
                  <ArrowUpDown className="w-3 h-3 text-black" />
                </div>
              </th>

              {/* Col 3: Họ và tên Giảng viên */}
              <th
                onClick={() => handleSort('hoTen')}
                className="px-3 border-r border-[#e2e8f0] cursor-pointer hover:bg-slate-200/50 transition-colors min-w-[170px] text-black"
              >
                <div className="flex items-center justify-between">
                  <span>Họ và tên giảng viên</span>
                  <ArrowUpDown className="w-3 h-3 text-black" />
                </div>
              </th>

              {/* Col 4: Khoa / Bộ môn */}
              <th className="px-2.5 border-r border-[#e2e8f0] min-w-[140px] text-black">
                <span>Khoa / Bộ môn</span>
              </th>

              {/* Col 5: Môn giảng dạy / Hoạt động chuyên môn */}
              <th className="px-3 border-r border-[#e2e8f0] min-w-[240px] text-slate-800">
                <span>Môn giảng dạy / Nhiệm vụ</span>
              </th>

              {/* Col 6: Tổng giờ QC */}
              <th className="px-3 text-center border-r border-[#e2e8f0] w-[125px] text-slate-800">
                <span>Tổng giờ QC</span>
              </th>

              {/* Col 7: Trạng thái */}
              <th className="px-2.5 border-r border-[#e2e8f0] w-[130px] text-center text-slate-800">
                <span>Trạng thái</span>
              </th>

              {/* Col 8: Thao tác */}
              <th className="w-[105px] px-2 text-center text-slate-800">
                <span>Thao tác</span>
              </th>
            </tr>
          </thead>

          {/* Table Body: 1 Clean Single Line per Row */}
          <tbody className="divide-y divide-[#e2e8f0] text-[12px] text-black">
            {teachingData.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-black">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="text-[13px] font-normal text-black">
                      Chưa có dữ liệu kê khai trong danh sách này
                    </span>
                    <span className="text-[11.5px] text-black font-normal">
                      Bấm &quot;+ Thêm mới&quot; hoặc &quot;Import Excel&quot; để nạp dữ liệu.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              teachingData.map((row, index) => {
                const isSelected = selectedIds.includes(row.id);
                const isPeriodLocked = periodStatus === 'locked';

                return (
                  <tr
                    key={row.id}
                    className={`h-[38px] hover:bg-[#f8fafc] transition-colors ${
                      isSelected ? 'bg-slate-100/70' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-2 text-center border-r border-[#f1f5f9]">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectRow(row.id)}
                        className="w-3.5 h-3.5 rounded-sm border-gray-300 text-black focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* TT */}
                    <td className="px-2 text-center font-mono text-black border-r border-[#f1f5f9] whitespace-nowrap font-normal">
                      {index + 1}
                    </td>

                    {/* Mã GV */}
                    <td className="px-2.5 font-mono text-black font-normal border-r border-[#f1f5f9] whitespace-nowrap">
                      {row.maGV}
                    </td>

                    {/* Họ và tên Giảng viên */}
                    <td className="px-3 text-black border-r border-[#f1f5f9] whitespace-nowrap font-normal">
                      {selectedDepartment === 'nckh' && onViewResearchSchedule && row.maGV ? (
                        <button
                          onClick={() => onViewResearchSchedule(row.maGV)}
                          className="font-normal text-black hover:text-purple-700 hover:underline cursor-pointer text-left"
                          title="Bấm để xem Bảng thống kê Nghiên cứu Khoa học (NCKH) theo mẫu chuẩn"
                        >
                          {row.hoTen}
                        </button>
                      ) : onViewTeachingSchedule && row.maGV ? (
                        <button
                          onClick={() => onViewTeachingSchedule(row.maGV)}
                          className="font-normal text-black hover:text-[#005325] hover:underline cursor-pointer text-left"
                          title="Bấm để xem Bảng thống kê theo mẫu chuẩn"
                        >
                          {row.hoTen}
                        </button>
                      ) : (
                        <span className="font-normal text-black">
                          {row.hoTen}
                        </span>
                      )}
                    </td>

                    {/* Khoa / Bộ môn (1 line) */}
                    <td className="px-2.5 text-black border-r border-[#f1f5f9] whitespace-nowrap font-normal">
                      <span className="truncate block max-w-[170px]" title={row.khoaBoMon}>
                        {row.khoaBoMon}
                      </span>
                    </td>

                    {/* Môn giảng dạy / Nhiệm vụ */}
                    <td className="px-3 text-slate-800 border-r border-[#f1f5f9] whitespace-nowrap font-normal">
                      <div className="flex items-center gap-2">
                        <span
                          className="truncate block max-w-[260px] text-slate-900 font-medium"
                          title={row.tenHocPhan || row.noiDungNCKH || row.tenCongViec}
                        >
                          {row.tenHocPhan || row.noiDungNCKH || row.tenCongViec || '—'}
                        </span>
                        {row.maLopHocPhan && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                            {row.maLopHocPhan}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Tổng giờ QC */}
                    <td className="px-3 text-center border-r border-[#f1f5f9] whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-[#005325] border border-emerald-200 tabular-nums">
                        {(row.soGioQuyChuan || row.tongTietQC || row.soGioQCNCKH || row.tongSoGioTheoCV || 0).toFixed(1)} giờ
                      </span>
                    </td>

                    {/* Trạng thái (1 line badge) */}
                    <td className="px-2.5 text-center border-r border-[#f1f5f9] whitespace-nowrap">
                      {renderStatusBadge(row.trangThai, row.hasFeedback)}
                    </td>

                    {/* Thao tác (4 icon buttons in 1 clean horizontal flex) */}
                    {/* Thao tác: 4 nút thao tác đồng bộ thiết kế (Xem chi tiết, Sửa, Phản hồi, Xóa) */}
                    <td className="px-2 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 py-1">
                        {/* 1. Xem chi tiết (Mở trực tiếp biểu mẫu chi tiết chuẩn) */}
                        <button
                          onClick={() => {
                            if (selectedDepartment === 'nckh' && onViewResearchSchedule && 'maGV' in row && row.maGV) {
                              onViewResearchSchedule(row.maGV);
                            } else if (onViewTeachingSchedule && 'maGV' in row && row.maGV) {
                              onViewTeachingSchedule(row.maGV);
                            } else if (onViewRecordDetail) {
                              onViewRecordDetail(row);
                            }
                          }}
                          title="Xem chi tiết đầy đủ (Bảng thống kê chuẩn)"
                          className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 hover:bg-blue-100/90 text-blue-700 border border-blue-200/70 cursor-pointer transition-all shadow-2xs hover:shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* 2. Sửa */}
                        <button
                          onClick={() => onEditRecord(row)}
                          disabled={isPeriodLocked}
                          title={isPeriodLocked ? 'Kỳ thanh toán đã khóa' : 'Chỉnh sửa'}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                            isPeriodLocked
                              ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                              : 'bg-emerald-50 hover:bg-emerald-100/90 text-[#005325] border border-emerald-200/70 cursor-pointer shadow-2xs hover:shadow-xs'
                          }`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* 3. Xóa */}
                        <button
                          onClick={() => onDeleteRecord(row.id)}
                          disabled={isPeriodLocked}
                          title={isPeriodLocked ? 'Kỳ thanh toán đã khóa' : 'Xóa bản ghi'}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                            isPeriodLocked
                              ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                              : 'bg-rose-50 hover:bg-rose-100/90 text-rose-700 border border-rose-200/70 cursor-pointer shadow-2xs hover:shadow-xs'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
