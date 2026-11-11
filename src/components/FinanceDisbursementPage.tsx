import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Download,
  Filter,
  Search,
  Printer,
  Building,
  Check,
  FileSpreadsheet,
  Calendar,
  Send,
  Eye,
  ArrowRight
} from 'lucide-react';
import { TeachingRecord, LecturerPaymentSummary } from '../types';
import * as XLSX from 'xlsx';

interface FinanceDisbursementPageProps {
  records: TeachingRecord[];
  onNavigateToLecturerCheck?: (maGV: string) => void;
  onNavigateToTotalPayment?: () => void;
}

export const FinanceDisbursementPage: React.FC<FinanceDisbursementPageProps> = ({
  records,
  onNavigateToLecturerCheck,
  onNavigateToTotalPayment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ready' | 'paid' | 'pending' | 'all'>('ready');
  const [selectedMags, setSelectedMags] = useState<string[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Dynamic payment tracking state
  const [paymentRecords, setPaymentRecords] = useState<
    Record<string, { isPaid: boolean; paidAt?: string; transactionRef?: string }>
  >({
    'TDU00312': {
      isPaid: true,
      paidAt: '18/10/2024 10:20',
      transactionRef: 'UNC-TDU-2024-88412',
    },
  });

  // Calculate aggregated summaries for all lecturers from records
  const lecturerList: LecturerPaymentSummary[] = useMemo(() => {
    const map = new Map<string, LecturerPaymentSummary>();

    records.forEach((rec) => {
      if (!map.has(rec.maGV)) {
        // Confirmation status
        let confStatus: 'pending' | 'confirmed' | 'disputed' = 'pending';
        let confDate: string | undefined = undefined;

        if (rec.maGV === 'TDU00128') {
          confStatus = 'confirmed';
          confDate = '17/10/2024 14:32';
        } else if (rec.maGV === 'TDU00245') {
          confStatus = 'disputed';
          confDate = '16/10/2024 09:15';
        } else if (rec.maGV === 'TDU00312') {
          confStatus = 'confirmed';
          confDate = '15/10/2024 16:40';
        }

        const isPaidInfo = paymentRecords[rec.maGV];

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
          paymentStatus: isPaidInfo?.isPaid ? 'paid' : 'unpaid',
          paymentDate: isPaidInfo?.paidAt,
          transactionRef: isPaidInfo?.transactionRef,
        });
      }

      const item = map.get(rec.maGV)!;

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
  }, [records, paymentRecords]);

  // Filtered list
  const filteredList = useMemo(() => {
    return lecturerList.filter((item) => {
      // Search
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          item.hoTen.toLowerCase().includes(q) ||
          item.maGV.toLowerCase().includes(q) ||
          (item.soTaiKhoan && item.soTaiKhoan.includes(q));
        if (!match) return false;
      }

      // Status
      if (statusFilter === 'ready') {
        // Confirmed and not yet paid
        return item.confirmationStatus === 'confirmed' && item.paymentStatus === 'unpaid';
      }
      if (statusFilter === 'paid') {
        return item.paymentStatus === 'paid';
      }
      if (statusFilter === 'pending') {
        // Not confirmed yet or has disputes
        return item.confirmationStatus !== 'confirmed';
      }
      return true;
    });
  }, [lecturerList, searchTerm, statusFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const readyItems = lecturerList.filter(
      (l) => l.confirmationStatus === 'confirmed' && l.paymentStatus === 'unpaid'
    );
    const paidItems = lecturerList.filter((l) => l.paymentStatus === 'paid');
    const disputedItems = lecturerList.filter((l) => l.confirmationStatus === 'disputed');

    const totalReadyBudget = readyItems.reduce((acc, l) => acc + l.thucNhan, 0);
    const totalPaidBudget = paidItems.reduce((acc, l) => acc + l.thucNhan, 0);

    return {
      readyCount: readyItems.length,
      totalReadyBudget,
      paidCount: paidItems.length,
      totalPaidBudget,
      disputedCount: disputedItems.length,
    };
  }, [lecturerList]);

  // Handle single payment
  const handleExecutePayment = (maGV: string) => {
    const now = new Date();
    const dateStr = `${now.toLocaleDateString('vi-VN')} ${now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    const refCode = `UNC-TDU-${Math.floor(10000 + Math.random() * 90000)}`;

    setPaymentRecords((prev) => ({
      ...prev,
      [maGV]: {
        isPaid: true,
        paidAt: dateStr,
        transactionRef: refCode,
      },
    }));

    setSuccessToast(`Đã duyệt chi trả thành công cho Giảng viên ${maGV}. Mã giao dịch: ${refCode}`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Handle batch payment
  const handleBatchPayment = () => {
    if (selectedMags.length === 0) return;
    const now = new Date();
    const dateStr = `${now.toLocaleDateString('vi-VN')} ${now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;

    const updates: Record<string, { isPaid: boolean; paidAt?: string; transactionRef?: string }> = {};
    selectedMags.forEach((ma) => {
      updates[ma] = {
        isPaid: true,
        paidAt: dateStr,
        transactionRef: `UNC-TDU-${Math.floor(10000 + Math.random() * 90000)}`,
      };
    });

    setPaymentRecords((prev) => ({ ...prev, ...updates }));
    setSuccessToast(`Đã thanh toán hàng loạt thành công cho ${selectedMags.length} giảng viên!`);
    setSelectedMags([]);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Select all visible
  const handleToggleSelectAll = () => {
    if (selectedMags.length === filteredList.length) {
      setSelectedMags([]);
    } else {
      setSelectedMags(filteredList.map((l) => l.maGV));
    }
  };

  // Toggle single item
  const handleToggleSelect = (maGV: string) => {
    setSelectedMags((prev) =>
      prev.includes(maGV) ? prev.filter((m) => m !== maGV) : [...prev, maGV]
    );
  };

  // Export Bank Payment UNC
  const handleExportBankTransferExcel = () => {
    const targetItems = selectedMags.length > 0
      ? filteredList.filter((l) => selectedMags.includes(l.maGV))
      : filteredList;

    const rows = targetItems.map((item, idx) => ({
      'STT': idx + 1,
      'Số tài khoản thụ hưởng': item.soTaiKhoan || '',
      'Tên người thụ hưởng': item.hoTen.toUpperCase(),
      'Số tiền thực chi (VNĐ)': item.thucNhan,
      'Ngân hàng thụ hưởng': item.nganHang || 'Vietcombank',
      'Mã giảng viên': item.maGV,
      'Khoa / Bộ môn': item.khoaBoMon,
      'Nội dung chuyển khoản': `TDU chi tra thu lao HK2 23-24 GV ${item.maGV}`,
      'Trạng thái': item.paymentStatus === 'paid' ? 'Đã chi' : 'Lập lệnh chi',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Lenh_Chi_Ngan_Hang');
    XLSX.writeFile(wb, `Lenh_Chi_Chuyen_Khoan_TDU_HK2.xlsx`);
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-0 overflow-y-auto">
      {/* Toast */}
      {successToast && (
        <div className="fixed top-4 right-4 z-50 bg-[#005325] text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-xs font-normal animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-normal bg-slate-100 text-black border border-slate-300">
                Phòng Tài chính - Kế hoạch
              </span>
              <span className="text-xs text-black font-normal">
                Nghiệp vụ chi trả thù lao sau khi Giảng viên đồng ý
              </span>
            </div>
            <h1 className="text-xl font-normal text-black mt-1 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-black" />
              Thực hiện thanh toán & lệnh chi chuyển khoản
            </h1>
            <p className="text-xs text-black mt-0.5 font-normal">
              Hệ thống lọc tự động danh sách các Thầy/Cô đã bấm &quot;Đồng ý xác nhận&quot; số liệu để kế toán thực hiện duyệt chi và xuất file Ủy nhiệm chi (UNC) ngân hàng.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportBankTransferExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 rounded text-xs font-normal cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-black" />
              <span>Xuất lệnh chi ngân hàng (Excel)</span>
            </button>

            {selectedMags.length > 0 && (
              <button
                onClick={handleBatchPayment}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#005325] hover:bg-[#00421d] text-white rounded text-xs font-normal cursor-pointer shadow-xs transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Duyệt chi ({selectedMags.length} người)</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-white border border-slate-300 rounded-lg p-3">
            <div className="text-[11px] font-normal text-black flex items-center justify-between">
              <span>Sẵn sàng chi trả ngay</span>
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-slate-100 text-black border border-slate-300">
                {metrics.readyCount} GV
              </span>
            </div>
            <div className="text-lg font-normal text-black font-mono mt-0.5">
              {metrics.totalReadyBudget.toLocaleString('vi-VN')} đ
            </div>
            <div className="text-[10.5px] text-black mt-1 font-normal">
              Đã được GV đồng ý xác nhận, đầy đủ STK
            </div>
          </div>

          <div className="bg-white border border-slate-300 rounded-lg p-3">
            <div className="text-[11px] font-normal text-black flex items-center justify-between">
              <span>Đã hoàn tất thanh toán</span>
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-slate-100 text-black border border-slate-300">
                {metrics.paidCount} GV
              </span>
            </div>
            <div className="text-lg font-normal text-black font-mono mt-0.5">
              {metrics.totalPaidBudget.toLocaleString('vi-VN')} đ
            </div>
            <div className="text-[10.5px] text-black mt-1 font-normal">
              Đã chuyển khoản thành công qua ngân hàng
            </div>
          </div>

          <div className="bg-white border border-slate-300 rounded-lg p-3">
            <div className="text-[11px] font-normal text-black">
              Hồ sơ có khiếu nại (Tạm giữ)
            </div>
            <div className="text-lg font-normal text-black font-mono mt-0.5">
              {metrics.disputedCount} giảng viên
            </div>
            <div className="text-[10.5px] text-black mt-1 font-normal">
              Tạm giữ thanh toán đến khi có kết quả đối soát
            </div>
          </div>

          <div className="bg-white border border-slate-300 rounded-lg p-3">
            <div className="text-[11px] font-normal text-black">
              Ngân hàng liên kết chi trả
            </div>
            <div className="text-sm font-normal text-black mt-0.5 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-black" />
              Vietcombank · CN Cần Thơ
            </div>
            <div className="text-[10.5px] text-black mt-1 font-normal">
              Cổng thanh toán tự động ủy nhiệm chi điện tử
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setStatusFilter('ready')}
              className={`px-3 py-1.5 rounded text-xs font-normal cursor-pointer transition-colors ${
                statusFilter === 'ready'
                  ? 'bg-white text-black shadow-xs border border-slate-300'
                  : 'text-black hover:bg-slate-200'
              }`}
            >
              Đủ điều kiện chi trả ({metrics.readyCount})
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1.5 rounded text-xs font-normal cursor-pointer transition-colors ${
                statusFilter === 'paid'
                  ? 'bg-white text-black shadow-xs border border-slate-300'
                  : 'text-black hover:bg-slate-200'
              }`}
            >
              Đã thanh toán ({metrics.paidCount})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded text-xs font-normal cursor-pointer transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-white text-black shadow-xs border border-slate-300'
                  : 'text-black hover:bg-slate-200'
              }`}
            >
              Chưa đủ điều kiện (Chờ GV / Có khiếu nại)
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded text-xs font-normal cursor-pointer transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-black shadow-xs border border-slate-300'
                  : 'text-black hover:bg-slate-200'
              }`}
            >
              Tất cả ({lecturerList.length})
            </button>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-black" />
            <input
              type="text"
              placeholder="Tìm theo Mã GV, Tên, STK..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs text-black focus:ring-1 focus:ring-black focus:outline-hidden bg-white font-normal"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 p-4 overflow-x-auto">
        <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100 text-black font-normal text-left border-b border-slate-300">
                <th className="w-[36px] px-2 py-2.5 text-center text-black">
                  <input
                    type="checkbox"
                    checked={
                      filteredList.length > 0 && selectedMags.length === filteredList.length
                    }
                    onChange={handleToggleSelectAll}
                    className="rounded border-slate-300 text-black focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="w-[40px] px-2 py-2.5 text-center border-r border-slate-200 text-black font-normal">STT</th>
                <th className="w-[85px] px-2.5 py-2.5 border-r border-slate-200 text-black font-normal">Mã GV</th>
                <th className="px-3 py-2.5 border-r border-slate-200 min-w-[170px] text-black font-normal">Họ và tên giảng viên</th>
                <th className="px-2.5 py-2.5 border-r border-slate-200 min-w-[130px] text-black font-normal">Khoa / Đơn vị</th>
                <th className="px-3 py-2.5 border-r border-slate-200 min-w-[160px] text-black font-normal">Tài khoản thụ hưởng</th>
                <th className="px-3 py-2.5 text-right border-r border-slate-200 w-[130px] text-black font-normal">
                  Thực nhận (VNĐ)
                </th>
                <th className="px-2.5 py-2.5 text-center border-r border-slate-200 w-[130px] text-black font-normal">
                  Xác nhận của GV
                </th>
                <th className="px-2.5 py-2.5 text-center border-r border-slate-200 w-[120px] text-black font-normal">
                  Tình trạng chi trả
                </th>
                <th className="px-3 py-2.5 text-left border-r border-slate-200 w-[160px] text-black font-normal">
                  Mã giao dịch / Ngày chi
                </th>
                <th className="px-3 py-2.5 text-center w-[120px] text-black font-normal">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-black font-normal">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-black font-normal">
                    Không có bản ghi nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => (
                  <tr
                    key={item.maGV}
                    className={`hover:bg-slate-50 transition-colors font-normal ${
                      selectedMags.includes(item.maGV) ? 'bg-slate-100/70' : ''
                    }`}
                  >
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedMags.includes(item.maGV)}
                        onChange={() => handleToggleSelect(item.maGV)}
                        className="rounded border-slate-300 text-black focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="px-2 py-2 text-center font-mono text-black border-r border-slate-100 font-normal">
                      {idx + 1}
                    </td>
                    <td className="px-2.5 py-2 font-mono font-normal text-black border-r border-slate-100 whitespace-nowrap">
                      {item.maGV}
                    </td>
                    <td className="px-3 py-2 border-r border-slate-100 whitespace-nowrap font-normal">
                      <span className="font-normal text-black block">
                        {item.hoTen}
                      </span>
                      <span className="text-[10px] text-black font-mono font-normal">
                        CCCD: {item.soCCCD} · {item.hocHamHocVi}
                      </span>
                    </td>
                    <td className="px-2.5 py-2 text-black border-r border-slate-100 whitespace-nowrap font-normal">
                      <span className="truncate block max-w-[130px]" title={item.khoaBoMon}>
                        {item.khoaBoMon}
                      </span>
                    </td>
                    <td className="px-3 py-2 border-r border-slate-100 whitespace-nowrap font-normal">
                      <div className="font-mono font-normal text-black">
                        {item.soTaiKhoan || 'Chưa có STK'}
                      </div>
                      <div className="text-[10px] text-black font-normal">
                        {item.nganHang || 'Vietcombank Tây Đô'}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-normal text-black bg-slate-50 border-r border-slate-100 whitespace-nowrap">
                      {item.thucNhan.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-2.5 py-2 text-center border-r border-slate-100 whitespace-nowrap font-normal">
                      {item.confirmationStatus === 'confirmed' ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-normal bg-slate-100 text-black border border-slate-300">
                            <CheckCircle2 className="w-3 h-3 text-black" />
                            Đã đồng ý
                          </span>
                          <span className="text-[9.5px] text-black mt-0.5 font-mono font-normal">
                            {item.confirmationDate}
                          </span>
                        </div>
                      ) : item.confirmationStatus === 'disputed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-normal bg-slate-100 text-black border border-slate-300">
                          <AlertCircle className="w-3 h-3 text-black" />
                          Đang khiếu nại
                        </span>
                      ) : (
                        <span className="text-[10.5px] text-black font-normal">
                          Chờ GV xác nhận
                        </span>
                      )}
                    </td>
                    <td className="px-2.5 py-2 text-center border-r border-slate-100 whitespace-nowrap font-normal">
                      {item.paymentStatus === 'paid' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-normal bg-slate-100 text-black border border-slate-300">
                          <Check className="w-3 h-3 text-black" />
                          Đã thanh toán
                        </span>
                      ) : item.confirmationStatus === 'confirmed' ? (
                        <span className="px-2 py-0.5 rounded text-[10.5px] font-normal bg-slate-100 text-black border border-slate-300">
                          Sẵn sàng chi
                        </span>
                      ) : (
                        <span className="text-[10.5px] text-black font-normal">
                          Chưa thể chi
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 border-r border-slate-100 whitespace-nowrap font-normal">
                      {item.transactionRef ? (
                        <div>
                          <span className="font-mono text-black font-normal block text-[11px]">
                            {item.transactionRef}
                          </span>
                          <span className="text-[9.5px] text-black font-mono font-normal">
                            {item.paymentDate}
                          </span>
                        </div>
                      ) : (
                        <span className="text-black text-xs font-normal">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap font-normal">
                      <div className="flex items-center justify-center gap-1.5 font-normal">
                        {item.paymentStatus !== 'paid' && item.confirmationStatus === 'confirmed' ? (
                          <button
                            onClick={() => handleExecutePayment(item.maGV)}
                            className="px-2.5 py-1 bg-[#005325] hover:bg-[#00421d] text-white rounded text-[11px] font-normal cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                          >
                            <CreditCard className="w-3 h-3" />
                            Chi trả
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (onNavigateToLecturerCheck) onNavigateToLecturerCheck(item.maGV);
                            }}
                            className="p-1 text-slate-600 hover:text-[#005325] hover:bg-slate-100 rounded cursor-pointer font-normal"
                            title="Xem chi tiết 5 phần kê khai"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
