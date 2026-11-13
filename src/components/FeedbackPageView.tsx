import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { FeedbackItem } from '../types';

interface FeedbackPageViewProps {
  feedbacks: FeedbackItem[];
  onUpdateFeedbackStatus: (id: string, newStatus: FeedbackItem['trangThai'], responseNote: string) => void;
  onQuickAdjustRecord: (recordId: string) => void;
}

export const FeedbackPageView: React.FC<FeedbackPageViewProps> = ({
  feedbacks,
  onUpdateFeedbackStatus,
  onQuickAdjustRecord,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [responseNote, setResponseNote] = useState('');

  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (filterStatus !== 'all' && fb.trangThai !== filterStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        (fb.hoTen || '').toLowerCase().includes(q) ||
        (fb.maGV || '').toLowerCase().includes(q) ||
        (fb.tenHocPhan || '').toLowerCase().includes(q) ||
        (fb.noiDung || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const countPending = feedbacks.filter((f) => f.trangThai === 'cho_xu_ly').length;
  const countVerified = feedbacks.filter((f) => f.trangThai === 'da_xac_minh').length;
  const countAdjusted = feedbacks.filter((f) => f.trangThai === 'da_dieu_chinh').length;
  const countRejected = feedbacks.filter((f) => f.trangThai === 'tu_choi').length;

  const handleOpenResolve = (fb: FeedbackItem) => {
    if (selectedFeedback?.id === fb.id) {
      setSelectedFeedback(null);
      setResponseNote('');
      return;
    }
    setSelectedFeedback(fb);
    setResponseNote(fb.phanHoiXuLy || '');
  };

  const handleConfirmResolve = (newStatus: FeedbackItem['trangThai']) => {
    if (!selectedFeedback) return;
    onUpdateFeedbackStatus(selectedFeedback.id, newStatus, responseNote);
    setSelectedFeedback(null);
    setResponseNote('');
  };

  const getStatusDisplay = (status: FeedbackItem['trangThai']) => {
    switch (status) {
      case 'cho_xu_ly':
        return <span className="text-amber-600 font-normal whitespace-nowrap">Chờ xử lý</span>;
      case 'da_xac_minh':
        return <span className="text-blue-600 font-normal whitespace-nowrap">Đã xác minh</span>;
      case 'da_dieu_chinh':
        return <span className="text-[#005325] font-normal whitespace-nowrap">Đã điều chỉnh</span>;
      case 'tu_choi':
        return <span className="text-rose-600 font-normal whitespace-nowrap">Từ chối</span>;
    }
  };

  const getReasonLabel = (reason: FeedbackItem['loaiPhanHoi']) => {
    switch (reason) {
      case 'sai_so_tiet':
        return 'Sai số tiết giảng';
      case 'thieu_lop':
        return 'Thiếu lớp học phần';
      case 'sai_he_so':
        return 'Sai hệ số lớp đông';
      case 'sai_don_gia':
        return 'Sai đơn giá thù lao';
      default:
        return 'Phản hồi khác';
    }
  };

  const statusTabs = [
    { id: 'all', label: 'Tất cả', count: feedbacks.length, activeClass: 'bg-slate-800 text-white border-slate-800' },
    { id: 'cho_xu_ly', label: 'Chờ xử lý', count: countPending, activeClass: 'bg-amber-600 text-white border-amber-600' },
    { id: 'da_xac_minh', label: 'Đã xác minh', count: countVerified, activeClass: 'bg-blue-600 text-white border-blue-600' },
    { id: 'da_dieu_chinh', label: 'Đã điều chỉnh', count: countAdjusted, activeClass: 'bg-[#005325] text-white border-[#005325]' },
    { id: 'tu_choi', label: 'Từ chối', count: countRejected, activeClass: 'bg-rose-600 text-white border-rose-600' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] text-slate-800 overflow-y-auto min-w-0">
      {/* 1. Compact Toolbar: Filter Tabs + Search */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center flex-wrap gap-1.5">
          {statusTabs.map((tab) => {
            const isActive = filterStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                className={`h-[30px] px-3 rounded-lg border text-[12px] transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? `${tab.activeClass} font-medium shadow-2xs`
                    : 'bg-slate-50/80 text-slate-600 border-slate-200 hover:bg-slate-100 font-normal'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[11px] font-mono ${isActive ? 'text-white/90' : 'text-slate-400'}`}>
                  ({tab.count})
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5 flex-1 sm:flex-initial justify-end">
          <div className="relative w-full sm:w-[270px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm giảng viên, mã GV, học phần..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-[30px] pl-8 pr-3 text-[12px] border border-slate-200 rounded-lg bg-slate-50/60 focus:bg-white focus:outline-none focus:border-[#005325] text-slate-700 font-normal transition-colors"
            />
          </div>
          <span className="text-[11.5px] text-slate-500 font-normal whitespace-nowrap hidden md:inline">
            Hiển thị <strong className="font-semibold text-slate-700">{filteredFeedbacks.length}</strong>/{feedbacks.length}
          </span>
        </div>
      </div>

      {/* 2. Inline Resolution Panel (Hiển thị trực tiếp khi bấm Xử lý, không dùng popup) */}
      {selectedFeedback && (
        <div className="px-4 pt-3 pb-1">
          <div className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-[#005325] shadow-xs overflow-hidden">
            <div className="bg-slate-50/80 border-b border-slate-200/80 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[12.5px]">
                <span className="font-semibold text-slate-800">
                  Xử lý phản hồi: {selectedFeedback.hoTen} ({selectedFeedback.maGV})
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600 font-normal">
                  Học phần: <strong className="font-medium text-slate-800">{selectedFeedback.tenHocPhan}</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600 font-normal">
                  Phân loại: <strong className="font-medium text-amber-700">{getReasonLabel(selectedFeedback.loaiPhanHoi)}</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFeedback(null)}
                className="text-[12px] text-slate-500 hover:text-slate-800 font-normal cursor-pointer px-2 py-0.5 rounded hover:bg-slate-200/60 transition-colors"
              >
                Đóng
              </button>
            </div>

            <div className="p-3.5 grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
              {/* Cột trái: Nội dung khiếu nại của GV */}
              <div className="lg:col-span-5 bg-amber-50/40 border border-amber-200/70 rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between text-[11.5px] text-slate-500">
                  <span>Nội dung phản hồi của Giảng viên</span>
                  <span className="font-mono text-[11px]">{selectedFeedback.ngayGui}</span>
                </div>
                <p className="text-[12.5px] text-slate-800 font-normal leading-relaxed">
                  &ldquo;{selectedFeedback.noiDung}&rdquo;
                </p>
              </div>

              {/* Cột phải: Nhập ý kiến giải trình & nút thao tác */}
              <div className="lg:col-span-7 flex flex-col gap-2.5">
                <div>
                  <label className="block text-[11.5px] text-slate-600 font-normal mb-1">
                    Ý kiến xử lý / Giải trình của Phòng Đào tạo & Khoa:
                  </label>
                  <textarea
                    rows={2}
                    value={responseNote}
                    onChange={(e) => setResponseNote(e.target.value)}
                    placeholder="Ghi rõ căn cứ điều chỉnh số tiết, quyết định hoặc lý do chấp thuận / từ chối..."
                    className="w-full p-2 border border-slate-200 rounded-lg text-[12px] bg-slate-50/40 focus:bg-white focus:outline-none focus:border-[#005325] text-slate-800 font-normal resize-none"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => onQuickAdjustRecord(selectedFeedback.teachingRecordId)}
                    className="h-[29px] px-3 text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-[11.5px] font-normal cursor-pointer transition-colors"
                  >
                    Mở bản ghi để sửa giờ
                  </button>

                  <div className="flex items-center flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleConfirmResolve('tu_choi')}
                      className="h-[29px] px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11.5px] font-normal cursor-pointer transition-colors"
                    >
                      Từ chối
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirmResolve('da_xac_minh')}
                      className="h-[29px] px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11.5px] font-normal cursor-pointer transition-colors"
                    >
                      Đã xác minh
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirmResolve('da_dieu_chinh')}
                      className="h-[29px] px-3.5 bg-[#005325] hover:bg-[#00421e] text-white rounded-lg text-[11.5px] font-medium cursor-pointer transition-colors shadow-2xs"
                    >
                      Đã điều chỉnh xong
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Feedback Table */}
      <div className="p-4 flex-1 overflow-x-auto">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] text-[#1e293b] border-b border-slate-200 text-[12px] font-semibold h-[36px]">
                <th className="w-[42px] px-2 text-center border-r border-slate-200">TT</th>
                <th className="w-[86px] px-2.5 border-r border-slate-200">Mã GV</th>
                <th className="px-3 border-r border-slate-200 min-w-[155px]">Họ tên giảng viên</th>
                <th className="px-2.5 border-r border-slate-200 min-w-[165px]">Học phần / hoạt động</th>
                <th className="px-2.5 border-r border-slate-200 w-[135px]">Loại phản hồi</th>
                <th className="px-3 border-r border-slate-200 min-w-[240px]">Nội dung phản hồi</th>
                <th className="px-2 text-center border-r border-slate-200 w-[115px]">Ngày gửi</th>
                <th className="px-2.5 text-center border-r border-slate-200 w-[105px]">Trạng thái</th>
                <th className="w-[88px] px-2 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-[12px] text-[#475569] font-normal">
              {filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500">
                    Không có phản hồi nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredFeedbacks.map((fb, idx) => {
                  const isSelected = selectedFeedback?.id === fb.id;
                  return (
                    <tr
                      key={fb.id}
                      onClick={() => handleOpenResolve(fb)}
                      className={`h-[37px] transition-colors cursor-pointer font-normal ${
                        isSelected ? 'bg-emerald-50/50' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="px-2 text-center font-mono text-slate-500 border-r border-slate-100 whitespace-nowrap">
                        {idx + 1}
                      </td>
                      <td className="px-2.5 font-mono text-slate-600 border-r border-slate-100 whitespace-nowrap">
                        {fb.maGV}
                      </td>
                      <td className="px-3 text-slate-700 border-r border-slate-100 whitespace-nowrap">
                        {fb.hoTen}
                      </td>
                      <td className="px-2.5 text-slate-600 border-r border-slate-100 whitespace-nowrap">
                        <span className="truncate block max-w-[195px]" title={fb.tenHocPhan}>
                          {fb.tenHocPhan}
                        </span>
                      </td>
                      <td className="px-2.5 text-slate-600 border-r border-slate-100 whitespace-nowrap">
                        {getReasonLabel(fb.loaiPhanHoi)}
                      </td>
                      <td className="px-3 text-slate-600 border-r border-slate-100">
                        <div className="truncate max-w-[320px]" title={fb.noiDung}>
                          {fb.noiDung}
                        </div>
                        {fb.phanHoiXuLy && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[320px]" title={fb.phanHoiXuLy}>
                            Giải trình: {fb.phanHoiXuLy}
                          </div>
                        )}
                      </td>
                      <td className="px-2 text-center font-mono text-slate-500 border-r border-slate-100 whitespace-nowrap text-[11px]">
                        {fb.ngayGui}
                      </td>
                      <td className="px-2.5 text-center border-r border-slate-100 whitespace-nowrap">
                        {getStatusDisplay(fb.trangThai)}
                      </td>
                      <td
                        className="px-2 text-center whitespace-nowrap"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenResolve(fb);
                        }}
                      >
                        <button
                          type="button"
                          className={`px-2.5 py-1 rounded-md text-[11.5px] font-normal cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                              : 'bg-[#005325]/10 text-[#005325] hover:bg-[#005325] hover:text-white'
                          }`}
                        >
                          {isSelected ? 'Đang mở' : 'Xử lý'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
