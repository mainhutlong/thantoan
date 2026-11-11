import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Building,
  CreditCard,
  Eye,
  Send,
  ArrowUpDown,
  FileText
} from 'lucide-react';
import { TeachingRecord, LecturerPaymentSummary } from '../types';
import { TeachingScheduleModal } from './TeachingScheduleModal';
import { ResearchScheduleModal } from './ResearchScheduleModal';
import * as XLSX from 'xlsx';

interface TotalPaymentPageProps {
  records: TeachingRecord[];
  onNavigateToLecturerCheck?: (maGV: string) => void;
  onNavigateToFinance?: (maGV?: string) => void;
  onViewRecordDetail?: (record: TeachingRecord) => void;
}

export const TotalPaymentPage: React.FC<TotalPaymentPageProps> = ({
  records,
  onNavigateToLecturerCheck,
  onNavigateToFinance,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('all');
  const [confirmStatusFilter, setConfirmStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [selectedLecturerModal, setSelectedLecturerModal] = useState<LecturerPaymentSummary | null>(null);
  const [selectedScheduleMaGV, setSelectedScheduleMaGV] = useState<string | null>(null);
  const [selectedResearchScheduleMaGV, setSelectedResearchScheduleMaGV] = useState<string | null>(null);

  // Group and sum up the 5 declaration modules for each lecturer
  const lecturerSummaries: LecturerPaymentSummary[] = useMemo(() => {
    const map = new Map<string, LecturerPaymentSummary>();

    records.forEach((rec) => {
      if (!map.has(rec.maGV)) {
        // Determine default confirmation and payment status based on lecturer demo data
        let confStatus: 'pending' | 'confirmed' | 'disputed' = 'pending';
        let confDate: string | undefined = undefined;
        let payStatus: 'unpaid' | 'paid' = 'unpaid';
        let payDate: string | undefined = undefined;
        let transRef: string | undefined = undefined;

        if (rec.maGV === 'TDU00128') {
          confStatus = 'confirmed';
          confDate = '17/10/2024 14:32';
          payStatus = 'unpaid';
        } else if (rec.maGV === 'TDU00245') {
          confStatus = 'disputed';
          confDate = '16/10/2024 09:15';
          payStatus = 'unpaid';
        } else if (rec.maGV === 'TDU00312') {
          confStatus = 'confirmed';
          confDate = '15/10/2024 16:40';
          payStatus = 'paid';
          payDate = '18/10/2024 10:20';
          transRef = 'UNC-TDU-2024-88412';
        }

        map.set(rec.maGV, {
          maGV: rec.maGV,
          hoTen: rec.hoTen,
          ngaySinh: rec.ngaySinh,
          soCCCD: rec.soCCCD,
          hocHamHocVi: rec.hocHamHocVi,
          khoaBoMon: rec.khoaBoMon,
          soTaiKhoan: rec.soTaiKhoan,
          nganHang: rec.nganHang,
          tongGioLyThuyet: 0,
          tongGioThucHanh: 0,
          tongGioGiangDay: 0,
          daoTaoAmount: 0,
          daoTaoQC: 0,
          tongGioKhaoThi: 0,
          khaoThiAmount: 0,
          khaoThiQC: 0,
          tuyenSinhAmount: 0,
          tuyenSinhQC: 0,
          tongGioNCKH: 0,
          dinhMucNCKH: rec.dinhMucNCKH || 150,
          mucDoHoanThanhNCKH: 'khong_hoan_thanh',
          nckhAmount: 0,
          nckhQC: 0,
          coVanHocTapAmount: 0,
          coVanHocTapQC: 0,
          congTacKhacAmount: 0,
          congTacKhacQC: 0,
          tongQC: 0,
          tongThuLao: 0,
          thueTNCN: 0,
          thucNhan: 0,
          confirmationStatus: confStatus,
          confirmationDate: confDate,
          paymentStatus: payStatus,
          paymentDate: payDate,
          transactionRef: transRef,
        });
      }

      const item = map.get(rec.maGV)!;

      // Accumulate categories & breakdown
      if (rec.phongBanQuanLy === 'dao_tao') {
        item.daoTaoAmount += rec.tongTienThuLao;
        item.daoTaoQC += rec.tongTietQC;
        item.tongGioGiangDay += (rec.soGioQuyChuan || rec.tongTietQC || 0);
        if (rec.phanLoaiGiangDay === 'thuc_hanh_thuc_tap') {
          item.tongGioThucHanh += (rec.soGioQuyChuan || rec.tongTietQC || 0);
        } else {
          item.tongGioLyThuyet += (rec.soGioQuyChuan || rec.tongTietQC || 0);
        }
      } else if (rec.phongBanQuanLy === 'khao_thi') {
        item.khaoThiAmount += rec.tongTienThuLao;
        item.khaoThiQC += rec.tongTietQC;
        item.tongGioKhaoThi += (rec.tongSoGioTheoCV || rec.tongTietQC || 0);
      } else if (rec.phongBanQuanLy === 'tuyen_sinh') {
        item.tuyenSinhAmount += rec.tongTienThuLao;
        item.tuyenSinhQC += rec.tongTietQC;
      } else if (rec.phongBanQuanLy === 'nckh') {
        item.nckhAmount += rec.tongTienThuLao;
        item.nckhQC += rec.tongTietQC;
        item.tongGioNCKH += (rec.soGioQCNCKH || rec.tongTietQC || 0);
        if (rec.dinhMucNCKH) {
          item.dinhMucNCKH = rec.dinhMucNCKH;
        }
        item.mucDoHoanThanhNCKH = item.tongGioNCKH >= item.dinhMucNCKH ? 'hoan_thanh' : 'khong_hoan_thanh';
      } else if (rec.phongBanQuanLy === 'co_van_hoc_tap') {
        item.coVanHocTapAmount += rec.tongTienThuLao;
        item.coVanHocTapQC += rec.tongTietQC;
      } else if (rec.phongBanQuanLy === 'cong_tac_khac') {
        item.congTacKhacAmount += rec.tongTienThuLao;
        item.congTacKhacQC += rec.tongTietQC;
      }

      item.tongQC += rec.tongTietQC;
      item.tongThuLao += rec.tongTienThuLao;
      item.thueTNCN += rec.thueTNCN;
      item.thucNhan += rec.thucNhan;
    });

    return Array.from(map.values());
  }, [records]);

  // List of faculties
  const faculties = useMemo(() => {
    const set = new Set<string>();
    lecturerSummaries.forEach((l) => set.add(l.khoaBoMon));
    return Array.from(set);
  }, [lecturerSummaries]);

  // Filtered summaries
  const filteredSummaries = useMemo(() => {
    return lecturerSummaries.filter((l) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          l.hoTen.toLowerCase().includes(q) ||
          l.maGV.toLowerCase().includes(q) ||
          (l.soCCCD && l.soCCCD.includes(q));
        if (!match) return false;
      }
      if (facultyFilter !== 'all' && l.khoaBoMon !== facultyFilter) {
        return false;
      }
      if (confirmStatusFilter !== 'all' && l.confirmationStatus !== confirmStatusFilter) {
        return false;
      }
      if (paymentStatusFilter !== 'all' && l.paymentStatus !== paymentStatusFilter) {
        return false;
      }
      return true;
    });
  }, [lecturerSummaries, searchTerm, facultyFilter, confirmStatusFilter, paymentStatusFilter]);

  // Grand totals
  const grandTotals = useMemo(() => {
    return filteredSummaries.reduce(
      (acc, curr) => ({
        tongQC: acc.tongQC + curr.tongQC,
        daoTaoAmount: acc.daoTaoAmount + curr.daoTaoAmount,
        khaoThiAmount: acc.khaoThiAmount + curr.khaoThiAmount,
        tuyenSinhAmount: acc.tuyenSinhAmount + curr.tuyenSinhAmount,
        nckhAmount: acc.nckhAmount + curr.nckhAmount,
        congTacKhacAmount: acc.congTacKhacAmount + curr.congTacKhacAmount,
        tongThuLao: acc.tongThuLao + curr.tongThuLao,
        thueTNCN: acc.thueTNCN + curr.thueTNCN,
        thucNhan: acc.thucNhan + curr.thucNhan,
      }),
      {
        tongQC: 0,
        daoTaoAmount: 0,
        khaoThiAmount: 0,
        tuyenSinhAmount: 0,
        nckhAmount: 0,
        congTacKhacAmount: 0,
        tongThuLao: 0,
        thueTNCN: 0,
        thucNhan: 0,
      }
    );
  }, [filteredSummaries]);

  // Counts
  const confirmedCount = lecturerSummaries.filter((l) => l.confirmationStatus === 'confirmed').length;
  const disputedCount = lecturerSummaries.filter((l) => l.confirmationStatus === 'disputed').length;
  const pendingCount = lecturerSummaries.filter((l) => l.confirmationStatus === 'pending').length;
  const paidCount = lecturerSummaries.filter((l) => l.paymentStatus === 'paid').length;

  // Export Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const rows = filteredSummaries.map((item, idx) => ({
      'STT': idx + 1,
      'Mã GV': item.maGV,
      'Họ và tên Giảng viên': item.hoTen,
      'Học hàm / Học vị': item.hocHamHocVi,
      'Khoa / Đơn vị': item.khoaBoMon,
      'Số CCCD': item.soCCCD || '',
      'Số tài khoản': item.soTaiKhoan || '',
      'Ngân hàng': item.nganHang || '',
      '1. Giờ giảng (VNĐ)': item.daoTaoAmount,
      '2. Coi/chấm thi (VNĐ)': item.khaoThiAmount,
      '3. Tuyển sinh (VNĐ)': item.tuyenSinhAmount,
      '4. NCKH (VNĐ)': item.nckhAmount,
      '5. Cố vấn HT (VNĐ)': item.coVanHocTapAmount,
      '6. Công tác khác (VNĐ)': item.congTacKhacAmount,
      'Tổng tiết QC': item.tongQC,
      'Tổng thù lao gộp (VNĐ)': item.tongThuLao,
      'Thuế TNCN 10% (VNĐ)': item.thueTNCN,
      'Tổng thực nhận (VNĐ)': item.thucNhan,
      'Xác nhận của GV':
        item.confirmationStatus === 'confirmed'
          ? 'Đã đồng ý xác nhận'
          : item.confirmationStatus === 'disputed'
          ? 'Có khiếu nại'
          : 'Chờ GV kiểm tra',
      'Tình trạng thanh toán': item.paymentStatus === 'paid' ? 'Đã thanh toán (UNC)' : 'Chờ chi trả',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Tong_Thanh_Toan_5_Muc');
    XLSX.writeFile(wb, `Tong_Hop_Thanh_Toan_TDU_HK2_2024.xlsx`);
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-0 overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-normal bg-emerald-50 text-[#005325] border border-emerald-200">
                Bảng tổng hợp toàn trường
              </span>
              <span className="text-xs text-slate-500 font-normal">
                Cộng dồn tự động các nguồn kê khai (Giờ giảng, Khảo thí, Tuyển sinh, NCKH, Cố vấn HT, Khác)
              </span>
            </div>
            <h1 className="text-xl font-normal text-slate-900 mt-1 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#005325]" />
              Tổng thanh toán thù lao giảng viên
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">
              Tổng hợp số tiền chính xác từ: Giờ giảng + Coi/chấm thi + Tuyển sinh + NCKH + Cố vấn học tập + Công tác khác.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#005325] hover:bg-[#00421d] text-white rounded text-xs font-normal cursor-pointer shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Excel tổng thanh toán</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Summary Cards with Distinct Thematic Colors */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {/* Card 1: Emerald Theme */}
          <div className="bg-linear-to-br from-emerald-50/70 to-white border border-emerald-200 rounded-lg p-3 shadow-xs">
            <div className="text-[11px] font-normal text-emerald-800">
              Tổng thực nhận toàn trường
            </div>
            <div className="text-lg font-normal text-emerald-700 font-mono mt-0.5">
              {grandTotals.thucNhan.toLocaleString('vi-VN')} đ
            </div>
            <div className="text-[10.5px] text-slate-500 mt-1 font-normal">
              Gộp thù lao: {grandTotals.tongThuLao.toLocaleString('vi-VN')} đ (Thuế 10%: {grandTotals.thueTNCN.toLocaleString('vi-VN')} đ)
            </div>
          </div>

          {/* Card 2: Blue Theme */}
          <div className="bg-linear-to-br from-blue-50/70 to-white border border-blue-200 rounded-lg p-3 shadow-xs">
            <div className="text-[11px] font-normal text-blue-800">
              Tổng số giảng viên
            </div>
            <div className="text-lg font-normal text-blue-700 font-mono mt-0.5">
              {lecturerSummaries.length} giảng viên
            </div>
            <div className="text-[10.5px] text-slate-500 mt-1 font-normal">
              Tổng tiết QC: <span className="font-normal text-blue-800">{grandTotals.tongQC.toFixed(1)}</span> tiết quy chuẩn
            </div>
          </div>

          {/* Card 3: Amber/Green Theme */}
          <div className="bg-linear-to-br from-amber-50/70 to-white border border-amber-200 rounded-lg p-3 shadow-xs">
            <div className="text-[11px] font-normal text-amber-800 flex items-center justify-between">
              <span>GV xác nhận số liệu</span>
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                {confirmedCount}/{lecturerSummaries.length}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-normal text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {confirmedCount} đã đồng ý
              </span>
              <span className="text-xs font-normal text-amber-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> {disputedCount} phản hồi
              </span>
            </div>
            <div className="text-[10.5px] text-slate-500 mt-0.5 font-normal">
              Còn {pendingCount} giảng viên chưa vào kiểm tra
            </div>
          </div>

          {/* Card 4: Purple Theme */}
          <div className="bg-linear-to-br from-purple-50/70 to-white border border-purple-200 rounded-lg p-3 shadow-xs">
            <div className="text-[11px] font-normal text-purple-800 flex items-center justify-between">
              <span>Tiến độ chi trả (Tài chính)</span>
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-300">
                {paidCount}/{lecturerSummaries.length}
              </span>
            </div>
            <div className="text-lg font-normal text-purple-700 font-mono mt-0.5">
              {paidCount > 0
                ? `${paidCount} người đã nhận`
                : 'Đang chuẩn bị lệnh chi'}
            </div>
            <div className="text-[10.5px] text-slate-500 mt-1 font-normal">
              Ưu tiên chi ngay cho {confirmedCount} GV đã đồng ý xác nhận
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2.5 mt-3 pt-3 border-t border-slate-100">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo Tên giảng viên, Mã GV, CCCD..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#005325] focus:outline-hidden bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={facultyFilter}
              onChange={(e) => setFacultyFilter(e.target.value)}
              className="border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-700 focus:outline-hidden"
            >
              <option value="all">Tất cả Khoa / Bộ môn</option>
              {faculties.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>

            <select
              value={confirmStatusFilter}
              onChange={(e) => setConfirmStatusFilter(e.target.value)}
              className="border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-700 focus:outline-hidden"
            >
              <option value="all">Tất cả Trạng thái GV</option>
              <option value="confirmed">Đã đồng ý xác nhận</option>
              <option value="pending">Chưa xác nhận</option>
              <option value="disputed">Đang có phản hồi / khiếu nại</option>
            </select>

            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-700 focus:outline-hidden"
            >
              <option value="all">Tất cả Trạng thái Chi trả</option>
              <option value="unpaid">Chờ chi trả</option>
              <option value="paid">Đã thanh toán (UNC)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 p-4 overflow-x-auto">
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-black font-normal text-left border-b border-slate-300">
                <th className="w-[42px] px-2 py-2.5 text-center border-r border-slate-200 text-black font-normal">STT</th>
                <th className="w-[85px] px-2.5 py-2.5 border-r border-slate-200 text-black font-normal">Mã GV</th>
                <th className="px-3 py-2.5 border-r border-slate-200 min-w-[170px] text-black font-normal">Họ và tên giảng viên</th>
                <th className="px-2.5 py-2.5 border-r border-slate-200 min-w-[130px] text-black font-normal">Khoa / Bộ môn</th>
                <th className="px-2 py-2.5 text-right border-r border-slate-200 w-[100px] text-black font-normal" title="Thanh toán giờ giảng (Phòng Đào tạo)">
                  1. Giờ giảng
                </th>
                <th className="px-2 py-2.5 text-right border-r border-slate-200 w-[100px] text-black font-normal" title="Coi thi, Chấm thi, Ra đề (TT Khảo thí)">
                  2. Khảo thí
                </th>
                <th className="px-2 py-2.5 text-right border-r border-slate-200 w-[95px] text-black font-normal" title="Công tác tuyển sinh (Phòng Tuyển sinh)">
                  3. Tuyển sinh
                </th>
                <th className="px-2 py-2.5 text-right border-r border-slate-200 w-[95px] text-black font-normal" title="Nghiên cứu khoa học (Phòng NCKH)">
                  4. NCKH
                </th>
                <th className="px-2 py-2.5 text-right border-r border-slate-200 w-[95px] text-black font-normal" title="Cố vấn học tập (CVHT)">
                  5. Cố vấn HT
                </th>
                <th className="px-2 py-2.5 text-right border-r border-slate-200 w-[95px] text-black font-normal" title="Công tác khác (HĐKH, Ban Thanh tra)">
                  6. Khác
                </th>
                <th className="px-2.5 py-2.5 text-right border-r border-slate-200 w-[105px] text-black font-normal">Tổng gộp (VNĐ)</th>
                <th className="px-2 py-2.5 text-right border-r border-slate-200 w-[90px] text-black font-normal">Thuế 10%</th>
                <th className="px-3 py-2.5 text-right border-r border-slate-200 w-[115px] text-black font-normal">
                  Thực nhận (VNĐ)
                </th>
                <th className="px-2.5 py-2.5 text-center border-r border-slate-200 w-[115px] text-black font-normal">GV xác nhận</th>
                <th className="px-2.5 py-2.5 text-center border-r border-slate-200 w-[110px] text-black font-normal">Tài chính</th>
                <th className="px-2 py-2.5 text-center w-[90px] text-black font-normal">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-black">
              {filteredSummaries.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-8 text-center text-black font-normal">
                    Không tìm thấy giảng viên nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredSummaries.map((item, idx) => (
                  <tr
                    key={item.maGV}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="px-2 py-2 text-center font-mono text-black border-r border-slate-100 font-normal">
                      {idx + 1}
                    </td>

                    {/* Mã GV */}
                    <td className="px-2.5 py-2 font-mono font-normal text-black border-r border-slate-100 whitespace-nowrap">
                      {item.maGV}
                    </td>

                    {/* Họ và tên */}
                    <td className="px-3 py-2 border-r border-slate-100 whitespace-nowrap">
                      <div className="font-normal text-black">
                        {item.hoTen}
                      </div>
                      <div className="text-[10px] text-black font-mono font-normal">
                        {item.hocHamHocVi} · {item.soTaiKhoan ? `${item.soTaiKhoan} (${item.nganHang})` : 'Chưa có STK'}
                      </div>
                    </td>

                    {/* Khoa */}
                    <td className="px-2.5 py-2 text-black border-r border-slate-100 whitespace-nowrap font-normal">
                      <span className="truncate block max-w-[130px]" title={item.khoaBoMon}>
                        {item.khoaBoMon}
                      </span>
                    </td>

                    {/* 1. Giờ giảng */}
                    <td
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedScheduleMaGV(item.maGV);
                      }}
                      className="px-2 py-1.5 text-right font-mono tabular-nums text-black border-r border-slate-100 whitespace-nowrap font-normal cursor-pointer hover:bg-emerald-50/80 transition-colors group"
                      title="Bấm để xem Bảng thống kê công tác giảng dạy chi tiết theo mẫu hình ảnh"
                    >
                      {item.daoTaoAmount > 0 ? (
                        <div>
                          <div className="flex items-center justify-end gap-1">
                            <span className="font-medium text-black group-hover:text-[#005325] group-hover:underline underline-offset-2">
                              {item.daoTaoAmount.toLocaleString('vi-VN')} đ
                            </span>
                            <FileSpreadsheet className="w-3 h-3 text-[#005325] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </div>
                          <span className="block text-[9.5px] font-sans text-black font-normal">
                            LT {item.tongGioLyThuyet}h · TH {item.tongGioThucHanh}h
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 group-hover:text-[#005325] font-normal group-hover:underline">
                          -
                        </span>
                      )}
                    </td>

                    {/* 2. Khảo thí */}
                    <td className="px-2 py-1.5 text-right font-mono tabular-nums text-black border-r border-slate-100 whitespace-nowrap font-normal">
                      {item.khaoThiAmount > 0 ? (
                        <div>
                          <span className="font-normal text-black">{item.khaoThiAmount.toLocaleString('vi-VN')} đ</span>
                          <span className="block text-[9.5px] font-sans text-black font-normal">
                            {item.tongGioKhaoThi}h theo CV
                          </span>
                        </div>
                      ) : (
                        <span className="text-black font-normal">-</span>
                      )}
                    </td>

                    {/* 3. Tuyển sinh */}
                    <td className="px-2 py-1.5 text-right font-mono tabular-nums text-black border-r border-slate-100 whitespace-nowrap font-normal">
                      {item.tuyenSinhAmount > 0 ? (
                        <div>
                          <span className="font-normal text-black">{item.tuyenSinhAmount.toLocaleString('vi-VN')} đ</span>
                          <span className="block text-[9.5px] font-sans text-black font-normal">{item.tuyenSinhQC} tiết</span>
                        </div>
                      ) : (
                        <span className="text-black font-normal">-</span>
                      )}
                    </td>

                    {/* 4. NCKH */}
                    <td
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedResearchScheduleMaGV(item.maGV);
                      }}
                      className="px-2 py-1.5 text-right font-mono tabular-nums text-black border-r border-slate-100 whitespace-nowrap font-normal cursor-pointer hover:bg-purple-50/80 transition-colors group"
                      title="Bấm để xem Bảng thống kê Nghiên cứu Khoa học (NCKH) chi tiết theo mẫu hình ảnh"
                    >
                      {item.nckhAmount > 0 ? (
                        <div>
                          <div className="flex items-center justify-end gap-1">
                            <span className="font-medium text-black group-hover:text-purple-700 group-hover:underline underline-offset-2">
                              {item.nckhAmount.toLocaleString('vi-VN')} đ
                            </span>
                            <FileSpreadsheet className="w-3 h-3 text-purple-700 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </div>
                          <span className="block text-[9.5px] font-sans font-normal text-black">
                            {item.tongGioNCKH}h · {item.mucDoHoanThanhNCKH === 'hoan_thanh' ? 'Đạt định mức' : 'Chưa đạt'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 group-hover:text-purple-700 font-normal group-hover:underline">
                          -
                        </span>
                      )}
                    </td>

                    {/* 5. Cố vấn học tập */}
                    <td className="px-2 py-1.5 text-right font-mono tabular-nums text-black border-r border-slate-100 whitespace-nowrap font-normal">
                      {item.coVanHocTapAmount > 0 ? (
                        <div>
                          <span className="font-normal text-black">{item.coVanHocTapAmount.toLocaleString('vi-VN')} đ</span>
                          <span className="block text-[9.5px] font-sans font-normal text-black">{item.coVanHocTapQC} tiết</span>
                        </div>
                      ) : (
                        <span className="text-black font-normal">-</span>
                      )}
                    </td>

                    {/* 6. Khác */}
                    <td className="px-2 py-2 text-right font-mono tabular-nums text-black border-r border-slate-100 whitespace-nowrap font-normal">
                      {item.congTacKhacAmount > 0 ? (
                        <span className="font-normal text-black">{item.congTacKhacAmount.toLocaleString('vi-VN')} đ</span>
                      ) : (
                        <span className="text-black font-normal">-</span>
                      )}
                    </td>

                    {/* Tổng gộp */}
                    <td className="px-2.5 py-2 text-right font-mono font-normal text-black border-r border-slate-100 whitespace-nowrap">
                      {item.tongThuLao.toLocaleString('vi-VN')} đ
                    </td>

                    {/* Thuế TNCN */}
                    <td className="px-2 py-2 text-right font-mono text-black border-r border-slate-100 whitespace-nowrap font-normal">
                      -{item.thueTNCN.toLocaleString('vi-VN')} đ
                    </td>

                    {/* Thực nhận */}
                    <td className="px-3 py-2 text-right font-mono font-normal text-black bg-slate-50 border-r border-slate-100 whitespace-nowrap">
                      {item.thucNhan.toLocaleString('vi-VN')} đ
                    </td>

                    {/* Trạng thái xác nhận của GV */}
                    <td className="px-2.5 py-2 text-center border-r border-slate-100 whitespace-nowrap font-normal">
                      {item.confirmationStatus === 'confirmed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-normal bg-emerald-50 text-emerald-800 border border-emerald-200" title={`Đã xác nhận lúc ${item.confirmationDate}`}>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Đã đồng ý
                        </span>
                      ) : item.confirmationStatus === 'disputed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-normal bg-amber-50 text-amber-800 border border-amber-300" title="Đang có ý kiến phản hồi về số tiết/thù lao">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Đang phản hồi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-normal bg-slate-50 text-slate-700 border border-slate-200">
                          <Clock className="w-3 h-3 text-slate-500" />
                          Chờ GV xem
                        </span>
                      )}
                    </td>

                    {/* Trạng thái Tài chính */}
                    <td className="px-2.5 py-2 text-center border-r border-slate-100 whitespace-nowrap font-normal">
                      {item.paymentStatus === 'paid' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-normal bg-blue-50 text-blue-800 border border-blue-200" title={`Đã chuyển khoản: ${item.transactionRef}`}>
                          <CreditCard className="w-3 h-3 text-blue-600" />
                          Đã thanh toán
                        </span>
                      ) : item.confirmationStatus === 'confirmed' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onNavigateToFinance) onNavigateToFinance(item.maGV);
                          }}
                          className="px-2 py-0.5 rounded text-[11px] font-normal bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-pointer transition-colors shadow-2xs"
                        >
                          Sẵn sàng chi
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-normal">
                          Chờ GV duyệt
                        </span>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td className="px-2 py-2 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedScheduleMaGV(item.maGV);
                          }}
                          title="Xem Bảng thống kê công tác giảng dạy (mẫu chuẩn)"
                          className="p-1 text-[#005325] hover:bg-emerald-50 rounded cursor-pointer transition-colors"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-[#005325]" />
                        </button>

                        <button
                          onClick={() => {
                            if (onNavigateToLecturerCheck) {
                              onNavigateToLecturerCheck(item.maGV);
                            } else {
                              setSelectedLecturerModal(item);
                            }
                          }}
                          title="Xem Cổng Giảng viên tra cứu & Xác nhận"
                          className="p-1 text-black hover:bg-slate-100 rounded cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-black" />
                        </button>

                        <button
                          onClick={() => {
                            if (onNavigateToFinance) onNavigateToFinance(item.maGV);
                          }}
                          title="Chuyển sang tab Chi trả Tài chính"
                          className="p-1 text-black hover:bg-slate-100 rounded cursor-pointer transition-colors"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-black" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Table Footer with exact sums */}
            <tfoot>
              <tr className="bg-slate-100 font-normal text-black border-t-2 border-slate-300">
                <td colSpan={4} className="px-3 py-2 text-center font-normal text-[11px] text-black">
                  Tổng cộng ({filteredSummaries.length} giảng viên)
                </td>
                <td className="px-2 py-2 text-right font-mono tabular-nums text-black font-normal">
                  {grandTotals.daoTaoAmount.toLocaleString('vi-VN')} đ
                </td>
                <td className="px-2 py-2 text-right font-mono tabular-nums text-black font-normal">
                  {grandTotals.khaoThiAmount.toLocaleString('vi-VN')} đ
                </td>
                <td className="px-2 py-2 text-right font-mono tabular-nums text-black font-normal">
                  {grandTotals.tuyenSinhAmount.toLocaleString('vi-VN')} đ
                </td>
                <td className="px-2 py-2 text-right font-mono tabular-nums text-black font-normal">
                  {grandTotals.nckhAmount.toLocaleString('vi-VN')} đ
                </td>
                <td className="px-2 py-2 text-right font-mono tabular-nums text-black font-normal">
                  {grandTotals.congTacKhacAmount.toLocaleString('vi-VN')} đ
                </td>
                <td className="px-2.5 py-2 text-right font-mono tabular-nums text-black font-normal">
                  {grandTotals.tongThuLao.toLocaleString('vi-VN')} đ
                </td>
                <td className="px-2 py-2 text-right font-mono tabular-nums text-black font-normal">
                  -{grandTotals.thueTNCN.toLocaleString('vi-VN')} đ
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums text-black text-sm bg-slate-200/60 font-normal">
                  {grandTotals.thucNhan.toLocaleString('vi-VN')} đ
                </td>
                <td colSpan={3} className="px-2 py-2 text-center text-xs text-black font-normal">
                  Chốt theo quy chế TDU
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Teaching Schedule Modal (Exact sheet view) */}
      <TeachingScheduleModal
        isOpen={!!selectedScheduleMaGV}
        onClose={() => setSelectedScheduleMaGV(null)}
        maGV={selectedScheduleMaGV || ''}
        records={records}
        allLecturers={lecturerSummaries.map((l) => ({
          maGV: l.maGV,
          hoTen: l.hoTen,
          khoaBoMon: l.khoaBoMon,
          hocHamHocVi: l.hocHamHocVi,
        }))}
        onSelectLecturer={(newMa) => setSelectedScheduleMaGV(newMa)}
      />

      {/* Research Schedule Modal (Exact sheet view) */}
      <ResearchScheduleModal
        isOpen={!!selectedResearchScheduleMaGV}
        onClose={() => setSelectedResearchScheduleMaGV(null)}
        maGV={selectedResearchScheduleMaGV || ''}
        records={records}
        allLecturers={lecturerSummaries.map((l) => ({
          maGV: l.maGV,
          hoTen: l.hoTen,
          khoaBoMon: l.khoaBoMon,
          hocHamHocVi: l.hocHamHocVi,
        }))}
        onSelectLecturer={(newMa) => setSelectedResearchScheduleMaGV(newMa)}
      />
    </div>
  );
};
