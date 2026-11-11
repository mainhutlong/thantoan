import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PeriodStatus, UserRole, DepartmentUnit, UserAccount } from '../types';
import tduLogo from '../assets/images/logo_tdu.jpg';
import {
  IconTrangChu,
  IconVanBan,
  IconDeXuat,
  IconTuyenDung,
  IconHoSo,
  IconGiangDay,
  IconCoiThi,
  IconNghienCuuKH,
  IconInThe,
  IconNgoaiGio,
  IconDanhMuc,
  IconHeThong,
  IconThanhToanGroup,
  IconTraCuuGroup,
  IconBaoCaoGroup,
  IconNguoiDung,
  IconPhanQuyen,
  IconCauHinh,
  IconNhatKy,
} from './Sidebar3DIcons';

interface SidebarProps {
  isOpen: boolean;
  activeItem: string;
  onSelectItem: (itemKey: string, department?: DepartmentUnit) => void;
  pendingFeedbackCount: number;
  periodStatus: PeriodStatus;
  currentRole: UserRole;
  selectedDepartment: DepartmentUnit;
  onToggleSidebar?: () => void;
  currentAccount?: UserAccount;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  activeItem,
  onSelectItem,
  pendingFeedbackCount,
  selectedDepartment,
  onToggleSidebar,
}) => {
  if (!isOpen) {
    return null;
  }

  // Accordion state: All 5 groups can be expanded or collapsed
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    danh_muc_thong_ke: true,
    thanh_toan: true,
    tra_cuu: true,
    bao_cao: true,
    he_thong: true,
  });

  const toggleSection = (key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Helper to determine active state
  const isItemActive = (key: string, dept?: DepartmentUnit) => {
    if (key === 'ke_khai_upload') {
      return activeItem === 'ke_khai_upload' && selectedDepartment === dept;
    }
    return activeItem === key;
  };

  // Check group active state
  const isDanhMucActive = activeItem === 'ke_khai_upload';
  const isThanhToanActive = activeItem === 'tong_thanh_toan' || activeItem === 'chi_tra_tai_chinh';
  const isTraCuuActive = activeItem === 'tra_cuu_giang_vien' || activeItem === 'quan_ly_phan_hoi';
  const isBaoCaoActive = activeItem === 'nhap_lieu_phu_luc' || activeItem === 'bien_ban_so_hoa';
  const isHeThongActive =
    activeItem === 'he_thong_nguoi_dung' ||
    activeItem === 'he_thong_phan_quyen' ||
    activeItem === 'he_thong_cau_hinh' ||
    activeItem === 'he_thong_nhat_ky' ||
    activeItem === 'quan_ly_tai_khoan';

  return (
    <aside className="w-[265px] shrink-0 bg-white border-r border-[#e5e7eb] flex flex-col select-none text-[13px] transition-all shadow-xs z-20 font-sans h-full">
      {/* 1. TOP HEADER: Back Arrow, TDU Official Logo */}
      <div className="pt-3 pb-3 px-3 border-b border-slate-100 flex flex-col items-center relative bg-white shrink-0">
        <button
          onClick={onToggleSidebar}
          className="absolute left-2.5 top-2.5 p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
          title="Thu gọn thanh tác vụ"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 stroke-[2.2]" />
        </button>

        {/* Official TDU Logo */}
        <div className="flex items-center justify-center py-1 px-4">
          <img
            src={tduLogo}
            alt="Trường Đại học Tây Đô - Tay Do University"
            className="h-16 w-auto object-contain drop-shadow-xs"
          />
        </div>
      </div>

      {/* 2. NAVIGATION MENU: 5 GROUP ACCORDIONS */}
      <nav className="py-2.5 flex-1 overflow-y-auto space-y-1.5 px-2.5">
        {/* GROUP 1: DANH MỤC THỐNG KÊ */}
        <div>
          <button
            onClick={() => {
              toggleSection('danh_muc_thong_ke');
              if (!isDanhMucActive) {
                onSelectItem('ke_khai_upload', selectedDepartment || 'dao_tao');
              }
            }}
            className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
              isDanhMucActive
                ? 'border-2 border-[#1a73e8] bg-[#e8f0fe] text-[#1a73e8] font-medium shadow-2xs'
                : 'border-2 border-transparent text-[#1e293b] hover:bg-slate-50 font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <IconDanhMuc size={20} className="shrink-0" />
              <span className="truncate">Danh mục thống kê</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {expandedSections.danh_muc_thong_ke ? (
                <ChevronUp className="w-4 h-4 text-slate-600 shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
              )}
            </div>
          </button>

          {/* Child Items */}
          {expandedSections.danh_muc_thong_ke && (
            <div className="mt-1 pl-3.5 pr-1 py-1 space-y-1 border-l-2 border-[#d2e3fc] ml-4 animate-fadeIn">
              {/* 1. Thanh toán giờ giảng */}
              <button
                onClick={() => onSelectItem('ke_khai_upload', 'dao_tao')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer text-[12.5px] ${
                  isItemActive('ke_khai_upload', 'dao_tao')
                    ? 'bg-[#1a73e8] text-white font-medium shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-[#1a73e8]'
                }`}
              >
                <IconGiangDay size={18} className="shrink-0" />
                <span className="truncate">Thanh toán giờ giảng</span>
              </button>

              {/* 2. Coi thi chấm thi ra đề */}
              <button
                onClick={() => onSelectItem('ke_khai_upload', 'khao_thi')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer text-[12.5px] ${
                  isItemActive('ke_khai_upload', 'khao_thi')
                    ? 'bg-[#1a73e8] text-white font-medium shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-[#1a73e8]'
                }`}
              >
                <IconCoiThi size={18} className="shrink-0" />
                <span className="truncate">Coi thi chấm thi ra đề</span>
              </button>

              {/* 3. Công tác tuyển sinh */}
              <button
                onClick={() => onSelectItem('ke_khai_upload', 'tuyen_sinh')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer text-[12.5px] ${
                  isItemActive('ke_khai_upload', 'tuyen_sinh')
                    ? 'bg-[#1a73e8] text-white font-medium shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-[#1a73e8]'
                }`}
              >
                <IconTuyenDung size={18} className="shrink-0" />
                <span className="truncate">Công tác tuyển sinh</span>
              </button>

              {/* 4. Nghiên cứu Khoa học */}
              <button
                onClick={() => onSelectItem('ke_khai_upload', 'nckh')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer text-[12.5px] ${
                  isItemActive('ke_khai_upload', 'nckh')
                    ? 'bg-[#1a73e8] text-white font-medium shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-[#1a73e8]'
                }`}
              >
                <IconNghienCuuKH size={18} className="shrink-0" />
                <span className="truncate">Nghiên cứu Khoa học</span>
              </button>

              {/* 5. Cố vấn học tập */}
              <button
                onClick={() => onSelectItem('ke_khai_upload', 'co_van_hoc_tap')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer text-[12.5px] ${
                  isItemActive('ke_khai_upload', 'co_van_hoc_tap')
                    ? 'bg-[#1a73e8] text-white font-medium shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-[#1a73e8]'
                }`}
              >
                <IconHoSo size={18} className="shrink-0" />
                <span className="truncate">Cố vấn học tập</span>
              </button>

              {/* 6. Công tác khác */}
              <button
                onClick={() => onSelectItem('ke_khai_upload', 'cong_tac_khac')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer text-[12.5px] ${
                  isItemActive('ke_khai_upload', 'cong_tac_khac')
                    ? 'bg-[#1a73e8] text-white font-medium shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-[#1a73e8]'
                }`}
              >
                <IconNgoaiGio size={18} className="shrink-0" />
                <span className="truncate">Công tác khác</span>
              </button>
            </div>
          )}
        </div>

        {/* GROUP 2: THANH TOÁN (CHỨA: QUẢN LÝ THANH TOÁN & CHI TRẢ TÀI CHÍNH) */}
        <div>
          <button
            onClick={() => {
              toggleSection('thanh_toan');
              if (!isThanhToanActive) {
                onSelectItem('tong_thanh_toan');
              }
            }}
            className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
              isThanhToanActive
                ? 'border-2 border-[#10b981] bg-emerald-50 text-emerald-800 font-medium shadow-2xs'
                : 'border-2 border-transparent text-[#1e293b] hover:bg-slate-50 font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <IconThanhToanGroup size={20} className="shrink-0" />
              <span className="truncate">Thanh toán</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {expandedSections.thanh_toan ? (
                <ChevronUp className="w-4 h-4 text-slate-600 shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
              )}
            </div>
          </button>

          {/* Child Items */}
          {expandedSections.thanh_toan && (
            <div className="mt-1 pl-3.5 pr-1 py-1 space-y-1 border-l-2 border-emerald-200 ml-4 animate-fadeIn">
              {/* 1. Quản lý thanh toán */}
              <button
                onClick={() => onSelectItem('tong_thanh_toan')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-all cursor-pointer text-[12.5px] ${
                  isItemActive('tong_thanh_toan')
                    ? 'bg-[#10b981] text-white font-medium shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-emerald-700'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <IconInThe size={18} className="shrink-0" />
                  <span className="truncate">Quản lý thanh toán</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                  isItemActive('tong_thanh_toan') ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Tổng hợp
                </span>
              </button>

              {/* 2. Chi trả tài chính */}
              <button
                onClick={() => onSelectItem('chi_tra_tai_chinh')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer text-[12.5px] ${
                  isItemActive('chi_tra_tai_chinh')
                    ? 'bg-[#10b981] text-white font-medium shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-emerald-700'
                }`}
              >
                <IconInThe size={18} className="shrink-0" />
                <span className="truncate">Chi trả tài chính</span>
              </button>
            </div>
          )}
        </div>

        {/* GROUP 3: TRA CỨU VÀ PHẢN HỒI (CHỨA: GIẢNG VIÊN TRA CỨU & XÁC NHẬN, PHẢN HỒI CỦA GIẢNG VIÊN) */}
        <div>
          <button
            onClick={() => {
              toggleSection('tra_cuu');
              if (!isTraCuuActive) {
                onSelectItem('tra_cuu_giang_vien');
              }
            }}
            className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
              isTraCuuActive
                ? 'border-2 border-[#0284c7] bg-sky-50 text-sky-800 font-medium shadow-2xs'
                : 'border-2 border-transparent text-[#1e293b] hover:bg-slate-50 font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <IconTraCuuGroup size={20} className="shrink-0" />
              <span className="truncate">Tra cứu và phản hồi</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {pendingFeedbackCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-red-500 text-white">
                  {pendingFeedbackCount}
                </span>
              )}
              {expandedSections.tra_cuu ? (
                <ChevronUp className="w-4 h-4 text-slate-600 shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
              )}
            </div>
          </button>

          {/* Child Items */}
          {expandedSections.tra_cuu && (
            <div className="mt-1 pl-3.5 pr-1 py-1 space-y-1 border-l-2 border-sky-200 ml-4 animate-fadeIn">
              {/* 1. Giảng viên tra cứu và xác nhận */}
              <button
                onClick={() => onSelectItem('tra_cuu_giang_vien')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-all cursor-pointer text-[12.5px] ${
                  isItemActive('tra_cuu_giang_vien')
                    ? 'bg-[#0284c7] text-white font-medium shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-sky-700'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <IconHoSo size={18} className="shrink-0" />
                  <span className="truncate">Giảng viên tra cứu & xác nhận</span>
                </div>
                <span
                  className="w-2 h-2 rounded-full bg-blue-500 shrink-0 ring-2 ring-blue-100"
                  title="Có hồ sơ mới"
                />
              </button>

              {/* 2. Phản hồi của Giảng viên */}
              <button
                onClick={() => onSelectItem('quan_ly_phan_hoi')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-all cursor-pointer text-[12.5px] ${
                  isItemActive('quan_ly_phan_hoi')
                    ? 'bg-[#0284c7] text-white font-medium shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-sky-700'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <IconDeXuat size={18} className="shrink-0" />
                  <span className="truncate">Phản hồi của Giảng viên</span>
                </div>
                {pendingFeedbackCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10.5px] font-semibold bg-red-500 text-white shrink-0">
                    {pendingFeedbackCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* GROUP 4: BÁO CÁO (CHỨA: BÁO CÁO THỐNG KÊ TỔNG HỢP & BIÊN BẢN NGHIỆM THU SỐ HÓA) */}
        <div>
          <button
            onClick={() => {
              toggleSection('bao_cao');
              if (!isBaoCaoActive) {
                onSelectItem('nhap_lieu_phu_luc');
              }
            }}
            className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
              isBaoCaoActive
                ? 'border-2 border-[#7e22ce] bg-purple-50 text-purple-900 font-medium shadow-2xs'
                : 'border-2 border-transparent text-[#1e293b] hover:bg-slate-50 font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <IconBaoCaoGroup size={20} className="shrink-0" />
              <span className="truncate">Báo cáo</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {expandedSections.bao_cao ? (
                <ChevronUp className="w-4 h-4 text-slate-600 shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
              )}
            </div>
          </button>

          {/* Child Items */}
          {expandedSections.bao_cao && (
            <div className="mt-1 pl-3.5 pr-1 py-1 space-y-1 border-l-2 border-purple-200 ml-4 animate-fadeIn">
              {/* 1. Báo cáo thống kê tổng hợp */}
              <button
                onClick={() => onSelectItem('nhap_lieu_phu_luc')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer text-[12.5px] ${
                  isItemActive('nhap_lieu_phu_luc')
                    ? 'bg-[#7e22ce] text-white font-medium shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-purple-800'
                }`}
              >
                <IconTrangChu size={18} className="shrink-0" />
                <span className="truncate">Báo cáo thống kê tổng hợp</span>
              </button>

              {/* 2. Biên bản nghiệm thu số hóa */}
              <button
                onClick={() => onSelectItem('bien_ban_so_hoa')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer text-[12.5px] ${
                  isItemActive('bien_ban_so_hoa')
                    ? 'bg-[#7e22ce] text-white font-medium shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-purple-800'
                }`}
              >
                <IconVanBan size={18} className="shrink-0" />
                <span className="truncate">Biên bản nghiệm thu số hóa</span>
              </button>
            </div>
          )}
        </div>

        {/* GROUP 5: HỆ THỐNG (CHỨA: NGƯỜI DÙNG, VAI TRÒ PHÂN QUYỀN GROUP, CẤU HÌNH, NHẬT KÝ) */}
        <div>
          <button
            onClick={() => {
              toggleSection('he_thong');
              if (!isHeThongActive) {
                onSelectItem('he_thong_nguoi_dung');
              }
            }}
            className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
              isHeThongActive
                ? 'border-2 border-[#1e293b] bg-slate-100 text-slate-900 font-medium shadow-2xs'
                : 'border-2 border-transparent text-[#1e293b] hover:bg-slate-50 font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <IconHeThong size={20} className="shrink-0" />
              <span className="truncate">Hệ thống</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {expandedSections.he_thong ? (
                <ChevronUp className="w-4 h-4 text-slate-600 shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
              )}
            </div>
          </button>

          {/* Child Items */}
          {expandedSections.he_thong && (
            <div className="mt-1 pl-3.5 pr-1 py-1 space-y-1 border-l-2 border-slate-300 ml-4 animate-fadeIn">
              {/* 1. Người dùng (Quản lý các thông tin trên file) */}
              <button
                onClick={() => onSelectItem('he_thong_nguoi_dung')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer text-[12.5px] ${
                  isItemActive('he_thong_nguoi_dung')
                    ? 'bg-[#1e293b] text-white font-medium shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <IconNguoiDung size={17} className="shrink-0" />
                <span className="truncate">Người dùng</span>
              </button>

              {/* 2. Vai trò phân quyền theo group */}
              <button
                onClick={() => onSelectItem('he_thong_phan_quyen')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer text-[12.5px] ${
                  isItemActive('he_thong_phan_quyen')
                    ? 'bg-[#1e293b] text-white font-medium shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <IconPhanQuyen size={17} className="shrink-0" />
                <span className="truncate">Vai trò phân quyền theo group</span>
              </button>

              {/* 3. Cấu hình hệ thống */}
              <button
                onClick={() => onSelectItem('he_thong_cau_hinh')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer text-[12.5px] ${
                  isItemActive('he_thong_cau_hinh')
                    ? 'bg-[#1e293b] text-white font-medium shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <IconCauHinh size={17} className="shrink-0" />
                <span className="truncate">Cấu hình hệ thống</span>
              </button>

              {/* 4. Nhật ký hệ thống */}
              <button
                onClick={() => onSelectItem('he_thong_nhat_ky')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer text-[12.5px] ${
                  isItemActive('he_thong_nhat_ky')
                    ? 'bg-[#1e293b] text-white font-medium shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <IconNhatKy size={17} className="shrink-0" />
                <span className="truncate">Nhật ký hệ thống</span>
              </button>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
};
