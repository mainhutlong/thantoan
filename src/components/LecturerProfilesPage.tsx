import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  FileText,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Building2,
  Award,
  CreditCard,
  Briefcase,
  X,
  FileCheck,
  Check
} from 'lucide-react';
import * as XLSX from 'xlsx';

export interface LecturerContract {
  id: string;
  maGV: string;
  hoTen: string;
  hocHamHocVi: string;
  khoaBoMon: string;
  chucVu: string;
  ngaySinh: string;
  soCCCD: string;
  loaiHopDong: 'co_huu' | 'thinh_giang' | 'khoan_vu_viec';
  soHopDong: string;
  ngayKy: string;
  thoiHan: string;
  dinhMucGioChuan: number; // Tiết/năm
  donGiaTiet: number; // VNĐ/tiết
  maSoThue: string;
  soTaiKhoan: string;
  nganHang: string;
  trangThai: 'dang_cong_tac' | 'tam_hoan' | 'het_han';
}

const INITIAL_LECTURERS: LecturerContract[] = [
  {
    id: 'lec-1',
    maGV: 'TDU00128',
    hoTen: 'Mai Như Long',
    hocHamHocVi: 'Tiến sĩ',
    khoaBoMon: 'Khoa Công nghệ thông tin',
    chucVu: 'Trưởng Bộ môn Hệ thống thông tin',
    ngaySinh: '18/09/1982',
    soCCCD: '092082001245',
    loaiHopDong: 'co_huu',
    soHopDong: '128/HĐLĐ-ĐHTĐ',
    ngayKy: '01/09/2022',
    thoiHan: 'Không xác định thời hạn',
    dinhMucGioChuan: 270,
    donGiaTiet: 180000,
    maSoThue: '8024567123',
    soTaiKhoan: '0111000245678',
    nganHang: 'Vietcombank CN Cần Thơ',
    trangThai: 'dang_cong_tac',
  },
  {
    id: 'lec-2',
    maGV: 'TDU00215',
    hoTen: 'Nguyễn Văn Hải',
    hocHamHocVi: 'Thạc sĩ',
    khoaBoMon: 'Khoa Công nghệ thông tin',
    chucVu: 'Giảng viên cơ hữu',
    ngaySinh: '12/10/1987',
    soCCCD: '092087003412',
    loaiHopDong: 'co_huu',
    soHopDong: '215/HĐLĐ-ĐHTĐ',
    ngayKy: '15/10/2021',
    thoiHan: '03 năm',
    dinhMucGioChuan: 280,
    donGiaTiet: 140000,
    maSoThue: '8039871234',
    soTaiKhoan: '7400205889123',
    nganHang: 'Agribank CN Cần Thơ',
    trangThai: 'dang_cong_tac',
  },
  {
    id: 'lec-3',
    maGV: 'TDU00089',
    hoTen: 'Trần Thanh Dũng',
    hocHamHocVi: 'Phó Giáo sư, Tiến sĩ',
    khoaBoMon: 'Khoa Dược - Điều dưỡng',
    chucVu: 'Phó Trưởng Khoa Dược',
    ngaySinh: '14/04/1975',
    soCCCD: '092075001923',
    loaiHopDong: 'co_huu',
    soHopDong: '089/HĐLĐ-ĐHTĐ',
    ngayKy: '01/01/2020',
    thoiHan: 'Không xác định thời hạn',
    dinhMucGioChuan: 240,
    donGiaTiet: 220000,
    maSoThue: '8012345678',
    soTaiKhoan: '0111000889234',
    nganHang: 'Vietcombank Cần Thơ',
    trangThai: 'dang_cong_tac',
  },
  {
    id: 'lec-4',
    maGV: 'TDU00342',
    hoTen: 'Lê Hoàng Nam',
    hocHamHocVi: 'Thạc sĩ',
    khoaBoMon: 'Khoa Kinh tế - Quản trị kinh doanh',
    chucVu: 'Giảng viên kiêm nhiệm tuyển sinh',
    ngaySinh: '05/03/1989',
    soCCCD: '092089005678',
    loaiHopDong: 'co_huu',
    soHopDong: '342/HĐLĐ-ĐHTĐ',
    ngayKy: '01/08/2022',
    thoiHan: '03 năm',
    dinhMucGioChuan: 280,
    donGiaTiet: 140000,
    maSoThue: '8045678901',
    soTaiKhoan: '7400205128963',
    nganHang: 'Agribank CN Cần Thơ',
    trangThai: 'dang_cong_tac',
  },
  {
    id: 'lec-5',
    maGV: 'TDU00512',
    hoTen: 'Đặng Thị Hồng Nhung',
    hocHamHocVi: 'Thạc sĩ',
    khoaBoMon: 'Khoa Ngoại ngữ',
    chucVu: 'Giảng viên Tiếng Anh chuyên ngành',
    ngaySinh: '15/07/1991',
    soCCCD: '092091007894',
    loaiHopDong: 'thinh_giang',
    soHopDong: '512/HĐTG-ĐHTĐ',
    ngayKy: '05/01/2024',
    thoiHan: 'Học kỳ 2 (2023 - 2024)',
    dinhMucGioChuan: 0,
    donGiaTiet: 140000,
    maSoThue: '8056781234',
    soTaiKhoan: '0071001238945',
    nganHang: 'Vietcombank CN Tây Đô',
    trangThai: 'dang_cong_tac',
  },
  {
    id: 'lec-6',
    maGV: 'TDU00408',
    hoTen: 'Phạm Minh Tuấn',
    hocHamHocVi: 'Tiến sĩ',
    khoaBoMon: 'Khoa Luật',
    chucVu: 'Giảng viên thỉnh giảng Luật Kinh tế',
    ngaySinh: '22/11/1980',
    soCCCD: '092080006712',
    loaiHopDong: 'thinh_giang',
    soHopDong: '408/HĐTG-ĐHTĐ',
    ngayKy: '10/01/2024',
    thoiHan: '01 năm',
    dinhMucGioChuan: 0,
    donGiaTiet: 180000,
    maSoThue: '8023456789',
    soTaiKhoan: '101865432109',
    nganHang: 'VietinBank Cần Thơ',
    trangThai: 'dang_cong_tac',
  },
];

export const LecturerProfilesPage: React.FC = () => {
  const [lecturers, setLecturers] = useState<LecturerContract[]>(INITIAL_LECTURERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [selectedContractType, setSelectedContractType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState<LecturerContract | null>(null);
  const [viewingContract, setViewingContract] = useState<LecturerContract | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<LecturerContract>>({
    loaiHopDong: 'co_huu',
    trangThai: 'dang_cong_tac',
    dinhMucGioChuan: 270,
    donGiaTiet: 140000,
  });

  const filteredLecturers = useMemo(() => {
    return lecturers.filter((l) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          l.hoTen.toLowerCase().includes(q) ||
          l.maGV.toLowerCase().includes(q) ||
          l.soHopDong.toLowerCase().includes(q) ||
          l.khoaBoMon.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (selectedFaculty !== 'all' && l.khoaBoMon !== selectedFaculty) return false;
      if (selectedContractType !== 'all' && l.loaiHopDong !== selectedContractType) return false;
      if (selectedStatus !== 'all' && l.trangThai !== selectedStatus) return false;
      return true;
    });
  }, [lecturers, searchTerm, selectedFaculty, selectedContractType, selectedStatus]);

  const handleOpenAdd = () => {
    setEditingLecturer(null);
    setFormData({
      maGV: `TDU00${Math.floor(100 + Math.random() * 900)}`,
      hoTen: '',
      hocHamHocVi: 'Thạc sĩ',
      khoaBoMon: 'Khoa Công nghệ thông tin',
      chucVu: 'Giảng viên',
      ngaySinh: '01/01/1990',
      soCCCD: '092090001234',
      loaiHopDong: 'co_huu',
      soHopDong: `${Math.floor(100 + Math.random() * 900)}/HĐLĐ-ĐHTĐ`,
      ngayKy: new Date().toLocaleDateString('vi-VN'),
      thoiHan: '03 năm',
      dinhMucGioChuan: 270,
      donGiaTiet: 140000,
      maSoThue: '80' + Math.floor(10000000 + Math.random() * 90000000),
      soTaiKhoan: '011100' + Math.floor(100000 + Math.random() * 900000),
      nganHang: 'Vietcombank Cần Thơ',
      trangThai: 'dang_cong_tac',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lec: LecturerContract) => {
    setEditingLecturer(lec);
    setFormData(lec);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hoTen || !formData.maGV) return;

    if (editingLecturer) {
      setLecturers((prev) =>
        prev.map((l) => (l.id === editingLecturer.id ? ({ ...l, ...formData } as LecturerContract) : l))
      );
    } else {
      const newLec: LecturerContract = {
        ...formData,
        id: `lec-${Date.now()}`,
      } as LecturerContract;
      setLecturers((prev) => [newLec, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hồ sơ giảng viên này?')) {
      setLecturers((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const handleExportExcel = () => {
    const rows = filteredLecturers.map((l, i) => ({
      'STT': i + 1,
      'Mã GV': l.maGV,
      'Họ và tên': l.hoTen,
      'Học vị': l.hocHamHocVi,
      'Khoa / Bộ môn': l.khoaBoMon,
      'Chức vụ': l.chucVu,
      'Loại HĐ': l.loaiHopDong === 'co_huu' ? 'Cơ hữu' : l.loaiHopDong === 'thinh_giang' ? 'Thỉnh giảng' : 'Khoán việc',
      'Số hợp đồng': l.soHopDong,
      'Ngày ký': l.ngayKy,
      'Thời hạn': l.thoiHan,
      'Định mức giờ (tiết/năm)': l.dinhMucGioChuan,
      'Đơn giá / tiết (VNĐ)': l.donGiaTiet,
      'Mã số thuế': l.maSoThue,
      'Số tài khoản': l.soTaiKhoan,
      'Ngân hàng': l.nganHang,
      'Trạng thái': l.trangThai === 'dang_cong_tac' ? 'Đang công tác' : l.trangThai === 'tam_hoan' ? 'Tạm hoãn' : 'Hết hạn',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh_Sach_Giang_Vien_Hop_Dong');
    XLSX.writeFile(wb, 'Ho_So_Giang_Vien_Va_Hop_Dong_TDU_2024.xlsx');
  };

  const facultyOptions = [
    'Khoa Công nghệ thông tin',
    'Khoa Dược - Điều dưỡng',
    'Khoa Kinh tế - Quản trị kinh doanh',
    'Khoa Luật',
    'Khoa Ngoại ngữ',
    'Khoa Sinh học ứng dụng',
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] text-slate-800 overflow-y-auto">
      {/* 1. Page Header Bar */}
      <div className="bg-white border-b border-slate-200 px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-emerald-50 text-[#005325]">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-[17px] font-bold text-slate-900 uppercase tracking-wide">
              HỒ SƠ GIẢNG VIÊN VÀ HỢP ĐỒNG GIẢNG DẠY
            </h1>
          </div>
          <p className="text-[12px] text-slate-500 mt-1">
            Quản lý cơ cấu cán bộ, giảng viên cơ hữu, giảng viên thỉnh giảng và định mức hợp đồng giảng dạy TDU
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="h-[34px] px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất Excel</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="h-[34px] px-3.5 bg-[#005325] hover:bg-[#00421e] text-white rounded text-[12px] font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm hồ sơ giảng viên</span>
          </button>
        </div>
      </div>

      {/* 2. Four Mini Metric Cards */}
      <div className="px-5 pt-4 pb-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Tổng số Giảng viên</div>
            <div className="text-[18px] font-bold text-slate-900 mt-0.5">{lecturers.length} người</div>
          </div>
          <div className="p-2 rounded bg-emerald-50 text-[#005325]">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Giảng viên Cơ hữu</div>
            <div className="text-[18px] font-bold text-[#005325] mt-0.5">
              {lecturers.filter((l) => l.loaiHopDong === 'co_huu').length} người
            </div>
          </div>
          <div className="p-2 rounded bg-emerald-50 text-[#005325]">
            <Building2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Giảng viên Thỉnh giảng</div>
            <div className="text-[18px] font-bold text-sky-700 mt-0.5">
              {lecturers.filter((l) => l.loaiHopDong === 'thinh_giang').length} người
            </div>
          </div>
          <div className="p-2 rounded bg-sky-50 text-sky-700">
            <Briefcase className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Hợp đồng Đang hiệu lực</div>
            <div className="text-[18px] font-bold text-emerald-700 mt-0.5">
              {lecturers.filter((l) => l.trangThai === 'dang_cong_tac').length} HĐ
            </div>
          </div>
          <div className="p-2 rounded bg-emerald-50 text-emerald-700">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3 bg-white border-y border-slate-200 my-2">
        <div className="flex items-center flex-wrap gap-2.5 flex-1">
          {/* Search box */}
          <div className="relative min-w-[240px] max-w-sm flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo họ tên, mã GV, số hợp đồng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[12px] border border-slate-300 rounded focus:outline-none focus:border-[#005325]"
            />
          </div>

          {/* Filter Khoa */}
          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1.5 text-[12px] bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả Khoa / Viện</option>
            {facultyOptions.map((fac) => (
              <option key={fac} value={fac}>
                {fac}
              </option>
            ))}
          </select>

          {/* Filter Loại hợp đồng */}
          <select
            value={selectedContractType}
            onChange={(e) => setSelectedContractType(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1.5 text-[12px] bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả loại hợp đồng</option>
            <option value="co_huu">Cơ hữu (Dài hạn)</option>
            <option value="thinh_giang">Thỉnh giảng</option>
            <option value="khoan_vu_viec">Khoán vụ việc</option>
          </select>

          {/* Filter Trạng thái */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1.5 text-[12px] bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="dang_cong_tac">Đang công tác</option>
            <option value="tam_hoan">Tạm hoãn</option>
            <option value="het_han">Hết hạn HĐ</option>
          </select>
        </div>

        <div className="text-[12px] text-slate-500">
          Hiển thị: <strong>{filteredLecturers.length}</strong> / {lecturers.length} giảng viên
        </div>
      </div>

      {/* 4. Main Data Table: Clean Single-line per Row */}
      <div className="px-5 pb-8 flex-1 overflow-x-auto">
        <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-[#f8fafc] text-[#334155] border-b border-[#cbd5e1] text-[12px] font-semibold h-[36px]">
                <th className="w-[42px] px-2 text-center border-r border-[#e2e8f0]">TT</th>
                <th className="w-[90px] px-2.5 border-r border-[#e2e8f0]">Mã GV</th>
                <th className="px-3 border-r border-[#e2e8f0] min-w-[180px]">Họ và tên Giảng viên</th>
                <th className="px-2.5 border-r border-[#e2e8f0] min-w-[150px]">Khoa / Đơn vị</th>
                <th className="px-2.5 border-r border-[#e2e8f0] w-[115px]">Loại hợp đồng</th>
                <th className="px-2.5 border-r border-[#e2e8f0] w-[130px]">Số hợp đồng</th>
                <th className="px-2 text-center border-r border-[#e2e8f0] w-[95px]">Ngày ký</th>
                <th className="px-2.5 text-center border-r border-[#e2e8f0] w-[110px]">Định mức (tiết)</th>
                <th className="px-2.5 text-right border-r border-[#e2e8f0] w-[115px]">Đơn giá giờ</th>
                <th className="px-2.5 text-center border-r border-[#e2e8f0] w-[110px]">Trạng thái</th>
                <th className="w-[95px] px-2 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[12px] text-slate-800">
              {filteredLecturers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-400">
                    Không tìm thấy giảng viên phù hợp với điều kiện lọc
                  </td>
                </tr>
              ) : (
                filteredLecturers.map((lec, idx) => (
                  <tr key={lec.id} className="h-[38px] hover:bg-[#f8fafc] transition-colors">
                    {/* TT */}
                    <td className="px-2 text-center font-mono text-slate-500 border-r border-[#f1f5f9] whitespace-nowrap">
                      {idx + 1}
                    </td>

                    {/* Mã GV */}
                    <td className="px-2.5 font-mono text-slate-800 font-semibold border-r border-[#f1f5f9] whitespace-nowrap">
                      {lec.maGV}
                    </td>

                    {/* Họ và tên (Arial) */}
                    <td className="px-3 font-semibold text-slate-800 border-r border-[#f1f5f9] whitespace-nowrap">
                      <span style={{ fontFamily: 'Arial' }}>{lec.hoTen}</span>
                      <span className="text-[10px] ml-1.5 text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                        {lec.hocHamHocVi}
                      </span>
                    </td>

                    {/* Khoa */}
                    <td className="px-2.5 text-slate-600 border-r border-[#f1f5f9] whitespace-nowrap truncate max-w-[160px]" title={lec.khoaBoMon}>
                      {lec.khoaBoMon}
                    </td>

                    {/* Loại hợp đồng */}
                    <td className="px-2.5 border-r border-[#f1f5f9] whitespace-nowrap">
                      {lec.loaiHopDong === 'co_huu' ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-[#005325] border border-emerald-200">
                          Cơ hữu
                        </span>
                      ) : lec.loaiHopDong === 'thinh_giang' ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
                          Thỉnh giảng
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          Khoán việc
                        </span>
                      )}
                    </td>

                    {/* Số HĐ */}
                    <td className="px-2.5 font-mono text-slate-700 border-r border-[#f1f5f9] whitespace-nowrap">
                      {lec.soHopDong}
                    </td>

                    {/* Ngày ký */}
                    <td className="px-2 text-center font-mono text-slate-600 border-r border-[#f1f5f9] whitespace-nowrap">
                      {lec.ngayKy}
                    </td>

                    {/* Định mức giờ */}
                    <td className="px-2.5 text-center font-mono font-medium text-slate-700 border-r border-[#f1f5f9] whitespace-nowrap">
                      {lec.dinhMucGioChuan > 0 ? `${lec.dinhMucGioChuan} tiết/năm` : 'Theo tiết dạy'}
                    </td>

                    {/* Đơn giá */}
                    <td className="px-2.5 text-right font-bold text-[#005325] font-mono tabular-nums border-r border-[#f1f5f9] whitespace-nowrap">
                      {lec.donGiaTiet.toLocaleString('vi-VN')} đ
                    </td>

                    {/* Trạng thái */}
                    <td className="px-2.5 text-center border-r border-[#f1f5f9] whitespace-nowrap">
                      {lec.trangThai === 'dang_cong_tac' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Đang công tác
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-medium border border-rose-200">
                          Tạm hoãn
                        </span>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td className="px-2 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewingContract(lec)}
                          title="Xem chi tiết hợp đồng"
                          className="p-1 text-[#005325] hover:bg-emerald-50 rounded cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(lec)}
                          title="Chỉnh sửa hồ sơ"
                          className="p-1 text-sky-700 hover:bg-sky-50 rounded cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(lec.id)}
                          title="Xóa hồ sơ"
                          className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
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

      {/* Modal: Thêm / Sửa hồ sơ Giảng viên */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-md shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-300 max-h-[90vh] flex flex-col">
            <div className="bg-[#005325] text-white px-4 py-3 flex items-center justify-between shrink-0">
              <h3 className="font-semibold text-[14px]">
                {editingLecturer ? 'Cập nhật hồ sơ giảng viên & hợp đồng' : 'Thêm mới hồ sơ giảng viên'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 overflow-y-auto space-y-3.5 text-[12.5px]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mã Giảng viên *</label>
                  <input
                    type="text"
                    required
                    value={formData.maGV || ''}
                    onChange={(e) => setFormData({ ...formData, maGV: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Họ và tên Giảng viên *</label>
                  <input
                    type="text"
                    required
                    value={formData.hoTen || ''}
                    onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Học hàm / Học vị</label>
                  <select
                    value={formData.hocHamHocVi || 'Thạc sĩ'}
                    onChange={(e) => setFormData({ ...formData, hocHamHocVi: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="Thạc sĩ">Thạc sĩ</option>
                    <option value="Tiến sĩ">Tiến sĩ</option>
                    <option value="Phó Giáo sư, Tiến sĩ">Phó Giáo sư, Tiến sĩ</option>
                    <option value="Giáo sư, Tiến sĩ">Giáo sư, Tiến sĩ</option>
                    <option value="Cử nhân / Kỹ sư">Cử nhân / Kỹ sư</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Khoa / Bộ môn quản lý</label>
                  <select
                    value={formData.khoaBoMon || facultyOptions[0]}
                    onChange={(e) => setFormData({ ...formData, khoaBoMon: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    {facultyOptions.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Loại hợp đồng</label>
                  <select
                    value={formData.loaiHopDong || 'co_huu'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        loaiHopDong: e.target.value as any,
                        dinhMucGioChuan: e.target.value === 'thinh_giang' ? 0 : 270,
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="co_huu">Cơ hữu (Dài hạn)</option>
                    <option value="thinh_giang">Thỉnh giảng</option>
                    <option value="khoan_vu_viec">Khoán vụ việc</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Số hợp đồng</label>
                  <input
                    type="text"
                    value={formData.soHopDong || ''}
                    onChange={(e) => setFormData({ ...formData, soHopDong: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Ngày ký</label>
                  <input
                    type="text"
                    value={formData.ngayKy || ''}
                    onChange={(e) => setFormData({ ...formData, ngayKy: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Định mức giờ chuẩn (tiết/năm)</label>
                  <input
                    type="number"
                    value={formData.dinhMucGioChuan ?? 270}
                    onChange={(e) => setFormData({ ...formData, dinhMucGioChuan: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Đơn giá hợp đồng (VNĐ/tiết)</label>
                  <input
                    type="number"
                    value={formData.donGiaTiet ?? 140000}
                    onChange={(e) => setFormData({ ...formData, donGiaTiet: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Số CCCD</label>
                  <input
                    type="text"
                    value={formData.soCCCD || ''}
                    onChange={(e) => setFormData({ ...formData, soCCCD: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mã số thuế</label>
                  <input
                    type="text"
                    value={formData.maSoThue || ''}
                    onChange={(e) => setFormData({ ...formData, maSoThue: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Số tài khoản ngân hàng</label>
                  <input
                    type="text"
                    value={formData.soTaiKhoan || ''}
                    onChange={(e) => setFormData({ ...formData, soTaiKhoan: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Ngân hàng chi trả</label>
                  <input
                    type="text"
                    value={formData.nganHang || ''}
                    onChange={(e) => setFormData({ ...formData, nganHang: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#005325] hover:bg-[#00421e] text-white rounded font-medium cursor-pointer"
                >
                  Lưu hồ sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Xem chi tiết Hợp đồng */}
      {viewingContract && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-md shadow-2xl w-full max-w-lg overflow-hidden border border-slate-300">
            <div className="bg-[#005325] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-[14px]">Hợp đồng giảng dạy: {viewingContract.soHopDong}</h3>
              <button onClick={() => setViewingContract(null)} className="text-white/80 hover:text-white p-1 rounded cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-[12.5px]">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Giảng viên:</span>
                <span className="font-bold text-slate-900">{viewingContract.hoTen} ({viewingContract.maGV})</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Học vị & Khoa:</span>
                <span className="font-medium text-slate-800">{viewingContract.hocHamHocVi} - {viewingContract.khoaBoMon}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Loại hợp đồng:</span>
                <span className="font-semibold text-[#005325]">
                  {viewingContract.loaiHopDong === 'co_huu' ? 'Hợp đồng lao động cơ hữu' : 'Hợp đồng thỉnh giảng'}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Thời hạn:</span>
                <span className="font-mono text-slate-800">{viewingContract.thoiHan} (Ký ngày: {viewingContract.ngayKy})</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Định mức giờ chuẩn:</span>
                <span className="font-bold font-mono text-slate-900">{viewingContract.dinhMucGioChuan} tiết QC/năm</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Đơn giá hợp đồng:</span>
                <span className="font-bold font-mono text-[#005325]">{viewingContract.donGiaTiet.toLocaleString('vi-VN')} đ/tiết</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Mã số thuế & CCCD:</span>
                <span className="font-mono text-slate-700">MST: {viewingContract.maSoThue} · CCCD: {viewingContract.soCCCD}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tài khoản thanh toán:</span>
                <span className="font-mono text-slate-800">{viewingContract.soTaiKhoan} ({viewingContract.nganHang})</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setViewingContract(null)}
                  className="px-4 py-1.5 bg-[#005325] hover:bg-[#00421e] text-white rounded text-[12px] font-medium cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
