import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

// 1. Trang chủ / Thống kê: 3D glossy soft blue window/tiles icon with 4 square quadrants
export const IconTrangChu: React.FC<IconProps> = ({ size = 22, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="tc_bg" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#93C5FD" />
        <stop offset="0.5" stopColor="#60A5FA" />
        <stop offset="1" stopColor="#3B82F6" />
      </linearGradient>
      <linearGradient id="tc_gloss" x1="6" y1="6" x2="18" y2="18" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" stopOpacity="0.8" />
        <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.1" />
      </linearGradient>
      <filter id="tc_shadow" x="2" y="2" width="32" height="32" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#1D4ED8" floodOpacity="0.25" />
      </filter>
    </defs>
    <rect x="4" y="4" width="28" height="28" rx="7" fill="url(#tc_bg)" filter="url(#tc_shadow)" />
    <rect x="7" y="7" width="9.5" height="9.5" rx="2.5" fill="#FFFFFF" fillOpacity="0.9" />
    <rect x="19.5" y="7" width="9.5" height="9.5" rx="2.5" fill="#FFFFFF" fillOpacity="0.75" />
    <rect x="7" y="19.5" width="9.5" height="9.5" rx="2.5" fill="#FFFFFF" fillOpacity="0.75" />
    <rect x="19.5" y="19.5" width="9.5" height="9.5" rx="2.5" fill="#FFFFFF" fillOpacity="0.9" />
    <path d="M4 11C4 7.13401 7.13401 4 11 4H25C21 4 11 9 8 16L4 11Z" fill="url(#tc_gloss)" />
  </svg>
);

// 2. Giờ giảng dạy: 3D clipboard / certificate with blue and yellow accents and magnifying glass
export const IconGiangDay: React.FC<IconProps> = ({ size = 22, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="gd_gold" x1="6" y1="6" x2="24" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE047" />
        <stop offset="0.7" stopColor="#EAB308" />
        <stop offset="1" stopColor="#CA8A04" />
      </linearGradient>
    </defs>
    <rect x="6" y="6" width="20" height="25" rx="3.5" fill="url(#gd_gold)" />
    <rect x="11" y="4" width="10" height="4" rx="1.5" fill="#475569" />
    <circle cx="16" cy="5" r="1" fill="#FFFFFF" />

    <rect x="8.5" y="10" width="15" height="18" rx="2" fill="#FFFFFF" />
    <line x1="11" y1="14" x2="21" y2="14" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="11" y1="17.5" x2="19" y2="17.5" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="11" y1="21" x2="17" y2="21" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

    <circle cx="23" cy="22" r="6.5" fill="#BAE6FD" fillOpacity="0.8" stroke="#0284C7" strokeWidth="2.2" />
    <line x1="28" y1="27" x2="32" y2="31" stroke="#0369A1" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// 3. Coi thi, chấm thi, ra đề: 3D exam paper with checkmark & blue pencil
export const IconCoiThi: React.FC<IconProps> = ({ size = 22, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="ct_paper" x1="5" y1="5" x2="25" y2="29" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#E0F2FE" />
      </linearGradient>
      <linearGradient id="ct_pen" x1="18" y1="18" x2="31" y2="31" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="1" stopColor="#0284C7" />
      </linearGradient>
    </defs>
    {/* Exam Sheet */}
    <rect x="5" y="5" width="22" height="26" rx="3.5" fill="url(#ct_paper)" stroke="#93C5FD" strokeWidth="1" />
    <rect x="9" y="10" width="14" height="2" rx="1" fill="#3B82F6" />
    <rect x="9" y="14" width="10" height="1.8" rx="0.9" fill="#94A3B8" />
    <rect x="9" y="18" width="12" height="1.8" rx="0.9" fill="#94A3B8" />

    {/* Green A+ Grade badge */}
    <circle cx="20" cy="18" r="4.5" fill="#22C55E" />
    <path d="M18 19L19.5 20.5L22 17" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />

    {/* Blue Pen */}
    <path d="M25 15L30 20L21 29L16 29L16 24L25 15Z" fill="url(#ct_pen)" />
    <path d="M24 16L29 21" stroke="#BAE6FD" strokeWidth="1" />
  </svg>
);

// 4. Công tác tuyển sinh: 3D resume paper with magnifying glass and green checkmark
export const IconTuyenDung: React.FC<IconProps> = ({ size = 22, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="td_paper" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#93C5FD" />
        <stop offset="1" stopColor="#60A5FA" />
      </linearGradient>
    </defs>
    <rect x="6" y="5" width="20" height="25" rx="3.5" fill="url(#td_paper)" />
    <circle cx="12" cy="11" r="2.5" fill="#FFFFFF" />
    <rect x="16" y="10" width="7" height="2" rx="1" fill="#FFFFFF" />
    <rect x="10" y="16" width="13" height="1.8" rx="0.9" fill="#E0E7FF" />
    <rect x="10" y="20" width="9" height="1.8" rx="0.9" fill="#E0E7FF" />

    <circle cx="21" cy="20" r="7" fill="#DBEAFE" fillOpacity="0.8" stroke="#3B82F6" strokeWidth="2.5" />
    <line x1="26" y1="25" x2="31" y2="30" stroke="#1D4ED8" strokeWidth="3" strokeLinecap="round" />

    <circle cx="17" cy="24" r="4" fill="#22C55E" />
    <path d="M15 24L16.5 25.5L19 22.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 5. Nghiên cứu Khoa học: 3D scientific flask with bubbling liquid & science crystal
export const IconNghienCuuKH: React.FC<IconProps> = ({ size = 22, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="nc_glass" x1="8" y1="6" x2="28" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#E9D5FF" />
        <stop offset="1" stopColor="#C084FC" />
      </linearGradient>
      <linearGradient id="nc_liquid" x1="6" y1="18" x2="30" y2="31" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A855F7" />
        <stop offset="0.6" stopColor="#7E22CE" />
        <stop offset="1" stopColor="#581C87" />
      </linearGradient>
    </defs>
    {/* Flask Neck */}
    <rect x="15" y="4" width="6" height="8" rx="1.5" fill="url(#nc_glass)" />
    <rect x="13.5" y="4" width="9" height="2.5" rx="1" fill="#9333EA" />

    {/* Flask Triangular Body */}
    <path d="M15 12L7 26C5.5 28.5 7.3 31 10.2 31H25.8C28.7 31 30.5 28.5 29 26L21 12H15Z" fill="url(#nc_glass)" />

    {/* Glowing Purple Liquid Inside */}
    <path d="M10.2 20C13 18.5 17 21 21 19.5C23 18.8 24.5 19.2 25.8 20L29 26C30.5 28.5 28.7 31 25.8 31H10.2C7.3 31 5.5 28.5 7 26L10.2 20Z" fill="url(#nc_liquid)" />

    {/* Bubbles */}
    <circle cx="14" cy="24" r="1.8" fill="#F3E8FF" />
    <circle cx="21" cy="26" r="1.2" fill="#F3E8FF" />
    <circle cx="18" cy="16" r="1.5" fill="#E9D5FF" />
  </svg>
);

// 6. Cố vấn học tập: 3D avatar group / ID profile (multi-color figures)
export const IconHoSo: React.FC<IconProps> = ({ size = 22, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <radialGradient id="hs_center" cx="50%" cy="40%" r="50%">
        <stop stopColor="#FFE4E6" />
        <stop offset="1" stopColor="#FECDD3" />
      </radialGradient>
      <linearGradient id="hs_suit" x1="12" y1="20" x2="24" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="1" stopColor="#0284C7" />
      </linearGradient>
    </defs>
    <circle cx="9" cy="16" r="3" fill="#FBBF24" />
    <path d="M5 26C5 22.7 7 21 9 21C11 21 13 22.7 13 26" fill="#F59E0B" />

    <circle cx="27" cy="16" r="3" fill="#F472B6" />
    <path d="M23 26C23 22.7 25 21 27 21C29 21 31 22.7 31 26" fill="#EC4899" />

    <circle cx="18" cy="13" r="4.5" fill="url(#hs_center)" />
    <path d="M14 11C14 8 16 7 18 7C20 7 22 8 22 11C21 10.5 19 10 18 10C17 10 15 10.5 14 11Z" fill="#4B5563" />
    <path d="M11 28C11 23 14 20 18 20C22 20 25 23 25 28H11Z" fill="url(#hs_suit)" />
    <path d="M16 20L18 24L20 20H16Z" fill="#FFFFFF" />
    <path d="M17.5 24L18 28L18.5 24H17.5Z" fill="#EF4444" />
  </svg>
);

// 7. Công tác khác: 3D calendar with stopwatch / clock
export const IconNgoaiGio: React.FC<IconProps> = ({ size = 22, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="ng_cal" x1="4" y1="5" x2="26" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A78BFA" />
        <stop offset="0.7" stopColor="#8B5CF6" />
        <stop offset="1" stopColor="#6D28D9" />
      </linearGradient>
      <radialGradient id="ng_clock" cx="50%" cy="50%" r="50%">
        <stop stopColor="#FEF08A" />
        <stop offset="0.8" stopColor="#FACC15" />
        <stop offset="1" stopColor="#EAB308" />
      </radialGradient>
    </defs>
    <rect x="5" y="7" width="22" height="23" rx="4" fill="url(#ng_cal)" />
    <rect x="8" y="12" width="16" height="15" rx="2" fill="#FFFFFF" fillOpacity="0.9" />
    <line x1="9" y1="5" x2="9" y2="8" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="16" y1="5" x2="16" y2="8" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="23" y1="5" x2="23" y2="8" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />

    <circle cx="24" cy="23" r="7.5" fill="url(#ng_clock)" stroke="#B45309" strokeWidth="1.2" />
    <circle cx="24" cy="23" r="1.2" fill="#78350F" />
    <line x1="24" y1="23" x2="24" y2="19" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="24" y1="23" x2="27" y2="24" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 8. Quản lý thanh toán: 3D org chart / database hierarchy with yellow cubes
export const IconDanhMuc: React.FC<IconProps> = ({ size = 22, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="dm_cube" x1="11" y1="5" x2="25" y2="17" gradientUnits="userSpaceOnUse">
        <stop stopColor="#60A5FA" />
        <stop offset="0.7" stopColor="#3B82F6" />
        <stop offset="1" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="dm_gold" x1="4" y1="20" x2="16" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FBBF24" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
    </defs>
    <rect x="12" y="5" width="12" height="10" rx="2.5" fill="url(#dm_cube)" />
    <rect x="14" y="8" width="8" height="2" rx="1" fill="#FFFFFF" fillOpacity="0.8" />

    <path d="M18 15V20H8V23M18 20H28V23" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

    <rect x="4" y="23" width="9" height="8" rx="2" fill="url(#dm_gold)" />
    <rect x="13.5" y="23" width="9" height="8" rx="2" fill="url(#dm_gold)" />
    <rect x="23" y="23" width="9" height="8" rx="2" fill="url(#dm_gold)" />
  </svg>
);

// 9. Đề xuất / Phản hồi: 3D blue document with red pushpin badge
export const IconDeXuat: React.FC<IconProps> = ({ size = 22, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="dx_paper" x1="6" y1="4" x2="28" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#60A5FA" />
        <stop offset="0.6" stopColor="#3B82F6" />
        <stop offset="1" stopColor="#2563EB" />
      </linearGradient>
      <linearGradient id="dx_pin" x1="22" y1="18" x2="31" y2="29" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F87171" />
        <stop offset="0.7" stopColor="#EF4444" />
        <stop offset="1" stopColor="#B91C1C" />
      </linearGradient>
    </defs>
    <rect x="6" y="5" width="22" height="26" rx="4" fill="url(#dx_paper)" />
    <path d="M10 11H24" stroke="#DBEAFE" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M10 16H24" stroke="#DBEAFE" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M10 21H18" stroke="#DBEAFE" strokeWidth="1.8" strokeLinecap="round" />

    <path d="M22 5L28 11H23C22.4477 11 22 10.5523 22 10V5Z" fill="#BFDBFE" />

    <circle cx="26" cy="24" r="5.5" fill="url(#dx_pin)" />
    <circle cx="25" cy="23" r="2" fill="#FECACA" fillOpacity="0.8" />
    <path d="M22 28L20 31" stroke="#991B1B" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 10. Chi trả tài chính: 3D purple ID card printer / card dispenser with badge emerging
export const IconInThe: React.FC<IconProps> = ({ size = 22, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="it_purple" x1="5" y1="12" x2="31" y2="29" gradientUnits="userSpaceOnUse">
        <stop stopColor="#C084FC" />
        <stop offset="0.6" stopColor="#A855F7" />
        <stop offset="1" stopColor="#7E22CE" />
      </linearGradient>
    </defs>
    <rect x="5" y="14" width="26" height="15" rx="4" fill="url(#it_purple)" />
    <rect x="9" y="16" width="18" height="2" rx="1" fill="#4A044E" />

    <rect x="10" y="6" width="16" height="12" rx="2.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.8" />
    <circle cx="14" cy="11" r="2" fill="#0284C7" />
    <rect x="18" y="9.5" width="6" height="1.5" rx="0.75" fill="#64748B" />
    <rect x="18" y="12" width="4" height="1.5" rx="0.75" fill="#64748B" />

    <circle cx="8.5" cy="23" r="1.2" fill="#22C55E" />
    <circle cx="12" cy="23" r="1.2" fill="#FBBF24" />
    <rect x="16" y="22" width="11" height="2" rx="1" fill="#FFFFFF" fillOpacity="0.4" />
  </svg>
);

// 11. Văn bản / Biên bản nghiệm thu: 3D blue inbox tray box with document
export const IconVanBan: React.FC<IconProps> = ({ size = 22, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="vb_box" x1="4" y1="14" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="0.6" stopColor="#0284C7" />
        <stop offset="1" stopColor="#0369A1" />
      </linearGradient>
      <linearGradient id="vb_paper" x1="9" y1="5" x2="27" y2="19" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#E2E8F0" />
      </linearGradient>
      <linearGradient id="vb_front" x1="4" y1="18" x2="32" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="1" stopColor="#0284C7" />
      </linearGradient>
    </defs>
    <rect x="8" y="5" width="20" height="15" rx="2.5" fill="url(#vb_paper)" stroke="#CBD5E1" strokeWidth="0.75" />
    <line x1="12" y1="9" x2="24" y2="9" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="12" y1="12.5" x2="21" y2="12.5" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />

    <path d="M4 15C4 13.3431 5.34315 12 7 12H29C30.6569 12 32 13.3431 32 15V27C32 29.2091 30.2091 31 28 31H8C5.79086 31 4 29.2091 4 27V15Z" fill="url(#vb_box)" />
    <path d="M4 19L9 21C10 21.5 11 23 13 23H23C25 23 26 21.5 27 21L32 19V27C32 29.2091 30.2091 31 28 31H8C5.79086 31 4 29.2091 4 27V19Z" fill="url(#vb_front)" />
    <path d="M5 20L9.5 22C11 22.8 12.5 23.5 14 23.5H22C23.5 23.5 25 22.8 26.5 22L31 20" stroke="#BAE6FD" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

// 12. Quản lý tài khoản & Quyền: 3D blue cogwheel/gear with center shield
export const IconHeThong: React.FC<IconProps> = ({ size = 22, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="ht_gear" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="0.5" stopColor="#0284C7" />
        <stop offset="1" stopColor="#0369A1" />
      </linearGradient>
      <linearGradient id="ht_inner" x1="12" y1="12" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#BAE6FD" />
      </linearGradient>
    </defs>
    <path
      d="M16 4H20L21 8.5C22 9 23 9.7 24 10.5L28 9L30.5 12.5L28 16C28.3 17 28.3 18.5 28 20L30.5 23.5L28 27L24 25.5C23 26.3 22 27 21 27.5L20 32H16L15 27.5C14 27 13 26.3 12 25.5L8 27L5.5 23.5L8 20C7.7 18.5 7.7 17 8 16L5.5 12.5L8 9L12 10.5C13 9.7 14 9 15 8.5L16 4Z"
      fill="url(#ht_gear)"
    />
    <circle cx="18" cy="18" r="7.5" fill="#0C4A6E" />
    <circle cx="18" cy="18" r="5.5" fill="url(#ht_inner)" />
    <line x1="15" y1="15" x2="21" y2="21" stroke="#0369A1" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="15.5" cy="15.5" r="1.5" fill="#0284C7" />
  </svg>
);

// 13. Developer: 3D blue folder with code symbol <> inside
export const IconDeveloper: React.FC<IconProps> = ({ size = 22, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="dev_back" x1="4" y1="6" x2="32" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="dev_front" x1="4" y1="14" x2="32" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#60A5FA" />
        <stop offset="1" stopColor="#2563EB" />
      </linearGradient>
    </defs>
    <path d="M4 10C4 8.34315 5.34315 7 7 7H14L17 10H29C30.6569 10 32 11.3431 32 13V26C32 28.2091 30.2091 30 28 30H8C5.79086 30 4 28.2091 4 26V10Z" fill="url(#dev_back)" />
    <path d="M4 15C4 13.8954 4.89543 13 6 13H30C31.1046 13 32 13.8954 32 15V26C32 28.2091 30.2091 30 28 30H8C5.79086 30 4 28.2091 4 26V15Z" fill="url(#dev_front)" />
    <path d="M14 19L11 21.5L14 24" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 19L25 21.5L22 24" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="19.5" y1="18.5" x2="16.5" y2="24.5" stroke="#BAE6FD" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 14. Lotus Emblem Logo: Blooming pink/magenta lotus flower with green base
export const LotusEmblem: React.FC<IconProps> = ({ size = 42, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="46" fill="#FFFFFF" stroke="#008848" strokeWidth="2.5" />
    <path d="M50 20 C47 28 44 38 50 56 C56 38 53 28 50 20 Z" fill="#E11D48" />
    <path d="M48 24 C38 30 26 40 22 48 C32 50 42 46 48 40 Z" fill="#F43F5E" />
    <path d="M52 24 C62 30 74 40 78 48 C68 50 58 46 52 40 Z" fill="#F43F5E" />
    <path d="M32 38 C22 42 16 52 18 56 C28 58 36 52 42 46 Z" fill="#E11D48" />
    <path d="M68 38 C78 42 84 52 82 56 C72 58 64 52 58 46 Z" fill="#E11D48" />
    <path d="M26 56 C38 66 62 66 74 56 C68 68 32 68 26 56 Z" fill="#008848" />
    <path d="M40 60 C46 64 54 64 60 60 C56 66 44 66 40 60 Z" fill="#006834" />
    <circle cx="43" cy="74" r="2" fill="#008848" />
    <circle cx="50" cy="75" r="2.5" fill="#008848" />
    <circle cx="57" cy="74" r="2" fill="#008848" />
  </svg>
);

// 15. Nhóm Thanh toán: 3D emerald & gold credit card + coin badge
export const IconThanhToanGroup: React.FC<IconProps> = ({ size = 22, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="ttg_card" x1="4" y1="8" x2="32" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10B981" />
        <stop offset="0.6" stopColor="#059669" />
        <stop offset="1" stopColor="#047857" />
      </linearGradient>
      <linearGradient id="ttg_coin" x1="20" y1="18" x2="32" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE047" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
    </defs>
    <rect x="4" y="8" width="26" height="18" rx="4" fill="url(#ttg_card)" />
    <rect x="4" y="12" width="26" height="4" fill="#064E3B" fillOpacity="0.4" />
    <rect x="8" y="19" width="6" height="3" rx="1" fill="#FEF3C7" fillOpacity="0.9" />
    <circle cx="26" cy="24" r="6" fill="url(#ttg_coin)" stroke="#FFFFFF" strokeWidth="1.5" />
    <path d="M26 21V27M24.5 22.5H27.5C28 22.5 28.5 23 28.5 23.5C28.5 24 28 24.5 27.5 24.5H24.5C24 24.5 23.5 25 23.5 25.5C23.5 26 24 26.5 24.5 26.5H27.5" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// 16. Nhóm Tra cứu & Phản hồi: 3D blue search magnifier + chat bubble
export const IconTraCuuGroup: React.FC<IconProps> = ({ size = 22, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="tcg_bg" x1="4" y1="4" x2="30" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="0.6" stopColor="#0284C7" />
        <stop offset="1" stopColor="#0369A1" />
      </linearGradient>
    </defs>
    {/* Chat bubble base */}
    <path d="M6 8C6 5.79086 7.79086 4 10 4H26C28.2091 4 30 5.79086 30 8V20C30 22.2091 28.2091 24 26 24H14L8 28V24H10C7.79086 24 6 22.2091 6 20V8Z" fill="url(#tcg_bg)" />
    {/* Magnifying glass inside */}
    <circle cx="16" cy="13" r="4.5" fill="#FFFFFF" fillOpacity="0.25" stroke="#FFFFFF" strokeWidth="2" />
    <line x1="19.5" y1="16.5" x2="23" y2="20" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

// 17. Nhóm Báo cáo: 3D purple/indigo analytical charts & growth arrow
export const IconBaoCaoGroup: React.FC<IconProps> = ({ size = 22, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="bcg_bg" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A855F7" />
        <stop offset="0.6" stopColor="#7E22CE" />
        <stop offset="1" stopColor="#581C87" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="28" height="28" rx="7" fill="url(#bcg_bg)" />
    <rect x="8" y="19" width="4.5" height="9" rx="1.5" fill="#E9D5FF" />
    <rect x="15.5" y="13" width="4.5" height="15" rx="1.5" fill="#FFFFFF" />
    <rect x="23" y="9" width="4.5" height="19" rx="1.5" fill="#FBCFE8" />
    <path d="M8 14L15.5 8.5L23 11L28 6.5" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 18. Người dùng (Hệ thống): 3D ID badge with photo & lines
export const IconNguoiDung: React.FC<IconProps> = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="4" fill="#3B82F6" />
    <circle cx="12" cy="9" r="3.5" fill="#FFFFFF" />
    <path d="M6 18C6 15 9 14 12 14C15 14 18 15 18 18" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// 19. Phân quyền theo group: 3D Shield with users
export const IconPhanQuyen: React.FC<IconProps> = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2L4 5V11C4 16.5 7.5 21 12 22C16.5 21 20 16.5 20 11V5L12 2Z" fill="#8B5CF6" />
    <path d="M9 11.5L11 13.5L15 9.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 20. Cấu hình hệ thống: 3D Sliders / Settings controls
export const IconCauHinh: React.FC<IconProps> = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#0284C7" />
    <line x1="5" y1="8" x2="19" y2="8" stroke="#BAE6FD" strokeWidth="2" strokeLinecap="round" />
    <circle cx="9" cy="8" r="2.5" fill="#FFFFFF" />
    <line x1="5" y1="16" x2="19" y2="16" stroke="#BAE6FD" strokeWidth="2" strokeLinecap="round" />
    <circle cx="15" cy="16" r="2.5" fill="#FFFFFF" />
  </svg>
);

// 21. Nhật ký hệ thống: 3D Audit Log / Clock history
export const IconNhatKy: React.FC<IconProps> = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="4" fill="#F59E0B" />
    <circle cx="12" cy="12" r="5.5" stroke="#FFFFFF" strokeWidth="1.8" />
    <path d="M12 9.5V12L14 13.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
