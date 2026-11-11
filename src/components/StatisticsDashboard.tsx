import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  Download,
  Printer,
  Building2,
  Users,
  Award,
  DollarSign,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { TeachingRecord, DepartmentUnit } from '../types';

interface StatisticsDashboardProps {
  records: TeachingRecord[];
  onNavigateToCategory: (dept: DepartmentUnit) => void;
}

export const StatisticsDashboard: React.FC<StatisticsDashboardProps> = ({
  records,
  onNavigateToCategory,
}) => {
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState<string>('all');

  const filteredRecords = useMemo(() => {
    if (selectedFacultyFilter === 'all') return records;
    return records.filter((r) => r.khoaBoMon === selectedFacultyFilter);
  }, [records, selectedFacultyFilter]);

  // Total metrics
  const totalRecords = filteredRecords.length;
  const totalQC = filteredRecords.reduce((sum, r) => sum + (r.tongTietQC || 0), 0);
  const totalGross = filteredRecords.reduce((sum, r) => sum + (r.tongTienThuLao || 0), 0);
  const totalTax = filteredRecords.reduce((sum, r) => sum + (r.thueTNCN || 0), 0);
  const totalNet = filteredRecords.reduce((sum, r) => sum + (r.thucNhan || 0), 0);
  const uniqueLecturers = new Set(filteredRecords.map((r) => r.maGV)).size;

  // Breakdown by 6 Activities
  const activityBreakdown = [
    {
      key: 'dao_tao' as DepartmentUnit,
      label: '1. Thanh toán giờ giảng',
      count: filteredRecords.filter((r) => r.phongBanQuanLy === 'dao_tao').length,
      qc: filteredRecords.filter((r) => r.phongBanQuanLy === 'dao_tao').reduce((s, r) => s + r.tongTietQC, 0),
      payout: filteredRecords.filter((r) => r.phongBanQuanLy === 'dao_tao').reduce((s, r) => s + r.thucNhan, 0),
      color: '#005325',
      border: 'border-emerald-200 hover:border-emerald-400',
      bgLight: 'bg-emerald-50/40',
    },
    {
      key: 'khao_thi' as DepartmentUnit,
      label: '2. Coi thi, chấm thi, ra đề',
      count: filteredRecords.filter((r) => r.phongBanQuanLy === 'khao_thi').length,
      qc: filteredRecords.filter((r) => r.phongBanQuanLy === 'khao_thi').reduce((s, r) => s + r.tongTietQC, 0),
      payout: filteredRecords.filter((r) => r.phongBanQuanLy === 'khao_thi').reduce((s, r) => s + r.thucNhan, 0),
      color: '#0284c7',
      border: 'border-sky-200 hover:border-sky-400',
      bgLight: 'bg-sky-50/40',
    },
    {
      key: 'tuyen_sinh' as DepartmentUnit,
      label: '3. Công tác tuyển sinh',
      count: filteredRecords.filter((r) => r.phongBanQuanLy === 'tuyen_sinh').length,
      qc: filteredRecords.filter((r) => r.phongBanQuanLy === 'tuyen_sinh').reduce((s, r) => s + r.tongTietQC, 0),
      payout: filteredRecords.filter((r) => r.phongBanQuanLy === 'tuyen_sinh').reduce((s, r) => s + r.thucNhan, 0),
      color: '#d97706',
      border: 'border-amber-200 hover:border-amber-400',
      bgLight: 'bg-amber-50/40',
    },
    {
      key: 'nckh' as DepartmentUnit,
      label: '4. Nghiên cứu khoa học',
      count: filteredRecords.filter((r) => r.phongBanQuanLy === 'nckh').length,
      qc: filteredRecords.filter((r) => r.phongBanQuanLy === 'nckh').reduce((s, r) => s + r.tongTietQC, 0),
      payout: filteredRecords.filter((r) => r.phongBanQuanLy === 'nckh').reduce((s, r) => s + r.thucNhan, 0),
      color: '#7c3aed',
      border: 'border-purple-200 hover:border-purple-400',
      bgLight: 'bg-purple-50/40',
    },
    {
      key: 'co_van_hoc_tap' as DepartmentUnit,
      label: '5. Cố vấn học tập',
      count: filteredRecords.filter((r) => r.phongBanQuanLy === 'co_van_hoc_tap').length,
      qc: filteredRecords.filter((r) => r.phongBanQuanLy === 'co_van_hoc_tap').reduce((s, r) => s + r.tongTietQC, 0),
      payout: filteredRecords.filter((r) => r.phongBanQuanLy === 'co_van_hoc_tap').reduce((s, r) => s + r.thucNhan, 0),
      color: '#2563eb',
      border: 'border-blue-200 hover:border-blue-400',
      bgLight: 'bg-blue-50/40',
    },
    {
      key: 'cong_tac_khac' as DepartmentUnit,
      label: '6. Công tác khác',
      count: filteredRecords.filter((r) => r.phongBanQuanLy === 'cong_tac_khac').length,
      qc: filteredRecords.filter((r) => r.phongBanQuanLy === 'cong_tac_khac').reduce((s, r) => s + r.tongTietQC, 0),
      payout: filteredRecords.filter((r) => r.phongBanQuanLy === 'cong_tac_khac').reduce((s, r) => s + r.thucNhan, 0),
      color: '#0d9488',
      border: 'border-teal-200 hover:border-teal-400',
      bgLight: 'bg-teal-50/40',
    },
  ];

  // Faculty Aggregation
  const facultyList = [
    'Khoa Công nghệ thông tin',
    'Khoa Dược - Điều dưỡng',
    'Khoa Kinh tế - Quản trị kinh doanh',
    'Khoa Luật',
    'Khoa Ngoại ngữ',
    'Khoa Sinh học ứng dụng',
  ];

  const facultyStats = facultyList.map((fac) => {
    const facRecords = records.filter((r) => r.khoaBoMon === fac);
    const count = facRecords.length;
    const gvCount = new Set(facRecords.map((r) => r.maGV)).size;
    const qc = facRecords.reduce((sum, r) => sum + r.tongTietQC, 0);
    const lt = facRecords.reduce((sum, r) => sum + r.soTietLT, 0);
    const th = facRecords.reduce((sum, r) => sum + r.soTietTH, 0);
    const gross = facRecords.reduce((sum, r) => sum + r.tongTienThuLao, 0);
    const tax = facRecords.reduce((sum, r) => sum + r.thueTNCN, 0);
    const net = facRecords.reduce((sum, r) => sum + r.thucNhan, 0);
    return {
      faculty: fac,
      count,
      gvCount,
      qc,
      lt,
      th,
      gross,
      tax,
      net,
    };
  });

  const displayedFacultyStats =
    selectedFacultyFilter === 'all'
      ? facultyStats
      : facultyStats.filter((f) => f.faculty === selectedFacultyFilter);

  const maxFacultyPayout = Math.max(1, ...facultyStats.map((f) => f.net));

  // Top Lecturers by Payout
  const lecturerMap: {
    [maGV: string]: { maGV: string; hoTen: string; khoa: string; hocVi: string; qc: number; net: number; count: number };
  } = {};
  filteredRecords.forEach((r) => {
    if (!lecturerMap[r.maGV]) {
      lecturerMap[r.maGV] = {
        maGV: r.maGV,
        hoTen: r.hoTen,
        khoa: r.khoaBoMon,
        hocVi: r.hocHamHocVi,
        qc: 0,
        net: 0,
        count: 0,
      };
    }
    lecturerMap[r.maGV].qc += r.tongTietQC;
    lecturerMap[r.maGV].net += r.thucNhan;
    lecturerMap[r.maGV].count += 1;
  });

  const topLecturers = Object.values(lecturerMap)
    .sort((a, b) => b.net - a.net)
    .slice(0, 6);

  // Export statistics
  const handleExportStats = () => {
    const wb = XLSX.utils.book_new();

    const facultyRows = displayedFacultyStats.map((f, i) => ({
      'STT': i + 1,
      'Khoa / Viện': f.faculty,
      'Số GV': f.gvCount,
      'Số hoạt động': f.count,
      'Tiết Lý thuyết': f.lt,
      'Tiết Thực hành': f.th,
      'Tổng tiết QC': f.qc,
      'Tổng thù lao (VNĐ)': f.gross,
      'Thuế TNCN (VNĐ)': f.tax,
      'Thực nhận (VNĐ)': f.net,
    }));
    const ws1 = XLSX.utils.json_to_sheet(facultyRows);
    XLSX.utils.book_append_sheet(wb, ws1, 'Thong_Ke_Theo_Khoa');

    const actRows = activityBreakdown.map((a, i) => ({
      'STT': i + 1,
      'Hạng mục công tác': a.label,
      'Số lượt ghi nhận': a.count,
      'Tổng tiết QC': a.qc,
      'Kinh phí chi trả (VNĐ)': a.payout,
      'Tỷ lệ kinh phí (%)': totalNet > 0 ? ((a.payout / totalNet) * 100).toFixed(1) + '%' : '0%',
    }));
    const ws2 = XLSX.utils.json_to_sheet(actRows);
    XLSX.utils.book_append_sheet(wb, ws2, 'Co_Cau_Hoat_Dong');

    XLSX.writeFile(wb, 'Bao_Cao_Thong_Ke_Gio_Giang_TDU_2026_2027.xlsx');
  };

  return (
    <div className="flex-1 bg-[#f8fafc] flex flex-col min-h-0 overflow-y-auto min-w-0 text-slate-800 font-sans">
      {/* 1. Header Toolbar: Title, Filter & Export */}
      <div className="bg-white border-b border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div>
          <h1 className="text-[17px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#005325]" />
            BÁO CÁO THỐNG KÊ TỔNG HỢP GIỜ GIẢNG & THÙ LAO TDU
          </h1>
          <p className="text-[12.5px] text-slate-500 mt-0.5">
            Dữ liệu tổng hợp toàn trường theo Quy chế chi tiêu nội bộ Trường Đại học Tây Đô
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1">
            <Building2 className="w-4 h-4 text-slate-500" />
            <select
              value={selectedFacultyFilter}
              onChange={(e) => setSelectedFacultyFilter(e.target.value)}
              className="bg-transparent text-[13px] font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả Khoa / Đơn vị ({facultyList.length})</option>
              {facultyList.map((fac) => (
                <option key={fac} value={fac}>
                  {fac}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportStats}
            className="h-[34px] px-3.5 bg-[#005325] hover:bg-[#00421e] text-white rounded-lg text-[13px] font-medium shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="h-[34px] px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-[13px] font-medium transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>In báo cáo</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (Clear, Readable Numbers) */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Thực nhận */}
        <div className="bg-white rounded-xl p-4 border border-emerald-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[13px] font-medium">Tổng kinh phí thực nhận</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#005325] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-[20px] font-bold font-mono text-[#005325] tabular-nums mt-0.5">
            {totalNet.toLocaleString('vi-VN')} <span className="text-[14px] font-sans font-medium text-slate-600">VNĐ</span>
          </div>
          <div className="text-[12px] text-slate-500 mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between">
            <span>Trước thuế:</span>
            <span className="font-mono font-semibold text-slate-700">{totalGross.toLocaleString('vi-VN')} đ</span>
          </div>
        </div>

        {/* Card 2: Tổng tiết QC */}
        <div className="bg-white rounded-xl p-4 border border-sky-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[13px] font-medium">Tổng tiết quy chuẩn (QC)</span>
            <span className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="text-[20px] font-bold font-mono text-sky-800 tabular-nums mt-0.5">
            {totalQC.toFixed(1)} <span className="text-[14px] font-sans font-medium text-slate-600">tiết</span>
          </div>
          <div className="text-[12px] text-slate-500 mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between">
            <span>Tổng số lượt ghi nhận:</span>
            <span className="font-mono font-semibold text-slate-700">{totalRecords} lượt</span>
          </div>
        </div>

        {/* Card 3: Số Giảng viên */}
        <div className="bg-white rounded-xl p-4 border border-purple-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[13px] font-medium">Số Giảng viên tham gia</span>
            <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-[20px] font-bold font-mono text-purple-800 tabular-nums mt-0.5">
            {uniqueLecturers} <span className="text-[14px] font-sans font-medium text-slate-600">Thầy / Cô</span>
          </div>
          <div className="text-[12px] text-slate-500 mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between">
            <span>Phân bố theo:</span>
            <span className="font-medium text-slate-700">{displayedFacultyStats.length} Khoa / Đơn vị</span>
          </div>
        </div>

        {/* Card 4: Thuế TNCN */}
        <div className="bg-white rounded-xl p-4 border border-rose-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[13px] font-medium">Thuế TNCN khấu trừ (10%)</span>
            <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-[12px]">
              10%
            </span>
          </div>
          <div className="text-[20px] font-bold font-mono text-rose-700 tabular-nums mt-0.5">
            {totalTax.toLocaleString('vi-VN')} <span className="text-[14px] font-sans font-medium text-slate-600">VNĐ</span>
          </div>
          <div className="text-[12px] text-slate-500 mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between">
            <span>Tỷ lệ trích nộp:</span>
            <span className="font-medium text-rose-700">Theo luật thuế hiện hành</span>
          </div>
        </div>
      </div>

      {/* 3. Main Content: Table + Analytics Cards */}
      <div className="px-4 pb-6 space-y-4">
        {/* Bảng tổng hợp khối lượng & kinh phí chi trả chi tiết theo Khoa */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4.5 h-4.5 text-[#005325]" />
              <span className="font-bold text-[14px] text-slate-900">
                BẢNG TỔNG HỢP KHỐI LƯỢNG GIỜ GIẢNG & KINH PHÍ CHI TRẢ THEO KHOA
              </span>
            </div>
            <div className="flex items-center gap-3 text-[12.5px] text-slate-600">
              {selectedFacultyFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedFacultyFilter('all')}
                  className="font-medium text-[#005325] hover:underline cursor-pointer"
                >
                  ← Hiển thị toàn trường
                </button>
              )}
              <span className="bg-white border border-slate-200 px-2.5 py-0.5 rounded-full text-slate-600 font-medium">
                {displayedFacultyStats.length} Đơn vị
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="bg-[#f1f5f9] text-[#1e293b] font-semibold border-b border-slate-300 h-[40px]">
                  <th className="px-3 text-center w-[50px] border-r border-slate-200">STT</th>
                  <th className="px-3.5 border-r border-slate-200 min-w-[220px]">Khoa / Viện / Đơn vị</th>
                  <th className="px-3 text-center border-r border-slate-200 w-[80px]">Số GV</th>
                  <th className="px-3 text-center border-r border-slate-200 w-[95px]">Số HĐ</th>
                  <th className="px-3 text-right border-r border-slate-200 w-[90px]">Tiết LT</th>
                  <th className="px-3 text-right border-r border-slate-200 w-[90px]">Tiết TH</th>
                  <th className="px-3 text-right border-r border-slate-200 w-[110px]">Tổng tiết QC</th>
                  <th className="px-3.5 text-right border-r border-slate-200 w-[145px]">Tổng thù lao (đ)</th>
                  <th className="px-3.5 text-right border-r border-slate-200 w-[135px]">Thuế TNCN (đ)</th>
                  <th className="px-3.5 text-right w-[150px] font-bold text-[#005325]">Thực nhận (đ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {displayedFacultyStats.map((f, i) => {
                  const isFiltered = selectedFacultyFilter === f.faculty;
                  return (
                    <tr
                      key={f.faculty}
                      onClick={() =>
                        setSelectedFacultyFilter(isFiltered ? 'all' : f.faculty)
                      }
                      className={`h-[40px] transition-colors cursor-pointer ${
                        isFiltered ? 'bg-emerald-50/70 font-medium' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="px-3 text-center font-mono border-r border-slate-100 text-slate-500">
                        {i + 1}
                      </td>
                      <td className="px-3.5 font-medium text-slate-900 border-r border-slate-100">
                        {f.faculty}
                      </td>
                      <td className="px-3 text-center font-mono border-r border-slate-100 font-semibold text-slate-800">
                        {f.gvCount}
                      </td>
                      <td className="px-3 text-center font-mono border-r border-slate-100">
                        {f.count}
                      </td>
                      <td className="px-3 text-right font-mono tabular-nums border-r border-slate-100">
                        {f.lt}
                      </td>
                      <td className="px-3 text-right font-mono tabular-nums border-r border-slate-100">
                        {f.th}
                      </td>
                      <td className="px-3 text-right font-mono tabular-nums font-semibold text-sky-800 border-r border-slate-100">
                        {f.qc.toFixed(1)}
                      </td>
                      <td className="px-3.5 text-right font-mono tabular-nums border-r border-slate-100">
                        {f.gross.toLocaleString('vi-VN')}
                      </td>
                      <td className="px-3.5 text-right font-mono tabular-nums border-r border-slate-100 text-rose-600">
                        -{f.tax.toLocaleString('vi-VN')}
                      </td>
                      <td className="px-3.5 text-right font-mono tabular-nums font-bold text-[#005325]">
                        {f.net.toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-[#f8fafc] font-bold text-slate-900 border-t-2 border-slate-300 h-[42px]">
                  <td colSpan={2} className="px-3.5 text-left text-[13.5px] font-bold">
                    TỔNG CỘNG ({displayedFacultyStats.length} Đơn vị)
                  </td>
                  <td className="px-3 text-center font-mono font-bold">{uniqueLecturers}</td>
                  <td className="px-3 text-center font-mono font-bold">{totalRecords}</td>
                  <td className="px-3 text-right font-mono tabular-nums font-bold">
                    {displayedFacultyStats.reduce((s, f) => s + f.lt, 0)}
                  </td>
                  <td className="px-3 text-right font-mono tabular-nums font-bold">
                    {displayedFacultyStats.reduce((s, f) => s + f.th, 0)}
                  </td>
                  <td className="px-3 text-right font-mono tabular-nums font-bold text-sky-800">
                    {totalQC.toFixed(1)}
                  </td>
                  <td className="px-3.5 text-right font-mono tabular-nums font-bold">
                    {totalGross.toLocaleString('vi-VN')}
                  </td>
                  <td className="px-3.5 text-right font-mono tabular-nums font-bold text-rose-600">
                    -{totalTax.toLocaleString('vi-VN')}
                  </td>
                  <td className="px-3.5 text-right font-mono tabular-nums font-bold text-[#005325] text-[14px]">
                    {totalNet.toLocaleString('vi-VN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 4. Hai cột phân tích trực quan: Tỷ trọng theo Khoa & Top Giảng viên */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Cột trái (7 phần): Phân bổ kinh phí theo Khoa */}
          <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
              <span className="font-bold text-[14px] text-slate-900">
                Phân bổ kinh phí thực nhận theo Khoa / Đơn vị
              </span>
              <span className="text-[12px] text-slate-500 font-medium">Đơn vị: VNĐ</span>
            </div>

            <div className="space-y-3">
              {facultyStats.map((fac) => {
                const widthPct = Math.min(100, (fac.net / maxFacultyPayout) * 100);
                return (
                  <div key={fac.faculty} className="text-[13px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-800 font-medium">{fac.faculty}</span>
                      <span className="font-mono text-slate-700 font-semibold">
                        {fac.net.toLocaleString('vi-VN')} đ{' '}
                        <span className="text-slate-500 text-[11.5px] font-normal">
                          ({fac.qc.toFixed(1)} QC · {fac.gvCount} GV)
                        </span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#005325] rounded-full transition-all duration-300"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cột phải (5 phần): Giảng viên có khối lượng quy chuẩn cao */}
          <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
                <span className="font-bold text-[14px] text-slate-900">
                  Giảng viên có khối lượng quy chuẩn cao
                </span>
                <span className="text-[12px] text-slate-500 font-medium">Học kỳ 1</span>
              </div>

              <div className="divide-y divide-slate-100">
                {topLecturers.map((lec, idx) => (
                  <div key={lec.maGV} className="py-2.5 flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11.5px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-slate-900 font-semibold truncate">{lec.hoTen}</div>
                        <div className="text-[11.5px] text-slate-500 truncate mt-0.5">
                          {lec.hocVi} • {lec.khoa}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-3">
                      <div className="font-mono text-[#005325] font-bold text-[13.5px]">
                        {lec.net.toLocaleString('vi-VN')} đ
                      </div>
                      <div className="text-[11.5px] text-slate-500 font-mono mt-0.5">
                        {lec.qc.toFixed(1)} tiết QC
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
