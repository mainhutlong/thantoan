import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Pencil,
  LogOut,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
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
  onOpenProfile?: () => void;
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
  onOpenProfile,
}) => {
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showZoomMenu, setShowZoomMenu] = useState(false);
  const [rolesExpanded, setRolesExpanded] = useState(true);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const zoomMenuRef = useRef<HTMLDivElement>(null);

  // Zoom level state (Default: 1.0 = 100% chuẩn cho mọi thiết bị)
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    const saved = localStorage.getItem('tdu_zoom');
    return saved ? Number(saved) : 1.0;
  });

  const handleZoomIn = () => {
    setZoomLevel((prev) => {
      const next = Math.min(1.5, Math.round((prev + 0.1) * 10) / 10);
      localStorage.setItem('tdu_zoom', String(next));
      return next;
    });
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(0.7, Math.round((prev - 0.1) * 10) / 10);
      localStorage.setItem('tdu_zoom', String(next));
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1.0);
    localStorage.setItem('tdu_zoom', '1.0');
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
      if (zoomMenuRef.current && !zoomMenuRef.current.contains(event.target as Node)) {
        setShowZoomMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userEmail = currentAccount.email || 'mnlong@tdu.edu.vn';
  const userDisplayName = currentAccount.fullName || 'Mai Nhựt Long';

  const getAvatarInitial = (name: string) => {
    if (!name) return 'L';
    const parts = name.trim().split(/\s+/);
    return parts[parts.length - 1].charAt(0).toUpperCase();
  };

  // Role list styled like Screenshot 1 & tailored to the Teaching Payment System
  const roleOptions: { role: UserRole; title: string; badgeText: string }[] = [
    {
      role: 'admin',
      title: 'Super Admin',
      badgeText: 'SUPER ADMIN',
    },
    {
      role: 'approver',
      title: 'Trưởng/phó đơn vị',
      badgeText: 'TRƯỞNG/PHÓ ĐƠN VỊ',
    },
    {
      role: 'accountant_specialist',
      title: 'Chuyên viên',
      badgeText: 'CHUYÊN VIÊN',
    },
    {
      role: 'dean_faculty',
      title: 'Đơn vị kê khai',
      badgeText: 'ĐƠN VỊ KÊ KHAI',
    },
    {
      role: 'lecturer',
      title: 'Giảng viên',
      badgeText: 'GIẢNG VIÊN',
    },
  ];

  const currentRoleOption =
    roleOptions.find((r) => r.role === currentRole) || roleOptions[2];

  return (
    <header className="bg-white border-b border-slate-200/90 h-[52px] px-3 sm:px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* LEFT: Sidebar Toggle button & Mobile Brand Indicator */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className={`p-1.5 rounded-lg text-slate-600 hover:text-[#005325] hover:bg-slate-100 cursor-pointer transition-colors flex items-center gap-1.5 ${
            sidebarOpen ? 'lg:hidden flex' : 'flex'
          }`}
          title={sidebarOpen ? 'Đóng menu' : 'Mở menu'}
        >
          <Menu className="w-5 h-5 text-[#005325]" />
          <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
            {sidebarOpen ? 'Đóng menu' : 'Menu'}
          </span>
        </button>

        {/* Mobile Header Title */}
        <div className="flex items-center gap-1.5 lg:hidden min-w-0">
          <span className="font-bold text-[13px] text-[#005325] tracking-tight shrink-0">
            TDU
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-[12px] font-medium text-slate-700 truncate max-w-[130px] sm:max-w-none">
            Thanh toán thù lao
          </span>
        </div>
      </div>

      {/* RIGHT: 1. Phóng to / Thu nhỏ - 2. Icon Chấm hỏi - 3. Icon Thông báo - 4. Hồ sơ cá nhân */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Bộ điều khiển Phóng to / Thu nhỏ giao diện */}
        <div className="relative" ref={zoomMenuRef}>
          <div className="flex items-center bg-slate-100/90 hover:bg-slate-200/80 rounded-lg p-0.5 border border-slate-200 text-slate-700 transition-colors">
            <button
              type="button"
              onClick={handleZoomOut}
              className="w-6 h-6 rounded flex items-center justify-center hover:bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Thu nhỏ giao diện (tối thiểu 70%)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setShowZoomMenu(!showZoomMenu)}
              className="px-1 sm:px-1.5 h-6 rounded flex items-center gap-0.5 hover:bg-white text-slate-700 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
              title="Tùy chọn tỉ lệ thu phóng màn hình"
            >
              <span>{Math.round(zoomLevel * 100)}%</span>
              <ChevronDown className="w-2.5 h-2.5 text-slate-400 hidden sm:inline" />
            </button>

            <button
              type="button"
              onClick={handleZoomIn}
              className="w-6 h-6 rounded flex items-center justify-center hover:bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Phóng to giao diện (tối đa 150%)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dropdown Menu Tỉ lệ thu phóng */}
          {showZoomMenu && (
            <div className="absolute top-8 right-0 sm:left-1/2 sm:-translate-x-1/2 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 min-w-[135px] animate-fadeIn text-[11.5px]">
              <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 tracking-wider">
                Thu phóng màn hình
              </div>
              {[
                { val: 0.8, label: '80% (Rộng rãi)' },
                { val: 0.9, label: '90% (Gọn gàng)' },
                { val: 1.0, label: '100% (Chuẩn)' },
                { val: 1.1, label: '110% (Vừa vặn)' },
                { val: 1.25, label: '125% (Rõ nét)' },
                { val: 1.5, label: '150% (Phóng đại)' },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => {
                    setZoomLevel(item.val);
                    localStorage.setItem('tdu_zoom', String(item.val));
                    setShowZoomMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                    Math.abs(zoomLevel - item.val) < 0.02
                      ? 'text-[#005325] font-semibold bg-emerald-50/60'
                      : 'text-slate-700'
                  }`}
                >
                  <span>{item.label}</span>
                  {Math.abs(zoomLevel - item.val) < 0.02 && (
                    <span className="text-[#005325] text-[10px] font-bold">✓</span>
                  )}
                </button>
              ))}
              <div className="border-t border-slate-100 mt-1 pt-1 px-1">
                <button
                  type="button"
                  onClick={() => {
                    handleResetZoom();
                    setShowZoomMenu(false);
                  }}
                  className="w-full text-center px-2 py-1 rounded text-[11px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer flex items-center justify-center gap-1 font-medium"
                >
                  <RotateCcw className="w-3 h-3 text-slate-500" />
                  <span>Mặc định (100%)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. Icon Chấm hỏi */}
        <button
          onClick={onSendFeedback}
          className="p-1.5 sm:p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors flex items-center justify-center"
          title="Trợ giúp & Phản hồi"
        >
          <HelpCircle className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* 3. Icon Thông báo có số lượng badge đỏ */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            className="relative p-1.5 sm:p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors flex items-center justify-center"
            title="Thông báo hệ thống"
          >
            <Bell className="w-5 h-5 stroke-[1.8]" />
            {pendingFeedbackCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#ef4444] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {pendingFeedbackCount}
              </span>
            )}
          </button>

          {showNotificationMenu && (
            <div className="absolute right-0 top-11 w-80 max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-fadeIn text-xs">
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
                    className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100/70 text-slate-800 cursor-pointer transition-colors border border-amber-200/60"
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
                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-100 text-[11px]">
                  <span className="font-medium text-emerald-800 block">Đợt thanh toán HK2</span>
                  Dữ liệu giờ giảng học kỳ 2 năm học 2023 - 2024 đang được đối soát.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Thông tin cá nhân (Avatar chữ cái + Họ tên + Vai trò in hoa) */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 py-1 px-1 rounded-xl hover:bg-slate-100/80 cursor-pointer transition-colors"
            title="Hồ sơ cá nhân & Chuyển đổi vai trò"
          >
            {/* Avatar circle */}
            <div className="w-8 h-8 rounded-full bg-[#007b6e] text-white flex items-center justify-center font-medium text-[14px] shrink-0">
              {getAvatarInitial(userDisplayName)}
            </div>

            {/* Tên và Chức vụ */}
            <div className="text-left hidden md:block truncate max-w-[170px]">
              <div className="text-[13px] font-semibold text-[#1e3a5f] leading-tight truncate">
                {userDisplayName}
              </div>
              <div className="text-[10.5px] font-medium text-slate-500 uppercase tracking-wide truncate leading-tight mt-0.5">
                {currentRoleOption.badgeText}
              </div>
            </div>
          </button>

          {/* Popover Hồ sơ & Chuyển đổi vai trò */}
          {showUserMenu && (
            <div className="absolute right-0 top-12 w-[325px] max-w-[calc(100vw-24px)] bg-[#eef3f8] rounded-[26px] shadow-2xl border border-slate-200/80 p-3.5 z-50 animate-fadeIn">
              {/* Top close button */}
              <div className="flex justify-end mb-1.5 pr-1">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(false)}
                  className="p-1 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 cursor-pointer transition-colors"
                  title="Đóng"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Inner White Card */}
              <div className="bg-white rounded-[20px] shadow-2xs overflow-hidden border border-slate-100">
                {/* 1. User Header with Avatar + Edit Pencil Badge + Collapse Toggle */}
                <div className="p-3.5 flex items-center justify-between gap-2.5 border-b border-slate-100">
                  <div
                    onClick={() => {
                      setShowUserMenu(false);
                      if (onOpenProfile) onOpenProfile();
                    }}
                    className="flex items-center gap-3 min-w-0 cursor-pointer group"
                    title="Bấm để mở Hồ sơ người dùng & Cài đặt"
                  >
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-[#007b6e] text-white flex items-center justify-center text-[20px] font-medium ring-2 ring-[#e6f2f0]">
                        {getAvatarInitial(userDisplayName)}
                      </div>
                      <span className="w-5 h-5 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center absolute -bottom-0.5 -right-0.5 text-[#1e3a5f] group-hover:bg-slate-50">
                        <Pencil className="w-2.5 h-2.5" />
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="text-[14.5px] font-semibold text-[#1e3a5f] group-hover:underline truncate">
                        {userDisplayName}
                      </div>
                      <div className="text-[12px] text-slate-500 truncate">
                        {userEmail}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setRolesExpanded(!rolesExpanded)}
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-600 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                    title={rolesExpanded ? 'Thu gọn danh sách vai trò' : 'Mở rộng danh sách vai trò'}
                  >
                    {rolesExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* 2. Role Switcher List */}
                {rolesExpanded && (
                  <div className="divide-y divide-slate-100">
                    {roleOptions.map((item) => {
                      const isCurrent = currentRole === item.role;
                      return (
                        <button
                          key={item.role}
                          type="button"
                          onClick={() => {
                            onChangeRole(item.role);
                            setShowUserMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                            isCurrent
                              ? 'bg-[#f3f6fc]'
                              : 'bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div
                              className={`text-[13px] truncate ${
                                isCurrent
                                  ? 'font-semibold text-[#1e40af]'
                                  : 'font-medium text-slate-800'
                              }`}
                            >
                              {item.title}
                            </div>
                            <div className="text-[11.5px] text-slate-500 truncate">
                              {userEmail}
                            </div>
                          </div>

                          {isCurrent && (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#d3e3fd] text-[#0b57d0] text-[11px] font-semibold shrink-0">
                              Hiện tại
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 3. Logout Button */}
                <button
                  type="button"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 text-[13px] font-medium text-slate-800 hover:bg-slate-50 border-t border-slate-100 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4 text-slate-600" />
                  <span>Đăng xuất</span>
                </button>
              </div>

              {/* Footer Links */}
              <div className="text-center text-[11px] text-slate-500 pt-2.5 pb-0.5">
                <span>Chính sách quyền riêng tư</span>
                <span className="mx-1.5">•</span>
                <span>Điều khoản dịch vụ</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
