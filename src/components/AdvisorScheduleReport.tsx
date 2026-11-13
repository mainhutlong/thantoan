import React, { useState, useEffect, useMemo } from 'react';
import { TeachingRecord, FeedbackRowInfo } from '../types';
import {
  Printer,
  Download,
  Save,
  CheckCircle2,
  FileSpreadsheet,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import XLSX from 'xlsx-js-style';
import { saveWorkbookToFile, stripAcademicTitle } from '../utils/excelTemplateGenerator';

export interface AdvisorScheduleRow {
  id: string;
  tt: number;
  lopCVHT: string;
  khoaNganh: string;
  soSinhVien: number | string;
  dotPhuTrach: string;
  xepLoai: string;
  soTietDinhMucQC: number | string;
  quyetDinhPhanCong: string;
  ghiChu: string;
  xacNhanCTSV: string;
}

interface AdvisorScheduleReportProps {
  maGV?: string;
  records: TeachingRecord[];
  allLecturers?: { maGV: string; hoTen: string; khoaBoMon: string; hocHamHocVi: string }[];
  onSelectLecturer?: (maGV: string) => void;
  onSaveRecords?: (updatedRecords: TeachingRecord[]) => void;
  isModal?: boolean;
  onClose?: () => void;
  academicYear?: string;
  viewMode?: 'excel_sheet' | 'compact_table';
  onViewModeChange?: (mode: 'excel_sheet' | 'compact_table') => void;
  selectedRowIds?: string[];
  onToggleSelectRow?: (row: FeedbackRowInfo) => void;
  onSelectAllRows?: (rows: FeedbackRowInfo[], selectAll: boolean) => void;
}

export const AdvisorScheduleReport: React.FC<AdvisorScheduleReportProps> = ({
  maGV = 'TDU00128',
  records,
  allLecturers,
  onSelectLecturer,
  onSaveRecords,
  isModal = false,
  onClose,
  academicYear = '2025 - 2026',
  selectedRowIds = [],
  onToggleSelectRow,
  onSelectAllRows,
}) => {
  const lecturerRecords = useMemo(() => {
    return records.filter((r) => r.maGV === maGV);
  }, [records, maGV]);

  const firstRec = lecturerRecords[0] || ({} as Partial<TeachingRecord>);

  const [donVi, setDonVi] = useState(firstRec.khoaBoMon || 'Khoa Công nghệ thông tin');
  const [hoTen, setHoTen] = useState(stripAcademicTitle(firstRec.hoTen || '') || 'Mai Như Long');
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
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (firstRec.hoTen) {
      setDonVi(firstRec.khoaBoMon || 'Khoa Công nghệ thông tin');
      setHoTen(stripAcademicTitle(firstRec.hoTen));
    }
  }, [firstRec]);

  const initRows = (): AdvisorScheduleRow[] => {
    const cvRecs = lecturerRecords.filter((r) => r.phongBanQuanLy === 'co_van_hoc_tap');
    if (cvRecs.length > 0) {
      return cvRecs.map((r, i) => ({
        id: r.id || `advisor-${i + 1}`,
        tt: i + 1,
        lopCVHT: r.lopCVHT || r.maLopHocPhan || 'CNTT14A',
        khoaNganh: r.khoaBoMon || 'Ngành Công nghệ thông tin - Khóa 14',
        soSinhVien: r.soSinhVien || 65,
        dotPhuTrach: r.dotThanhToan || 'Học kỳ 1 2026-2027',
        xepLoai: r.xepLoaiCVHT || 'Hoàn thành tốt',
        soTietDinhMucQC: r.tongTietQC || 20,
        quyetDinhPhanCong: r.ghiChu || 'Theo QĐ phân công CVHT số 94/QĐ-ĐHTĐ',
        ghiChu: 'Tổ chức sinh hoạt lớp định kỳ và tư vấn kế hoạch học tập',
        xacNhanCTSV: 'Đã nộp đầy đủ sổ tay CVHT và biên bản họp lớp',
      }));
    }

    return [
      {
        id: 'advisor-1',
        tt: 1,
        lopCVHT: 'CNTT14A',
        khoaNganh: 'Ngành Công nghệ thông tin - Khóa 14',
        soSinhVien: 65,
        dotPhuTrach: 'Học kỳ 1 2026-2027',
        xepLoai: 'Hoàn thành xuất sắc',
        soTietDinhMucQC: 20,
        quyetDinhPhanCong: 'QĐ số 94/QĐ-ĐHTĐ ngày 05/09/2026',
        ghiChu: 'Theo dõi tiến độ tích lũy tín chỉ & cảnh báo học vụ',
        xacNhanCTSV: 'Đạt danh hiệu CVHT tiêu biểu học kỳ',
      },
      {
        id: 'advisor-2',
        tt: 2,
        lopCVHT: 'CNTT15B',
        khoaNganh: 'Ngành Kỹ thuật Phần mềm - Khóa 15',
        soSinhVien: 52,
        dotPhuTrach: 'Học kỳ 1 2026-2027',
        xepLoai: 'Hoàn thành tốt',
        soTietDinhMucQC: 20,
        quyetDinhPhanCong: 'QĐ số 94/QĐ-ĐHTĐ ngày 05/09/2026',
        ghiChu: 'Tư vấn hướng nghiệp & đăng ký học phần chuyên ngành',
        xacNhanCTSV: 'Đầy đủ biên bản sinh hoạt lớp hàng tháng',
      },
    ];
  };

  const [advisorRows, setAdvisorRows] = useState<AdvisorScheduleRow[]>(initRows);

  useEffect(() => {
    setAdvisorRows(initRows());
  }, [maGV, records]);

  const handleCellChange = (index: number, field: keyof AdvisorScheduleRow, value: string) => {
    const updated = [...advisorRows];
    updated[index] = { ...updated[index], [field]: value };
    setAdvisorRows(updated);
  };

  const totalSV = useMemo(() => {
    return advisorRows.reduce((sum, r) => sum + (parseFloat(String(r.soSinhVien).replace(',', '.')) || 0), 0);
  }, [advisorRows]);

  const totalQC = useMemo(() => {
    return advisorRows.reduce((sum, r) => sum + (parseFloat(String(r.soTietDinhMucQC).replace(',', '.')) || 0), 0);
  }, [advisorRows]);

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const headerRows: (string | number)[][] = [
      ['BẢNG THỐNG KÊ NHIỆM VỤ CỐ VẤN HỌC TẬP & QUẢN LÝ LỚP'],
      [`NĂM HỌC ${namHoc}`],
      [],
      ['Đơn vị:', donVi, '', '', '', '', 'Lưu ý: Quý Thầy/Cô kiểm tra danh sách lớp phụ trách,'],
      ['Họ tên giảng viên:', hoTen, '', '', '', '', 'xếp loại hoàn thành và biên bản nộp về Phòng CTSV'],
      ['Chức danh:', chucDanh],
      ['Ngạch giảng viên:', ngachGV],
      ['Năm học:', namHoc],
      [],
      ['BẢNG CHI TIẾT CÔNG TÁC CỐ VẤN HỌC TẬP'],
      [
        'TT',
        'Lớp phụ trách CVHT',
        'Khóa / Ngành đào tạo',
        'Sĩ số SV',
        'Học kỳ phụ trách',
        'Xếp loại hoàn thành',
        'Số tiết định mức QC',
        'Căn cứ Quyết định',
        'Ghi chú nhiệm vụ',
        'Xác nhận P.CTSV & Khoa',
      ],
    ];

    advisorRows.forEach((r) => {
      headerRows.push([
        r.tt,
        r.lopCVHT,
        r.khoaNganh,
        r.soSinhVien,
        r.dotPhuTrach,
        r.xepLoai,
        r.soTietDinhMucQC,
        r.quyetDinhPhanCong,
        r.ghiChu,
        r.xacNhanCTSV,
      ]);
    });

    headerRows.push([
      'Tổng cộng',
      '',
      '',
      totalSV,
      '',
      '',
      totalQC > 0 ? totalQC : '-',
      '',
      '',
      'Đã hoàn thành đánh giá',
    ]);

    const ws = XLSX.utils.aoa_to_sheet(headerRows);

    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
    ];

    ws['!cols'] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 32 },
      { wch: 14 },
      { wch: 20 },
      { wch: 22 },
      { wch: 20 },
      { wch: 30 },
      { wch: 32 },
      { wch: 26 },
    ];

    const thinBorder = {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } },
    };

    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:J30');
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = ws[cellRef];
        if (!cell) continue;

        if (R === 0 || R === 1) {
          cell.s = {
            font: { name: 'Times New Roman', sz: 14, bold: true, color: { rgb: '000000' } },
            alignment: { horizontal: 'center', vertical: 'center' },
          };
        } else if (R >= 3 && R <= 7) {
          cell.s = {
            font: { name: 'Times New Roman', sz: 10.5, bold: C === 0, color: { rgb: '000000' } },
            alignment: { vertical: 'center', horizontal: 'left' },
          };
        } else if (R === 9) {
          cell.s = {
            font: { name: 'Times New Roman', sz: 11, bold: true, color: { rgb: '005325' } },
            alignment: { vertical: 'center', horizontal: 'left' },
          };
        } else if (R === 10) {
          cell.s = {
            font: { name: 'Times New Roman', sz: 10.5, bold: true, color: { rgb: '000000' } },
            fill: { fgColor: { rgb: 'FFFF99' } },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
            border: thinBorder,
          };
        } else if (R === headerRows.length - 1) {
          cell.s = {
            font: { name: 'Times New Roman', sz: 11, bold: true, color: { rgb: '005325' } },
            fill: { fgColor: { rgb: 'F1F5F9' } },
            alignment: { vertical: 'center', horizontal: C === 6 ? 'right' : 'left' },
            border: {
              top: { style: 'thin', color: { rgb: '000000' } },
              bottom: { style: 'double', color: { rgb: '000000' } },
              left: { style: 'thin', color: { rgb: '000000' } },
              right: { style: 'thin', color: { rgb: '000000' } },
            },
          };
        } else if (R > 10) {
          cell.s = {
            font: { name: 'Times New Roman', sz: 10, color: { rgb: '000000' } },
            alignment: {
              vertical: 'center',
              horizontal: C === 0 || C === 1 || C === 3 || C === 4 || C === 5 ? 'center' : C === 6 ? 'right' : 'left',
            },
            border: thinBorder,
          };
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, 'ThongKeCVHT');
    saveWorkbookToFile(wb, `Bang_Thong_Ke_Co_Van_Hoc_Tap_${hoTen.replace(/\s+/g, '_')}_${namHoc.replace(/\s+/g, '')}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    if (onSaveRecords) {
      const updatedTeachingRecords: TeachingRecord[] = advisorRows.map((r, idx) => ({
        id: r.id,
        tt: idx + 1,
        maGV,
        hoTen,
        ngaySinh: firstRec.ngaySinh || '18/09/1982',
        soCCCD: firstRec.soCCCD || '092082001245',
        hocHamHocVi: chucDanh,
        khoaBoMon: donVi,
        phongBanQuanLy: 'co_van_hoc_tap',
        loaiHoatDong: 'Cố vấn học tập',
        tenHocPhan: `Cố vấn học tập lớp ${r.lopCVHT}`,
        maLopHocPhan: r.lopCVHT,
        lopCVHT: r.lopCVHT,
        soSinhVien: Number(r.soSinhVien) || 0,
        tongTietQC: Number(r.soTietDinhMucQC) || 0,
        xepLoaiCVHT: r.xepLoai,
        donGiaTiet: 150000,
        tongTienThuLao: (Number(r.soTietDinhMucQC) || 0) * 150000,
        thueTNCN: (Number(r.soTietDinhMucQC) || 0) * 15000,
        thucNhan: (Number(r.soTietDinhMucQC) || 0) * 135000,
        soTaiKhoan: firstRec.soTaiKhoan || '102874639912',
        nganHang: firstRec.nganHang || 'VietinBank CN Cần Thơ',
        dotThanhToan: r.dotPhuTrach,
        trangThai: 'hop_le',
        ghiChu: `${r.quyetDinhPhanCong} - ${r.ghiChu}`,
      }));
      onSaveRecords(updatedTeachingRecords);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleAddRow = () => {
    const newRow: AdvisorScheduleRow = {
      id: `advisor-${Date.now()}`,
      tt: advisorRows.length + 1,
      lopCVHT: 'CNTT16A',
      khoaNganh: 'Ngành Công nghệ thông tin',
      soSinhVien: 60,
      dotPhuTrach: 'Học kỳ 1 2026-2027',
      xepLoai: 'Hoàn thành tốt',
      soTietDinhMucQC: 20,
      quyetDinhPhanCong: 'QĐ phân công bổ sung',
      ghiChu: 'CVHT lớp mới',
      xacNhanCTSV: 'Chờ duyệt',
    };
    setAdvisorRows([...advisorRows, newRow]);
  };

  const handleDeleteRow = (index: number) => {
    if (advisorRows.length <= 1) {
      alert('Bảng kê cần tối thiểu 1 dòng dữ liệu.');
      return;
    }
    const updated = advisorRows.filter((_, i) => i !== index).map((r, i) => ({ ...r, tt: i + 1 }));
    setAdvisorRows(updated);
  };

  const allSelectableRows = useMemo(() => {
    return advisorRows.map((r) => ({
      rowId: r.id,
      tt: r.tt,
      title: `Cố vấn lớp ${r.lopCVHT}`,
      subtitle: `${r.khoaNganh} · ${r.dotPhuTrach}`,
      khoiLuong: `${r.soTietDinhMucQC} tiết QC`,
    }));
  }, [advisorRows]);

  const areAllSelected =
    allSelectableRows.length > 0 &&
    allSelectableRows.every((r) => selectedRowIds.includes(r.rowId));

  return (
    <div className="w-full bg-slate-100 min-h-screen py-4 px-2 sm:px-4 font-sans text-slate-800">
      {/* 1. Header Toolbar */}
      <div className="max-w-[1180px] mx-auto bg-white rounded-xl shadow-xs border border-slate-200 p-3 mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200 text-xs font-semibold">
            <FileSpreadsheet className="w-4 h-4 text-amber-700" />
            <span>CỐ VẤN HỌC TẬP · BẢNG THỐNG KÊ CHI TIẾT</span>
          </div>

          {allLecturers && allLecturers.length > 0 && onSelectLecturer && (
            <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
              <span className="font-medium text-slate-500">Giảng viên:</span>
              <select
                value={maGV}
                onChange={(e) => onSelectLecturer(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                {allLecturers.map((l) => (
                  <option key={l.maGV} value={l.maGV}>
                    {l.maGV} - {l.hoTen} ({l.khoaBoMon})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddRow}
            className="h-[32px] px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm lớp CVHT</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className={`h-[32px] px-3 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              saveSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-[#005325] hover:bg-[#00421e] text-white shadow-2xs'
            }`}
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã lưu!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Lưu bảng kê</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="h-[32px] px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-600" />
            <span>Xuất Excel</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="h-[32px] px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>In biểu mẫu</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="h-[32px] w-[32px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              title="Đóng bảng kê"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Official Printable Paper Sheet */}
      <div className="max-w-[1180px] mx-auto bg-white rounded-xl shadow-md border border-slate-300 p-6 sm:p-10 font-serif text-slate-900 print:shadow-none print:border-none print:p-0">
        <div className="text-center space-y-1 mb-6">
          <h2 className="text-[17px] font-bold uppercase tracking-wide">TRƯỜNG ĐẠI HỌC TÂY ĐÔ</h2>
          <h3 className="text-[14px] font-semibold text-slate-700 uppercase">PHÒNG CÔNG TÁC SINH VIÊN & HỌC SINH</h3>
          <div className="w-36 h-0.5 bg-slate-400 mx-auto my-2" />
          <h1 className="text-[19px] font-extrabold uppercase text-[#005325] pt-2 tracking-wide">
            BẢNG THỐNG KÊ NHIỆM VỤ CỐ VẤN HỌC TẬP & QUẢN LÝ LỚP
          </h1>
          <p className="text-[13px] italic font-medium text-slate-600">NĂM HỌC {namHoc}</p>
        </div>

        {/* Lecturer Meta Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-[13px] mb-6 p-4 bg-slate-50/70 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-bold min-w-[130px]">Khoa / Đơn vị:</span>
            <input
              type="text"
              value={donVi}
              onChange={(e) => setDonVi(e.target.value)}
              className="flex-1 bg-transparent border-b border-dashed border-slate-400 focus:border-[#005325] focus:outline-none px-1 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold min-w-[130px]">Họ tên giảng viên:</span>
            <input
              type="text"
              value={hoTen}
              onChange={(e) => setHoTen(e.target.value)}
              className="flex-1 bg-transparent border-b border-dashed border-slate-400 focus:border-[#005325] focus:outline-none px-1 font-bold text-[#005325]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold min-w-[130px]">Chức danh / Học vị:</span>
            <input
              type="text"
              value={chucDanh}
              onChange={(e) => setChucDanh(e.target.value)}
              className="flex-1 bg-transparent border-b border-dashed border-slate-400 focus:border-[#005325] focus:outline-none px-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold min-w-[130px]">Ngạch giảng viên:</span>
            <input
              type="text"
              value={ngachGV}
              onChange={(e) => setNgachGV(e.target.value)}
              className="flex-1 bg-transparent border-b border-dashed border-slate-400 focus:border-[#005325] focus:outline-none px-1"
            />
          </div>
        </div>

        {/* Table Title */}
        <div className="text-[13px] font-bold text-[#005325] mb-2 uppercase flex items-center justify-between">
          <span>DANH SÁCH LỚP PHỤ TRÁCH CỐ VẤN HỌC TẬP:</span>
          <span className="text-[11px] font-normal italic text-slate-500 normal-case">
            * Các ô màu vàng có thể chỉnh sửa trực tiếp số SV, xếp loại và định mức giờ
          </span>
        </div>

        {/* Excel-style table */}
        <div className="overflow-x-auto border border-slate-400 mb-6">
          <table className="w-full border-collapse text-[12px] text-center">
            <thead>
              <tr className="bg-[#FFFF99] text-slate-900 font-bold border-b border-slate-400">
                <th className="p-2 border-r border-slate-400 w-9 text-center bg-[#FFFF99] print:hidden">
                  <input
                    type="checkbox"
                    checked={areAllSelected}
                    onChange={(e) => onSelectAllRows?.(allSelectableRows, e.target.checked)}
                    className="cursor-pointer accent-[#005325] w-3.5 h-3.5"
                    title="Chọn tất cả để phản hồi"
                  />
                </th>
                <th className="p-2 border-r border-slate-400 w-10">TT</th>
                <th className="p-2 border-r border-slate-400 min-w-[120px]">Lớp phụ trách</th>
                <th className="p-2 border-r border-slate-400 text-left min-w-[200px]">Khóa / Ngành đào tạo</th>
                <th className="p-2 border-r border-slate-400 w-16">Sĩ số SV</th>
                <th className="p-2 border-r border-slate-400 min-w-[120px]">Học kỳ phụ trách</th>
                <th className="p-2 border-r border-slate-400 min-w-[140px]">Xếp loại CVHT</th>
                <th className="p-2 border-r border-slate-400 w-24">Số tiết QC</th>
                <th className="p-2 border-r border-slate-400 text-left min-w-[190px]">Căn cứ Quyết định</th>
                <th className="p-2 border-r border-slate-400 text-left min-w-[170px]">Ghi chú nhiệm vụ</th>
                <th className="p-2 border-r border-slate-400 text-left min-w-[150px]">Xác nhận CTSV</th>
                <th className="p-2 w-10 print:hidden">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {advisorRows.map((row, idx) => (
                <tr key={row.id} className="border-b border-slate-300 hover:bg-slate-50/50">
                  <td className="p-2 border-r border-slate-300 text-center print:hidden">
                    <input
                      type="checkbox"
                      checked={selectedRowIds.includes(row.id)}
                      onChange={() =>
                        onToggleSelectRow?.({
                          rowId: row.id,
                          tt: row.tt,
                          title: `Cố vấn lớp ${row.lopCVHT}`,
                          subtitle: `${row.khoaNganh} · ${row.dotPhuTrach}`,
                          khoiLuong: `${row.soTietDinhMucQC} tiết QC`,
                        })
                      }
                      className="cursor-pointer accent-[#005325] w-3.5 h-3.5"
                      title={`Chọn dòng ${row.tt} để phản hồi`}
                    />
                  </td>
                  <td className="p-2 border-r border-slate-300 font-semibold">{row.tt}</td>
                  <td className="p-2 border-r border-slate-300 font-mono font-bold text-slate-800">
                    <input
                      type="text"
                      value={row.lopCVHT}
                      onChange={(e) => handleCellChange(idx, 'lopCVHT', e.target.value)}
                      className="w-full bg-transparent focus:outline-none focus:bg-amber-50 text-center font-bold"
                    />
                  </td>
                  <td className="p-2 border-r border-slate-300 text-left">
                    <input
                      type="text"
                      value={row.khoaNganh}
                      onChange={(e) => handleCellChange(idx, 'khoaNganh', e.target.value)}
                      className="w-full bg-transparent focus:outline-none text-left"
                    />
                  </td>
                  <td className="p-2 border-r border-slate-300 bg-amber-50/60 font-mono">
                    <input
                      type="number"
                      value={row.soSinhVien}
                      onChange={(e) => handleCellChange(idx, 'soSinhVien', e.target.value)}
                      className="w-full bg-transparent text-center focus:outline-none font-bold text-slate-800"
                    />
                  </td>
                  <td className="p-2 border-r border-slate-300">
                    <input
                      type="text"
                      value={row.dotPhuTrach}
                      onChange={(e) => handleCellChange(idx, 'dotPhuTrach', e.target.value)}
                      className="w-full bg-transparent focus:outline-none text-center"
                    />
                  </td>
                  <td className="p-2 border-r border-slate-300 bg-amber-50/60">
                    <input
                      type="text"
                      value={row.xepLoai}
                      onChange={(e) => handleCellChange(idx, 'xepLoai', e.target.value)}
                      className="w-full bg-transparent text-center focus:outline-none font-semibold text-slate-800"
                    />
                  </td>
                  <td className="p-2 border-r border-slate-300 bg-emerald-50 font-bold text-[#005325] font-mono text-right pr-3">
                    <input
                      type="text"
                      value={row.soTietDinhMucQC}
                      onChange={(e) => handleCellChange(idx, 'soTietDinhMucQC', e.target.value)}
                      className="w-full bg-transparent text-right focus:outline-none font-bold text-[#005325]"
                    />
                  </td>
                  <td className="p-2 border-r border-slate-300 text-left">
                    <input
                      type="text"
                      value={row.quyetDinhPhanCong}
                      onChange={(e) => handleCellChange(idx, 'quyetDinhPhanCong', e.target.value)}
                      className="w-full bg-transparent focus:outline-none text-left italic text-slate-600 text-[11px]"
                    />
                  </td>
                  <td className="p-2 border-r border-slate-300 text-left">
                    <input
                      type="text"
                      value={row.ghiChu}
                      onChange={(e) => handleCellChange(idx, 'ghiChu', e.target.value)}
                      className="w-full bg-transparent focus:outline-none text-left text-slate-700 text-[11.5px]"
                    />
                  </td>
                  <td className="p-2 border-r border-slate-300 text-left text-slate-700 text-[11.5px]">
                    <input
                      type="text"
                      value={row.xacNhanCTSV}
                      onChange={(e) => handleCellChange(idx, 'xacNhanCTSV', e.target.value)}
                      className="w-full bg-transparent focus:outline-none text-left font-medium"
                    />
                  </td>
                  <td className="p-1 text-center print:hidden">
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(idx)}
                      className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                      title="Xóa dòng này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Summary Total Row */}
              <tr className="bg-slate-100 font-bold text-[12.5px] border-t-2 border-slate-500">
                <td colSpan={4} className="p-2.5 text-center text-[#005325] uppercase tracking-wide border-r border-slate-400">
                  TỔNG CỘNG CÔNG TÁC CỐ VẤN HỌC TẬP:
                </td>
                <td className="p-2.5 text-center border-r border-slate-400 font-mono text-slate-900">
                  {totalSV} SV
                </td>
                <td colSpan={2} className="p-2.5 text-center border-r border-slate-400 font-mono text-slate-900">
                  -
                </td>
                <td className="p-2.5 text-right pr-3 border-r border-slate-400 font-mono text-[#005325] text-[13.5px]">
                  {totalQC > 0 ? totalQC.toLocaleString('vi-VN') : '-'}
                </td>
                <td colSpan={3} className="p-2.5 text-left text-[11.5px] font-normal italic text-slate-600">
                  Định mức tiết chuẩn CVHT đã đối soát hợp lệ với Phòng Công tác sinh viên
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Official Signatures Block */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-[12.5px] mt-8 pt-4 border-t border-slate-200">
          <div className="space-y-1">
            <p className="font-bold uppercase text-slate-900">GIẢNG VIÊN CVHT</p>
            <p className="text-[11px] italic text-slate-500">(Ký và ghi rõ họ tên)</p>
            <div className="h-16 flex items-end justify-center font-bold text-[#005325]">{hoTen}</div>
          </div>

          <div className="space-y-1">
            <p className="font-bold uppercase text-slate-900">TRƯỞNG BỘ MÔN</p>
            <p className="text-[11px] italic text-slate-500">(Ký và ghi rõ họ tên)</p>
            <div className="h-16 flex items-end justify-center font-medium text-slate-600">Đã duyệt phân công</div>
          </div>

          <div className="space-y-1">
            <p className="font-bold uppercase text-slate-900">TRƯỞNG KHOA / VIỆN</p>
            <p className="text-[11px] italic text-slate-500">(Ký và ghi rõ họ tên)</p>
            <div className="h-16 flex items-end justify-center font-medium text-slate-600">Xác nhận công tác</div>
          </div>

          <div className="space-y-1">
            <p className="font-bold uppercase text-slate-900">PHÒNG CÔNG TÁC SINH VIÊN</p>
            <p className="text-[11px] italic text-slate-500">(Ký và đóng dấu)</p>
            <div className="h-16 flex items-end justify-center font-bold text-[#005325]">Đã đối soát nghiệm thu</div>
          </div>
        </div>
      </div>
    </div>
  );
};

