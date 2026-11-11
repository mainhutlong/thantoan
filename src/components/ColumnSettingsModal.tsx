import React from 'react';
import { X, Check } from 'lucide-react';
import { TDUEmblem } from './TDUEmblem';

interface ColumnSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ColumnSettingsModal: React.FC<ColumnSettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const defaultColumns = [
    { key: 'tt', label: 'Thứ tự (TT)', visible: true },
    { key: 'hoTen', label: 'Họ, chữ đệm và tên Giảng viên', visible: true },
    { key: 'ngaySinh', label: 'Ngày sinh', visible: true },
    { key: 'soCCCD', label: 'Số CCCD', visible: true },
    { key: 'col5', label: 'Mã GV / Học vị & Khoa TDU', visible: true },
    { key: 'col6', label: 'Học phần / Lớp tín chỉ', visible: true },
    { key: 'col7', label: 'Số tiết QC / Đơn giá (VNĐ)', visible: true },
    { key: 'col8', label: 'Tổng thù lao / Thực nhận (VNĐ)', visible: true },
    { key: 'nguoiThucHien', label: 'Người thực hiện', visible: true },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded shadow-xl w-full max-w-md overflow-hidden border border-slate-300">
        <div className="bg-[#005325] text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TDUEmblem size={18} />
            <h3 className="font-semibold text-[13.5px]">Cấu hình cột dữ liệu giờ giảng TDU</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2 text-[12.5px]">
          <p className="text-slate-500 text-[11.5px] mb-2">
            Tùy chỉnh các cột dữ liệu hiển thị trên bảng kê thanh toán giờ giảng Đại học Tây Đô.
          </p>

          <div className="space-y-1.5 divide-y divide-slate-100">
            {defaultColumns.map((col) => (
              <div key={col.key} className="flex items-center justify-between pt-1.5">
                <span className="text-slate-700">{col.label}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <Check className="w-3 h-3 text-[#005325]" />
                  Hiển thị
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#005325] text-white rounded text-[12px] font-medium hover:bg-[#00421e] cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
