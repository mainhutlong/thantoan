import React, { useState, useMemo } from 'react';
import { TeachingRecord } from '../types';
import {
  Printer,
  Download,
  Save,
  CheckCircle2,
  FileSpreadsheet,
  X,
  Edit3,
  MoreVertical
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveWorkbookToFile } from '../utils/excelTemplateGenerator';
import { OtherDutiesSection, DEFAULT_OTHER_DUTIES_DATA, OtherDutyRow } from './OtherDutiesSection';

interface OtherDutiesScheduleReportProps {
  maGV?: string | null;
  records?: TeachingRecord[];
  allLecturers?: { maGV: string; hoTen: string; khoa: string }[];
  onSelectLecturer?: (maGV: string) => void;
  onClose?: () => void;
  academicYear?: string;
}

export const OtherDutiesScheduleReport: React.FC<OtherDutiesScheduleReportProps> = ({
  maGV = 'TDU00128',
  records = [],
  allLecturers = [],
  onSelectLecturer,
  onClose,
  academicYear = '2025 - 2026',
}) => {
  const firstRec = useMemo(() => {
    return records.find((r) => r.maGV === maGV) || {
      hoTen: 'TS. Mai Như Long',
      khoaBoMon: 'Khoa Công nghệ thông tin',
      hocHamHocVi: 'TS',
    };
  }, [records, maGV]);

  const [donVi, setDonVi] = useState(firstRec.khoaBoMon || 'Khoa Công nghệ thông tin');
  const [hoTen, setHoTen] = useState(firstRec.hoTen || 'TS. Mai Như Long');
  const [namHoc] = useState(academicYear);
  const [isEditable, setIsEditable] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [totalHours, setTotalHours] = useState(0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const rows: any[][] = [
      ['TRƯỜNG ĐẠI HỌC TÂY ĐÔ'],
      ['PHÒNG ĐÀO TẠO - BAN THANH TRA'],
      [],
      ['BẢNG THỐNG KÊ CÔNG TÁC KHÁC'],
      [`NĂM HỌC ${namHoc}`],
      [],
      ['Giảng viên:', `${hoTen} (${maGV}) - ${donVi}`],
      [],
      [
        'STT',
        'Nhóm công việc',
        'Mã CV',
        'Tên công việc',
        'Điều kiện',
        'Quy đổi số giờ',
        'Số Lượng',
        'Ghi chú thông tin',
        'Tổng số giờ theo công việc',
        'Xác nhận của các đơn vị',
      ],
    ];

    DEFAULT_OTHER_DUTIES_DATA.forEach((r) => {
      rows.push([
        r.stt,
        r.nhom,
        r.maCV,
        r.tenCV,
        r.dieuKien,
        r.quyDoi > 0 ? r.quyDoi : '',
        r.soLuong !== '' ? r.soLuong : '',
        r.ghiChu || '',
        r.tongGio !== null ? r.tongGio : '-',
        r.xacNhan || '',
      ]);
    });

    rows.push([
      'Tổng số giờ công tác khác',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      totalHours > 0 ? totalHours : '-',
      '',
    ]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 28 },
      { wch: 12 },
      { wch: 30 },
      { wch: 20 },
      { wch: 14 },
      { wch: 12 },
      { wch: 24 },
      { wch: 18 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'CongTacKhac');
    saveWorkbookToFile(wb, `Bang_Thong_Ke_Cong_Tac_Khac_${hoTen.replace(/\s+/g, '_')}_${namHoc.replace(/\s+/g, '')}.xlsx`);
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="w-full max-w-full min-w-0 flex flex-col bg-white p-3 sm:p-4">
      {/* 1. TOP ACTION TOOLBAR */}
      <div className="print:hidden w-full max-w-full min-w-0 bg-slate-50 border border-slate-300 rounded-md p-2.5 mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <FileSpreadsheet className="w-4 h-4 text-[#005325] shrink-0" />
            <span>Biểu mẫu: Bảng thống kê công tác khác (40 mục)</span>
          </div>

          {allLecturers && allLecturers.length > 0 && onSelectLecturer && (
            <div className="flex items-center gap-1.5 ml-1">
              <span className="text-xs text-slate-500">Giảng viên:</span>
              <select
                value={maGV || ''}
                onChange={(e) => onSelectLecturer(e.target.value)}
                className="text-xs border border-slate-300 rounded px-2 py-0.5 bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#005325]"
              >
                {allLecturers.map((lec) => (
                  <option key={lec.maGV} value={lec.maGV}>
                    {lec.hoTen} ({lec.maGV})
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
              <span>Đã lưu thành công!</span>
            </span>
          )}

          {/* DESKTOP ACTIONS */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsEditable(!isEditable)}
              className={`px-2.5 py-1 text-xs rounded border cursor-pointer flex items-center gap-1 transition-colors ${
                isEditable
                  ? 'bg-amber-50 text-amber-800 border-amber-300 font-medium'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditable ? 'Đang bật nhập liệu' : 'Chế độ xem'}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-2.5 py-1 text-xs rounded bg-[#005325] text-white hover:bg-[#00421d] cursor-pointer flex items-center gap-1 font-medium transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu bảng</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="px-2.5 py-1 text-xs rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xuất Excel</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 py-1 text-xs rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-1 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>In biểu mẫu</span>
            </button>
          </div>

          {/* MOBILE MORE MENU */}
          <div className="relative md:hidden">
            <button
              type="button"
              onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
              className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200 cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {isActionMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsActionMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 animate-fadeIn">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditable(!isEditable);
                      setIsActionMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-xs text-left hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isEditable ? 'Đang bật nhập liệu' : 'Chế độ xem'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSave();
                      setIsActionMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-xs text-left hover:bg-slate-50 flex items-center gap-2"
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
                    className="w-full px-3 py-2 text-xs text-left hover:bg-slate-50 flex items-center gap-2"
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
                    className="w-full px-3 py-2 text-xs text-left hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>In biểu mẫu</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {onClose && (
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

      {/* 2. SPREADSHEET SHEET */}
      <div className="w-full max-w-full min-w-0 overflow-x-auto bg-white print:p-0 print:overflow-visible">
        <div className="w-full min-w-[760px] mx-auto p-3 sm:p-5 bg-white font-sans text-black border border-slate-300 shadow-xs print:border-none print:shadow-none">
          {/* TITLE CENTERED */}
          <div className="text-center mb-4 pb-2.5 border-b border-slate-200">
            <h1 className="text-[18px] sm:text-[20px] font-bold tracking-wide uppercase text-slate-900 font-sans">
              BẢNG THỐNG KÊ CÔNG TÁC KHÁC
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
            <span>Quý thầy cô nhập số lượng tại các ô màu vàng nhạt; khi hoàn tất ô sẽ tự động đổi màu và hệ thống tính quy chuẩn số giờ.</span>
          </div>

          {/* 40-ROW TABLE */}
          <OtherDutiesSection
            isEditable={isEditable}
            onTotalHoursChange={(tot) => setTotalHours(tot)}
          />

          {/* SIGNATURE SECTION */}
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
              <p className="font-bold">BAN THANH TRA / ĐBCL</p>
              <p className="italic text-[11px]">(Đối soát khối lượng)</p>
              <div className="h-16"></div>
              <p className="font-bold">Trưởng ban</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
