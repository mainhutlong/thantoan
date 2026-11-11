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
          title: 'Coi thi, Chấm thi, Ra đề (Ra đề tự luận/TN, coi thi kết thúc HP, chấm bài thi)',
          badge: 'Coi thi, Chấm thi, Ra đề',
          templateName: 'Khảo thí',
        };
      case 'do_an':
        return {
          title: 'Đồ án & Khóa luận tốt nghiệp (Hướng dẫn thực tập, BTL, Đồ án môn học, Khóa luận tốt nghiệp)',
          badge: 'Đồ án & Khóa luận',
          templateName: 'Đồ án & Khóa luận',
        };
      case 'tuyen_sinh':
        return {
          title: 'Công tác tuyển sinh (Tư vấn tuyển sinh THPT, tư vấn hướng nghiệp)',
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
          title: 'Công tác kiêm nhiệm & ĐBCL (Quản lý PTN, Dự giờ, Hội giảng, Tổ ĐBCL Khoa & Trường, Kiểm định)',
          badge: 'Kiêm nhiệm & ĐBCL',
          templateName: 'Kiêm nhiệm & ĐBCL',
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
    <div className="bg-white border-b border-[#e2e8f0] px-3 py-1.5 select-none">
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {/* Buttons Toolbar: Single-line compact layout */}
        <div className="flex items-center flex-nowrap gap-1.5 text-[11.5px] font-medium shrink-0">
          {/* Button 1: Thêm mới (TDU Green Primary) */}
          <button
            onClick={onAddNew}
            className="h-[30px] px-2.5 bg-[#005325] hover:bg-[#00421e] text-white rounded-lg flex items-center gap-1 shadow-2xs hover:shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Thêm mới</span>
          </button>

          {/* Button 2: Mẫu import (Tải file mẫu Excel chuẩn) */}
          <button
            onClick={onDownloadTemplate}
            className="h-[30px] px-2.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200 rounded-lg flex items-center gap-1 shadow-2xs hover:shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
            title={`Tải file Excel mẫu import dành cho ${deptInfo.badge}`}
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Mẫu import</span>
          </button>

          {/* Button 3: Nhập liệu từ Excel */}
          <button
            onClick={onImportExcel}
            className="h-[30px] px-2.5 bg-blue-50 hover:bg-blue-100/80 text-blue-700 border border-blue-200 rounded-lg flex items-center gap-1 shadow-2xs hover:shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
            title="Tải lên file Excel mới (kiểm tra định dạng, trùng lặp và tính toán số giờ)"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Nhập liệu Excel</span>
          </button>

          {/* Button 4: Nhập liệu bổ sung từ Excel */}
          <button
            onClick={onImportAppendExcel}
            className="h-[30px] px-2.5 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 border border-indigo-200 rounded-lg flex items-center gap-1 shadow-2xs hover:shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
            title="Nhập bổ sung thêm các bản ghi từ file Excel mà không xóa dữ liệu đang có"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
            <span>Nhập bổ sung</span>
          </button>

          {/* Button 5: Xuất dữ liệu Excel */}
          <button
            onClick={onExportDataTemplate}
            className="h-[30px] px-2.5 bg-amber-50 hover:bg-amber-100/80 text-amber-800 border border-amber-200 rounded-lg flex items-center gap-1 shadow-2xs hover:shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
            title="Xuất toàn bộ bảng thanh toán thù lao ra file Excel có công thức tính"
          >
            <FileDown className="w-3.5 h-3.5 text-amber-700" />
            <span>Xuất Excel</span>
          </button>

          {/* Button 6: Lập biên bản nghiệm thu */}
          <button
            onClick={onPackageAndGenerateMinutes}
            className="h-[30px] px-2.5 bg-teal-50 hover:bg-teal-100/80 text-teal-800 border border-teal-200 rounded-lg flex items-center gap-1 shadow-2xs hover:shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
            title="Đóng gói dữ liệu kỳ thanh toán, lập biên bản nghiệm thu và trình ký duyệt"
          >
            <CheckSquare className="w-3.5 h-3.5 text-teal-700" />
            <span>Lập biên bản</span>
          </button>
        </div>

        {/* Right side info & pagination in the same row */}
        <div className="flex items-center gap-2 text-[11.5px] text-slate-700 shrink-0 font-medium whitespace-nowrap">
          <span className="text-slate-600">
            {totalRecords === 0 ? 'Không có dữ liệu' : `Tổng: ${totalRecords} bản ghi`}
          </span>

          <div className="flex items-center gap-0.5 border border-slate-200 rounded-lg px-1.5 h-[28px] bg-slate-50">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1 || totalRecords === 0}
              className="p-0.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Trang trước"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-transparent text-[11px] font-medium text-slate-700 border-none outline-none cursor-pointer"
            >
              <option value="150">150</option>
              <option value="100">100</option>
              <option value="50">50</option>
              <option value="20">20</option>
            </select>

            <span className="text-[11px] text-slate-500">
              {currentPage}/{totalPages}
            </span>

            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages || totalRecords === 0}
              className="p-0.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Trang sau"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick toggle sample data button */}
          {totalRecords === 0 ? (
            <button
              onClick={onLoadSampleData}
              className="text-[11px] text-blue-700 hover:underline font-medium flex items-center gap-1 cursor-pointer bg-blue-50 px-2 h-[28px] rounded-lg border border-blue-200 whitespace-nowrap"
              title="Nạp dữ liệu giảng viên TDU mẫu để đối soát"
            >
              <Database className="w-3 h-3 text-blue-700" />
              Nạp mẫu
            </button>
          ) : (
            <button
              onClick={onClearData}
              className="text-[11px] text-slate-500 hover:text-red-600 flex items-center gap-0.5 cursor-pointer font-medium p-1 rounded hover:bg-slate-100"
              title="Làm trống bảng dữ liệu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
