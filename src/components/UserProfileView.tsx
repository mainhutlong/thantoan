import React, { useState } from 'react';
import {
  User,
  Shield,
  ArrowUpRight,
  Monitor,
  Sliders,
  Bell,
  Info,
  LogOut,
  Pencil,
  X,
  CreditCard,
} from 'lucide-react';
import { UserAccount, UserRole } from '../types';

interface UserProfileViewProps {
  currentAccount: UserAccount;
  currentRole: UserRole;
  onClose: () => void;
  onUpdateAccount?: (updated: UserAccount) => void;
}

type ProfileSectionKey =
  | 'ho_so'
  | 'thanh_toan'
  | 'bao_mat'
  | 'yeu_cau_cap_nhat'
  | 'thiet_bi'
  | 'giao_dien'
  | 'thong_bao'
  | 'thong_tin_ung_dung';

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  currentAccount,
  currentRole,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState<ProfileSectionKey>('ho_so');
  const [showEmail, setShowEmail] = useState<boolean>(true);
  const [showCCCD, setShowCCCD] = useState<boolean>(false);
  const [showBankAccount, setShowBankAccount] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Editable personal & payment fields
  const [profileData, setProfileData] = useState({
    fullName: currentAccount.fullName || 'Mai Nhựt Long',
    staffCode: '01067016',
    maGV: currentAccount.maGV || 'TDU00128',
    email: currentAccount.email || 'mnlong@tdu.edu.vn',
    cccd: '092082004272',
    gender: 'Chưa cập nhật',
    birthDate: '24/09/2001',
    title:
      currentRole === 'admin'
        ? 'Super Admin'
        : currentRole === 'approver'
        ? 'Trưởng/phó đơn vị'
        : currentRole === 'lecturer'
        ? 'Giảng viên'
        : 'Chuyên Viên',
    department: 'Phòng Công nghệ thông tin',
    permanentAddress: 'Chưa cập nhật',
    currentAddress: 'Chưa cập nhật',
    bankName: 'Vietcombank — Chi nhánh Cần Thơ',
    bankAccount: '102874639912',
    taxCode: '8401928374',
    academicDegree: 'Tiến sĩ (TS)',
    salaryCoefficient: '1.50 (Đơn giá chuẩn 180.000 đ/tiết)',
    teachingQuota: '270 tiết QC / năm học',
    nckhQuota: '150 giờ / năm học',
  });

  // Update request form state
  const [updateRequestType, setUpdateRequestType] = useState('stk_ngan_hang');
  const [updateRequestNote, setUpdateRequestNote] = useState('');

  // Notification toggles
  const [notifSettings, setNotifSettings] = useState({
    newSchedule: true,
    lecturerFeedback: true,
    paymentApproved: true,
    uncTransferred: true,
    periodLockWarning: true,
  });

  // Zoom state synced with Header
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

  const getAvatarInitial = (name: string) => {
    if (!name) return 'L';
    const parts = name.trim().split(/\s+/);
    return parts[parts.length - 1].charAt(0).toUpperCase();
  };

  const maskString = (str: string, visibleEnd = 4) => {
    if (!str || str.length <= visibleEnd) return str;
    return '••••••••' + str.slice(-visibleEnd);
  };

  const maskEmail = (email: string) => {
    const [user, domain] = email.split('@');
    if (!domain) return email;
    return `${user.charAt(0)}•••••@${domain}`;
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedNotice('Đã lưu cập nhật thông tin hồ sơ cá nhân.');
    setTimeout(() => setSavedNotice(null), 3500);
  };

  const handleSendUpdateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateRequestNote.trim()) return;
    setUpdateRequestNote('');
    setSavedNotice('Đã gửi yêu cầu cập nhật thông tin đến Phòng Tổ chức - Hành chính & Phòng Tài chính.');
    setTimeout(() => setSavedNotice(null), 4000);
  };

  const sectionTitles: Record<ProfileSectionKey, string> = {
    ho_so: 'Hồ sơ người dùng',
    thanh_toan: 'Thông tin định mức & Thụ hưởng thù lao',
    bao_mat: 'Bảo mật & Tài khoản',
    yeu_cau_cap_nhat: 'Yêu cầu cập nhật thông tin hồ sơ / định mức',
    thiet_bi: 'Thiết bị đăng nhập',
    giao_dien: 'Giao diện & Hiển thị',
    thong_bao: 'Các thông báo hệ thống',
    thong_tin_ung_dung: 'Thông tin ứng dụng',
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-5 select-none animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden w-[850px] max-w-[96vw] h-[580px] max-h-[92vh] flex flex-row">
        {/* 1. LEFT SETTINGS NAVIGATION SIDEBAR */}
        <aside className="w-[245px] shrink-0 bg-[#f8fafc] border-r border-slate-200/90 flex flex-col justify-between p-4 overflow-y-auto">
          <div className="space-y-4">
            {/* Top Mini Profile Header */}
            <div className="flex items-center gap-3 px-1 pt-0.5">
              <div className="w-10 h-10 rounded-full bg-[#007b6e] text-white flex items-center justify-center font-semibold text-[16px] shrink-0 shadow-2xs">
                {getAvatarInitial(profileData.fullName)}
              </div>
              <div className="min-w-0">
                <div className="text-[13.5px] font-semibold text-slate-800 truncate">
                  {profileData.fullName}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection('ho_so');
                    setIsEditing(true);
                  }}
                  className="text-[11.5px] text-slate-500 hover:text-[#007b6e] flex items-center gap-1 cursor-pointer transition-colors mt-0.5"
                >
                  <span>Sửa hồ sơ</span>
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Group 1: Cài đặt người dùng */}
            <div className="space-y-1">
              <div className="px-2.5 text-[11px] font-medium text-slate-400">
                Cài đặt người dùng
              </div>

              <button
                type="button"
                onClick={() => setActiveSection('ho_so')}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 text-[12.5px] cursor-pointer transition-colors ${
                  activeSection === 'ho_so'
                    ? 'bg-[#e6ecf5] text-slate-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-200/50 font-normal'
                }`}
              >
                <User className="w-4 h-4 text-slate-700 shrink-0" />
                <span className="truncate">Hồ sơ người dùng</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('bao_mat')}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 text-[12.5px] cursor-pointer transition-colors ${
                  activeSection === 'bao_mat'
                    ? 'bg-[#e6ecf5] text-slate-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-200/50 font-normal'
                }`}
              >
                <Shield className="w-4 h-4 text-slate-700 shrink-0" />
                <span className="truncate">Bảo mật & Tài khoản</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('yeu_cau_cap_nhat')}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 text-[12.5px] cursor-pointer transition-colors ${
                  activeSection === 'yeu_cau_cap_nhat'
                    ? 'bg-[#e6ecf5] text-slate-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-200/50 font-normal'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-slate-700 shrink-0" />
                <span className="truncate">Yêu cầu cập nhật thông...</span>
              </button>

              <button
                type="button"
                disabled
                className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 text-[12.5px] text-slate-400 cursor-not-allowed opacity-60"
              >
                <Monitor className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">Thiết bị</span>
              </button>
            </div>

          <div className="border-t border-slate-200/80" />

          {/* Group 2: Cài đặt ứng dụng */}
          <div className="space-y-1">
            <div className="px-2.5 text-[11px] font-medium text-slate-400">
              Cài đặt ứng dụng
            </div>

            <button
              type="button"
              onClick={() => setActiveSection('giao_dien')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 text-[12.5px] cursor-pointer transition-colors ${
                activeSection === 'giao_dien'
                  ? 'bg-[#e6ecf5] text-slate-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-200/50 font-normal'
              }`}
            >
              <Sliders className="w-4 h-4 text-slate-600 shrink-0" />
              <span className="truncate">Giao diện & Hiển thị</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('thong_bao')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 text-[12.5px] cursor-pointer transition-colors ${
                activeSection === 'thong_bao'
                  ? 'bg-[#e6ecf5] text-slate-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-200/50 font-normal'
              }`}
            >
              <Bell className="w-4 h-4 text-slate-600 shrink-0" />
              <span className="truncate">Các thông báo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('thong_tin_ung_dung')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 text-[12.5px] cursor-pointer transition-colors ${
                activeSection === 'thong_tin_ung_dung'
                  ? 'bg-[#e6ecf5] text-slate-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-200/50 font-normal'
              }`}
            >
              <Info className="w-4 h-4 text-slate-600 shrink-0" />
              <span className="truncate">Thông tin ứng dụng</span>
            </button>
          </div>
        </div>

        {/* Bottom Logout Button */}
        <div className="pt-3 border-t border-slate-200/80">
          <button
            type="button"
            onClick={onClose}
            className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 text-[12.5px] text-rose-600 hover:bg-rose-50 font-medium cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* 2. RIGHT MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-white overflow-y-auto">
        {/* Top Title Bar */}
        <div className="h-[64px] px-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h2 className="text-[14.5px] font-semibold text-slate-800">
            {sectionTitles[activeSection]}
          </h2>
          <div className="flex items-center gap-2">
            {activeSection === 'ho_so' && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="h-[28px] px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-[12px] text-slate-600 cursor-pointer transition-colors"
              >
                Chỉnh sửa
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
              title="Đóng hồ sơ"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Status Notification Banner */}
        {savedNotice && (
          <div className="mx-6 mt-4 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[#005325] text-[12px] flex items-center justify-between">
            <span>{savedNotice}</span>
            <button
              type="button"
              onClick={() => setSavedNotice(null)}
              className="text-[11px] hover:underline cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Section Content */}
        <div className="p-6 max-w-2xl space-y-6">
          {/* =============================================================== */}
          {/* TAB 1: HỒ SƠ NGƯỜI DÙNG (Giống mẫu hình 2)                       */}
          {/* =============================================================== */}
          {activeSection === 'ho_so' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Block 1: Thông Tin Tài Khoản */}
              <div>
                <h3 className="text-[13.5px] font-semibold text-slate-800 mb-3.5">
                  Thông Tin Tài Khoản
                </h3>

                <div className="space-y-3 text-[12.5px]">
                  <div className="grid grid-cols-12 items-center py-1">
                    <span className="col-span-5 text-slate-600 font-normal">Họ và tên</span>
                    <div className="col-span-7">
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.fullName}
                          onChange={(e) =>
                            setProfileData({ ...profileData, fullName: e.target.value })
                          }
                          className="w-full h-[30px] px-2.5 border border-slate-300 rounded-md text-[12.5px] text-slate-800 focus:outline-none focus:border-[#007b6e]"
                        />
                      ) : (
                        <span className="text-slate-600 font-normal">{profileData.fullName}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 items-center py-1">
                    <span className="col-span-5 text-slate-600 font-normal">Mã nhân sự</span>
                    <span className="col-span-7 text-slate-700 font-normal font-mono">
                      {profileData.staffCode}
                    </span>
                  </div>

                  <div className="grid grid-cols-12 items-center py-1">
                    <span className="col-span-5 text-slate-600 font-normal">Email</span>
                    <div className="col-span-7 flex items-center gap-2.5">
                      <span className="text-slate-700 font-normal">
                        {showEmail ? profileData.email : maskEmail(profileData.email)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowEmail(!showEmail)}
                        className="text-[#1a73e8] hover:underline text-[12px] font-medium cursor-pointer"
                      >
                        {showEmail ? 'Ẩn' : 'Hiển thị'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 items-center py-1">
                    <span className="col-span-5 text-slate-600 font-normal">Số căn cước</span>
                    <div className="col-span-7 flex items-center gap-2.5">
                      <span className="text-slate-700 font-normal font-mono">
                        {showCCCD ? profileData.cccd : '••••••••4272'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowCCCD(!showCCCD)}
                        className="text-[#1a73e8] hover:underline text-[12px] font-medium cursor-pointer"
                      >
                        {showCCCD ? 'Ẩn' : 'Hiển thị'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* Block 2: Thông Tin Công Tác & Cá Nhân */}
              <div>
                <h3 className="text-[13.5px] font-semibold text-slate-800 mb-3.5">
                  Thông Tin Công Tác & Cá Nhân
                </h3>

                <div className="space-y-3 text-[12.5px]">
                  <div className="grid grid-cols-12 items-center py-1">
                    <span className="col-span-5 text-slate-600 font-normal">Giới tính</span>
                    <div className="col-span-7">
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.gender}
                          onChange={(e) =>
                            setProfileData({ ...profileData, gender: e.target.value })
                          }
                          className="w-full h-[30px] px-2.5 border border-slate-300 rounded-md text-[12.5px] text-slate-800 focus:outline-none focus:border-[#007b6e]"
                        />
                      ) : (
                        <span className="text-slate-600 font-normal">{profileData.gender}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 items-center py-1">
                    <span className="col-span-5 text-slate-600 font-normal">Ngày sinh</span>
                    <div className="col-span-7">
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.birthDate}
                          onChange={(e) =>
                            setProfileData({ ...profileData, birthDate: e.target.value })
                          }
                          className="w-full h-[30px] px-2.5 border border-slate-300 rounded-md text-[12.5px] text-slate-800 focus:outline-none focus:border-[#007b6e]"
                        />
                      ) : (
                        <span className="text-slate-600 font-normal">{profileData.birthDate}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 items-center py-1">
                    <span className="col-span-5 text-slate-600 font-normal">Chức danh</span>
                    <span className="col-span-7 text-slate-600 font-normal">
                      {profileData.title}
                    </span>
                  </div>

                  <div className="grid grid-cols-12 items-center py-1">
                    <span className="col-span-5 text-slate-600 font-normal">Đơn vị</span>
                    <span className="col-span-7 text-slate-600 font-normal">
                      {profileData.department}
                    </span>
                  </div>

                  <div className="grid grid-cols-12 items-center py-1">
                    <span className="col-span-5 text-slate-600 font-normal">Địa chỉ HKTT</span>
                    <div className="col-span-7">
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.permanentAddress}
                          onChange={(e) =>
                            setProfileData({ ...profileData, permanentAddress: e.target.value })
                          }
                          className="w-full h-[30px] px-2.5 border border-slate-300 rounded-md text-[12.5px] text-slate-800 focus:outline-none focus:border-[#007b6e]"
                        />
                      ) : (
                        <span className="text-slate-600 font-normal">
                          {profileData.permanentAddress}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 items-center py-1">
                    <span className="col-span-5 text-slate-600 font-normal">Chỗ ở hiện nay</span>
                    <div className="col-span-7">
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.currentAddress}
                          onChange={(e) =>
                            setProfileData({ ...profileData, currentAddress: e.target.value })
                          }
                          className="w-full h-[30px] px-2.5 border border-slate-300 rounded-md text-[12.5px] text-slate-800 focus:outline-none focus:border-[#007b6e]"
                        />
                      ) : (
                        <span className="text-slate-600 font-normal">
                          {profileData.currentAddress}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="h-[30px] px-3.5 rounded-lg border border-slate-200 text-[12px] text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="h-[30px] px-4 rounded-lg bg-[#007b6e] hover:bg-[#00665b] text-white text-[12px] font-medium cursor-pointer"
                  >
                    Lưu hồ sơ
                  </button>
                </div>
              )}

              <p className="text-[11.5px] text-slate-400 italic pt-2">
                * Dữ liệu được trích xuất từ hệ thống quản lý nhân sự tập trung
              </p>
            </form>
          )}

          {/* =============================================================== */}
          {/* TAB 2: TÀI KHOẢN THỤ HƯỞNG & ĐỊNH MỨC GIỜ CHUẨN                  */}
          {/* =============================================================== */}
          {activeSection === 'thanh_toan' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[13.5px] font-semibold text-slate-800 mb-3.5">
                  Tài Khoản Ngân Hàng Thụ Hưởng Thù Lao
                </h3>
                <div className="space-y-3 text-[12.5px]">
                  <div className="grid grid-cols-12 items-center py-1">
                    <span className="col-span-5 text-slate-600">Chủ tài khoản</span>
                    <span className="col-span-7 text-slate-700 font-medium uppercase">
                      {profileData.fullName}
                    </span>
                  </div>
                  <div className="grid grid-cols-12 items-center py-1">
                    <span className="col-span-5 text-slate-600">Ngân hàng chi trả</span>
                    <span className="col-span-7 text-slate-600">{profileData.bankName}</span>
                  </div>
                  <div className="grid grid-cols-12 items-center py-1">
                    <span className="col-span-5 text-slate-600">Số tài khoản (UNC)</span>
                    <div className="col-span-7 flex items-center gap-2.5">
                      <span className="font-mono text-slate-700">
                        {showBankAccount
                          ? profileData.bankAccount
                          : maskString(profileData.bankAccount, 4)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowBankAccount(!showBankAccount)}
                        className="text-[#1a73e8] hover:underline text-[12px] font-medium cursor-pointer"
                      >
                        {showBankAccount ? 'Ẩn' : 'Hiển thị'}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-12 items-center py-1">
                    <span className="col-span-5 text-slate-600">Mã số thuế TNCN</span>
                    <span className="col-span-7 font-mono text-slate-600">
                      {profileData.taxCode} (Khấu trừ 10% tại nguồn)
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              <div>
                <h3 className="text-[13.5px] font-semibold text-slate-800 mb-3.5">
                  Định Mức Giờ Chuẩn & Hệ Số Thanh Toán
                </h3>
                <div className="space-y-3 text-[12.5px]">
                  <div className="grid grid-cols-12 items-center py-1">
                    <span className="col-span-5 text-slate-600">Học hàm / Học vị</span>
                    <span className="col-span-7 text-slate-600">{profileData.academicDegree}</span>
                  </div>
                  <div className="grid grid-cols-12 items-center py-1">
                    <span className="col-span-5 text-slate-600">Hệ số & Đơn giá tiết QC</span>
                    <span className="col-span-7 text-slate-600">{profileData.salaryCoefficient}</span>
                  </div>
                  <div className="grid grid-cols-12 items-center py-1">
                    <span className="col-span-5 text-slate-600">Định mức giảng dạy</span>
                    <span className="col-span-7 text-slate-600">{profileData.teachingQuota}</span>
                  </div>
                  <div className="grid grid-cols-12 items-center py-1">
                    <span className="col-span-5 text-slate-600">Định mức NCKH</span>
                    <span className="col-span-7 text-slate-600">{profileData.nckhQuota}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 3: BẢO MẬT & TÀI KHOẢN                                       */}
          {/* =============================================================== */}
          {activeSection === 'bao_mat' && (
            <div className="space-y-5 text-[12.5px]">
              <div className="space-y-3">
                <h3 className="text-[13.5px] font-semibold text-slate-800">
                  Thông Tin Đăng Nhập SSO TDU
                </h3>
                <div className="grid grid-cols-12 items-center py-1">
                  <span className="col-span-5 text-slate-600">Tên đăng nhập</span>
                  <span className="col-span-7 font-mono text-slate-700">
                    {currentAccount.username}
                  </span>
                </div>
                <div className="grid grid-cols-12 items-center py-1">
                  <span className="col-span-5 text-slate-600">Xác thực 2 lớp (2FA)</span>
                  <span className="col-span-7 text-[#007b6e] font-medium">
                    Đang bật qua email @tdu.edu.vn
                  </span>
                </div>
                <div className="grid grid-cols-12 items-center py-1">
                  <span className="col-span-5 text-slate-600">Lần đăng nhập gần nhất</span>
                  <span className="col-span-7 font-mono text-slate-600">
                    {currentAccount.lastLogin || '18/10/2024 08:30'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 4: YÊU CẦU CẬP NHẬT THÔNG TIN                                */}
          {/* =============================================================== */}
          {activeSection === 'yeu_cau_cap_nhat' && (
            <form onSubmit={handleSendUpdateRequest} className="space-y-4 text-[12.5px]">
              <p className="text-slate-500 text-[12px]">
                Nếu có thay đổi về Số tài khoản ngân hàng nhận thù lao, Học hàm/Học vị, Số CCCD hoặc Mã số thuế TNCN, vui lòng gửi yêu cầu kèm minh chứng để Phòng Tổ chức & Phòng Tài chính cập nhật.
              </p>

              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1">
                  Hạng mục thông tin cần điều chỉnh
                </label>
                <select
                  value={updateRequestType}
                  onChange={(e) => setUpdateRequestType(e.target.value)}
                  className="w-full h-[34px] border border-slate-200 rounded-lg px-3 text-[12.5px] bg-slate-50/70 focus:bg-white focus:outline-none focus:border-[#007b6e]"
                >
                  <option value="stk_ngan_hang">Thay đổi Số tài khoản / Ngân hàng nhận thù lao</option>
                  <option value="hoc_vi">Cập nhật Học hàm / Học vị & Hệ số thanh toán mới</option>
                  <option value="cccd_mst">Cập nhật Số căn cước công dân / Mã số thuế TNCN</option>
                  <option value="don_vi">Điều chuyển Khoa / Bộ môn / Đơn vị công tác</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1">
                  Nội dung đề nghị cập nhật chi tiết
                </label>
                <textarea
                  rows={3}
                  required
                  value={updateRequestNote}
                  onChange={(e) => setUpdateRequestNote(e.target.value)}
                  placeholder="Nhập thông tin mới cần cập nhật (VD: Số TK mới, số Quyết định công nhận học vị...)"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-[12.5px] bg-slate-50/70 focus:bg-white focus:outline-none focus:border-[#007b6e] resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="h-[32px] px-4 rounded-lg bg-[#007b6e] hover:bg-[#00665b] text-white text-[12px] font-medium cursor-pointer transition-colors"
                >
                  Gửi yêu cầu cập nhật
                </button>
              </div>
            </form>
          )}

          {/* =============================================================== */}
          {/* TAB 5: THIẾT BỊ                                                  */}
          {/* =============================================================== */}
          {activeSection === 'thiet_bi' && (
            <div className="space-y-3 text-[12.5px]">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800">
                    Windows PC · Trình duyệt Chrome (Phiên hiện tại)
                  </div>
                  <div className="text-[11.5px] text-slate-500 mt-0.5">
                    Cần Thơ, Việt Nam · Hoạt động vừa xong
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#d3e3fd] text-[#0b57d0] text-[11px] font-semibold">
                  Hiện tại
                </span>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 6: GIAO DIỆN & HIỂN THỊ                                      */}
          {/* =============================================================== */}
          {activeSection === 'giao_dien' && (
            <div className="space-y-4 text-[12.5px]">
              <div>
                <h3 className="text-[13.5px] font-semibold text-slate-800 mb-2">
                  Tỷ lệ thu phóng giao diện (Zoom)
                </h3>
                <p className="text-[12px] text-slate-500 mb-3">
                  Điều chỉnh kích thước hiển thị bảng biểu và phông chữ phù hợp với độ phân giải màn hình.
                </p>
                <div className="flex items-center flex-wrap gap-2">
                  {[
                    { val: 1.0, label: '100%' },
                    { val: 1.1, label: '110%' },
                    { val: 1.25, label: '125% (Mặc định)' },
                    { val: 1.35, label: '135%' },
                    { val: 1.5, label: '150%' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleZoomChange(opt.val)}
                      className={`h-[32px] px-3.5 rounded-lg border text-[12px] cursor-pointer transition-colors ${
                        zoomLevel === opt.val
                          ? 'bg-[#007b6e] text-white border-[#007b6e] font-medium'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 7: CÁC THÔNG BÁO                                             */}
          {/* =============================================================== */}
          {activeSection === 'thong_bao' && (
            <div className="space-y-3 text-[12.5px]">
              {[
                {
                  key: 'newSchedule' as const,
                  label: 'Thông báo khi có bảng kê giờ giảng / khảo thí / NCKH mới',
                },
                {
                  key: 'lecturerFeedback' as const,
                  label: 'Thông báo khi giảng viên gửi phản hồi hoặc xác nhận số liệu',
                },
                {
                  key: 'paymentApproved' as const,
                  label: 'Thông báo khi hồ sơ đủ điều kiện lập lệnh chi tài chính',
                },
                {
                  key: 'uncTransferred' as const,
                  label: 'Thông báo khi hoàn tất chuyển khoản Ủy nhiệm chi (UNC)',
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between py-2 border-b border-slate-100 cursor-pointer"
                >
                  <span className="text-slate-700">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={notifSettings[item.key]}
                    onChange={() =>
                      setNotifSettings((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                    }
                    className="rounded border-slate-300 text-[#007b6e] focus:ring-0 cursor-pointer w-4 h-4"
                  />
                </label>
              ))}
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 8: THÔNG TIN ỨNG DỤNG                                        */}
          {/* =============================================================== */}
          {activeSection === 'thong_tin_ung_dung' && (
            <div className="space-y-3 text-[12.5px] text-slate-600">
              <div className="grid grid-cols-12 py-1">
                <span className="col-span-5">Tên hệ thống</span>
                <span className="col-span-7 text-slate-800 font-medium">
                  Hệ thống Quản lý & Thanh toán Giờ giảng TDU
                </span>
              </div>
              <div className="grid grid-cols-12 py-1">
                <span className="col-span-5">Đơn vị vận hành</span>
                <span className="col-span-7">
                  Trường Đại học Tây Đô (Phòng CNTT · Phòng Đào tạo · Phòng Tài chính)
                </span>
              </div>
              <div className="grid grid-cols-12 py-1">
                <span className="col-span-5">Phiên bản</span>
                <span className="col-span-7 font-mono">v2.4.0 (2024 - 2025)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};

