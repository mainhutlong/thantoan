import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle, AlertTriangle, FileCheck, Building2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { TDUEmblem } from './TDUEmblem';
import { TeachingRecord, AppMode, PaymentRuleConfig, DepartmentUnit } from '../types';

interface ValidationError {
  row: number;
  col: string;
  message: string;
  type: 'error' | 'warning' | 'duplicate';
}

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTeaching: (records: TeachingRecord[], isAppend: boolean) => void;
  isAppendMode: boolean;
  appMode: AppMode;
  currentRecords: TeachingRecord[];
  config: PaymentRuleConfig;
  departmentUnit: DepartmentUnit;
  onDepartmentChange: (dept: DepartmentUnit) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImportTeaching,
  isAppendMode,
  currentRecords,
  config,
  departmentUnit,
  onDepartmentChange,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [errorSummary, setErrorSummary] = useState<{ valid: number; errors: number; duplicates: number }>({
    valid: 0,
    errors: 0,
    duplicates: 0,
  });
  const [fileError, setFileError] = useState<string | null>(null);

  if (!isOpen) return null;

  const departmentMeta: { [key in DepartmentUnit]: { name: string; task: string; sample: string } } = {
    dao_tao: {
      name: 'Phòng Đào tạo',
      task: 'Giờ giảng dạy lý thuyết, thực hành, đồ án tốt nghiệp',
      sample: 'Mau_Ke_Khai_Dao_Tao_TDU.xlsx',
    },
    khao_thi: {
      name: 'Trung tâm Khảo thí & ĐBCL',
      task: 'Coi thi, chấm thi tự luận/vấn đáp, ra đề thi',
      sample: 'Mau_Khao_Thi_Coi_Cham_Thi_TDU.xlsx',
    },
    tuyen_sinh: {
      name: 'Phòng Tuyển sinh & Truyền thông',
      task: 'Công tác tư vấn tuyển sinh THPT, ngày hội hướng nghiệp',
      sample: 'Mau_Tuyen_Sinh_Truyen_Thong_TDU.xlsx',
    },
    nckh: {
      name: 'Phòng NCKH & Sau đại học',
      task: 'Nghiên cứu khoa học, bài báo quốc tế, hội đồng luận văn',
      sample: 'Mau_NCKH_Sau_Dai_Hoc_TDU.xlsx',
    },
    co_van_hoc_tap: {
      name: 'Cố vấn học tập (CVHT)',
      task: 'Kê khai công tác cố vấn học tập, quản lý lớp sinh viên',
      sample: 'Mau_Co_Van_Hoc_Tap_TDU.xlsx',
    },
    cong_tac_khac: {
      name: 'Công tác khác (CVHT, Kiểm định, HĐ)',
      task: 'Cố vấn học tập, thanh tra coi thi, kiểm định chất lượng',
      sample: 'Mau_Cong_Tac_Khac_TDU.xlsx',
    },
    all: {
      name: 'Phòng Đào tạo (Mặc định)',
      task: 'Tổng hợp các hoạt động đào tạo toàn trường',
      sample: 'Mau_Ke_Khai_Tong_Hop_TDU.xlsx',
    },
  };

  const currentDeptMeta = departmentMeta[departmentUnit === 'all' ? 'dao_tao' : departmentUnit] || departmentMeta.dao_tao;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setValidationErrors([]);
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (json.length < 2) {
          setFileError('Tập tin Excel không có dòng dữ liệu hợp lệ.');
          return;
        }

        const headers = json[0] as string[];
        const dataRows = json.slice(1).filter((r: any) => r && r.length > 0);

        // Run Automated Data Validation Engine
        const errors: ValidationError[] = [];
        let validCount = 0;
        let errorCount = 0;
        let duplicateCount = 0;

        const processed = dataRows.map((row: any, idx: number) => {
          const rowNum = idx + 2;
          const hoTen = String(row[2] || row[1] || '').trim();
          const maLop = String(row[7] || row[6] || `HP_${idx + 1}`).trim();
          const lt = Number(row[5] || row[4]) || 0;
          const th = Number(row[6] || row[5]) || 0;

          let hasError = false;

          // 1. Check required teacher name
          if (!hoTen) {
            errors.push({
              row: rowNum,
              col: 'Họ và tên',
              message: 'Thiếu họ tên giảng viên',
              type: 'error',
            });
            hasError = true;
          }

          // 2. Check teaching / activity hours
          if (lt === 0 && th === 0) {
            errors.push({
              row: rowNum,
              col: 'Số giờ / Tiết',
              message: 'Số giờ thực hiện chưa được ghi nhận',
              type: 'warning',
            });
          }

          // 3. Check duplicate class / lecturer
          const isDuplicate = currentRecords.some(
            (cr) => cr.maLopHocPhan.toLowerCase() === maLop.toLowerCase() && maLop !== ''
          );
          if (isDuplicate) {
            errors.push({
              row: rowNum,
              col: 'Mã lớp / Đợt',
              message: `Mã ${maLop} đã tồn tại trong đợt này`,
              type: 'duplicate',
            });
            duplicateCount++;
          }

          if (hasError) {
            errorCount++;
          } else {
            validCount++;
          }

          return { idx, values: row, headers, isDuplicate };
        });

        setValidationErrors(errors);
        setErrorSummary({ valid: validCount, errors: errorCount, duplicates: duplicateCount });
        setParsedRows(processed);
      } catch (err: any) {
        setFileError('Lỗi khi đọc file Excel: ' + (err?.message || 'Định dạng không được hỗ trợ'));
      }
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  const handleApply = () => {
    if (parsedRows.length === 0) return;

    const actualDept: DepartmentUnit = departmentUnit === 'all' ? 'dao_tao' : departmentUnit;

    const records: TeachingRecord[] = parsedRows.map((item, index) => {
      const vals = item.values;
      const maGV = String(vals[1] || 'TDU00' + (200 + index)).trim();
      const hoTen = String(vals[2] || vals[1] || 'Giảng viên TDU ' + (index + 1)).trim();
      const ngaySinh = String(vals[3] || '15/08/1985');
      const soCCCD = String(vals[4] || '09208500' + (1000 + index));
      const lt = Number(vals[5]) || 30;
      const th = Number(vals[6]) || 0;
      const hocVi = String(vals[7] || 'TS');
      const khoa = String(vals[8] || 'Khoa Công nghệ thông tin');
      const hocPhan = String(vals[9] || currentDeptMeta.task);
      const maLop = `${actualDept.toUpperCase()}_${100 + index}_TDU`;

      const heSo = 1.0;
      const donGia = config.rates[hocVi] || 180000;
      const qc = Number(((lt * config.theoryCoeff + th * config.practiceCoeff) * heSo).toFixed(2));
      const tongThuLao = Math.round(qc * donGia);
      const thue = Math.round(tongThuLao * config.taxRate);

      return {
        id: `tdu-${actualDept}-${Date.now()}-${index}`,
        tt: index + 1,
        maGV,
        hoTen,
        ngaySinh,
        soCCCD,
        hocHamHocVi: hocVi,
        khoaBoMon: khoa,
        phongBanQuanLy: actualDept,
        loaiHoatDong: currentDeptMeta.task,
        tenHocPhan: hocPhan,
        maLopHocPhan: maLop,
        soTinChi: actualDept === 'dao_tao' ? 3 : 0,
        soTietLT: lt,
        soTietTH: th,
        heSoLop: heSo,
        tongTietQC: qc,
        donGiaTiet: donGia,
        tongTienThuLao: tongThuLao,
        thueTNCN: thue,
        thucNhan: tongThuLao - thue,
        soTaiKhoan: '1028746' + (10000 + index),
        nganHang: 'VietinBank CN Cần Thơ',
        nguoiThucHien: `${currentDeptMeta.name} upload Excel`,
        trangThai: item.isDuplicate ? 'trung_lap' : 'hop_le',
        dotThanhToan: 'Đợt 1 - Học kỳ 2 (2023 - 2024)',
      };
    });

    onImportTeaching(records, isAppendMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-300">
        {/* Header #005325 */}
        <div className="bg-[#005325] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <h3 className="font-semibold text-[13.5px]">
              Kê khai & Upload file Excel theo đơn vị quản lý TDU
            </h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 text-[12.5px]">
          {/* Department Unit Selection */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded text-[12px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#005325] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#005325]" />
                Đơn vị chịu trách nhiệm kê khai & upload:
              </span>
              <select
                value={departmentUnit}
                onChange={(e) => onDepartmentChange(e.target.value as DepartmentUnit)}
                className="bg-white border border-[#005325] rounded px-2.5 py-1 text-[12px] font-semibold text-[#005325] focus:outline-none"
              >
                <option value="dao_tao">1. Phòng Đào tạo (Giờ giảng dạy)</option>
                <option value="khao_thi">2. Trung tâm Khảo thí (Coi thi & Chấm thi)</option>
                <option value="tuyen_sinh">3. Phòng Tuyển sinh (Công tác tuyển sinh)</option>
              </select>
            </div>
            <div className="text-slate-600 text-[11.5px] border-t border-emerald-100 pt-1.5">
              <strong>Nhiệm vụ kê khai:</strong> {currentDeptMeta.task}
            </div>
          </div>

          <div className="border-2 border-dashed border-emerald-300/80 rounded p-5 text-center hover:border-[#005325] transition-colors bg-[#f8faf9]">
            <Upload className="w-8 h-8 text-[#005325]/70 mx-auto mb-2" />
            <p className="text-slate-800 font-semibold">
              Kéo thả hoặc duyệt file Excel của {currentDeptMeta.name}
            </p>
            <p className="text-slate-500 text-[11.5px] mt-0.5">
              Mẫu áp dụng: <strong className="text-[#005325]">{currentDeptMeta.sample}</strong>
            </p>
            <label className="mt-3 inline-block px-4 py-1.5 bg-[#005325] text-white text-[12px] font-medium rounded cursor-pointer hover:bg-[#00421e] transition-colors shadow-sm">
              <span>Duyệt tập tin (.xlsx, .csv)</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {fileError && (
            <div className="p-2.5 bg-red-50 text-red-700 rounded border border-red-200 flex items-center gap-2 text-[12px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{fileError}</span>
            </div>
          )}

          {/* Validation Engine Results Summary */}
          {file && parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-[12px]">
                <div>
                  <span className="font-semibold text-slate-800">Tập tin: {file.name}</span>
                  <div className="text-[11.5px] text-slate-500">
                    Đã phân tích <strong>{parsedRows.length}</strong> dòng hoạt động thuộc <strong>{currentDeptMeta.name}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[11px] border border-emerald-200">
                    {errorSummary.valid} Hợp lệ
                  </span>
                  {errorSummary.duplicates > 0 && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold text-[11px] border border-amber-200">
                      {errorSummary.duplicates} Trùng lặp
                    </span>
                  )}
                  {errorSummary.errors > 0 && (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-semibold text-[11px] border border-rose-200">
                      {errorSummary.errors} Lỗi
                    </span>
                  )}
                </div>
              </div>

              {/* Errors detail box if any */}
              {validationErrors.length > 0 && (
                <div className="max-h-28 overflow-y-auto border border-amber-200 rounded bg-amber-50/50 p-2 text-[11.5px] space-y-1">
                  <div className="font-semibold text-amber-900 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Cảnh báo & Kiểm tra tự động ({validationErrors.length} mục):</span>
                  </div>
                  {validationErrors.map((err, i) => (
                    <div key={i} className="text-slate-700 flex items-center gap-1.5 pl-4">
                      <span className="font-mono text-slate-500">Dòng {err.row}:</span>
                      <span className="font-medium text-slate-900">[{err.col}]</span>
                      <span>{err.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded border border-slate-300 cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleApply}
              disabled={parsedRows.length === 0}
              className="px-4 py-1.5 bg-[#005325] hover:bg-[#00421e] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded font-medium shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Nạp vào cơ sở dữ liệu tập trung ({parsedRows.length} dòng)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
