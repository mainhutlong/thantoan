import React from 'react';
import { DepartmentUnit } from '../types';
import {
  IconDanhMuc,
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
      id: 'danh_muc_thong_ke',
      title: 'Danh mục thống kê',
      icon: IconDanhMuc,
      action: () => onNavigate('ke_khai_upload', 'dao_tao'),
    },
    {
      id: 'thanh_toan',
      title: 'Thanh toán',
      icon: IconThanhToanGroup,
      action: () => onNavigate('tong_thanh_toan'),
    },
    {
      id: 'tra_cuu',
      title: 'Tra cứu',
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
      <div className="w-full max-w-5xl flex flex-col items-center justify-center gap-7 sm:gap-9">
        
        {/* Title: Danh sách các module (DEMO giao diện) */}
        <div className="text-center">
          <h2 className="text-[19px] sm:text-[22px] font-bold text-slate-800 tracking-tight">
            Danh sách các module{' '}
            <span className="text-slate-500 font-medium text-[16px] sm:text-[18px]">
              (DEMO giao diện)
            </span>
          </h2>
        </div>

        {/* 5 Launcher Cards: Larger Icons in White Frame */}
        <div className="w-full flex flex-wrap items-center justify-center gap-5 sm:gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className="w-[175px] h-[175px] sm:w-[195px] sm:h-[195px] bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center p-5 text-center group"
              >
                {/* Icon to hơn trong khung */}
                <div className="w-20 h-20 sm:w-22 sm:h-22 flex items-center justify-center group-hover:scale-108 transition-transform duration-200">
                  <Icon size={68} />
                </div>
                <span className="mt-3.5 text-[14.5px] font-semibold text-slate-800 group-hover:text-[#005325] transition-colors leading-snug">
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
