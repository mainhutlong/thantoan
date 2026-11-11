import React, { useState, useEffect } from 'react';
import { X, Save, Calculator } from 'lucide-react';
import { TDUEmblem } from './TDUEmblem';
import { VbccRecord, TeachingRecord, AppMode, DataQuality, DepartmentUnit } from '../types';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveVbcc: (record: VbccRecord) => void;
  onSaveTeaching: (record: TeachingRecord) => void;
  editingRecord: VbccRecord | TeachingRecord | null;
  appMode: AppMode;
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  isOpen,
  onClose,
  onSaveVbcc,
  onSaveTeaching,
  editingRecord,
  appMode,
}) => {
  // Teaching form state
  const [hoTen, setHoTen] = useState('');
  const [ngaySinh, setNgaySinh] = useState('');
  const [soCCCD, setSoCCCD] = useState('');
  const [maGV, setMaGV] = useState('TDU' + Math.floor(1000 + Math.random() * 9000));
  const [hocHamHocVi, setHocHamHocVi] = useState('TS');
  const [khoaBoMon, setKhoaBoMon] = useState('Khoa Công nghệ thông tin');
  const [tenHocPhan, setTenHocPhan] = useState('');
  const [maLopHocPhan, setMaLopHocPhan] = useState('');
  const [soTinChi, setSoTinChi] = useState(3);
  const [soTietLT, setSoTietLT] = useState(30);
  const [soTietTH, setSoTietTH] = useState(30);
  const [heSoLop, setHeSoLop] = useState(1.3);
  const [donGiaTiet, setDonGiaTiet] = useState(180000);
  const [phongBanQuanLy, setPhongBanQuanLy] = useState<DepartmentUnit>('dao_tao');
  const [loaiHoatDong, setLoaiHoatDong] = useState<string>('Giảng dạy lý thuyết & thực hành');
  const [soTaiKhoan, setSoTaiKhoan] = useState('10287' + Math.floor(1000000 + Math.random() * 9000000));
  const [nganHang, setNganHang] = useState('VietinBank CN Cần Thơ');
  const [nguoiThucHien, setNguoiThucHien] = useState('Chuyên viên Đào tạo - TDU');
  const [trangThai, setTrangThai] = useState<DataQuality>('hop_le');
  const [dotThanhToan, setDotThanhToan] = useState('Đợt 1 - Học kỳ 2 (2023 - 2024)');

  // Dynamic calculations for teaching hours
  const tongTietQC = Number(((soTietLT * 1.0 + soTietTH * 0.7) * heSoLop).toFixed(2));
  const tongTienThuLao = Math.round(tongTietQC * donGiaTiet);
  const thueTNCN = Math.round(tongTienThuLao * 0.1);
  const thucNhan = tongTienThuLao - thueTNCN;

  useEffect(() => {
    if (editingRecord) {
      setHoTen(editingRecord.hoTen);
      setNgaySinh(editingRecord.ngaySinh);
      setSoCCCD(editingRecord.soCCCD);
      setNguoiThucHien(editingRecord.nguoiThucHien);
      setTrangThai(editingRecord.trangThai);

      if ('maGV' in editingRecord) {
        const tr = editingRecord as TeachingRecord;
        setMaGV(tr.maGV);
        setHocHamHocVi(tr.hocHamHocVi);
        setKhoaBoMon(tr.khoaBoMon);
        setPhongBanQuanLy(tr.phongBanQuanLy || 'dao_tao');
        setLoaiHoatDong(tr.loaiHoatDong || 'Giảng dạy lý thuyết & thực hành');
        setTenHocPhan(tr.tenHocPhan);
        setMaLopHocPhan(tr.maLopHocPhan);
        setSoTinChi(tr.soTinChi);
        setSoTietLT(tr.soTietLT);
        setSoTietTH(tr.soTietTH);
        setHeSoLop(tr.heSoLop);
        setDonGiaTiet(tr.donGiaTiet);
        setSoTaiKhoan(tr.soTaiKhoan || '');
        setNganHang(tr.nganHang || 'VietinBank CN Cần Thơ');
        setDotThanhToan(tr.dotThanhToan);
      }
    } else {
      // Defaults for new entry
      setHoTen('');
      setNgaySinh('18/08/1985');
      setSoCCCD('092' + Math.floor(100000000 + Math.random() * 900000000));
      setTenHocPhan('Lập trình Di động & Cloud Computing');
      setMaLopHocPhan('CNTT15A_TDU');
      setKhoaBoMon('Khoa Công nghệ thông tin');
      setPhongBanQuanLy('dao_tao');
      setLoaiHoatDong('Giảng dạy lý thuyết & thực hành');
    }
  }, [editingRecord, isOpen]);

  // Adjust standard rate based on academic title according to TDU policy
  const handleHocViChange = (val: string) => {
    setHocHamHocVi(val);
    switch (val) {
      case 'GS':
      case 'GS.TS':
        setDonGiaTiet(260000);
        break;
      case 'PGS':
      case 'PGS.TS':
        setDonGiaTiet(220000);
        break;
      case 'TS':
        setDonGiaTiet(180000);
        break;
      case 'ThS':
        setDonGiaTiet(140000);
        break;
      default:
        setDonGiaTiet(120000);
        break;
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hoTen.trim()) return;

    const record: TeachingRecord = {
      id: editingRecord ? editingRecord.id : 'tdu-tc-' + Date.now(),
      tt: editingRecord ? editingRecord.tt : 1,
      maGV,
      hoTen,
      ngaySinh,
      soCCCD,
      hocHamHocVi,
      khoaBoMon,
      phongBanQuanLy,
      loaiHoatDong,
      tenHocPhan,
      maLopHocPhan,
      soTinChi,
      soTietLT,
      soTietTH,
      heSoLop,
      tongTietQC,
      donGiaTiet,
      tongTienThuLao,
      thueTNCN,
      thucNhan,
      soTaiKhoan,
      nganHang,
      nguoiThucHien,
      trangThai,
      dotThanhToan,
    };
    onSaveTeaching(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-300">
        {/* Header #005325 */}
        <div className="bg-[#005325] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TDUEmblem size={20} />
            <h3 className="font-semibold text-[14px]">
              {editingRecord ? 'Cập nhật kê khai giờ giảng TDU' : 'Thêm mới kê khai giờ giảng dạy TDU'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-[12.5px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Họ và tên Giảng viên *
              </label>
              <input
                type="text"
                required
                value={hoTen}
                onChange={(e) => setHoTen(e.target.value)}
                placeholder="VD: TS. Mai Như Long"
                className="w-full h-8 px-2.5 border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#005325]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Ngày sinh (DD/MM/YYYY) *</label>
              <input
                type="text"
                required
                value={ngaySinh}
                onChange={(e) => setNgaySinh(e.target.value)}
                placeholder="VD: 18/09/1982"
                className="w-full h-8 px-2.5 border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#005325]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Số CCCD / Định danh cá nhân *</label>
              <input
                type="text"
                required
                value={soCCCD}
                onChange={(e) => setSoCCCD(e.target.value)}
                placeholder="VD: 092082001245"
                className="w-full h-8 px-2.5 border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#005325]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Trạng thái phê duyệt</label>
              <select
                value={trangThai}
                onChange={(e) => setTrangThai(e.target.value as DataQuality)}
                className="w-full h-8 px-2.5 border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#005325]"
              >
                <option value="hop_le">Hợp lệ (Đã kiểm tra)</option>
                <option value="da_so_hoa">Đã duyệt chi thanh toán</option>
                <option value="chua_day_du">Chưa đầy đủ / Cần bổ sung</option>
                <option value="trung_lap">Trùng lịch dạy</option>
                <option value="khong_hop_le">Không hợp lệ</option>
              </select>
            </div>
          </div>

          {/* Đơn vị quản lý hoạt động */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2 bg-emerald-50/50 border border-emerald-200 rounded">
            <div>
              <label className="block text-[#005325] font-semibold mb-1">
                Đơn vị phụ trách kê khai & quản lý *
              </label>
              <select
                value={phongBanQuanLy}
                onChange={(e) => setPhongBanQuanLy(e.target.value as DepartmentUnit)}
                className="w-full h-8 px-2.5 border border-slate-300 rounded text-slate-800 bg-white focus:outline-none focus:border-[#005325]"
              >
                <option value="dao_tao">Thanh toán giờ giảng (Phòng Đào tạo)</option>
                <option value="khao_thi">Coi thi chấm thi ra đề (TT Khảo thí)</option>
                <option value="tuyen_sinh">Công tác tuyển sinh (Phòng Tuyển sinh)</option>
                <option value="nckh">Nghiên cứu khoa học (Phòng NCKH & SĐH)</option>
                <option value="cong_tac_khac">Công tác khác (CVHT, Kiểm định, HĐ)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Loại hoạt động chi trả</label>
              <input
                type="text"
                value={loaiHoatDong}
                onChange={(e) => setLoaiHoatDong(e.target.value)}
                placeholder="VD: Giảng dạy, Coi thi, Chấm thi, Tư vấn..."
                className="w-full h-8 px-2.5 border border-slate-300 rounded text-slate-800 bg-white focus:outline-none focus:border-[#005325]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Mã Giảng viên TDU</label>
              <input
                type="text"
                value={maGV}
                onChange={(e) => setMaGV(e.target.value)}
                className="w-full h-8 px-2.5 border border-slate-300 rounded text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Học hàm / Học vị</label>
              <select
                value={hocHamHocVi}
                onChange={(e) => handleHocViChange(e.target.value)}
                className="w-full h-8 px-2.5 border border-slate-300 rounded text-slate-800 focus:border-[#005325]"
              >
                <option value="GS.TS">GS.TS (260.000 đ/tiết)</option>
                <option value="PGS.TS">PGS.TS (220.000 đ/tiết)</option>
                <option value="TS">Tiến sĩ - TS (180.000 đ/tiết)</option>
                <option value="ThS">Thạc sĩ - ThS (140.000 đ/tiết)</option>
                <option value="CN">Cử nhân / Kỹ sư (120.000 đ/tiết)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Khoa / Bộ môn TDU</label>
              <select
                value={khoaBoMon}
                onChange={(e) => setKhoaBoMon(e.target.value)}
                className="w-full h-8 px-2.5 border border-slate-300 rounded text-slate-800 focus:border-[#005325]"
              >
                <option value="Khoa Công nghệ thông tin">Khoa Công nghệ thông tin</option>
                <option value="Khoa Dược - Điều dưỡng">Khoa Dược - Điều dưỡng</option>
                <option value="Khoa Kinh tế - Quản trị kinh doanh">Khoa Kinh tế - Quản trị kinh doanh</option>
                <option value="Khoa Luật">Khoa Luật</option>
                <option value="Khoa Ngoại ngữ">Khoa Ngoại ngữ</option>
                <option value="Khoa Sinh học ứng dụng">Khoa Sinh học ứng dụng</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-medium mb-1">Tên học phần / Môn giảng dạy *</label>
              <input
                type="text"
                required
                value={tenHocPhan}
                onChange={(e) => setTenHocPhan(e.target.value)}
                placeholder="VD: Phát triển Hệ thống Thông tin Doanh nghiệp"
                className="w-full h-8 px-2.5 border border-slate-300 rounded text-slate-800 focus:border-[#005325]"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Mã lớp học phần</label>
              <input
                type="text"
                value={maLopHocPhan}
                onChange={(e) => setMaLopHocPhan(e.target.value)}
                placeholder="VD: CNTT14A_TDU"
                className="w-full h-8 px-2.5 border border-slate-300 rounded text-slate-800 font-mono focus:border-[#005325]"
              />
            </div>
          </div>

          {/* Hours & coefficients */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Số tín chỉ</label>
              <input
                type="number"
                min="1"
                max="10"
                value={soTinChi}
                onChange={(e) => setSoTinChi(Number(e.target.value))}
                className="w-full h-8 px-2 border border-slate-300 rounded text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Tiết Lý thuyết</label>
              <input
                type="number"
                min="0"
                value={soTietLT}
                onChange={(e) => setSoTietLT(Number(e.target.value))}
                className="w-full h-8 px-2 border border-slate-300 rounded text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Tiết Thực hành</label>
              <input
                type="number"
                min="0"
                value={soTietTH}
                onChange={(e) => setSoTietTH(Number(e.target.value))}
                className="w-full h-8 px-2 border border-slate-300 rounded text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Hệ số quy đổi lớp</label>
              <input
                type="number"
                step="0.05"
                min="1.0"
                max="2.5"
                value={heSoLop}
                onChange={(e) => setHeSoLop(Number(e.target.value))}
                className="w-full h-8 px-2 border border-slate-300 rounded text-slate-800"
              />
            </div>
          </div>

          {/* Bank Transfer info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Số tài khoản ngân hàng</label>
              <input
                type="text"
                value={soTaiKhoan}
                onChange={(e) => setSoTaiKhoan(e.target.value)}
                placeholder="VD: 102874639912"
                className="w-full h-8 px-2.5 border border-slate-300 rounded text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Ngân hàng & Chi nhánh</label>
              <input
                type="text"
                value={nganHang}
                onChange={(e) => setNganHang(e.target.value)}
                placeholder="VD: VietinBank CN Cần Thơ"
                className="w-full h-8 px-2.5 border border-slate-300 rounded text-slate-800"
              />
            </div>
          </div>

          {/* Live Payment Calculation Summary Card in TDU Green */}
          <div className="p-3 bg-emerald-50/80 border border-emerald-300 rounded text-[12px] space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-[#005325] border-b border-emerald-200 pb-1">
              <Calculator className="w-3.5 h-3.5 text-[#005325]" />
              <span>Bảng tính thù lao giảng dạy tự động - Đại học Tây Đô</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-slate-700">
              <div>
                <span className="text-slate-500 text-[11px] block">Tiết QC:</span>
                <span className="font-bold text-slate-900">{tongTietQC} tiết</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Tổng thù lao:</span>
                <span className="font-bold text-slate-900">{tongTienThuLao.toLocaleString('vi-VN')} đ</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Thuế TNCN (10%):</span>
                <span className="font-bold text-rose-600">-{thueTNCN.toLocaleString('vi-VN')} đ</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Thực nhận chuyển khoản:</span>
                <span className="font-bold text-[#005325] text-[13px]">{thucNhan.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded border border-slate-300 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#005325] hover:bg-[#00421e] text-white rounded font-medium flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editingRecord ? 'Cập nhật' : 'Lưu bản ghi TDU'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
