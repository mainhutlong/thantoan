import React, { useState, useRef, useEffect } from 'react';
import { Bell, HelpCircle, ChevronDown, Check, Menu } from 'lucide-react';
import { UserRole, UserAccount } from '../types';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  currentAccount: UserAccount;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  pendingFeedbackCount: number;
  onOpenFeedbacks: () => void;
  onSendFeedback: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  onToggleSidebar,
  currentAccount,
  currentRole,
  onChangeRole,
  pendingFeedbackCount,
  onOpenFeedbacks,
  onSendFeedback,
}) => {
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Zoom level state (Default: 125%)
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    const saved = localStorage.getItem('tdu_zoom');
    return saved ? Number(saved) : 1.25;
  });

  const handleZoomChange = (newZoom: number) => {
    setZoomLevel(newZoom);
    localStorage.setItem('tdu_zoom', String(newZoom));
    document.documentElement.style.setProperty('--app-zoom', String(newZoom));
    document.documentElement.style.setProperty('--modal-zoom', String(1 / newZoom));
    (document.documentElement as HTMLElement).style.zoom = String(newZoom);
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--app-zoom', String(zoomLevel));
    document.documentElement.style.setProperty('--modal-zoom', String(1 / zoomLevel));
    (document.documentElement as HTMLElement).style.zoom = String(zoomLevel);
  }, [zoomLevel]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotificationMenu(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleLabels: { [key in UserRole]: { title: string; subtitle: string } } = {
    accountant_specialist: {
      title: 'Chuyên Viên Tổng Hợp',
      subtitle: 'Phòng Đào tạo / Tổ Thanh toán',
    },
    dean_faculty: {
      title: 'Đại Diện Đơn Vị Nhập Liệu',
      subtitle: 'Phòng / Khoa / Trung tâm TDU',
    },
    lecturer: {
      title: 'TS. Mai Như Long',
      subtitle: 'Giảng viên (Cổng tra cứu)',
    },
    approver: {
      title: 'Ban Giám Hiệu TDU',
      subtitle: 'Kiểm tra & Phê duyệt',
    },
    admin: {
      title: 'Quản Trị Viên Hệ Thống',
      subtitle: 'Cấu hình đơn giá & Phân quyền',
    },
  };

  const getRoleDisplayName = (acc: UserAccount) => {
    if (acc.role === 'admin') return 'Quản trị viên Hệ thống';
    if (acc.role === 'tai_chinh') return 'Phòng Kế hoạch - Tài chính';
    if (acc.role === 'giang_vien') return 'Giảng viên Cơ hữu';
    if (acc.role === 'upload_dao_tao') return 'Chuyên viên Phòng Đào tạo';
    if (acc.role === 'upload_khao_thi') return 'Chuyên viên TT Khảo thí';
    if (acc.role === 'upload_tuyen_sinh') return 'Chuyên viên Phòng Tuyển sinh';
    if (acc.role === 'upload_nckh') return 'Chuyên viên Phòng QLKH & SĐH';
    return acc.departmentName || 'Chuyên viên Tổng hợp';
  };

  return (
    <header className="bg-white border-b border-slate-200/90 h-[52px] px-4 flex items-center justify-between select-none shadow-2xs z-30 shrink-0">
      {/* LEFT: Sidebar Toggle button & System Title */}
      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-600 hover:text-[#005325] hover:bg-slate-100 cursor-pointer transition-colors flex items-center gap-1.5"
            title="Mở thanh tác vụ"
          >
            <Menu className="w-5 h-5 text-[#005325]" />
            <span className="text-xs font-semibold text-slate-700 hidden sm:inline">Mở menu</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="text-[13.5px] font-semibold text-slate-800 tracking-tight">
            Hệ thống thanh toán giờ giảng
          </span>
          <span className="hidden md:inline-block text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/70">
            Trường Đại học Tây Đô
          </span>
        </div>
      </div>

      {/* RIGHT: 1. Icon Thông báo - 2. Icon Chấm hỏi gửi phản hồi - 3. Thông tin cá nhân (Tên và Chức vụ) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 1. Icon Thông báo */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-[#005325] hover:bg-slate-100 cursor-pointer transition-colors"
            title="Thông báo hệ thống"
          >
            <Bell className="w-5 h-5" />
            {pendingFeedbackCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {showNotificationMenu && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-fadeIn text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <span className="font-semibold text-slate-800 text-[13px]">Thông báo hệ thống</span>
                <span className="text-[11px] text-slate-500">HK2 (2023 - 2024)</span>
              </div>
              <div className="space-y-2">
                {pendingFeedbackCount > 0 ? (
                  <div
                    onClick={() => {
                      setShowNotificationMenu(false);
                      onOpenFeedbacks();
                    }}
                    className="p-2.5 rounded-lg bg-amber-50 hover:bg-amber-100/70 text-slate-800 cursor-pointer transition-colors border border-amber-200/60"
                  >
                    <div className="font-medium text-amber-900 flex items-center justify-between">
                      <span>Phản hồi từ giảng viên</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                        {pendingFeedbackCount} mới
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      Có {pendingFeedbackCount} ý kiến đối soát thù lao giờ giảng cần xử lý.
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-center text-slate-500 text-[12px]">
                    Không có thông báo mới nào
                  </div>
                )}
                <div className="p-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-100 text-[11px]">
                  <span className="font-medium text-emerald-800 block">Đợt thanh toán HK2</span>
                  Dữ liệu giờ giảng học kỳ 2 năm học 2023 - 2024 đang được đối soát.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Icon Chấm hỏi để gửi phản hồi */}
        <button
          onClick={onSendFeedback}
          className="p-2 rounded-xl text-slate-600 hover:text-[#005325] hover:bg-slate-100 cursor-pointer transition-colors flex items-center gap-1"
          title="Gửi phản hồi / Trợ giúp"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-[12px] font-medium text-slate-600 hover:text-[#005325] hidden xl:inline">
            Gửi phản hồi
          </span>
        </button>

        {/* 2b. Bộ điều khiển phóng to thu nhỏ giao diện (Default 125%) */}
        <div className="flex items-center gap-1 bg-slate-100/90 hover:bg-slate-100 px-2 py-1 rounded-xl border border-slate-200/80 text-xs">
          <span className="text-[11px] text-slate-500 font-medium hidden md:inline">Thu phóng:</span>
          <select
            value={zoomLevel}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            className="bg-transparent font-semibold text-slate-700 text-[11.5px] outline-none cursor-pointer"
            title="Tỷ lệ phóng to thu nhỏ giao diện"
          >
            <option value={1.0}>100%</option>
            <option value={1.1}>110%</option>
            <option value={1.25}>125% (Chuẩn)</option>
            <option value={1.35}>135%</option>
            <option value={1.5}>150%</option>
          </select>
        </div>

        {/* Phân cách mảnh */}
        <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

        {/* 3. Thông tin cá nhân có TÊN và CHỨC VỤ */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors border border-transparent hover:border-slate-200"
            title="Thông tin cá nhân & Đổi vai trò"
          >
            {/* Avatar circle */}
            <div className="w-8 h-8 rounded-full bg-[#005325] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              {currentAccount.fullName ? currentAccount.fullName.charAt(0) : 'T'}
            </div>

            {/* Tên và Chức vụ */}
            <div className="text-left hidden sm:block truncate max-w-[190px]">
              <div className="text-[12.5px] font-semibold text-slate-800 leading-tight truncate">
                {currentAccount.fullName}
              </div>
              <div className="text-[11px] text-slate-500 truncate leading-tight">
                {getRoleDisplayName(currentAccount)}
              </div>
            </div>

            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          </button>

          {/* User & Role Switcher Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-11 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-fadeIn text-xs">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <div className="font-semibold text-slate-800 text-[13px]">{currentAccount.fullName}</div>
                <div className="text-slate-500 text-[11px]">{currentAccount.email || 'canbo@tdu.edu.vn'}</div>
                <div className="mt-1 text-[10.5px] px-2 py-0.5 rounded-full bg-emerald-50 text-[#005325] inline-block font-medium">
                  {getRoleDisplayName(currentAccount)}
                </div>
              </div>

              <div className="px-3 py-1 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Chuyển đổi góc nhìn vai trò
              </div>

              <div className="space-y-0.5">
                {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      onChangeRole(role);
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                      currentRole === role
                        ? 'bg-emerald-50 text-[#005325] font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="text-[12px]">{roleLabels[role].title}</div>
                      <div className="text-[10px] text-slate-400">{roleLabels[role].subtitle}</div>
                    </div>
                    {currentRole === role && <Check className="w-4 h-4 text-[#005325]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
