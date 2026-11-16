import React from 'react';
import { DepartmentUnit } from '../types';
import {
  IconGiangDay,
  IconNghienCuuKH,
  IconNgoaiGio,
  IconThanhToanGroup,
  IconTraCuuGroup,
  IconBaoCaoGroup,
  IconHeThong,
} from './Sidebar3DIcons';

interface HomePageProps {
  onNavigate: (itemKey: string, department?: DepartmentUnit) => void;
  [key: string]: any;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const menuItems = [
    {
      id: 'thanh_toan_gio_giang',
      title: 'Thanh toán giờ giảng',
      icon: IconGiangDay,
      action: () => onNavigate('ke_khai_upload', 'dao_tao'),
    },
    {
      id: 'nghien_cuu_khoa_hoc',
      title: 'Nghiên cứu khoa học',
      icon: IconNghienCuuKH,
      action: () => onNavigate('ke_khai_upload', 'nckh'),
    },
    {
      id: 'cong_tac_khac',
      title: 'Công tác khác',
      icon: IconNgoaiGio,
      action: () => onNavigate('ke_khai_upload', 'cong_tac_khac'),
    },
    {
      id: 'thanh_toan',
      title: 'Thanh toán',
      icon: IconThanhToanGroup,
      action: () => onNavigate('tong_thanh_toan'),
    },
    {
      id: 'tra_cuu_phan_hoi',
      title: 'Tra cứu phản hồi',
      icon: IconTraCuuGroup,
      action: () => onNavigate('tra_cuu_giang_vien'),
    },
    {
      id: 'bao_cao',
      title: 'Báo cáo',
      icon: IconBaoCaoGroup,
      action: () => onNavigate('nhap_lieu_phu_luc'),
    },
    {
      id: 'he_thong',
      title: 'Hệ thống',
      icon: IconHeThong,
      action: () => onNavigate('he_thong_nguoi_dung'),
    },
  ];

  return (
    <div className="flex-1 w-full h-full min-h-0 overflow-y-auto bg-[#f8fafc] flex flex-col items-center justify-center p-6 sm:p-10 select-none">
      <div className="w-full max-w-[1360px] flex flex-col items-center justify-center gap-7 sm:gap-9">
        
        {/* Title: Danh sách các module (DEMO giao diện) */}
        <div className="text-center">
          <h2 className="text-[19px] sm:text-[22px] font-bold text-slate-800 tracking-tight">
            Danh sách các module{' '}
            <span className="text-slate-500 font-medium text-[16px] sm:text-[18px]">
              (DEMO giao diện)
            </span>
          </h2>
        </div>

        {/* Buttons / Cards tương ứng với các phân hệ */}
        <div className="w-full flex flex-wrap items-center justify-center gap-3.5 sm:gap-5">
          {menuItems.map((item) => {
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

      </div>
    </div>
  );
};
