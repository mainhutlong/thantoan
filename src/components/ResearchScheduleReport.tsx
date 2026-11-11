import React, { useState, useEffect, useMemo } from 'react';
import { TeachingRecord } from '../types';
import {
  Printer,
  Download,
  Save,
  CheckCircle2,
  FileSpreadsheet,
  X,
  Edit3,
  ChevronDown,
  MoreVertical,
  Eye
} from 'lucide-react';
import * as XLSX from 'xlsx';

export interface ResearchScheduleRow {
  id: string;
  tt: number;
  noiDung: string;
  theLoai: string;
  soGioQuyChuan: string | number;
  xacNhanQLKH: string;
}

interface ResearchScheduleReportProps {
  maGV?: string;
  records: TeachingRecord[];
  allLecturers?: { maGV: string; hoTen: string; khoaBoMon: string; hocHamHocVi: string }[];
  onSelectLecturer?: (maGV: string) => void;
  onSaveRecords?: (updatedRecords: TeachingRecord[]) => void;
  isModal?: boolean;
  onClose?: () => void;
  academicYear?: string;
  showInfoBox?: boolean;
  viewMode?: 'excel_sheet' | 'compact_table';
  onViewModeChange?: (mode: 'excel_sheet' | 'compact_table') => void;
  compactContent?: React.ReactNode;
}

export const ResearchScheduleReport: React.FC<ResearchScheduleReportProps> = ({
  maGV = 'TDU00128',
  records,
  allLecturers,
  onSelectLecturer,
  onSaveRecords,
  isModal = false,
  onClose,
  academicYear = '2025 - 2026',
  showInfoBox = true,
  viewMode,
  onViewModeChange,
  compactContent,
}) => {
  // Find lecturer info
  const lecturerRecords = useMemo(() => {
    return records.filter((r) => r.maGV === maGV);
  }, [records, maGV]);

  const firstRec = lecturerRecords[0] || ({} as Partial<TeachingRecord>);

  // Header info fields
  const [donVi, setDonVi] = useState(firstRec.khoaBoMon || 'Khoa Công nghệ thông tin');
  const [hoTen, setHoTen] = useState(firstRec.hoTen || 'TS. Mai Như Long');
  const [chucDanh, setChucDanh] = useState(() => {
    const hh = firstRec.hocHamHocVi || '';
    if (hh.includes('GS')) return 'GIÁO SƯ';
    if (hh.includes('PGS')) return 'PHÓ GIÁO SƯ';
    if (hh.includes('TS')) return 'TIẾN SĨ';
    if (hh.includes('ThS')) return 'THẠC SĨ';
    return 'THẠC SĨ';
  });
  const [ngachGV, setNgachGV] = useState('GIẢNG VIÊN');
  const [namHoc, setNamHoc] = useState(academicYear);
  const [isEditable, setIsEditable] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [internalViewMode, setInternalViewMode] = useState<'excel_sheet' | 'compact_table'>('excel_sheet');

  const activeViewMode = viewMode || internalViewMode;
  const handleSetViewMode = (mode: 'excel_sheet' | 'compact_table') => {
    setInternalViewMode(mode);
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  // Mức độ hoàn thành bài báo quốc tế
  const initialCompletion = useMemo(() => {
    const nckhRec = lecturerRecords.find((r) => r.phongBanQuanLy === 'nckh');
    return nckhRec?.mucDoHoanThanhNCKH === 'hoan_thanh' ? 'Hoàn thành' : 'Không hoàn thành';
  }, [lecturerRecords]);

  const [mucDoHoanThanh, setMucDoHoanThanh] = useState<'Hoàn thành' | 'Không hoàn thành'>(initialCompletion);

  // Sync state if maGV changes
  useEffect(() => {
    if (firstRec.hoTen) {
      setDonVi(firstRec.khoaBoMon || 'Khoa Công nghệ thông tin');
      setHoTen(firstRec.hoTen);
      const hh = firstRec.hocHamHocVi || '';
      if (hh.includes('GS')) setChucDanh('GIÁO SƯ');
      else if (hh.includes('PGS')) setChucDanh('PHÓ GIÁO SƯ');
      else if (hh.includes('TS')) setChucDanh('TIẾN SĨ');
      else if (hh.includes('ThS')) setChucDanh('THẠC SĨ');
      else setChucDanh('THẠC SĨ');
    }
    const nckhRec = lecturerRecords.find((r) => r.phongBanQuanLy === 'nckh');
    setMucDoHoanThanh(nckhRec?.mucDoHoanThanhNCKH === 'hoan_thanh' ? 'Hoàn thành' : 'Không hoàn thành');
  }, [maGV, firstRec, lecturerRecords]);

  // Build 10 rows for NCKH
  const initRows = (): ResearchScheduleRow[] => {
    const matching = lecturerRecords.filter((r) => r.phongBanQuanLy === 'nckh');
    const rows: ResearchScheduleRow[] = [];
    const count = Math.max(10, matching.length);

    for (let i = 0; i < count; i++) {
      const match = matching[i];
      if (match) {
        rows.push({
          id: match.id || `nckh-${i + 1}`,
          tt: i + 1,
          noiDung: match.noiDungNCKH || match.tenHocPhan || '',
          theLoai: match.theLoaiNCKH || match.loaiHoatDong || '',
          soGioQuyChuan: match.soGioQCNCKH || match.tongTietQC || '',
          xacNhanQLKH: 'Đã xác nhận',
        });
      } else {
        rows.push({
          id: `nckh-empty-${i + 1}`,
          tt: i + 1,
          noiDung: '',
          theLoai: '',
          soGioQuyChuan: '',
          xacNhanQLKH: '',
        });
      }
    }
    return rows;
  };

  const [nckhRows, setNckhRows] = useState<ResearchScheduleRow[]>(initRows);

  useEffect(() => {
    setNckhRows(initRows());
  }, [maGV, records]);

  // Handle cell change
  const handleCellChange = (index: number, field: keyof ResearchScheduleRow, value: string) => {
    const updated = [...nckhRows];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setNckhRows(updated);
  };

  // Calculate total hours
  const totalQC = useMemo(() => {
    return nckhRows.reduce((sum, r) => {
      const val = typeof r.soGioQuyChuan === 'number'
        ? r.soGioQuyChuan
        : parseFloat(String(r.soGioQuyChuan).replace(',', '.'));
      return !isNaN(val) && val > 0 ? sum + val : sum;
    }, 0);
  }, [nckhRows]);

  // Cell style logic: Empty inputs are yellow '#FFFF99'.
  // Filled inputs change color (to white) as stated in the note: "khi nhập xong sẽ đổi màu"
  const getCellBg = (val: string | number | undefined) => {
    const s = String(val ?? '').trim();
    if (s === '') {
      return 'bg-[#ffff99] hover:bg-[#fff777]';
    }
    return 'bg-white hover:bg-slate-50';
  };

  // Export to Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const headerRows: (string | number)[][] = [
      ['BẢNG THỐNG KÊ CÔNG TÁC NGHIÊN CỨU KHOA HỌC'],
      [`NĂM HỌC ${namHoc}`],
      [],
      ['Đơn vị:', donVi, '', '', 'Lưu ý: Quý thầy cô nhập thống kê của mình tại những ô màu vàng có ghi chú,'],
      ['Họ tên giảng viên:', hoTen, '', '', 'khi nhập xong sẽ đổi màu, đề nghị quý thầy cô nhập đầy đủ'],
      ['Chức danh:', chucDanh],
      ['Ngạch giảng viên:', ngachGV],
      ['Năm học:', namHoc],
      [],
      ['B. NGHIÊN CỨU KHOA HỌC (NCKH)'],
      ['TT', 'Nội dung', 'Thể loại', 'Số giờ quy chuẩn', 'Xác nhận của P.QLKH'],
    ];

    nckhRows.forEach((r) => {
      const val = typeof r.soGioQuyChuan === 'number'
        ? r.soGioQuyChuan
        : parseFloat(String(r.soGioQuyChuan).replace(',', '.'));
      headerRows.push([
        r.tt,
        r.noiDung,
        r.theLoai,
        !isNaN(val) && val > 0 ? val : '-',
        r.xacNhanQLKH,
      ]);
    });

    headerRows.push([
      '',
      'Tổng số giờ nghiên cứu khoa học',
      '',
      totalQC > 0 ? totalQC : '-',
      '',
    ]);

    headerRows.push([
      '',
      'Mức độ hoàn thành bài báo quốc tế',
      '',
      mucDoHoanThanh,
      '',
    ]);

    const ws = XLSX.utils.aoa_to_sheet(headerRows);
    XLSX.utils.book_append_sheet(wb, ws, 'ThongKeNCKH');
    XLSX.writeFile(wb, `Bang_Thong_Ke_NCKH_${hoTen.replace(/\s+/g, '_')}_${namHoc.replace(/\s+/g, '')}.xlsx`);
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Save changes
  const handleSave = () => {
    if (onSaveRecords) {
      const updatedList: TeachingRecord[] = [];

      nckhRows.forEach((r) => {
        if (r.noiDung.trim()) {
          const qc = typeof r.soGioQuyChuan === 'number'
            ? r.soGioQuyChuan
            : parseFloat(String(r.soGioQuyChuan).replace(',', '.')) || 0;

          updatedList.push({
            id: r.id.startsWith('nckh-empty') ? `tdu-tc-nckh-${Date.now()}-${r.tt}` : r.id,
            tt: r.tt,
            maGV,
            hoTen,
            ngaySinh: firstRec.ngaySinh || '01/01/1980',
            soCCCD: firstRec.soCCCD || '',
            hocHamHocVi: firstRec.hocHamHocVi || 'ThS',
            khoaBoMon: donVi,
            phongBanQuanLy: 'nckh',
            loaiHoatDong: r.theLoai || 'Nghiên cứu khoa học',
            tenHocPhan: r.noiDung,
            maLopHocPhan: `NCKH_${r.tt}`,
            noiDungNCKH: r.noiDung,
            theLoaiNCKH: r.theLoai,
            soGioQCNCKH: qc,
            dinhMucNCKH: firstRec.dinhMucNCKH || 150,
            mucDoHoanThanhNCKH: mucDoHoanThanh === 'Hoàn thành' ? 'hoan_thanh' : 'khong_hoan_thanh',
            soTinChi: 0,
            soTietLT: qc,
            soTietTH: 0,
            heSoLop: 1.0,
            tongTietQC: qc,
            donGiaTiet: firstRec.donGiaTiet || 140000,
            tongTienThuLao: qc * (firstRec.donGiaTiet || 140000),
            thueTNCN: qc * (firstRec.donGiaTiet || 140000) * 0.1,
            thucNhan: qc * (firstRec.donGiaTiet || 140000) * 0.9,
            soTaiKhoan: firstRec.soTaiKhoan,
            nganHang: firstRec.nganHang,
            nguoiThucHien: 'Phòng Quản lý Khoa học TDU',
            trangThai: 'da_so_hoa',
            dotThanhToan: firstRec.dotThanhToan || 'Đợt 1 - Học kỳ 2 (2025 - 2026)',
          });
        }
      });

      onSaveRecords(updatedList);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className={`w-full max-w-full min-w-0 flex flex-col bg-white ${isModal ? 'p-0' : 'p-3 sm:p-4'}`}>
      {/* 1. TOP TOOLBAR (Hidden when printing) */}
      <div className="print:hidden w-full max-w-full min-w-0 bg-slate-50 border border-slate-300 rounded-md p-2.5 mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <FileSpreadsheet className="w-4 h-4 text-purple-700 shrink-0" />
            <span>Biểu mẫu: Bảng thống kê Nghiên cứu Khoa học (NCKH)</span>
          </div>

          {/* Lecturer Selector */}
          {allLecturers && allLecturers.length > 0 && onSelectLecturer && (
            <div className="flex items-center gap-1.5 ml-1">
              <span className="text-xs text-slate-500">Giảng viên:</span>
              <select
                value={maGV}
                onChange={(e) => onSelectLecturer(e.target.value)}
                className="text-xs border border-slate-300 rounded px-2 py-1 bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#005325]"
              >
                {allLecturers.map((lec) => (
                  <option key={lec.maGV} value={lec.maGV}>
                    {lec.maGV} - {lec.hoTen} ({lec.hocHamHocVi})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {saveSuccess && (
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-1 rounded flex items-center gap-1 animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Đã lưu dữ liệu NCKH thành công!
            </span>
          )}

          {/* Chế độ hiển thị (Eye icon next to 3 dots) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsViewMenuOpen((prev) => !prev);
                setIsActionMenuOpen(false);
              }}
              className="w-8 h-8 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer flex items-center justify-center transition-colors shadow-2xs"
              title="Chế độ hiển thị"
            >
              <Eye className="w-4 h-4 text-slate-700" />
            </button>

            {isViewMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsViewMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-40 flex flex-col">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Chế độ hiển thị
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleSetViewMode('excel_sheet');
                      setIsViewMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-xs text-left hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors ${
                      activeViewMode === 'excel_sheet'
                        ? 'text-purple-700 font-semibold bg-purple-50/50'
                        : 'text-slate-700'
                    }`}
                  >
                    <span>Mẫu Bảng thống kê NCKH</span>
                    {activeViewMode === 'excel_sheet' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSetViewMode('compact_table');
                      setIsViewMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-xs text-left hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors ${
                      activeViewMode === 'compact_table'
                        ? 'text-purple-700 font-semibold bg-purple-50/50'
                        : 'text-slate-700'
                    }`}
                  >
                    <span>Danh sách rút gọn</span>
                    {activeViewMode === 'compact_table' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsActionMenuOpen((prev) => !prev);
                setIsViewMenuOpen(false);
              }}
              className="w-8 h-8 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer flex items-center justify-center transition-colors shadow-2xs"
              title="Tùy chọn thao tác"
            >
              <MoreVertical className="w-4 h-4 text-slate-700" />
            </button>

            {isActionMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsActionMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-40 flex flex-col">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditable(!isEditable);
                      setIsActionMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-xs text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors text-slate-700"
                  >
                    <Edit3 className={`w-3.5 h-3.5 ${isEditable ? 'text-amber-600' : 'text-slate-500'}`} />
                    <span className={isEditable ? 'font-medium text-amber-800' : ''}>
                      {isEditable ? 'Đang bật nhập liệu' : 'Chế độ xem'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSave();
                      setIsActionMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-xs text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors text-slate-700"
                  >
                    <Save className="w-3.5 h-3.5 text-[#005325]" />
                    <span>Lưu bảng</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleExportExcel();
                      setIsActionMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-xs text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors text-slate-700"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Xuất Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handlePrint();
                      setIsActionMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-xs text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors text-slate-700"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>In biểu mẫu</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors ml-1"
              title="Đóng cửa sổ"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. THE EXACT SPREADSHEET SHEET OR COMPACT TABLE */}
      {activeViewMode === 'compact_table' && compactContent ? (
        <div className="w-full max-w-full min-w-0 overflow-x-auto bg-white border border-slate-200 rounded-md">
          {compactContent}
        </div>
      ) : (
      <div className="w-full max-w-full min-w-0 overflow-x-auto bg-white print:p-0 print:overflow-visible">
        <div className="w-full min-w-[760px] mx-auto p-3 sm:p-5 bg-white font-sans text-black border border-slate-300 shadow-xs print:border-none print:shadow-none">
          {/* TITLE CENTERED */}
          <div className="text-center mb-4 pb-2.5 border-b border-slate-200">
            <h1 className="text-[18px] sm:text-[20px] font-bold tracking-wide uppercase text-slate-900 font-sans">
              BẢNG THỐNG KÊ CÔNG TÁC NGHIÊN CỨU KHOA HỌC
            </h1>
            <h2 className="text-[13.5px] sm:text-[14px] font-semibold text-slate-700 font-sans mt-0.5">
              NĂM HỌC {namHoc}
            </h2>
            <div className="text-[12px] text-slate-600 font-sans mt-1">
              Giảng viên: <strong className="text-slate-900 font-semibold">{hoTen}</strong> ({maGV}) — {donVi}
            </div>
          </div>

          {/* INSTRUCTION NOTE */}
          <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-amber-50/90 border border-amber-200/80 rounded text-[12px] text-amber-900 print:hidden">
            <span className="font-bold text-amber-800 shrink-0">Lưu ý:</span>
            <span>Quý thầy cô nhập thống kê tại các ô màu vàng nhạt; khi hoàn tất ô sẽ tự động đổi màu và hệ thống tính quy chuẩn số giờ.</span>
          </div>

          {/* SECTION HEADER: B. NGHIÊN CỨU KHOA HỌC (NCKH) - EXACTLY MATCHING IMAGE */}
          <div className="border-t-2 border-black pt-1 mb-0.5">
            <h3 className="text-[13px] font-bold text-red-600 uppercase tracking-wide">
              B. NGHIÊN CỨU KHOA HỌC (NCKH)
            </h3>
          </div>

          {/* MAIN SPREADSHEET TABLE */}
          <div className="w-full border-t border-black relative">
            <table className="w-full border-collapse border border-black text-[12px]">
              {/* TABLE HEADER - EXACTLY MATCHING IMAGE */}
              <thead>
                <tr className="bg-[#bfbfbf] text-black h-[34px]">
                  <th className="w-[38px] px-1 py-1 text-center font-normal border border-black">
                    TT
                  </th>
                  <th className="px-3 py-1 text-center font-normal border border-black min-w-[420px]">
                    Nội dung
                  </th>
                  <th className="w-[180px] px-2 py-1 text-center font-normal border border-black">
                    Thể loại
                  </th>
                  <th className="w-[125px] px-2 py-1 text-center font-normal border border-black">
                    Số giờ quy chuẩn
                  </th>
                  <th className="w-[135px] px-2 py-1 text-center font-normal border border-black">
                    Xác nhận<br />của P.QLKH
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* 10 ROWS (1 TO 10) - EXACTLY MATCHING IMAGE */}
                {nckhRows.map((row, index) => {
                  const val = typeof row.soGioQuyChuan === 'number'
                    ? row.soGioQuyChuan
                    : parseFloat(String(row.soGioQuyChuan).replace(',', '.'));
                  const hasQC = !isNaN(val) && val > 0;

                  return (
                    <tr key={row.id} className="h-[26px]">
                      {/* TT */}
                      <td className="px-1 py-0 text-center font-normal border border-black bg-white">
                        {row.tt}
                      </td>

                      {/* Nội dung */}
                      <td className={`px-2 py-0 border border-black ${getCellBg(row.noiDung)}`}>
                        {isEditable ? (
                          <input
                            type="text"
                            value={row.noiDung}
                            onChange={(e) => handleCellChange(index, 'noiDung', e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-[12px] text-black"
                            placeholder={index === 0 ? 'Nhập tên đề tài, bài báo, giáo trình...' : ''}
                          />
                        ) : (
                          <span>{row.noiDung}</span>
                        )}
                      </td>

                      {/* Thể loại */}
                      <td className={`px-2 py-0 border border-black text-center ${getCellBg(row.theLoai)}`}>
                        {isEditable ? (
                          <input
                            type="text"
                            value={row.theLoai}
                            onChange={(e) => handleCellChange(index, 'theLoai', e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-[12px] text-center text-black"
                            placeholder={index === 0 ? 'Bài báo / Đề tài...' : ''}
                          />
                        ) : (
                          <span>{row.theLoai}</span>
                        )}
                      </td>

                      {/* Số giờ quy chuẩn */}
                      <td className={`px-2 py-0 border border-black text-center ${getCellBg(row.soGioQuyChuan)}`}>
                        {isEditable ? (
                          <input
                            type="text"
                            value={row.soGioQuyChuan}
                            onChange={(e) => handleCellChange(index, 'soGioQuyChuan', e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-[12px] text-center font-mono text-black"
                          />
                        ) : (
                          <span className="font-mono">{hasQC ? val : '-'}</span>
                        )}
                      </td>

                      {/* Xác nhận của P.QLKH */}
                      <td className="px-2 py-0 border border-black text-center bg-white text-black text-[11px]">
                        {row.xacNhanQLKH || ''}
                      </td>
                    </tr>
                  );
                })}

                {/* FOOTER ROW 1: TỔNG SỐ GIỜ NGHIÊN CỨU KHOA HỌC - EXACTLY MATCHING IMAGE */}
                <tr className="h-[28px]">
                  {/* Empty TT cell with border */}
                  <td className="border border-black bg-white"></td>

                  {/* Gray Cell: Tổng số giờ nghiên cứu khoa học spanning col 2 & 3 */}
                  <td colSpan={2} className="px-3 py-1 text-center font-bold text-black border border-black bg-[#bfbfbf]">
                    Tổng số giờ nghiên cứu khoa học
                  </td>

                  {/* Yellow Cell: Total Hours or '-' */}
                  <td className="px-2 py-1 text-center font-normal text-black border border-black bg-[#ffff99]">
                    {totalQC > 0 ? totalQC.toFixed(totalQC % 1 === 0 ? 0 : 1) : '-'}
                  </td>

                  {/* White Cell: Empty */}
                  <td className="border border-black bg-white"></td>
                </tr>

                {/* FOOTER ROW 2: MỨC ĐỘ HOÀN THÀNH BÀI BÁO QUỐC TẾ - EXACTLY MATCHING IMAGE */}
                <tr className="h-[28px] relative">
                  {/* Empty TT cell with border */}
                  <td className="border border-black bg-white"></td>

                  {/* Gray Cell: Mức độ hoàn thành bài báo quốc tế spanning col 2 & 3 */}
                  <td colSpan={2} className="px-3 py-1 text-center font-bold text-black border border-black bg-[#bfbfbf]">
                    Mức độ hoàn thành bài báo quốc tế
                  </td>

                  {/* Yellow Cell with interactive Dropdown: "Không hoàn thành" / "Hoàn thành" */}
                  <td className="px-1 py-0.5 text-center font-medium text-black border border-black bg-[#ffff99] relative">
                    {isEditable ? (
                      <div className="relative inline-flex items-center justify-center w-full">
                        <select
                          value={mucDoHoanThanh}
                          onChange={(e) => setMucDoHoanThanh(e.target.value as 'Hoàn thành' | 'Không hoàn thành')}
                          className="w-full bg-transparent border-none outline-none text-[12px] font-medium text-black text-center cursor-pointer appearance-none pr-3"
                        >
                          <option value="Không hoàn thành">Không hoàn thành</option>
                          <option value="Hoàn thành">Hoàn thành</option>
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-700 absolute right-0.5 pointer-events-none" />
                      </div>
                    ) : (
                      <span>{mucDoHoanThanh}</span>
                    )}
                  </td>

                  {/* White Cell: Empty */}
                  <td className="border border-black bg-white"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SIGNATURE SECTION (For clean printing) */}
          <div className="hidden print:grid grid-cols-3 gap-4 mt-12 text-center text-[12px] text-black">
            <div>
              <p className="font-bold">GIẢNG VIÊN KÊ KHAI</p>
              <p className="italic text-[11px]">(Ký và ghi rõ họ tên)</p>
              <div className="h-16"></div>
              <p className="font-bold">{hoTen}</p>
            </div>
            <div>
              <p className="font-bold">TRƯỞNG KHOA / ĐƠN VỊ</p>
              <p className="italic text-[11px]">(Xác nhận & Ký duyệt)</p>
              <div className="h-16"></div>
              <p className="font-bold">Ban Chủ nhiệm Khoa</p>
            </div>
            <div>
              <p className="font-bold">PHÒNG QLKH & HTQT</p>
              <p className="italic text-[11px]">(Đối soát định mức NCKH)</p>
              <div className="h-16"></div>
              <p className="font-bold">Trưởng phòng QLKH</p>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

