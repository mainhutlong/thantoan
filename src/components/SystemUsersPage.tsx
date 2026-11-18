import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Download,
  Upload,
  UploadCloud,
  Edit2,
  Edit3,
  Trash2,
  Eye,
  X,
  Check,
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
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
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

  // Pagination states (10, 20, 50, 100 rows per page)
  const [pageSize, setPageSize] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDept, selectedDegree, selectedGender, pageSize]);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUserProfile | null>(null);

  // Slide-over Drawer states (merged Detail & Edit)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerUser, setDrawerUser] = useState<SystemUserProfile | null>(null);
  const [drawerFormData, setDrawerFormData] = useState<Partial<SystemUserProfile>>({});

  // Import Excel Modal states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedImportUsers, setParsedImportUsers] = useState<SystemUserProfile[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [overwriteExisting, setOverwriteExisting] = useState(true);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Form state for 20 columns (Used by Add Modal)
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

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedUsers = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, safeCurrentPage, pageSize]);

  // Open Drawer (Detail & Edit)
  const handleOpenDrawer = (user: SystemUserProfile) => {
    setDrawerUser(user);
    setDrawerFormData({ ...user });
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setDrawerUser(null);
  };

  const handleSaveDrawer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!drawerUser) return;
    if (!drawerFormData.hoTen || !drawerFormData.maNhanSu) {
      alert('Vui lòng điền đầy đủ Họ tên và Mã nhân sự!');
      return;
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === drawerUser.id ? ({ ...u, ...drawerFormData } as SystemUserProfile) : u))
    );
    setDrawerUser((prev) => (prev ? ({ ...prev, ...drawerFormData } as SystemUserProfile) : null));
    alert('Đã cập nhật thông tin hồ sơ cán bộ thành công!');
    setIsDrawerOpen(false);
  };

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

  // Handle file parsing for Excel import (shared by file input and drag-drop)
  const handleProcessExcelFile = (file: File) => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessExcelFile(file);
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
                  paginatedUsers.map((user, idx) => {
                    const globalIdx = (safeCurrentPage - 1) * pageSize + idx + 1;
                    return (
                    <tr key={user.id} className="h-[38px] hover:bg-blue-50/40 transition-colors font-normal text-slate-600">
                      <td className="px-2.5 text-center border-r border-slate-200">
                        {globalIdx}
                      </td>

                      {/* Họ tên */}
                      <td className="px-3 font-normal text-slate-600 border-r border-slate-200 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenDrawer(user)}
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

                      {/* Thao tác (Chỉ lấy icon, bỏ chữ) */}
                      <td className="px-3 text-center whitespace-nowrap sticky right-0 bg-white shadow-xs">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenDrawer(user)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer transition-colors"
                            title="Xem chi tiết & Chỉnh sửa hồ sơ nhân sự"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer transition-colors"
                            title="Xóa hồ sơ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 4.5. Thanh phân trang & Chế độ hiển thị 10, 20, 50, 100 dòng */}
          {filteredUsers.length > 0 && (
            <div className="bg-white border-t border-slate-200 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-slate-600">
              {/* Chế độ hiển thị */}
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-500">Hiển thị</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-[28px] px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value={10}>10 dòng</option>
                  <option value={20}>20 dòng</option>
                  <option value={50}>50 dòng</option>
                  <option value={100}>100 dòng</option>
                </select>
                <span className="font-medium text-slate-500">/ trang</span>
                <span className="text-slate-300 mx-1">|</span>
                <span className="text-slate-600">
                  Hiển thị <b>{(safeCurrentPage - 1) * pageSize + 1}</b> -{' '}
                  <b>{Math.min(safeCurrentPage * pageSize, filteredUsers.length)}</b> trong tổng số{' '}
                  <b>{filteredUsers.length}</b> cán bộ
                </span>
              </div>

              {/* Điều hướng trang */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={safeCurrentPage === 1}
                  className="h-7 px-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-slate-600 transition-colors"
                  title="Trang đầu"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="h-7 px-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-slate-600 transition-colors"
                  title="Trang trước"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {/* Chỉ số trang */}
                <div className="flex items-center gap-1 mx-1.5 font-medium">
                  <span className="px-2 py-0.5 rounded-md bg-[#005325] text-white text-[11.5px] font-semibold">
                    Trang {safeCurrentPage}
                  </span>
                  <span className="text-slate-400">/</span>
                  <span className="text-slate-700">{totalPages}</span>
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="h-7 px-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-slate-600 transition-colors"
                  title="Trang sau"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  className="h-7 px-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-slate-600 transition-colors"
                  title="Trang cuối"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Modal: Add / Edit User (Covering all 20 columns) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[800px] max-h-[86vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Header - Giao diện trắng */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shadow-2xs">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[16px] text-slate-800 leading-tight">
                    {editingUser ? 'CHỈNH SỬA HỒ SƠ NHÂN SỰ' : 'THÊM MỚI HỒ SƠ NHÂN SỰ'}
                  </h3>
                  <p className="text-[12px] text-slate-500">
                    Nhập thông tin hồ sơ cán bộ, giảng viên theo chuẩn 18 cột Đại học Tây Đô
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-5 space-y-4 text-[12.5px]">
              {/* Group 1: Thông tin định danh & Công tác */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-[13px] flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-slate-600" /> 1. Thông tin định danh & Công tác
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
                <h4 className="font-bold text-slate-800 text-[13px] flex items-center gap-2">
                  <Award className="w-4 h-4 text-slate-600" /> 2. Học hàm, Học vị & Chuyên môn
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
                <h4 className="font-bold text-slate-800 text-[13px] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-600" /> 3. Tuyển dụng, Hợp đồng & Ngoại ngữ / Tin học
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
                <h4 className="font-bold text-slate-800 text-[13px] flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-600" /> 4. Nhiệm vụ kiêm nhiệm
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

      {/* 6. Modal: Import Users from Excel (Thiết kế chuẩn theo mẫu) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[850px] max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Header theo thiết kế mẫu */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[16px] text-slate-900 leading-tight">
                      Import dữ liệu hồ sơ nhân sự
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11.5px] bg-slate-100 text-slate-600 font-medium border border-slate-200/80">
                      Hồ sơ 18 cột TDU
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    Kéo thả file ở trên để đối soát và nạp mã nhân sự vào hệ thống
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseImportModal}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-[12.5px]">
              {/* Section 1 Header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[13px]">
                  <UploadCloud className="w-4 h-4 text-slate-700" />
                  <span>1. Chọn hoặc kéo thả tập tin Excel (.xlsx, .xls)</span>
                  <span className="text-rose-500 font-bold">*</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="text-[#1a73e8] hover:underline font-medium text-[12.5px] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải file mẫu chuẩn</span>
                </button>
              </div>

              {/* Dashed Dropzone Upload Box */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleProcessExcelFile(file);
                }}
                className="border-2 border-dashed border-slate-300 rounded-2xl bg-white p-7 text-center hover:border-blue-400 hover:bg-blue-50/20 transition-all flex flex-col items-center justify-center"
              >
                <input
                  type="file"
                  id="excel-file-upload-input"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 mb-2.5 shadow-2xs">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="font-semibold text-slate-800 text-[13.5px]">
                  Kéo thả file Excel vào đây hoặc bấm nút để chọn file
                </div>
                <div className="text-slate-400 text-[12px] mt-1 mb-3.5">
                  Định dạng hỗ trợ: XLS, XLSX — Tối đa 20MB
                </div>
                <label
                  htmlFor="excel-file-upload-input"
                  className="px-5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[12.5px] font-medium shadow-2xs cursor-pointer transition-all inline-flex items-center gap-2"
                >
                  <span>Chọn file từ máy</span>
                </label>
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
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  <span>Đang đọc và phân tích cấu trúc file Excel...</span>
                </div>
              )}

              {/* Preview data when file is parsed */}
              {importFile && parsedImportUsers.length > 0 && !isProcessingFile && (
                <div className="space-y-3 mt-3">
                  <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 flex items-center justify-between text-[12.5px]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        {parsedImportUsers.length}
                      </div>
                      <div>
                        <span className="font-semibold text-blue-950">Đã đọc thành công {parsedImportUsers.length} hồ sơ nhân sự</span>
                        <span className="text-blue-700 block text-[11.5px]">Tệp: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    </div>
                    <span className="text-emerald-700 font-semibold bg-emerald-100/70 px-2.5 py-1 rounded-md text-[11.5px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Hợp lệ 18 cột
                    </span>
                  </div>

                  {/* Preview Table of first 5 rows */}
                  <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-[190px]">
                    <table className="w-full text-left text-[11.5px] border-collapse min-w-[1300px]">
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
                          <th className="p-2">Kiêm nhiệm</th>
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
                            <td className="p-2">{u.kiemNhiem || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Chế độ import: Toggle Button Group giống thiết kế ảnh */}
              <div className="border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between bg-white mt-4">
                <span className="text-slate-700 font-semibold text-[13px]">Chế độ import:</span>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setOverwriteExisting(true)}
                    className={`px-4 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all cursor-pointer ${
                      overwriteExisting
                        ? 'bg-[#0f172a] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 bg-transparent'
                    }`}
                  >
                    Tạo mới (Ghi đè)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverwriteExisting(false)}
                    className={`px-4 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all cursor-pointer ${
                      !overwriteExisting
                        ? 'bg-[#0f172a] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 bg-transparent'
                    }`}
                  >
                    Cập nhật bổ sung
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer giống thiết kế ảnh */}
            <div className="border-t border-slate-200 px-6 py-3.5 flex items-center justify-end gap-3 bg-slate-50/60 shrink-0">
              <button
                type="button"
                onClick={handleCloseImportModal}
                className="px-5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium text-[13px] cursor-pointer shadow-2xs"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={parsedImportUsers.length === 0 || isProcessingFile}
                onClick={handleConfirmImport}
                className={`px-5 py-2 rounded-xl font-medium text-[13px] transition-all shadow-xs ${
                  parsedImportUsers.length > 0 && !isProcessingFile
                    ? 'bg-[#1e40af] hover:bg-blue-800 text-white cursor-pointer'
                    : 'bg-[#e2e8f0] text-slate-400 cursor-not-allowed'
                }`}
              >
                Import dữ liệu ({parsedImportUsers.length} dòng)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Slide-over Popup Drawer từ bên phải qua (Chi tiết & Chỉnh sửa tích hợp) */}
      {isDrawerOpen && drawerUser && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-2xs transition-opacity"
            onClick={handleCloseDrawer}
          />

          {/* Slide-over Panel from right */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-[660px] bg-white shadow-2xl flex flex-col border-l border-slate-200">
              {/* Drawer Header - Giao diện trắng chuẩn */}
              <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-xl shadow-2xs">
                    {(drawerFormData.hoTen || drawerUser.hoTen).slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[16px] leading-tight text-slate-800">
                        {drawerFormData.hoTen || drawerUser.hoTen}
                      </h3>
                      <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-mono text-slate-600">
                        {drawerFormData.maNhanSu || drawerUser.maNhanSu}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-500 mt-0.5 font-normal">
                      {drawerFormData.chucVu || drawerUser.chucVu} • {drawerFormData.donVi || drawerUser.donVi}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCloseDrawer}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Form Body */}
              <form onSubmit={handleSaveDrawer} className="flex-1 overflow-y-auto p-6 space-y-5 text-[12.5px]">
                {/* Card 1: Thông tin cá nhân & Công tác */}
                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-800 text-[13px] flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-slate-600" /> 1. Thông tin cá nhân & Công tác
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-600 font-medium mb-1">
                        Họ và tên <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={drawerFormData.hoTen || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, hoTen: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Mã nhân sự <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={drawerFormData.maNhanSu || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, maNhanSu: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Giới tính</label>
                      <select
                        value={drawerFormData.gioiTinh || 'Nam'}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, gioiTinh: e.target.value as 'Nam' | 'Nữ' })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
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
                        value={drawerFormData.ngaySinh || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, ngaySinh: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Chức vụ</label>
                      <input
                        type="text"
                        value={drawerFormData.chucVu || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, chucVu: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-600 font-medium mb-1">Đơn vị (Khoa/Phòng/TT)</label>
                      <input
                        type="text"
                        value={drawerFormData.donVi || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, donVi: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Card 2: Học hàm, học vị & Chuyên môn */}
                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-800 text-[13px] flex items-center gap-2">
                    <Award className="w-4 h-4 text-slate-600" /> 2. Trình độ học vấn & Chuyên môn
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Học hàm</label>
                      <select
                        value={drawerFormData.hocHam || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, hocHam: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="">(Không có học hàm)</option>
                        <option value="Phó Giáo sư">Phó Giáo sư (PGS)</option>
                        <option value="Giáo sư">Giáo sư (GS)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Học vị</label>
                      <input
                        type="text"
                        placeholder="Tiến sĩ, Thạc sĩ, Cử nhân..."
                        value={drawerFormData.hocVi || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, hocVi: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-600 font-medium mb-1">Chuyên môn đào tạo</label>
                      <input
                        type="text"
                        value={drawerFormData.chuyenMon || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, chuyenMon: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Năm tốt nghiệp ĐH</label>
                      <input
                        type="number"
                        value={drawerFormData.namTotNghiep || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, namTotNghiep: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Năm công nhận PGS</label>
                      <input
                        type="text"
                        placeholder="Để trống nếu chưa có"
                        value={drawerFormData.namCongNhanPGS || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, namCongNhanPGS: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Năm công nhận Giáo sư</label>
                      <input
                        type="text"
                        placeholder="Để trống nếu chưa có"
                        value={drawerFormData.namCongNhanGS || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, namCongNhanGS: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Card 3: Hợp đồng & Tiêu chuẩn */}
                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-800 text-[13px] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-600" /> 3. Hợp đồng & Tiêu chuẩn chức danh
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Năm tuyển dụng</label>
                      <input
                        type="number"
                        value={drawerFormData.namTuyenDung || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, namTuyenDung: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Ngày ký HĐLĐ chính thức</label>
                      <input
                        type="text"
                        placeholder="DD/MM/YYYY"
                        value={drawerFormData.ngayKyHDLD || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, ngayKyHDLD: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Chứng chỉ sư phạm (CCSP)</label>
                      <input
                        type="text"
                        value={drawerFormData.ccsp || 'Đã có'}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, ccsp: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Anh văn / Ngoại ngữ</label>
                      <input
                        type="text"
                        placeholder="B2, IELTS, TOEIC..."
                        value={drawerFormData.anhVan || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, anhVan: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-600 font-medium mb-1">Tin học</label>
                      <input
                        type="text"
                        placeholder="Ứng dụng CNTT Nâng cao, MOS..."
                        value={drawerFormData.tinHoc || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, tinHoc: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Card 4: Nhiệm vụ kiêm nhiệm */}
                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-800 text-[13px] flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-600" /> 4. Nhiệm vụ kiêm nhiệm
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Nhiệm vụ kiêm nhiệm</label>
                      <input
                        type="text"
                        placeholder="Trưởng BM, Cố vấn học tập, Thư ký..."
                        value={drawerFormData.kiemNhiem || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, kiemNhiem: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Đơn vị kiêm nhiệm</label>
                      <input
                        type="text"
                        placeholder="Khoa Công nghệ thông tin..."
                        value={drawerFormData.donViKiemNhiem || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, donViKiemNhiem: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </form>

              {/* Drawer Footer */}
              <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ cán bộ "${drawerUser.hoTen}" không?`)) {
                      handleDeleteUser(drawerUser.id);
                      handleCloseDrawer();
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[12px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa hồ sơ</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleCloseDrawer}
                    className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-[12.5px] font-medium cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveDrawer()}
                    className="px-5 py-2 rounded-xl bg-[#005325] hover:bg-[#00421e] text-white text-[12.5px] font-medium flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Lưu thay đổi</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
