import React, { useState, useEffect, useMemo } from 'react';
import { TeachingRecord } from '../types';
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

export interface ThesisScheduleRow {
  id: string;
  tt: number;
  tenDeTai: string;
  maLopHocPhan: string;
  sinhVienThucHien: string;
  vaiTro: string;
  soSinhVien: number | string;
  soLuotChamHoiDong: number | string;
  soGioQuyChuan: number | string;
  ghiChu: string;
  xacNhanKhoa: string;
}

interface ThesisScheduleReportProps {
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

export const ThesisScheduleReport: React.FC<ThesisScheduleReportProps> = ({
  maGV = 'TDU00128',
  records,
  allLecturers,
  onSelectLecturer,
  onSaveRecords,
  isModal = false,
  onClose,
  academicYear = '2025 - 2026',
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

  const initRows = (): ThesisScheduleRow[] => {
    const thesisRecs = lecturerRecords.filter((r) => r.phongBanQuanLy === 'do_an');
    if (thesisRecs.length > 0) {
      return thesisRecs.map((r, i) => ({
        id: r.id || `thesis-${i + 1}`,
        tt: i + 1,
        tenDeTai: r.tenHocPhan || 'Nghiên cứu & Xây dựng Cổng thông tin đào tạo trực tuyến',
        maLopHocPhan: r.maLopHocPhan || 'DA_TOT_NGHIEP_K14',
        sinhVienThucHien: r.ghiChu || 'Lê Hoàng Nam (2001124) & Trần Bảo An (2001188)',
        vaiTro: r.vaiTroDoAn || 'Hướng dẫn chính',
        soSinhVien: r.soSinhVien || 2,
        soLuotChamHoiDong: r.soLuong || 1,
        soGioQuyChuan: r.tongTietQC || 30,
        ghiChu: 'Theo QĐ giao đề tài khóa luận tốt nghiệp số 184/QĐ-ĐHTĐ',
        xacNhanKhoa: 'Đã nghiệm thu đạt loại Giỏi',
      }));
    }

    return [
      {
        id: 'thesis-1',
        tt: 1,
        tenDeTai: 'Xây dựng Hệ thống Quản trị & Thanh toán Thù lao Giảng viên điện tử',
        maLopHocPhan: 'KLTN_CNTT_K14',
        sinhVienThucHien: 'Nguyễn Văn Minh (2001145) - Lớp CNTT14A',
        vaiTro: 'Hướng dẫn chính',
        soSinhVien: 1,
        soLuotChamHoiDong: 1,
        soGioQuyChuan: 20,
        ghiChu: 'Theo QĐ số 112/QĐ-ĐHTĐ',
        xacNhanKhoa: 'Đạt 9.2 điểm',
      },
      {
        id: 'thesis-2',
        tt: 2,
        tenDeTai: 'Ứng dụng Trí tuệ Nhân tạo hỗ trợ phân loại hồ sơ minh chứng ĐBCL',
        maLopHocPhan: 'KLTN_CNTT_K14',
        sinhVienThucHien: 'Trần Thị Thu Thảo (2001198) - Lớp CNTT14B',
        vaiTro: 'Hướng dẫn chính',
        soSinhVien: 1,
        soLuotChamHoiDong: 1,
        soGioQuyChuan: 20,
        ghiChu: 'Theo QĐ số 112/QĐ-ĐHTĐ',
        xacNhanKhoa: 'Đạt 9.0 điểm',
      },
      {
        id: 'thesis-3',
        tt: 3,
        tenDeTai: 'Hội đồng chấm Khóa luận Tốt nghiệp ngành Công nghệ Thông tin đợt 1',
        maLopHocPhan: 'HD_CHAM_K14',
        sinhVienThucHien: '5 sinh viên chuyên ngành Kỹ thuật Phần mềm',
        vaiTro: 'Ủy viên kiêm Thư ký Hội đồng',
        soSinhVien: 5,
        soLuotChamHoiDong: 5,
        soGioQuyChuan: 15,
        ghiChu: 'Theo QĐ thành lập HĐ số 158/QĐ-ĐHTĐ',
        xacNhanKhoa: 'Đã nộp biên bản',
      },
    ];
  };

  const [thesisRows, setThesisRows] = useState<ThesisScheduleRow[]>(initRows);

  useEffect(() => {
    setThesisRows(initRows());
  }, [maGV, records]);

  const handleCellChange = (index: number, field: keyof ThesisScheduleRow, value: string) => {
    const updated = [...thesisRows];
    updated[index] = { ...updated[index], [field]: value };
    setThesisRows(updated);
  };

  const totalSV = useMemo(() => {
    return thesisRows.reduce((sum, r) => sum + (parseFloat(String(r.soSinhVien).replace(',', '.')) || 0), 0);
  }, [thesisRows]);

  const totalQC = useMemo(() => {
    return thesisRows.reduce((sum, r) => sum + (parseFloat(String(r.soGioQuyChuan).replace(',', '.')) || 0), 0);
  }, [thesisRows]);

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const headerRows: (string | number)[][] = [
      ['BẢNG THỐNG KÊ HƯỚNG DẪN & CHẤM ĐỒ ÁN, KHÓA LUẬN TỐT NGHIỆP'],
      [`NĂM HỌC ${namHoc}`],
      [],
      ['Đơn vị:', donVi, '', '', '', '', '', 'Lưu ý: Quý Thầy/Cô kiểm tra danh sách SV, vai trò hướng dẫn/chấm'],
      ['Họ tên giảng viên:', hoTen, '', '', '', '', '', 'và số quyết định giao đề tài của Trường'],
      ['Chức danh:', chucDanh],
      ['Ngạch giảng viên:', ngachGV],
      ['Năm học:', namHoc],
      [],
      ['BẢNG CHI TIẾT NHIỆM VỤ ĐỒ ÁN / KHÓA LUẬN'],
      [
        'TT',
        'Tên đề tài / Đồ án / Khóa luận',
        'Mã học phần / Lớp',
        'Sinh viên thực hiện',
        'Vai trò',
        'Số SV',
        'Số lượt chấm HĐ',
        'Số giờ QC quy đổi',
        'Căn cứ / Ghi chú',
        'Xác nhận của Khoa/BM',
      ],
    ];

    thesisRows.forEach((r) => {
      headerRows.push([
        r.tt,
        r.tenDeTai,
        r.maLopHocPhan,
        r.sinhVienThucHien,
        r.vaiTro,
        r.soSinhVien,
        r.soLuotChamHoiDong,
        r.soGioQuyChuan,
        r.ghiChu,
        r.xacNhanKhoa,
      ]);
    });

    headerRows.push([
      'Tổng cộng',
      '',
      '',
      '',
      '',
      totalSV,
      '',
      totalQC > 0 ? totalQC : '-',
      '',
      'Đã hoàn thành bảo vệ',
    ]);

    const ws = XLSX.utils.aoa_to_sheet(headerRows);

    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
    ];

    ws['!cols'] = [
      { wch: 6 },
      { wch: 42 },
      { wch: 18 },
      { wch: 32 },
      { wch: 22 },
      { wch: 12 },
      { wch: 16 },
      { wch: 18 },
      { wch: 30 },
      { wch: 24 },
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
            alignment: { vertical: 'center', horizontal: C === 7 ? 'right' : 'left' },
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
              horizontal: C === 0 || C === 2 || C === 4 || C === 5 ? 'center' : C === 7 ? 'right' : 'left',
            },
            border: thinBorder,
          };
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, 'ThongKeDoAn');
    saveWorkbookToFile(wb, `Bang_Thong_Ke_Do_An_KLTN_${hoTen.replace(/\s+/g, '_')}_${namHoc.replace(/\s+/g, '')}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    if (onSaveRecords) {
      const updatedTeachingRecords: TeachingRecord[] = thesisRows.map((r, idx) => ({
        id: r.id,
        tt: idx + 1,
        maGV,
        hoTen,
        ngaySinh: firstRec.ngaySinh || '18/09/1982',
        soCCCD: firstRec.soCCCD || '092082001245',
        hocHamHocVi: chucDanh,
        khoaBoMon: donVi,
        phongBanQuanLy: 'do_an',
        loaiHoatDong: 'Hướng dẫn & Chấm Đồ án / KLTN',
        tenHocPhan: r.tenDeTai,
        maLopHocPhan: r.maLopHocPhan,
        soSinhVien: Number(r.soSinhVien) || 0,
        soLuong: Number(r.soLuotChamHoiDong) || 0,
        tongTietQC: Number(r.soGioQuyChuan) || 0,
        vaiTroDoAn: r.vaiTro,
        donGiaTiet: 160000,
        tongTienThuLao: (Number(r.soGioQuyChuan) || 0) * 160000,
        thueTNCN: (Number(r.soGioQuyChuan) || 0) * 16000,
        thucNhan: (Number(r.soGioQuyChuan) || 0) * 144000,
        soTaiKhoan: firstRec.soTaiKhoan || '102874639912',
        nganHang: firstRec.nganHang || 'VietinBank CN Cần Thơ',
        dotThanhToan: academicYear,
        trangThai: 'hop_le',
        ghiChu: `${r.sinhVienThucHien} - ${r.ghiChu}`,
      }));
      onSaveRecords(updatedTeachingRecords);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleAddRow = () => {
    const newRow: ThesisScheduleRow = {
      id: `thesis-${Date.now()}`,
      tt: thesisRows.length + 1,
      tenDeTai: 'Đề tài Khóa luận tốt nghiệp mới',
      maLopHocPhan: 'KLTN_K14',
      sinhVienThucHien: 'Sinh viên mới',
      vaiTro: 'Hướng dẫn chính',
      soSinhVien: 1,
      soLuotChamHoiDong: 1,
      soGioQuyChuan: 15,
      ghiChu: 'Bổ sung đề tài',
      xacNhanKhoa: 'Chờ duyệt',
    };
    setThesisRows([...thesisRows, newRow]);
  };

  const handleDeleteRow = (index: number) => {
    if (thesisRows.length <= 1) {
      alert('Bảng kê cần tối thiểu 1 dòng dữ liệu.');
      return;
    }
    const updated = thesisRows.filter((_, i) => i !== index).map((r, i) => ({ ...r, tt: i + 1 }));
    setThesisRows(updated);
  };

  return (
    <div className="w-full bg-slate-100 min-h-screen py-4 px-2 sm:px-4 font-sans text-slate-800">
      {/* 1. Header Toolbar */}
      <div className="max-w-[1180px] mx-auto bg-white rounded-xl shadow-xs border border-slate-200 p-3 mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200 text-xs font-semibold">
            <FileSpreadsheet className="w-4 h-4 text-blue-700" />
            <span>ĐỒ ÁN / KHÓA LUẬN · BẢNG THỐNG KÊ CHI TIẾT</span>
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
            <span>Thêm đề tài</span>
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
            <Download className="w-3.5 h-3.5 text-blue-600" />
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
          <h3 className="text-[14px] font-semibold text-slate-700 uppercase">KHOA & BỘ PHẬN QUẢN LÝ ĐỒ ÁN / KHÓA LUẬN</h3>
          <div className="w-36 h-0.5 bg-slate-400 mx-auto my-2" />
          <h1 className="text-[19px] font-extrabold uppercase text-[#005325] pt-2 tracking-wide">
            BẢNG THỐNG KÊ HƯỚNG DẪN & CHẤM ĐỒ ÁN, KHÓA LUẬN TỐT NGHIỆP
          </h1>
          <p className="text-[13px] italic font-medium text-slate-600">NĂM HỌC {namHoc}</p>
        </div>

        {/* Lecturer Meta Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-[13px] mb-6 p-4 bg-slate-50/70 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-bold min-w-[130px]">Khoa / Bộ môn:</span>
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
          <span>DANH SÁCH CHI TIẾT ĐỀ TÀI / KHÓA LUẬN TỐT NGHIỆP:</span>
          <span className="text-[11px] font-normal italic text-slate-500 normal-case">
            * Các ô màu vàng có thể chỉnh sửa trực tiếp số SV, giờ quy chuẩn và vai trò
          </span>
        </div>

        {/* Excel-style table */}
        <div className="overflow-x-auto border border-slate-400 mb-6">
          <table className="w-full min-w-[850px] border-collapse text-[12px] text-center">
            <thead>
              <tr className="bg-[#FFFF99] text-slate-900 font-bold border-b border-slate-400">
                <th className="p-2 border-r border-slate-400 w-10">TT</th>
                <th className="p-2 border-r border-slate-400 text-left min-w-[240px]">Tên đề tài / Đồ án / Khóa luận</th>
                <th className="p-2 border-r border-slate-400 min-w-[110px]">Mã HP / Lớp</th>
                <th className="p-2 border-r border-slate-400 text-left min-w-[190px]">Sinh viên thực hiện</th>
                <th className="p-2 border-r border-slate-400 min-w-[140px]">Vai trò</th>
                <th className="p-2 border-r border-slate-400 w-16">Số SV</th>
                <th className="p-2 border-r border-slate-400 w-20">Lượt chấm</th>
                <th className="p-2 border-r border-slate-400 w-24">Số giờ QC</th>
                <th className="p-2 border-r border-slate-400 text-left min-w-[170px]">Căn cứ / Ghi chú</th>
                <th className="p-2 border-r border-slate-400 text-left min-w-[140px]">Xác nhận Khoa</th>
                <th className="p-2 w-10 print:hidden">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {thesisRows.map((row, idx) => (
                <tr key={row.id} className="border-b border-slate-300 hover:bg-slate-50/50">
                  <td className="p-2 border-r border-slate-300 font-semibold">{row.tt}</td>
                  <td className="p-2 border-r border-slate-300 text-left font-medium">
                    <input
                      type="text"
                      value={row.tenDeTai}
                      onChange={(e) => handleCellChange(idx, 'tenDeTai', e.target.value)}
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
                  <td className="p-2 border-r border-slate-300 text-left">
                    <input
                      type="text"
                      value={row.sinhVienThucHien}
                      onChange={(e) => handleCellChange(idx, 'sinhVienThucHien', e.target.value)}
                      className="w-full bg-transparent focus:outline-none text-left font-medium text-slate-800"
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
                  <td className="p-2 border-r border-slate-300 bg-amber-50/60 font-mono">
                    <input
                      type="number"
                      value={row.soSinhVien}
                      onChange={(e) => handleCellChange(idx, 'soSinhVien', e.target.value)}
                      className="w-full bg-transparent text-center focus:outline-none font-bold text-slate-800"
                    />
                  </td>
                  <td className="p-2 border-r border-slate-300 bg-amber-50/60 font-mono">
                    <input
                      type="number"
                      value={row.soLuotChamHoiDong}
                      onChange={(e) => handleCellChange(idx, 'soLuotChamHoiDong', e.target.value)}
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
                      value={row.xacNhanKhoa}
                      onChange={(e) => handleCellChange(idx, 'xacNhanKhoa', e.target.value)}
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
                <td colSpan={5} className="p-2.5 text-center text-[#005325] uppercase tracking-wide border-r border-slate-400">
                  TỔNG CỘNG ĐỒ ÁN / KHÓA LUẬN TỐT NGHIỆP:
                </td>
                <td className="p-2.5 text-center border-r border-slate-400 font-mono text-slate-900">
                  {totalSV} SV
                </td>
                <td className="p-2.5 text-center border-r border-slate-400 font-mono text-slate-900">
                  -
                </td>
                <td className="p-2.5 text-right pr-3 border-r border-slate-400 font-mono text-[#005325] text-[13.5px]">
                  {totalQC > 0 ? totalQC.toLocaleString('vi-VN') : '-'}
                </td>
                <td colSpan={3} className="p-2.5 text-left text-[11.5px] font-normal italic text-slate-600">
                  Giờ quy chuẩn tính theo số lượng SV và vai trò hướng dẫn / chấm hội đồng
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
            <div className="h-16 flex items-end justify-center font-medium text-slate-600">Đã duyệt danh sách</div>
          </div>

          <div className="space-y-1">
            <p className="font-bold uppercase text-slate-900">TRƯỞNG KHOA / VIỆN</p>
            <p className="text-[11px] italic text-slate-500">(Ký và ghi rõ họ tên)</p>
            <div className="h-16 flex items-end justify-center font-medium text-slate-600">Xác nhận công tác</div>
          </div>

          <div className="space-y-1">
            <p className="font-bold uppercase text-slate-900">PHÒNG QUẢN LÝ ĐÀO TẠO</p>
            <p className="text-[11px] italic text-slate-500">(Ký và đóng dấu)</p>
            <div className="h-16 flex items-end justify-center font-bold text-[#005325]">Đã đối soát nghiệm thu</div>
          </div>
        </div>
      </div>
    </div>
  );
};

