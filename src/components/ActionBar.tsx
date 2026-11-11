import React from 'react';
import {
  Plus,
  Download,
  Upload,
  FileSpreadsheet,
  FileDown,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Database,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { DepartmentUnit } from '../types';

interface ActionBarProps {
  totalRecords: number;
  totalQCHours?: number;
  totalPaymentVND?: number;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  onAddNew: () => void;
  onDownloadTemplate: () => void;
  onImportExcel: () => void;
  onImportAppendExcel: () => void;
  onExportDataTemplate: () => void;
  onPackageAndGenerateMinutes: () => void;
  onLoadSampleData: () => void;
  onClearData: () => void;
  selectedDepartment: DepartmentUnit;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  totalRecords,
  totalQCHours = 0,
  totalPaymentVND = 0,
  pageSize,
  onPageSizeChange,
  currentPage,
  onPageChange,
  onAddNew,
  onDownloadTemplate,
  onImportExcel,
  onImportAppendExcel,
  onExportDataTemplate,
  onPackageAndGenerateMinutes,
  onLoadSampleData,
  onClearData,
  selectedDepartment,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  const getDepartmentInfo = () => {
    switch (selectedDepartment) {
      case 'dao_tao':
        return {
          title: 'Thanh toán giờ giảng (Giảng dạy lý thuyết, thực hành, đồ án)',
          badge: 'Thanh toán giờ giảng',
          templateName: 'Giờ giảng',
        };
      case 'khao_thi':
        return {
          title: 'Coi thi chấm thi ra đề (Coi thi kết thúc HP, chấm bài, ra đề thi)',
          badge: 'Coi thi chấm thi ra đề',
          templateName: 'Khảo thí',
        };
      case 'tuyen_sinh':
        return {
          title: 'Công tác tuyển sinh (Tư vấn tuyển sinh THPT, coi thi TS)',
          badge: 'Công tác tuyển sinh',
          templateName: 'Tuyển sinh',
        };
      case 'nckh':
        return {
          title: 'Nghiên cứu khoa học (Bài báo ISI/Scopus, đề tài NCKH, hướng dẫn ThS)',
          badge: 'Nghiên cứu khoa học',
          templateName: 'NCKH',
        };
      case 'co_van_hoc_tap':
        return {
          title: 'Cố vấn học tập (Quản lý lớp sinh viên, cố vấn học vụ, theo dõi tiến độ đào tạo)',
          badge: 'Cố vấn học tập',
          templateName: 'CVHT',
        };
      case 'cong_tac_khac':
        return {
          title: 'Công tác khác (Hội đồng khoa học, kiểm định chất lượng, thanh tra thi)',
          badge: 'Công tác khác',
          templateName: 'Công tác khác',
        };
      default:
        return {
          title: 'Thống kê thù lao giờ giảng & các hoạt động TDU (Toàn trường)',
          badge: 'Toàn trường TDU',
          templateName: 'Chuẩn TDU',
        };
    }
  };

  const deptInfo = getDepartmentInfo();

  return (
    <div className="bg-white border-b border-[#e2e8f0] px-4 py-2 select-none">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        {/* Buttons Toolbar: Cohesive, modern rounded-xl design */}
        <div className="flex items-center flex-wrap gap-2 text-[12.5px] font-medium">
          {/* Button 1: Thêm mới (TDU Green Primary) */}
          <button
            onClick={onAddNew}
            className="h-[34px] px-3.5 bg-[#005325] hover:bg-[#00421e] text-white rounded-xl flex items-center gap-1.5 shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm mới</span>
          </button>

          {/* Button 2: Tải mẫu trống (Emerald soft pill) */}
          <button
            onClick={onDownloadTemplate}
            className="h-[34px] px-3 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            title={`Tải file Excel mẫu chuẩn theo quy định của ${deptInfo.badge}`}
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Tải mẫu trống ({deptInfo.templateName})</span>
          </button>

          {/* Button 3: Nhập liệu từ Excel (Blue soft pill) */}
          <button
            onClick={onImportExcel}
            className="h-[34px] px-3 bg-blue-50 hover:bg-blue-100/80 text-blue-700 border border-blue-200 rounded-xl flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            title="Tải lên file Excel mới (kiểm tra định dạng, trùng lặp và tính toán số giờ)"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Nhập liệu từ Excel</span>
          </button>

          {/* Button 4: Nhập liệu bổ sung từ Excel (Indigo soft pill) */}
          <button
            onClick={onImportAppendExcel}
            className="h-[34px] px-3 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 border border-indigo-200 rounded-xl flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            title="Nhập bổ sung thêm các bản ghi từ file Excel mà không xóa dữ liệu đang có"
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
            <span>Nhập liệu bổ sung</span>
          </button>

          {/* Button 5: Tải mẫu có dữ liệu (Amber soft pill) */}
          <button
            onClick={onExportDataTemplate}
            className="h-[34px] px-3 bg-amber-50 hover:bg-amber-100/80 text-amber-800 border border-amber-200 rounded-xl flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            title="Xuất toàn bộ bảng thanh toán thù lao ra file Excel có công thức tính"
          >
            <FileDown className="w-4 h-4 text-amber-700" />
            <span>Xuất dữ liệu Excel</span>
          </button>

          {/* Button 6: Đóng gói và lập biên bản (Teal soft pill) */}
          <button
            onClick={onPackageAndGenerateMinutes}
            className="h-[34px] px-3 bg-teal-50 hover:bg-teal-100/80 text-teal-800 border border-teal-200 rounded-xl flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            title="Đóng gói dữ liệu kỳ thanh toán, lập biên bản nghiệm thu và trình ký duyệt"
          >
            <CheckSquare className="w-4 h-4 text-teal-700" />
            <span>Lập biên bản nghiệm thu</span>
          </button>
        </div>

        {/* Right side info & pagination in the same row */}
        <div className="flex items-center gap-2.5 text-[12px] text-slate-700 shrink-0 self-end lg:self-auto font-medium">
          <span className="text-slate-600">
            {totalRecords === 0 ? 'Không có dữ liệu' : `Tổng: ${totalRecords} bản ghi`}
          </span>

          <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-1.5 py-0.5 bg-slate-50">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1 || totalRecords === 0}
              className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Trang trước"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-transparent text-[11.5px] font-medium text-slate-700 border-none outline-none cursor-pointer py-0.5"
            >
              <option value="150">150</option>
              <option value="100">100</option>
              <option value="50">50</option>
              <option value="20">20</option>
            </select>

            <span className="text-[11.5px] text-slate-500 font-mono">
              {currentPage}/{totalPages}
            </span>

            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages || totalRecords === 0}
              className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Trang sau"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick toggle sample data button */}
          {totalRecords === 0 ? (
            <button
              onClick={onLoadSampleData}
              className="text-[11.5px] text-blue-700 hover:underline font-medium flex items-center gap-1 cursor-pointer bg-blue-50 px-2 py-1 rounded-lg border border-blue-200"
              title="Nạp dữ liệu giảng viên TDU mẫu để đối soát"
            >
              <Database className="w-3 h-3 text-blue-700" />
              Nạp dữ liệu mẫu
            </button>
          ) : (
            <button
              onClick={onClearData}
              className="text-[11.5px] text-slate-500 hover:text-red-600 flex items-center gap-0.5 cursor-pointer font-medium p-1 rounded hover:bg-slate-100"
              title="Làm trống bảng dữ liệu"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
