import React, { useState, useMemo } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { SystemUserProfile } from '../types';

// Mock initial university personnel data matching the 20 columns
export const INITIAL_SYSTEM_USERS: SystemUserProfile[] = [
  {
    id: 'user-1',
    stt: 1,
    hoTen: 'TS. Mai Như Long',
    chucVu: 'Trưởng Bộ môn Hệ thống thông tin',
    donVi: 'Khoa Công nghệ thông tin',
    maNhanSu: 'TDU00128',
    gioiTinh: 'Nam',
    ngaySinh: '18/09/1982',
    hocHam: '',
    hocVi: 'Tiến sĩ',
    chuyenMon: 'Khoa học máy tính & HTTT',
    namTuyenDung: 2014,
    ngayKyHDLD: '01/09/2015',
    namTotNghiep: 2004,
    namCongNhanPGS: '',
    namCongNhanGS: '',
    ccsp: 'Đã có',
    anhVan: 'IELTS 6.5',
    tinHoc: 'Ứng dụng CNTT Nâng cao',
    kiemNhiem: 'Phụ trách Lab AI & IoT',
    donViKiemNhiem: 'Khoa Công nghệ thông tin',
    trangThai: 'hoat_dong',
  },
  {
    id: 'user-2',
    stt: 2,
    hoTen: 'PGS.TS. Trần Quốc Hùng',
    chucVu: 'Phó Trưởng Khoa',
    donVi: 'Khoa Dược - Điều dưỡng',
    maNhanSu: 'TDU00245',
    gioiTinh: 'Nam',
    ngaySinh: '14/05/1975',
    hocHam: 'Phó Giáo sư',
    hocVi: 'Tiến sĩ',
    chuyenMon: 'Dược lý & Dược lâm sàng',
    namTuyenDung: 2012,
    ngayKyHDLD: '01/08/2013',
    namTotNghiep: 1998,
    namCongNhanPGS: 2019,
    namCongNhanGS: '',
    ccsp: 'Đã có',
    anhVan: 'B2 Châu Âu',
    tinHoc: 'Ứng dụng CNTT Cơ bản',
    kiemNhiem: 'Chủ tịch HĐ Khoa học Khoa',
    donViKiemNhiem: 'Hội đồng Khoa học Khoa Dược',
    trangThai: 'hoat_dong',
  },
  {
    id: 'user-3',
    stt: 3,
    hoTen: 'ThS. Nguyễn Văn Hải',
    chucVu: 'Giảng viên cơ hữu',
    donVi: 'Khoa Công nghệ thông tin',
    maNhanSu: 'TDU00215',
    gioiTinh: 'Nam',
    ngaySinh: '12/10/1987',
    hocHam: '',
    hocVi: 'Thạc sĩ',
    chuyenMon: 'Kỹ thuật phần mềm',
    namTuyenDung: 2018,
    ngayKyHDLD: '15/10/2019',
    namTotNghiep: 2010,
    namCongNhanPGS: '',
    namCongNhanGS: '',
    ccsp: 'Đã có',
    anhVan: 'TOEIC 650',
    tinHoc: 'Ứng dụng CNTT Nâng cao',
    kiemNhiem: 'Cố vấn học tập K16 CNTT',
    donViKiemNhiem: 'Khoa Công nghệ thông tin',
    trangThai: 'hoat_dong',
  },
  {
    id: 'user-4',
    stt: 4,
    hoTen: 'ThS. Lê Thị Bích',
    chucVu: 'Phó Trưởng Bộ môn',
    donVi: 'Khoa Kinh tế - QTKD',
    maNhanSu: 'TDU00104',
    gioiTinh: 'Nữ',
    ngaySinh: '22/03/1989',
    hocHam: '',
    hocVi: 'Thạc sĩ',
    chuyenMon: 'Tài chính - Ngân hàng',
    namTuyenDung: 2016,
    ngayKyHDLD: '01/11/2017',
    namTotNghiep: 2011,
    namCongNhanPGS: '',
    namCongNhanGS: '',
    ccsp: 'Đã có',
    anhVan: 'B2',
    tinHoc: 'MOS Excel Expert',
    kiemNhiem: 'Thư ký khoa',
    donViKiemNhiem: 'Khoa Kinh tế - QTKD',
    trangThai: 'hoat_dong',
  },
  {
    id: 'user-5',
    stt: 5,
    hoTen: 'GS.TS. Phạm Hoàng Long',
    chucVu: 'Cố vấn Ban Giám hiệu',
    donVi: 'Ban Giám hiệu',
    maNhanSu: 'TDU00008',
    gioiTinh: 'Nam',
    ngaySinh: '05/01/1960',
    hocHam: 'Giáo sư',
    hocVi: 'Tiến sĩ',
    chuyenMon: 'Quản lý giáo dục & Kinh tế',
    namTuyenDung: 2010,
    ngayKyHDLD: '01/01/2011',
    namTotNghiep: 1983,
    namCongNhanPGS: 2005,
    namCongNhanGS: 2012,
    ccsp: 'Đã có',
    anhVan: 'C1 Cao cấp',
    tinHoc: 'Ứng dụng CNTT Cơ bản',
    kiemNhiem: 'Chủ tịch HĐ GS Cơ sở',
    donViKiemNhiem: 'Trường Đại học Tây Đô',
    trangThai: 'hoat_dong',
  },
  {
    id: 'user-6',
    stt: 6,
    hoTen: 'TS. Huỳnh Thanh Toàn',
    chucVu: 'Trưởng Khoa',
    donVi: 'Khoa Luật',
    maNhanSu: 'TDU00188',
    gioiTinh: 'Nam',
    ngaySinh: '30/11/1980',
    hocHam: '',
    hocVi: 'Tiến sĩ',
    chuyenMon: 'Luật Kinh tế & Thương mại quốc tế',
    namTuyenDung: 2015,
    ngayKyHDLD: '01/09/2016',
    namTotNghiep: 2002,
    namCongNhanPGS: '',
    namCongNhanGS: '',
    ccsp: 'Đã có',
    anhVan: 'IELTS 7.0',
    tinHoc: 'Ứng dụng CNTT Nâng cao',
    kiemNhiem: 'Ủy viên HĐ Trường',
    donViKiemNhiem: 'Hội đồng Trường',
    trangThai: 'hoat_dong',
  },
  {
    id: 'user-7',
    stt: 7,
    hoTen: 'ThS. Trần Thị Kim Cúc',
    chucVu: 'Giảng viên cơ hữu',
    donVi: 'Khoa Ngoại ngữ',
    maNhanSu: 'TDU00312',
    gioiTinh: 'Nữ',
    ngaySinh: '15/07/1992',
    hocHam: '',
    hocVi: 'Thạc sĩ',
    chuyenMon: 'Ngôn ngữ Anh ứng dụng',
    namTuyenDung: 2020,
    ngayKyHDLD: '01/10/2021',
    namTotNghiep: 2014,
    namCongNhanPGS: '',
    namCongNhanGS: '',
    ccsp: 'Đã có',
    anhVan: 'C2 / IELTS 8.0',
    tinHoc: 'Ứng dụng CNTT Cơ bản',
    kiemNhiem: 'Cố vấn CLB Tiếng Anh TDU',
    donViKiemNhiem: 'Đoàn Thanh niên TDU',
    trangThai: 'hoat_dong',
  },
  {
    id: 'user-8',
    stt: 8,
    hoTen: 'Bác sĩ CKII. Võ Minh Trí',
    chucVu: 'Phó Trưởng Bộ môn Điều dưỡng',
    donVi: 'Khoa Dược - Điều dưỡng',
    maNhanSu: 'TDU00267',
    gioiTinh: 'Nam',
    ngaySinh: '08/04/1978',
    hocHam: '',
    hocVi: 'Bác sĩ CKII',
    chuyenMon: 'Hồi sức cấp cứu & Nội khoa',
    namTuyenDung: 2017,
    ngayKyHDLD: '01/12/2018',
    namTotNghiep: 2002,
    namCongNhanPGS: '',
    namCongNhanGS: '',
    ccsp: 'Đã có',
    anhVan: 'B1',
    tinHoc: 'Ứng dụng CNTT Cơ bản',
    kiemNhiem: 'Phụ trách thực tập lâm sàng BV',
    donViKiemNhiem: 'Khoa Dược - Điều dưỡng',
    trangThai: 'hoat_dong',
  }
];

export const SystemUsersPage: React.FC = () => {
  const [users, setUsers] = useState<SystemUserProfile[]>(INITIAL_SYSTEM_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedDegree, setSelectedDegree] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUserProfile | null>(null);
  const [viewingUser, setViewingUser] = useState<SystemUserProfile | null>(null);

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
              onClick={handleExportExcel}
              className="h-[34px] px-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[12.5px] font-medium flex items-center gap-2 cursor-pointer shadow-2xs transition-all"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Xuất Excel</span>
            </button>
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
                {filteredUsers.length === 0 ? (
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
    </div>
  );
};
