import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { DataQuality, DepartmentUnit } from '../types';

export interface FilterState {
  faculty: string;
  academicYear: string;
  semester: string;
  lecturerName: string;
  subjectName: string;
  // Additional system filters
  department: DepartmentUnit;
  paymentPhase: string;
  degreeLevel: string;
  activityType: string;
  dataQuality: DataQuality;
}

interface FilterSectionProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onSearch: () => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  onFilterChange,
  onSearch,
}) => {
  const handleChange = (field: keyof FilterState, value: any) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const handleReset = () => {
    onFilterChange({
      ...filters,
      faculty: 'all',
      academicYear: '2023 - 2024',
      semester: 'Học kỳ 2',
      lecturerName: '',
      subjectName: '',
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="bg-white border-b border-[#e2e8f0] px-4 py-3 select-none shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      {/* Exactly 5 requested filter fields: Khoa, Năm học, Học kỳ, Tên, Môn giảng dạy + Nút Tìm kiếm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-12 gap-3 text-[12.5px] items-end font-normal">
        {/* 1. Khoa / Bộ môn */}
        <div className="flex flex-col gap-1 xl:col-span-3">
          <label className="text-slate-700 text-[12px] font-medium">
            Khoa / Bộ môn
          </label>
          <div className="relative">
            <select
              value={filters.faculty}
              onChange={(e) => handleChange('faculty', e.target.value)}
              className="w-full h-[34px] px-2.5 pr-7 border border-[#cbd5e1] rounded-lg bg-white text-slate-800 text-[12.5px] appearance-none focus:outline-none focus:border-[#005325] focus:ring-1 focus:ring-[#005325] transition-colors truncate font-normal"
            >
              <option value="all">-- Tất cả Khoa / Bộ môn --</option>
              <option value="Khoa Công nghệ thông tin">Khoa Công nghệ thông tin</option>
              <option value="Khoa Dược - Điều dưỡng">Khoa Dược - Điều dưỡng</option>
              <option value="Khoa Kinh tế - Quản trị kinh doanh">Khoa Kinh tế - Quản trị KD</option>
              <option value="Khoa Luật">Khoa Luật</option>
              <option value="Khoa Ngoại ngữ">Khoa Ngoại ngữ</option>
              <option value="Khoa Sinh học ứng dụng">Khoa Sinh học ứng dụng</option>
              <option value="Khoa Du lịch">Khoa Du lịch</option>
              <option value="Bộ môn GDTC & QP">Bộ môn GDTC & QP</option>
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 2. Năm học */}
        <div className="flex flex-col gap-1 xl:col-span-2">
          <label className="text-slate-700 text-[12px] font-medium">
            Năm học
          </label>
          <div className="relative">
            <select
              value={filters.academicYear}
              onChange={(e) => handleChange('academicYear', e.target.value)}
              className="w-full h-[34px] px-2.5 pr-7 border border-[#cbd5e1] rounded-lg bg-white text-slate-800 text-[12.5px] appearance-none focus:outline-none focus:border-[#005325] focus:ring-1 focus:ring-[#005325] transition-colors font-normal"
            >
              <option value="all">-- Tất cả năm học --</option>
              <option value="2024 - 2025">2024 - 2025</option>
              <option value="2023 - 2024">2023 - 2024</option>
              <option value="2022 - 2023">2022 - 2023</option>
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 3. Học kỳ */}
        <div className="flex flex-col gap-1 xl:col-span-2">
          <label className="text-slate-700 text-[12px] font-medium">
            Học kỳ
          </label>
          <div className="relative">
            <select
              value={filters.semester}
              onChange={(e) => handleChange('semester', e.target.value)}
              className="w-full h-[34px] px-2.5 pr-7 border border-[#cbd5e1] rounded-lg bg-white text-slate-800 text-[12.5px] appearance-none focus:outline-none focus:border-[#005325] focus:ring-1 focus:ring-[#005325] transition-colors font-normal"
            >
              <option value="all">-- Tất cả học kỳ --</option>
              <option value="Học kỳ 1">Học kỳ 1</option>
              <option value="Học kỳ 2">Học kỳ 2</option>
              <option value="Học kỳ Hè">Học kỳ Hè</option>
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 4. Tên Giảng viên */}
        <div className="flex flex-col gap-1 xl:col-span-2">
          <label className="text-slate-700 text-[12px] font-medium">
            Họ tên Giảng viên
          </label>
          <input
            type="text"
            value={filters.lecturerName}
            onChange={(e) => handleChange('lecturerName', e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tên giảng viên..."
            className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded-lg bg-white text-slate-800 text-[12.5px] placeholder-slate-400 focus:outline-none focus:border-[#005325] focus:ring-1 focus:ring-[#005325] transition-colors"
          />
        </div>

        {/* 5. Môn giảng dạy */}
        <div className="flex flex-col gap-1 xl:col-span-2">
          <label className="text-slate-700 text-[12px] font-medium">
            Môn giảng dạy
          </label>
          <input
            type="text"
            value={filters.subjectName}
            onChange={(e) => handleChange('subjectName', e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập môn giảng dạy..."
            className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded-lg bg-white text-slate-800 text-[12.5px] placeholder-slate-400 focus:outline-none focus:border-[#005325] focus:ring-1 focus:ring-[#005325] transition-colors"
          />
        </div>

        {/* Action Buttons: Tìm kiếm & Đặt lại */}
        <div className="flex items-center gap-1.5 xl:col-span-1">
          <button
            onClick={onSearch}
            className="flex-1 h-[34px] bg-[#005325] hover:bg-[#00421e] text-white font-medium text-[12.5px] rounded-lg flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
            title="Áp dụng bộ lọc"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lọc</span>
          </button>
          <button
            onClick={handleReset}
            className="h-[34px] w-[34px] bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Đặt lại bộ lọc"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
