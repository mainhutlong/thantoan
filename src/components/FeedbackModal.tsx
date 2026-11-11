import React, { useState } from 'react';
import { X, Send, AlertCircle, MessageSquare } from 'lucide-react';
import { TDUEmblem } from './TDUEmblem';
import { TeachingRecord, FeedbackItem } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: TeachingRecord | null;
  onSubmitFeedback: (feedback: Omit<FeedbackItem, 'id' | 'ngayGui' | 'trangThai'>) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  record,
  onSubmitFeedback,
}) => {
  const [loaiPhanHoi, setLoaiPhanHoi] = useState<FeedbackItem['loaiPhanHoi']>('sai_so_tiet');
  const [noiDung, setNoiDung] = useState('');

  if (!isOpen || !record) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noiDung.trim()) return;

    onSubmitFeedback({
      teachingRecordId: record.id,
      maGV: record.maGV,
      hoTen: record.hoTen,
      tenHocPhan: record.tenHocPhan,
      loaiPhanHoi,
      noiDung,
    });

    setNoiDung('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded shadow-2xl w-full max-w-lg overflow-hidden border border-slate-300">
        {/* Header #005325 */}
        <div className="bg-[#005325] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-300" />
            <h3 className="font-semibold text-[13.5px]">
              Gửi phản hồi / Khiếu nại sai sót giờ giảng
            </h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-[12.5px]">
          {/* Target course info card */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[12px] space-y-1">
            <div className="font-semibold text-slate-800">{record.tenHocPhan}</div>
            <div className="text-slate-500 flex items-center justify-between text-[11.5px]">
              <span>Mã lớp: {record.maLopHocPhan}</span>
              <span>Số tiết QC: <strong className="text-[#005325]">{record.tongTietQC} tiết</strong></span>
              <span>Thực nhận: <strong className="text-[#005325]">{record.thucNhan.toLocaleString('vi-VN')} đ</strong></span>
            </div>
            <div className="text-[11px] text-slate-400">Giảng viên: {record.hoTen} ({record.maGV}) - {record.khoaBoMon}</div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Loại sai sót cần điều chỉnh *</label>
            <select
              value={loaiPhanHoi}
              onChange={(e) => setLoaiPhanHoi(e.target.value as FeedbackItem['loaiPhanHoi'])}
              className="w-full h-8 px-2.5 border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#005325]"
            >
              <option value="sai_so_tiet">Sai số tiết thực dạy (Lý thuyết / Thực hành)</option>
              <option value="thieu_lop">Thiếu lớp học phần hoặc đợt phụ trách</option>
              <option value="sai_he_so">Sai hệ số lớp đông sinh viên</option>
              <option value="sai_don_gia">Sai đơn giá tiết theo học hàm / học vị</option>
              <option value="khac">Sai thông tin số tài khoản / Khác</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Nội dung phản hồi & Đề nghị điều chỉnh cụ thể *
            </label>
            <textarea
              required
              rows={4}
              value={noiDung}
              onChange={(e) => setNoiDung(e.target.value)}
              placeholder="VD: Số tiết thực hành thực tế là 45 tiết thay vì 30 tiết theo lịch bù ngày 15/04. Kính đề nghị Khoa và Phòng Đào tạo xác minh và cập nhật lại..."
              className="w-full p-2.5 border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#005325]"
            />
          </div>

          <div className="p-2 bg-amber-50 rounded border border-amber-200 text-amber-800 text-[11.5px] flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>Phản hồi sẽ được chuyển trực tiếp đến Đại diện Khoa và Chuyên viên tổng hợp Phòng Đào tạo TDU để kiểm tra, đối soát và điều chỉnh theo quy trình.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded border border-slate-300 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#005325] hover:bg-[#00421e] text-white rounded font-medium flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi phản hồi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
