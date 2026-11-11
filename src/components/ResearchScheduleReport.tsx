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
  ChevronDown
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
    <div className={`w-full max-w-full flex flex-col bg-white ${isModal ? 'p-0' : 'p-3 sm:p-5'}`}>
      {/* 1. TOP TOOLBAR (Hidden when printing) */}
      <div className="print:hidden bg-slate-50 border border-slate-300 rounded-md p-2.5 mb-4 flex items-center justify-between flex-wrap gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <FileSpreadsheet className="w-4 h-4 text-purple-700" />
            <span>Biểu mẫu: Bảng thống kê Nghiên cứu Khoa học (NCKH)</span>
          </div>

          {/* Lecturer Selector */}
          {allLecturers && allLecturers.length > 0 && onSelectLecturer && (
            <div className="flex items-center gap-1.5 ml-2">
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

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-1 rounded flex items-center gap-1 animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Đã lưu dữ liệu NCKH thành công!
            </span>
          )}

          <button
            onClick={() => setIsEditable(!isEditable)}
            className={`px-2.5 py-1 text-xs rounded border cursor-pointer flex items-center gap-1 transition-colors ${
              isEditable
                ? 'bg-amber-50 text-amber-800 border-amber-300 font-medium'
                : 'bg-white text-slate-700 border-slate-300'
            }`}
            title="Bật/tắt chế độ chỉnh sửa ô vàng"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditable ? 'Đang bật nhập liệu' : 'Chế độ xem'}</span>
          </button>

          <button
            onClick={handleSave}
            className="px-3 py-1 text-xs rounded bg-[#005325] hover:bg-[#00421e] text-white font-medium cursor-pointer flex items-center gap-1 shadow-2xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu bảng</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer flex items-center gap-1 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1 text-xs rounded bg-slate-700 hover:bg-slate-800 text-white font-medium cursor-pointer flex items-center gap-1 shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In biểu mẫu</span>
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors ml-1"
              title="Đóng cửa sổ"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. THE EXACT SPREADSHEET SHEET */}
      <div className="overflow-x-auto w-full bg-white print:p-0 print:overflow-visible">
        <div className="min-w-[1050px] mx-auto p-4 sm:p-6 bg-white font-sans text-black border border-slate-300 shadow-xs print:border-none print:shadow-none">
          {/* OPTIONAL TOP METADATA BLOCK */}
          {showInfoBox && (
            <>
              {/* TITLE CENTERED */}
              <div className="text-center mb-6">
                <h1 className="text-[17px] sm:text-[19px] font-bold tracking-wide uppercase text-black font-serif">
                  BẢNG THỐNG KÊ CÔNG TÁC NGHIÊN CỨU KHOA HỌC
                </h1>
                <h2 className="text-[14px] sm:text-[15px] font-bold text-black font-serif mt-1">
                  NĂM HỌC {namHoc}
                </h2>
              </div>

              {/* TOP METADATA BLOCK & INSTRUCTION NOTE */}
              <div className="flex items-start justify-between gap-6 mb-3">
                {/* Left Info Table */}
                <div className="w-[380px] shrink-0">
                  <table className="w-full border-collapse border border-black text-[12px]">
                    <tbody>
                      <tr>
                        <td className="w-[140px] px-2.5 py-1 border border-black bg-[#bfbfbf] font-medium text-black">
                          Đơn vị:
                        </td>
                        <td className="px-2 py-0.5 border border-black bg-[#ffff99] text-black">
                          {isEditable ? (
                            <input
                              type="text"
                              value={donVi}
                              onChange={(e) => setDonVi(e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-[12px] font-normal text-black"
                            />
                          ) : (
                            <span>{donVi}</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-2.5 py-1 border border-black bg-[#bfbfbf] font-medium text-black">
                          Họ tên giảng viên:
                        </td>
                        <td className="px-2 py-0.5 border border-black bg-[#ffff99] text-black">
                          {isEditable ? (
                            <input
                              type="text"
                              value={hoTen}
                              onChange={(e) => setHoTen(e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-[12px] font-medium text-black"
                            />
                          ) : (
                            <span className="font-medium">{hoTen}</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-2.5 py-1 border border-black bg-[#bfbfbf] font-medium text-black">
                          Chức danh:
                        </td>
                        <td className="px-2 py-0.5 border border-black bg-[#ffff99] text-center text-black font-medium">
                          {isEditable ? (
                            <input
                              type="text"
                              value={chucDanh}
                              onChange={(e) => setChucDanh(e.target.value.toUpperCase())}
                              className="w-full bg-transparent border-none outline-none text-[12px] text-center uppercase font-medium text-black"
                            />
                          ) : (
                            <span className="uppercase">{chucDanh}</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-2.5 py-1 border border-black bg-[#bfbfbf] font-medium text-black">
                          Ngạch giảng viên:
                        </td>
                        <td className="px-2 py-0.5 border border-black bg-[#ffff99] text-center text-black font-medium">
                          {isEditable ? (
                            <input
                              type="text"
                              value={ngachGV}
                              onChange={(e) => setNgachGV(e.target.value.toUpperCase())}
                              className="w-full bg-transparent border-none outline-none text-[12px] text-center uppercase font-medium text-black"
                            />
                          ) : (
                            <span className="uppercase">{ngachGV}</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-2.5 py-1 border border-black bg-[#bfbfbf] font-medium text-black">
                          Năm học:
                        </td>
                        <td className="px-2 py-0.5 border border-black bg-[#ffff99] text-center text-black font-medium">
                          {isEditable ? (
                            <input
                              type="text"
                              value={namHoc}
                              onChange={(e) => setNamHoc(e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-[12px] text-center text-black font-medium"
                            />
                          ) : (
                            <span>{namHoc}</span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Right Note */}
                <div className="flex-1 text-[12px] text-black pt-2 pr-4 leading-relaxed text-right sm:text-left">
                  <span className="font-bold">Lưu ý: </span>
                  <span>
                    Quý thầy cô nhập thống kê của mình tại những ô màu vàng có ghi chú, khi nhập xong sẽ đổi màu, đề nghị quý thầy cô nhập đầy đủ
                  </span>
                </div>
              </div>
            </>
          )}

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

            {/* CALLOUT BOX AS SHOWN IN THE USER'S IMAGE: "Chọn mức độ hoàn thành" */}
            <div className="hidden sm:flex items-center gap-1 absolute -bottom-7 right-[90px] select-none pointer-events-none print:hidden">
              <div className="w-12 h-6 border-b border-l border-red-500 transform -rotate-12 translate-y-[-2px]"></div>
              <div className="bg-white border border-black px-2 py-0.5 rounded shadow-xs text-[10.5px] text-black font-sans">
                Chọn mức độ hoàn thành
              </div>
            </div>
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
    </div>
  );
};

