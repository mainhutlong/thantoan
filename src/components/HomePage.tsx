import React from 'react';
import { DepartmentUnit, UserAccount, UserRole } from '../types';
import {
  IconGiangDay,
  IconNghienCuuKH,
  IconNgoaiGio,
  IconThanhToanGroup,
  IconTraCuuGroup,
  IconBaoCaoGroup,
  IconHeThong,
} from './Sidebar3DIcons';
import { ShieldAlert } from 'lucide-react';

interface HomePageProps {
  onNavigate: (itemKey: string, department?: DepartmentUnit) => void;
  currentAccount?: UserAccount;
  currentRole?: UserRole;
  [key: string]: any;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  currentAccount,
  currentRole,
}) => {
  const email = (currentAccount?.email || '').toLowerCase().trim();
  const dept = (currentAccount?.departmentName || '').toLowerCase().trim();
  const chucVu = (currentAccount?.chucVu || currentAccount?.assignedModule || '').toLowerCase().trim();
  const roleType = (currentAccount?.role || '').toLowerCase();

  // Kiểm tra nếu tài khoản hiện tại được thêm vào vai trò Quản trị viên hệ thống
  let isCustomSuperAdmin = false;
  try {
    const customRoles = JSON.parse(localStorage.getItem('tdu_custom_role_members') || '{}');
    const adminMembers = customRoles['quan_tri_vien_he_thong'] || [];
    const myCode = (currentAccount?.maGV || '').toLowerCase().trim();
    if (
      adminMembers.some(
        (m: any) =>
          (m.email && m.email.toLowerCase().trim() === email) ||
          (m.code && m.code.toLowerCase().trim() === myCode)
      )
    ) {
      isCustomSuperAdmin = true;
    }

    // Kiểm tra thêm từ cache toàn bộ roles 'tdu_roles_state_v3'
    const fullRolesCache = JSON.parse(localStorage.getItem('tdu_roles_state_v3') || '[]');
    const adminRoleObj = fullRolesCache.find(
      (r: any) => r.id === 'quan_tri_vien_he_thong' || r.code === 'QUAN_TRI_VIEN_HE_THONG'
    );
    if (adminRoleObj && Array.isArray(adminRoleObj.members)) {
      if (
        adminRoleObj.members.some(
          (m: any) =>
            (m.email && m.email.toLowerCase().trim() === email) ||
            (m.code && m.code.toLowerCase().trim() === myCode)
        )
      ) {
        isCustomSuperAdmin = true;
      }
    }
  } catch {}

  const userRoles: string[] = (currentAccount as any)?.roles || [];

  // 1. Quản trị viên hệ thống (Toàn quyền) - Admin, mnlong, lvlinh hoặc người dùng được thêm vào vai trò Quản trị
  const isSuperAdmin =
    email === 'mnlong@tdu.edu.vn' ||
    email.includes('mainhutlong') ||
    email === 'lvlinh@tdu.edu.vn' ||
    email.includes('lvlinh') ||
    currentRole === 'admin' ||
    roleType === 'admin' ||
    userRoles.includes('QUAN_TRI_VIEN_HE_THONG') ||
    isCustomSuperAdmin;

  // 2. Phòng Quản lý Đào tạo
  const isDaoTao =
    !isSuperAdmin &&
    (dept.includes('đào tạo') || dept.includes('dao tao'));

  // 3. Phòng Quản lý khoa học và Hợp tác quốc tế
  const isQLKH =
    !isSuperAdmin &&
    (dept.includes('khoa học') || dept.includes('qlkh') || dept.includes('hợp tác quốc tế'));

  // 4. Phòng Tài chính - Kế hoạch
  const isTaiChinh =
    !isSuperAdmin &&
    (dept.includes('tài chính') || dept.includes('kế hoạch') || dept.includes('tai chinh'));

  // 5. Cán bộ có chức vụ Giảng viên (kể cả lvlinh, cán bộ khoa, chức vụ Giảng viên)
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

  // Toàn bộ danh mục 7 module
  const ALL_MODULE_ITEMS = [
    {
      id: 'thanh_toan_gio_giang',
      title: 'Thanh toán giờ giảng',
      icon: IconGiangDay,
      visible: isSuperAdmin || isTaiChinh || isDaoTao,
      action: () => onNavigate('ke_khai_upload', 'dao_tao'),
    },
    {
      id: 'nghien_cuu_khoa_hoc',
      title: 'Nghiên cứu khoa học',
      icon: IconNghienCuuKH,
      visible: isSuperAdmin || isTaiChinh || isQLKH,
      action: () => onNavigate('ke_khai_upload', 'nckh'),
    },
    {
      id: 'cong_tac_khac',
      title: 'Công tác khác',
      icon: IconNgoaiGio,
      visible: isSuperAdmin || isTaiChinh,
      action: () => onNavigate('ke_khai_upload', 'cong_tac_khac'),
    },
    {
      id: 'thanh_toan',
      title: 'Thanh toán',
      icon: IconThanhToanGroup,
      visible: isSuperAdmin || isTaiChinh,
      action: () => onNavigate('tong_thanh_toan'),
    },
    {
      id: 'tra_cuu_phan_hoi',
      title: 'Tra cứu và phản hồi',
      icon: IconTraCuuGroup,
      visible: isSuperAdmin || isTaiChinh || isDaoTao || isQLKH || isGiangVien,
      action: () => {
        if (isDaoTao || isQLKH) {
          onNavigate('quan_ly_phan_hoi');
        } else {
          onNavigate('tra_cuu_giang_vien');
        }
      },
    },
    {
      id: 'bao_cao',
      title: 'Báo cáo',
      icon: IconBaoCaoGroup,
      visible: isSuperAdmin || isTaiChinh,
      action: () => onNavigate('nhap_lieu_phu_luc'),
    },
    {
      id: 'he_thong',
      title: 'Hệ thống',
      icon: IconHeThong,
      visible: isSuperAdmin,
      action: () => onNavigate('he_thong_nguoi_dung'),
    },
  ];

  // Lọc chỉ hiển thị các module người dùng được phân quyền
  const visibleMenuItems = ALL_MODULE_ITEMS.filter((item) => item.visible);

  return (
    <div className="flex-1 w-full h-full min-h-0 overflow-y-auto bg-[#f8fafc] flex flex-col items-center justify-center p-6 sm:p-10 select-none">
      <div className="w-full max-w-[1360px] flex flex-col items-center justify-center gap-7 sm:gap-9">
        {/* Title Bar */}
        <div className="text-center">
          <h2 className="text-[19px] sm:text-[22px] font-bold text-slate-800 tracking-tight">
            Danh sách các phân hệ module
          </h2>
          <p className="text-[12.5px] sm:text-[13px] text-slate-500 mt-1">
            Hiển thị các phân hệ bạn được phân quyền truy cập ({visibleMenuItems.length} phân hệ)
          </p>
        </div>

        {/* Buttons / Cards tương ứng với các phân hệ được phân quyền */}
        {visibleMenuItems.length > 0 ? (
          <div className="w-full flex flex-wrap items-center justify-center gap-3.5 sm:gap-5">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-[150px] h-[160px] sm:w-[165px] sm:h-[175px] bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center p-3.5 sm:p-4 text-center group"
                >
                  {/* Icon to rõ ràng trong ô trắng */}
                  <div className="w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-center group-hover:scale-108 transition-transform duration-200">
                    <Icon size={64} />
                  </div>
                  <span className="mt-2.5 text-[13.5px] sm:text-[14px] font-semibold text-slate-800 group-hover:text-[#005325] transition-colors leading-snug">
                    {item.title}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-[480px] text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-[15px] font-bold text-slate-800 mb-1">
              Chưa có phân hệ chuyên môn
            </h3>
            <p className="text-[12.5px] text-slate-500 leading-relaxed">
              Tài khoản của bạn thuộc đơn vị{' '}
              <span className="font-semibold text-slate-700">
                {currentAccount?.departmentName || 'Trường Đại học Tây Đô'}
              </span>
              , hiện tại chưa được cấp quyền quản trị các phân hệ tính thù lao.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
