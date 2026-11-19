import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  Download,
  Printer,
  Building2,
  TrendingUp,
  FileSpreadsheet,
  PieChart,
  BarChart3,
  Award,
  Users,
  Wallet,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
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
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const [barMetric, setBarMetric] = useState<'qc' | 'net'>('qc');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

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
  const activityBreakdown = useMemo(() => [
    {
      key: 'dao_tao' as DepartmentUnit,
      label: '1. Thanh toán giờ giảng',
      shortLabel: 'Giờ giảng',
      count: filteredRecords.filter((r) => r.phongBanQuanLy === 'dao_tao').length,
      qc: filteredRecords.filter((r) => r.phongBanQuanLy === 'dao_tao').reduce((s, r) => s + r.tongTietQC, 0),
      payout: filteredRecords.filter((r) => r.phongBanQuanLy === 'dao_tao').reduce((s, r) => s + r.thucNhan, 0),
      color: '#005325',
    },
    {
      key: 'khao_thi' as DepartmentUnit,
      label: '2. Coi thi, chấm thi, ra đề',
      shortLabel: 'Khảo thí',
      count: filteredRecords.filter((r) => r.phongBanQuanLy === 'khao_thi').length,
      qc: filteredRecords.filter((r) => r.phongBanQuanLy === 'khao_thi').reduce((s, r) => s + r.tongTietQC, 0),
      payout: filteredRecords.filter((r) => r.phongBanQuanLy === 'khao_thi').reduce((s, r) => s + r.thucNhan, 0),
      color: '#0284c7',
    },
    {
      key: 'tuyen_sinh' as DepartmentUnit,
      label: '3. Công tác tuyển sinh',
      shortLabel: 'Tuyển sinh',
      count: filteredRecords.filter((r) => r.phongBanQuanLy === 'tuyen_sinh').length,
      qc: filteredRecords.filter((r) => r.phongBanQuanLy === 'tuyen_sinh').reduce((s, r) => s + r.tongTietQC, 0),
      payout: filteredRecords.filter((r) => r.phongBanQuanLy === 'tuyen_sinh').reduce((s, r) => s + r.thucNhan, 0),
      color: '#d97706',
    },
    {
      key: 'nckh' as DepartmentUnit,
      label: '4. Nghiên cứu khoa học',
      shortLabel: 'NCKH',
      count: filteredRecords.filter((r) => r.phongBanQuanLy === 'nckh').length,
      qc: filteredRecords.filter((r) => r.phongBanQuanLy === 'nckh').reduce((s, r) => s + r.tongTietQC, 0),
      payout: filteredRecords.filter((r) => r.phongBanQuanLy === 'nckh').reduce((s, r) => s + r.thucNhan, 0),
      color: '#7c3aed',
    },
    {
      key: 'co_van_hoc_tap' as DepartmentUnit,
      label: '5. Cố vấn học tập',
      shortLabel: 'Cố vấn HT',
      count: filteredRecords.filter((r) => r.phongBanQuanLy === 'co_van_hoc_tap').length,
      qc: filteredRecords.filter((r) => r.phongBanQuanLy === 'co_van_hoc_tap').reduce((s, r) => s + r.tongTietQC, 0),
      payout: filteredRecords.filter((r) => r.phongBanQuanLy === 'co_van_hoc_tap').reduce((s, r) => s + r.thucNhan, 0),
      color: '#2563eb',
    },
    {
      key: 'cong_tac_khac' as DepartmentUnit,
      label: '6. Công tác khác',
      shortLabel: 'Công tác khác',
      count: filteredRecords.filter((r) => r.phongBanQuanLy === 'cong_tac_khac').length,
      qc: filteredRecords.filter((r) => r.phongBanQuanLy === 'cong_tac_khac').reduce((s, r) => s + r.tongTietQC, 0),
      payout: filteredRecords.filter((r) => r.phongBanQuanLy === 'cong_tac_khac').reduce((s, r) => s + r.thucNhan, 0),
      color: '#0d9488',
    },
  ], [filteredRecords]);

  // Total Activity Payout for Pie Calculation
  const totalActivityPayout = useMemo(
    () => activityBreakdown.reduce((sum, a) => sum + a.payout, 0),
    [activityBreakdown]
  );

  // SVG Donut Slices
  const donutSlices = useMemo(() => {
    let accumulatedAngle = 0;
    return activityBreakdown.map((act) => {
      const pct = totalActivityPayout > 0 ? act.payout / totalActivityPayout : 0;
      const angle = pct * 360;
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + angle;
      accumulatedAngle += angle;
      return {
        ...act,
        pct,
        pctFormatted: (pct * 100).toFixed(1),
        startAngle,
        endAngle,
      };
    });
  }, [activityBreakdown, totalActivityPayout]);

  // Faculty Aggregation
  const facultyList = [
    'Khoa Công nghệ thông tin',
    'Khoa Dược - Điều dưỡng',
    'Khoa Kinh tế - Quản trị kinh doanh',
    'Khoa Luật',
    'Khoa Ngoại ngữ',
    'Khoa Sinh học ứng dụng',
  ];

  const facultyStats = useMemo(() => facultyList.map((fac) => {
    const facRecords = records.filter((r) => r.khoaBoMon === fac);
    const count = facRecords.length;
    const gvCount = new Set(facRecords.map((r) => r.maGV)).size;
    const qc = facRecords.reduce((sum, r) => sum + r.tongTietQC, 0);
    const lt = facRecords.reduce((sum, r) => sum + (r.soTietLT || 0), 0);
    const th = facRecords.reduce((sum, r) => sum + (r.soTietTH || 0), 0);
    const gross = facRecords.reduce((sum, r) => sum + r.tongTienThuLao, 0);
    const tax = facRecords.reduce((sum, r) => sum + r.thueTNCN, 0);
    const net = facRecords.reduce((sum, r) => sum + r.thucNhan, 0);
    
    // Short label for chart
    let shortName = fac.replace('Khoa ', '');
    if (shortName === 'Công nghệ thông tin') shortName = 'CNTT';
    if (shortName === 'Kinh tế - Quản trị kinh doanh') shortName = 'KT - QTKD';
    if (shortName === 'Sinh học ứng dụng') shortName = 'SHƯD';

    return {
      faculty: fac,
      shortName,
      count,
      gvCount,
      qc,
      lt,
      th,
      gross,
      tax,
      net,
    };
  }), [records]);

  const displayedFacultyStats = useMemo(
    () => (selectedFacultyFilter === 'all'
      ? facultyStats
      : facultyStats.filter((f) => f.faculty === selectedFacultyFilter)),
    [selectedFacultyFilter, facultyStats]
  );

  const sortedFacultyByNet = useMemo(
    () => [...facultyStats].sort((a, b) => b.net - a.net),
    [facultyStats]
  );

  const maxFacultyPayout = Math.max(1, ...facultyStats.map((f) => f.net));
  const maxFacultyQC = Math.max(1, ...facultyStats.map((f) => f.qc));

  // Top Lecturers by QC (khối lượng quy chuẩn)
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

  const topLecturersByQC = useMemo(
    () => Object.values(lecturerMap)
      .sort((a, b) => b.qc - a.qc || b.net - a.net)
      .slice(0, 6),
    [lecturerMap]
  );

  const maxTopQC = Math.max(1, ...topLecturersByQC.map((l) => l.qc));

  // Helper: Initials for avatar
  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length === 0) return 'GV';
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  // Helper: SVG Donut Slice Path
  const getDonutSlicePath = (
    cx: number,
    cy: number,
    rOut: number,
    rIn: number,
    startAngle: number,
    endAngle: number
  ) => {
    const diff = Math.min(endAngle - startAngle, 359.999);
    if (diff <= 0.01) return '';
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((startAngle + diff - 90) * Math.PI) / 180;

    const x1 = cx + rOut * Math.cos(startRad);
    const y1 = cy + rOut * Math.sin(startRad);
    const x2 = cx + rOut * Math.cos(endRad);
    const y2 = cy + rOut * Math.sin(endRad);

    const x3 = cx + rIn * Math.cos(endRad);
    const y3 = cy + rIn * Math.sin(endRad);
    const x4 = cx + rIn * Math.cos(startRad);
    const y4 = cy + rIn * Math.sin(startRad);

    const largeArc = diff > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rIn} ${rIn} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

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

      {/* 2. Báo cáo tổng hợp: 5 hàng đầu chuẩn mực, hài hòa và đồng nhất typography */}
      <div className="px-5 py-3.5 bg-white border-b border-slate-200">
        <div className="space-y-2 text-[13.5px]">
          {/* Hàng 1: Tổng kinh phí thực nhận */}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-0.5">
            <div className="flex items-center gap-2 min-w-[220px] sm:min-w-[240px]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#005325] shrink-0" />
              <span className="font-semibold text-slate-800">
                1. Tổng kinh phí thực nhận:
              </span>
            </div>
            <span className="font-bold text-[16px] text-[#005325] tabular-nums tracking-tight">
              {totalNet.toLocaleString('vi-VN')} VNĐ
            </span>
            <span className="text-slate-500 text-[12.5px]">
              (Thực nhận chuyển khoản vào tài khoản cá nhân của giảng viên sau thuế)
            </span>
          </div>

          {/* Hàng 2: Tổng thù lao gộp */}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-0.5">
            <div className="flex items-center gap-2 min-w-[220px] sm:min-w-[240px]">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600 shrink-0" />
              <span className="font-semibold text-slate-800">
                2. Tổng thù lao gộp:
              </span>
            </div>
            <span className="font-semibold text-[15.5px] text-slate-900 tabular-nums tracking-tight">
              {totalGross.toLocaleString('vi-VN')} VNĐ
            </span>
            <span className="text-slate-500 text-[12.5px]">
              (Tổng quỹ thù lao phát sinh trước thuế theo định mức quy chế chi tiêu nội bộ TDU)
            </span>
          </div>

          {/* Hàng 3: Tổng khối lượng quy chuẩn */}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-0.5">
            <div className="flex items-center gap-2 min-w-[220px] sm:min-w-[240px]">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600 shrink-0" />
              <span className="font-semibold text-slate-800">
                3. Tổng tiết quy chuẩn (QC):
              </span>
            </div>
            <span className="font-semibold text-[15.5px] text-sky-800 tabular-nums tracking-tight">
              {totalQC.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} tiết
            </span>
            <span className="text-slate-500 text-[12.5px]">
              (Tổng hợp từ <span className="font-semibold text-slate-700 tabular-nums">{totalRecords}</span> lượt kê khai công tác được duyệt)
            </span>
          </div>

          {/* Hàng 4: Thuế TNCN khấu trừ */}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-0.5">
            <div className="flex items-center gap-2 min-w-[220px] sm:min-w-[240px]">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span className="font-semibold text-slate-800">
                4. Thuế TNCN khấu trừ:
              </span>
            </div>
            <span className="font-semibold text-[15.5px] text-rose-700 tabular-nums tracking-tight">
              {totalTax.toLocaleString('vi-VN')} VNĐ
            </span>
            <span className="text-slate-500 text-[12.5px]">
              (Thuế TNCN 10% khấu trừ tại nguồn theo đúng quy định pháp luật hiện hành)
            </span>
          </div>

          {/* Hàng 5: Quy mô giảng viên tham gia */}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-0.5">
            <div className="flex items-center gap-2 min-w-[220px] sm:min-w-[240px]">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
              <span className="font-semibold text-slate-800">
                5. Quy mô giảng viên:
              </span>
            </div>
            <span className="font-semibold text-[15.5px] text-purple-900 tabular-nums tracking-tight">
              {uniqueLecturers} Thầy / Cô
            </span>
            <span className="text-slate-500 text-[12.5px]">
              (Phân bổ theo <span className="font-semibold text-slate-700 tabular-nums">{displayedFacultyStats.length}</span> Khoa / Viện / Bộ môn trực thuộc)
            </span>
          </div>
        </div>
      </div>

      {/* 3. Dashboard Charts: Biểu đồ tròn (Tỷ trọng 6 hạng mục) & Biểu đồ cột (So sánh Khoa / Đơn vị) */}
      <div className="px-5 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Chart 1 (Left - 5 Cols): Biểu đồ tròn cơ cấu kinh phí 6 chuyên mục */}
          <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4.5 h-4.5 text-[#005325]" />
                  <span className="font-bold text-[13.5px] text-slate-900">
                    Cơ cấu kinh phí theo 6 chuyên mục
                  </span>
                </div>
                <span className="text-[11.5px] text-slate-500 font-medium">Tỷ trọng %</span>
              </div>

              {/* Donut Graphic & Center Label */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-3">
                <div className="relative w-[170px] h-[170px] shrink-0">
                  <svg viewBox="0 0 180 180" className="w-full h-full transform -rotate-90">
                    {donutSlices.map((slice, idx) => {
                      const path = getDonutSlicePath(90, 90, 82, 52, slice.startAngle, slice.endAngle);
                      if (!path) return null;
                      const isHovered = hoveredSlice === idx;
                      return (
                        <path
                          key={slice.key}
                          d={path}
                          fill={slice.color}
                          opacity={hoveredSlice === null || isHovered ? 1 : 0.45}
                          className="transition-all duration-200 cursor-pointer"
                          onMouseEnter={() => setHoveredSlice(idx)}
                          onMouseLeave={() => setHoveredSlice(null)}
                        />
                      );
                    })}
                  </svg>

                  {/* Center Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
                    {hoveredSlice !== null && donutSlices[hoveredSlice] ? (
                      <>
                        <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-tight truncate max-w-[85px]">
                          {donutSlices[hoveredSlice].shortLabel}
                        </span>
                        <span className="text-[16px] font-bold text-slate-900 tabular-nums">
                          {donutSlices[hoveredSlice].pctFormatted}%
                        </span>
                        <span className="text-[10px] font-semibold text-[#005325] tabular-nums">
                          {(donutSlices[hoveredSlice].payout / 1_000_000).toFixed(1)} tr đ
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Tổng thực nhận
                        </span>
                        <span className="text-[15px] font-bold text-[#005325] tabular-nums">
                          {(totalNet / 1_000_000_000).toFixed(2)} tỷ
                        </span>
                        <span className="text-[10.5px] text-slate-500">6 hạng mục</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Compact Legend */}
                <div className="flex-1 w-full space-y-1.5 text-[12px]">
                  {donutSlices.map((slice, idx) => {
                    const isHovered = hoveredSlice === idx;
                    return (
                      <div
                        key={slice.key}
                        onMouseEnter={() => setHoveredSlice(idx)}
                        onMouseLeave={() => setHoveredSlice(null)}
                        className={`flex items-center justify-between px-2 py-1 rounded transition-colors cursor-pointer ${
                          isHovered ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: slice.color }}
                          />
                          <span className="truncate text-slate-700">{slice.shortLabel}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-semibold text-slate-900 tabular-nums">
                            {slice.pctFormatted}%
                          </span>
                          <span className="text-slate-500 text-[11px] tabular-nums w-[65px] text-right">
                            {(slice.payout / 1_000_000).toFixed(0)} tr
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="text-[11.5px] text-slate-400 text-center pt-1 border-t border-slate-100">
              * Di chuột vào từng lát cắt để xem chi tiết kinh phí & tỷ trọng
            </div>
          </div>

          {/* Chart 2 (Right - 7 Cols): Biểu đồ cột so sánh các Khoa / Viện */}
          <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4.5 h-4.5 text-[#005325]" />
                  <span className="font-bold text-[13.5px] text-slate-900">
                    So sánh khối lượng & kinh phí theo Khoa / Viện
                  </span>
                </div>

                {/* Metric switch toggle buttons */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[12px]">
                  <button
                    type="button"
                    onClick={() => setBarMetric('qc')}
                    className={`px-2.5 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                      barMetric === 'qc'
                        ? 'bg-white text-sky-800 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tiết QC
                  </button>
                  <button
                    type="button"
                    onClick={() => setBarMetric('net')}
                    className={`px-2.5 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                      barMetric === 'net'
                        ? 'bg-white text-[#005325] shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Thực nhận (VNĐ)
                  </button>
                </div>
              </div>

              {/* SVG Column Chart */}
              <div className="pt-2 pb-1">
                <div className="w-full h-[180px]">
                  <svg viewBox="0 0 520 180" className="w-full h-full">
                    {/* Horizontal Gridlines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                      const y = 145 - ratio * 115;
                      const val = barMetric === 'qc' ? ratio * maxFacultyQC : ratio * maxFacultyPayout;
                      const label =
                        barMetric === 'qc'
                          ? val.toFixed(0)
                          : ratio === 0
                          ? '0'
                          : `${(val / 1_000_000).toFixed(0)} tr`;
                      return (
                        <g key={ratio}>
                          <line
                            x1={45}
                            y1={y}
                            x2={505}
                            y2={y}
                            stroke="#f1f5f9"
                            strokeWidth="1"
                            strokeDasharray={ratio === 0 ? '' : '3 3'}
                          />
                          <text
                            x={40}
                            y={y + 3.5}
                            textAnchor="end"
                            fontSize="9.5"
                            fill="#94a3b8"
                            className="font-mono tabular-nums"
                          >
                            {label}
                          </text>
                        </g>
                      );
                    })}

                    {/* Columns for 6 Faculties */}
                    {facultyStats.map((f, i) => {
                      const slotW = 460 / facultyStats.length;
                      const barW = 34;
                      const barX = 45 + i * slotW + (slotW - barW) / 2;
                      const val = barMetric === 'qc' ? f.qc : f.net;
                      const max = barMetric === 'qc' ? maxFacultyQC : maxFacultyPayout;
                      const barH = Math.max(4, (val / max) * 115);
                      const barY = 145 - barH;
                      const isHovered = hoveredBar === i;

                      const topLabel =
                        barMetric === 'qc'
                          ? f.qc.toFixed(1)
                          : `${(f.net / 1_000_000).toFixed(0)}tr`;

                      const barColor =
                        barMetric === 'qc'
                          ? isHovered
                            ? '#0369a1'
                            : '#0284c7'
                          : isHovered
                          ? '#00421e'
                          : '#005325';

                      return (
                        <g
                          key={f.faculty}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredBar(i)}
                          onMouseLeave={() => setHoveredBar(null)}
                          onClick={() =>
                            setSelectedFacultyFilter(
                              selectedFacultyFilter === f.faculty ? 'all' : f.faculty
                            )
                          }
                        >
                          {/* Top Value Label */}
                          <text
                            x={barX + barW / 2}
                            y={barY - 5}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="600"
                            fill={isHovered ? '#0f172a' : '#475569'}
                            className="font-mono tabular-nums"
                          >
                            {topLabel}
                          </text>

                          {/* Column Bar */}
                          <rect
                            x={barX}
                            y={barY}
                            width={barW}
                            height={barH}
                            rx={4}
                            ry={4}
                            fill={barColor}
                            opacity={hoveredBar === null || isHovered ? 1 : 0.6}
                            className="transition-all duration-200"
                          />

                          {/* Bottom Faculty Name Label */}
                          <text
                            x={barX + barW / 2}
                            y={162}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight={isHovered ? '700' : '500'}
                            fill={isHovered ? '#0f172a' : '#64748b'}
                          >
                            {f.shortName}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>

            {/* Hover Tooltip Info Banner */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 flex items-center justify-between text-[12px]">
              {hoveredBar !== null && facultyStats[hoveredBar] ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {facultyStats[hoveredBar].faculty}:
                    </span>
                    <span className="text-sky-800 font-semibold tabular-nums">
                      {facultyStats[hoveredBar].qc.toFixed(1)} tiết QC
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-[#005325] font-semibold tabular-nums">
                      {facultyStats[hoveredBar].net.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {facultyStats[hoveredBar].gvCount} giảng viên
                  </span>
                </>
              ) : (
                <div className="w-full text-center text-slate-500 text-[11.5px]">
                  * Nhấp vào cột để lọc dữ liệu theo Khoa tương ứng
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Main Content: Table BẢNG TỔNG HỢP KHỐI LƯỢNG GIỜ GIẢNG & KINH PHÍ CHI TRẢ THEO KHOA */}
      <div className="px-5 pt-4 pb-6 space-y-4">
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
                      <td className="px-3 text-center tabular-nums border-r border-slate-100 text-slate-500">
                        {i + 1}
                      </td>
                      <td className="px-3.5 font-medium text-slate-900 border-r border-slate-100">
                        {f.faculty}
                      </td>
                      <td className="px-3 text-center tabular-nums border-r border-slate-100 font-semibold text-slate-800">
                        {f.gvCount}
                      </td>
                      <td className="px-3 text-center tabular-nums border-r border-slate-100">
                        {f.count}
                      </td>
                      <td className="px-3 text-right tabular-nums border-r border-slate-100">
                        {f.lt}
                      </td>
                      <td className="px-3 text-right tabular-nums border-r border-slate-100">
                        {f.th}
                      </td>
                      <td className="px-3 text-right tabular-nums font-semibold text-sky-800 border-r border-slate-100">
                        {f.qc.toFixed(1)}
                      </td>
                      <td className="px-3.5 text-right tabular-nums border-r border-slate-100">
                        {f.gross.toLocaleString('vi-VN')}
                      </td>
                      <td className="px-3.5 text-right tabular-nums border-r border-slate-100 text-rose-600">
                        -{f.tax.toLocaleString('vi-VN')}
                      </td>
                      <td className="px-3.5 text-right tabular-nums font-bold text-[#005325]">
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
                  <td className="px-3 text-center tabular-nums font-bold">{uniqueLecturers}</td>
                  <td className="px-3 text-center tabular-nums font-bold">{totalRecords}</td>
                  <td className="px-3 text-right tabular-nums font-bold">
                    {displayedFacultyStats.reduce((s, f) => s + f.lt, 0)}
                  </td>
                  <td className="px-3 text-right tabular-nums font-bold">
                    {displayedFacultyStats.reduce((s, f) => s + f.th, 0)}
                  </td>
                  <td className="px-3 text-right tabular-nums font-bold text-sky-800">
                    {totalQC.toFixed(1)}
                  </td>
                  <td className="px-3.5 text-right tabular-nums font-bold">
                    {totalGross.toLocaleString('vi-VN')}
                  </td>
                  <td className="px-3.5 text-right tabular-nums font-bold text-rose-600">
                    -{totalTax.toLocaleString('vi-VN')}
                  </td>
                  <td className="px-3.5 text-right tabular-nums font-bold text-[#005325] text-[14px]">
                    {totalNet.toLocaleString('vi-VN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 5. Hai cột phân tích trực quan nâng cao: Phân bổ kinh phí theo Khoa & Top Giảng viên */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Cột trái (7 phần): Phân bổ kinh phí theo Khoa / Đơn vị (Có xếp hạng, tỷ lệ %, progress bar gradient) */}
          <div className="lg:col-span-7 bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4.5 h-4.5 text-[#005325]" />
                <span className="font-bold text-[14px] text-slate-900">
                  Phân bổ kinh phí thực nhận theo Khoa / Đơn vị
                </span>
              </div>
              <span className="text-[12px] text-slate-500 font-medium">Xếp theo tổng chi trả</span>
            </div>

            <div className="space-y-3">
              {sortedFacultyByNet.map((fac, idx) => {
                const widthPct = Math.min(100, (fac.net / maxFacultyPayout) * 100);
                const sharePct = totalNet > 0 ? ((fac.net / totalNet) * 100).toFixed(1) : '0';
                
                // Rank badge styling
                const rankBadgeClass =
                  idx === 0
                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                    : idx === 1
                    ? 'bg-slate-200 text-slate-800 border-slate-300 font-bold'
                    : idx === 2
                    ? 'bg-orange-100 text-orange-900 border-orange-300 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200';

                return (
                  <div
                    key={fac.faculty}
                    onClick={() =>
                      setSelectedFacultyFilter(
                        selectedFacultyFilter === fac.faculty ? 'all' : fac.faculty
                      )
                    }
                    className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition-all cursor-pointer text-[13px]"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-md border text-[11px] flex items-center justify-center shrink-0 ${rankBadgeClass}`}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-slate-900 font-semibold truncate">
                          {fac.faculty}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80 tabular-nums shrink-0">
                          {sharePct}% quỹ
                        </span>
                      </div>

                      <div className="text-right shrink-0 pl-2">
                        <span className="font-semibold text-slate-900 tabular-nums text-[13.5px]">
                          {fac.net.toLocaleString('vi-VN')} đ
                        </span>
                        <span className="text-slate-400 text-[11.5px] ml-1.5 tabular-nums">
                          ({fac.qc.toFixed(1)} QC · {fac.gvCount} GV)
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-[#005325] rounded-full transition-all duration-300"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cột phải (5 phần): Giảng viên có khối lượng quy chuẩn cao */}
          <div className="lg:col-span-5 bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Award className="w-4.5 h-4.5 text-amber-600" />
                  <span className="font-bold text-[14px] text-slate-900">
                    Giảng viên có khối lượng quy chuẩn cao
                  </span>
                </div>
                <span className="text-[12px] text-slate-500 font-medium">Top 6 toàn trường</span>
              </div>

              <div className="divide-y divide-slate-100">
                {topLecturersByQC.map((lec, idx) => {
                  const rankBadgeClass =
                    idx === 0
                      ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                      : idx === 1
                      ? 'bg-slate-200 text-slate-800 border-slate-300 font-bold'
                      : idx === 2
                      ? 'bg-orange-100 text-orange-900 border-orange-300 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 font-medium';

                  const qcRatio = (lec.qc / maxTopQC) * 100;

                  return (
                    <div key={lec.maGV} className="py-2.5 text-[13px]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-5 h-5 rounded-md border text-[11px] flex items-center justify-center shrink-0 ${rankBadgeClass}`}
                          >
                            {idx + 1}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center border border-slate-200 shrink-0">
                            {getInitials(lec.hoTen)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-slate-900 font-semibold truncate hover:text-[#005325]">
                              {lec.hoTen}
                            </div>
                            <div className="text-[11.5px] text-slate-500 truncate mt-0.5">
                              {lec.hocVi ? `${lec.hocVi} • ` : ''}{lec.khoa}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-3">
                          <div className="inline-block bg-sky-50 text-sky-800 border border-sky-200 rounded px-1.5 py-0.5 text-[11.5px] font-semibold tabular-nums">
                            {lec.qc.toFixed(1)} tiết QC
                          </div>
                          <div className="text-[12.5px] text-[#005325] font-semibold tabular-nums mt-0.5">
                            {lec.net.toLocaleString('vi-VN')} đ
                          </div>
                        </div>
                      </div>

                      {/* Mini proportion bar comparing with Top 1 */}
                      <div className="mt-1.5 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-500 rounded-full"
                          style={{ width: `${qcRatio}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-[11.5px] text-slate-400 text-center pt-2.5 mt-2 border-t border-slate-100">
              * Dựa trên tổng số tiết quy chuẩn (QC) đã phê duyệt và chi trả
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
