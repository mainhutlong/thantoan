import React, { useState, useMemo } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { TeachingRecord, LecturerPaymentSummary } from '../types';
import { TeachingScheduleReport } from './TeachingScheduleReport';
import { ResearchScheduleReport } from './ResearchScheduleReport';
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
  const [selectedLecturerInline, setSelectedLecturerInline] = useState<LecturerPaymentSummary | null>(null);
  const [selectedScheduleMaGV, setSelectedScheduleMaGV] = useState<string | null>(null);
  const [selectedResearchScheduleMaGV, setSelectedResearchScheduleMaGV] = useState<string | null>(null);

  // Group and sum up the 6 declaration modules for each lecturer
  const lecturerSummaries: LecturerPaymentSummary[] = useMemo(() => {
    const map = new Map<string, LecturerPaymentSummary>();

    records.forEach((rec) => {
      if (!map.has(rec.maGV)) {
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
          doAnAmount: 0,
          doAnQC: 0,
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

      if (rec.phongBanQuanLy === 'dao_tao') {
        item.daoTaoAmount += rec.tongTienThuLao;
        item.daoTaoQC += rec.tongTietQC;
        item.tongGioGiangDay += rec.soGioQuyChuan || rec.tongTietQC || 0;
        if (rec.phanLoaiGiangDay === 'thuc_hanh_thuc_tap') {
          item.tongGioThucHanh += rec.soGioQuyChuan || rec.tongTietQC || 0;
        } else {
          item.tongGioLyThuyet += rec.soGioQuyChuan || rec.tongTietQC || 0;
        }
      } else if (rec.phongBanQuanLy === 'khao_thi') {
        item.khaoThiAmount += rec.tongTienThuLao;
        item.khaoThiQC += rec.tongTietQC;
        item.tongGioKhaoThi += rec.tongSoGioTheoCV || rec.tongTietQC || 0;
      } else if (rec.phongBanQuanLy === 'do_an') {
        item.doAnAmount += rec.tongTienThuLao;
        item.doAnQC += rec.tongTietQC;
      } else if (rec.phongBanQuanLy === 'tuyen_sinh') {
        item.tuyenSinhAmount += rec.tongTienThuLao;
        item.tuyenSinhQC += rec.tongTietQC;
      } else if (rec.phongBanQuanLy === 'nckh') {
        item.nckhAmount += rec.tongTienThuLao;
        item.nckhQC += rec.tongTietQC;
        item.tongGioNCKH += rec.soGioQCNCKH || rec.tongTietQC || 0;
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

  const faculties = useMemo(() => {
    const set = new Set<string>();
    lecturerSummaries.forEach((l) => set.add(l.khoaBoMon));
    return Array.from(set);
  }, [lecturerSummaries]);

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

  const grandTotals = useMemo(() => {
    return filteredSummaries.reduce(
      (acc, curr) => ({
        tongQC: acc.tongQC + curr.tongQC,
        daoTaoAmount: acc.daoTaoAmount + curr.daoTaoAmount,
        khaoThiAmount: acc.khaoThiAmount + curr.khaoThiAmount,
        doAnAmount: acc.doAnAmount + curr.doAnAmount,
        tuyenSinhAmount: acc.tuyenSinhAmount + curr.tuyenSinhAmount,
        nckhAmount: acc.nckhAmount + curr.nckhAmount,
        coVanHocTapAmount: acc.coVanHocTapAmount + curr.coVanHocTapAmount,
        congTacKhacAmount: acc.congTacKhacAmount + curr.congTacKhacAmount,
        tongThuLao: acc.tongThuLao + curr.tongThuLao,
        thueTNCN: acc.thueTNCN + curr.thueTNCN,
        thucNhan: acc.thucNhan + curr.thucNhan,
      }),
      {
        tongQC: 0,
        daoTaoAmount: 0,
        khaoThiAmount: 0,
        doAnAmount: 0,
        tuyenSinhAmount: 0,
        nckhAmount: 0,
        coVanHocTapAmount: 0,
        congTacKhacAmount: 0,
        tongThuLao: 0,
        thueTNCN: 0,
        thucNhan: 0,
      }
    );
  }, [filteredSummaries]);

  const confirmedCount = lecturerSummaries.filter((l) => l.confirmationStatus === 'confirmed').length;
  const disputedCount = lecturerSummaries.filter((l) => l.confirmationStatus === 'disputed').length;
  const pendingCount = lecturerSummaries.filter((l) => l.confirmationStatus === 'pending').length;
  const paidCount = lecturerSummaries.filter((l) => l.paymentStatus === 'paid').length;

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
      '2. NCKH (VNĐ)': item.nckhAmount,
      '3. Coi/chấm thi (VNĐ)': item.khaoThiAmount,
      '4. Đồ án/KLTN (VNĐ)': item.doAnAmount,
      '5. Cố vấn HT (VNĐ)': item.coVanHocTapAmount,
      '6. Tuyển sinh (VNĐ)': item.tuyenSinhAmount,
      '7. Kiêm nhiệm & ĐBCL (VNĐ)': item.congTacKhacAmount,
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
    XLSX.utils.book_append_sheet(wb, ws, 'Tong_Thanh_Toan_6_Muc');
    XLSX.writeFile(wb, `Tong_Hop_Thanh_Toan_TDU_HK2_2024.xlsx`);
  };

  const quickTabs = [
    { id: 'all', label: 'Tất cả', count: lecturerSummaries.length, activeClass: 'bg-slate-800 text-white border-slate-800' },
    { id: 'confirmed', label: 'Đã đồng ý', count: confirmedCount, activeClass: 'bg-[#005325] text-white border-[#005325]' },
    { id: 'disputed', label: 'Đang phản hồi', count: disputedCount, activeClass: 'bg-amber-600 text-white border-amber-600' },
    { id: 'pending', label: 'Chờ GV xem', count: pendingCount, activeClass: 'bg-slate-600 text-white border-slate-600' },
  ];

  return (
    <div className="flex-1 bg-[#f8fafc] flex flex-col min-h-0 overflow-y-auto min-w-0">
      {selectedResearchScheduleMaGV ? (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
          <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shrink-0">
            <button
              onClick={() => setSelectedResearchScheduleMaGV(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[12px] font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại bảng tổng thanh toán</span>
            </button>
            <span className="text-[12.5px] font-semibold text-[#005325]">
              Chi tiết bảng kê Nghiên cứu Khoa học — Mã GV: {selectedResearchScheduleMaGV}
            </span>
          </div>
          <div className="flex-1 overflow-auto p-2">
            <ResearchScheduleReport
              maGV={selectedResearchScheduleMaGV}
              records={records}
              onClose={() => setSelectedResearchScheduleMaGV(null)}
              allLecturers={lecturerSummaries.map((l) => ({
                maGV: l.maGV,
                hoTen: l.hoTen,
                khoaBoMon: l.khoaBoMon,
                hocHamHocVi: l.hocHamHocVi,
              }))}
              onSelectLecturer={(newMa) => setSelectedResearchScheduleMaGV(newMa)}
            />
          </div>
        </div>
      ) : selectedScheduleMaGV ? (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
          <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shrink-0">
            <button
              onClick={() => setSelectedScheduleMaGV(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[12px] font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại bảng tổng thanh toán</span>
            </button>
            <span className="text-[12.5px] font-semibold text-[#005325]">
              Chi tiết bảng kê Giờ giảng dạy — Mã GV: {selectedScheduleMaGV}
            </span>
          </div>
          <div className="flex-1 overflow-auto p-2">
            <TeachingScheduleReport
              maGV={selectedScheduleMaGV}
              records={records}
              onClose={() => setSelectedScheduleMaGV(null)}
              allLecturers={lecturerSummaries.map((l) => ({
                maGV: l.maGV,
                hoTen: l.hoTen,
                khoaBoMon: l.khoaBoMon,
                hocHamHocVi: l.hocHamHocVi,
              }))}
              onSelectLecturer={(newMa) => setSelectedScheduleMaGV(newMa)}
            />
          </div>
        </div>
      ) : (
        <>
          {/* 1. Compact Summary Strip + Filter Toolbar */}
          <div className="bg-white border-b border-slate-200 px-4 py-2.5 space-y-2">
            {/* Row 1: Summary Metrics Strip + Export Button */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-[12px]">
                <span className="font-semibold text-slate-800">Tổng hợp thanh toán toàn trường</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600">
                  Thực nhận: <strong className="font-mono font-semibold text-[#005325]">{grandTotals.thucNhan.toLocaleString('vi-VN')} đ</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600">
                  Tổng gộp: <strong className="font-mono font-medium text-slate-800">{grandTotals.tongThuLao.toLocaleString('vi-VN')} đ</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600">
                  Thuế 10%: <strong className="font-mono font-normal text-rose-600">-{grandTotals.thueTNCN.toLocaleString('vi-VN')} đ</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600">
                  Quy chuẩn: <strong className="font-mono font-medium text-slate-800">{grandTotals.tongQC.toFixed(1)} tiết</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600">
                  Đã chi: <strong className="font-mono font-medium text-blue-600">{paidCount}/{lecturerSummaries.length} GV</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={handleExportExcel}
                className="h-[29px] px-3 bg-[#005325] hover:bg-[#00421d] text-white rounded-lg text-[11.5px] font-medium cursor-pointer shadow-2xs transition-colors shrink-0"
              >
                Xuất Excel tổng hợp
              </button>
            </div>

            {/* Row 2: Quick Status Pills + Dropdowns + Search */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center flex-wrap gap-1.5">
                {quickTabs.map((tab) => {
                  const isActive = confirmStatusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setConfirmStatusFilter(tab.id)}
                      className={`h-[29px] px-2.5 rounded-lg border text-[11.5px] transition-all cursor-pointer flex items-center gap-1 ${
                        isActive
                          ? `${tab.activeClass} font-medium shadow-2xs`
                          : 'bg-slate-50/80 text-slate-600 border-slate-200 hover:bg-slate-100 font-normal'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[10.5px] font-mono ${isActive ? 'text-white/90' : 'text-slate-400'}`}>
                        ({tab.count})
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center flex-wrap gap-2 flex-1 sm:flex-initial justify-end">
                <select
                  value={facultyFilter}
                  onChange={(e) => setFacultyFilter(e.target.value)}
                  className="h-[29px] border border-slate-200 rounded-lg px-2 text-[11.5px] bg-slate-50/60 text-slate-700 focus:bg-white focus:outline-none focus:border-[#005325]"
                >
                  <option value="all">Tất cả Khoa / Bộ môn</option>
                  {faculties.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>

                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="h-[29px] border border-slate-200 rounded-lg px-2 text-[11.5px] bg-slate-50/60 text-slate-700 focus:bg-white focus:outline-none focus:border-[#005325]"
                >
                  <option value="all">Tất cả chi trả</option>
                  <option value="unpaid">Chờ chi trả</option>
                  <option value="paid">Đã thanh toán (UNC)</option>
                </select>

                <div className="relative w-full sm:w-[230px]">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm tên GV, mã GV, CCCD..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-[29px] pl-8 pr-3 border border-slate-200 rounded-lg text-[11.5px] bg-slate-50/60 focus:bg-white focus:border-[#005325] focus:outline-none text-slate-700"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Inline Detail Panel (Hiển thị trực tiếp khi bấm vào dòng giảng viên) */}
          {selectedLecturerInline && (
            <div className="px-4 pt-3 pb-1">
              <div className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-[#005325] shadow-xs px-4 py-3 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[12px]">
                    <span className="font-semibold text-slate-800">
                      Chi tiết thù lao: {selectedLecturerInline.hoTen} ({selectedLecturerInline.maGV})
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-600">{selectedLecturerInline.khoaBoMon}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-600 font-mono text-[11.5px]">
                      STK: {selectedLecturerInline.soTaiKhoan || 'Chưa cập nhật'} ({selectedLecturerInline.nganHang || 'Vietcombank'})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedScheduleMaGV(selectedLecturerInline.maGV)}
                      className="h-[26px] px-2.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-normal cursor-pointer transition-colors"
                    >
                      Bảng kê giờ giảng
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedResearchScheduleMaGV(selectedLecturerInline.maGV)}
                      className="h-[26px] px-2.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-normal cursor-pointer transition-colors"
                    >
                      Bảng kê NCKH
                    </button>
                    {onNavigateToLecturerCheck && (
                      <button
                        type="button"
                        onClick={() => onNavigateToLecturerCheck(selectedLecturerInline.maGV)}
                        className="h-[26px] px-2.5 rounded-md border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-normal cursor-pointer transition-colors"
                      >
                        Mở trang GV tra cứu
                      </button>
                    )}
                    {onNavigateToFinance && (
                      <button
                        type="button"
                        onClick={() => onNavigateToFinance(selectedLecturerInline.maGV)}
                        className="h-[26px] px-2.5 rounded-md bg-[#005325] hover:bg-[#00421e] text-white text-[11px] font-normal cursor-pointer transition-colors"
                      >
                        Chuyển sang Chi trả
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedLecturerInline(null)}
                      className="h-[26px] px-2 text-slate-400 hover:text-slate-700 text-[11px] cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2 text-[11.5px]">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-slate-400 text-[10.5px]">1. Giờ giảng</div>
                    <div className="font-mono text-slate-800 mt-0.5">{selectedLecturerInline.daoTaoAmount.toLocaleString('vi-VN')} đ</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-slate-400 text-[10.5px]">2. NCKH</div>
                    <div className="font-mono text-slate-800 mt-0.5">{selectedLecturerInline.nckhAmount.toLocaleString('vi-VN')} đ</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-slate-400 text-[10.5px]">3. Khảo thí</div>
                    <div className="font-mono text-slate-800 mt-0.5">{selectedLecturerInline.khaoThiAmount.toLocaleString('vi-VN')} đ</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-slate-400 text-[10.5px]">4. Đồ án / KLTN</div>
                    <div className="font-mono text-slate-800 mt-0.5">{selectedLecturerInline.doAnAmount.toLocaleString('vi-VN')} đ</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-slate-400 text-[10.5px]">5. Cố vấn HT</div>
                    <div className="font-mono text-slate-800 mt-0.5">{selectedLecturerInline.coVanHocTapAmount.toLocaleString('vi-VN')} đ</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-slate-400 text-[10.5px]">6. Tuyển sinh</div>
                    <div className="font-mono text-slate-800 mt-0.5">{selectedLecturerInline.tuyenSinhAmount.toLocaleString('vi-VN')} đ</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-slate-400 text-[10.5px]">7. Kiêm nhiệm/ĐBCL</div>
                    <div className="font-mono text-slate-800 mt-0.5">{selectedLecturerInline.congTacKhacAmount.toLocaleString('vi-VN')} đ</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-slate-400 text-[10.5px]">Thuế TNCN 10%</div>
                    <div className="font-mono text-rose-600 mt-0.5">-{selectedLecturerInline.thueTNCN.toLocaleString('vi-VN')} đ</div>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200">
                    <div className="text-emerald-700 text-[10.5px] font-medium">Thực nhận</div>
                    <div className="font-mono font-semibold text-[#005325] mt-0.5">{selectedLecturerInline.thucNhan.toLocaleString('vi-VN')} đ</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Main Table */}
          <div className="flex-1 p-2 sm:p-3.5 overflow-x-auto min-w-0">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <table className="w-full min-w-[1150px] text-[12px] border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] text-[#1e293b] font-semibold text-left border-b border-slate-200 h-[36px]">
                    <th className="w-[40px] px-2 text-center border-r border-slate-200">STT</th>
                    <th className="w-[82px] px-2.5 border-r border-slate-200">Mã GV</th>
                    <th className="px-3 border-r border-slate-200 min-w-[165px]">Họ và tên giảng viên</th>
                    <th className="px-2.5 border-r border-slate-200 min-w-[125px]">Khoa / Bộ môn</th>
                    <th className="px-2 text-right border-r border-slate-200 w-[96px]" title="Thanh toán giờ giảng">
                      1. Giờ giảng
                    </th>
                    <th className="px-2 text-right border-r border-slate-200 w-[92px]" title="Nghiên cứu khoa học">
                      2. NCKH
                    </th>
                    <th className="px-2 text-right border-r border-slate-200 w-[92px]" title="Coi thi, Chấm thi, Ra đề">
                      3. Khảo thí
                    </th>
                    <th className="px-2 text-right border-r border-slate-200 w-[95px]" title="Đồ án & Khóa luận tốt nghiệp">
                      4. Đồ án/KLTN
                    </th>
                    <th className="px-2 text-right border-r border-slate-200 w-[90px]" title="Cố vấn học tập">
                      5. Cố vấn HT
                    </th>
                    <th className="px-2 text-right border-r border-slate-200 w-[90px]" title="Công tác tuyển sinh">
                      6. Tuyển sinh
                    </th>
                    <th className="px-2 text-right border-r border-slate-200 w-[92px]" title="Công tác kiêm nhiệm & ĐBCL">
                      7. Kiêm nhiệm
                    </th>
                    <th className="px-2.5 text-right border-r border-slate-200 w-[105px]">Tổng gộp</th>
                    <th className="px-2 text-right border-r border-slate-200 w-[88px]">Thuế 10%</th>
                    <th className="px-2.5 text-right border-r border-slate-200 w-[110px]">Thực nhận</th>
                    <th className="px-2 text-center border-r border-slate-200 w-[98px]">GV xác nhận</th>
                    <th className="px-2 text-center border-r border-slate-200 w-[95px]">Tài chính</th>
                    <th className="px-2 text-center w-[85px]">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 text-[#475569] font-normal">
                  {filteredSummaries.length === 0 ? (
                    <tr>
                      <td colSpan={17} className="py-10 text-center text-slate-400 font-normal">
                        Không tìm thấy giảng viên nào phù hợp với điều kiện lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredSummaries.map((item, idx) => {
                      const isSelected = selectedLecturerInline?.maGV === item.maGV;
                      return (
                        <tr
                          key={item.maGV}
                          onClick={() =>
                            setSelectedLecturerInline(isSelected ? null : item)
                          }
                          className={`h-[38px] transition-colors cursor-pointer font-normal ${
                            isSelected ? 'bg-emerald-50/50' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="px-2 text-center font-mono text-slate-400 border-r border-slate-100">
                            {idx + 1}
                          </td>

                          <td className="px-2.5 font-mono text-slate-600 border-r border-slate-100 whitespace-nowrap">
                            {item.maGV}
                          </td>

                          <td className="px-3 border-r border-slate-100 whitespace-nowrap">
                            <div className="text-slate-700 font-normal">{item.hoTen}</div>
                            <div className="text-[10.5px] text-slate-400 font-mono">
                              {item.hocHamHocVi} · {item.soTaiKhoan ? `${item.soTaiKhoan}` : 'Chưa có STK'}
                            </div>
                          </td>

                          <td className="px-2.5 text-slate-600 border-r border-slate-100 whitespace-nowrap">
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
                            className="px-2 text-right font-mono tabular-nums text-slate-600 border-r border-slate-100 whitespace-nowrap hover:text-[#005325] hover:underline"
                            title="Bấm để xem Bảng thống kê giờ giảng"
                          >
                            {item.daoTaoAmount > 0 ? `${item.daoTaoAmount.toLocaleString('vi-VN')}` : '-'}
                          </td>

                          {/* 2. NCKH */}
                          <td
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedResearchScheduleMaGV(item.maGV);
                            }}
                            className="px-2 text-right font-mono tabular-nums text-slate-600 border-r border-slate-100 whitespace-nowrap hover:text-purple-700 hover:underline"
                            title="Bấm để xem Bảng thống kê NCKH"
                          >
                            {item.nckhAmount > 0 ? `${item.nckhAmount.toLocaleString('vi-VN')}` : '-'}
                          </td>

                          {/* 3. Khảo thí */}
                          <td className="px-2 text-right font-mono tabular-nums text-slate-600 border-r border-slate-100 whitespace-nowrap">
                            {item.khaoThiAmount > 0 ? `${item.khaoThiAmount.toLocaleString('vi-VN')}` : '-'}
                          </td>

                          {/* 4. Đồ án / Khóa luận tốt nghiệp */}
                          <td className="px-2 text-right font-mono tabular-nums text-slate-600 border-r border-slate-100 whitespace-nowrap">
                            {item.doAnAmount > 0 ? `${item.doAnAmount.toLocaleString('vi-VN')}` : '-'}
                          </td>

                          {/* 5. Cố vấn học tập */}
                          <td className="px-2 text-right font-mono tabular-nums text-slate-600 border-r border-slate-100 whitespace-nowrap">
                            {item.coVanHocTapAmount > 0 ? `${item.coVanHocTapAmount.toLocaleString('vi-VN')}` : '-'}
                          </td>

                          {/* 6. Tuyển sinh */}
                          <td className="px-2 text-right font-mono tabular-nums text-slate-600 border-r border-slate-100 whitespace-nowrap">
                            {item.tuyenSinhAmount > 0 ? `${item.tuyenSinhAmount.toLocaleString('vi-VN')}` : '-'}
                          </td>

                          {/* 7. Khác (Kiêm nhiệm & ĐBCL) */}
                          <td className="px-2 text-right font-mono tabular-nums text-slate-600 border-r border-slate-100 whitespace-nowrap">
                            {item.congTacKhacAmount > 0 ? `${item.congTacKhacAmount.toLocaleString('vi-VN')}` : '-'}
                          </td>

                          {/* Tổng gộp */}
                          <td className="px-2.5 text-right font-mono tabular-nums text-slate-700 border-r border-slate-100 whitespace-nowrap">
                            {item.tongThuLao.toLocaleString('vi-VN')}
                          </td>

                          {/* Thuế TNCN */}
                          <td className="px-2 text-right font-mono tabular-nums text-slate-500 border-r border-slate-100 whitespace-nowrap">
                            -{item.thueTNCN.toLocaleString('vi-VN')}
                          </td>

                          {/* Thực nhận */}
                          <td className="px-2.5 text-right font-mono tabular-nums text-[#005325] border-r border-slate-100 whitespace-nowrap">
                            {item.thucNhan.toLocaleString('vi-VN')}
                          </td>

                          {/* Trạng thái xác nhận của GV */}
                          <td className="px-2 text-center border-r border-slate-100 whitespace-nowrap text-[11.5px]">
                            {item.confirmationStatus === 'confirmed' ? (
                              <span className="text-[#005325]" title={`Đã xác nhận lúc ${item.confirmationDate}`}>
                                Đã đồng ý
                              </span>
                            ) : item.confirmationStatus === 'disputed' ? (
                              <span className="text-amber-600" title="Đang có phản hồi">
                                Đang phản hồi
                              </span>
                            ) : (
                              <span className="text-slate-400">Chờ GV xem</span>
                            )}
                          </td>

                          {/* Trạng thái Tài chính */}
                          <td className="px-2 text-center border-r border-slate-100 whitespace-nowrap text-[11.5px]">
                            {item.paymentStatus === 'paid' ? (
                              <span className="text-blue-600" title={`Mã UNC: ${item.transactionRef}`}>
                                Đã thanh toán
                              </span>
                            ) : item.confirmationStatus === 'confirmed' ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onNavigateToFinance) onNavigateToFinance(item.maGV);
                                }}
                                className="text-[#005325] hover:underline cursor-pointer"
                              >
                                Sẵn sàng chi
                              </button>
                            ) : (
                              <span className="text-slate-400">Chờ duyệt</span>
                            )}
                          </td>

                          {/* Thao tác */}
                          <td
                            className="px-2 text-center whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedLecturerInline(isSelected ? null : item)
                                }
                                className={`px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-slate-200 text-slate-700'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                {isSelected ? 'Thu gọn' : 'Chi tiết'}
                              </button>
                              {onNavigateToLecturerCheck && (
                                <button
                                  type="button"
                                  onClick={() => onNavigateToLecturerCheck(item.maGV)}
                                  className="px-2 py-0.5 rounded text-[11px] bg-emerald-50 hover:bg-[#005325] text-[#005325] hover:text-white cursor-pointer transition-colors"
                                >
                                  Tra cứu
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-[#f8fafc] font-semibold text-[#1e293b] border-t border-slate-200 h-[36px]">
                    <td colSpan={4} className="px-3 text-center text-[11.5px]">
                      Tổng cộng ({filteredSummaries.length} giảng viên)
                    </td>
                    <td className="px-2 text-right font-mono tabular-nums">
                      {grandTotals.daoTaoAmount.toLocaleString('vi-VN')}
                    </td>
                    <td className="px-2 text-right font-mono tabular-nums">
                      {grandTotals.nckhAmount.toLocaleString('vi-VN')}
                    </td>
                    <td className="px-2 text-right font-mono tabular-nums">
                      {grandTotals.khaoThiAmount.toLocaleString('vi-VN')}
                    </td>
                    <td className="px-2 text-right font-mono tabular-nums">
                      {grandTotals.doAnAmount.toLocaleString('vi-VN')}
                    </td>
                    <td className="px-2 text-right font-mono tabular-nums">
                      {grandTotals.coVanHocTapAmount.toLocaleString('vi-VN')}
                    </td>
                    <td className="px-2 text-right font-mono tabular-nums">
                      {grandTotals.tuyenSinhAmount.toLocaleString('vi-VN')}
                    </td>
                    <td className="px-2 text-right font-mono tabular-nums">
                      {grandTotals.congTacKhacAmount.toLocaleString('vi-VN')}
                    </td>
                    <td className="px-2.5 text-right font-mono tabular-nums">
                      {grandTotals.tongThuLao.toLocaleString('vi-VN')}
                    </td>
                    <td className="px-2 text-right font-mono tabular-nums text-rose-600">
                      -{grandTotals.thueTNCN.toLocaleString('vi-VN')}
                    </td>
                    <td className="px-2.5 text-right font-mono tabular-nums text-[#005325]">
                      {grandTotals.thucNhan.toLocaleString('vi-VN')}
                    </td>
                    <td colSpan={3} className="px-2 text-center text-[11px] font-normal text-slate-500">
                      Đơn vị tính: VNĐ
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
