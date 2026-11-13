import React, { useState, useEffect, useMemo } from 'react';
import { TeachingRecord, FeedbackRowInfo } from '../types';
import {
  Printer,
  Download,
  Save,
  CheckCircle2,
  RotateCcw,
  Plus,
  Trash2,
  FileSpreadsheet,
  X,
  Edit3,
  Eye,
  MoreVertical
} from 'lucide-react';
import XLSX from 'xlsx-js-style';
import { saveWorkbookToFile, stripAcademicTitle } from '../utils/excelTemplateGenerator';

export interface TeachingScheduleRow {
  id: string;
  tt: number;
  tenHocPhan: string;
  maLopHocPhan: string;
  soSinhVien: string | number;
  soNhom: string | number;
  soGioMonHoc: string | number;
  soGioThucGiang: string | number;
  heSoLopNhom: string | number;
  heSoTinChi: string | number;
  xacNhanKhoa: string;
  phanLoai: 'ly_thuyet' | 'thuc_hanh_thuc_tap';
}

interface TeachingScheduleReportProps {
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
  compactContent?: React.ReactNode;
  selectedRowIds?: string[];
  onToggleSelectRow?: (row: FeedbackRowInfo) => void;
  onSelectAllRows?: (rows: FeedbackRowInfo[], selectAll: boolean) => void;
  pendingAdjustments?: any[];
  onApproveProposal?: (id?: string) => void;
}

export const TeachingScheduleReport: React.FC<TeachingScheduleReportProps> = ({
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
  compactContent,
  selectedRowIds = [],
  onToggleSelectRow,
  onSelectAllRows,
  pendingAdjustments = [],
  onApproveProposal,
}) => {
  // Find lecturer info
  const lecturerRecords = useMemo(() => {
    return records.filter((r) => r.maGV === maGV);
  }, [records, maGV]);

  const firstRec = lecturerRecords[0] || ({} as Partial<TeachingRecord>);

  // Header info fields
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
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [internalViewMode, setInternalViewMode] = useState<'excel_sheet' | 'compact_table'>('excel_sheet');

  const activeViewMode = viewMode || internalViewMode;
  const handleSetViewMode = (mode: 'excel_sheet' | 'compact_table') => {
    setInternalViewMode(mode);
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  // Sync state if maGV changes
  useEffect(() => {
    if (firstRec.hoTen) {
      setDonVi(firstRec.khoaBoMon || 'Khoa Công nghệ thông tin');
      setHoTen(stripAcademicTitle(firstRec.hoTen));
      const hh = firstRec.hocHamHocVi || '';
      if (hh.includes('GS')) setChucDanh('GIÁO SƯ');
      else if (hh.includes('PGS')) setChucDanh('PHÓ GIÁO SƯ');
      else if (hh.includes('TS')) setChucDanh('TIẾN SĨ');
      else if (hh.includes('ThS')) setChucDanh('THẠC SĨ');
      else setChucDanh('THẠC SĨ');
    }
  }, [maGV, firstRec]);

  // Build initial 10 rows for Lý thuyết and 10 rows for Thực hành
  const initRows = (category: 'ly_thuyet' | 'thuc_hanh_thuc_tap'): TeachingScheduleRow[] => {
    const matching = lecturerRecords.filter(
      (r) => r.phongBanQuanLy === 'dao_tao' && r.phanLoaiGiangDay === category
    );

    const rows: TeachingScheduleRow[] = [];
    const count = Math.max(10, matching.length);

    for (let i = 0; i < count; i++) {
      const match = matching[i];
      if (match) {
        rows.push({
          id: match.id || `${category}-${i + 1}`,
          tt: i + 1,
          tenHocPhan: match.tenHocPhan || '',
          maLopHocPhan: match.maLopHocPhan || '',
          soSinhVien: match.soSinhVien || '',
          soNhom: match.soNhom || 1,
          soGioMonHoc: match.soGioMonHoc || '',
          soGioThucGiang: match.soGioThucGiang || '',
          heSoLopNhom: match.heSoLopNhom || match.heSoLop || '',
          heSoTinChi: match.heSoTinChi || 1.0,
          xacNhanKhoa: 'Đã xác nhận',
          phanLoai: category,
        });
      } else {
        rows.push({
          id: `${category}-empty-${i + 1}`,
          tt: i + 1,
          tenHocPhan: '',
          maLopHocPhan: '',
          soSinhVien: '',
          soNhom: '',
          soGioMonHoc: '',
          soGioThucGiang: '',
          heSoLopNhom: '',
          heSoTinChi: '',
          xacNhanKhoa: '',
          phanLoai: category,
        });
      }
    }
    return rows;
  };

  const [lyThuyetRows, setLyThuyetRows] = useState<TeachingScheduleRow[]>(() => initRows('ly_thuyet'));
  const [thucHanhRows, setThucHanhRows] = useState<TeachingScheduleRow[]>(() => initRows('thuc_hanh_thuc_tap'));

  // Re-sync rows when maGV or records change
  useEffect(() => {
    setLyThuyetRows(initRows('ly_thuyet'));
    setThucHanhRows(initRows('thuc_hanh_thuc_tap'));
  }, [maGV, records]);

  // Helper to calculate quy chuan: (1) * (2) * (3)
  const calculateQC = (row: TeachingScheduleRow): number | null => {
    const g1 = typeof row.soGioThucGiang === 'number' ? row.soGioThucGiang : parseFloat(String(row.soGioThucGiang).replace(',', '.'));
    const g2 = typeof row.heSoLopNhom === 'number' ? row.heSoLopNhom : parseFloat(String(row.heSoLopNhom).replace(',', '.'));
    const g3 = typeof row.heSoTinChi === 'number' ? row.heSoTinChi : parseFloat(String(row.heSoTinChi).replace(',', '.'));

    if (!isNaN(g1) && g1 > 0 && !isNaN(g2) && g2 > 0 && !isNaN(g3) && g3 > 0) {
      return Math.round(g1 * g2 * g3 * 100) / 100;
    }
    return null;
  };

  // Row change handlers
  const handleCellChange = (
    section: 'ly_thuyet' | 'thuc_hanh_thuc_tap',
    index: number,
    field: keyof TeachingScheduleRow,
    value: string
  ) => {
    const updateRows = section === 'ly_thuyet' ? [...lyThuyetRows] : [...thucHanhRows];
    updateRows[index] = {
      ...updateRows[index],
      [field]: value,
    };
    if (section === 'ly_thuyet') {
      setLyThuyetRows(updateRows);
    } else {
      setThucHanhRows(updateRows);
    }
  };

  // Calculate totals
  const totalQCLyThuyet = useMemo(() => {
    return lyThuyetRows.reduce((sum, r) => sum + (calculateQC(r) || 0), 0);
  }, [lyThuyetRows]);

  const totalQCThucHanh = useMemo(() => {
    return thucHanhRows.reduce((sum, r) => sum + (calculateQC(r) || 0), 0);
  }, [thucHanhRows]);

  const grandTotalQC = totalQCLyThuyet + totalQCThucHanh;

  // Feedback row selection: all rows with content
  const allSelectableRows = useMemo(() => {
    const list: FeedbackRowInfo[] = [];
    lyThuyetRows.forEach((r) => {
      if (r.tenHocPhan || r.maLopHocPhan) {
        list.push({
          rowId: r.id,
          tt: r.tt,
          title: r.tenHocPhan || 'Học phần Lý thuyết',
          subtitle: r.maLopHocPhan ? `Lớp ${r.maLopHocPhan}` : undefined,
          khoiLuong: r.soGioThucGiang ? `${r.soGioThucGiang}h` : undefined,
        });
      }
    });
    thucHanhRows.forEach((r) => {
      if (r.tenHocPhan || r.maLopHocPhan) {
        list.push({
          rowId: r.id,
          tt: r.tt,
          title: r.tenHocPhan || 'Học phần Thực hành',
          subtitle: r.maLopHocPhan ? `Lớp ${r.maLopHocPhan}` : undefined,
          khoiLuong: r.soGioThucGiang ? `${r.soGioThucGiang}h` : undefined,
        });
      }
    });
    return list;
  }, [lyThuyetRows, thucHanhRows]);

  const areAllSelected =
    allSelectableRows.length > 0 &&
    allSelectableRows.every((r) => selectedRowIds.includes(r.rowId));

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Export to Excel handler matching the sheet format
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const headerRows: (string | number)[][] = [
      ['BẢNG THỐNG KÊ CÔNG TÁC GIẢNG DẠY'],
      [`NĂM HỌC ${namHoc}`],
      [],
      ['Đơn vị:', donVi, '', '', '', '', '', '', 'Lưu ý: Quý thầy cô nhập thống kê của mình tại những ô màu vàng có ghi chú,'],
      ['Họ tên giảng viên:', hoTen, '', '', '', '', '', '', 'khi nhập xong sẽ đổi màu, đề nghị quý thầy cô nhập đầy đủ'],
      ['Chức danh:', chucDanh],
      ['Ngạch giảng viên:', ngachGV],
      ['Năm học:', namHoc],
      [],
      ['A. GIẢNG DẠY'],
      [
        'TT',
        'Môn giảng dạy',
        'Lớp',
        'Số SV',
        'Số nhóm',
        'Số giờ môn học',
        'Số giờ thực giảng (1)',
        'Hệ số lớp, nhóm (2)',
        'Hệ số tín chỉ (3)',
        'Số giờ quy chuẩn (4)=(1)*(2)*(3)',
        'Xác nhận của Khoa',
      ],
      ['I. LÝ THUYẾT'],
    ];

    lyThuyetRows.forEach((r) => {
      const qc = calculateQC(r);
      headerRows.push([
        r.tt,
        r.tenHocPhan,
        r.maLopHocPhan,
        r.soSinhVien,
        r.soNhom,
        r.soGioMonHoc,
        r.soGioThucGiang,
        r.heSoLopNhom,
        r.heSoTinChi,
        qc !== null ? qc : '-',
        r.xacNhanKhoa,
      ]);
    });

    headerRows.push(['II. THỰC HÀNH, THỰC TẬP']);

    thucHanhRows.forEach((r) => {
      const qc = calculateQC(r);
      headerRows.push([
        r.tt,
        r.tenHocPhan,
        r.maLopHocPhan,
        r.soSinhVien,
        r.soNhom,
        r.soGioMonHoc,
        r.soGioThucGiang,
        r.heSoLopNhom,
        r.heSoTinChi,
        qc !== null ? qc : '-',
        r.xacNhanKhoa,
      ]);
    });

    headerRows.push([
      'Tổng số giờ giảng dạy',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      grandTotalQC > 0 ? grandTotalQC : '-',
      '',
    ]);

    const ws = XLSX.utils.aoa_to_sheet(headerRows);

    // Merge tiêu đề dòng 1 & 2
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 10 } },
    ];

    ws['!cols'] = [
      { wch: 6 },  // TT
      { wch: 36 }, // Môn giảng dạy
      { wch: 18 }, // Lớp
      { wch: 10 }, // Số SV
      { wch: 10 }, // Số nhóm
      { wch: 14 }, // Số giờ MH
      { wch: 18 }, // Số giờ thực giảng (1)
      { wch: 18 }, // Hệ số lớp, nhóm (2)
      { wch: 16 }, // Hệ số tín chỉ (3)
      { wch: 22 }, // Số giờ quy chuẩn (4)
      { wch: 20 }, // Xác nhận của Khoa
    ];

    const thinBorder = {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } },
    };

    // Định dạng font Times New Roman và viền ô chuẩn TDU
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:K30');
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
        } else if (R === 9 || R === 11 || (cell.v && String(cell.v).startsWith('II.'))) {
          cell.s = {
            font: { name: 'Times New Roman', sz: 11, bold: true, color: { rgb: '005325' } },
            alignment: { vertical: 'center', horizontal: 'left' },
          };
        } else if (R === 10) {
          // Table header
          cell.s = {
            font: { name: 'Times New Roman', sz: 10.5, bold: true, color: { rgb: '000000' } },
            fill: { fgColor: { rgb: 'FFFF99' } },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
            border: thinBorder,
          };
        } else if (R === headerRows.length - 1) {
          // Summary row
          cell.s = {
            font: { name: 'Times New Roman', sz: 11, bold: true, color: { rgb: '005325' } },
            fill: { fgColor: { rgb: 'F1F5F9' } },
            alignment: { vertical: 'center', horizontal: C === 9 ? 'right' : 'left' },
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
              horizontal: C === 0 || C === 2 ? 'center' : C >= 3 && C <= 9 ? 'right' : 'left',
            },
            border: thinBorder,
          };
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, 'ThongKeGiangDay');
    saveWorkbookToFile(wb, `Bang_Thong_Ke_Giang_Day_${hoTen.replace(/\s+/g, '_')}_${namHoc.replace(/\s+/g, '')}.xlsx`);
  };

  // Save changes
  const handleSave = () => {
    if (onSaveRecords) {
      // Convert active rows back to teaching records
      const updatedList: TeachingRecord[] = [];

      lyThuyetRows.forEach((r) => {
        if (r.tenHocPhan.trim()) {
          const qc = calculateQC(r) || 0;
          updatedList.push({
            id: r.id.startsWith('ly_thuyet-empty') ? `tdu-tc-lt-${Date.now()}-${r.tt}` : r.id,
            tt: r.tt,
            maGV,
            hoTen,
            ngaySinh: firstRec.ngaySinh || '01/01/1980',
            soCCCD: firstRec.soCCCD || '',
            hocHamHocVi: firstRec.hocHamHocVi || 'ThS',
            khoaBoMon: donVi,
            phongBanQuanLy: 'dao_tao',
            loaiHoatDong: 'Giảng dạy Lý thuyết',
            tenHocPhan: r.tenHocPhan,
            maLopHocPhan: r.maLopHocPhan,
            phanLoaiGiangDay: 'ly_thuyet',
            soSinhVien: Number(r.soSinhVien) || 0,
            soNhom: Number(r.soNhom) || 1,
            soGioMonHoc: Number(r.soGioMonHoc) || 0,
            soGioThucGiang: Number(r.soGioThucGiang) || 0,
            heSoLopNhom: Number(r.heSoLopNhom) || 1.0,
            heSoTinChi: Number(r.heSoTinChi) || 1.0,
            soGioQuyChuan: qc,
            soTinChi: Math.round((Number(r.soGioMonHoc) || 45) / 15),
            soTietLT: Number(r.soGioThucGiang) || 0,
            soTietTH: 0,
            heSoLop: Number(r.heSoLopNhom) || 1.0,
            tongTietQC: qc,
            donGiaTiet: firstRec.donGiaTiet || 140000,
            tongTienThuLao: qc * (firstRec.donGiaTiet || 140000),
            thueTNCN: qc * (firstRec.donGiaTiet || 140000) * 0.1,
            thucNhan: qc * (firstRec.donGiaTiet || 140000) * 0.9,
            soTaiKhoan: firstRec.soTaiKhoan,
            nganHang: firstRec.nganHang,
            nguoiThucHien: 'Phòng Đào tạo TDU',
            trangThai: 'da_so_hoa',
            dotThanhToan: firstRec.dotThanhToan || 'Đợt 1 - Học kỳ 2 (2025 - 2026)',
          });
        }
      });

      thucHanhRows.forEach((r) => {
        if (r.tenHocPhan.trim()) {
          const qc = calculateQC(r) || 0;
          updatedList.push({
            id: r.id.startsWith('thuc_hanh-empty') ? `tdu-tc-th-${Date.now()}-${r.tt}` : r.id,
            tt: r.tt,
            maGV,
            hoTen,
            ngaySinh: firstRec.ngaySinh || '01/01/1980',
            soCCCD: firstRec.soCCCD || '',
            hocHamHocVi: firstRec.hocHamHocVi || 'ThS',
            khoaBoMon: donVi,
            phongBanQuanLy: 'dao_tao',
            loaiHoatDong: 'Giảng dạy Thực hành, thực tập',
            tenHocPhan: r.tenHocPhan,
            maLopHocPhan: r.maLopHocPhan,
            phanLoaiGiangDay: 'thuc_hanh_thuc_tap',
            soSinhVien: Number(r.soSinhVien) || 0,
            soNhom: Number(r.soNhom) || 1,
            soGioMonHoc: Number(r.soGioMonHoc) || 0,
            soGioThucGiang: Number(r.soGioThucGiang) || 0,
            heSoLopNhom: Number(r.heSoLopNhom) || 1.0,
            heSoTinChi: Number(r.heSoTinChi) || 1.0,
            soGioQuyChuan: qc,
            soTinChi: 1,
            soTietLT: 0,
            soTietTH: Number(r.soGioThucGiang) || 0,
            heSoLop: Number(r.heSoLopNhom) || 1.0,
            tongTietQC: qc,
            donGiaTiet: firstRec.donGiaTiet || 140000,
            tongTienThuLao: qc * (firstRec.donGiaTiet || 140000),
            thueTNCN: qc * (firstRec.donGiaTiet || 140000) * 0.1,
            thucNhan: qc * (firstRec.donGiaTiet || 140000) * 0.9,
            soTaiKhoan: firstRec.soTaiKhoan,
            nganHang: firstRec.nganHang,
            nguoiThucHien: 'Phòng Đào tạo TDU',
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

  // Cell style logic: Empty inputs are yellow '#FEF08A' / '#FFFF99'.
  // Filled inputs change color (e.g. to white) as indicated in note: "khi nhập xong sẽ đổi màu"
  const getCellBg = (val: string | number | undefined) => {
    const s = String(val ?? '').trim();
    if (s === '') {
      return 'bg-[#ffff99] hover:bg-[#fff777]'; // Yellow when empty as shown in image
    }
    return 'bg-white hover:bg-slate-50'; // White when filled (changed color)
  };

  return (
    <div className={`w-full max-w-full min-w-0 flex flex-col bg-white ${isModal ? 'p-0' : 'p-3 sm:p-4'}`}>
      {/* 1. TOP ACTION TOOLBAR (Hidden when printing - Sticky so it stays visible when scrolling) */}
      <div className="print:hidden w-full max-w-full min-w-0 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-xl p-2.5 mb-3 flex items-center justify-between gap-2 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <FileSpreadsheet className="w-4 h-4 text-[#005325] shrink-0" />
            <span>Biểu mẫu: Bảng thống kê công tác giảng dạy</span>
          </div>

          {/* Lecturer Selector if provided */}
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
                    {lec.maGV} - {stripAcademicTitle(lec.hoTen)} ({lec.hocHamHocVi})
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
              Đã lưu dữ liệu thành công!
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
                        ? 'text-[#005325] font-semibold bg-emerald-50/50'
                        : 'text-slate-700'
                    }`}
                  >
                    <span>Mẫu Bảng thống kê chuẩn</span>
                    {activeViewMode === 'excel_sheet' && <CheckCircle2 className="w-3.5 h-3.5 text-[#005325]" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSetViewMode('compact_table');
                      setIsViewMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-xs text-left hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors ${
                      activeViewMode === 'compact_table'
                        ? 'text-[#005325] font-semibold bg-emerald-50/50'
                        : 'text-slate-700'
                    }`}
                  >
                    <span>Danh sách rút gọn</span>
                    {activeViewMode === 'compact_table' && <CheckCircle2 className="w-3.5 h-3.5 text-[#005325]" />}
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

      {/* 2. THE EXACT EXCEL SPREADSHEET SHEET OR COMPACT TABLE */}
      {activeViewMode === 'compact_table' && compactContent ? (
        <div className="w-full max-w-full min-w-0 overflow-x-auto bg-white border border-slate-200 rounded-md">
          {compactContent}
        </div>
      ) : (
      <div className="w-full max-w-full min-w-0 bg-white print:p-0 print:overflow-visible">
        <div className="w-full min-w-[760px] mx-auto p-3 sm:p-5 bg-white font-sans text-black border border-slate-300 shadow-xs print:border-none print:shadow-none">
          {/* TITLE CENTERED */}
          <div className="text-center mb-4 pb-2.5 border-b border-slate-200">
            <h1 className="text-[18px] sm:text-[20px] font-bold tracking-wide uppercase text-slate-900 font-sans">
              BẢNG THỐNG KÊ CÔNG TÁC GIẢNG DẠY
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

          {/* SECTION HEADER: A. GIẢNG DẠY */}
          <div className="border-t-2 border-black pt-1 mb-0.5">
            <h3 className="text-[13px] font-bold text-red-600 uppercase tracking-wide">
              A. GIẢNG DẠY
            </h3>
          </div>

          {/* MAIN SPREADSHEET TABLE */}
          <div className="w-full border-t border-black overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse border border-black text-[11.5px]">
              {/* TABLE HEADERS (2 Rows exactly matching image) */}
              <thead>
                <tr className="bg-[#bfbfbf] text-black">
                  {Boolean(onToggleSelectRow) && (
                    <th rowSpan={2} className="w-[30px] px-0.5 py-1 text-center font-normal border border-black bg-[#bfbfbf] print:hidden">
                      <input
                        type="checkbox"
                        checked={areAllSelected}
                        onChange={(e) => onSelectAllRows?.(allSelectableRows, e.target.checked)}
                        className="cursor-pointer accent-[#005325] w-3.5 h-3.5"
                        title="Chọn tất cả để phản hồi"
                      />
                    </th>
                  )}
                  <th rowSpan={2} className="w-[36px] px-1 py-1 text-center font-normal border border-black">
                    TT
                  </th>
                  <th rowSpan={2} className="px-2 py-1 text-center font-normal border border-black min-w-[200px]">
                    Môn<br />giảng dạy
                  </th>
                  <th rowSpan={2} className="w-[120px] px-2 py-1 text-center font-normal border border-black">
                    Lớp
                  </th>
                  <th rowSpan={2} className="w-[50px] px-1 py-1 text-center font-normal border border-black">
                    Số<br />SV
                  </th>
                  <th className="w-[60px] px-1 py-1 text-center font-normal border border-black">
                    Số<br />nhóm
                  </th>
                  <th className="w-[68px] px-1 py-1 text-center font-normal border border-black">
                    Số giờ<br />môn học
                  </th>
                  <th className="w-[75px] px-1 py-1 text-center font-normal border border-black">
                    Số giờ<br />thực giảng
                  </th>
                  <th className="w-[78px] px-1 py-1 text-center font-normal border border-black">
                    Hệ số<br />lớp, nhóm
                  </th>
                  <th className="w-[70px] px-1 py-1 text-center font-normal border border-black">
                    Hệ số<br />tín chỉ
                  </th>
                  <th className="w-[90px] px-1 py-1 text-center font-normal border border-black">
                    Số giờ<br />quy chuẩn
                  </th>
                  <th rowSpan={2} className="w-[95px] px-1 py-1 text-center font-normal border border-black">
                    Xác nhận<br />của Khoa
                  </th>
                </tr>
                {/* Sub-header row with formulas */}
                <tr className="bg-[#bfbfbf] text-black text-[10.5px]">
                  <th className="px-1 py-0.5 text-center font-normal border border-black"></th>
                  <th className="px-1 py-0.5 text-center font-normal border border-black"></th>
                  <th className="px-1 py-0.5 text-center font-normal border border-black">(1)</th>
                  <th className="px-1 py-0.5 text-center font-normal border border-black">(2)</th>
                  <th className="px-1 py-0.5 text-center font-normal border border-black">(3)</th>
                  <th className="px-1 py-0.5 text-center font-normal border border-black whitespace-nowrap">
                    (4)=(1)*(2)*(3)
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* SECTION I. LÝ THUYẾT */}
                <tr className="bg-white">
                  <td colSpan={12} className="px-2 py-1 text-left font-bold text-blue-700 border border-black">
                    I. LÝ THUYẾT
                  </td>
                </tr>

                {lyThuyetRows.map((row, index) => {
                  const qc = calculateQC(row);
                  const matchingProposal = pendingAdjustments.find(
                    (p) =>
                      p.status === 'da_gui' &&
                      (p.targetRecordId === row.id ||
                        (p.originalData &&
                          p.originalData.tenHocPhan === row.tenHocPhan &&
                          p.originalData.maLopHocPhan === row.maLopHocPhan))
                  );
                  return (
                    <React.Fragment key={row.id}>
                      <tr className="h-[25px]">
                        {/* Checkbox trước TT */}
                        {Boolean(onToggleSelectRow) && (
                          <td className="px-0.5 py-0 text-center border border-black bg-white print:hidden">
                            <input
                              type="checkbox"
                              checked={selectedRowIds.includes(row.id)}
                              onChange={() =>
                                onToggleSelectRow?.({
                                  rowId: row.id,
                                  tt: row.tt,
                                  title: row.tenHocPhan || 'Học phần lý thuyết',
                                  subtitle: row.maLopHocPhan ? `Lớp ${row.maLopHocPhan}` : undefined,
                                  khoiLuong: row.soGioThucGiang ? `${row.soGioThucGiang}h` : undefined,
                                })
                              }
                              className="cursor-pointer accent-[#005325] w-3.5 h-3.5"
                              title={`Chọn dòng ${row.tt} để phản hồi`}
                            />
                          </td>
                        )}

                        {/* TT */}
                        <td className="px-1 py-0 text-center font-normal border border-black bg-white">
                          {row.tt}
                        </td>

                        {/* Môn giảng dạy */}
                        <td className={`px-1.5 py-0 border border-black ${getCellBg(row.tenHocPhan)}`}>
                          {isEditable ? (
                            <input
                              type="text"
                              value={row.tenHocPhan}
                              onChange={(e) => handleCellChange('ly_thuyet', index, 'tenHocPhan', e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-[11.5px] text-black"
                            />
                          ) : (
                            <span>{row.tenHocPhan}</span>
                          )}
                        </td>

                        {/* Lớp */}
                        <td className={`px-1 py-0 border border-black text-center ${getCellBg(row.maLopHocPhan)}`}>
                          {isEditable ? (
                            <input
                              type="text"
                              value={row.maLopHocPhan}
                              onChange={(e) => handleCellChange('ly_thuyet', index, 'maLopHocPhan', e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-[11.5px] text-center text-black"
                            />
                          ) : (
                            <span>{row.maLopHocPhan}</span>
                          )}
                        </td>

                        {/* Số SV */}
                        <td className={`px-1 py-0 border border-black text-center ${getCellBg(row.soSinhVien)}`}>
                          {isEditable ? (
                            <input
                              type="text"
                              value={row.soSinhVien}
                              onChange={(e) => handleCellChange('ly_thuyet', index, 'soSinhVien', e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-[11.5px] text-center text-black"
                            />
                          ) : (
                            <span>{row.soSinhVien}</span>
                          )}
                        </td>

                        {/* Số nhóm */}
                        <td className={`px-1 py-0 border border-black text-center ${getCellBg(row.soNhom)}`}>
                          {isEditable ? (
                            <input
                              type="text"
                              value={row.soNhom}
                              onChange={(e) => handleCellChange('ly_thuyet', index, 'soNhom', e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-[11.5px] text-center text-black"
                            />
                          ) : (
                            <span>{row.soNhom}</span>
                          )}
                        </td>

                        {/* Số giờ môn học */}
                        <td className={`px-1 py-0 border border-black text-center ${getCellBg(row.soGioMonHoc)}`}>
                          {isEditable ? (
                            <input
                              type="text"
                              value={row.soGioMonHoc}
                              onChange={(e) => handleCellChange('ly_thuyet', index, 'soGioMonHoc', e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-[11.5px] text-center text-black"
                            />
                          ) : (
                            <span>{row.soGioMonHoc}</span>
                          )}
                        </td>

                        {/* Số giờ thực giảng (1) */}
                        <td className={`px-1 py-0 border border-black text-center ${getCellBg(row.soGioThucGiang)}`}>
                          {isEditable ? (
                            <input
                              type="text"
                              value={row.soGioThucGiang}
                              onChange={(e) => handleCellChange('ly_thuyet', index, 'soGioThucGiang', e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-[11.5px] text-center text-black"
                            />
                          ) : (
                            <span>{row.soGioThucGiang}</span>
                          )}
                        </td>

                        {/* Hệ số lớp, nhóm (2) */}
                        <td className={`px-1 py-0 border border-black text-center ${getCellBg(row.heSoLopNhom)}`}>
                          {isEditable ? (
                            <input
                              type="text"
                              value={row.heSoLopNhom}
                              onChange={(e) => handleCellChange('ly_thuyet', index, 'heSoLopNhom', e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-[11.5px] text-center text-black"
                            />
                          ) : (
                            <span>{row.heSoLopNhom}</span>
                          )}
                        </td>

                        {/* Hệ số tín chỉ (3) */}
                        <td className={`px-1 py-0 border border-black text-center ${getCellBg(row.heSoTinChi)}`}>
                          {isEditable ? (
                            <input
                              type="text"
                              value={row.heSoTinChi}
                              onChange={(e) => handleCellChange('ly_thuyet', index, 'heSoTinChi', e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-[11.5px] text-center text-black"
                            />
                          ) : (
                            <span>{row.heSoTinChi}</span>
                          )}
                        </td>

                        {/* Số giờ quy chuẩn (4) - White background, '-' when empty */}
                        <td className="px-1 py-0 border border-black text-center bg-white text-black font-normal">
                          {qc !== null ? qc.toFixed(qc % 1 === 0 ? 0 : 2) : '-'}
                        </td>

                        {/* Xác nhận của Khoa */}
                        <td className="px-1 py-0 border border-black text-center bg-white text-black text-[10.5px]">
                          {row.xacNhanKhoa || ''}
                        </td>
                      </tr>

                      {/* HÀNG NẰM DƯỚI HÀNG CŨ Ở TRẠNG THÁI "ĐÃ GỬI" */}
                      {matchingProposal && (
                        <tr className="h-[25px] bg-amber-50 text-black border border-black font-normal">
                          {Boolean(onToggleSelectRow) && (
                            <td className="px-0.5 text-center border border-black text-amber-700 font-bold print:hidden">
                              ↳
                            </td>
                          )}
                          <td className="px-1 text-center border border-black font-semibold text-amber-900 text-[10.5px]">
                            {row.tt}.1
                          </td>
                          <td className="px-1.5 border border-black font-medium text-amber-950 bg-amber-100/60">
                            <div className="flex items-center justify-between gap-1">
                              <span>{matchingProposal.adjustedData.tenHocPhan}</span>
                              <span className="text-[9px] bg-amber-200 text-amber-900 px-1 rounded font-bold whitespace-nowrap">
                                ĐIỀU CHỈNH
                              </span>
                            </div>
                            {matchingProposal.feedbackNote && (
                              <div className="text-[10px] text-amber-800 italic">{matchingProposal.feedbackNote}</div>
                            )}
                          </td>
                          <td className="px-1 border border-black text-center">{row.maLopHocPhan}</td>
                          <td className="px-1 border border-black text-center">{row.soSinhVien}</td>
                          <td className="px-1 border border-black text-center">{row.soNhom}</td>
                          <td className="px-1 border border-black text-center">{row.soGioMonHoc}</td>
                          <td className="px-1 border border-black text-center font-bold text-emerald-800 bg-emerald-50">
                            {matchingProposal.adjustedData.soGioThucGiang}
                          </td>
                          <td className="px-1 border border-black text-center font-bold text-emerald-800 bg-emerald-50">
                            {matchingProposal.adjustedData.heSoLopNhom}
                          </td>
                          <td className="px-1 border border-black text-center">{row.heSoTinChi}</td>
                          <td className="px-1 border border-black text-center font-bold text-emerald-800 bg-emerald-50">
                            {(matchingProposal.adjustedData.soGioQuyChuan || 0).toFixed(1)}
                          </td>
                          <td className="px-1 border border-black text-center">
                            <div className="flex items-center gap-1 justify-center">
                              <span className="text-[9.5px] text-amber-900 font-bold bg-amber-200 px-1 py-0.2 rounded whitespace-nowrap">
                                Đã gửi
                              </span>
                              {onApproveProposal && (
                                <button
                                  type="button"
                                  onClick={() => onApproveProposal(matchingProposal.id)}
                                  className="text-[9.5px] bg-[#005325] text-white px-1 py-0.5 rounded cursor-pointer font-bold hover:bg-[#00421e] whitespace-nowrap"
                                  title="Đào tạo duyệt điều chỉnh dòng này"
                                >
                                  Duyệt
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* SECTION II. THỰC HÀNH, THỰC TẬP */}
                <tr className="bg-white">
                  <td colSpan={12} className="px-2 py-1 text-left font-bold text-blue-700 border border-black">
                    II. THỰC HÀNH, THỰC TẬP
                  </td>
                </tr>

                {thucHanhRows.map((row, index) => {
                  const qc = calculateQC(row);
                  const matchingProposal = pendingAdjustments.find(
                    (p) =>
                      p.status === 'da_gui' &&
                      (p.targetRecordId === row.id ||
                        (p.originalData &&
                          p.originalData.tenHocPhan === row.tenHocPhan &&
                          p.originalData.maLopHocPhan === row.maLopHocPhan))
                  );
                  return (
                    <React.Fragment key={row.id}>
                      <tr className="h-[25px]">
                        {/* Checkbox trước TT */}
                        {Boolean(onToggleSelectRow) && (
                          <td className="px-0.5 py-0 text-center border border-black bg-white print:hidden">
                            <input
                              type="checkbox"
                              checked={selectedRowIds.includes(row.id)}
                              onChange={() =>
                                onToggleSelectRow?.({
                                  rowId: row.id,
                                  tt: row.tt,
                                  title: row.tenHocPhan || 'Học phần thực hành',
                                  subtitle: row.maLopHocPhan ? `Lớp ${row.maLopHocPhan}` : undefined,
                                  khoiLuong: row.soGioThucGiang ? `${row.soGioThucGiang}h` : undefined,
                                })
                              }
                              className="cursor-pointer accent-[#005325] w-3.5 h-3.5"
                              title={`Chọn dòng ${row.tt} để phản hồi`}
                            />
                          </td>
                        )}

                        {/* TT */}
                        <td className="px-1 py-0 text-center font-normal border border-black bg-white">
                          {row.tt}
                        </td>

                        {/* Môn giảng dạy */}
                        <td className={`px-1.5 py-0 border border-black ${getCellBg(row.tenHocPhan)}`}>
                          {isEditable ? (
                            <input
                              type="text"
                              value={row.tenHocPhan}
                              onChange={(e) => handleCellChange('thuc_hanh_thuc_tap', index, 'tenHocPhan', e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-[11.5px] text-black"
                            />
                          ) : (
                            <span>{row.tenHocPhan}</span>
                          )}
                        </td>

                        {/* Lớp */}
                        <td className={`px-1 py-0 border border-black text-center ${getCellBg(row.maLopHocPhan)}`}>
                          {isEditable ? (
                            <input
                              type="text"
                              value={row.maLopHocPhan}
                              onChange={(e) => handleCellChange('thuc_hanh_thuc_tap', index, 'maLopHocPhan', e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-[11.5px] text-center text-black"
                            />
                          ) : (
                            <span>{row.maLopHocPhan}</span>
                          )}
                        </td>

                        {/* Số SV */}
                        <td className={`px-1 py-0 border border-black text-center ${getCellBg(row.soSinhVien)}`}>
                          {isEditable ? (
                            <input
                              type="text"
                              value={row.soSinhVien}
                              onChange={(e) => handleCellChange('thuc_hanh_thuc_tap', index, 'soSinhVien', e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-[11.5px] text-center text-black"
                            />
                          ) : (
                            <span>{row.soSinhVien}</span>
                          )}
                        </td>

                        {/* Số nhóm */}
                        <td className={`px-1 py-0 border border-black text-center ${getCellBg(row.soNhom)}`}>
                          {isEditable ? (
                            <input
                              type="text"
                              value={row.soNhom}
                              onChange={(e) => handleCellChange('thuc_hanh_thuc_tap', index, 'soNhom', e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-[11.5px] text-center text-black"
                            />
                          ) : (
                            <span>{row.soNhom}</span>
                          )}
                        </td>

                        {/* Số giờ môn học */}
                        <td className={`px-1 py-0 border border-black text-center ${getCellBg(row.soGioMonHoc)}`}>
                          {isEditable ? (
                            <input
                              type="text"
                              value={row.soGioMonHoc}
                              onChange={(e) => handleCellChange('thuc_hanh_thuc_tap', index, 'soGioMonHoc', e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-[11.5px] text-center text-black"
                            />
                          ) : (
                            <span>{row.soGioMonHoc}</span>
                          )}
                        </td>

                        {/* Số giờ thực giảng (1) */}
                        <td className={`px-1 py-0 border border-black text-center ${getCellBg(row.soGioThucGiang)}`}>
                          {isEditable ? (
                            <input
                              type="text"
                              value={row.soGioThucGiang}
                              onChange={(e) => handleCellChange('thuc_hanh_thuc_tap', index, 'soGioThucGiang', e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-[11.5px] text-center text-black"
                            />
                          ) : (
                            <span>{row.soGioThucGiang}</span>
                          )}
                        </td>

                        {/* Hệ số lớp, nhóm (2) */}
                        <td className={`px-1 py-0 border border-black text-center ${getCellBg(row.heSoLopNhom)}`}>
                          {isEditable ? (
                            <input
                              type="text"
                              value={row.heSoLopNhom}
                              onChange={(e) => handleCellChange('thuc_hanh_thuc_tap', index, 'heSoLopNhom', e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-[11.5px] text-center text-black"
                            />
                          ) : (
                            <span>{row.heSoLopNhom}</span>
                          )}
                        </td>

                        {/* Hệ số tín chỉ (3) */}
                        <td className={`px-1 py-0 border border-black text-center ${getCellBg(row.heSoTinChi)}`}>
                          {isEditable ? (
                            <input
                              type="text"
                              value={row.heSoTinChi}
                              onChange={(e) => handleCellChange('thuc_hanh_thuc_tap', index, 'heSoTinChi', e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-[11.5px] text-center text-black"
                            />
                          ) : (
                            <span>{row.heSoTinChi}</span>
                          )}
                        </td>

                        {/* Số giờ quy chuẩn (4) */}
                        <td className="px-1 py-0 border border-black text-center bg-white text-black font-normal">
                          {qc !== null ? qc.toFixed(qc % 1 === 0 ? 0 : 2) : '-'}
                        </td>

                        {/* Xác nhận của Khoa */}
                        <td className="px-1 py-0 border border-black text-center bg-white text-black text-[10.5px]">
                          {row.xacNhanKhoa || ''}
                        </td>
                      </tr>

                      {/* HÀNG NẰM DƯỚI HÀNG CŨ Ở TRẠNG THÁI "ĐÃ GỬI" */}
                      {matchingProposal && (
                        <tr className="h-[25px] bg-amber-50 text-black border border-black font-normal">
                          {Boolean(onToggleSelectRow) && (
                            <td className="px-0.5 text-center border border-black text-amber-700 font-bold print:hidden">
                              ↳
                            </td>
                          )}
                          <td className="px-1 text-center border border-black font-semibold text-amber-900 text-[10.5px]">
                            {row.tt}.1
                          </td>
                          <td className="px-1.5 border border-black font-medium text-amber-950 bg-amber-100/60">
                            <div className="flex items-center justify-between gap-1">
                              <span>{matchingProposal.adjustedData.tenHocPhan}</span>
                              <span className="text-[9px] bg-amber-200 text-amber-900 px-1 rounded font-bold whitespace-nowrap">
                                ĐIỀU CHỈNH
                              </span>
                            </div>
                            {matchingProposal.feedbackNote && (
                              <div className="text-[10px] text-amber-800 italic">{matchingProposal.feedbackNote}</div>
                            )}
                          </td>
                          <td className="px-1 border border-black text-center">{row.maLopHocPhan}</td>
                          <td className="px-1 border border-black text-center">{row.soSinhVien}</td>
                          <td className="px-1 border border-black text-center">{row.soNhom}</td>
                          <td className="px-1 border border-black text-center">{row.soGioMonHoc}</td>
                          <td className="px-1 border border-black text-center font-bold text-emerald-800 bg-emerald-50">
                            {matchingProposal.adjustedData.soGioThucGiang}
                          </td>
                          <td className="px-1 border border-black text-center font-bold text-emerald-800 bg-emerald-50">
                            {matchingProposal.adjustedData.heSoLopNhom}
                          </td>
                          <td className="px-1 border border-black text-center">{row.heSoTinChi}</td>
                          <td className="px-1 border border-black text-center font-bold text-emerald-800 bg-emerald-50">
                            {(matchingProposal.adjustedData.soGioQuyChuan || 0).toFixed(1)}
                          </td>
                          <td className="px-1 border border-black text-center">
                            <div className="flex items-center gap-1 justify-center">
                              <span className="text-[9.5px] text-amber-900 font-bold bg-amber-200 px-1 py-0.2 rounded whitespace-nowrap">
                                Đã gửi
                              </span>
                              {onApproveProposal && (
                                <button
                                  type="button"
                                  onClick={() => onApproveProposal(matchingProposal.id)}
                                  className="text-[9.5px] bg-[#005325] text-white px-1 py-0.5 rounded cursor-pointer font-bold hover:bg-[#00421e] whitespace-nowrap"
                                  title="Đào tạo duyệt điều chỉnh dòng này"
                                >
                                  Duyệt
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* FOOTER ROW: TỔNG SỐ GIỜ GIẢNG DẠY */}
                <tr className="bg-white font-bold h-[28px]">
                  <td colSpan={10} className="px-2 py-1 text-center font-bold text-blue-700 border border-black text-[12px]">
                    Tổng số giờ giảng dạy
                  </td>
                  <td className="px-1 py-1 text-center font-bold text-black border border-black text-[12px]">
                    {grandTotalQC > 0 ? grandTotalQC.toFixed(grandTotalQC % 1 === 0 ? 0 : 2) : '-'}
                  </td>
                  <td className="px-1 py-1 text-center border border-black bg-white"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SIGNATURE SECTION (For clean printing) */}
          <div className="hidden print:grid grid-cols-3 gap-4 mt-8 text-center text-[12px] text-black">
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
              <p className="font-bold">PHÒNG ĐÀO TẠO TDU</p>
              <p className="italic text-[11px]">(Đối soát khối lượng)</p>
              <div className="h-16"></div>
              <p className="font-bold">Trưởng phòng Đào tạo</p>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
