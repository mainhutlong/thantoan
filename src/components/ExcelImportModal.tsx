import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  UploadCloud,
  Download,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Trash2,
  Building2,
  FileWarning,
  Check,
  ShieldCheck,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { TeachingRecord, AppMode, PaymentRuleConfig, DepartmentUnit } from '../types';
import { generateDepartmentExcelTemplate, stripAcademicTitle } from '../utils/excelTemplateGenerator';
import { findJobDutyByCode, calculateDutyHours } from '../data/jobDutyCatalog';
import {
  TDU_ORGANIZATION_UNITS,
  findOrganizationUnit,
  validatePersonnelBySelectedUnit,
  PersonnelRowValidationResult,
  OrganizationUnit,
  UnitBlockCategory,
} from '../data/personnelCatalog';

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
  currentPeriodName?: string;
  onDownloadTemplate?: () => void;
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
  currentPeriodName = 'Học kỳ 1 2026-2027',
}) => {
  // 1. Quản lý Đơn vị đang stick chọn theo 4 Khối
  const [selectedUnitId, setSelectedUnitId] = useState<string>('pb_dao_tao');
  const [selectedBlockTab, setSelectedBlockTab] = useState<UnitBlockCategory>('khoi_phong_ban');

  // 2. Quản lý File và ma trận dữ liệu
  const [file, setFile] = useState<File | null>(null);
  const [rawWorkbookData, setRawWorkbookData] = useState<{
    headers: string[];
    headerRowIdx: number;
    rows: any[][];
  } | null>(null);

  // 3. Quản lý Lỗi kiểm tra đơn vị và cảnh báo
  const [unitValidationErrors, setUnitValidationErrors] = useState<PersonnelRowValidationResult[]>([]);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [generalValidationErrors, setGeneralValidationErrors] = useState<ValidationError[]>([]);
  const [ignoreUnitErrors, setIgnoreUnitErrors] = useState<boolean>(false);

  const [fileError, setFileError] = useState<string | null>(null);
  const [localAppendMode, setLocalAppendMode] = useState<boolean>(isAppendMode);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // 4. Quản lý Ô / Dialog Xác nhận lần cuối trước khi Import
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  // Đồng bộ props append mode
  useEffect(() => {
    setLocalAppendMode(isAppendMode);
  }, [isAppendMode]);

  // Đồng bộ selectedUnitId khi props departmentUnit thay đổi
  useEffect(() => {
    if (departmentUnit) {
      if (departmentUnit === 'dao_tao') setSelectedUnitId('pb_dao_tao');
      else if (departmentUnit === 'khao_thi') setSelectedUnitId('tt_khao_thi_dbcl');
      else if (departmentUnit === 'nckh') setSelectedUnitId('pb_qlkh_htqt');
      else if (departmentUnit === 'tuyen_sinh') setSelectedUnitId('pb_tuyen_sinh_truyen_thong');
      else if (departmentUnit === 'co_van_hoc_tap') setSelectedUnitId('pb_ctct_qlsv');
      else if (departmentUnit === 'cong_tac_khac') setSelectedUnitId('pb_quan_tri_thiet_bi');
      else if (departmentUnit === 'all') setSelectedUnitId('all');
    }
  }, [departmentUnit]);

  // Reset toàn bộ state khi đóng/mở modal
  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setRawWorkbookData(null);
      setParsedRows([]);
      setUnitValidationErrors([]);
      setGeneralValidationErrors([]);
      setIgnoreUnitErrors(false);
      setFileError(null);
      setIsConfirmOpen(false);
    }
  }, [isOpen]);

  // Thông tin đơn vị hiện tại đang stick chọn
  const currentSelectedUnit = useMemo<OrganizationUnit>(() => {
    return findOrganizationUnit(selectedUnitId) || TDU_ORGANIZATION_UNITS[0];
  }, [selectedUnitId]);

  // Chuẩn hóa chuỗi tìm kiếm không dấu
  const normalizeStr = (s: any) =>
    String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

  // Map đơn vị stick chọn sang DepartmentUnit tương ứng cho việc tính thù lao & tải file mẫu
  const mappedDepartmentUnit: DepartmentUnit = useMemo(() => {
    return currentSelectedUnit.mappedDeptUnit || 'dao_tao';
  }, [currentSelectedUnit]);

  // Meta thông tin file mẫu
  const departmentMeta: { [key in DepartmentUnit]: { name: string; task: string; sample: string } } = {
    dao_tao: {
      name: 'Phòng Đào tạo',
      task: 'Giờ giảng dạy lý thuyết, thực hành, bài tập',
      sample: 'Mau_Thanh_Toan_Gio_Giang_TDU.xlsx',
    },
    khao_thi: {
      name: 'Trung tâm Khảo thí và Đảm bảo chất lượng',
      task: 'Coi thi, chấm thi tự luận/trắc nghiệm, ra đề thi',
      sample: 'Mau_Khao_Thi_Coi_Cham_Thi_TDU.xlsx',
    },
    do_an: {
      name: 'Đồ án & Khóa luận tốt nghiệp',
      task: 'Hướng dẫn thực tập, BTL, đồ án môn học, khóa luận tốt nghiệp',
      sample: 'Mau_Do_An_Khoa_Luan_Tot_Nghiep_TDU.xlsx',
    },
    tuyen_sinh: {
      name: 'Phòng Tuyển sinh và Truyền thông',
      task: 'Công tác tư vấn tuyển sinh THPT, ngày hội hướng nghiệp',
      sample: 'Mau_Tuyen_Sinh_Truyen_Thong_TDU.xlsx',
    },
    nckh: {
      name: 'Phòng Quản lý khoa học – Hợp tác quốc tế',
      task: 'Nghiên cứu khoa học, bài báo quốc tế, đề tài khoa học',
      sample: 'Mau_NCKH_Sau_Dai_Hoc_TDU.xlsx',
    },
    co_van_hoc_tap: {
      name: 'Phòng Công tác Chính trị - Quản lý Sinh viên',
      task: 'Kê khai công tác cố vấn học tập, quản lý lớp sinh viên',
      sample: 'Mau_Co_Van_Hoc_Tap_TDU.xlsx',
    },
    cong_tac_khac: {
      name: 'Công tác khác (Thực tập, Đồ án, PTN, ĐBCL...)',
      task: 'Kê khai công tác khác: Hướng dẫn thực tập, đồ án môn học, niên luận, PTN, ĐBCL...',
      sample: 'Mau_Cong_Tac_Khac_TDU_2026_2027.xlsx',
    },
    all: {
      name: 'Toàn trường (Tổng hợp)',
      task: 'Tổng hợp các hoạt động đào tạo toàn trường',
      sample: 'Mau_Ke_Khai_Tong_Hop_TDU.xlsx',
    },
  };

  const currentDeptMeta = departmentMeta[mappedDepartmentUnit] || departmentMeta.dao_tao;

  /**
   * ĐỘNG CƠ PHÂN TÍCH & ĐỐI SOÁT ĐƠN VỊ:
   * Tự động duyệt qua dữ liệu dòng và kiểm tra tính hợp lệ của mã nhân sự so với đơn vị được stick chọn.
   */
  const validateRowsAgainstUnit = useCallback(
    (rows: any[][], headers: string[], headerRowIdx: number, unitId: string) => {
      const normHeaders = headers.map((h) => normalizeStr(h));

      const getCol = (keywords: string[], fallback: number): number => {
        for (const kw of keywords) {
          const foundIdx = normHeaders.findIndex((h) => h === kw || h.includes(kw));
          if (foundIdx !== -1) return foundIdx;
        }
        return fallback;
      };

      const colMaGV = getCol(['magv', 'manhansu', 'magiangvien', 'ma', 'manhanvien'], 1);
      const colHoTen = getCol(['hoten', 'hovaten', 'giangvien', 'tengiangvien'], 2);
      const colMaLop = getCol(['lop', 'malophocphan', 'malop', 'lophp', 'madetai', 'soissn'], 4);
      const colThucGiang = getCol(
        ['sogiothucgiang', 'thucgiang', 'giothucgiang', 'sogioquydoi', 'gioquydoi', 'tietquydoi', 'sogio', 'sotietqcquydoi'],
        8
      );
      const colLT = getCol(['tietlythuyet', 'tietlt', 'lythuyet', 'lt'], -1);
      const colTH = getCol(['tietthuchanh', 'tietth', 'thuchanh', 'th'], -1);
      const colMaCV = getCol(['macv', 'macongviec', 'manhiemvu'], -1);
      const colSoLuong = getCol(['soluong', 'soluongsv', 'sosinhvien', 'songay', 'soluot', 'sobai', 'sode'], -1);
      const colKhoa = getCol(['khoabomon', 'khoa', 'bomon', 'donvi', 'phongban'], 13);

      const unitErrors: PersonnelRowValidationResult[] = [];
      const generalErrors: ValidationError[] = [];

      const processed = rows.map((row: any, idx: number) => {
        const rowNum = headerRowIdx + 2 + idx;

        const rawMaGV = String(row[colMaGV] || '').trim();
        const rawHoTen = stripAcademicTitle(String(row[colHoTen] || '').trim());
        const rawKhoa = colKhoa !== -1 && row[colKhoa] ? String(row[colKhoa]).trim() : '';
        const maLop = String(row[colMaLop] || `HP_${idx + 1}`).trim();
        const thucGiang = Number(row[colThucGiang]) || 0;
        const lt = Number(colLT !== -1 ? row[colLT] : 0) || 0;
        const th = Number(colTH !== -1 ? row[colTH] : 0) || 0;
        const rawMaCV = colMaCV !== -1 && row[colMaCV] ? String(row[colMaCV]).trim().toUpperCase() : '';
        const rawSL = colSoLuong !== -1 ? Number(row[colSoLuong]) : 0;
        const dutyItem = rawMaCV ? findJobDutyByCode(rawMaCV) : undefined;
        const calculatedHours = dutyItem ? calculateDutyHours(rawMaCV, rawSL || 1) : 0;

        // KIỂM TRA ĐƠN VỊ & MÃ NHÂN SỰ THEO ĐƠN VỊ ĐÃ STICK CHỌN
        const unitValidation = validatePersonnelBySelectedUnit(rowNum, rawMaGV, rawHoTen, rawKhoa, unitId);

        if (!unitValidation.isValid) {
          unitErrors.push(unitValidation);
        }

        // Kiểm tra nội dung cơ bản
        if (!rawHoTen) {
          generalErrors.push({
            row: rowNum,
            col: 'Họ và tên',
            message: 'Thiếu họ và tên nhân sự / giảng viên',
            type: 'error',
          });
        }

        if (thucGiang === 0 && lt === 0 && th === 0 && calculatedHours === 0) {
          generalErrors.push({
            row: rowNum,
            col: 'Số giờ / Tiết',
            message: 'Chưa có số giờ thực hiện hoặc số lượng công việc',
            type: 'warning',
          });
        }

        const isDuplicate = currentRecords.some(
          (cr) => cr.maLopHocPhan.toLowerCase() === maLop.toLowerCase() && maLop !== ''
        );
        if (isDuplicate) {
          generalErrors.push({
            row: rowNum,
            col: 'Mã lớp / Đợt',
            message: `Mã ${maLop} đã tồn tại trong đợt này`,
            type: 'duplicate',
          });
        }

        return {
          idx,
          rowNum,
          values: row,
          headers,
          isDuplicate,
          unitValidation,
          isUnitValid: unitValidation.isValid,
        };
      });

      setUnitValidationErrors(unitErrors);
      setGeneralValidationErrors(generalErrors);
      setParsedRows(processed);
    },
    [currentRecords]
  );

  /**
   * Đọc và xử lý file Excel
   */
  const processFile = (selectedFile: File) => {
    setFileError(null);
    setFile(selectedFile);
    setIgnoreUnitErrors(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName =
          workbook.SheetNames.find(
            (s) =>
              s.toLowerCase().includes('ke_khai') ||
              s.toLowerCase().includes('gio_giang') ||
              s.toLowerCase().includes('danh_sach') ||
              s.toLowerCase().includes('thanh_toan')
          ) || workbook.SheetNames[0];

        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (json.length < 2) {
          setFileError('Tập tin Excel không có dòng dữ liệu hợp lệ.');
          return;
        }

        // Tự động dò dòng tiêu đề cột
        let headerRowIdx = 0;
        for (let i = 0; i < Math.min(json.length, 20); i++) {
          const row = json[i];
          if (!Array.isArray(row)) continue;
          const rowStr = row.map((c) => normalizeStr(c)).join(' ');
          if (
            (rowStr.includes('magv') ||
              rowStr.includes('manhansu') ||
              rowStr.includes('magiangvien') ||
              rowStr.includes('hoten') ||
              rowStr.includes('tengiangvien')) &&
            (rowStr.includes('mon') ||
              rowStr.includes('hocphan') ||
              rowStr.includes('thucgiang') ||
              rowStr.includes('quydoi') ||
              rowStr.includes('lop') ||
              rowStr.includes('nckh') ||
              rowStr.includes('nhiemvu') ||
              rowStr.includes('chucdanh') ||
              rowStr.includes('phanloai') ||
              rowStr.includes('sinhvien') ||
              rowStr.includes('donvi'))
          ) {
            headerRowIdx = i;
            break;
          }
        }

        const rawHeaders = (json[headerRowIdx] as string[]) || [];

        const dataRows = json.slice(headerRowIdx + 1).filter((r: any) => {
          if (!r || !Array.isArray(r) || r.length === 0) return false;
          const rowStr = r.map((c: any) => normalizeStr(c)).join(' ');
          if (
            (rowStr.includes('magiangvien') && rowStr.includes('hovaten')) ||
            (rowStr.includes('manhanvien') && rowStr.includes('hovaten')) ||
            (rowStr.includes('mongiangday') && rowStr.includes('malophocphan')) ||
            (rowStr.includes('sosinhvien') && rowStr.includes('sogiomonhoc')) ||
            rowStr.startsWith('tongcong') ||
            rowStr.startsWith('luuy') ||
            rowStr.startsWith('ghichu') ||
            rowStr.startsWith('nguoilap') ||
            rowStr.startsWith('xacnhan')
          ) {
            return false;
          }
          return r.some((c: any) => c !== null && c !== '' && String(c).trim() !== '');
        });

        setRawWorkbookData({
          headers: rawHeaders,
          headerRowIdx,
          rows: dataRows,
        });

        validateRowsAgainstUnit(dataRows, rawHeaders, headerRowIdx, selectedUnitId);
      } catch (err: any) {
        setFileError('Lỗi khi đọc file Excel: ' + (err?.message || 'Định dạng không được hỗ trợ'));
      }
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  /**
   * Khi người dùng click stick chọn Đơn vị mới:
   * Tự động chạy lại kiểm tra toàn bộ file theo đơn vị mới được stick
   */
  const handleSelectUnit = (unitId: string) => {
    setSelectedUnitId(unitId);

    const unit = findOrganizationUnit(unitId);
    if (unit?.mappedDeptUnit) {
      onDepartmentChange(unit.mappedDeptUnit);
    }

    if (rawWorkbookData) {
      validateRowsAgainstUnit(
        rawWorkbookData.rows,
        rawWorkbookData.headers,
        rawWorkbookData.headerRowIdx,
        unitId
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) processFile(droppedFile);
  };

  // Tải file mẫu chuẩn
  const handleDownloadTemplateClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      generateDepartmentExcelTemplate(mappedDepartmentUnit, currentPeriodName);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Lỗi khi tải file mẫu Excel:', err);
    }
  };

  // Xuất danh sách lỗi ra file Excel
  const handleExportErrorList = () => {
    if (unitValidationErrors.length === 0) return;

    try {
      const errorRows = unitValidationErrors.map((err, i) => ({
        STT: i + 1,
        'Dòng Excel': `Dòng ${err.rowNumber}`,
        'Mã nhân sự': err.maNhanSu,
        'Họ và tên': err.hoTen,
        'Đơn vị ghi trong file': err.donViTrongFile || '(Không có)',
        'Đơn vị thực tế tại TDU': err.donViThucTe || 'Chưa xác định',
        'Đơn vị chọn import': err.selectedUnitName,
        'Lý do từ chối import': err.reason,
        'Hướng dẫn xử lý': 'Chuyển sang file của đơn vị tương ứng hoặc sửa lại mã nhân sự đúng trong danh bạ TDU.',
      }));

      const ws = XLSX.utils.json_to_sheet(errorRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Danh_Sach_Loi_Don_Vi');

      const fileName = `Bao_Cao_Loi_Import_${normalizeStr(currentSelectedUnit.name)}_${Date.now()}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error('Lỗi khi xuất danh sách lỗi:', err);
    }
  };

  /**
   * Bấm nút "Import dữ liệu":
   * Kiểm tra điều kiện và mở ô xác nhận lại lần nữa (Confirmation Dialog)
   */
  const handleTriggerImport = () => {
    if (!file || parsedRows.length === 0) return;

    if (unitValidationErrors.length > 0 && !ignoreUnitErrors) {
      alert(
        `Phát hiện ${unitValidationErrors.length} hàng có lỗi đơn vị/mã nhân sự. Vui lòng kiểm tra lại file hoặc tích chọn "Bỏ qua các hàng lỗi này" để tiếp tục import các dòng hợp lệ.`
      );
      return;
    }

    const validCount = parsedRows.filter((r) => r.isUnitValid).length;
    if (ignoreUnitErrors && validCount === 0) {
      alert('Không có dòng dữ liệu hợp lệ nào để import.');
      return;
    }

    // Mở hộp thoại xác nhận lần cuối trước khi nạp dữ liệu
    setIsConfirmOpen(true);
  };

  /**
   * Khi người dùng đã bấm "Xác nhận Import" trong ô xác nhận
   */
  const handleConfirmFinalImport = () => {
    setIsConfirmOpen(false);

    let rowsToImport = parsedRows;
    if (unitValidationErrors.length > 0 && ignoreUnitErrors) {
      rowsToImport = parsedRows.filter((item) => item.isUnitValid);
    }

    if (rowsToImport.length === 0) return;

    const rawHeaders = parsedRows[0]?.headers || [];
    const normHeaders = rawHeaders.map((h: any) => normalizeStr(h));

    const getCol = (keywords: string[], fallback: number): number => {
      for (const kw of keywords) {
        const foundIdx = normHeaders.findIndex((h: string) => h === kw || h.includes(kw));
        if (foundIdx !== -1) return foundIdx;
      }
      return fallback;
    };

    const colMaGV = getCol(['magv', 'manhansu', 'magiangvien', 'ma', 'manhanvien'], 1);
    const colHoTen = getCol(['hoten', 'hovaten', 'giangvien', 'tengiangvien'], 2);
    const colHocPhan = getCol(
      [
        'mongiangday',
        'tenhocphan',
        'hocphan',
        'tenmon',
        'monhoc',
        'nhiemvu',
        'tendetai',
        'baibao',
        'luanvan',
        'noidungnckh',
        'noidung',
        'tencongtrinh',
      ],
      3
    );
    const colMaLop = getCol(['lop', 'malophocphan', 'malop', 'lophp', 'madetai', 'soissn'], 4);
    const colTheLoaiNCKH = getCol(['theloainckh', 'theloai', 'loaihinhnckh', 'loaihoatdong', 'loai'], -1);
    const colGioQCNCKH = getCol(['sogioquydoi', 'gioquydoi', 'tietquydoi', 'sogioqcnckh', 'soqc', 'sotietqcquydoi'], -1);
    const colMucDoHoanThanh = getCol(['mucdohoanthanh', 'hoanthanh', 'mucdo'], -1);
    const colMaCV = getCol(['macv', 'macongviec', 'manhiemvu'], -1);
    const colSoLuong = getCol(['soluong', 'soluongsv', 'sosinhvien', 'songay', 'soluot', 'sobai', 'sode'], -1);
    const colDieuKien = getCol(['dieukien', 'donvitinh', 'dinhmuc', 'dvt'], -1);
    const colCanCu = getCol(['cancu', 'thoigian', 'quyetdinh', 'soqd', 'thoigianphancong'], -1);
    const colSinhVien = getCol(['sosv', 'sisosinhvien', 'siso', 'sosinhvien'], 5);
    const colNhom = getCol(['sonhom', 'nhom'], 6);
    const colGioMH = getCol(['sogiomonhoc', 'giomonhoc', 'giomh'], 7);
    const colThucGiang = getCol(['sogiothucgiang', 'thucgiang', 'giothucgiang', 'sogioquydoi', 'gioquydoi', 'tietquydoi', 'sogio', 'sotietqcquydoi'], 8);
    const colHsLop = getCol(['hesolopnhom', 'hesolop', 'hesonhom', 'hslop'], 9);
    const colHsTC = getCol(['hesotinchi', 'hesotc', 'hstc'], 10);
    const colPhanLoai = getCol(['phanloaigiangday', 'phanloai', 'loaihinh', 'hinhthuc'], 11);
    const colHocVi = getCol(['hocvi', 'hocham', 'chucdanh'], 12);
    const colKhoa = getCol(['khoabomon', 'khoa', 'bomon', 'donvi', 'phongban'], 13);
    const colSTK = getCol(['sotaikhoan', 'sotk', 'stk', 'taikhoan'], 14);
    const colNganHang = getCol(['nganhang'], 15);
    const colDot = getCol(['dotthanhtoan', 'dot', 'hocky'], 16);
    const colNgaySinh = getCol(['ngaysinh', 'sinh'], -1);
    const colCCCD = getCol(['socccd', 'cccd', 'cmnd', 'cancuoc'], -1);
    const colLT = getCol(['tietlythuyet', 'tietlt', 'lythuyet', 'lt'], -1);
    const colTH = getCol(['tietthuchanh', 'tietth', 'thuchanh', 'th'], -1);
    const colTinChi = getCol(['sotinchi', 'tinchi', 'sotc', 'tc'], -1);

    const records: TeachingRecord[] = rowsToImport.map((item, index) => {
      const vals = item.values;
      const maGV = String(vals[colMaGV] || 'TDU' + (1000 + index)).trim();
      const hoTen = stripAcademicTitle(
        String(vals[colHoTen] || item.unitValidation?.personnel?.hoTen || 'Giảng viên TDU ' + (index + 1)).trim()
      );
      const ngaySinh = String((colNgaySinh !== -1 ? vals[colNgaySinh] : '') || '15/08/1985');
      const soCCCD = String((colCCCD !== -1 ? vals[colCCCD] : '') || '09208500' + (1000 + index));
      const hocVi = String(vals[colHocVi] || item.unitValidation?.personnel?.hocVi || 'ThS');
      const khoa = String(vals[colKhoa] || item.unitValidation?.personnel?.donVi || currentSelectedUnit.name);

      const rawMaCV = colMaCV !== -1 && vals[colMaCV] ? String(vals[colMaCV]).trim().toUpperCase() : '';
      const rawSoLuong =
        colSoLuong !== -1 && vals[colSoLuong] !== undefined && vals[colSoLuong] !== ''
          ? Number(vals[colSoLuong])
          : undefined;
      const rawDieuKien = colDieuKien !== -1 && vals[colDieuKien] ? String(vals[colDieuKien]).trim() : '';
      const rawCanCu = colCanCu !== -1 && vals[colCanCu] ? String(vals[colCanCu]).trim() : '';

      const dutyCatalogItem = rawMaCV ? findJobDutyByCode(rawMaCV) : undefined;
      let finalTenHocPhan = String(vals[colHocPhan] || '');
      if (mappedDepartmentUnit === 'cong_tac_khac') {
        if (!finalTenHocPhan || finalTenHocPhan === currentDeptMeta.task) {
          finalTenHocPhan = dutyCatalogItem?.tenCV || 'Nhiệm vụ công tác khác & ĐBCL';
        }
      } else if (!finalTenHocPhan) {
        finalTenHocPhan = currentDeptMeta.task;
      }

      const hocPhan = finalTenHocPhan;
      const maLop = String(
        vals[colMaLop] || (rawMaCV ? `${rawMaCV}_${index + 1}` : `${mappedDepartmentUnit.toUpperCase()}_${100 + index}_TDU`)
      ).trim();

      const rawPhanLoai = normalizeStr(vals[colPhanLoai]);
      const phanLoaiGiangDay: 'ly_thuyet' | 'thuc_hanh_thuc_tap' =
        rawPhanLoai.includes('thuc') || rawPhanLoai.includes('lab')
          ? 'thuc_hanh_thuc_tap'
          : 'ly_thuyet';

      const soTinChi =
        Number(colTinChi !== -1 ? vals[colTinChi] : (mappedDepartmentUnit === 'dao_tao' ? 3 : 0)) ||
        (mappedDepartmentUnit === 'dao_tao' ? 3 : 0);
      const soSinhVien = Number(vals[colSinhVien]) || 60;
      const soNhom = Number(vals[colNhom]) || 1;
      const soGioMonHoc = Number(vals[colGioMH]) || 45;

      let lt = Number(colLT !== -1 ? vals[colLT] : 0) || 0;
      let th = Number(colTH !== -1 ? vals[colTH] : 0) || 0;
      let thucGiang = Number(vals[colThucGiang]) || 0;

      if (mappedDepartmentUnit === 'nckh') {
        const nckhHours = Number(colGioQCNCKH !== -1 ? vals[colGioQCNCKH] : vals[colThucGiang]) || thucGiang || 0;
        if (nckhHours > 0) thucGiang = nckhHours;
      } else if (mappedDepartmentUnit === 'cong_tac_khac') {
        const dutyHours =
          Number(vals[colThucGiang]) || (dutyCatalogItem ? calculateDutyHours(rawMaCV, rawSoLuong || 1) : 0);
        if (dutyHours > 0) thucGiang = dutyHours;
      }

      if (thucGiang === 0 && (lt > 0 || th > 0)) {
        thucGiang = lt + th;
      } else if (thucGiang > 0 && lt === 0 && th === 0) {
        if (phanLoaiGiangDay === 'thuc_hanh_thuc_tap') th = thucGiang;
        else lt = thucGiang;
      } else if (thucGiang === 0) {
        thucGiang = mappedDepartmentUnit === 'nckh' ? 60 : mappedDepartmentUnit === 'cong_tac_khac' ? 20 : 30;
        if (phanLoaiGiangDay === 'thuc_hanh_thuc_tap') th = 30;
        else lt = 30;
      }

      const heSoLop = Number(vals[colHsLop]) || 1.0;
      const heSoTinChi = Number(vals[colHsTC]) || 1.0;
      const donGia = config.rates[hocVi] || (mappedDepartmentUnit === 'nckh' ? 180000 : 150000);
      const qc =
        mappedDepartmentUnit === 'nckh' || mappedDepartmentUnit === 'cong_tac_khac'
          ? thucGiang
          : Number((thucGiang * heSoLop * heSoTinChi).toFixed(2));
      const tongThuLao = Math.round(qc * donGia);
      const thue = Math.round(tongThuLao * config.taxRate);

      const soTaiKhoan = String(vals[colSTK] || '1028746' + (10000 + index));
      const nganHang = String(vals[colNganHang] || 'VietinBank CN Cần Thơ');
      const dotThanhToan = String(vals[colDot] || currentPeriodName || 'Học kỳ 1 2026-2027').trim();

      const rawTheLoai = colTheLoaiNCKH !== -1 && vals[colTheLoaiNCKH] ? String(vals[colTheLoaiNCKH]).trim() : '';
      const theLoaiNCKH = rawTheLoai || (mappedDepartmentUnit === 'nckh' ? 'Bài báo khoa học / Đề tài' : undefined);
      const rawHoanThanh = colMucDoHoanThanh !== -1 && vals[colMucDoHoanThanh] ? String(vals[colMucDoHoanThanh]).toLowerCase() : '';
      const mucDoHoanThanhNCKH =
        mappedDepartmentUnit === 'nckh'
          ? rawHoanThanh.includes('khong') || rawHoanThanh.includes('chua')
            ? 'khong_hoan_thanh'
            : 'hoan_thanh'
          : undefined;

      return {
        id: `tdu-${mappedDepartmentUnit}-${Date.now()}-${index}`,
        tt: index + 1,
        maGV,
        hoTen,
        ngaySinh,
        soCCCD,
        hocHamHocVi: hocVi,
        khoaBoMon: khoa,
        phongBanQuanLy: mappedDepartmentUnit,
        loaiHoatDong:
          mappedDepartmentUnit === 'nckh'
            ? theLoaiNCKH || 'Nghiên cứu khoa học'
            : mappedDepartmentUnit === 'cong_tac_khac'
            ? dutyCatalogItem?.nhomCV || 'Công tác khác'
            : currentDeptMeta.task,
        tenHocPhan: hocPhan,
        maLopHocPhan: maLop,
        noiDungNCKH: mappedDepartmentUnit === 'nckh' ? hocPhan : undefined,
        theLoaiNCKH,
        soGioQCNCKH: mappedDepartmentUnit === 'nckh' ? qc : undefined,
        dinhMucNCKH:
          mappedDepartmentUnit === 'nckh'
            ? hocVi.includes('GS') || hocVi.includes('PGS')
              ? 200
              : 150
            : undefined,
        mucDoHoanThanhNCKH,
        phanLoaiGiangDay,
        soTinChi,
        soSinhVien,
        soNhom,
        soGioMonHoc,
        soGioThucGiang: thucGiang,
        soTietLT: lt,
        soTietTH: th,
        heSoLop,
        heSoLopNhom: heSoLop,
        heSoTinChi,
        soGioQuyChuan: qc,
        tongTietQC: qc,
        donGiaTiet: donGia,
        tongTienThuLao: tongThuLao,
        thueTNCN: thue,
        thucNhan: tongThuLao - thue,
        soTaiKhoan,
        nganHang,
        nguoiThucHien: `${currentSelectedUnit.name} import`,
        trangThai: item.isDuplicate ? 'trung_lap' : 'hop_le',
        dotThanhToan,
        maCV: rawMaCV || undefined,
        soLuong: rawSoLuong,
        dieuKien: rawDieuKien || dutyCatalogItem?.dieuKien,
        nhiemVuKiemNhiem: mappedDepartmentUnit === 'cong_tac_khac' ? hocPhan : undefined,
        ghiChu: rawCanCu || (mappedDepartmentUnit === 'cong_tac_khac' ? dutyCatalogItem?.ghiChu : undefined),
      };
    });

    onImportTeaching(records, localAppendMode);
    onClose();
  };

  if (!isOpen) return null;

  // Lọc danh sách đơn vị theo Khối được chọn
  const displayUnits = TDU_ORGANIZATION_UNITS.filter((u) => {
    if (selectedBlockTab === 'toan_truong') return true;
    return u.category === selectedBlockTab;
  });

  const validRowCount = parsedRows.filter((r) => r.isUnitValid).length;
  const errorRowCount = unitValidationErrors.length;
  const willImportCount = ignoreUnitErrors ? validRowCount : errorRowCount === 0 ? validRowCount : 0;

  return (
    <>
      {/* POPUP IMPORT CHÍNH: KHÔNG CÓ VIỀN XANH (Border trung tính border-slate-200/slate-300) */}
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div className="bg-white w-full max-w-2xl max-h-[92vh] rounded-[24px] shadow-2xl overflow-hidden border border-slate-200 relative animate-fadeIn flex flex-col shrink-0">
          {/* Nút đóng X ở góc trên bên phải */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer z-20"
            title="Đóng popup"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>

          {/* HEADER MODAL - Không dùng viền xanh lá */}
          <div className="px-6 pt-5 pb-3.5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/70">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 shadow-2xs">
              <UploadCloud className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div className="min-w-0 pr-8">
              <h3 className="text-[17px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Import dữ liệu thanh toán & thù lao</span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {currentPeriodName}
                </span>
              </h3>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Kéo thả file ở trên và chọn Đơn vị/Phòng ban bên dưới để đối soát mã nhân sự
              </p>
            </div>
          </div>

          {/* BODY MODAL CÓ CUỘN */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
            {/* ======================================================== */}
            {/* 1. Ở TRÊN: Ô KÉO THẢ UPLOAD FILE EXCEL (Theo yêu cầu)    */}
            {/* ======================================================== */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[12.5px] font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-slate-600" />
                  <span>1. Chọn hoặc kéo thả tập tin Excel (.xlsx, .xls)</span>
                  <span className="text-red-500">*</span>
                </span>

                {/* Nút tải file mẫu */}
                <a
                  href={`/templates/${currentDeptMeta.sample}`}
                  download={currentDeptMeta.sample}
                  onClick={handleDownloadTemplateClick}
                  className="text-[11.5px] font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 cursor-pointer no-underline"
                  title="Tải biểu mẫu Excel chuẩn"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloadSuccess ? 'Đã tải mẫu xong!' : 'Tải file mẫu chuẩn'}</span>
                </a>
              </div>

              {/* Khung kéo thả: Viền nét đứt trung tính (KHÔNG CÓ VIỀN XANH) */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all bg-slate-50/40 ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/30'
                    : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/70'
                }`}
              >
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  id="excel-file-upload-input"
                  className="hidden"
                />

                <div className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-600 mx-auto mb-1.5">
                  <UploadCloud className="w-4.5 h-4.5 stroke-[1.8]" />
                </div>

                <div className="font-semibold text-slate-800 text-[13px]">
                  Kéo thả file Excel vào đây hoặc bấm nút để chọn file
                </div>

                <div className="text-slate-400 text-[11px] mt-0.5">
                  Định dạng hỗ trợ: XLS, XLSX — Tối đa 20MB
                </div>

                <div className="mt-2.5 flex items-center justify-center gap-2">
                  <label
                    htmlFor="excel-file-upload-input"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11.5px] shadow-2xs cursor-pointer transition-colors"
                  >
                    Chọn file từ máy
                  </label>
                </div>
              </div>

              {/* Thông báo lỗi file */}
              {fileError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-2 text-[12px]">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{fileError}</span>
                </div>
              )}

              {/* Thẻ hiển thị thông tin file đã chọn */}
              {file && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 animate-fadeIn">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-blue-600 flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-[12.5px] truncate" title={file.name}>
                        {file.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {(file.size / 1024).toFixed(1)} KB · Đã đọc <strong>{parsedRows.length}</strong> hàng
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-2 py-0.5 bg-slate-200/80 text-slate-800 rounded-md font-semibold text-[11px]">
                      {validRowCount} hợp lệ
                    </span>
                    {errorRowCount > 0 && (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md font-semibold text-[11px]">
                        {errorRowCount} sai đơn vị
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setRawWorkbookData(null);
                        setParsedRows([]);
                        setUnitValidationErrors([]);
                        setGeneralValidationErrors([]);
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer ml-1"
                      title="Gỡ bỏ file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ======================================================== */}
            {/* 2. Ở DƯỚI: BOX DẠNG LIST CHỨA DANH SÁCH 4 KHỐI ĐƠN VỊ   */}
            {/* BỎ NỘI DUNG BÊN PHẢI VÀ BỎ DESCRIPTION THEO YÊU CẦU       */}
            {/* ======================================================== */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[12.5px] font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-600" />
                  <span>2. Danh sách Đơn vị tiếp nhận dữ liệu (Chia làm 4 Khối)</span>
                  <span className="text-red-500">*</span>
                </span>
              </div>

              {/* TABS CHUYỂN 4 KHỐI (KHÔNG CÓ VIỀN XANH) */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11.5px] font-medium scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedBlockTab('khoi_phong_ban')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
                    selectedBlockTab === 'khoi_phong_ban'
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  Khối Phòng ban (8)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBlockTab('khoi_khoa')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
                    selectedBlockTab === 'khoi_khoa'
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  Khối Khoa (9)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBlockTab('khoi_tt_ban')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
                    selectedBlockTab === 'khoi_tt_ban'
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  Khối Trung tâm / Ban (5)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBlockTab('khoi_dang_doan')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
                    selectedBlockTab === 'khoi_dang_doan'
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  Khối Đảng – Đoàn thể (3)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBlockTab('toan_truong')}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
                    selectedBlockTab === 'toan_truong'
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  Tất cả đơn vị
                </button>
              </div>

              {/* BOX DẠNG LIST CHỨA DANH SÁCH (CHỈ GỒM RADIO + TÊN ĐƠN VỊ, BỎ HẾT BÊN PHẢI VÀ DESCRIPTION) */}
              <div className="border border-slate-200 rounded-2xl bg-white shadow-2xs overflow-hidden">
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-100">
                  {displayUnits.map((unit) => {
                    const isSelected = selectedUnitId === unit.id;
                    return (
                      <div
                        key={unit.id}
                        onClick={() => handleSelectUnit(unit.id)}
                        className={`px-3.5 py-2.5 flex items-center gap-3 cursor-pointer transition-colors select-none ${
                          isSelected
                            ? 'bg-blue-50/70 font-semibold'
                            : 'hover:bg-slate-50/80 bg-white'
                        }`}
                      >
                        {/* Radio Button tròn */}
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>

                        {/* Chỉ hiển thị Tên Đơn Vị (Đã bỏ description và bỏ nội dung bên phải) */}
                        <div
                          className={`text-[13px] leading-snug truncate ${
                            isSelected ? 'text-blue-900 font-bold' : 'text-slate-800 font-medium'
                          }`}
                        >
                          {unit.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Thông báo đơn vị đã stick chọn hiện tại */}
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11.5px]">
                <div className="flex items-center gap-1.5 text-slate-700 min-w-0">
                  <span className="text-slate-500">Đơn vị đang stick chọn:</span>
                  <strong className="text-slate-900 truncate">{currentSelectedUnit.name}</strong>
                  <span className="text-[10.5px] text-slate-500">({currentSelectedUnit.blockName})</span>
                </div>
                <span className="text-[11px] text-slate-500 shrink-0">
                  (Mã nhân sự import phải thuộc đơn vị này)
                </span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* Ô GHI LỖI CHI TIẾT ("mấy hàng hàng nào lí do")          */}
            {/* ======================================================== */}
            {errorRowCount > 0 && (
              <div className="border border-rose-300 bg-rose-50/90 rounded-2xl p-3.5 space-y-2.5 animate-fadeIn">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[13px] font-bold text-rose-900 leading-tight">
                        Phát hiện {errorRowCount} hàng lỗi đơn vị & mã nhân sự!
                      </div>
                      <div className="text-[11px] text-rose-700 mt-0.5">
                        Các hàng sau không thuộc <strong>{currentSelectedUnit.name}</strong> đã stick chọn:
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportErrorList}
                    className="h-[26px] px-2 rounded-lg bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 font-semibold text-[11px] shadow-2xs flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                    title="Xuất file danh sách lỗi Excel"
                  >
                    <Download className="w-3 h-3" />
                    <span>Xuất file lỗi (.xlsx)</span>
                  </button>
                </div>

                {/* BẢNG CHI TIẾT CÁC HÀNG LỖI */}
                <div className="border border-rose-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <div className="max-h-36 overflow-y-auto">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead className="bg-rose-100/70 text-rose-900 sticky top-0 font-bold border-b border-rose-200">
                        <tr>
                          <th className="py-1.5 px-2 text-center w-14">Vị trí</th>
                          <th className="py-1.5 px-2 w-20">Mã NS</th>
                          <th className="py-1.5 px-2 w-28">Họ và tên</th>
                          <th className="py-1.5 px-2 w-28">Đơn vị thực tế</th>
                          <th className="py-1.5 px-2">Lý do lỗi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rose-100 text-slate-800">
                        {unitValidationErrors.map((err, i) => (
                          <tr key={i} className="hover:bg-rose-50/50">
                            <td className="py-1.5 px-2 text-center font-bold text-rose-700 bg-rose-50/30">
                              Dòng {err.rowNumber}
                            </td>
                            <td className="py-1.5 px-2 font-mono font-semibold text-slate-900">
                              {err.maNhanSu}
                            </td>
                            <td className="py-1.5 px-2 font-medium text-slate-800 truncate max-w-[110px]" title={err.hoTen}>
                              {err.hoTen}
                            </td>
                            <td className="py-1.5 px-2 text-slate-600 truncate max-w-[110px]" title={err.donViThucTe}>
                              {err.donViThucTe || '(Không xác định)'}
                            </td>
                            <td className="py-1.5 px-2 text-rose-700 font-medium">
                              {err.reason}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Checkbox bỏ qua dòng lỗi */}
                <div className="pt-1.5 flex items-center justify-between text-[11.5px]">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={ignoreUnitErrors}
                      onChange={(e) => setIgnoreUnitErrors(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                    />
                    <span className="font-semibold text-rose-900">
                      Bỏ qua {errorRowCount} hàng lỗi này và chỉ import {validRowCount} hàng hợp lệ
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Chế độ nhập liệu: Tạo mới vs Cập nhật bổ sung */}
            <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11.5px]">
              <span className="text-slate-600 font-medium">Chế độ import:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setLocalAppendMode(false)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-medium ${
                    !localAppendMode
                      ? 'bg-slate-900 text-white shadow-2xs font-bold'
                      : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
                  }`}
                >
                  Tạo mới (Ghi đè)
                </button>
                <button
                  type="button"
                  onClick={() => setLocalAppendMode(true)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-medium ${
                    localAppendMode
                      ? 'bg-slate-900 text-white shadow-2xs font-bold'
                      : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
                  }`}
                >
                  Cập nhật bổ sung
                </button>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3. DƯỚI NỮA: NÚT IMPORT & HỦY (Footer popup)            */}
          {/* ======================================================== */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
            <div className="text-[12px] text-slate-500">
              {file && (
                <span>
                  Sẵn sàng import: <strong className="text-slate-800">{willImportCount}</strong> / {parsedRows.length} dòng
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="h-[38px] px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium text-[12.5px] cursor-pointer transition-colors"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleTriggerImport}
                disabled={
                  !file ||
                  parsedRows.length === 0 ||
                  (errorRowCount > 0 && !ignoreUnitErrors) ||
                  (ignoreUnitErrors && validRowCount === 0)
                }
                className={`h-[38px] px-5 rounded-xl font-bold text-[12.5px] shadow-sm transition-all flex items-center gap-2 ${
                  !file ||
                  parsedRows.length === 0 ||
                  (errorRowCount > 0 && !ignoreUnitErrors) ||
                  (ignoreUnitErrors && validRowCount === 0)
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-[0.99] border border-blue-600'
                }`}
              >
                <span>
                  {errorRowCount > 0 && !ignoreUnitErrors
                    ? `Khóa import (${errorRowCount} lỗi)`
                    : ignoreUnitErrors && errorRowCount > 0
                    ? `Import ${validRowCount} dòng (Bỏ ${errorRowCount} lỗi)`
                    : `Import dữ liệu (${validRowCount} dòng)`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. Ô XÁC NHẬN LẠI LẦN NỮA TRƯỚC KHI IMPORT (Theo yêu cầu) */}
      {/* ======================================================== */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative p-5 space-y-4">
            {/* Header xác nhận */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-[15px] font-bold text-slate-900 leading-tight">
                  Xác nhận import dữ liệu lần cuối
                </h4>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  Vui lòng kiểm tra lại thông tin đối soát trước khi ghi vào hệ thống:
                </p>
              </div>
            </div>

            {/* Bảng tóm tắt thông tin xác nhận */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[12px] space-y-2">
              <div className="flex items-center justify-between py-0.5 border-b border-slate-200/60">
                <span className="text-slate-500">Đơn vị tiếp nhận:</span>
                <strong className="text-slate-900">{currentSelectedUnit.name}</strong>
              </div>
              <div className="flex items-center justify-between py-0.5 border-b border-slate-200/60">
                <span className="text-slate-500">Thuộc khối:</span>
                <span className="font-semibold text-slate-800">{currentSelectedUnit.blockName}</span>
              </div>
              <div className="flex items-center justify-between py-0.5 border-b border-slate-200/60">
                <span className="text-slate-500">Tập tin import:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[200px]" title={file?.name}>
                  {file?.name}
                </span>
              </div>
              <div className="flex items-center justify-between py-0.5 border-b border-slate-200/60">
                <span className="text-slate-500">Học kỳ / Đợt:</span>
                <span className="font-medium text-slate-800">{currentPeriodName}</span>
              </div>
              <div className="flex items-center justify-between py-0.5 border-b border-slate-200/60">
                <span className="text-slate-500">Chế độ nhập:</span>
                <span className="font-medium text-slate-800">
                  {localAppendMode ? 'Cập nhật bổ sung' : 'Tạo mới (Ghi đè)'}
                </span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-slate-500">Số dòng sẽ nạp:</span>
                <strong className="text-emerald-700 font-bold text-[13px]">
                  {willImportCount} dòng hợp lệ
                </strong>
              </div>
              {errorRowCount > 0 && ignoreUnitErrors && (
                <div className="flex items-center justify-between py-0.5 text-rose-600 text-[11px]">
                  <span>Đã loại bỏ:</span>
                  <span>{errorRowCount} dòng lỗi đơn vị</span>
                </div>
              )}
            </div>

            <p className="text-[11.5px] text-slate-500 leading-relaxed italic">
              Sau khi xác nhận, dữ liệu sẽ được ghi nhận vào bảng thanh toán của {currentSelectedUnit.name}. Bạn có chắc chắn muốn tiếp tục?
            </p>

            {/* Nút thao tác xác nhận */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="h-[36px] px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[12px] cursor-pointer transition-colors"
              >
                Quay lại kiểm tra
              </button>

              <button
                type="button"
                onClick={handleConfirmFinalImport}
                className="h-[36px] px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[12px] shadow-sm cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Xác nhận & Import ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
