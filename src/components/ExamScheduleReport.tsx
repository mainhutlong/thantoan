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
  Eye,
  Plus,
  Trash2
} from 'lucide-react';
import XLSX from 'xlsx-js-style';
import { saveWorkbookToFile, stripAcademicTitle } from '../utils/excelTemplateGenerator';

export interface ExamScheduleRow {
  id: string;
  tt: number;
  tenHocPhan: string;
  dotThi: string;
  maLopHocPhan: string;
  soCaCoiThi: number | string;
  soBaiChamThi: number | string;
  soDeThiRa: number | string;
  soGioQuyChuan: number | string;
  ghiChu: string;
  xacNhanTTKT: string;
}

interface ExamScheduleReportProps {
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
}

export const ExamScheduleReport: React.FC<ExamScheduleReportProps> = ({
  maGV = 'TDU00128',
  records,
  allLecturers,
  onSelectLecturer,
  onSaveRecords,
  isModal = false,
  onClose,
  academicYear = '2025 - 2026',
  viewMode,
  onViewModeChange,
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
  const [isEditable, setIsEditable] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [internalViewMode, setInternalViewMode] = useState<'excel_sheet' | 'compact_table'>('excel_sheet');

  const activeViewMode = viewMode || internalViewMode;
  const handleSetViewMode = (mode: 'excel_sheet' | 'compact_table') => {
    setInternalViewMode(mode);
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  useEffect(() => {
    if (firstRec.hoTen) {
      setDonVi(firstRec.khoaBoMon || 'Khoa Công nghệ thông tin');
      setHoTen(stripAcademicTitle(firstRec.hoTen));
    }
  }, [firstRec]);

  const initRows = (): ExamScheduleRow[] => {
    const examRecs = lecturerRecords.filter((r) => r.phongBanQuanLy === 'khao_thi');
    if (examRecs.length > 0) {
      return examRecs.map((r, i) => ({
        id: r.id || `exam-${i + 1}`,
        tt: i + 1,
        tenHocPhan: r.tenHocPhan || r.tenCongViec || 'Hệ thống thông tin doanh nghiệp',
        dotThi: r.dotThanhToan || 'Học kỳ 1 2026-2027',
        maLopHocPhan: r.maLopHocPhan || 'CNTT14A',
        soCaCoiThi: r.soLuong || 4,
        soBaiChamThi: r.soTietTH || 120,
        soDeThiRa: r.soTietLT || 2,
        soGioQuyChuan: r.tongTietQC || 34,
        ghiChu: r.ghiChu || 'Coi thi tập trung & chấm tự luận',
        xacNhanTTKT: 'Đã đối soát khớp phòng thi',
      }));
    }

    return [
      {
        id: 'exam-1',
        tt: 1,
        tenHocPhan: 'Phát triển Hệ thống Thông tin Doanh nghiệp',
        dotThi: 'Học kỳ 1 2026-2027',
        maLopHocPhan: 'CNTT14A_TDU',
        soCaCoiThi: 4,
        soBaiChamThi: 120,
        soDeThiRa: 2,
        soGioQuyChuan: 34,
        ghiChu: 'Coi thi ca sáng + Chấm thi tự luận',
        xacNhanTTKT: 'Khớp danh sách túi bài thi',
      },
      {
        id: 'exam-2',
        tt: 2,
        tenHocPhan: 'Lập trình Ứng dụng Di động Flutter',
        dotThi: 'Học kỳ 1 2026-2027',
        maLopHocPhan: 'CNTT15A_TDU',
        soCaCoiThi: 6,
        soBaiChamThi: 95,
        soDeThiRa: 1,
        soGioQuyChuan: 28.5,
        ghiChu: 'Coi thi thực hành phòng máy',
        xacNhanTTKT: 'Khớp biên bản thi thực hành',
      },
      {
        id: 'exam-3',
        tt: 3,
        tenHocPhan: 'Kiến trúc & Thiết kế Phần mềm',
        dotThi: 'Học kỳ 1 2026-2027',
        maLopHocPhan: 'CNTT14B_TDU',
        soCaCoiThi: 2,
        soBaiChamThi: 80,
        soDeThiRa: 2,
        soGioQuyChuan: 22,
        ghiChu: 'Ra đề tự luận + Chấm thi tập trung',
        xacNhanTTKT: 'Đã nhận đủ bài và phiếu điểm',
      },
    ];
  };

  const [examRows, setExamRows] = useState<ExamScheduleRow[]>(initRows);

  useEffect(() => {
    setExamRows(initRows());
  }, [maGV, records]);

  const handleCellChange = (index: number, field: keyof ExamScheduleRow, value: string) => {
    const updated = [...examRows];
    updated[index] = { ...updated[index], [field]: value };
    // Auto calculate soGioQuyChuan if numeric: coi thi (1.5h/ca) + cham thi (0.2h/bai) + ra de (3h/de)
    const coi = parseFloat(String(updated[index].soCaCoiThi).replace(',', '.')) || 0;
    const cham = parseFloat(String(updated[index].soBaiChamThi).replace(',', '.')) || 0;
    const de = parseFloat(String(updated[index].soDeThiRa).replace(',', '.')) || 0;
    if (field === 'soCaCoiThi' || field === 'soBaiChamThi' || field === 'soDeThiRa') {
      const qc = Math.round((coi * 1.5 + cham * 0.2 + de * 3.0) * 10) / 10;
      updated[index].soGioQuyChuan = qc > 0 ? qc : updated[index].soGioQuyChuan;
    }
    setExamRows(updated);
  };

  const totalCoiThi = useMemo(() => {
    return examRows.reduce((sum, r) => sum + (parseFloat(String(r.soCaCoiThi).replace(',', '.')) || 0), 0);
  }, [examRows]);

  const totalChamThi = useMemo(() => {
    return examRows.reduce((sum, r) => sum + (parseFloat(String(r.soBaiChamThi).replace(',', '.')) || 0), 0);
  }, [examRows]);

  const totalDeThi = useMemo(() => {
    return examRows.reduce((sum, r) => sum + (parseFloat(String(r.soDeThiRa).replace(',', '.')) || 0), 0);
  }, [examRows]);

  const totalQC = useMemo(() => {
    return examRows.reduce((sum, r) => sum + (parseFloat(String(r.soGioQuyChuan).replace(',', '.')) || 0), 0);
  }, [examRows]);

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const headerRows: (string | number)[][] = [
      ['BẢNG THỐNG KÊ CÔNG TÁC RA ĐỀ, COI THI VÀ CHẤM THI'],
      [`NĂM HỌC ${namHoc}`],
      [],
      ['Đơn vị:', donVi, '', '', '', '', '', 'Lưu ý: Quý Thầy/Cô kiểm tra các ca coi thi, túi bài thi đã nộp,'],
      ['Họ tên giảng viên:', hoTen, '', '', '', '', '', 'Số giờ quy chuẩn được tính tự động theo định mức nội bộ TDU'],
      ['Chức danh:', chucDanh],
      ['Ngạch giảng viên:', ngachGV],
      ['Năm học:', namHoc],
      [],
      ['BẢNG CHI TIẾT NHIỆM VỤ KHẢO THÍ & ĐBCL'],
      [
        'TT',
        'Tên học phần thi',
        'Lớp học phần',
        'Đợt thi / Học kỳ',
        'Số ca coi thi',
        'Số bài chấm thi',
        'Số đề thi ra',
        'Số giờ QC quy đổi',
        'Ghi chú nhiệm vụ',
        'Xác nhận của TT Khảo thí',
      ],
    ];

    examRows.forEach((r) => {
      headerRows.push([
        r.tt,
        r.tenHocPhan,
        r.maLopHocPhan,
        r.dotThi,
        r.soCaCoiThi,
        r.soBaiChamThi,
        r.soDeThiRa,
        r.soGioQuyChuan,
        r.ghiChu,
        r.xacNhanTTKT,
      ]);
    });

    headerRows.push([
      'Tổng cộng',
      '',
      '',
      '',
      totalCoiThi,
      totalChamThi,
      totalDeThi,
      totalQC > 0 ? totalQC : '-',
      '',
      'Đã hoàn thành đầy đủ',
    ]);

    const ws = XLSX.utils.aoa_to_sheet(headerRows);

    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
    ];

    ws['!cols'] = [
      { wch: 6 },
      { wch: 38 },
      { wch: 18 },
      { wch: 20 },
      { wch: 14 },
      { wch: 16 },
      { wch: 14 },
      { wch: 18 },
      { wch: 30 },
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
            alignment: { vertical: 'center', horizontal: C >= 4 && C <= 7 ? 'right' : 'left' },
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
              horizontal: C === 0 || C === 2 || C === 3 ? 'center' : C >= 4 && C <= 7 ? 'right' : 'left',
            },
            border: thinBorder,
          };
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, 'ThongKeKhaoThi');
    saveWorkbookToFile(wb, `Bang_Thong_Ke_Khao_Thi_${hoTen.replace(/\s+/g, '_')}_${namHoc.replace(/\s+/g, '')}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    if (onSaveRecords) {
      const updatedTeachingRecords: TeachingRecord[] = examRows.map((r, idx) => ({
        id: r.id,
        tt: idx + 1,
        maGV,
        hoTen,
        ngaySinh: firstRec.ngaySinh || '18/09/1982',
        soCCCD: firstRec.soCCCD || '092082001245',
        hocHamHocVi: chucDanh,
        khoaBoMon: donVi,
        phongBanQuanLy: 'khao_thi',
        loaiHoatDong: 'Coi thi, chấm thi & ra đề',
        tenHocPhan: r.tenHocPhan,
        maLopHocPhan: r.maLopHocPhan,
        soLuong: Number(r.soCaCoiThi) || 0,
        soTietTH: Number(r.soBaiChamThi) || 0,
        soTietLT: Number(r.soDeThiRa) || 0,
        tongTietQC: Number(r.soGioQuyChuan) || 0,
        donGiaTiet: 150000,
        tongTienThuLao: (Number(r.soGioQuyChuan) || 0) * 150000,
        thueTNCN: (Number(r.soGioQuyChuan) || 0) * 15000,
        thucNhan: (Number(r.soGioQuyChuan) || 0) * 135000,
        soTaiKhoan: firstRec.soTaiKhoan || '102874639912',
        nganHang: firstRec.nganHang || 'VietinBank CN Cần Thơ',
        dotThanhToan: r.dotThi,
        trangThai: 'hop_le',
        ghiChu: r.ghiChu,
      }));
      onSaveRecords(updatedTeachingRecords);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleAddRow = () => {
    const newRow: ExamScheduleRow = {
      id: `exam-${Date.now()}`,
      tt: examRows.length + 1,
      tenHocPhan: 'Môn thi mới',
      dotThi: 'Học kỳ 1 2026-2027',
      maLopHocPhan: 'LHP_MOI',
      soCaCoiThi: 2,
      soBaiChamThi: 60,
      soDeThiRa: 1,
      soGioQuyChuan: 18,
      ghiChu: 'Bổ sung ca thi',
      xacNhanTTKT: 'Chờ duyệt',
    };
    setExamRows([...examRows, newRow]);
  };

  const handleDeleteRow = (index: number) => {
    if (examRows.length <= 1) {
      alert('Bảng kê cần tối thiểu 1 dòng dữ liệu.');
      return;
    }
    const updated = examRows.filter((_, i) => i !== index).map((r, i) => ({ ...r, tt: i + 1 }));
    setExamRows(updated);
  };

  return (
    <div className="w-full bg-slate-100 min-h-screen py-4 px-2 sm:px-4 font-sans text-slate-800">
      {/* 1. Header Toolbar */}
      <div className="max-w-[1180px] mx-auto bg-white rounded-xl shadow-xs border border-slate-200 p-3 mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-emerald-50 text-[#005325] px-3 py-1.5 rounded-lg border border-emerald-200 text-xs font-semibold">
            <FileSpreadsheet className="w-4 h-4 text-[#005325]" />
            <span>KHẢO THÍ & ĐBCL · BẢNG THỐNG KÊ CHI TIẾT</span>
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
            <span>Thêm ca/môn</span>
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
            <Download className="w-3.5 h-3.5 text-emerald-600" />
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
        {/* Paper Top Title */}
        <div className="text-center space-y-1 mb-6">
          <h2 className="text-[17px] font-bold uppercase tracking-wide">TRƯỜNG ĐẠI HỌC TÂY ĐÔ</h2>
          <h3 className="text-[14px] font-semibold text-slate-700 uppercase">TRUNG TÂM KHẢO THÍ & ĐẢM BẢO CHẤT LƯỢNG</h3>
          <div className="w-36 h-0.5 bg-slate-400 mx-auto my-2" />
          <h1 className="text-[19px] font-extrabold uppercase text-[#005325] pt-2 tracking-wide">
            BẢNG THỐNG KÊ CÔNG TÁC RA ĐỀ, COI THI VÀ CHẤM THI
          </h1>
          <p className="text-[13px] italic font-medium text-slate-600">NĂM HỌC {namHoc}</p>
        </div>

        {/* Lecturer Meta Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-[13px] mb-6 p-4 bg-slate-50/70 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-bold min-w-[130px]">Đơn vị (Khoa/BM):</span>
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
          <span>DANH SÁCH CHI TIẾT CÔNG TÁC KHẢO THÍ ĐÃ THỰC HIỆN:</span>
          <span className="text-[11px] font-normal italic text-slate-500 normal-case">
            * Các ô màu vàng có thể chỉnh sửa trực tiếp số ca, bài và giờ quy chuẩn
          </span>
        </div>

        {/* Excel-style table */}
        <div className="overflow-x-auto border border-slate-400 mb-6">
          <table className="w-full border-collapse text-[12px] text-center">
            <thead>
              <tr className="bg-[#FFFF99] text-slate-900 font-bold border-b border-slate-400">
                <th className="p-2 border-r border-slate-400 w-10">TT</th>
                <th className="p-2 border-r border-slate-400 text-left min-w-[200px]">Tên học phần thi</th>
                <th className="p-2 border-r border-slate-400 min-w-[100px]">Lớp HP</th>
                <th className="p-2 border-r border-slate-400 min-w-[110px]">Đợt thi</th>
                <th className="p-2 border-r border-slate-400 w-20">Số ca coi thi</th>
                <th className="p-2 border-r border-slate-400 w-20">Số bài chấm</th>
                <th className="p-2 border-r border-slate-400 w-20">Số đề thi ra</th>
                <th className="p-2 border-r border-slate-400 w-24">Số giờ QC quy đổi</th>
                <th className="p-2 border-r border-slate-400 text-left min-w-[160px]">Ghi chú</th>
                <th className="p-2 border-r border-slate-400 text-left min-w-[140px]">Xác nhận TT Khảo thí</th>
                <th className="p-2 w-10 print:hidden">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {examRows.map((row, idx) => (
                <tr key={row.id} className="border-b border-slate-300 hover:bg-slate-50/50">
                  <td className="p-2 border-r border-slate-300 font-semibold">{row.tt}</td>
                  <td className="p-2 border-r border-slate-300 text-left">
                    <input
                      type="text"
                      value={row.tenHocPhan}
                      onChange={(e) => handleCellChange(idx, 'tenHocPhan', e.target.value)}
                      className="w-full bg-transparent focus:outline-none focus:bg-amber-50 text-left"
                    />
                  </td>
                  <td className="p-2 border-r border-slate-300">
                    <input
                      type="text"
                      value={row.maLopHocPhan}
                      onChange={(e) => handleCellChange(idx, 'maLopHocPhan', e.target.value)}
                      className="w-full bg-transparent focus:outline-none focus:bg-amber-50 text-center font-mono text-[11px]"
                    />
                  </td>
                  <td className="p-2 border-r border-slate-300">
                    <input
                      type="text"
                      value={row.dotThi}
                      onChange={(e) => handleCellChange(idx, 'dotThi', e.target.value)}
                      className="w-full bg-transparent focus:outline-none focus:bg-amber-50 text-center"
                    />
                  </td>
                  <td className="p-2 border-r border-slate-300 bg-amber-50/60 font-mono">
                    <input
                      type="number"
                      value={row.soCaCoiThi}
                      onChange={(e) => handleCellChange(idx, 'soCaCoiThi', e.target.value)}
                      className="w-full bg-transparent text-center focus:outline-none font-bold text-slate-800"
                    />
                  </td>
                  <td className="p-2 border-r border-slate-300 bg-amber-50/60 font-mono">
                    <input
                      type="number"
                      value={row.soBaiChamThi}
                      onChange={(e) => handleCellChange(idx, 'soBaiChamThi', e.target.value)}
                      className="w-full bg-transparent text-center focus:outline-none font-bold text-slate-800"
                    />
                  </td>
                  <td className="p-2 border-r border-slate-300 bg-amber-50/60 font-mono">
                    <input
                      type="number"
                      value={row.soDeThiRa}
                      onChange={(e) => handleCellChange(idx, 'soDeThiRa', e.target.value)}
                      className="w-full bg-transparent text-center focus:outline-none font-bold text-slate-800"
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
                      value={row.ghiChu}
                      onChange={(e) => handleCellChange(idx, 'ghiChu', e.target.value)}
                      className="w-full bg-transparent focus:outline-none text-left italic text-slate-600 text-[11px]"
                    />
                  </td>
                  <td className="p-2 border-r border-slate-300 text-left text-slate-700 text-[11.5px]">
                    <input
                      type="text"
                      value={row.xacNhanTTKT}
                      onChange={(e) => handleCellChange(idx, 'xacNhanTTKT', e.target.value)}
                      className="w-full bg-transparent focus:outline-none text-left"
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
                  TỔNG CỘNG CÔNG TÁC KHẢO THÍ:
                </td>
                <td className="p-2.5 text-center border-r border-slate-400 font-mono text-slate-900">
                  {totalCoiThi}
                </td>
                <td className="p-2.5 text-center border-r border-slate-400 font-mono text-slate-900">
                  {totalChamThi}
                </td>
                <td className="p-2.5 text-center border-r border-slate-400 font-mono text-slate-900">
                  {totalDeThi}
                </td>
                <td className="p-2.5 text-right pr-3 border-r border-slate-400 font-mono text-[#005325] text-[13.5px]">
                  {totalQC > 0 ? totalQC.toLocaleString('vi-VN') : '-'}
                </td>
                <td colSpan={3} className="p-2.5 text-left text-[11.5px] font-normal italic text-slate-600">
                  Giờ quy chuẩn thanh toán đã đối soát khớp với Trung tâm Khảo thí
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
            <div className="h-16 flex items-end justify-center font-medium text-slate-600">Đã duyệt chuyên môn</div>
          </div>

          <div className="space-y-1">
            <p className="font-bold uppercase text-slate-900">TRƯỞNG KHOA / ĐƠN VỊ</p>
            <p className="text-[11px] italic text-slate-500">(Ký và ghi rõ họ tên)</p>
            <div className="h-16 flex items-end justify-center font-medium text-slate-600">Xác nhận công tác</div>
          </div>

          <div className="space-y-1">
            <p className="font-bold uppercase text-slate-900">TT KHẢO THÍ & ĐBCL</p>
            <p className="text-[11px] italic text-slate-500">(Ký và đóng dấu)</p>
            <div className="h-16 flex items-end justify-center font-bold text-[#005325]">Đã đối soát chi trả</div>
          </div>
        </div>
      </div>
    </div>
  );
};

