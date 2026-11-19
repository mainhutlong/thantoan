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
import { createStyledWorksheet, saveWorkbookToFile, TemplateColumn } from '../utils/excelTemplateGenerator';
import { SystemUserProfile } from '../types';
import { FULL_PERSONNEL_245 } from '../data/fullPersonnel245';

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

// 245 university personnel initialized from master dataset
export const INITIAL_SYSTEM_USERS: SystemUserProfile[] = FULL_PERSONNEL_245;

export const SystemUsersPage: React.FC = () => {
  const [users, setUsers] = useState<SystemUserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('tdu_system_users_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 200) return parsed;
      }
    } catch {
      // fallback
    }
    return FULL_PERSONNEL_245;
  });

  // Fetch full 245 users from MySQL backend if running
  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.data) && data.data.length >= 200) {
          const mapped: SystemUserProfile[] = data.data.map((u: any, idx: number) => ({
            id: `user-${u.id || idx + 1}`,
            stt: idx + 1,
            hoTen: u.hoTen,
            chucVu: u.chucVu || '',
            donVi: u.donVi || '',
            maNhanSu: u.maNhanSu || '',
            email: u.email || '',
            gioiTinh: u.gioiTinh || 'Nam',
            ngaySinh: u.ngaySinh || '',
            hocHam: u.hocHam || '',
            hocVi: u.hocVi || '',
            chuyenMon: u.chuyenMon || '',
            namTuyenDung: u.namTuyenDung || undefined,
            ngayKyHDLD: u.ngayKyHDLD || '',
            namTotNghiep: u.namTotNghiep || undefined,
            namCongNhanPGS: u.namCongNhanPGS || '',
            namCongNhanGS: u.namCongNhanGS || '',
            ccsp: u.ccsp || '',
            anhVan: u.anhVan || '',
            tinHoc: u.tinHoc || '',
            kiemNhiem: u.kiemNhiem || '',
            donViKiemNhiem: u.donViKiemNhiem || '',
            trangThai: u.trangThai === 'KHOA' ? 'khoa' : 'hoat_dong',
          }));
          setUsers(mapped);
          localStorage.setItem('tdu_system_users_v2', JSON.stringify(mapped));
        }
      })
      .catch((err) => {
        console.warn('Could not fetch /api/users, fallback to local data', err);
      });
  }, []);

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

  // Checkbox selection state
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Inline row addition state ("Thêm người dùng mới thì thêm hàng từng người")
  const [isAddingRow, setIsAddingRow] = useState<boolean>(false);
  const [newRowData, setNewRowData] = useState<Partial<SystemUserProfile>>({
    hoTen: '',
    maNhanSu: '',
    chucVu: 'Giảng viên',
    donVi: 'Khoa Công nghệ thông tin',
    gioiTinh: 'Nam',
    ngaySinh: '',
    hocHam: '',
    hocVi: 'Thạc sĩ',
    chuyenMon: '',
    namTuyenDung: new Date().getFullYear(),
    ngayKyHDLD: '',
    namTotNghiep: 2015,
    namCongNhanPGS: '',
    namCongNhanGS: '',
    ccsp: 'Đã có',
    anhVan: 'B2',
    tinHoc: 'Ứng dụng CNTT Cơ bản',
    kiemNhiem: '',
    donViKiemNhiem: '',
    trangThai: 'hoat_dong',
  });

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

  const handleSaveDrawer = async (e?: React.FormEvent) => {
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

    try {
      await fetch(`/api/users/${drawerUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(drawerFormData),
      });
    } catch (err) {
      console.warn('Lỗi đồng bộ MySQL:', err);
    }

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
    setDrawerUser(user);
    setDrawerFormData({ ...user });
    setIsDrawerOpen(true);
  };

  // Delete user
  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hồ sơ nhân sự này khỏi hệ thống?')) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSelectedUserIds((prev) => prev.filter((uid) => uid !== id));

      try {
        await fetch(`/api/users/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Lỗi xóa MySQL:', err);
      }
    }
  };

  // Toggle selection for all visible users on current page
  const handleToggleSelectAll = () => {
    const pageUserIds = paginatedUsers.map((u) => u.id);
    const allSelected = pageUserIds.length > 0 && pageUserIds.every((id) => selectedUserIds.includes(id));
    if (allSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !pageUserIds.includes(id)));
    } else {
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...pageUserIds])));
    }
  };

  // Toggle individual user selection
  const handleToggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  // Delete batch of selected users
  const handleDeleteBatch = async () => {
    if (selectedUserIds.length === 0) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedUserIds.length} cán bộ đã chọn không?`)) {
      const idsToDelete = [...selectedUserIds];
      setUsers((prev) => prev.filter((u) => !selectedUserIds.includes(u.id)));
      setSelectedUserIds([]);

      try {
        await fetch('/api/users/batch-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: idsToDelete }),
        });
      } catch (err) {
        console.warn('Lỗi xóa batch MySQL:', err);
      }
    }
  };

  // Start adding new user row inline
  const handleStartAddRow = () => {
    setNewRowData({
      hoTen: '',
      maNhanSu: `TDU${Math.floor(100 + Math.random() * 899)}`,
      chucVu: 'Giảng viên',
      donVi: 'Khoa Công nghệ thông tin',
      gioiTinh: 'Nam',
      ngaySinh: '',
      hocHam: '',
      hocVi: 'Thạc sĩ',
      chuyenMon: '',
      namTuyenDung: new Date().getFullYear(),
      ngayKyHDLD: '',
      namTotNghiep: 2015,
      namCongNhanPGS: '',
      namCongNhanGS: '',
      ccsp: 'Đã có',
      anhVan: 'B2',
      tinHoc: 'Ứng dụng CNTT Cơ bản',
      kiemNhiem: '',
      donViKiemNhiem: '',
      trangThai: 'hoat_dong',
    });
    setIsAddingRow(true);
  };

  // Save inline new user row
  const handleSaveNewRow = async () => {
    if (!newRowData.hoTen || !newRowData.hoTen.trim()) {
      alert('Vui lòng nhập Họ và tên cán bộ!');
      return;
    }

    const created: SystemUserProfile = {
      id: `user_${Date.now()}`,
      stt: users.length + 1,
      hoTen: newRowData.hoTen.trim(),
      maNhanSu: (newRowData.maNhanSu || `TDU${Math.floor(100 + Math.random() * 899)}`).trim(),
      chucVu: newRowData.chucVu?.trim() || 'Giảng viên',
      donVi: newRowData.donVi?.trim() || 'Khoa Công nghệ thông tin',
      gioiTinh: (newRowData.gioiTinh as 'Nam' | 'Nữ') || 'Nam',
      ngaySinh: newRowData.ngaySinh?.trim() || '',
      hocHam: newRowData.hocHam || '',
      hocVi: newRowData.hocVi?.trim() || 'Thạc sĩ',
      chuyenMon: newRowData.chuyenMon?.trim() || '',
      namTuyenDung: Number(newRowData.namTuyenDung) || new Date().getFullYear(),
      ngayKyHDLD: newRowData.ngayKyHDLD?.trim() || '',
      namTotNghiep: Number(newRowData.namTotNghiep) || 2015,
      namCongNhanPGS: String(newRowData.namCongNhanPGS || '').trim(),
      namCongNhanGS: String(newRowData.namCongNhanGS || '').trim(),
      ccsp: newRowData.ccsp?.trim() || 'Đã có',
      anhVan: newRowData.anhVan?.trim() || 'B2',
      tinHoc: newRowData.tinHoc?.trim() || 'Ứng dụng CNTT Cơ bản',
      kiemNhiem: newRowData.kiemNhiem?.trim() || '',
      donViKiemNhiem: newRowData.donViKiemNhiem?.trim() || '',
      trangThai: 'hoat_dong',
    };

    setUsers((prev) => [created, ...prev]);
    setIsAddingRow(false);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created),
      });
      if (res.ok) {
        const d = await res.json();
        if (d.id) created.id = String(d.id);
      }
    } catch (err) {
      console.warn('Lỗi lưu cán bộ vào MySQL:', err);
    }
  };

  // Save form
  const handleSaveForm = async (e: React.FormEvent) => {
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

      try {
        await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } catch (err) {
        console.warn('Lỗi cập nhật MySQL:', err);
      }
    } else {
      const newUser: SystemUserProfile = {
        ...(formData as SystemUserProfile),
        id: `user-${Date.now()}`,
        stt: users.length + 1,
      };
      setUsers((prev) => [newUser, ...prev]);

      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const d = await res.json();
          if (d.id) newUser.id = String(d.id);
        }
      } catch (err) {
        console.warn('Lỗi tạo mới MySQL:', err);
      }
    }
    setIsFormModalOpen(false);
  };

  // Export to Excel with all 20 columns formatted according to TDU administrative standards
  const handleExportExcel = () => {
    if (filteredUsers.length === 0) {
      alert('Không có dữ liệu người dùng để xuất!');
      return;
    }

    const columns: TemplateColumn[] = [
      { header: 'STT', key: 'stt', width: 6, align: 'center' },
      { header: 'Họ tên (*)', key: 'ho_va_ten', width: 28, isYellow: true, align: 'left' },
      { header: 'Chức vụ (*)', key: 'chuc_vu', width: 22, isYellow: true, align: 'left' },
      { header: 'Đơn vị (*)', key: 'don_vi', width: 28, isYellow: true, align: 'left' },
      { header: 'Mã nhân sự (*)', key: 'ma_nhan_su', width: 16, isYellow: true, align: 'center' },
      { header: 'Giới tính', key: 'gioi_tinh', width: 12, align: 'center' },
      { header: 'Ngày tháng năm sinh', key: 'ngay_sinh', width: 16, align: 'center' },
      { header: 'Học hàm', key: 'hoc_ham', width: 14, align: 'center' },
      { header: 'Học vị (*)', key: 'hoc_vi', width: 14, isYellow: true, align: 'center' },
      { header: 'Chuyên môn', key: 'chuyen_mon', width: 30, align: 'left' },
      { header: 'Năm tuyển dụng', key: 'nam_tuyen_dung', width: 16, align: 'center' },
      { header: 'Ngày ký HĐLĐ', key: 'ngay_ky_hdld', width: 18, align: 'center' },
      { header: 'Năm tốt nghiệp', key: 'nam_tot_nghiep', width: 16, align: 'center' },
      { header: 'Năm CN PGS', key: 'nam_cn_pgs', width: 14, align: 'center' },
      { header: 'Năm CN Giáo sư', key: 'nam_cn_gs', width: 14, align: 'center' },
      { header: 'CCSP', key: 'ccsp', width: 14, align: 'center' },
      { header: 'Anh văn', key: 'anh_van', width: 16, align: 'center' },
      { header: 'Tin học', key: 'tin_hoc', width: 24, align: 'left' },
      { header: 'Kiêm nhiệm', key: 'kiem_nhiem', width: 28, align: 'left' },
      { header: 'Đơn vị kiêm nhiệm', key: 'don_vi_kiem_nhiem', width: 28, align: 'left' },
    ];

    const dataRows = filteredUsers.map((u, idx) => [
      idx + 1,
      u.hoTen,
      u.chucVu,
      u.donVi,
      u.maNhanSu,
      u.gioiTinh,
      u.ngaySinh,
      u.hocHam || '—',
      u.hocVi,
      u.chuyenMon,
      u.namTuyenDung,
      u.ngayKyHDLD,
      u.namTotNghiep,
      u.namCongNhanPGS || '—',
      u.namCongNhanGS || '—',
      u.ccsp,
      u.anhVan,
      u.tinHoc,
      u.kiemNhiem || '—',
      u.donViKiemNhiem || '—',
    ]);

    const summaryRow = [
      `TỔNG CỘNG (${filteredUsers.length} cán bộ)`,
      '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
    ];

    const ws = createStyledWorksheet(
      'BẢNG TỔNG HỢP HỒ SƠ NHÂN SỰ CÁN BỘ GIẢNG VIÊN VÀ HỢP ĐỒNG LAO ĐỘNG (20 CỘT CHUẨN TDU)',
      columns,
      dataRows,
      summaryRow,
      {
        unitName: 'PHÒNG TỔ CHỨC - HÀNH CHÍNH',
        subTitle: `Năm học 2026 - 2027 (Cập nhật ngày ${new Date().toLocaleDateString('vi-VN')})`,
        documentNo: 'BM-TDU-NS-01',
      }
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws, 'Ho_so_Nhan_su_TDU');
    saveWorkbookToFile(workbook, `TDU_Danh_Sach_Nhan_Su_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Download standard Excel template with 20 columns formatted according to TDU administrative standards
  const handleDownloadTemplate = () => {
    const columns: TemplateColumn[] = [
      { header: 'STT', key: 'stt', width: 6, align: 'center' },
      { header: 'Họ tên (*)', key: 'ho_va_ten', width: 28, isYellow: true, align: 'left' },
      { header: 'Chức vụ (*)', key: 'chuc_vu', width: 22, isYellow: true, align: 'left' },
      { header: 'Đơn vị (*)', key: 'don_vi', width: 28, isYellow: true, align: 'left' },
      { header: 'Mã nhân sự (*)', key: 'ma_nhan_su', width: 16, isYellow: true, align: 'center' },
      { header: 'Giới tính', key: 'gioi_tinh', width: 12, align: 'center' },
      { header: 'Ngày tháng năm sinh', key: 'ngay_sinh', width: 16, align: 'center' },
      { header: 'Học hàm', key: 'hoc_ham', width: 14, align: 'center' },
      { header: 'Học vị (*)', key: 'hoc_vi', width: 14, isYellow: true, align: 'center' },
      { header: 'Chuyên môn', key: 'chuyen_mon', width: 30, align: 'left' },
      { header: 'Năm tuyển dụng', key: 'nam_tuyen_dung', width: 16, align: 'center' },
      { header: 'Ngày ký HĐLĐ', key: 'ngay_ky_hdld', width: 18, align: 'center' },
      { header: 'Năm tốt nghiệp', key: 'nam_tot_nghiep', width: 16, align: 'center' },
      { header: 'Năm CN PGS', key: 'nam_cn_pgs', width: 14, align: 'center' },
      { header: 'Năm CN Giáo sư', key: 'nam_cn_gs', width: 14, align: 'center' },
      { header: 'CCSP', key: 'ccsp', width: 14, align: 'center' },
      { header: 'Anh văn', key: 'anh_van', width: 16, align: 'center' },
      { header: 'Tin học', key: 'tin_hoc', width: 24, align: 'left' },
      { header: 'Kiêm nhiệm', key: 'kiem_nhiem', width: 28, align: 'left' },
      { header: 'Đơn vị kiêm nhiệm', key: 'don_vi_kiem_nhiem', width: 28, align: 'left' },
    ];

    const sampleRows = [
      [
        1, 'Nguyễn Văn An', 'Giảng viên cơ hữu', 'Khoa Công nghệ thông tin', 'TDU00123',
        'Nam', '15/08/1985', '', 'Tiến sĩ', 'Khoa học máy tính & HTTT',
        2018, '01/09/2019', 2007, '', '', 'Đã có', 'IELTS 6.5', 'Ứng dụng CNTT Nâng cao',
        'Cố vấn học tập K16 CNTT', 'Khoa Công nghệ thông tin'
      ],
      [
        2, 'Trần Thị Mai', 'Phó Trưởng Khoa', 'Khoa Dược - Điều dưỡng', 'TDU00245',
        'Nữ', '20/11/1980', 'Phó Giáo sư', 'Tiến sĩ', 'Dược lý & Dược lâm sàng',
        2014, '01/10/2015', 2002, 2021, '', 'Đã có', 'B2 Châu Âu', 'MOS Excel Expert',
        'Chủ tịch HĐ Khoa học Khoa', 'Khoa Dược - Điều dưỡng'
      ]
    ];

    const ws = createStyledWorksheet(
      'MẪU NHẬP DỮ LIỆU DANH SÁCH CÁN BỘ GIẢNG VIÊN VÀ HỒ SƠ HỢP ĐỒNG (20 CỘT CHUẨN TDU)',
      columns,
      sampleRows,
      undefined,
      {
        unitName: 'PHÒNG TỔ CHỨC - HÀNH CHÍNH',
        subTitle: 'Năm học 2026 - 2027 (Cột màu vàng là thông tin bắt buộc)',
        documentNo: 'BM-TDU-NS-01-IMPORT',
      }
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws, 'Mau_Import_Nhan_Su');
    saveWorkbookToFile(workbook, 'TDU_Mau_Import_Nhan_Su_20_Cot.xlsx');
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
  const handleConfirmImport = async () => {
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

    // Persist to MySQL backend if active
    try {
      await fetch('/api/users/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users: parsedImportUsers,
          overwrite: overwriteExisting,
        }),
      });
    } catch {
      // Backend offline fallback handled gracefully by setUsers & localStorage
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
                  Người dùng
                </h1>
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
              onClick={handleStartAddRow}
              className="h-[34px] px-4 rounded-xl bg-[#005325] hover:bg-[#00421e] text-white text-[12.5px] font-medium flex items-center gap-2 cursor-pointer shadow-2xs hover:shadow-xs transition-all"
              title="Thêm hàng người dùng mới trực tiếp vào bảng"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm hàng (từng người)</span>
            </button>
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
              setSelectedDegree('all');
              setSelectedGender('all');
            }}
            className="text-blue-600 hover:underline font-medium ml-auto"
          >
            Đặt lại lọc
          </button>
        )}
      </div>

      {/* 4. Full Data Table (20 Columns as in File + Checkbox column) */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          {/* Thanh tác vụ hàng loạt cho Checkbox đã chọn */}
          {selectedUserIds.length > 0 && (
            <div className="bg-blue-50/95 border-b border-blue-200 px-4 py-2 flex items-center justify-between gap-3 text-[12.5px] text-blue-900 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-blue-700">Đã chọn:</span>
                <span className="bg-blue-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {selectedUserIds.length} cán bộ
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDeleteBatch}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[12px] font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa {selectedUserIds.length} cán bộ đã chọn</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUserIds([])}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[12px] cursor-pointer"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto max-h-[calc(100vh-280px)]">
            <table className="w-full border-collapse text-left text-[12px] min-w-[2180px]">
              <thead className="bg-[#f1f5f9] text-slate-800 font-semibold sticky top-0 z-10 border-b border-slate-300">
                <tr className="h-[38px]">
                  <th className="px-2 text-center border-r border-slate-300 w-[42px] sticky left-0 bg-[#f1f5f9] z-20">
                    <input
                      type="checkbox"
                      checked={
                        paginatedUsers.length > 0 &&
                        paginatedUsers.every((u) => selectedUserIds.includes(u.id))
                      }
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                      title="Chọn tất cả trên trang này"
                    />
                  </th>
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
                {/* Hàng nhập liệu inline khi bấm "Thêm hàng (từng người)" */}
                {isAddingRow && (
                  <tr className="bg-amber-50/70 border-b-2 border-amber-300 text-[12px] animate-fadeIn">
                    <td className="px-2 text-center border-r border-amber-200 sticky left-0 bg-amber-50 z-10">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block animate-pulse" title="Đang nhập hàng mới" />
                    </td>
                    <td className="px-2.5 text-center border-r border-amber-200 font-bold text-amber-700">
                      Mới
                    </td>
                    {/* Họ tên */}
                    <td className="px-2 border-r border-amber-200">
                      <input
                        type="text"
                        autoFocus
                        required
                        placeholder="Họ và tên *"
                        value={newRowData.hoTen || ''}
                        onChange={(e) => setNewRowData({ ...newRowData, hoTen: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveNewRow();
                          if (e.key === 'Escape') setIsAddingRow(false);
                        }}
                        className="w-full px-2 py-1 bg-white border border-blue-400 rounded focus:ring-1 focus:ring-blue-500 text-[12px] font-semibold text-slate-800"
                      />
                    </td>
                    {/* Mã nhân sự */}
                    <td className="px-2 border-r border-amber-200">
                      <input
                        type="text"
                        placeholder="Mã NV..."
                        value={newRowData.maNhanSu || ''}
                        onChange={(e) => setNewRowData({ ...newRowData, maNhanSu: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveNewRow();
                          if (e.key === 'Escape') setIsAddingRow(false);
                        }}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 font-mono text-[12px]"
                      />
                    </td>
                    {/* Chức vụ */}
                    <td className="px-2 border-r border-amber-200">
                      <input
                        type="text"
                        placeholder="Chức vụ..."
                        value={newRowData.chucVu || ''}
                        onChange={(e) => setNewRowData({ ...newRowData, chucVu: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[12px]"
                      />
                    </td>
                    {/* Đơn vị */}
                    <td className="px-2 border-r border-amber-200">
                      <input
                        type="text"
                        placeholder="Khoa/Phòng..."
                        value={newRowData.donVi || ''}
                        onChange={(e) => setNewRowData({ ...newRowData, donVi: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[12px]"
                      />
                    </td>
                    {/* Giới tính */}
                    <td className="px-1.5 border-r border-amber-200 text-center">
                      <select
                        value={newRowData.gioiTinh || 'Nam'}
                        onChange={(e) => setNewRowData({ ...newRowData, gioiTinh: e.target.value as 'Nam' | 'Nữ' })}
                        className="w-full px-1 py-1 bg-white border border-slate-300 rounded text-[12px]"
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                      </select>
                    </td>
                    {/* Ngày sinh */}
                    <td className="px-2 border-r border-amber-200">
                      <input
                        type="text"
                        placeholder="DD/MM/YYYY"
                        value={newRowData.ngaySinh || ''}
                        onChange={(e) => setNewRowData({ ...newRowData, ngaySinh: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[12px]"
                      />
                    </td>
                    {/* Học hàm */}
                    <td className="px-1.5 border-r border-amber-200">
                      <select
                        value={newRowData.hocHam || ''}
                        onChange={(e) => setNewRowData({ ...newRowData, hocHam: e.target.value })}
                        className="w-full px-1 py-1 bg-white border border-slate-300 rounded text-[12px]"
                      >
                        <option value="">(Trống)</option>
                        <option value="Phó Giáo sư">PGS</option>
                        <option value="Giáo sư">GS</option>
                      </select>
                    </td>
                    {/* Học vị */}
                    <td className="px-2 border-r border-amber-200">
                      <input
                        type="text"
                        placeholder="Tiến sĩ, ThS..."
                        value={newRowData.hocVi || ''}
                        onChange={(e) => setNewRowData({ ...newRowData, hocVi: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[12px]"
                      />
                    </td>
                    {/* Chuyên môn */}
                    <td className="px-2 border-r border-amber-200">
                      <input
                        type="text"
                        placeholder="Chuyên môn..."
                        value={newRowData.chuyenMon || ''}
                        onChange={(e) => setNewRowData({ ...newRowData, chuyenMon: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[12px]"
                      />
                    </td>
                    {/* Năm TD */}
                    <td className="px-2 border-r border-amber-200 text-center">
                      <input
                        type="number"
                        placeholder="Năm"
                        value={newRowData.namTuyenDung || ''}
                        onChange={(e) => setNewRowData({ ...newRowData, namTuyenDung: e.target.value })}
                        className="w-full px-1 py-1 bg-white border border-slate-300 rounded text-[12px] text-center"
                      />
                    </td>
                    {/* Ký HĐLĐ */}
                    <td className="px-2 border-r border-amber-200 text-center">
                      <input
                        type="text"
                        placeholder="DD/MM/YYYY"
                        value={newRowData.ngayKyHDLD || ''}
                        onChange={(e) => setNewRowData({ ...newRowData, ngayKyHDLD: e.target.value })}
                        className="w-full px-1 py-1 bg-white border border-slate-300 rounded text-[12px] text-center"
                      />
                    </td>
                    {/* Năm TN */}
                    <td className="px-2 border-r border-amber-200 text-center">
                      <input
                        type="number"
                        placeholder="Năm"
                        value={newRowData.namTotNghiep || ''}
                        onChange={(e) => setNewRowData({ ...newRowData, namTotNghiep: e.target.value })}
                        className="w-full px-1 py-1 bg-white border border-slate-300 rounded text-[12px] text-center"
                      />
                    </td>
                    {/* Năm PGS */}
                    <td className="px-2 border-r border-amber-200 text-center">
                      <input
                        type="text"
                        placeholder="Năm"
                        value={newRowData.namCongNhanPGS || ''}
                        onChange={(e) => setNewRowData({ ...newRowData, namCongNhanPGS: e.target.value })}
                        className="w-full px-1 py-1 bg-white border border-slate-300 rounded text-[12px] text-center"
                      />
                    </td>
                    {/* Năm GS */}
                    <td className="px-2 border-r border-amber-200 text-center">
                      <input
                        type="text"
                        placeholder="Năm"
                        value={newRowData.namCongNhanGS || ''}
                        onChange={(e) => setNewRowData({ ...newRowData, namCongNhanGS: e.target.value })}
                        className="w-full px-1 py-1 bg-white border border-slate-300 rounded text-[12px] text-center"
                      />
                    </td>
                    {/* CCSP */}
                    <td className="px-2 border-r border-amber-200 text-center">
                      <input
                        type="text"
                        value={newRowData.ccsp || 'Đã có'}
                        onChange={(e) => setNewRowData({ ...newRowData, ccsp: e.target.value })}
                        className="w-full px-1 py-1 bg-white border border-slate-300 rounded text-[12px] text-center"
                      />
                    </td>
                    {/* Anh văn */}
                    <td className="px-2 border-r border-amber-200">
                      <input
                        type="text"
                        placeholder="Anh văn..."
                        value={newRowData.anhVan || ''}
                        onChange={(e) => setNewRowData({ ...newRowData, anhVan: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[12px]"
                      />
                    </td>
                    {/* Tin học */}
                    <td className="px-2 border-r border-amber-200">
                      <input
                        type="text"
                        placeholder="Tin học..."
                        value={newRowData.tinHoc || ''}
                        onChange={(e) => setNewRowData({ ...newRowData, tinHoc: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[12px]"
                      />
                    </td>
                    {/* Kiêm nhiệm */}
                    <td className="px-2 border-r border-amber-200">
                      <input
                        type="text"
                        placeholder="Kiêm nhiệm..."
                        value={newRowData.kiemNhiem || ''}
                        onChange={(e) => setNewRowData({ ...newRowData, kiemNhiem: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[12px]"
                      />
                    </td>
                    {/* Đơn vị kiêm nhiệm */}
                    <td className="px-2 border-r border-amber-200">
                      <input
                        type="text"
                        placeholder="Đơn vị..."
                        value={newRowData.donViKiemNhiem || ''}
                        onChange={(e) => setNewRowData({ ...newRowData, donViKiemNhiem: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[12px]"
                      />
                    </td>
                    {/* Thao tác */}
                    <td className="px-2 text-center whitespace-nowrap sticky right-0 bg-amber-50 shadow-xs">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleSaveNewRow}
                          className="h-7 px-2.5 rounded-lg bg-[#005325] hover:bg-[#00421e] text-white text-[11.5px] font-semibold flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
                          title="Lưu hàng này (Enter)"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Lưu</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingRow(false)}
                          className="h-7 px-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 text-[11.5px] flex items-center justify-center cursor-pointer transition-colors"
                          title="Hủy thêm hàng (Esc)"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={22} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center max-w-lg mx-auto px-4">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#005325] border border-emerald-200 flex items-center justify-center mb-3 shadow-2xs">
                          <FileSpreadsheet className="w-8 h-8" />
                        </div>
                        <h3 className="text-[16px] font-bold text-slate-800 mb-1">
                          Chưa có dữ liệu cán bộ, giảng viên
                        </h3>
                        <p className="text-[12.5px] text-slate-500 leading-relaxed mb-5 text-center">
                          Dữ liệu cũ đã được xóa sạch. Hãy tải lên file Excel (18 cột chuẩn Đại học Tây Đô) để nạp hồ sơ nhân sự tự động, hoặc bấm "+ Thêm hàng" để nhập trực tiếp từng người.
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
                            onClick={handleStartAddRow}
                            className="h-[36px] px-4 rounded-xl bg-[#005325] hover:bg-[#00421e] text-white text-[12.5px] font-medium flex items-center gap-2 cursor-pointer shadow-xs transition-all"
                          >
                            <Plus className="w-4 h-4" />
                            <span>+ Thêm hàng (từng người)</span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={22} className="py-12 text-center text-slate-500">
                      Không tìm thấy cán bộ, nhân sự nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user, idx) => {
                    const globalIdx = (safeCurrentPage - 1) * pageSize + idx + 1;
                    const isChecked = selectedUserIds.includes(user.id);
                    return (
                    <tr
                      key={user.id}
                      className={`h-[38px] transition-colors font-normal text-slate-600 ${
                        isChecked ? 'bg-blue-50/60' : 'hover:bg-blue-50/30'
                      }`}
                    >
                      {/* Checkbox */}
                      <td
                        className="px-2 text-center border-r border-slate-200 w-[42px] sticky left-0 bg-white z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectUser(user.id)}
                          className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* STT */}
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

      {/* 6. Modal: Import Users from Excel (Thiết kế chuẩn theo mẫu tham chiếu) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
          <div
            className={`bg-white rounded-[24px] shadow-2xl w-full flex flex-col overflow-hidden border border-slate-200 transition-all ${
              parsedImportUsers.length > 0 ? 'max-w-4xl max-h-[92vh]' : 'max-w-2xl'
            }`}
          >
            {/* Header theo thiết kế ảnh tham chiếu */}
            <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200/90 flex items-center justify-center text-slate-700 shadow-2xs shrink-0">
                  <UploadCloud className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-bold text-[17px] text-slate-900 leading-tight">
                      Import dữ liệu người dùng & hồ sơ nhân sự
                    </h3>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Hồ sơ chuẩn 18 cột
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-500 mt-1">
                    Kéo thả file ở trên và chọn chế độ import bên dưới để đối soát mã nhân sự
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseImportModal}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Đóng popup"
              >
                <X className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-[12.5px]">
              {/* 1. Header Chọn hoặc kéo thả tập tin */}
              <div className="flex items-center justify-between text-[12.5px]">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <UploadCloud className="w-4 h-4 text-slate-600" />
                  <span>1. Chọn hoặc kéo thả tập tin Excel (.xlsx, .xls)</span>
                  <span className="text-red-500 font-bold">*</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 font-semibold text-[11.5px] cursor-pointer"
                  title="Tải biểu mẫu Excel chuẩn 18 cột Đại học Tây Đô"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải file mẫu chuẩn</span>
                </button>
              </div>

              {/* Khung kéo thả: Viền nét đứt trung tính (Chuẩn theo hình) */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleProcessExcelFile(file);
                }}
                className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/40 p-6 sm:p-7 text-center hover:border-slate-400 hover:bg-slate-50/70 transition-all flex flex-col items-center justify-center"
              >
                <input
                  type="file"
                  id="excel-file-upload-input"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-600 mx-auto mb-2">
                  <UploadCloud className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div className="font-bold text-slate-800 text-[13.5px]">
                  Kéo thả file Excel vào đây hoặc bấm nút để chọn file
                </div>
                <div className="text-slate-400 text-[11px] mt-1 mb-3.5">
                  Định dạng hỗ trợ: XLS, XLSX — Tối đa 20MB
                </div>
                <label
                  htmlFor="excel-file-upload-input"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11.5px] shadow-2xs cursor-pointer transition-colors"
                >
                  Chọn file từ máy
                </label>
              </div>

              {/* Error Alert */}
              {importError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-2 text-[12px]">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Processing Loader */}
              {isProcessingFile && (
                <div className="py-6 flex flex-col items-center justify-center text-slate-500 gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  <span>Đang đọc và phân tích cấu trúc 18 cột file Excel...</span>
                </div>
              )}

              {/* Thông tin file và xem trước dữ liệu khi đã chọn */}
              {importFile && parsedImportUsers.length > 0 && !isProcessingFile && (
                <div className="space-y-3 mt-3 animate-fadeIn">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-blue-600 flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-[12.5px] truncate" title={importFile.name}>
                          {importFile.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {(importFile.size / 1024).toFixed(1)} KB · Đã đọc <strong>{parsedImportUsers.length}</strong> hồ sơ nhân sự
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-semibold text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Hợp lệ 18 cột
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setImportFile(null);
                          setParsedImportUsers([]);
                          setImportError(null);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
                        title="Gỡ bỏ file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
                      <tbody className="divide-y divide-slate-200 bg-white">
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

              {/* Chế độ import: Box bo góc viền chuẩn giống ảnh thiết kế */}
              <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11.5px] mt-3">
                <span className="text-slate-600 font-medium text-[12px]">Chế độ import:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setOverwriteExisting(true)}
                    className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer text-[12px] font-semibold ${
                      overwriteExisting
                        ? 'bg-[#0f172a] text-white shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200/60 border border-slate-200'
                    }`}
                  >
                    Tạo mới (Ghi đè)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverwriteExisting(false)}
                    className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer text-[12px] font-semibold ${
                      !overwriteExisting
                        ? 'bg-[#0f172a] text-white shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200/60 border border-slate-200'
                    }`}
                  >
                    Cập nhật bổ sung
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer giống thiết kế ảnh */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={handleCloseImportModal}
                className="h-[38px] px-5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium text-[12.5px] cursor-pointer shadow-2xs transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={parsedImportUsers.length === 0 || isProcessingFile}
                onClick={handleConfirmImport}
                className={`h-[38px] px-5 rounded-xl font-bold text-[12.5px] transition-all shadow-sm flex items-center gap-2 ${
                  parsedImportUsers.length > 0 && !isProcessingFile
                    ? 'bg-[#005325] hover:bg-[#00421e] text-white cursor-pointer active:scale-[0.99] border border-[#005325]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
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

          {/* Slide-over Panel from right - Độ rộng lớn hơn & bố cục rộng rãi dễ nhìn */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-16">
            <div className="w-screen max-w-[940px] bg-white shadow-2xl flex flex-col border-l border-slate-200">
              {/* Drawer Header - Giao diện trắng to & dễ nhìn */}
              <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-13 h-13 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-2xl shadow-xs">
                    {(drawerFormData.hoTen || drawerUser.hoTen).slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-bold text-[18px] leading-tight text-slate-800">
                        {drawerFormData.hoTen || drawerUser.hoTen}
                      </h3>
                      <span className="bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded text-[12px] font-mono font-semibold text-slate-700">
                        {drawerFormData.maNhanSu || drawerUser.maNhanSu}
                      </span>
                    </div>
                    <p className="text-[13px] text-slate-500 mt-1 font-normal">
                      {drawerFormData.chucVu || drawerUser.chucVu} • {drawerFormData.donVi || drawerUser.donVi}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCloseDrawer}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Form Body - Các box to hơn, bố cục chia lưới rộng rãi */}
              <form onSubmit={handleSaveDrawer} className="flex-1 overflow-y-auto p-8 space-y-6 text-[13px]">
                {/* Card 1: Thông tin cá nhân & Công tác */}
                <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="font-bold text-slate-800 text-[14px] flex items-center gap-2.5 pb-2.5 border-b border-slate-200/70">
                    <UserCheck className="w-4.5 h-4.5 text-slate-600" /> 1. Thông tin cá nhân & Công tác
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-600 font-semibold mb-1 text-[12.5px]">
                        Họ và tên <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={drawerFormData.hoTen || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, hoTen: e.target.value })}
                        className="w-full h-[38px] px-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-[13px]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-[12.5px]">
                        Mã nhân sự <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={drawerFormData.maNhanSu || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, maNhanSu: e.target.value })}
                        className="w-full h-[38px] px-3.5 bg-white border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-[13px]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-[12.5px]">Giới tính</label>
                      <select
                        value={drawerFormData.gioiTinh || 'Nam'}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, gioiTinh: e.target.value as 'Nam' | 'Nữ' })}
                        className="w-full h-[38px] px-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-[13px]"
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-[12.5px]">Ngày, tháng năm sinh</label>
                      <input
                        type="text"
                        placeholder="DD/MM/YYYY"
                        value={drawerFormData.ngaySinh || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, ngaySinh: e.target.value })}
                        className="w-full h-[38px] px-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-[13px]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-[12.5px]">Chức vụ</label>
                      <input
                        type="text"
                        value={drawerFormData.chucVu || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, chucVu: e.target.value })}
                        className="w-full h-[38px] px-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-[13px]"
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-slate-600 font-semibold mb-1 text-[12.5px]">Đơn vị (Khoa/Phòng/TT)</label>
                      <input
                        type="text"
                        value={drawerFormData.donVi || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, donVi: e.target.value })}
                        className="w-full h-[38px] px-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-[13px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Card 2: Học hàm, học vị & Chuyên môn */}
                <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="font-bold text-slate-800 text-[14px] flex items-center gap-2.5 pb-2.5 border-b border-slate-200/70">
                    <Award className="w-4.5 h-4.5 text-slate-600" /> 2. Trình độ học vấn & Chuyên môn
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-[12.5px]">Học hàm</label>
                      <select
                        value={drawerFormData.hocHam || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, hocHam: e.target.value })}
                        className="w-full h-[38px] px-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-[13px]"
                      >
                        <option value="">(Không có học hàm)</option>
                        <option value="Phó Giáo sư">Phó Giáo sư (PGS)</option>
                        <option value="Giáo sư">Giáo sư (GS)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-[12.5px]">Học vị</label>
                      <input
                        type="text"
                        placeholder="Tiến sĩ, Thạc sĩ, Cử nhân..."
                        value={drawerFormData.hocVi || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, hocVi: e.target.value })}
                        className="w-full h-[38px] px-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-[13px]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-[12.5px]">Chuyên môn đào tạo</label>
                      <input
                        type="text"
                        value={drawerFormData.chuyenMon || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, chuyenMon: e.target.value })}
                        className="w-full h-[38px] px-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-[13px]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-[12.5px]">Năm tốt nghiệp ĐH</label>
                      <input
                        type="number"
                        value={drawerFormData.namTotNghiep || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, namTotNghiep: e.target.value })}
                        className="w-full h-[38px] px-3.5 bg-white border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-[13px]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-[12.5px]">Năm công nhận PGS</label>
                      <input
                        type="text"
                        placeholder="Để trống nếu chưa có"
                        value={drawerFormData.namCongNhanPGS || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, namCongNhanPGS: e.target.value })}
                        className="w-full h-[38px] px-3.5 bg-white border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-[13px]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-[12.5px]">Năm công nhận Giáo sư</label>
                      <input
                        type="text"
                        placeholder="Để trống nếu chưa có"
                        value={drawerFormData.namCongNhanGS || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, namCongNhanGS: e.target.value })}
                        className="w-full h-[38px] px-3.5 bg-white border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-[13px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Card 3: Hợp đồng & Tiêu chuẩn */}
                <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="font-bold text-slate-800 text-[14px] flex items-center gap-2.5 pb-2.5 border-b border-slate-200/70">
                    <BookOpen className="w-4.5 h-4.5 text-slate-600" /> 3. Hợp đồng & Tiêu chuẩn chức danh
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-[12.5px]">Năm tuyển dụng</label>
                      <input
                        type="number"
                        value={drawerFormData.namTuyenDung || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, namTuyenDung: e.target.value })}
                        className="w-full h-[38px] px-3.5 bg-white border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-[13px]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-[12.5px]">Ngày ký HĐLĐ chính thức</label>
                      <input
                        type="text"
                        placeholder="DD/MM/YYYY"
                        value={drawerFormData.ngayKyHDLD || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, ngayKyHDLD: e.target.value })}
                        className="w-full h-[38px] px-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-[13px]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-[12.5px]">Chứng chỉ sư phạm (CCSP)</label>
                      <input
                        type="text"
                        value={drawerFormData.ccsp || 'Đã có'}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, ccsp: e.target.value })}
                        className="w-full h-[38px] px-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-[13px]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-[12.5px]">Anh văn / Ngoại ngữ</label>
                      <input
                        type="text"
                        placeholder="B2, IELTS, TOEIC..."
                        value={drawerFormData.anhVan || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, anhVan: e.target.value })}
                        className="w-full h-[38px] px-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-[13px]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-600 font-semibold mb-1 text-[12.5px]">Tin học</label>
                      <input
                        type="text"
                        placeholder="Ứng dụng CNTT Nâng cao, MOS..."
                        value={drawerFormData.tinHoc || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, tinHoc: e.target.value })}
                        className="w-full h-[38px] px-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-[13px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Card 4: Nhiệm vụ kiêm nhiệm */}
                <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="font-bold text-slate-800 text-[14px] flex items-center gap-2.5 pb-2.5 border-b border-slate-200/70">
                    <Briefcase className="w-4.5 h-4.5 text-slate-600" /> 4. Nhiệm vụ kiêm nhiệm
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-[12.5px]">Nhiệm vụ kiêm nhiệm</label>
                      <input
                        type="text"
                        placeholder="Trưởng BM, Cố vấn học tập, Thư ký..."
                        value={drawerFormData.kiemNhiem || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, kiemNhiem: e.target.value })}
                        className="w-full h-[38px] px-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-[13px]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-[12.5px]">Đơn vị kiêm nhiệm</label>
                      <input
                        type="text"
                        placeholder="Khoa Công nghệ thông tin..."
                        value={drawerFormData.donViKiemNhiem || ''}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, donViKiemNhiem: e.target.value })}
                        className="w-full h-[38px] px-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-[13px]"
                      />
                    </div>
                  </div>
                </div>
              </form>

              {/* Drawer Footer */}
              <div className="bg-white border-t border-slate-200 px-8 py-4.5 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ cán bộ "${drawerUser.hoTen}" không?`)) {
                      handleDeleteUser(drawerUser.id);
                      handleCloseDrawer();
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[13px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa hồ sơ</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCloseDrawer}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-[13px] font-medium cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveDrawer()}
                    className="px-6 py-2.5 rounded-xl bg-[#005325] hover:bg-[#00421e] text-white text-[13px] font-medium flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
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
