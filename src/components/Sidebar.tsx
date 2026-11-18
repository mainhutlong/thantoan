import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { PeriodStatus, UserRole, DepartmentUnit, UserAccount } from '../types';
import tduLogo from '../assets/images/logo_tdu.jpg';
import {
  IconTrangChu,
  IconDanhMuc,
  IconHeThong,
  IconThanhToanGroup,
  IconTraCuuGroup,
  IconBaoCaoGroup,
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
  nckhTab?: 'all' | 'bai_bao' | 'seminar' | 'de_tai';
  onSelectNckhTab?: (tab: 'all' | 'bai_bao' | 'seminar' | 'de_tai') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  activeItem,
  onSelectItem,
  pendingFeedbackCount,
  selectedDepartment,
  onToggleSidebar,
  currentAccount,
  nckhTab = 'all',
  onSelectNckhTab,
}) => {
  if (!isOpen) {
    return null;
  }

  // Quyền hạn phân quyền hiển thị menu theo yêu cầu hệ thống TDU:
  const email = (currentAccount?.email || '').toLowerCase().trim();
  const dept = (currentAccount?.departmentName || '').toLowerCase().trim();
  const chucVu = (currentAccount?.chucVu || currentAccount?.assignedModule || '').toLowerCase().trim();
  const roleType = (currentAccount?.role || '').toLowerCase();

  // 1. Quản trị hệ thống (Toàn quyền) - DUY NHẤT Mai Nhựt Long (mnlong@tdu.edu.vn)
  const isSuperAdmin =
    email === 'mnlong@tdu.edu.vn' ||
    email.includes('mainhutlong');

  // 2. Phòng Quản lý Đào tạo: Thấy Thanh toán giờ giảng (toàn quyền) & Phản hồi của giảng viên
  const isDaoTao =
    !isSuperAdmin &&
    (dept.includes('đào tạo') || dept.includes('dao tao'));

  // 3. Phòng Quản lý khoa học và Hợp tác quốc tế: Thấy Nghiên cứu khoa học (toàn quyền) & Phản hồi của giảng viên
  const isQLKH =
    !isSuperAdmin &&
    (dept.includes('khoa học') || dept.includes('qlkh') || dept.includes('hợp tác quốc tế'));

  // 4. Phòng Tài chính - Kế hoạch: Xem được toàn bộ ngoại trừ (menu hệ thống)
  const isTaiChinh =
    !isSuperAdmin &&
    (dept.includes('tài chính') || dept.includes('kế hoạch') || dept.includes('tai chinh'));

  // 5. Cán bộ có chức vụ Giảng viên: Thấy menu tra cứu và phản hồi (toàn quyền) xem cái của mình
  // lvlinh, cán bộ có chức vụ Giảng viên, giảng viên các khoa hoặc role lecturer
  const isGiangVien =
    !isSuperAdmin &&
    !isDaoTao &&
    !isQLKH &&
    !isTaiChinh &&
    (email.includes('lvlinh') ||
      chucVu.includes('giảng viên') ||
      chucVu.includes('giang vien') ||
      chucVu.includes('gv') ||
      dept.toLowerCase().startsWith('khoa') ||
      roleType === 'lecturer');

  // Điều kiện hiển thị từng phân hệ:
  const canViewDanhMucGroup = isSuperAdmin || isTaiChinh || isDaoTao || isQLKH;
  const canViewThanhToanGioGiang = isSuperAdmin || isTaiChinh || isDaoTao;
  const canViewNCKH = isSuperAdmin || isTaiChinh || isQLKH;
  const canViewCongTacKhac = isSuperAdmin || isTaiChinh;

  const canViewThanhToanGroup = isSuperAdmin || isTaiChinh;

  const canViewTraCuuGroup = isSuperAdmin || isTaiChinh || isDaoTao || isQLKH || isGiangVien;
  const canViewTraCuuCaNhan = isSuperAdmin || isTaiChinh || isGiangVien;
  const canViewQuanLyPhanHoi = isSuperAdmin || isTaiChinh || isDaoTao || isQLKH;

  const canViewBaoCaoGroup = isSuperAdmin || isTaiChinh;

  const canViewHeThongGroup = isSuperAdmin;

  // Accordion state: Mặc định đóng tất cả các menu con lại, chỉ hiển thị menu cha
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    danh_muc_thong_ke: isDaoTao || isQLKH,
    nckh: isQLKH,
    thanh_toan: false,
    tra_cuu: isGiangVien || isDaoTao || isQLKH,
    bao_cao: false,
    he_thong: false,
  });

  const toggleSection = (key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Auto-close on mobile/tablet when selecting an item
  const handleItemClick = (key: string, dept?: DepartmentUnit) => {
    onSelectItem(key, dept);
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && onToggleSidebar) {
      onToggleSidebar();
    }
  };

  // Helper to determine active state
  const isItemActive = (key: string, dept?: DepartmentUnit) => {
    if (key === 'ke_khai_upload') {
      return activeItem === 'ke_khai_upload' && selectedDepartment === dept;
    }
    return activeItem === key;
  };

  // Check group active state
  const isTrangChuActive = activeItem === 'trang_chu';
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

  // Tự động mở menu cha tương ứng khi người dùng chuyển trang
  React.useEffect(() => {
    if (isDanhMucActive) {
      setExpandedSections((prev) => ({
        ...prev,
        danh_muc_thong_ke: true,
        ...(selectedDepartment === 'nckh' ? { nckh: true } : {}),
      }));
    } else if (isThanhToanActive) {
      setExpandedSections((prev) => ({ ...prev, thanh_toan: true }));
    } else if (isTraCuuActive) {
      setExpandedSections((prev) => ({ ...prev, tra_cuu: true }));
    } else if (isBaoCaoActive) {
      setExpandedSections((prev) => ({ ...prev, bao_cao: true }));
    } else if (isHeThongActive) {
      setExpandedSections((prev) => ({ ...prev, he_thong: true }));
    }
  }, [activeItem, selectedDepartment]);

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden animate-fadeIn"
        onClick={onToggleSidebar}
        title="Bấm ra ngoài để đóng menu"
      />

      <aside className="fixed inset-y-0 left-0 z-50 w-[285px] max-w-[85vw] bg-white flex flex-col select-none text-[13px] shadow-2xl lg:shadow-none lg:static lg:w-[265px] lg:shrink-0 lg:z-20 font-sans h-full border-r border-slate-200/90 transition-transform duration-200">
        {/* 1. TOP HEADER: Back Arrow, TDU Official Logo */}
        <div className="h-[72px] px-3 border-b border-slate-200/90 flex items-center justify-center relative bg-white shrink-0">
          {/* Official TDU Logo - Centered & Prominent */}
          <div className="flex items-center justify-center">
            <img
              src={tduLogo}
              alt="Trường Đại học Tây Đô - Tay Do University"
              className="h-[56px] max-h-[58px] w-auto object-contain drop-shadow-xs transition-transform hover:scale-105"
            />
          </div>

          <button
            onClick={onToggleSidebar}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
            title="Đóng thanh tác vụ"
          >
            <X className="w-5 h-5 lg:hidden text-slate-600" />
            <ArrowLeft className="w-4.5 h-4.5 hidden lg:block text-slate-600 stroke-[2.2]" />
          </button>
        </div>

        {/* 2. NAVIGATION MENU: TRANG CHỦ & 5 GROUP ACCORDIONS */}
        <nav className="py-2.5 flex-1 overflow-y-auto space-y-1.5 px-2.5">
          {/* MENU TRANG CHỦ (Hiển thị đầu tiên) */}
          <div>
            <button
              onClick={() => handleItemClick('trang_chu')}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 transition-all cursor-pointer ${
                isTrangChuActive
                  ? 'border-2 border-[#005325] bg-[#e8f5e9] text-[#005325] font-semibold shadow-2xs'
                  : 'border-2 border-transparent text-[#1e293b] hover:bg-slate-50 font-medium'
              }`}
            >
              <IconTrangChu size={20} className="shrink-0" />
              <span className="truncate">Trang chủ</span>
            </button>
          </div>

          {/* GROUP 1: DANH MỤC THỐNG KÊ */}
          {canViewDanhMucGroup && (
            <div>
              <button
                type="button"
                onClick={() => toggleSection('danh_muc_thong_ke')}
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
                  {/* 1. Thanh toán giờ giảng (Toàn quyền cho Quản trị HT, Phòng QLĐT, Phòng Tài chính) */}
                  {canViewThanhToanGioGiang && (
                    <button
                      onClick={() => handleItemClick('ke_khai_upload', 'dao_tao')}
                      className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center transition-all cursor-pointer text-[12.5px] ${
                        isItemActive('ke_khai_upload', 'dao_tao')
                          ? 'bg-[#1a73e8] text-white font-medium shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100/80 hover:text-[#1a73e8]'
                      }`}
                    >
                      <span className="truncate">Thanh toán giờ giảng</span>
                    </button>
                  )}

                  {/* 2. Nghiên cứu Khoa học (Toàn quyền cho Quản trị HT, Phòng QLKH&HTQT, Phòng Tài chính) */}
                  {canViewNCKH && (
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          toggleSection('nckh');
                          onSelectItem('ke_khai_upload', 'nckh');
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between transition-all cursor-pointer text-[12.5px] ${
                          isItemActive('ke_khai_upload', 'nckh')
                            ? 'bg-[#1a73e8] text-white font-medium shadow-xs'
                            : 'text-slate-700 hover:bg-slate-100/80 hover:text-[#1a73e8]'
                        }`}
                      >
                        <span className="truncate">Nghiên cứu Khoa học</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                            isItemActive('ke_khai_upload', 'nckh')
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}>3 tab</span>
                          {expandedSections.nckh ? (
                            <ChevronUp className="w-3.5 h-3.5 shrink-0 opacity-80" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-80" />
                          )}
                        </div>
                      </button>

                      {/* 3 tab nhỏ của NCKH: Bài báo, Seminar, Nghiên cứu khoa học */}
                      {expandedSections.nckh && (
                        <div className="mt-1 pl-3 pr-1 py-1 space-y-0.5 border-l-2 border-[#93c5fd] ml-3 animate-fadeIn">
                          <button
                            onClick={() => {
                              onSelectNckhTab?.('bai_bao');
                              handleItemClick('ke_khai_upload', 'nckh');
                            }}
                            className={`w-full text-left px-2 py-1 rounded text-[11.5px] transition-colors flex items-center gap-1.5 cursor-pointer ${
                              nckhTab === 'bai_bao'
                                ? 'bg-blue-100/90 text-blue-900 font-bold'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-blue-700 font-medium'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            <span className="truncate">1. Bài báo</span>
                          </button>
                          <button
                            onClick={() => {
                              onSelectNckhTab?.('seminar');
                              handleItemClick('ke_khai_upload', 'nckh');
                            }}
                            className={`w-full text-left px-2 py-1 rounded text-[11.5px] transition-colors flex items-center gap-1.5 cursor-pointer ${
                              nckhTab === 'seminar'
                                ? 'bg-emerald-100/90 text-emerald-900 font-bold'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-emerald-700 font-medium'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span className="truncate">2. Seminar</span>
                          </button>
                          <button
                            onClick={() => {
                              onSelectNckhTab?.('de_tai');
                              handleItemClick('ke_khai_upload', 'nckh');
                            }}
                            className={`w-full text-left px-2 py-1 rounded text-[11.5px] transition-colors flex items-center gap-1.5 cursor-pointer ${
                              nckhTab === 'de_tai'
                                ? 'bg-purple-100/90 text-purple-900 font-bold'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-purple-700 font-medium'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                            <span className="truncate">3. Nghiên cứu khoa học</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. Công tác khác (Bao gồm Tuyển sinh, Coi thi, CVHT...) */}
                  {canViewCongTacKhac && (
                    <button
                      onClick={() => handleItemClick('ke_khai_upload', 'cong_tac_khac')}
                      className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center transition-all cursor-pointer text-[12.5px] ${
                        isItemActive('ke_khai_upload', 'cong_tac_khac')
                          ? 'bg-[#1a73e8] text-white font-medium shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100/80 hover:text-[#1a73e8]'
                      }`}
                    >
                      <span className="truncate">Công tác khác</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* GROUP 2: THANH TOÁN (CHỨA: QUẢN LÝ THANH TOÁN & CHI TRẢ TÀI CHÍNH) */}
          {canViewThanhToanGroup && (
            <div>
              <button
                type="button"
                onClick={() => toggleSection('thanh_toan')}
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
                    onClick={() => handleItemClick('tong_thanh_toan')}
                    className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between transition-all cursor-pointer text-[12.5px] ${
                      isItemActive('tong_thanh_toan')
                        ? 'bg-[#10b981] text-white font-medium shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100/80 hover:text-emerald-700'
                    }`}
                  >
                    <span className="truncate">Quản lý thanh toán</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                        isItemActive('tong_thanh_toan')
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      Tổng hợp
                    </span>
                  </button>

                  {/* 2. Chi trả tài chính */}
                  <button
                    onClick={() => handleItemClick('chi_tra_tai_chinh')}
                    className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center transition-all cursor-pointer text-[12.5px] ${
                      isItemActive('chi_tra_tai_chinh')
                        ? 'bg-[#10b981] text-white font-medium shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100/80 hover:text-emerald-700'
                    }`}
                  >
                    <span className="truncate">Chi trả tài chính</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* GROUP 3: TRA CỨU VÀ PHẢN HỒI */}
          {canViewTraCuuGroup && (
            <div>
              <button
                type="button"
                onClick={() => toggleSection('tra_cuu')}
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
                  {/* 1. Giảng viên tra cứu và xác nhận (Dành cho Giảng viên, Phòng Tài chính & Quản trị HT) */}
                  {canViewTraCuuCaNhan && (
                    <button
                      onClick={() => handleItemClick('tra_cuu_giang_vien')}
                      className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between transition-all cursor-pointer text-[12.5px] ${
                        isItemActive('tra_cuu_giang_vien')
                          ? 'bg-[#0284c7] text-white font-medium shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100/80 hover:text-sky-700'
                      }`}
                    >
                      <span className="truncate">Giảng viên tra cứu & xác nhận</span>
                      <span
                        className="w-2 h-2 rounded-full bg-blue-500 shrink-0 ring-2 ring-blue-100"
                        title="Có hồ sơ mới"
                      />
                    </button>
                  )}

                  {/* 2. Phản hồi của Giảng viên (Dành cho Phòng Đào tạo, Phòng QLKH, Phòng Tài chính & Quản trị HT) */}
                  {canViewQuanLyPhanHoi && (
                    <button
                      onClick={() => handleItemClick('quan_ly_phan_hoi')}
                      className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between transition-all cursor-pointer text-[12.5px] ${
                        isItemActive('quan_ly_phan_hoi')
                          ? 'bg-[#0284c7] text-white font-medium shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100/80 hover:text-sky-700'
                      }`}
                    >
                      <span className="truncate">Phản hồi của Giảng viên</span>
                      {pendingFeedbackCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10.5px] font-semibold bg-red-500 text-white shrink-0">
                          {pendingFeedbackCount}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* GROUP 4: BÁO CÁO */}
          {canViewBaoCaoGroup && (
            <div>
              <button
                type="button"
                onClick={() => toggleSection('bao_cao')}
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
                    onClick={() => handleItemClick('nhap_lieu_phu_luc')}
                    className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center transition-all cursor-pointer text-[12.5px] ${
                      isItemActive('nhap_lieu_phu_luc')
                        ? 'bg-[#7e22ce] text-white font-medium shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100/80 hover:text-purple-800'
                    }`}
                  >
                    <span className="truncate">Báo cáo thống kê tổng hợp</span>
                  </button>

                  {/* 2. Biên bản nghiệm thu số hóa */}
                  <button
                    onClick={() => handleItemClick('bien_ban_so_hoa')}
                    className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center transition-all cursor-pointer text-[12.5px] ${
                      isItemActive('bien_ban_so_hoa')
                        ? 'bg-[#7e22ce] text-white font-medium shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100/80 hover:text-purple-800'
                    }`}
                  >
                    <span className="truncate">Biên bản nghiệm thu số hóa</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* GROUP 5: HỆ THỐNG */}
          {canViewHeThongGroup && (
            <div>
              <button
                type="button"
                onClick={() => toggleSection('he_thong')}
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
                  {/* 1. Người dùng */}
                  <button
                    onClick={() => handleItemClick('he_thong_nguoi_dung')}
                    className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center transition-all cursor-pointer text-[12.5px] ${
                      isItemActive('he_thong_nguoi_dung')
                        ? 'bg-[#1e293b] text-white font-medium shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">Người dùng</span>
                  </button>

                  {/* 2. Vai trò phân quyền theo group */}
                  <button
                    onClick={() => handleItemClick('he_thong_phan_quyen')}
                    className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center transition-all cursor-pointer text-[12.5px] ${
                      isItemActive('he_thong_phan_quyen')
                        ? 'bg-[#1e293b] text-white font-medium shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">Vai trò phân quyền theo group</span>
                  </button>

                  {/* 3. Cấu hình hệ thống */}
                  <button
                    onClick={() => handleItemClick('he_thong_cau_hinh')}
                    className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center transition-all cursor-pointer text-[12.5px] ${
                      isItemActive('he_thong_cau_hinh')
                        ? 'bg-[#1e293b] text-white font-medium shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">Cấu hình hệ thống</span>
                  </button>

                  {/* 4. Nhật ký hệ thống */}
                  <button
                    onClick={() => handleItemClick('he_thong_nhat_ky')}
                    className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center transition-all cursor-pointer text-[12.5px] ${
                      isItemActive('he_thong_nhat_ky')
                        ? 'bg-[#1e293b] text-white font-medium shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">Nhật ký hệ thống</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};
