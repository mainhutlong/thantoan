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

export interface AdmissionScheduleRow {
  id: string;
  tt: number;
  noiDung: string;
  diaBan: string;
  soNgay: number | string;
  vaiTro: string;
  soGioQuyChuan: number | string;
  canCuPhanCong: string;
  ghiChu: string;
  xacNhanPhongTS: string;
}

interface AdmissionScheduleReportProps {
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

export const AdmissionScheduleReport: React.FC<AdmissionScheduleReportProps> = ({
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

  const initRows = (): AdmissionScheduleRow[] => {
    const tsRecs = lecturerRecords.filter((r) => r.phongBanQuanLy === 'tuyen_sinh');
    if (tsRecs.length > 0) {
      return tsRecs.map((r, i) => ({
        id: r.id || `admission-${i + 1}`,
        tt: i + 1,
        noiDung: r.tenHocPhan || 'Tư vấn hướng nghiệp & Ngày hội Tuyển sinh ĐBSCL',
        diaBan: r.ghiChu || 'Cụm trường THPT Hậu Giang & Sóc Trăng',
        soNgay: r.soNgayCongTac || r.soLuong || 3,
        vaiTro: 'Trưởng đoàn tư vấn',
        soGioQuyChuan: r.tongTietQC || 24,
        canCuPhanCong: 'Theo Kế hoạch tuyển sinh số 42/KH-ĐHTĐ',
        ghiChu: 'Tư vấn khối ngành Kỹ thuật - Công nghệ & CNTT',
        xacNhanPhongTS: 'Đã hoàn thành công tác và nộp phiếu đăng ký xét tuyển',
      }));
    }

    return [
      {
        id: 'admission-1',
        tt: 1,
        noiDung: 'Tư vấn hướng nghiệp trực tiếp tại các trường THPT trọng điểm',
        diaBan: 'Cụm trường THPT Tỉnh Hậu Giang (TP. Vị Thanh, Phụng Hiệp)',
        soNgay: 3,
        vaiTro: 'Trưởng đoàn tư vấn',
        soGioQuyChuan: 24,
        canCuPhanCong: 'QĐ phân công số 78/QĐ-ĐHTĐ',
        ghiChu: 'Tư vấn tại 6 trường THPT',
        xacNhanPhongTS: 'Đã hoàn thành xuất sắc nhiệm vụ',
      },
      {
        id: 'admission-2',
        tt: 2,
        noiDung: 'Trực gian hàng tư vấn Ngày hội Tuyển sinh - Hướng nghiệp Báo Tuổi Trẻ',
        diaBan: 'Khuôn viên Trường Đại học Cần Thơ',
        soNgay: 1,
        vaiTro: 'Báo cáo viên chuyên môn',
        soGioQuyChuan: 8,
        canCuPhanCong: 'Kế hoạch số 105/KH-TS',
        ghiChu: 'Tư vấn chuyên sâu nhóm ngành CNTT & AI',
        xacNhanPhongTS: 'Đạt chỉ tiêu tư vấn trực tiếp',
      },
    ];
  };

  const [admissionRows, setAdmissionRows] = useState<AdmissionScheduleRow[]>(initRows);

  useEffect(() => {
    setAdmissionRows(initRows());
  }, [maGV, records]);

  const handleCellChange = (index: number, field: keyof AdmissionScheduleRow, value: string) => {
    const updated = [...admissionRows];
    updated[index] = { ...updated[index], [field]: value };
    setAdmissionRows(updated);
  };

  const totalNgay = useMemo(() => {
    return admissionRows.reduce((sum, r) => sum + (parseFloat(String(r.soNgay).replace(',', '.')) || 0), 0);
  }, [admissionRows]);

  const totalQC = useMemo(() => {
    return admissionRows.reduce((sum, r) => sum + (parseFloat(String(r.soGioQuyChuan).replace(',', '.')) || 0), 0);
  }, [admissionRows]);

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const headerRows: (string | number)[][] = [
      ['BẢNG THỐNG KÊ CÔNG TÁC TƯ VẤN TUYỂN SINH & HƯỚNG NGHIỆP'],
      [`NĂM HỌC ${namHoc}`],
      [],
      ['Đơn vị:', donVi, '', '', '', 'Lưu ý: Quý Thầy/Cô kiểm tra số ngày công tác, địa bàn'],
      ['Họ tên giảng viên:', hoTen, '', '', '', 'và quyết định cử đoàn của Ban Giám hiệu'],
      ['Chức danh:', chucDanh],
      ['Ngạch giảng viên:', ngachGV],
      ['Năm học:', namHoc],
      [],
      ['BẢNG CHI TIẾT CÔNG TÁC TUYỂN SINH & TRUYỀN THÔNG'],
      [
        'TT',
        'Nội dung hoạt động tuyển sinh',
        'Địa bàn / Cụm trường THPT',
        'Số ngày',
        'Vai trò',
        'Số giờ QC quy đổi',
        'Căn cứ Quyết định',
        'Ghi chú nhiệm vụ',
        'Xác nhận Phòng TS & TT',
      ],
    ];

    admissionRows.forEach((r) => {
      headerRows.push([
        r.tt,
        r.noiDung,
        r.diaBan,
        r.soNgay,
        r.vaiTro,
        r.soGioQuyChuan,
        r.canCuPhanCong,
        r.ghiChu,
        r.xacNhanPhongTS,
      ]);
    });

    headerRows.push([
      'Tổng cộng',
      '',
      '',
      totalNgay,
      '',
      totalQC > 0 ? totalQC : '-',
      '',
      '',
      'Đã hoàn thành công tác',
    ]);

    const ws = XLSX.utils.aoa_to_sheet(headerRows);

    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
    ];

    ws['!cols'] = [
      { wch: 6 },
      { wch: 42 },
      { wch: 32 },
      { wch: 12 },
      { wch: 22 },
      { wch: 18 },
      { wch: 28 },
      { wch: 30 },
      { wch: 26 },
    ];

    const thinBorder = {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } },
    };

    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:I30');
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
            alignment: { vertical: 'center', horizontal: C === 5 ? 'right' : 'left' },
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
              horizontal: C === 0 || C === 3 || C === 4 ? 'center' : C === 5 ? 'right' : 'left',
            },
            border: thinBorder,
          };
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, 'ThongKeTuyenSinh');
    saveWorkbookToFile(wb, `Bang_Thong_Ke_Tuyen_Sinh_${hoTen.replace(/\s+/g, '_')}_${namHoc.replace(/\s+/g, '')}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    if (onSaveRecords) {
      const updatedTeachingRecords: TeachingRecord[] = admissionRows.map((r, idx) => ({
        id: r.id,
        tt: idx + 1,
        maGV,
        hoTen,
        ngaySinh: firstRec.ngaySinh || '18/09/1982',
        soCCCD: firstRec.soCCCD || '092082001245',
        hocHamHocVi: chucDanh,
        khoaBoMon: donVi,
        phongBanQuanLy: 'tuyen_sinh',
        loaiHoatDong: 'Tư vấn tuyển sinh & truyền thông',
        tenHocPhan: r.noiDung,
        maLopHocPhan: 'TS_2026_2027',
        soLuong: Number(r.soNgay) || 0,
        soNgayCongTac: Number(r.soNgay) || 0,
        tongTietQC: Number(r.soGioQuyChuan) || 0,
        donGiaTiet: 150000,
        tongTienThuLao: (Number(r.soGioQuyChuan) || 0) * 150000,
        thueTNCN: (Number(r.soGioQuyChuan) || 0) * 15000,
        thucNhan: (Number(r.soGioQuyChuan) || 0) * 135000,
        soTaiKhoan: firstRec.soTaiKhoan || '102874639912',
        nganHang: firstRec.nganHang || 'VietinBank CN Cần Thơ',
        dotThanhToan: academicYear,
        trangThai: 'hop_le',
        ghiChu: `${r.diaBan} - ${r.canCuPhanCong}`,
      }));
      onSaveRecords(updatedTeachingRecords);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleAddRow = () => {
    const newRow: AdmissionScheduleRow = {
      id: `admission-${Date.now()}`,
      tt: admissionRows.length + 1,
      noiDung: 'Tư vấn hướng nghiệp đợt bổ sung',
      diaBan: 'Cụm trường THPT tỉnh Cần Thơ',
      soNgay: 2,
      vaiTro: 'Thành viên đoàn',
      soGioQuyChuan: 16,
      canCuPhanCong: 'Kế hoạch bổ sung số 12/KH-TS',
      ghiChu: 'Tư vấn đợt 2',
      xacNhanPhongTS: 'Chờ duyệt',
    };
    setAdmissionRows([...admissionRows, newRow]);
  };

  const handleDeleteRow = (index: number) => {
    if (admissionRows.length <= 1) {
      alert('Bảng kê cần tối thiểu 1 dòng dữ liệu.');
      return;
    }
    const updated = admissionRows.filter((_, i) => i !== index).map((r, i) => ({ ...r, tt: i + 1 }));
    setAdmissionRows(updated);
  };

  const allSelectableRows = useMemo(() => {
    return admissionRows.map((r) => ({
      rowId: r.id,
      tt: r.tt,
      title: r.noiDung || 'Hoạt động tuyển sinh',
      subtitle: `${r.diaBan} · ${r.vaiTro}`,
      khoiLuong: `${r.soGioQuyChuan} giờ QC`,
    }));
  }, [admissionRows]);

  const areAllSelected =
    allSelectableRows.length > 0 &&
    allSelectableRows.every((r) => selectedRowIds.includes(r.rowId));

  return (
    <div className="w-full bg-slate-100 min-h-screen py-4 px-2 sm:px-4 font-sans text-slate-800">
      {/* 1. Header Toolbar */}
      <div className="max-w-[1180px] mx-auto bg-white rounded-xl shadow-xs border border-slate-200 p-3 mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-rose-50 text-rose-800 px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-semibold">
            <FileSpreadsheet className="w-4 h-4 text-rose-700" />
            <span>TUYỂN SINH & TRUYỀN THÔNG · BẢNG THỐNG KÊ CHI TIẾT</span>
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
            <span>Thêm đợt/hoạt động</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className={`h-[32px] px-3 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${saveSuccess
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
            <Download className="w-3.5 h-3.5 text-rose-600" />
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
          <h3 className="text-[14px] font-semibold text-slate-700 uppercase">PHÒNG TUYỂN SINH & TRUYỀN THÔNG</h3>
          <div className="w-36 h-0.5 bg-slate-400 mx-auto my-2" />
          <h1 className="text-[19px] font-extrabold uppercase text-[#005325] pt-2 tracking-wide">
            BẢNG THỐNG KÊ CÔNG TÁC TƯ VẤN TUYỂN SINH & HƯỚNG NGHIỆP
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
          <span>DANH SÁCH CHI TIẾT CÔNG TÁC TUYỂN SINH ĐÃ THAM GIA:</span>
          <span className="text-[11px] font-normal italic text-slate-500 normal-case">
            * Các ô màu vàng có thể chỉnh sửa trực tiếp số ngày công tác và giờ quy chuẩn
          </span>
        </div>

        {/* Excel-style table */}
        <div className="overflow-x-auto border border-slate-400 mb-6">
          <table className="w-full min-w-[800px] border-collapse text-[12px] text-center">
            <thead>
              <tr className="bg-[#FFFF99] text-slate-900 font-bold border-b border-slate-400">
                {Boolean(onToggleSelectRow) && (
                  <th className="p-2 border-r border-slate-400 w-9 text-center bg-[#FFFF99] print:hidden">
                    <input
                      type="checkbox"
                      checked={areAllSelected}
                      onChange={(e) => onSelectAllRows?.(allSelectableRows, e.target.checked)}
                      className="cursor-pointer accent-[#005325] w-3.5 h-3.5"
                      title="Chọn tất cả để phản hồi"
                    />
                  </th>
                )}
                <th className="p-2 border-r border-slate-400 w-10">TT</th>
                <th className="p-2 border-r border-slate-400 text-left min-w-[240px]">Nội dung hoạt động tuyển sinh</th>
                <th className="p-2 border-r border-slate-400 text-left min-w-[200px]">Địa bàn / Cụm trường THPT</th>
                <th className="p-2 border-r border-slate-400 w-20">Số ngày</th>
                <th className="p-2 border-r border-slate-400 min-w-[140px]">Vai trò</th>
                <th className="p-2 border-r border-slate-400 w-24">Số giờ QC</th>
                <th className="p-2 border-r border-slate-400 text-left min-w-[190px]">Căn cứ Quyết định</th>
                <th className="p-2 border-r border-slate-400 text-left min-w-[170px]">Ghi chú nhiệm vụ</th>
                <th className="p-2 border-r border-slate-400 text-left min-w-[160px]">Xác nhận Phòng TS & TT</th>
                <th className="p-2 w-10 print:hidden">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {admissionRows.map((row, idx) => (
                <tr key={row.id} className="border-b border-slate-300 hover:bg-slate-50/50">
                  {Boolean(onToggleSelectRow) && (
                    <td className="p-2 border-r border-slate-300 text-center print:hidden">
                      <input
                        type="checkbox"
                        checked={selectedRowIds.includes(row.id)}
                        onChange={() =>
                          onToggleSelectRow?.({
                            rowId: row.id,
                            tt: row.tt,
                            title: row.noiDung || 'Hoạt động tuyển sinh',
                            subtitle: `${row.diaBan} · ${row.vaiTro}`,
                            khoiLuong: `${row.soGioQuyChuan} giờ QC`,
                          })
                        }
                        className="cursor-pointer accent-[#005325] w-3.5 h-3.5"
                        title={`Chọn dòng ${row.tt} để phản hồi`}
                      />
                    </td>
                  )}
                  <td className="p-2 border-r border-slate-300 font-semibold">{row.tt}</td>
                  <td className="p-2 border-r border-slate-300 text-left font-medium">
                    <input
                      type="text"
                      value={row.noiDung}
                      onChange={(e) => handleCellChange(idx, 'noiDung', e.target.value)}
                      className="w-full bg-transparent focus:outline-none focus:bg-amber-50 text-left"
                    />
                  </td>
                  <td className="p-2 border-r border-slate-300 text-left">
                    <input
                      type="text"
                      value={row.diaBan}
                      onChange={(e) => handleCellChange(idx, 'diaBan', e.target.value)}
                      className="w-full bg-transparent focus:outline-none text-left"
                    />
                  </td>
                  <td className="p-2 border-r border-slate-300 bg-amber-50/60 font-mono">
                    <input
                      type="number"
                      value={row.soNgay}
                      onChange={(e) => handleCellChange(idx, 'soNgay', e.target.value)}
                      className="w-full bg-transparent text-center focus:outline-none font-bold text-slate-800"
                    />
                  </td>
                  <td className="p-2 border-r border-slate-300 bg-amber-50/60">
                    <input
                      type="text"
                      value={row.vaiTro}
                      onChange={(e) => handleCellChange(idx, 'vaiTro', e.target.value)}
                      className="w-full bg-transparent text-center focus:outline-none font-semibold text-slate-800"
                    />
                  </td>
                  <td className="p-2 border-r border-slate-300 bg-emerald-50 font-bold text-[#005325] font-mono text-right pr-3">
                    <input
                      type="text"
                      value={row.soGioQuyChuan}
                      onChange={(e) => handleCellChange(idx, 'soGioQuyChuan', e.target.value)}
                      className="w-full bg-transparent text-right focus:outline-none font-bold text-[#005325]"
                    />
                  </td>
                  <td className="p-2 border-r border-slate-300 text-left">
                    <input
                      type="text"
                      value={row.canCuPhanCong}
                      onChange={(e) => handleCellChange(idx, 'canCuPhanCong', e.target.value)}
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
                      value={row.xacNhanPhongTS}
                      onChange={(e) => handleCellChange(idx, 'xacNhanPhongTS', e.target.value)}
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
                <td colSpan={Boolean(onToggleSelectRow) ? 4 : 3} className="p-2.5 text-center text-[#005325] uppercase tracking-wide border-r border-slate-400">
                  TỔNG CỘNG CÔNG TÁC TUYỂN SINH & TRUYỀN THÔNG:
                </td>
                <td className="p-2.5 text-center border-r border-slate-400 font-mono text-slate-900">
                  {totalNgay} ngày
                </td>
                <td className="p-2.5 text-center border-r border-slate-400 font-mono text-slate-900">
                  -
                </td>
                <td className="p-2.5 text-right pr-3 border-r border-slate-400 font-mono text-[#005325] text-[13.5px]">
                  {totalQC > 0 ? totalQC.toLocaleString('vi-VN') : '-'}
                </td>
                <td colSpan={3} className="p-2.5 text-left text-[11.5px] font-normal italic text-slate-600">
                  Đã đối soát khớp với biên bản công tác và danh sách hồ sơ tuyển sinh
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Official Signatures Block */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-[12.5px] mt-8 pt-4 border-t border-slate-200">
          <div className="space-y-1">
            <p className="font-bold uppercase text-slate-900">GIẢNG VIÊN THỐNG KÊ</p>
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
            <p className="font-bold uppercase text-slate-900">PHÒNG TUYỂN SINH & TT</p>
            <p className="text-[11px] italic text-slate-500">(Ký và đóng dấu)</p>
            <div className="h-16 flex items-end justify-center font-bold text-[#005325]">Đã đối soát nghiệm thu</div>
          </div>
        </div>
      </div>
    </div>
  );
};

