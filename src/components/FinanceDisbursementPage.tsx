import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
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
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ready' | 'paid' | 'pending' | 'all'>('ready');
  const [selectedMags, setSelectedMags] = useState<string[]>([]);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [selectedVoucherItem, setSelectedVoucherItem] = useState<LecturerPaymentSummary | null>(null);

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
  }, [records, paymentRecords]);

  // Filtered list
  const filteredList = useMemo(() => {
    return lecturerList.filter((item) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          item.hoTen.toLowerCase().includes(q) ||
          item.maGV.toLowerCase().includes(q) ||
          (item.soTaiKhoan && item.soTaiKhoan.includes(q));
        if (!match) return false;
      }

      if (statusFilter === 'ready') {
        return item.confirmationStatus === 'confirmed' && item.paymentStatus === 'unpaid';
      }
      if (statusFilter === 'paid') {
        return item.paymentStatus === 'paid';
      }
      if (statusFilter === 'pending') {
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
    const pendingItems = lecturerList.filter((l) => l.confirmationStatus !== 'confirmed');

    const totalReadyBudget = readyItems.reduce((acc, l) => acc + l.thucNhan, 0);
    const totalPaidBudget = paidItems.reduce((acc, l) => acc + l.thucNhan, 0);

    return {
      readyCount: readyItems.length,
      totalReadyBudget,
      paidCount: paidItems.length,
      totalPaidBudget,
      pendingCount: pendingItems.length,
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

    setStatusNotice(`Đã duyệt chi trả thành công cho giảng viên ${maGV} (Mã UNC: ${refCode}).`);
    setTimeout(() => setStatusNotice(null), 4000);
  };

  // Handle undo payment if needed
  const handleRevertPayment = (maGV: string) => {
    setPaymentRecords((prev) => ({
      ...prev,
      [maGV]: {
        isPaid: false,
      },
    }));
    setStatusNotice(`Đã hủy trạng thái thanh toán của giảng viên ${maGV}, chuyển về chờ chi trả.`);
    setTimeout(() => setStatusNotice(null), 4000);
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
    setStatusNotice(`Đã duyệt lệnh chi hàng loạt thành công cho ${selectedMags.length} giảng viên.`);
    setSelectedMags([]);
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handleToggleSelectAll = () => {
    if (selectedMags.length === filteredList.length) {
      setSelectedMags([]);
    } else {
      setSelectedMags(filteredList.map((l) => l.maGV));
    }
  };

  const handleToggleSelect = (maGV: string) => {
    setSelectedMags((prev) =>
      prev.includes(maGV) ? prev.filter((m) => m !== maGV) : [...prev, maGV]
    );
  };

  const handleExportBankTransferExcel = () => {
    const targetItems =
      selectedMags.length > 0
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

  const filterTabs = [
    {
      id: 'ready' as const,
      label: 'Đủ điều kiện chi trả',
      count: metrics.readyCount,
      activeClass: 'bg-[#005325] text-white border-[#005325]',
    },
    {
      id: 'paid' as const,
      label: 'Đã thanh toán',
      count: metrics.paidCount,
      activeClass: 'bg-blue-600 text-white border-blue-600',
    },
    {
      id: 'pending' as const,
      label: 'Chưa đủ điều kiện',
      count: metrics.pendingCount,
      activeClass: 'bg-amber-600 text-white border-amber-600',
    },
    {
      id: 'all' as const,
      label: 'Tất cả',
      count: lecturerList.length,
      activeClass: 'bg-slate-800 text-white border-slate-800',
    },
  ];

  // Keep active voucher synced with updated payment status
  const activeVoucher = useMemo(() => {
    if (!selectedVoucherItem) return null;
    return lecturerList.find((l) => l.maGV === selectedVoucherItem.maGV) || null;
  }, [selectedVoucherItem, lecturerList]);

  return (
    <div className="flex-1 bg-[#f8fafc] flex flex-col min-h-0 overflow-y-auto min-w-0">
      {/* 1. Compact Toolbar: Summary Strip + Status Tabs + Actions */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 space-y-2">
        {/* Row 1: Summary Metrics + Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-[12px]">
            <span className="font-semibold text-slate-800">Chi trả tài chính & Ủy nhiệm chi</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">
              Sẵn sàng chi: <strong className="font-mono font-semibold text-[#005325]">{metrics.totalReadyBudget.toLocaleString('vi-VN')} đ</strong> ({metrics.readyCount} GV)
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">
              Đã thanh toán: <strong className="font-mono font-medium text-blue-600">{metrics.totalPaidBudget.toLocaleString('vi-VN')} đ</strong> ({metrics.paidCount} GV)
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">
              Ngân hàng liên kết: <strong className="font-medium text-slate-800">Vietcombank · CN Cần Thơ</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {selectedMags.length > 0 && (
              <button
                type="button"
                onClick={handleBatchPayment}
                className="h-[29px] px-3 bg-[#005325] hover:bg-[#00421d] text-white rounded-lg text-[11.5px] font-medium cursor-pointer shadow-2xs transition-colors"
              >
                Duyệt chi ({selectedMags.length} người)
              </button>
            )}
            <button
              type="button"
              onClick={handleExportBankTransferExcel}
              className="h-[29px] px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-[11.5px] font-normal cursor-pointer transition-colors"
            >
              Xuất lệnh chi ngân hàng (Excel)
            </button>
          </div>
        </div>

        {/* Row 2: Filter Tabs + Search Input */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center flex-wrap gap-1.5">
            {filterTabs.map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
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

          <div className="relative w-full sm:w-[250px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo Mã GV, Họ tên, Số TK..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-[29px] pl-8 pr-3 border border-slate-200 rounded-lg text-[11.5px] text-slate-700 bg-slate-50/60 focus:bg-white focus:border-[#005325] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Inline Status Notice (Text only, no icon) */}
      {statusNotice && (
        <div className="mx-4 mt-3 px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[#005325] text-[12px] flex items-center justify-between">
          <span>{statusNotice}</span>
          <button
            type="button"
            onClick={() => setStatusNotice(null)}
            className="text-[11px] text-emerald-700 hover:underline cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* 2. Inline Payment Voucher Panel (Hiển thị trực tiếp khi bấm vào dòng hoặc Chi tiết) */}
      {activeVoucher && (
        <div className="px-4 pt-3 pb-1">
          <div className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-[#005325] shadow-xs px-4 py-3 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[12px]">
                <span className="font-semibold text-slate-800">
                  Phiếu chi trả thù lao: {activeVoucher.hoTen} ({activeVoucher.maGV})
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600">{activeVoucher.khoaBoMon}</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600 font-mono text-[11.5px]">
                  Thụ hưởng: <strong className="text-slate-800">{activeVoucher.soTaiKhoan || 'Chưa có STK'}</strong> — {activeVoucher.nganHang || 'Vietcombank Tây Đô'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {onNavigateToLecturerCheck && (
                  <button
                    type="button"
                    onClick={() => onNavigateToLecturerCheck(activeVoucher.maGV)}
                    className="h-[27px] px-2.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-normal cursor-pointer transition-colors"
                  >
                    Xem hồ sơ GV xác nhận
                  </button>
                )}
                {activeVoucher.paymentStatus !== 'paid' && activeVoucher.confirmationStatus === 'confirmed' && (
                  <button
                    type="button"
                    onClick={() => handleExecutePayment(activeVoucher.maGV)}
                    className="h-[27px] px-3 rounded-md bg-[#005325] hover:bg-[#00421e] text-white text-[11px] font-medium cursor-pointer transition-colors"
                  >
                    Xác nhận duyệt chi (UNC)
                  </button>
                )}
                {activeVoucher.paymentStatus === 'paid' && (
                  <button
                    type="button"
                    onClick={() => handleRevertPayment(activeVoucher.maGV)}
                    className="h-[27px] px-2.5 rounded-md border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-normal cursor-pointer transition-colors"
                  >
                    Hủy duyệt chi
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedVoucherItem(null)}
                  className="h-[27px] px-2 text-slate-400 hover:text-slate-700 text-[11px] cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-[11.5px]">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-slate-400 text-[10.5px]">Tổng thù lao gộp</div>
                <div className="font-mono text-slate-800 mt-0.5">{activeVoucher.tongThuLao.toLocaleString('vi-VN')} đ</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-slate-400 text-[10.5px]">Thuế TNCN 10%</div>
                <div className="font-mono text-rose-600 mt-0.5">-{activeVoucher.thueTNCN.toLocaleString('vi-VN')} đ</div>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200">
                <div className="text-emerald-700 text-[10.5px] font-medium">Số tiền thực chuyển</div>
                <div className="font-mono font-semibold text-[#005325] mt-0.5">{activeVoucher.thucNhan.toLocaleString('vi-VN')} đ</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-slate-400 text-[10.5px]">Xác nhận của GV</div>
                <div className="text-slate-800 mt-0.5">
                  {activeVoucher.confirmationStatus === 'confirmed'
                    ? `Đã đồng ý (${activeVoucher.confirmationDate || ''})`
                    : activeVoucher.confirmationStatus === 'disputed'
                    ? 'Đang phản hồi'
                    : 'Chờ GV xác nhận'}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-slate-400 text-[10.5px]">Trạng thái lệnh chi</div>
                <div className="text-slate-800 mt-0.5">
                  {activeVoucher.paymentStatus === 'paid' ? 'Đã thanh toán (UNC)' : 'Chưa thanh toán'}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-slate-400 text-[10.5px]">Mã giao dịch / Ngày chi</div>
                <div className="font-mono text-slate-800 mt-0.5">
                  {activeVoucher.transactionRef ? `${activeVoucher.transactionRef}` : '-'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Table */}
      <div className="flex-1 p-3.5 overflow-x-auto">
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] text-[#1e293b] font-semibold text-left border-b border-slate-200 h-[36px]">
                <th className="w-[36px] px-2 text-center border-r border-slate-200">
                  <input
                    type="checkbox"
                    checked={filteredList.length > 0 && selectedMags.length === filteredList.length}
                    onChange={handleToggleSelectAll}
                    className="rounded border-slate-300 text-[#005325] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="w-[40px] px-2 text-center border-r border-slate-200">STT</th>
                <th className="w-[85px] px-2.5 border-r border-slate-200">Mã GV</th>
                <th className="px-3 border-r border-slate-200 min-w-[170px]">Họ và tên giảng viên</th>
                <th className="px-2.5 border-r border-slate-200 min-w-[130px]">Khoa / Đơn vị</th>
                <th className="px-3 border-r border-slate-200 min-w-[155px]">Tài khoản thụ hưởng</th>
                <th className="px-3 text-right border-r border-slate-200 w-[125px]">Thực nhận (VNĐ)</th>
                <th className="px-2.5 text-center border-r border-slate-200 w-[125px]">Xác nhận của GV</th>
                <th className="px-2.5 text-center border-r border-slate-200 w-[115px]">Tình trạng chi trả</th>
                <th className="px-3 text-left border-r border-slate-200 w-[155px]">Mã giao dịch / Ngày chi</th>
                <th className="px-2.5 text-center w-[125px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-[#475569] font-normal">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-400 font-normal">
                    Không có bản ghi nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => {
                  const isSelectedRow = activeVoucher?.maGV === item.maGV;
                  return (
                    <tr
                      key={item.maGV}
                      onClick={() => setSelectedVoucherItem(isSelectedRow ? null : item)}
                      className={`h-[38px] transition-colors cursor-pointer font-normal ${
                        isSelectedRow
                          ? 'bg-emerald-50/50'
                          : selectedMags.includes(item.maGV)
                          ? 'bg-slate-50'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td
                        className="px-2 text-center border-r border-slate-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedMags.includes(item.maGV)}
                          onChange={() => handleToggleSelect(item.maGV)}
                          className="rounded border-slate-300 text-[#005325] focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="px-2 text-center font-mono text-slate-400 border-r border-slate-100">
                        {idx + 1}
                      </td>
                      <td className="px-2.5 font-mono text-slate-600 border-r border-slate-100 whitespace-nowrap">
                        {item.maGV}
                      </td>
                      <td className="px-3 border-r border-slate-100 whitespace-nowrap">
                        <span className="text-slate-700 block">{item.hoTen}</span>
                        <span className="text-[10.5px] text-slate-400 font-mono">
                          CCCD: {item.soCCCD} · {item.hocHamHocVi}
                        </span>
                      </td>
                      <td className="px-2.5 text-slate-600 border-r border-slate-100 whitespace-nowrap">
                        <span className="truncate block max-w-[135px]" title={item.khoaBoMon}>
                          {item.khoaBoMon}
                        </span>
                      </td>
                      <td className="px-3 border-r border-slate-100 whitespace-nowrap">
                        <div className="font-mono text-slate-700">{item.soTaiKhoan || 'Chưa có STK'}</div>
                        <div className="text-[10.5px] text-slate-400">{item.nganHang || 'Vietcombank Tây Đô'}</div>
                      </td>
                      <td className="px-3 text-right font-mono tabular-nums text-[#005325] border-r border-slate-100 whitespace-nowrap">
                        {item.thucNhan.toLocaleString('vi-VN')}
                      </td>
                      <td className="px-2.5 text-center border-r border-slate-100 whitespace-nowrap text-[11.5px]">
                        {item.confirmationStatus === 'confirmed' ? (
                          <div>
                            <span className="text-[#005325] block">Đã đồng ý</span>
                            <span className="text-[10px] text-slate-400 font-mono">{item.confirmationDate}</span>
                          </div>
                        ) : item.confirmationStatus === 'disputed' ? (
                          <span className="text-amber-600">Đang phản hồi</span>
                        ) : (
                          <span className="text-slate-400">Chờ GV xác nhận</span>
                        )}
                      </td>
                      <td className="px-2.5 text-center border-r border-slate-100 whitespace-nowrap text-[11.5px]">
                        {item.paymentStatus === 'paid' ? (
                          <span className="text-blue-600">Đã thanh toán</span>
                        ) : item.confirmationStatus === 'confirmed' ? (
                          <span className="text-[#005325]">Sẵn sàng chi</span>
                        ) : (
                          <span className="text-slate-400">Chưa thể chi</span>
                        )}
                      </td>
                      <td className="px-3 border-r border-slate-100 whitespace-nowrap">
                        {item.transactionRef ? (
                          <div>
                            <span className="font-mono text-slate-700 block text-[11px]">{item.transactionRef}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{item.paymentDate}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td
                        className="px-2.5 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          {item.paymentStatus !== 'paid' && item.confirmationStatus === 'confirmed' && (
                            <button
                              type="button"
                              onClick={() => handleExecutePayment(item.maGV)}
                              className="px-2.5 py-0.5 bg-[#005325] hover:bg-[#00421d] text-white rounded text-[11px] font-normal cursor-pointer transition-colors"
                            >
                              Chi trả
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedVoucherItem(isSelectedRow ? null : item)}
                            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-normal cursor-pointer transition-colors"
                          >
                            {isSelectedRow ? 'Thu gọn' : 'Chi tiết'}
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
    </div>
  );
};
