import React, { useState, useEffect } from 'react';
import {
  X,
  UploadCloud,
  Download,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Trash2,
  Building2,
  ChevronDown,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { TeachingRecord, AppMode, PaymentRuleConfig, DepartmentUnit } from '../types';
import { generateDepartmentExcelTemplate } from '../utils/excelTemplateGenerator';

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
  onDownloadTemplate,
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
  const [localAppendMode, setLocalAppendMode] = useState<boolean>(isAppendMode);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showErrorsDetail, setShowErrorsDetail] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  useEffect(() => {
    setLocalAppendMode(isAppendMode);
  }, [isAppendMode]);

  // Reset state when opening modal
  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setParsedRows([]);
      setValidationErrors([]);
      setFileError(null);
      setErrorSummary({ valid: 0, errors: 0, duplicates: 0 });
      setShowErrorsDetail(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const departmentMeta: { [key in DepartmentUnit]: { name: string; task: string; sample: string } } = {
    dao_tao: {
      name: 'Phòng Đào tạo',
      task: 'Giờ giảng dạy lý thuyết, thực hành, bài tập',
      sample: 'Mau_Thanh_Toan_Gio_Giang_TDU.xlsx',
    },
    khao_thi: {
      name: 'Trung tâm Khảo thí & ĐBCL',
      task: 'Coi thi, chấm thi tự luận/trắc nghiệm, ra đề thi',
      sample: 'Mau_Khao_Thi_Coi_Cham_Thi_TDU.xlsx',
    },
    do_an: {
      name: 'Đồ án & Khóa luận tốt nghiệp',
      task: 'Hướng dẫn thực tập, BTL, đồ án môn học, khóa luận tốt nghiệp',
      sample: 'Mau_Do_An_Khoa_Luan_Tot_Nghiep_TDU.xlsx',
    },
    tuyen_sinh: {
      name: 'Phòng Tuyển sinh & Truyền thông',
      task: 'Công tác tư vấn tuyển sinh THPT, ngày hội hướng nghiệp',
      sample: 'Mau_Tuyen_Sinh_Truyen_Thong_TDU.xlsx',
    },
    nckh: {
      name: 'Phòng QL NCKH & Sau đại học',
      task: 'Nghiên cứu khoa học, bài báo quốc tế, đề tài khoa học',
      sample: 'Mau_NCKH_Sau_Dai_Hoc_TDU.xlsx',
    },
    co_van_hoc_tap: {
      name: 'Cố vấn học tập (CVHT)',
      task: 'Kê khai công tác cố vấn học tập, quản lý lớp sinh viên',
      sample: 'Mau_Co_Van_Hoc_Tap_TDU.xlsx',
    },
    cong_tac_khac: {
      name: 'Công tác Kiêm nhiệm & ĐBCL',
      task: 'Quản lý phòng thí nghiệm, dự giờ, hội giảng, tổ ĐBCL, kiểm định',
      sample: 'Mau_Cong_Tac_Kiem_Nhiem_DBCL_TDU.xlsx',
    },
    all: {
      name: 'Phòng Đào tạo (Mặc định)',
      task: 'Tổng hợp các hoạt động đào tạo toàn trường',
      sample: 'Mau_Ke_Khai_Tong_Hop_TDU.xlsx',
    },
  };

  const actualDept: DepartmentUnit = departmentUnit === 'all' ? 'dao_tao' : departmentUnit;
  const currentDeptMeta = departmentMeta[actualDept] || departmentMeta.dao_tao;

  const normalizeStr = (s: any) =>
    String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

  const processFile = (selectedFile: File) => {
    setFileError(null);
    setValidationErrors([]);
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName =
          workbook.SheetNames.find(
            (s) => s.toLowerCase().includes('ke_khai') || s.toLowerCase().includes('gio_giang')
          ) || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (json.length < 2) {
          setFileError('Tập tin Excel không có dòng dữ liệu hợp lệ.');
          return;
        }

        // Tự động tìm dòng chứa tiêu đề cột (hỗ trợ cả file header ở dòng 1 lẫn file biểu mẫu chuẩn ở dòng 10)
        let headerRowIdx = 0;
        for (let i = 0; i < Math.min(json.length, 20); i++) {
          const row = json[i];
          if (!Array.isArray(row)) continue;
          const rowStr = row.map((c) => normalizeStr(c)).join(' ');
          if (
            (rowStr.includes('magv') || rowStr.includes('magiangvien') || rowStr.includes('hoten') || rowStr.includes('tengiangvien')) &&
            (rowStr.includes('mon') || rowStr.includes('hocphan') || rowStr.includes('thucgiang') || rowStr.includes('quydoi') || rowStr.includes('lop') || rowStr.includes('nckh') || rowStr.includes('nhiemvu') || rowStr.includes('chucdanh') || rowStr.includes('phanloai') || rowStr.includes('sinhvien'))
          ) {
            headerRowIdx = i;
            break;
          }
        }

        const rawHeaders = (json[headerRowIdx] as string[]) || [];
        const normHeaders = rawHeaders.map((h) => normalizeStr(h));

        const getCol = (keywords: string[], fallback: number): number => {
          for (const kw of keywords) {
            const foundIdx = normHeaders.findIndex((h) => h === kw || h.includes(kw));
            if (foundIdx !== -1) return foundIdx;
          }
          return fallback;
        };

        const colMaGV = getCol(['magv', 'magiangvien', 'ma'], 1);
        const colHoTen = getCol(['hoten', 'hovaten', 'giangvien', 'tengiangvien'], 2);
        const colHocPhan = getCol(['mongiangday', 'tenhocphan', 'hocphan', 'tenmon', 'monhoc', 'nhiemvu', 'tendetai', 'baibao', 'luanvan', 'noidungnckh', 'noidung', 'tencongtrinh'], 3);
        const colMaLop = getCol(['lop', 'malophocphan', 'malop', 'lophp', 'madetai', 'soissn'], 4);
        const colSinhVien = getCol(['sosv', 'sisosinhvien', 'siso', 'sosinhvien'], 5);
        const colNhom = getCol(['sonhom', 'nhom'], 6);
        const colGioMH = getCol(['sogiomonhoc', 'giomonhoc', 'giomh'], 7);
        const colThucGiang = getCol(['sogiothucgiang', 'thucgiang', 'giothucgiang', 'sogioquydoi', 'gioquydoi', 'tietquydoi', 'sogio'], 8);
        const colLT = getCol(['tietlythuyet', 'tietlt', 'lythuyet', 'lt'], -1);
        const colTH = getCol(['tietthuchanh', 'tietth', 'thuchanh', 'th'], -1);

        const dataRows = json.slice(headerRowIdx + 1).filter((r: any) => {
          if (!r || !Array.isArray(r) || r.length === 0) return false;
          const rowStr = r.map((c: any) => normalizeStr(c)).join(' ');
          // Bỏ qua dòng mã trường hệ thống (dòng 5) và các dòng ghi chú/tổng cộng
          if (
            (rowStr.includes('magiangvien') && rowStr.includes('hovaten')) ||
            (rowStr.includes('manhanvien') && rowStr.includes('hovaten')) ||
            (rowStr.includes('mongiangday') && rowStr.includes('malophocphan')) ||
            (rowStr.includes('sosinhvien') && rowStr.includes('sogiomonhoc')) ||
            rowStr.startsWith('tongcong') ||
            rowStr.startsWith('luuy') ||
            rowStr.startsWith('ghichu') ||
            rowStr.startsWith('nguoilap')
          ) {
            return false;
          }
          return r.some((c: any) => c !== null && c !== '' && String(c).trim() !== '');
        });

        const errors: ValidationError[] = [];
        let validCount = 0;
        let errorCount = 0;
        let duplicateCount = 0;

        const processed = dataRows.map((row: any, idx: number) => {
          const rowNum = idx + 2;
          const hoTen = String(row[colHoTen] || row[1] || '').trim();
          const maLop = String(row[colMaLop] || `HP_${idx + 1}`).trim();
          const thucGiang = Number(row[colThucGiang]) || 0;
          const lt = Number(row[colLT]) || 0;
          const th = Number(row[colTH]) || 0;

          let hasError = false;

          // Check required teacher name
          if (!hoTen) {
            errors.push({
              row: rowNum,
              col: 'Họ và tên',
              message: 'Thiếu họ tên giảng viên',
              type: 'error',
            });
            hasError = true;
          }

          // Check teaching hours
          if (thucGiang === 0 && lt === 0 && th === 0) {
            errors.push({
              row: rowNum,
              col: 'Số giờ / Tiết',
              message: 'Chưa có số giờ thực hiện',
              type: 'warning',
            });
          }

          // Check duplicate class / assignment
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

          return { idx, values: row, headers: rawHeaders, isDuplicate };
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

  const handleDownloadTemplateClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      generateDepartmentExcelTemplate(actualDept, currentPeriodName);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Lỗi khi tải file mẫu Excel:', err);
    }
  };

  const handleApply = () => {
    if (parsedRows.length === 0) return;

    const rawHeaders = parsedRows[0]?.headers || [];
    const normHeaders = rawHeaders.map((h: any) => normalizeStr(h));

    const getCol = (keywords: string[], fallback: number): number => {
      for (const kw of keywords) {
        const foundIdx = normHeaders.findIndex((h: string) => h === kw || h.includes(kw));
        if (foundIdx !== -1) return foundIdx;
      }
      return fallback;
    };

    const colMaGV = getCol(['magv', 'magiangvien', 'ma'], 1);
    const colHoTen = getCol(['hoten', 'hovaten', 'giangvien', 'tengiangvien'], 2);
    const colHocPhan = getCol(['mongiangday', 'tenhocphan', 'hocphan', 'tenmon', 'monhoc', 'nhiemvu', 'tendetai', 'baibao', 'luanvan', 'noidungnckh', 'noidung', 'tencongtrinh'], 3);
    const colMaLop = getCol(['lop', 'malophocphan', 'malop', 'lophp', 'madetai', 'soissn'], 4);
    const colTheLoaiNCKH = getCol(['theloainckh', 'theloai', 'loaihinhnckh', 'loaihoatdong', 'loai'], -1);
    const colGioQCNCKH = getCol(['sogioquydoi', 'gioquydoi', 'tietquydoi', 'sogioqcnckh', 'soqc'], -1);
    const colMucDoHoanThanh = getCol(['mucdohoanthanh', 'hoanthanh', 'mucdo'], -1);
    const colSinhVien = getCol(['sosv', 'sisosinhvien', 'siso', 'sosinhvien'], 5);
    const colNhom = getCol(['sonhom', 'nhom'], 6);
    const colGioMH = getCol(['sogiomonhoc', 'giomonhoc', 'giomh'], 7);
    const colThucGiang = getCol(['sogiothucgiang', 'thucgiang', 'giothucgiang', 'sogioquydoi', 'gioquydoi', 'tietquydoi', 'sogio'], 8);
    const colHsLop = getCol(['hesolopnhom', 'hesolop', 'hesonhom', 'hslop'], 9);
    const colHsTC = getCol(['hesotinchi', 'hesotc', 'hstc'], 10);
    const colPhanLoai = getCol(['phanloaigiangday', 'phanloai', 'loaihinh', 'hinhthuc'], 11);
    const colHocVi = getCol(['hocvi', 'hocham', 'chucdanh'], 12);
    const colKhoa = getCol(['khoabomon', 'khoa', 'bomon', 'donvi'], 13);
    const colSTK = getCol(['sotaikhoan', 'sotk', 'stk', 'taikhoan'], 14);
    const colNganHang = getCol(['nganhang'], 15);
    const colDot = getCol(['dotthanhtoan', 'dot', 'hocky'], 16);
    const colNgaySinh = getCol(['ngaysinh', 'sinh'], -1);
    const colCCCD = getCol(['socccd', 'cccd', 'cmnd', 'cancuoc'], -1);
    const colLT = getCol(['tietlythuyet', 'tietlt', 'lythuyet', 'lt'], -1);
    const colTH = getCol(['tietthuchanh', 'tietth', 'thuchanh', 'th'], -1);
    const colTinChi = getCol(['sotinchi', 'tinchi', 'sotc', 'tc'], -1);

    const records: TeachingRecord[] = parsedRows.map((item, index) => {
      const vals = item.values;
      const maGV = String(vals[colMaGV] || 'TDU' + (1000 + index)).trim();
      const hoTen = String(vals[colHoTen] || 'Giảng viên TDU ' + (index + 1)).trim();
      const ngaySinh = String((colNgaySinh !== -1 ? vals[colNgaySinh] : '') || '15/08/1985');
      const soCCCD = String((colCCCD !== -1 ? vals[colCCCD] : '') || '09208500' + (1000 + index));
      const hocVi = String(vals[colHocVi] || 'ThS');
      const khoa = String(vals[colKhoa] || 'Khoa Công nghệ thông tin');
      const hocPhan = String(vals[colHocPhan] || currentDeptMeta.task);
      const maLop = String(vals[colMaLop] || `${actualDept.toUpperCase()}_${100 + index}_TDU`).trim();

      const rawPhanLoai = normalizeStr(vals[colPhanLoai]);
      const phanLoaiGiangDay: 'ly_thuyet' | 'thuc_hanh_thuc_tap' =
        rawPhanLoai.includes('thuc') || rawPhanLoai.includes('lab')
          ? 'thuc_hanh_thuc_tap'
          : 'ly_thuyet';

      const soTinChi = Number(colTinChi !== -1 ? vals[colTinChi] : (actualDept === 'dao_tao' ? 3 : 0)) || (actualDept === 'dao_tao' ? 3 : 0);
      const soSinhVien = Number(vals[colSinhVien]) || 60;
      const soNhom = Number(vals[colNhom]) || 1;
      const soGioMonHoc = Number(vals[colGioMH]) || 45;

      let lt = Number(colLT !== -1 ? vals[colLT] : 0) || 0;
      let th = Number(colTH !== -1 ? vals[colTH] : 0) || 0;
      let thucGiang = Number(vals[colThucGiang]) || 0;

      if (actualDept === 'nckh') {
        const nckhHours = Number(colGioQCNCKH !== -1 ? vals[colGioQCNCKH] : vals[colThucGiang]) || thucGiang || 0;
        if (nckhHours > 0) {
          thucGiang = nckhHours;
        }
      }

      if (thucGiang === 0 && (lt > 0 || th > 0)) {
        thucGiang = lt + th;
      } else if (thucGiang > 0 && lt === 0 && th === 0) {
        if (phanLoaiGiangDay === 'thuc_hanh_thuc_tap') {
          th = thucGiang;
        } else {
          lt = thucGiang;
        }
      } else if (thucGiang === 0) {
        thucGiang = actualDept === 'nckh' ? 60 : 30;
        if (phanLoaiGiangDay === 'thuc_hanh_thuc_tap') th = 30;
        else lt = 30;
      }

      const heSoLop = Number(vals[colHsLop]) || 1.0;
      const heSoTinChi = Number(vals[colHsTC]) || 1.0;
      const donGia = config.rates[hocVi] || (actualDept === 'nckh' ? 180000 : 150000);
      const qc = actualDept === 'nckh' ? thucGiang : Number((thucGiang * heSoLop * heSoTinChi).toFixed(2));
      const tongThuLao = Math.round(qc * donGia);
      const thue = Math.round(tongThuLao * config.taxRate);

      const soTaiKhoan = String(vals[colSTK] || '1028746' + (10000 + index));
      const nganHang = String(vals[colNganHang] || 'VietinBank CN Cần Thơ');
      const dotThanhToan = String(vals[colDot] || currentPeriodName || 'Học kỳ 1 2026-2027').trim();

      const rawTheLoai = colTheLoaiNCKH !== -1 && vals[colTheLoaiNCKH] ? String(vals[colTheLoaiNCKH]).trim() : '';
      const theLoaiNCKH = rawTheLoai || (actualDept === 'nckh' ? 'Bài báo khoa học / Đề tài' : undefined);
      const rawHoanThanh = colMucDoHoanThanh !== -1 && vals[colMucDoHoanThanh] ? String(vals[colMucDoHoanThanh]).toLowerCase() : '';
      const mucDoHoanThanhNCKH = actualDept === 'nckh' ? (rawHoanThanh.includes('khong') || rawHoanThanh.includes('chua') ? 'khong_hoan_thanh' : 'hoan_thanh') : undefined;

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
        loaiHoatDong: actualDept === 'nckh' ? (theLoaiNCKH || 'Nghiên cứu khoa học') : currentDeptMeta.task,
        tenHocPhan: hocPhan,
        maLopHocPhan: maLop,
        noiDungNCKH: actualDept === 'nckh' ? hocPhan : undefined,
        theLoaiNCKH,
        soGioQCNCKH: actualDept === 'nckh' ? qc : undefined,
        dinhMucNCKH: actualDept === 'nckh' ? (hocVi.includes('GS') || hocVi.includes('PGS') ? 200 : 150) : undefined,
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
        nguoiThucHien: `${currentDeptMeta.name} import`,
        trangThai: item.isDuplicate ? 'trung_lap' : 'hop_le',
        dotThanhToan,
      };
    });

    onImportTeaching(records, localAppendMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Modal Dialog Card: Nền trắng tinh tế, chiều rộng nhỏ gọn 420px đúng chuẩn mẫu */}
      <div
        style={{ width: '420px', maxWidth: '92vw' }}
        className="bg-white rounded-[24px] shadow-2xl overflow-hidden border border-slate-200/90 relative animate-fadeIn shrink-0"
      >
        {/* Nút đóng X ở góc trên bên phải */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 w-7 h-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer z-10"
          title="Đóng popup"
        >
          <X className="w-4 h-4 stroke-[2]" />
        </button>

        <div className="p-4 sm:p-4.5">
          {/* 1. TOP CENTER: Icon đám mây trong vòng tròn + Tiêu đề + Phụ đề */}
          <div className="text-center pt-0.5">
            <div className="w-10 h-10 rounded-full border border-slate-200/90 bg-slate-50/80 flex items-center justify-center text-slate-700 mx-auto shadow-2xs">
              <UploadCloud className="w-5 h-5 stroke-[1.8]" />
            </div>

            <h3 className="text-[17px] font-bold text-slate-900 mt-2 tracking-tight">
              Import dữ liệu giờ giảng & thù lao
            </h3>

            <p className="text-[12px] text-slate-500 mt-0.5">
              Chọn file Excel để import dữ liệu cho {currentDeptMeta.name}
            </p>

            {/* Quick Department Selector Badge */}
            <div className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[10.5px] text-slate-600">
              <Building2 className="w-3 h-3 text-[#005325]" />
              <span className="font-medium text-slate-600">Đơn vị:</span>
              <select
                value={departmentUnit}
                onChange={(e) => onDepartmentChange(e.target.value as DepartmentUnit)}
                className="bg-transparent font-semibold text-[#005325] focus:outline-none cursor-pointer pr-0.5 text-[10.5px]"
              >
                <option value="dao_tao">Phòng Đào tạo (Giờ giảng)</option>
                <option value="khao_thi">Trung tâm Khảo thí (Coi/chấm thi)</option>
                <option value="do_an">Đồ án & Khóa luận tốt nghiệp</option>
                <option value="nckh">Nghiên cứu khoa học (NCKH)</option>
                <option value="co_van_hoc_tap">Cố vấn học tập (CVHT)</option>
                <option value="tuyen_sinh">Công tác Tuyển sinh</option>
                <option value="cong_tac_khac">Công tác Kiêm nhiệm & ĐBCL</option>
              </select>
            </div>
          </div>

          {/* 2. CHỌN CHẾ ĐỘ NHẬP LIỆU: Tạo mới vs Cập nhật bổ sung (Giống hệt thiết kế ảnh mẫu) */}
          <div className="mt-3.5 bg-white border border-slate-200/90 rounded-2xl p-1.5 flex items-stretch gap-1.5 shadow-2xs">
            {/* Chế độ 1: Tạo mới */}
            <button
              type="button"
              onClick={() => setLocalAppendMode(false)}
              className={`flex-1 text-left p-2 rounded-xl border transition-all cursor-pointer ${
                !localAppendMode
                  ? 'border-2 border-blue-500 bg-blue-50/20 shadow-2xs'
                  : 'border-transparent hover:bg-slate-50 opacity-75'
              }`}
            >
              <div className="font-bold text-[12px] text-slate-900">Tạo mới</div>
              <div className="text-[10.5px] text-slate-500 mt-0.5 leading-tight">
                Ghi đè hoặc thêm đợt mới
              </div>
            </button>

            {/* Chế độ 2: Cập nhật bổ sung */}
            <button
              type="button"
              onClick={() => setLocalAppendMode(true)}
              className={`flex-1 text-left p-2 rounded-xl border transition-all cursor-pointer ${
                localAppendMode
                  ? 'border-2 border-blue-500 bg-blue-50/20 shadow-2xs'
                  : 'border-transparent hover:bg-slate-50 opacity-75'
              }`}
            >
              <div className="font-bold text-[12px] text-slate-900">Cập nhật bổ sung</div>
              <div className="text-[10.5px] text-slate-500 mt-0.5 leading-tight">
                Giữ dữ liệu cũ, thêm dòng mới
              </div>
            </button>
          </div>

          {/* 3. LỜI NHẮC HỆ THỐNG */}
          <p className="text-[11px] text-slate-600 leading-relaxed mt-2.5 px-0.5">
            Tải file mẫu, điền dữ liệu rồi import. Hệ thống tự động kiểm tra trùng lặp và tính toán số giờ quy chuẩn theo định mức TDU.
          </p>

          {/* 4. BANNER BOX: "Chưa có file mẫu?" + NÚT "Tải file mẫu" */}
          <div className="mt-2.5 p-2.5 sm:p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-2">
            <div className="min-w-0 pr-1">
              <div className="font-bold text-[12px] text-slate-900">Chưa có file mẫu?</div>
              <div className="text-[10.5px] text-slate-500 mt-0.5 leading-snug">
                Giữ nguyên tiêu đề cột dòng 4, nhập dữ liệu từ dòng 6.
              </div>
            </div>

            <a
              href={`/templates/${currentDeptMeta.sample}`}
              download={currentDeptMeta.sample}
              onClick={handleDownloadTemplateClick}
              className={`shrink-0 h-[32px] px-2.5 text-[11px] font-semibold rounded-xl border shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 no-underline ${
                downloadSuccess
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
              title={`Tải file Excel mẫu biểu chuẩn dành cho ${currentDeptMeta.name}`}
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>Đã tải mẫu!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Tải file mẫu</span>
                </>
              )}
            </a>
          </div>

          {downloadSuccess && (
            <div className="mt-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Đã tải xuống file mẫu <strong>{currentDeptMeta.sample}</strong> thành công!</span>
            </div>
          )}

          {/* 5. KHUNG KÉO THẢ UPLOAD (Dashed border + Nút "Chọn file" ở giữa) */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`mt-3 border-2 border-dashed rounded-2xl p-3.5 sm:p-4 text-center transition-all bg-slate-50/30 ${
              isDragging
                ? 'border-blue-500 bg-blue-50/40'
                : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/60'
            }`}
          >
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              id="excel-file-upload-input"
              className="hidden"
            />

            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-600 mx-auto mb-1">
              <UploadCloud className="w-4 h-4 stroke-[1.8]" />
            </div>

            <div className="font-semibold text-slate-800 text-[12.5px]">
              Chọn file hoặc kéo thả vào đây
            </div>

            <div className="text-slate-400 text-[10.5px] mt-0.5">
              Chỉ hỗ trợ XLS, XLSX — tối đa 15MB
            </div>

            <label
              htmlFor="excel-file-upload-input"
              className="mt-2.5 inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11.5px] shadow-2xs cursor-pointer transition-colors"
            >
              Chọn file
            </label>
          </div>

          {/* File Error Notice */}
          {fileError && (
            <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-2 text-[12px]">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{fileError}</span>
            </div>
          )}

          {/* 6. HIỂN THỊ KẾT QUẢ PHÂN TÍCH SAU KHI CHỌN FILE */}
          {file && (
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileSpreadsheet className="w-4 h-4 text-[#005325] shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-800 text-[12.5px] truncate">
                      {file.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB · Đã đọc <strong>{parsedRows.length}</strong> dòng
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-semibold text-[11px]">
                    {errorSummary.valid} Hợp lệ
                  </span>
                  {errorSummary.duplicates > 0 && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md font-semibold text-[11px]">
                      {errorSummary.duplicates} Trùng
                    </span>
                  )}
                  {errorSummary.errors > 0 && (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md font-semibold text-[11px]">
                      {errorSummary.errors} Lỗi
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setParsedRows([]);
                      setValidationErrors([]);
                    }}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer ml-1"
                    title="Xóa file đã chọn"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Chi tiết cảnh báo nếu có */}
              {validationErrors.length > 0 && (
                <div className="pt-1 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setShowErrorsDetail(!showErrorsDetail)}
                    className="text-[11px] font-medium text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>Xem {validationErrors.length} cảnh báo & trùng lặp</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showErrorsDetail ? 'rotate-180' : ''}`} />
                  </button>

                  {showErrorsDetail && (
                    <div className="mt-1.5 max-h-24 overflow-y-auto bg-amber-50/70 border border-amber-200 rounded-lg p-2 text-[11px] space-y-1">
                      {validationErrors.map((err, i) => (
                        <div key={i} className="text-slate-700 flex items-center gap-1.5">
                          <span className="font-mono text-slate-500 shrink-0">Dòng {err.row}:</span>
                          <span className="font-semibold text-slate-800">[{err.col}]</span>
                          <span className="text-slate-600">{err.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 7. FOOTER BUTTONS: "Hủy" và "Import dữ liệu" (Theo mẫu ảnh) */}
          <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="h-[36px] px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[12.5px] cursor-pointer transition-colors"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={!file || parsedRows.length === 0}
              className="h-[36px] px-5 rounded-xl bg-[#4b84f4] hover:bg-[#3b75e5] disabled:opacity-45 disabled:cursor-not-allowed text-white font-semibold text-[12.5px] shadow-sm cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <span>Import dữ liệu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
