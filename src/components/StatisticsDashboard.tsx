import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  Download,
  Printer,
  Building2,
  PieChart,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  ChevronRight
} from 'lucide-react';
import * as XLSX from 'xlsx';
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

  // Total metrics
  const totalRecords = records.length;
  const totalQC = records.reduce((sum, r) => sum + (r.tongTietQC || 0), 0);
  const totalGross = records.reduce((sum, r) => sum + (r.tongTienThuLao || 0), 0);
  const totalTax = records.reduce((sum, r) => sum + (r.thueTNCN || 0), 0);
  const totalNet = records.reduce((sum, r) => sum + (r.thucNhan || 0), 0);
  const uniqueLecturers = new Set(records.map((r) => r.maGV)).size;

  // Breakdown by 5 Activities
  const activityBreakdown = [
    {
      key: 'dao_tao' as DepartmentUnit,
      label: 'Thanh toán giờ giảng',
      count: records.filter((r) => r.phongBanQuanLy === 'dao_tao').length,
      qc: records.filter((r) => r.phongBanQuanLy === 'dao_tao').reduce((s, r) => s + r.tongTietQC, 0),
      payout: records.filter((r) => r.phongBanQuanLy === 'dao_tao').reduce((s, r) => s + r.thucNhan, 0),
      color: '#005325',
      bgLight: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    {
      key: 'khao_thi' as DepartmentUnit,
      label: 'Coi thi chấm thi ra đề',
      count: records.filter((r) => r.phongBanQuanLy === 'khao_thi').length,
      qc: records.filter((r) => r.phongBanQuanLy === 'khao_thi').reduce((s, r) => s + r.tongTietQC, 0),
      payout: records.filter((r) => r.phongBanQuanLy === 'khao_thi').reduce((s, r) => s + r.thucNhan, 0),
      color: '#0284c7',
      bgLight: 'bg-sky-50',
      border: 'border-sky-200',
    },
    {
      key: 'tuyen_sinh' as DepartmentUnit,
      label: 'Công tác tuyển sinh',
      count: records.filter((r) => r.phongBanQuanLy === 'tuyen_sinh').length,
      qc: records.filter((r) => r.phongBanQuanLy === 'tuyen_sinh').reduce((s, r) => s + r.tongTietQC, 0),
      payout: records.filter((r) => r.phongBanQuanLy === 'tuyen_sinh').reduce((s, r) => s + r.thucNhan, 0),
      color: '#ea580c',
      bgLight: 'bg-amber-50',
      border: 'border-amber-200',
    },
    {
      key: 'nckh' as DepartmentUnit,
      label: 'Nghiên cứu khoa học',
      count: records.filter((r) => r.phongBanQuanLy === 'nckh').length,
      qc: records.filter((r) => r.phongBanQuanLy === 'nckh').reduce((s, r) => s + r.tongTietQC, 0),
      payout: records.filter((r) => r.phongBanQuanLy === 'nckh').reduce((s, r) => s + r.thucNhan, 0),
      color: '#7c3aed',
      bgLight: 'bg-purple-50',
      border: 'border-purple-200',
    },
    {
      key: 'cong_tac_khac' as DepartmentUnit,
      label: 'Công tác khác',
      count: records.filter((r) => r.phongBanQuanLy === 'cong_tac_khac').length,
      qc: records.filter((r) => r.phongBanQuanLy === 'cong_tac_khac').reduce((s, r) => s + r.tongTietQC, 0),
      payout: records.filter((r) => r.phongBanQuanLy === 'cong_tac_khac').reduce((s, r) => s + r.thucNhan, 0),
      color: '#0d9488',
      bgLight: 'bg-teal-50',
      border: 'border-teal-200',
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

  const maxFacultyPayout = Math.max(1, ...facultyStats.map((f) => f.net));

  // Top Lecturers by Payout
  const lecturerMap: { [maGV: string]: { maGV: string; hoTen: string; khoa: string; hocVi: string; qc: number; net: number; count: number } } = {};
  records.forEach((r) => {
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
    .slice(0, 5);

  // Export statistics
  const handleExportStats = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Tổng hợp theo khoa
    const facultyRows = facultyStats.map((f, i) => ({
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

    // Sheet 2: Cơ cấu hoạt động
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

    XLSX.writeFile(wb, 'Bao_Cao_Thong_Ke_Gio_Giang_TDU_2024.xlsx');
  };

  return (
    <div className="p-4 md:p-6 bg-[#f8fafc] flex-1 overflow-y-auto space-y-5 text-slate-800">
      {/* Title & Actions Bar */}
      <div className="bg-white p-4 rounded border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-emerald-100 text-[#005325]">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-[16px] md:text-[18px] font-bold text-slate-900 uppercase">
              BÁO CÁO THỐNG KÊ THÙ LAO & KHỐI LƯỢNG GIỜ GIẢNG TDU
            </h1>
          </div>
          <p className="text-[12px] text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Kỳ thanh toán: <strong>Học kỳ 2 (Năm học 2023 - 2024)</strong>
            </span>
            <span>·</span>
            <span>Đơn vị tổng hợp: <strong>Phòng Kế hoạch - Tài chính & Phòng Đào tạo TDU</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={handleExportStats}
            className="h-[32px] px-3 bg-[#005325] hover:bg-[#00421e] text-white rounded text-[12px] font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel thống kê</span>
          </button>
          <button
            onClick={() => window.print()}
            className="h-[32px] px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>In báo cáo</span>
          </button>
        </div>
      </div>

      {/* 4 Big KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Tổng thực nhận */}
        <div className="bg-white p-3.5 rounded border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-[12px]">
            <span className="font-medium">Tổng thực nhận toàn trường</span>
            <span className="p-1.5 rounded-full bg-emerald-50 text-[#005325]">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-[20px] font-bold text-[#005325] mt-1 font-mono">
            {totalNet.toLocaleString('vi-VN')} <span className="text-[13px] font-normal font-sans">đ</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Tổng trước thuế: {totalGross.toLocaleString('vi-VN')} đ</span>
            <span className="text-emerald-700 font-medium">100% chỉ tiêu</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#005325]" />
        </div>

        {/* Card 2: Tiết quy chuẩn */}
        <div className="bg-white p-3.5 rounded border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-[12px]">
            <span className="font-medium">Tổng tiết quy chuẩn (QC)</span>
            <span className="p-1.5 rounded-full bg-sky-50 text-sky-700">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-[20px] font-bold text-sky-800 mt-1 font-mono">
            {totalQC.toFixed(1)} <span className="text-[13px] font-normal font-sans">tiết QC</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Đơn giá bình quân: 172.000 đ/tiết</span>
            <span className="text-sky-700 font-medium">{totalRecords} lượt hoạt động</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-sky-600" />
        </div>

        {/* Card 3: Số giảng viên */}
        <div className="bg-white p-3.5 rounded border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-[12px]">
            <span className="font-medium">Giảng viên thụ hưởng</span>
            <span className="p-1.5 rounded-full bg-purple-50 text-purple-700">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-[20px] font-bold text-purple-800 mt-1 font-mono">
            {uniqueLecturers} <span className="text-[13px] font-normal font-sans">thầy / cô</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Độ phủ 6 Khoa & 2 Trung tâm</span>
            <span className="text-purple-700 font-medium">Cơ hữu & Thỉnh giảng</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600" />
        </div>

        {/* Card 4: Thuế TNCN */}
        <div className="bg-white p-3.5 rounded border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-[12px]">
            <span className="font-medium">Thuế TNCN khấu trừ (10%)</span>
            <span className="p-1.5 rounded-full bg-amber-50 text-amber-700">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-[20px] font-bold text-amber-800 mt-1 font-mono">
            {totalTax.toLocaleString('vi-VN')} <span className="text-[13px] font-normal font-sans">đ</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Khấu trừ tại nguồn nộp NSNN</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Chuẩn chứng từ
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
        </div>
      </div>

      {/* Section 2: 5 Main Categories Breakdown Cards (Interactive quick navigation to each sub-menu) */}
      <div className="bg-white p-4 rounded border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#005325]" />
            <h3 className="font-bold text-[13.5px] text-slate-800 uppercase tracking-wide">
              CƠ CẤU THEO 5 HẠNG MỤC CÔNG TÁC KÊ KHAI & THANH TOÁN
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Nhấp vào từng mục để chuyển nhanh đến giao diện kê khai</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {activityBreakdown.map((item) => {
            const percent = totalNet > 0 ? ((item.payout / totalNet) * 100).toFixed(1) : '0';
            return (
              <div
                key={item.key}
                onClick={() => onNavigateToCategory(item.key)}
                className={`p-3 rounded border ${item.border} ${item.bgLight} hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold text-slate-700 truncate">{item.label}</span>
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-[15px] font-bold font-mono text-slate-900 mt-1">
                    {item.payout.toLocaleString('vi-VN')} đ
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>{item.qc.toFixed(1)} tiết QC</span>
                    <span className="font-bold" style={{ color: item.color }}>{percent}%</span>
                  </div>
                </div>

                {/* Mini Progress Bar */}
                <div className="w-full h-1.5 bg-slate-200/80 rounded-full mt-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${percent}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Two Columns - Faculty Distribution Bar Chart & Top Lecturers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column (2 cols): Thống kê theo Khoa / Viện */}
        <div className="lg:col-span-2 bg-white p-4 rounded border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#005325]" />
              <h3 className="font-bold text-[13.5px] text-slate-800 uppercase tracking-wide">
                TIẾN ĐỘ & KINH PHÍ THEO KHOA / ĐƠN VỊ
              </h3>
            </div>
            <span className="text-[11.5px] text-slate-500">Đơn vị: VNĐ thực nhận</span>
          </div>

          <div className="space-y-3 pt-1">
            {facultyStats.map((fac) => {
              const widthPct = Math.min(100, (fac.net / maxFacultyPayout) * 100);
              return (
                <div key={fac.faculty} className="text-[12px]">
                  <div className="flex items-center justify-between font-medium mb-1">
                    <span className="text-slate-800 font-semibold">{fac.faculty}</span>
                    <span className="font-mono text-slate-700">
                      {fac.net.toLocaleString('vi-VN')} đ{' '}
                      <span className="text-slate-400 text-[11px]">({fac.qc.toFixed(1)} QC · {fac.gvCount} GV)</span>
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex items-center">
                    <div
                      className="h-full bg-[#005325] rounded-full transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 col): Top Giảng viên tiêu biểu */}
        <div className="bg-white p-4 rounded border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-[13.5px] text-slate-800 uppercase tracking-wide">
                  TOP GIẢNG VIÊN KHỐI LƯỢNG CAO
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Học kỳ 2</span>
            </div>

            <div className="divide-y divide-slate-100">
              {topLecturers.map((lec, idx) => (
                <div key={lec.maGV} className="py-2 flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10.5px] font-bold shrink-0 ${
                        idx === 0
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-800'
                          : idx === 2
                          ? 'bg-amber-50 text-amber-900 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-800">{lec.hoTen}</div>
                      <div className="text-[10.5px] text-slate-400 truncate max-w-[150px]">
                        {lec.hocVi} · {lec.khoa}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-[#005325]">
                      {lec.net.toLocaleString('vi-VN')} đ
                    </div>
                    <div className="text-[10.5px] text-slate-400">{lec.qc.toFixed(1)} tiết QC</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center bg-slate-50/60 rounded p-2 mt-2">
            Dữ liệu tổng hợp đối soát theo Quy chế chi tiêu nội bộ TDU
          </div>
        </div>
      </div>

      {/* Section 4: Detailed Summary Table by Faculty */}
      <div className="bg-white rounded border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 bg-[#f8fafc] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#005325]" />
            <h3 className="font-bold text-[13px] text-slate-800 uppercase tracking-wide">
              BẢNG TỔNG HỢP KHỐI LƯỢNG & KINH PHÍ CHI TRẢ CHI TIẾT THEO KHOA
            </h3>
          </div>
          <span className="text-[11.5px] text-slate-500">
            Tổng cộng: <strong>{facultyStats.length} đơn vị</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px] border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-2.5 text-center w-12 border-r border-slate-200">STT</th>
                <th className="p-2.5 border-r border-slate-200">Khoa / Viện / Đơn vị</th>
                <th className="p-2.5 text-center border-r border-slate-200">Số GV</th>
                <th className="p-2.5 text-center border-r border-slate-200">Số hoạt động</th>
                <th className="p-2.5 text-right border-r border-slate-200">Tiết LT</th>
                <th className="p-2.5 text-right border-r border-slate-200">Tiết TH</th>
                <th className="p-2.5 text-right border-r border-slate-200 bg-emerald-50/70 text-[#005325]">Tiết QC</th>
                <th className="p-2.5 text-right border-r border-slate-200">Tổng thù lao (đ)</th>
                <th className="p-2.5 text-right border-r border-slate-200">Thuế TNCN 10% (đ)</th>
                <th className="p-2.5 text-right font-bold text-[#005325]">Thực nhận (đ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {facultyStats.map((f, i) => (
                <tr key={f.faculty} className="hover:bg-slate-50 transition-colors">
                  <td className="p-2.5 text-center font-mono border-r border-slate-100 text-slate-400">{i + 1}</td>
                  <td className="p-2.5 font-semibold text-slate-800 border-r border-slate-100">{f.faculty}</td>
                  <td className="p-2.5 text-center font-mono border-r border-slate-100">{f.gvCount}</td>
                  <td className="p-2.5 text-center font-mono border-r border-slate-100">{f.count}</td>
                  <td className="p-2.5 text-right font-mono border-r border-slate-100">{f.lt}</td>
                  <td className="p-2.5 text-right font-mono border-r border-slate-100">{f.th}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-[#005325] border-r border-slate-100 bg-emerald-50/40">
                    {f.qc.toFixed(1)}
                  </td>
                  <td className="p-2.5 text-right font-mono border-r border-slate-100">{f.gross.toLocaleString('vi-VN')}</td>
                  <td className="p-2.5 text-right font-mono border-r border-slate-100 text-amber-700">{f.tax.toLocaleString('vi-VN')}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-[#005325]">{f.net.toLocaleString('vi-VN')}</td>
                </tr>
              ))}
              {/* Grand Total Row */}
              <tr className="bg-emerald-50/80 font-bold text-slate-900 border-t-2 border-emerald-300">
                <td colSpan={2} className="p-2.5 text-center uppercase tracking-wide text-[#005325]">
                  TỔNG CỘNG TOÀN TRƯỜNG TDU
                </td>
                <td className="p-2.5 text-center font-mono">{uniqueLecturers}</td>
                <td className="p-2.5 text-center font-mono">{totalRecords}</td>
                <td className="p-2.5 text-right font-mono">
                  {facultyStats.reduce((s, f) => s + f.lt, 0)}
                </td>
                <td className="p-2.5 text-right font-mono">
                  {facultyStats.reduce((s, f) => s + f.th, 0)}
                </td>
                <td className="p-2.5 text-right font-mono text-[#005325] text-[13px]">
                  {totalQC.toFixed(1)}
                </td>
                <td className="p-2.5 text-right font-mono">{totalGross.toLocaleString('vi-VN')}</td>
                <td className="p-2.5 text-right font-mono text-amber-800">{totalTax.toLocaleString('vi-VN')}</td>
                <td className="p-2.5 text-right font-mono text-[#005325] text-[13px]">
                  {totalNet.toLocaleString('vi-VN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
