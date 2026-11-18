import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Download,
  Upload,
  Edit2,
  Trash2,
  Eye,
  X,
  CheckCircle2,
  Filter,
  UserCheck,
  Award,
  BookOpen,
  Briefcase,
  FileSpreadsheet,
  ArrowLeft,
  AlertCircle,
  FileUp,
  RefreshCw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { SystemUserProfile } from '../types';

// Helper to normalize strings for header matching (strips accents, lowercases, removes non-alphanumeric)
const normalizeHeader = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, '');
};

// Helper to convert Excel date (serial or string) to DD/MM/YYYY
const formatExcelDate = (val: any): string => {
  if (val === undefined || val === null || val === '') return '';
  if (typeof val === 'number') {
    try {
      // Excel base date offset Dec 30 1899
      const date = new Date(Math.round((val - 25569) * 86400 * 1000));
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      if (!isNaN(date.getTime()) && y > 1900 && y < 2100) {
        return `${d}/${m}/${y}`;
      }
    } catch {
      // fallback
    }
  }
  const str = String(val).trim();
  // Match ISO date YYYY-MM-DD or YYYY/MM/DD
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(str)) {
    const parts = str.split(/[-/]/);
    const y = parts[0];
    const m = parts[1].padStart(2, '0');
    const d = parts[2].substring(0, 2).padStart(2, '0');
    return `${d}/${m}/${y}`;
  }
  return str;
};

// Helper to split combined "Học hàm, học vị" if user file provides them in a single column
const parseAcademicTitle = (raw: string): { hocHam: string; hocVi: string } => {
  if (!raw) return { hocHam: '', hocVi: '' };
  const lower = raw.toLowerCase();
  let hocHam = '';
  let hocVi = '';

  if (lower.includes('phó giáo sư') || lower.includes('pgs')) {
    hocHam = 'Phó Giáo sư';
  } else if (lower.includes('giáo sư') || /\bgs\b|\bgs\./i.test(lower)) {
    hocHam = 'Giáo sư';
  }

  if (lower.includes('tiến sĩ') || /\bts\b|\bts\./i.test(lower)) {
    hocVi = 'Tiến sĩ';
  } else if (lower.includes('thạc sĩ') || /\bths\b|\bths\./i.test(lower)) {
    hocVi = 'Thạc sĩ';
  } else if (lower.includes('ckii') || lower.includes('ck2') || lower.includes('chuyên khoa 2') || lower.includes('chuyên khoa ii')) {
    hocVi = 'Bác sĩ CKII';
  } else if (lower.includes('cki') || lower.includes('ck1') || lower.includes('chuyên khoa 1') || lower.includes('chuyên khoa i')) {
    hocVi = 'Bác sĩ CKI';
  } else if (lower.includes('đại học') || lower.includes('cử nhân') || lower.includes('kỹ sư')) {
    hocVi = 'Cử nhân';
  } else if (!hocHam) {
    hocVi = raw.trim();
  }

  return { hocHam, hocVi };
};

// Cleared old mock data as requested; starts empty or loads from user's imported storage
export const INITIAL_SYSTEM_USERS: SystemUserProfile[] = [];

export const SystemUsersPage: React.FC = () => {
  const [users, setUsers] = useState<SystemUserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('tdu_system_users_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_SYSTEM_USERS;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tdu_system_users_v2', JSON.stringify(users));
    } catch (err) {
      console.error('Failed to save system users', err);
    }
  }, [users]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedDegree, setSelectedDegree] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUserProfile | null>(null);
  const [viewingUser, setViewingUser] = useState<SystemUserProfile | null>(null);

  // Import Excel Modal states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedImportUsers, setParsedImportUsers] = useState<SystemUserProfile[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [overwriteExisting, setOverwriteExisting] = useState(true);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Form state for 20 columns
  const [formData, setFormData] = useState<Partial<SystemUserProfile>>({
    hoTen: '',
    chucVu: 'Giảng viên cơ hữu',
    donVi: 'Khoa Công nghệ thông tin',
    maNhanSu: '',
    gioiTinh: 'Nam',
    ngaySinh: '',
    hocHam: '',
    hocVi: 'Thạc sĩ',
    chuyenMon: '',
    namTuyenDung: new Date().getFullYear(),
    ngayKyHDLD: '',
    namTotNghiep: 2010,
    namCongNhanPGS: '',
    namCongNhanGS: '',
    ccsp: 'Đã có',
    anhVan: 'B2',
    tinHoc: 'Ứng dụng CNTT Cơ bản',
    kiemNhiem: '',
    donViKiemNhiem: '',
    trangThai: 'hoat_dong',
  });

  // Unique lists for filtering
  const departments = useMemo(() => {
    const set = new Set(users.map((u) => u.donVi));
    return Array.from(set);
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          u.hoTen.toLowerCase().includes(q) ||
          u.maNhanSu.toLowerCase().includes(q) ||
          u.chuyenMon.toLowerCase().includes(q) ||
          u.chucVu.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (selectedDept !== 'all' && u.donVi !== selectedDept) return false;
      if (selectedDegree !== 'all') {
        if (selectedDegree === 'GS_PGS' && !u.hocHam) return false;
        if (selectedDegree === 'TS' && !u.hocVi.includes('Tiến sĩ')) return false;
        if (selectedDegree === 'ThS' && !u.hocVi.includes('Thạc sĩ')) return false;
      }
      if (selectedGender !== 'all' && u.gioiTinh !== selectedGender) return false;
      return true;
    });
  }, [users, searchTerm, selectedDept, selectedDegree, selectedGender]);

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      hoTen: '',
      chucVu: 'Giảng viên cơ hữu',
      donVi: 'Khoa Công nghệ thông tin',
      maNhanSu: `TDU${String(Math.floor(Math.random() * 900) + 100)}`,
      gioiTinh: 'Nam',
      ngaySinh: '01/01/1990',
      hocHam: '',
      hocVi: 'Thạc sĩ',
      chuyenMon: '',
      namTuyenDung: 2022,
      ngayKyHDLD: '01/09/2022',
      namTotNghiep: 2012,
      namCongNhanPGS: '',
      namCongNhanGS: '',
      ccsp: 'Đã có',
      anhVan: 'B2',
      tinHoc: 'Ứng dụng CNTT Cơ bản',
      kiemNhiem: '',
      donViKiemNhiem: '',
      trangThai: 'hoat_dong',
    });
    setIsFormModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (user: SystemUserProfile) => {
    setEditingUser(user);
    setFormData({ ...user });
    setIsFormModalOpen(true);
  };

  // Open Detail modal
  const handleOpenDetail = (user: SystemUserProfile) => {
    setViewingUser(user);
    setIsDetailModalOpen(true);
  };

  // Delete user
  const handleDeleteUser = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hồ sơ nhân sự này khỏi hệ thống?')) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  // Save form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hoTen || !formData.maNhanSu) {
      alert('Vui lòng điền đầy đủ Họ tên và Mã nhân sự!');
      return;
    }

    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id ? ({ ...u, ...formData } as SystemUserProfile) : u
        )
      );
    } else {
      const newUser: SystemUserProfile = {
        ...(formData as SystemUserProfile),
        id: `user-${Date.now()}`,
        stt: users.length + 1,
      };
      setUsers((prev) => [...prev, newUser]);
    }
    setIsFormModalOpen(false);
  };

  // Export to Excel with all 20 columns
  const handleExportExcel = () => {
    if (filteredUsers.length === 0) {
      alert('Không có dữ liệu người dùng để xuất!');
      return;
    }
    const dataToExport = filteredUsers.map((u, idx) => ({
      Stt: idx + 1,
      'Họ tên': u.hoTen,
      'Chức vụ': u.chucVu,
      'Đơn vị': u.donVi,
      'Mã nhân sự': u.maNhanSu,
      'Giới tính': u.gioiTinh,
      'Ngày, tháng năm sinh': u.ngaySinh,
      'Học hàm': u.hocHam || '',
      'Học vị': u.hocVi,
      'Chuyên môn': u.chuyenMon,
      'Năm tuyển dụng': u.namTuyenDung,
      'Ngày ký HĐLĐ chính thức': u.ngayKyHDLD,
      'Năm tốt nghiệp': u.namTotNghiep,
      'Năm công nhận học hàm PGS': u.namCongNhanPGS || '',
      'Năm công nhận học hàm Giáo sư': u.namCongNhanGS || '',
      CCSP: u.ccsp,
      'Anh văn': u.anhVan,
      'Tin học': u.tinHoc,
      'Kiêm nhiệm': u.kiemNhiem || '',
      'Đơn vị kiêm nhiệm': u.donViKiemNhiem || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ho_so_Nhan_su_TDU');
    XLSX.writeFile(workbook, `TDU_Danh_Sach_Nhan_Su_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Download standard Excel template with 18-20 columns
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'STT': 1,
        'Họ tên': 'Nguyễn Văn An',
        'Chức vụ': 'Giảng viên cơ hữu',
        'Đơn vị': 'Khoa Công nghệ thông tin',
        'Mã nhân sự': 'TDU00123',
        'Giới tính': 'Nam',
        'Ngày tháng năm sinh': '15/08/1985',
        'Học hàm': '',
        'Học vị': 'Tiến sĩ',
        'Chuyên môn': 'Khoa học máy tính & HTTT',
        'Năm tuyển dụng': 2018,
        'Ngày ký HĐLĐ chính thức': '01/09/2019',
        'Năm tốt nghiệp': 2007,
        'Năm công nhận học hàm PGS': '',
        'Năm công nhận học hàm Giáo sư': '',
        'CCSP': 'Đã có',
        'Anh văn': 'IELTS 6.5',
        'Tin học': 'Ứng dụng CNTT Nâng cao',
        'Kiêm nhiệm': 'Cố vấn học tập K16 CNTT',
        'Đơn vị kiêm nhiệm': 'Khoa Công nghệ thông tin',
      },
      {
        'STT': 2,
        'Họ tên': 'Trần Thị Mai',
        'Chức vụ': 'Phó Trưởng Khoa',
        'Đơn vị': 'Khoa Dược - Điều dưỡng',
        'Mã nhân sự': 'TDU00245',
        'Giới tính': 'Nữ',
        'Ngày tháng năm sinh': '20/11/1980',
        'Học hàm': 'Phó Giáo sư',
        'Học vị': 'Tiến sĩ',
        'Chuyên môn': 'Dược lý & Dược lâm sàng',
        'Năm tuyển dụng': 2014,
        'Ngày ký HĐLĐ chính thức': '01/10/2015',
        'Năm tốt nghiệp': 2002,
        'Năm công nhận học hàm PGS': 2021,
        'Năm công nhận học hàm Giáo sư': '',
        'CCSP': 'Đã có',
        'Anh văn': 'B2 Châu Âu',
        'Tin học': 'MOS Excel Expert',
        'Kiêm nhiệm': 'Chủ tịch HĐ Khoa học Khoa',
        'Đơn vị kiêm nhiệm': 'Khoa Dược - Điều dưỡng',
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mau_Import_Nhan_Su');
    XLSX.writeFile(workbook, 'TDU_Mau_Import_Nhan_Su_18_Cot.xlsx');
  };

  // Clear all users from state and storage
  const handleClearAllUsers = () => {
    if (users.length === 0) return;
    if (window.confirm(`CẢNH BÁO: Bạn có chắc chắn muốn xóa toàn bộ ${users.length} cán bộ trong danh sách hiện tại không? Thao tác này sẽ làm sạch hoàn toàn dữ liệu nhân sự cũ.`)) {
      setUsers([]);
      try {
        localStorage.removeItem('tdu_system_users_v2');
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Handle file select for Excel import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportError(null);
    setIsProcessingFile(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: false });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (!json || json.length < 2) {
          setImportError('File Excel không có dữ liệu hoặc chỉ có dòng tiêu đề.');
          setIsProcessingFile(false);
          return;
        }

        // Dynamically find header row in the first 10 rows
        let headerRowIdx = 0;
        for (let r = 0; r < Math.min(10, json.length); r++) {
          const row = json[r];
          if (!Array.isArray(row)) continue;
          const joined = row.map((c) => String(c || '').toLowerCase()).join(' ');
          if (
            (joined.includes('họ tên') || joined.includes('ho ten') || joined.includes('họ và tên') || joined.includes('ten')) &&
            (joined.includes('mã') || joined.includes('chức vụ') || joined.includes('đơn vị') || joined.includes('stt'))
          ) {
            headerRowIdx = r;
            break;
          }
        }

        const headers = json[headerRowIdx].map((h: any) => String(h || '').trim());
        const normalizedHeaders = headers.map((h: string) => normalizeHeader(h));

        // Map column indices flexibly to all 18 columns + variations
        const colMap: { [key: string]: number } = {};
        normalizedHeaders.forEach((nh: string, idx: number) => {
          if (!nh) return;
          if (nh === 'stt' || nh === 'sott' || nh === 'tt') colMap['stt'] = idx;
          else if (nh.includes('hoten') || nh.includes('hovaten') || nh === 'ten' || nh.includes('tencanbo') || nh.includes('tengiangvien')) colMap['hoTen'] = idx;
          else if (nh.includes('chucvu') || nh.includes('chucdanh') || nh.includes('vitri')) colMap['chucVu'] = idx;
          else if (nh.includes('donvikiemnhiem') || nh.includes('donvicongtackiemnhiem')) colMap['donViKiemNhiem'] = idx;
          else if (nh.includes('donvi') || nh.includes('khoa') || nh.includes('phongban') || nh.includes('bomon') || nh.includes('khoaphong')) colMap['donVi'] = idx;
          else if (nh.includes('manhansu') || nh.includes('macanbo') || nh.includes('magiangvien') || nh.includes('macb') || nh.includes('magv') || nh.includes('mans')) colMap['maNhanSu'] = idx;
          else if (nh.includes('gioitinh') || nh.includes('phai') || nh.includes('namnu')) colMap['gioiTinh'] = idx;
          else if (nh.includes('ngaythangnamsinh') || nh.includes('ngaysinh') || nh.includes('ngaythangnam') || nh.includes('namsinh')) colMap['ngaySinh'] = idx;
          else if (nh.includes('hochamhocvi') || nh.includes('hochamsovi') || nh.includes('hocvicham')) colMap['hocHamHocVi'] = idx;
          else if (nh.includes('hocham')) colMap['hocHam'] = idx;
          else if (nh.includes('hocvi') || nh.includes('trinhdo')) colMap['hocVi'] = idx;
          else if (nh.includes('chuyenmon') || nh.includes('chuyennganh') || nh.includes('nganhdaotao')) colMap['chuyenMon'] = idx;
          else if (nh.includes('namtuyendung') || nh.includes('namtd') || nh.includes('ngaytuyendung')) colMap['namTuyenDung'] = idx;
          else if (nh.includes('ngaykyhdld') || nh.includes('ngaykyhopdong') || nh.includes('ngayhdld')) colMap['ngayKyHDLD'] = idx;
          else if (nh.includes('namtotnghiep') || nh.includes('namtn')) colMap['namTotNghiep'] = idx;
          else if (nh.includes('namcongnhanhochampgs') || nh.includes('namcongnhanpgs') || nh.includes('nampgs') || nh.includes('congnhanpgs')) colMap['namCongNhanPGS'] = idx;
          else if (nh.includes('namcongnhanhochamgiaosu') || nh.includes('namcongnhanhochamgs') || nh.includes('namcongnhangs') || nh.includes('namgs') || nh.includes('congnhangs')) colMap['namCongNhanGS'] = idx;
          else if (nh.includes('ccsp') || nh.includes('chungchisupham') || nh.includes('supham')) colMap['ccsp'] = idx;
          else if (nh.includes('anhvan') || nh.includes('tienganh') || nh.includes('ngoainngu') || nh.includes('ngoaingu')) colMap['anhVan'] = idx;
          else if (nh.includes('tinhoc') || nh.includes('chungchitinhoc') || nh.includes('cntt')) colMap['tinHoc'] = idx;
          else if (nh.includes('kiemnhiem') || nh.includes('chucvukiemnhiem') || nh.includes('nhiemvukiemnhiem')) colMap['kiemNhiem'] = idx;
        });

        const parsed: SystemUserProfile[] = [];
        for (let r = headerRowIdx + 1; r < json.length; r++) {
          const row = json[r];
          if (!Array.isArray(row) || row.length === 0) continue;

          // Check Họ tên
          const hoTenVal = colMap['hoTen'] !== undefined ? String(row[colMap['hoTen']] || '').trim() : '';
          if (!hoTenVal && row.every((c) => !c)) continue; // skip entirely blank rows
          if (!hoTenVal) continue;

          const getVal = (key: string): string => {
            if (colMap[key] === undefined) return '';
            const v = row[colMap[key]];
            return v !== undefined && v !== null ? String(v).trim() : '';
          };

          const getDateVal = (key: string): string => {
            if (colMap[key] === undefined) return '';
            return formatExcelDate(row[colMap[key]]);
          };

          let hocHam = getVal('hocHam');
          let hocVi = getVal('hocVi');

          // If file has combined "Học hàm, học vị" column
          if (colMap['hocHamHocVi'] !== undefined) {
            const combo = String(row[colMap['hocHamHocVi']] || '').trim();
            if (combo) {
              const split = parseAcademicTitle(combo);
              if (!hocHam) hocHam = split.hocHam;
              if (!hocVi) hocVi = split.hocVi;
            }
          }

          const rawGender = getVal('gioiTinh').toLowerCase();
          const gioiTinh: 'Nam' | 'Nữ' = rawGender.includes('nữ') || rawGender.includes('nu') ? 'Nữ' : 'Nam';

          parsed.push({
            id: `user-import-${Date.now()}-${r}`,
            stt: parsed.length + 1,
            hoTen: hoTenVal,
            chucVu: getVal('chucVu') || 'Giảng viên',
            donVi: getVal('donVi') || 'Trường Đại học Tây Đô',
            maNhanSu: getVal('maNhanSu') || `TDU${String(100 + parsed.length + 1)}`,
            gioiTinh,
            ngaySinh: getDateVal('ngaySinh'),
            hocHam,
            hocVi: hocVi || 'Cử nhân',
            chuyenMon: getVal('chuyenMon'),
            namTuyenDung: getVal('namTuyenDung') || '',
            ngayKyHDLD: getDateVal('ngayKyHDLD'),
            namTotNghiep: getVal('namTotNghiep') || '',
            namCongNhanPGS: getVal('namCongNhanPGS') || '',
            namCongNhanGS: getVal('namCongNhanGS') || '',
            ccsp: getVal('ccsp') || 'Đã có',
            anhVan: getVal('anhVan'),
            tinHoc: getVal('tinHoc'),
            kiemNhiem: getVal('kiemNhiem'),
            donViKiemNhiem: getVal('donViKiemNhiem'),
            trangThai: 'hoat_dong',
          });
        }

        if (parsed.length === 0) {
          setImportError('Không tìm thấy dòng dữ liệu cán bộ hợp lệ trong file. Vui lòng kiểm tra lại cột Họ tên hoặc tải file mẫu.');
        } else {
          setParsedImportUsers(parsed);
        }
      } catch (err: any) {
        console.error(err);
        setImportError('Có lỗi xảy ra khi đọc file Excel: ' + (err.message || 'Lỗi không xác định'));
      } finally {
        setIsProcessingFile(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Confirm and apply imported users
  const handleConfirmImport = () => {
    if (parsedImportUsers.length === 0) return;
    if (overwriteExisting) {
      setUsers(parsedImportUsers);
    } else {
      setUsers((prev) => {
        const nextStt = prev.length;
        const renumbered = parsedImportUsers.map((u, i) => ({ ...u, stt: nextStt + i + 1 }));
        return [...prev, ...renumbered];
      });
    }
    const count = parsedImportUsers.length;
    handleCloseImportModal();
    alert(`Import thành công! Đã nạp ${count} cán bộ vào hệ thống.`);
  };

  // Close import modal and reset state
  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
    setImportFile(null);
    setParsedImportUsers([]);
    setImportError(null);
    setIsProcessingFile(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] overflow-y-auto">
      {isDetailModalOpen && viewingUser ? (
        <div className="flex-1 flex flex-col bg-[#f8fafc]">
          {/* Top Bar */}
          <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[12.5px] font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại danh sách nhân sự</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleOpenEdit(viewingUser);
                }}
                className="h-[32px] px-3.5 rounded-lg bg-[#005325] hover:bg-[#00421e] text-white text-[12px] font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa hồ sơ</span>
              </button>
            </div>
          </div>

          {/* Inline Detail Card */}
          <div className="p-6 max-w-[960px] w-full mx-auto space-y-4">
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#005325] to-emerald-800 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-2xl text-white border border-white/30">
                    {viewingUser.hoTen.slice(0, 1)}
                  </div>
                  <div>
                    <h3 className="font-bold text-[18px] leading-tight">{viewingUser.hoTen}</h3>
                    <p className="text-[12.5px] text-emerald-100 mt-0.5 font-semibold">
                      {viewingUser.chucVu} • {viewingUser.donVi}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 text-[12px] font-bold">
                      <span className="bg-white/20 px-2.5 py-0.5 rounded text-white">
                        Mã NS: {viewingUser.maNhanSu}
                      </span>
                      {viewingUser.hocHam && (
                        <span className="bg-white/20 px-2.5 py-0.5 rounded text-white">
                          Học hàm: {viewingUser.hocHam}
                        </span>
                      )}
                      <span className="bg-white/20 px-2.5 py-0.5 rounded text-white">
                        Học vị: {viewingUser.hocVi}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5 text-[13px]">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[11.5px] font-semibold">Giới tính</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{viewingUser.gioiTinh}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11.5px] font-semibold">Ngày, tháng, năm sinh</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{viewingUser.ngaySinh}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11.5px] font-semibold">Chuyên môn đào tạo</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{viewingUser.chuyenMon}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11.5px] font-semibold">Năm tốt nghiệp ĐH</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{viewingUser.namTotNghiep}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[11.5px] font-semibold">Năm tuyển dụng</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{viewingUser.namTuyenDung}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11.5px] font-semibold">Ngày ký HĐLĐ chính thức</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{viewingUser.ngayKyHDLD}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11.5px] font-semibold">Năm công nhận học hàm PGS</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{viewingUser.namCongNhanPGS || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11.5px] font-semibold">Năm công nhận học hàm GS</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{viewingUser.namCongNhanGS || '—'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[11.5px] font-semibold">Chứng chỉ sư phạm (CCSP)</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{viewingUser.ccsp}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11.5px] font-semibold">Trình độ ngoại ngữ / Anh văn</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{viewingUser.anhVan}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11.5px] font-semibold">Trình độ tin học</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{viewingUser.tinHoc}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 block text-[11.5px] font-semibold">Nhiệm vụ kiêm nhiệm</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">
                      {viewingUser.kiemNhiem || 'Không có nhiệm vụ kiêm nhiệm'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11.5px] font-semibold">Đơn vị kiêm nhiệm</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{viewingUser.donViKiemNhiem || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
      {/* 1. Header Zone */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1a73e8] border border-blue-200/80 flex items-center justify-center shadow-2xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-[17px] font-bold text-slate-900 leading-tight">
                  QUẢN LÝ NGƯỜI DÙNG & HỒ SƠ NHÂN SỰ
                </h1>
                <p className="text-[12px] text-slate-500">
                  Dữ liệu cán bộ, giảng viên, học hàm, học vị, hợp đồng và kiêm nhiệm chuẩn file Đại học Tây Đô
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="h-[34px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[12.5px] font-medium flex items-center gap-2 cursor-pointer shadow-2xs hover:shadow-xs transition-all"
              title="Import danh sách cán bộ từ file Excel (18 cột)"
            >
              <Upload className="w-4 h-4" />
              <span>Import Excel</span>
            </button>

            <button
              onClick={handleDownloadTemplate}
              className="h-[34px] px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[12.5px] font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
              title="Tải file mẫu Excel 18 cột theo chuẩn Đại học Tây Đô"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Tải mẫu</span>
            </button>

            <button
              onClick={handleExportExcel}
              disabled={users.length === 0}
              className={`h-[34px] px-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[12.5px] font-medium flex items-center gap-2 shadow-2xs transition-all ${
                users.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
              title="Xuất toàn bộ danh sách 20 cột ra file Excel"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Xuất Excel</span>
            </button>

            {users.length > 0 && (
              <button
                onClick={handleClearAllUsers}
                className="h-[34px] px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[12.5px] font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                title="Xóa toàn bộ dữ liệu nhân sự cũ hiện tại"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa tất cả ({users.length})</span>
              </button>
            )}

            <button
              onClick={handleOpenAdd}
              className="h-[34px] px-4 rounded-xl bg-[#005325] hover:bg-[#00421e] text-white text-[12.5px] font-medium flex items-center gap-2 cursor-pointer shadow-2xs hover:shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm người dùng mới</span>
            </button>
          </div>
        </div>

        {/* 2. Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[13px]">
              {users.length}
            </div>
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Tổng số cán bộ</div>
              <div className="text-[13px] font-semibold text-slate-800">100% hồ sơ số hóa</div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[13px]">
              {users.filter((u) => u.hocHam).length}
            </div>
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Giáo sư / PGS</div>
              <div className="text-[13px] font-semibold text-purple-800">Học hàm đầu ngành</div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[13px]">
              {users.filter((u) => u.hocVi.includes('Tiến sĩ')).length}
            </div>
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Tiến sĩ (TS)</div>
              <div className="text-[13px] font-semibold text-emerald-800">Trình độ sau ĐH</div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[13px]">
              {users.filter((u) => u.kiemNhiem).length}
            </div>
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Có kiêm nhiệm</div>
              <div className="text-[13px] font-semibold text-amber-800">Hưởng chế độ giảm trừ</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center gap-3 text-[12.5px]">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, mã nhân sự, chuyên môn, chức vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[12.5px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        {/* Filter by Department */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">Đơn vị:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-[32px] px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[12.5px] focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả đơn vị</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Degree */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">Học vị:</span>
          <select
            value={selectedDegree}
            onChange={(e) => setSelectedDegree(e.target.value)}
            className="h-[32px] px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[12.5px] focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả học vị</option>
            <option value="GS_PGS">GS / PGS</option>
            <option value="TS">Tiến sĩ</option>
            <option value="ThS">Thạc sĩ</option>
          </select>
        </div>

        {/* Filter by Gender */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">Giới tính:</span>
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="h-[32px] px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[12.5px] focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
        </div>

        {(searchTerm || selectedDept !== 'all' || selectedDegree !== 'all' || selectedGender !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedDept('all');
              setSelectedDegree('all');
              setSelectedGender('all');
            }}
            className="text-blue-600 hover:underline font-medium ml-auto"
          >
            Đặt lại lọc
          </button>
        )}
      </div>

      {/* 4. Full Data Table (20 Columns as in File) */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto max-h-[calc(100vh-280px)]">
            <table className="w-full border-collapse text-left text-[12px] min-w-[2100px]">
              <thead className="bg-[#f1f5f9] text-slate-800 font-semibold sticky top-0 z-10 border-b border-slate-300">
                <tr className="h-[38px]">
                  <th className="px-2.5 text-center border-r border-slate-300 w-[45px]">Stt</th>
                  <th className="px-3 border-r border-slate-300 min-w-[170px]">Họ tên</th>
                  <th className="px-2.5 border-r border-slate-300 w-[100px]">Mã nhân sự</th>
                  <th className="px-3 border-r border-slate-300 min-w-[190px]">Chức vụ</th>
                  <th className="px-3 border-r border-slate-300 min-w-[190px]">Đơn vị</th>
                  <th className="px-2 text-center border-r border-slate-300 w-[65px]">Giới tính</th>
                  <th className="px-2.5 text-center border-r border-slate-300 w-[105px]">Ngày sinh</th>
                  <th className="px-2.5 border-r border-slate-300 w-[105px]">Học hàm</th>
                  <th className="px-2.5 border-r border-slate-300 w-[100px]">Học vị</th>
                  <th className="px-3 border-r border-slate-300 min-w-[180px]">Chuyên môn</th>
                  <th className="px-2 text-center border-r border-slate-300 w-[80px]">Năm TD</th>
                  <th className="px-2.5 text-center border-r border-slate-300 w-[115px]">Ký HĐLĐ</th>
                  <th className="px-2 text-center border-r border-slate-300 w-[80px]">Năm TN</th>
                  <th className="px-2 text-center border-r border-slate-300 w-[95px]">Năm PGS</th>
                  <th className="px-2 text-center border-r border-slate-300 w-[95px]">Năm GS</th>
                  <th className="px-2.5 text-center border-r border-slate-300 w-[90px]">CCSP</th>
                  <th className="px-2.5 border-r border-slate-300 w-[110px]">Anh văn</th>
                  <th className="px-2.5 border-r border-slate-300 w-[150px]">Tin học</th>
                  <th className="px-3 border-r border-slate-300 min-w-[180px]">Kiêm nhiệm</th>
                  <th className="px-3 border-r border-slate-300 min-w-[180px]">Đơn vị kiêm nhiệm</th>
                  <th className="px-3 text-center w-[120px] sticky right-0 bg-[#f1f5f9] shadow-xs">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={21} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center max-w-lg mx-auto px-4">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#005325] border border-emerald-200 flex items-center justify-center mb-3 shadow-2xs">
                          <FileSpreadsheet className="w-8 h-8" />
                        </div>
                        <h3 className="text-[16px] font-bold text-slate-800 mb-1">
                          Chưa có dữ liệu cán bộ, giảng viên
                        </h3>
                        <p className="text-[12.5px] text-slate-500 leading-relaxed mb-5 text-center">
                          Dữ liệu cũ đã được xóa sạch. Hãy tải lên file Excel (18 cột chuẩn Đại học Tây Đô) để nạp hồ sơ nhân sự tự động, hoặc tải file mẫu Excel nếu cần chuẩn bị dữ liệu.
                        </p>
                        <div className="flex items-center gap-2.5 flex-wrap justify-center">
                          <button
                            onClick={() => setIsImportModalOpen(true)}
                            className="h-[36px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[12.5px] font-medium flex items-center gap-2 cursor-pointer shadow-xs transition-all"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Import từ file Excel</span>
                          </button>
                          <button
                            onClick={handleDownloadTemplate}
                            className="h-[36px] px-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[12.5px] font-medium flex items-center gap-2 cursor-pointer shadow-2xs transition-all"
                          >
                            <Download className="w-4 h-4 text-emerald-600" />
                            <span>Tải file Excel mẫu</span>
                          </button>
                          <button
                            onClick={handleOpenAdd}
                            className="h-[36px] px-4 rounded-xl bg-[#005325] hover:bg-[#00421e] text-white text-[12.5px] font-medium flex items-center gap-2 cursor-pointer shadow-xs transition-all"
                          >
                            <Plus className="w-4 h-4" />
                            <span>+ Thêm thủ công</span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={21} className="py-12 text-center text-slate-500">
                      Không tìm thấy cán bộ, nhân sự nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <tr key={user.id} className="h-[38px] hover:bg-blue-50/40 transition-colors font-normal text-slate-600">
                      <td className="px-2.5 text-center border-r border-slate-200">
                        {idx + 1}
                      </td>

                      {/* Họ tên */}
                      <td className="px-3 font-normal text-slate-600 border-r border-slate-200 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenDetail(user)}
                          className="hover:text-[#005325] hover:underline cursor-pointer text-left font-normal"
                        >
                          {user.hoTen}
                        </button>
                      </td>

                      {/* Mã nhân sự */}
                      <td className="px-2.5 font-normal text-slate-600 border-r border-slate-200 whitespace-nowrap">
                        {user.maNhanSu}
                      </td>

                      {/* Chức vụ */}
                      <td className="px-3 font-normal text-slate-600 border-r border-slate-200 whitespace-nowrap">
                        {user.chucVu}
                      </td>

                      {/* Đơn vị */}
                      <td className="px-3 font-normal text-slate-600 border-r border-slate-200 whitespace-nowrap">
                        {user.donVi}
                      </td>

                      {/* Giới tính */}
                      <td className="px-2 text-center font-normal text-slate-600 border-r border-slate-200 whitespace-nowrap">
                        {user.gioiTinh}
                      </td>

                      {/* Ngày sinh */}
                      <td className="px-2.5 text-center font-normal text-slate-600 border-r border-slate-200 whitespace-nowrap">
                        {user.ngaySinh}
                      </td>

                      {/* Học hàm */}
                      <td className="px-2.5 font-normal text-slate-600 border-r border-slate-200 whitespace-nowrap">
                        {user.hocHam || '—'}
                      </td>

                      {/* Học vị */}
                      <td className="px-2.5 font-normal text-slate-600 border-r border-slate-200 whitespace-nowrap">
                        {user.hocVi}
                      </td>

                      {/* Chuyên môn */}
                      <td className="px-3 font-normal text-slate-600 border-r border-slate-200 whitespace-nowrap">
                        {user.chuyenMon}
                      </td>

                      {/* Năm tuyển dụng */}
                      <td className="px-2 text-center font-normal text-slate-600 border-r border-slate-200 whitespace-nowrap">
                        {user.namTuyenDung}
                      </td>

                      {/* Ngày ký HĐLĐ chính thức */}
                      <td className="px-2.5 text-center font-normal text-slate-600 border-r border-slate-200 whitespace-nowrap">
                        {user.ngayKyHDLD}
                      </td>

                      {/* Năm tốt nghiệp */}
                      <td className="px-2 text-center font-normal text-slate-600 border-r border-slate-200 whitespace-nowrap">
                        {user.namTotNghiep}
                      </td>

                      {/* Năm PGS */}
                      <td className="px-2 text-center font-normal text-slate-600 border-r border-slate-200 whitespace-nowrap">
                        {user.namCongNhanPGS || '—'}
                      </td>

                      {/* Năm GS */}
                      <td className="px-2 text-center font-normal text-slate-600 border-r border-slate-200 whitespace-nowrap">
                        {user.namCongNhanGS || '—'}
                      </td>

                      {/* CCSP */}
                      <td className="px-2.5 text-center font-normal text-slate-600 border-r border-slate-200 whitespace-nowrap">
                        {user.ccsp}
                      </td>

                      {/* Anh văn */}
                      <td className="px-2.5 font-normal text-slate-600 border-r border-slate-200 whitespace-nowrap">
                        {user.anhVan}
                      </td>

                      {/* Tin học */}
                      <td className="px-2.5 font-normal text-slate-600 border-r border-slate-200 whitespace-nowrap">
                        <span className="truncate block max-w-[140px]" title={user.tinHoc}>
                          {user.tinHoc}
                        </span>
                      </td>

                      {/* Kiêm nhiệm */}
                      <td className="px-3 font-normal text-slate-600 border-r border-slate-200 whitespace-nowrap">
                        {user.kiemNhiem || '—'}
                      </td>

                      {/* Đơn vị kiêm nhiệm */}
                      <td className="px-3 font-normal text-slate-600 border-r border-slate-200 whitespace-nowrap">
                        {user.donViKiemNhiem || '—'}
                      </td>

                      {/* Thao tác */}
                      <td className="px-3 text-center whitespace-nowrap sticky right-0 bg-white shadow-xs">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(user)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50 text-[#005325] hover:bg-emerald-100 border border-emerald-200 cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer"
                            title="Xóa hồ sơ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </>
      )}

      {/* 5. Modal: Add / Edit User (Covering all 20 columns) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[800px] max-h-[86vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="bg-[#005325] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-[15px]">
                  {editingUser ? 'CHỈNH SỬA HỒ SƠ NHÂN SỰ' : 'THÊM MỚI HỒ SƠ NHÂN SỰ'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-5 space-y-4 text-[12.5px]">
              {/* Group 1: Thông tin định danh & Công tác */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-[13px] flex items-center gap-2 text-[#005325]">
                  <UserCheck className="w-4 h-4" /> 1. Thông tin định danh & Công tác
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.hoTen || ''}
                      onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Mã nhân sự <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.maNhanSu || ''}
                      onChange={(e) => setFormData({ ...formData, maNhanSu: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Giới tính</label>
                    <select
                      value={formData.gioiTinh || 'Nam'}
                      onChange={(e) => setFormData({ ...formData, gioiTinh: e.target.value as 'Nam' | 'Nữ' })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Ngày, tháng năm sinh</label>
                    <input
                      type="text"
                      placeholder="DD/MM/YYYY"
                      value={formData.ngaySinh || ''}
                      onChange={(e) => setFormData({ ...formData, ngaySinh: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Chức vụ</label>
                    <input
                      type="text"
                      value={formData.chucVu || ''}
                      onChange={(e) => setFormData({ ...formData, chucVu: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Đơn vị (Khoa/Phòng/TT)</label>
                    <input
                      type="text"
                      value={formData.donVi || ''}
                      onChange={(e) => setFormData({ ...formData, donVi: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Group 2: Học hàm, Học vị & Chuyên môn */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-[13px] flex items-center gap-2 text-[#005325]">
                  <Award className="w-4 h-4" /> 2. Học hàm, Học vị & Chuyên môn
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Học hàm</label>
                    <select
                      value={formData.hocHam || ''}
                      onChange={(e) => setFormData({ ...formData, hocHam: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">(Không có)</option>
                      <option value="Giáo sư">Giáo sư</option>
                      <option value="Phó Giáo sư">Phó Giáo sư</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Học vị</label>
                    <select
                      value={formData.hocVi || 'Thạc sĩ'}
                      onChange={(e) => setFormData({ ...formData, hocVi: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Tiến sĩ">Tiến sĩ</option>
                      <option value="Thạc sĩ">Thạc sĩ</option>
                      <option value="Bác sĩ CKII">Bác sĩ CKII</option>
                      <option value="Bác sĩ CKI">Bác sĩ CKI</option>
                      <option value="Đại học">Đại học</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Chuyên môn</label>
                    <input
                      type="text"
                      placeholder="vd: Khoa học máy tính, Dược..."
                      value={formData.chuyenMon || ''}
                      onChange={(e) => setFormData({ ...formData, chuyenMon: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Năm tốt nghiệp ĐH</label>
                    <input
                      type="number"
                      value={formData.namTotNghiep || ''}
                      onChange={(e) => setFormData({ ...formData, namTotNghiep: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Năm công nhận PGS</label>
                    <input
                      type="number"
                      placeholder="vd: 2019"
                      value={formData.namCongNhanPGS || ''}
                      onChange={(e) => setFormData({ ...formData, namCongNhanPGS: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Năm công nhận GS</label>
                    <input
                      type="number"
                      placeholder="vd: 2024"
                      value={formData.namCongNhanGS || ''}
                      onChange={(e) => setFormData({ ...formData, namCongNhanGS: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Group 3: Tuyển dụng, Hợp đồng & Chứng chỉ */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-[13px] flex items-center gap-2 text-[#005325]">
                  <BookOpen className="w-4 h-4" /> 3. Tuyển dụng, Hợp đồng & Ngoại ngữ / Tin học
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Năm tuyển dụng</label>
                    <input
                      type="number"
                      value={formData.namTuyenDung || ''}
                      onChange={(e) => setFormData({ ...formData, namTuyenDung: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Ngày ký HĐLĐ chính thức</label>
                    <input
                      type="text"
                      placeholder="DD/MM/YYYY"
                      value={formData.ngayKyHDLD || ''}
                      onChange={(e) => setFormData({ ...formData, ngayKyHDLD: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Chứng chỉ sư phạm (CCSP)</label>
                    <input
                      type="text"
                      value={formData.ccsp || 'Đã có'}
                      onChange={(e) => setFormData({ ...formData, ccsp: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Anh văn / Ngoại ngữ</label>
                    <input
                      type="text"
                      placeholder="B2, IELTS, TOEIC..."
                      value={formData.anhVan || ''}
                      onChange={(e) => setFormData({ ...formData, anhVan: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-medium mb-1">Tin học</label>
                    <input
                      type="text"
                      placeholder="vd: Ứng dụng CNTT Nâng cao, MOS..."
                      value={formData.tinHoc || ''}
                      onChange={(e) => setFormData({ ...formData, tinHoc: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Group 4: Kiêm nhiệm */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-[13px] flex items-center gap-2 text-[#005325]">
                  <Briefcase className="w-4 h-4" /> 4. Nhiệm vụ kiêm nhiệm
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Nhiệm vụ kiêm nhiệm</label>
                    <input
                      type="text"
                      placeholder="vd: Trưởng BM, Cố vấn học tập, Thư ký..."
                      value={formData.kiemNhiem || ''}
                      onChange={(e) => setFormData({ ...formData, kiemNhiem: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Đơn vị kiêm nhiệm</label>
                    <input
                      type="text"
                      placeholder="vd: Khoa Công nghệ thông tin..."
                      value={formData.donViKiemNhiem || ''}
                      onChange={(e) => setFormData({ ...formData, donViKiemNhiem: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#005325] text-white font-medium hover:bg-[#00421e] cursor-pointer shadow-xs"
                >
                  {editingUser ? 'Cập nhật hồ sơ' : 'Thêm mới vào hệ thống'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal: Import Users from Excel (18 Columns) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[950px] max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="bg-[#005325] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="font-bold text-[15px]">
                    IMPORT HỒ SƠ NGƯỜI DÙNG TỪ FILE EXCEL
                  </h3>
                  <p className="text-[11.5px] text-emerald-100">
                    Hỗ trợ file Excel 18 cột nhân sự theo định dạng chuẩn Đại học Tây Đô
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseImportModal}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-[12.5px]">
              {/* Dropzone Upload Box */}
              <div className="border-2 border-dashed border-emerald-300 rounded-2xl bg-emerald-50/40 p-6 text-center hover:bg-emerald-50/70 transition-colors">
                <input
                  type="file"
                  id="excel-file-upload-input"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#005325] flex items-center justify-center mb-2.5 shadow-2xs">
                    <FileUp className="w-6 h-6" />
                  </div>
                  <label
                    htmlFor="excel-file-upload-input"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#005325] hover:bg-[#00421e] text-white font-medium rounded-xl cursor-pointer shadow-xs transition-all text-[13px]"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Chọn file Excel (.xlsx, .xls)</span>
                  </label>
                  <p className="text-slate-500 text-[12px] mt-2">
                    Hệ thống sẽ tự động nhận diện và ghép đúng 18 cột thông tin nhân sự
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-[12px]">
                    <span className="text-slate-500">Chưa có file mẫu chuẩn?</span>
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="text-[#005325] hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tải file Excel mẫu 18 cột</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {importError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <div className="font-semibold">Lỗi import file:</div>
                    <div className="text-[12px] mt-0.5">{importError}</div>
                  </div>
                </div>
              )}

              {/* Processing Loader */}
              {isProcessingFile && (
                <div className="py-6 flex flex-col items-center justify-center text-slate-500 gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                  <span>Đang đọc và xử lý dữ liệu từ file Excel...</span>
                </div>
              )}

              {/* Data Loaded Preview Card */}
              {importFile && parsedImportUsers.length > 0 && !isProcessingFile && (
                <div className="space-y-4">
                  {/* Summary Bar */}
                  <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[14px]">
                        {parsedImportUsers.length}
                      </div>
                      <div>
                        <div className="font-semibold text-blue-900 text-[13px]">
                          Đã đọc thành công {parsedImportUsers.length} hồ sơ nhân sự
                        </div>
                        <div className="text-blue-700 text-[11.5px]">
                          Tên file: <span className="font-medium">{importFile.name}</span> ({(importFile.size / 1024).toFixed(1)} KB)
                        </div>
                      </div>
                    </div>

                    {/* Overwrite Checkbox */}
                    <label className="flex items-center gap-2 text-slate-700 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                      <input
                        type="checkbox"
                        checked={overwriteExisting}
                        onChange={(e) => setOverwriteExisting(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-medium text-[12px]">Xóa toàn bộ dữ liệu cũ và ghi đè</span>
                    </label>
                  </div>

                  {/* Preview Table of first 5 rows */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-slate-700 text-[12px]">
                        Xem trước 5 hồ sơ đầu tiên (trong tổng số {parsedImportUsers.length} cán bộ):
                      </span>
                      <span className="text-slate-400 text-[11.5px]">
                        Cuộn ngang để xem tất cả cột đã ghép
                      </span>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-[220px]">
                      <table className="w-full text-left text-[11.5px] border-collapse min-w-[1400px]">
                        <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 border-b border-slate-200">
                          <tr>
                            <th className="p-2 border-r border-slate-200 w-10 text-center">STT</th>
                            <th className="p-2 border-r border-slate-200">Họ tên</th>
                            <th className="p-2 border-r border-slate-200">Mã NS</th>
                            <th className="p-2 border-r border-slate-200">Chức vụ</th>
                            <th className="p-2 border-r border-slate-200">Đơn vị</th>
                            <th className="p-2 border-r border-slate-200 text-center">Giới tính</th>
                            <th className="p-2 border-r border-slate-200 text-center">Ngày sinh</th>
                            <th className="p-2 border-r border-slate-200">Học hàm</th>
                            <th className="p-2 border-r border-slate-200">Học vị</th>
                            <th className="p-2 border-r border-slate-200">Chuyên môn</th>
                            <th className="p-2 border-r border-slate-200 text-center">Năm TD</th>
                            <th className="p-2 border-r border-slate-200 text-center">Ký HĐLĐ</th>
                            <th className="p-2 border-r border-slate-200 text-center">CCSP</th>
                            <th className="p-2 border-r border-slate-200">Anh văn</th>
                            <th className="p-2 border-r border-slate-200">Tin học</th>
                            <th className="p-2 border-r border-slate-200">Kiêm nhiệm</th>
                            <th className="p-2">Đơn vị kiêm nhiệm</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {parsedImportUsers.slice(0, 5).map((u, i) => (
                            <tr key={u.id} className="hover:bg-slate-50">
                              <td className="p-2 text-center border-r border-slate-200 font-medium">{i + 1}</td>
                              <td className="p-2 border-r border-slate-200 font-semibold text-slate-800">{u.hoTen}</td>
                              <td className="p-2 border-r border-slate-200 font-mono">{u.maNhanSu}</td>
                              <td className="p-2 border-r border-slate-200">{u.chucVu}</td>
                              <td className="p-2 border-r border-slate-200">{u.donVi}</td>
                              <td className="p-2 border-r border-slate-200 text-center">{u.gioiTinh}</td>
                              <td className="p-2 border-r border-slate-200 text-center">{u.ngaySinh}</td>
                              <td className="p-2 border-r border-slate-200">{u.hocHam || '—'}</td>
                              <td className="p-2 border-r border-slate-200">{u.hocVi}</td>
                              <td className="p-2 border-r border-slate-200">{u.chuyenMon}</td>
                              <td className="p-2 border-r border-slate-200 text-center">{u.namTuyenDung}</td>
                              <td className="p-2 border-r border-slate-200 text-center">{u.ngayKyHDLD}</td>
                              <td className="p-2 border-r border-slate-200 text-center">{u.ccsp}</td>
                              <td className="p-2 border-r border-slate-200">{u.anhVan}</td>
                              <td className="p-2 border-r border-slate-200 truncate max-w-[120px]">{u.tinHoc}</td>
                              <td className="p-2 border-r border-slate-200">{u.kiemNhiem || '—'}</td>
                              <td className="p-2">{u.donViKiemNhiem || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Structure Reference Information */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-slate-600 text-[11.5px] space-y-1">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Danh sách 18 cột nhân sự theo yêu cầu:</span>
                </div>
                <p className="leading-relaxed">
                  1. STT, 2. Họ tên, 3. Chức vụ, 4. Đơn vị, 5. Mã nhân sự, 6. Giới tính, 7. Ngày tháng năm sinh, 8. Học hàm, học vị (tự động phân tách GS/PGS và TS/ThS nếu chung cột), 9. Chuyên môn, 10. Năm tuyển dụng, 11. Ngày ký HĐLĐ chính thức, 12. Năm tốt nghiệp, 13. Năm công nhận PGS, 14. Năm công nhận Giáo sư, 15. CCSP, 16. Anh văn, 17. Tin học, 18. Kiêm nhiệm, Đơn vị kiêm nhiệm.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={handleCloseImportModal}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                disabled={parsedImportUsers.length === 0 || isProcessingFile}
                onClick={handleConfirmImport}
                className={`px-5 py-2 rounded-xl font-medium flex items-center gap-2 shadow-xs transition-all ${
                  parsedImportUsers.length > 0 && !isProcessingFile
                    ? 'bg-[#005325] hover:bg-[#00421e] text-white cursor-pointer'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {parsedImportUsers.length > 0
                    ? `Xác nhận nạp ${parsedImportUsers.length} cán bộ vào hệ thống`
                    : 'Vui lòng chọn file Excel'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
