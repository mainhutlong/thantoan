import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Check,
  XCircle,
  Edit3,
  Calendar,
  User,
  BookOpen,
  Send,
  X
} from 'lucide-react';
import { FeedbackItem, TeachingRecord } from '../types';

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
        fb.hoTen.toLowerCase().includes(q) ||
        fb.maGV.toLowerCase().includes(q) ||
        fb.tenHocPhan.toLowerCase().includes(q) ||
        fb.noiDung.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const countPending = feedbacks.filter((f) => f.trangThai === 'cho_xu_ly').length;
  const countVerified = feedbacks.filter((f) => f.trangThai === 'da_xac_minh').length;
  const countAdjusted = feedbacks.filter((f) => f.trangThai === 'da_dieu_chinh').length;
  const countRejected = feedbacks.filter((f) => f.trangThai === 'tu_choi').length;

  const handleOpenResolve = (fb: FeedbackItem) => {
    setSelectedFeedback(fb);
    setResponseNote(fb.phanHoiXuLy || '');
  };

  const handleConfirmResolve = (newStatus: FeedbackItem['trangThai']) => {
    if (!selectedFeedback) return;
    onUpdateFeedbackStatus(selectedFeedback.id, newStatus, responseNote);
    setSelectedFeedback(null);
    setResponseNote('');
  };

  const getStatusBadge = (status: FeedbackItem['trangThai']) => {
    switch (status) {
      case 'cho_xu_ly':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-black border border-amber-200 px-2 py-0.5 rounded font-normal whitespace-nowrap">
            <Clock className="w-3 h-3 text-black" />
            Chờ xử lý
          </span>
        );
      case 'da_xac_minh':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-black border border-blue-200 px-2 py-0.5 rounded font-normal whitespace-nowrap">
            <Check className="w-3 h-3 text-black" />
            Đã xác minh
          </span>
        );
      case 'da_dieu_chinh':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-black border border-emerald-200 px-2 py-0.5 rounded font-normal whitespace-nowrap">
            <CheckCircle className="w-3 h-3 text-black" />
            Đã điều chỉnh
          </span>
        );
      case 'tu_choi':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] bg-rose-50 text-black border border-rose-200 px-2 py-0.5 rounded font-normal whitespace-nowrap">
            <XCircle className="w-3 h-3 text-black" />
            Từ chối
          </span>
        );
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

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] text-slate-800 overflow-y-auto">
      {/* 1. Header Bar */}
      <div className="bg-white border-b border-slate-200 px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-slate-100 text-black">
              <MessageSquare className="w-5 h-5 text-black" />
            </span>
            <h1 className="text-[17px] font-normal text-black">
              Quản lý phản hồi và điều chỉnh giờ giảng viên TDU
            </h1>
          </div>
          <p className="text-[12px] text-black mt-1">
            Tiếp nhận khiếu nại, xác minh minh chứng và điều chỉnh số liệu thù lao của giảng viên theo quy trình
          </p>
        </div>
      </div>

      {/* 2. Four Mini Metric Badges */}
      <div className="px-5 pt-4 pb-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          onClick={() => setFilterStatus('cho_xu_ly')}
          className={`p-3 rounded border cursor-pointer transition-all ${
            filterStatus === 'cho_xu_ly'
              ? 'bg-amber-50 border-amber-300 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-[11px] text-black font-normal flex items-center justify-between">
            <span>Chờ xử lý</span>
            <Clock className="w-3.5 h-3.5 text-black" />
          </div>
          <div className="text-[18px] font-normal text-black mt-0.5 font-mono">{countPending} phản hồi</div>
        </div>

        <div
          onClick={() => setFilterStatus('da_xac_minh')}
          className={`p-3 rounded border cursor-pointer transition-all ${
            filterStatus === 'da_xac_minh'
              ? 'bg-blue-50 border-blue-300 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-[11px] text-black font-normal flex items-center justify-between">
            <span>Đã xác minh</span>
            <Check className="w-3.5 h-3.5 text-black" />
          </div>
          <div className="text-[18px] font-normal text-black mt-0.5 font-mono">{countVerified} phản hồi</div>
        </div>

        <div
          onClick={() => setFilterStatus('da_dieu_chinh')}
          className={`p-3 rounded border cursor-pointer transition-all ${
            filterStatus === 'da_dieu_chinh'
              ? 'bg-emerald-50 border-emerald-300 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-[11px] text-black font-normal flex items-center justify-between">
            <span>Đã điều chỉnh dữ liệu</span>
            <CheckCircle className="w-3.5 h-3.5 text-black" />
          </div>
          <div className="text-[18px] font-normal text-black mt-0.5 font-mono">{countAdjusted} phản hồi</div>
        </div>

        <div
          onClick={() => setFilterStatus('tu_choi')}
          className={`p-3 rounded border cursor-pointer transition-all ${
            filterStatus === 'tu_choi'
              ? 'bg-rose-50 border-rose-300 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-[11px] text-black font-normal flex items-center justify-between">
            <span>Từ chối</span>
            <XCircle className="w-3.5 h-3.5 text-black" />
          </div>
          <div className="text-[18px] font-normal text-black mt-0.5 font-mono">{countRejected} phản hồi</div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3 bg-white border-y border-slate-200 my-2">
        <div className="flex items-center flex-wrap gap-2.5 flex-1">
          <div className="relative min-w-[260px] max-w-sm flex-1">
            <Search className="w-3.5 h-3.5 text-black absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo họ tên GV, mã GV, học phần, nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[12px] border border-slate-300 rounded focus:outline-none focus:border-black text-black font-normal"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1.5 text-[12px] bg-white text-black font-normal focus:outline-none"
          >
            <option value="all">Tất cả trạng thái ({feedbacks.length})</option>
            <option value="cho_xu_ly">Chờ xử lý ({countPending})</option>
            <option value="da_xac_minh">Đã xác minh ({countVerified})</option>
            <option value="da_dieu_chinh">Đã điều chỉnh ({countAdjusted})</option>
            <option value="tu_choi">Từ chối ({countRejected})</option>
          </select>
        </div>

        <div className="text-[12px] text-black font-normal">
          Hiển thị: <span className="text-black font-normal">{filteredFeedbacks.length}</span> / {feedbacks.length} phản hồi
        </div>
      </div>

      {/* 4. Main Feedback Table: Clean Single-line per Row */}
      <div className="px-5 pb-8 flex-1 overflow-x-auto">
        <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-[#f8fafc] text-black border-b border-[#cbd5e1] text-[12px] font-normal h-[36px]">
                <th className="w-[42px] px-2 text-center border-r border-[#cbd5e1]">TT</th>
                <th className="w-[90px] px-2.5 border-r border-[#cbd5e1]">Mã GV</th>
                <th className="px-3 border-r border-[#cbd5e1] min-w-[170px]">Họ tên giảng viên</th>
                <th className="px-2.5 border-r border-[#cbd5e1] min-w-[180px]">Học phần / hoạt động</th>
                <th className="px-2.5 border-r border-[#cbd5e1] w-[130px]">Loại phản hồi</th>
                <th className="px-3 border-r border-[#cbd5e1] min-w-[260px]">Nội dung khiếu nại</th>
                <th className="px-2 text-center border-r border-[#cbd5e1] w-[130px]">Ngày gửi</th>
                <th className="px-2.5 text-center border-r border-[#cbd5e1] w-[115px]">Trạng thái</th>
                <th className="w-[120px] px-2 text-center">Xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[12px] text-black">
              {filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-black">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-[13px] font-normal text-black">
                        Không có phản hồi nào trong danh sách
                      </span>
                      <span className="text-[11.5px] text-black font-normal">
                        Tất cả các kiến nghị của giảng viên đã được giải quyết hoặc chưa có dữ liệu mới.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFeedbacks.map((fb, idx) => (
                  <tr key={fb.id} className="h-[38px] hover:bg-[#f8fafc] transition-colors font-normal">
                    {/* TT */}
                    <td className="px-2 text-center font-mono text-black border-r border-[#f1f5f9] whitespace-nowrap">
                      {idx + 1}
                    </td>

                    {/* Mã GV */}
                    <td className="px-2.5 font-mono text-black font-normal border-r border-[#f1f5f9] whitespace-nowrap">
                      {fb.maGV}
                    </td>

                    {/* Họ tên */}
                    <td className="px-3 font-normal text-black border-r border-[#f1f5f9] whitespace-nowrap">
                      <span>{fb.hoTen}</span>
                    </td>

                    {/* Học phần */}
                    <td className="px-2.5 text-black border-r border-[#f1f5f9] whitespace-nowrap font-normal">
                      <span className="truncate block max-w-[200px]" title={fb.tenHocPhan}>
                        {fb.tenHocPhan}
                      </span>
                    </td>

                    {/* Loại phản hồi */}
                    <td className="px-2.5 border-r border-[#f1f5f9] whitespace-nowrap font-normal">
                      <span className="px-2 py-0.5 rounded text-[11px] font-normal bg-amber-50 text-black border border-amber-300">
                        {getReasonLabel(fb.loaiPhanHoi)}
                      </span>
                    </td>

                    {/* Nội dung */}
                    <td className="px-3 text-black border-r border-[#f1f5f9] whitespace-nowrap font-normal">
                      <span className="truncate block max-w-[320px]" title={fb.noiDung}>
                        {fb.noiDung}
                      </span>
                    </td>

                    {/* Ngày gửi */}
                    <td className="px-2 text-center font-mono text-black border-r border-[#f1f5f9] whitespace-nowrap text-[11px] font-normal">
                      {fb.ngayGui}
                    </td>

                    {/* Trạng thái */}
                    <td className="px-2.5 text-center border-r border-[#f1f5f9] whitespace-nowrap text-black font-normal">
                      {getStatusBadge(fb.trangThai)}
                    </td>

                    {/* Thao tác */}
                    <td className="px-2 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleOpenResolve(fb)}
                        className="px-2.5 py-1 rounded bg-[#005325] hover:bg-[#00421e] text-white text-[11.5px] font-normal cursor-pointer transition-colors shadow-2xs"
                      >
                        Xử lý
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Dialog: Tiếp nhận & Phê duyệt giải trình phản hồi */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-normal">
          <div className="bg-white rounded-md shadow-2xl w-full max-w-xl overflow-hidden border border-slate-300">
            <div className="bg-[#005325] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-normal text-[14px]">Xử lý phản hồi: {selectedFeedback.hoTen} ({selectedFeedback.maGV})</h3>
              <button onClick={() => setSelectedFeedback(null)} className="text-white/80 hover:text-white p-1 rounded cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3.5 text-[12.5px] text-black">
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-black font-normal">Học phần:</span>
                  <span className="font-normal text-black">{selectedFeedback.tenHocPhan}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-black font-normal">Vấn đề phản hồi:</span>
                  <span className="font-normal text-black">{getReasonLabel(selectedFeedback.loaiPhanHoi)}</span>
                </div>
                <div>
                  <span className="text-black font-normal block mb-0.5">Nội dung khiếu nại của Giảng viên:</span>
                  <p className="bg-white p-2 rounded border border-slate-200 text-black italic font-normal">
                    &quot;{selectedFeedback.noiDung}&quot;
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-black font-normal mb-1">
                  Ý kiến xử lý / Giải trình của Phòng Đào tạo & Khoa:
                </label>
                <textarea
                  rows={3}
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  placeholder="Ghi rõ căn cứ điều chỉnh số tiết, quyết định hoặc lý do chấp thuận / từ chối..."
                  className="w-full p-2 border border-slate-300 rounded text-[12.5px] focus:outline-none focus:border-[#005325] text-black font-normal"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => onQuickAdjustRecord(selectedFeedback.teachingRecordId)}
                  className="px-3 py-1.5 text-black hover:bg-slate-100 border border-slate-300 rounded text-[12px] font-normal cursor-pointer"
                >
                  Mở bản ghi để sửa giờ
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleConfirmResolve('tu_choi')}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-black border border-rose-200 rounded text-[12px] font-normal cursor-pointer"
                  >
                    Từ chối
                  </button>
                  <button
                    onClick={() => handleConfirmResolve('da_xac_minh')}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-black border border-blue-200 rounded text-[12px] font-normal cursor-pointer"
                  >
                    Đã xác minh
                  </button>
                  <button
                    onClick={() => handleConfirmResolve('da_dieu_chinh')}
                    className="px-3.5 py-1.5 bg-[#005325] hover:bg-[#00421e] text-white rounded text-[12px] font-normal cursor-pointer shadow-xs"
                  >
                    Đã điều chỉnh xong
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
