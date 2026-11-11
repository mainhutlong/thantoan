import React, { useState } from 'react';
import { X, CheckCircle, Clock, AlertTriangle, MessageSquare, Check, XCircle } from 'lucide-react';
import { TDUEmblem } from './TDUEmblem';
import { FeedbackItem, TeachingRecord } from '../types';

interface FeedbackListModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedbacks: FeedbackItem[];
  onUpdateFeedbackStatus: (id: string, newStatus: FeedbackItem['trangThai'], responseNote: string) => void;
  onQuickAdjustRecord: (recordId: string) => void;
}

export const FeedbackListModal: React.FC<FeedbackListModalProps> = ({
  isOpen,
  onClose,
  feedbacks,
  onUpdateFeedbackStatus,
  onQuickAdjustRecord,
}) => {
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [responseNote, setResponseNote] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  if (!isOpen) return null;

  const filteredFeedbacks = feedbacks.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.trangThai === filterStatus;
  });

  const handleResolve = (status: FeedbackItem['trangThai']) => {
    if (!selectedFeedback) return;
    onUpdateFeedbackStatus(selectedFeedback.id, status, responseNote);
    setSelectedFeedback(null);
    setResponseNote('');
  };

  const getStatusBadge = (status: FeedbackItem['trangThai']) => {
    switch (status) {
      case 'cho_xu_ly':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-medium">
            <Clock className="w-3 h-3 text-amber-500" />
            Chờ xử lý
          </span>
        );
      case 'da_xac_minh':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-medium">
            <Check className="w-3 h-3 text-blue-500" />
            Đã xác minh
          </span>
        );
      case 'da_dieu_chinh':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Đã điều chỉnh
          </span>
        );
      case 'tu_choi':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-medium">
            <XCircle className="w-3 h-3 text-rose-500" />
            Từ chối
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-300 max-h-[90vh] flex flex-col">
        {/* Top Header #005325 */}
        <div className="bg-[#005325] text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-200" />
            <h3 className="font-semibold text-[14px]">
              Quản lý phản hồi và điều chỉnh giờ giảng viên TDU
            </h3>
            <span className="bg-emerald-900 text-emerald-100 text-[11px] px-2 py-0.5 rounded">
              Tổng số: {feedbacks.length}
            </span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter bar on modal */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Lọc theo trạng thái:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2 py-1 text-[11.5px] text-slate-700 focus:outline-none"
            >
              <option value="all">Tất cả ({feedbacks.length})</option>
              <option value="cho_xu_ly">Chờ xử lý ({feedbacks.filter(f => f.trangThai === 'cho_xu_ly').length})</option>
              <option value="da_dieu_chinh">Đã điều chỉnh ({feedbacks.filter(f => f.trangThai === 'da_dieu_chinh').length})</option>
              <option value="da_xac_minh">Đã xác minh ({feedbacks.filter(f => f.trangThai === 'da_xac_minh').length})</option>
              <option value="tu_choi">Từ chối ({feedbacks.filter(f => f.trangThai === 'tu_choi').length})</option>
            </select>
          </div>
          <span className="text-[11px] text-slate-400">Quy trình xử lý phản hồi 3 bước: Khoa xác minh → Điều chỉnh → Thông báo</span>
        </div>

        {/* Feedback List Body */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 text-[12.5px]">
          {filteredFeedbacks.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-50" />
              <p className="font-medium text-slate-600">Hiện không có phản hồi nào cần xử lý</p>
              <p className="text-[11.5px] text-slate-400 mt-0.5">Giảng viên có thể gửi phản hồi từ cổng tra cứu cá nhân khi phát hiện sai lệch.</p>
            </div>
          ) : (
            filteredFeedbacks.map((fb) => (
              <div
                key={fb.id}
                className="border border-slate-200 rounded p-3 hover:border-[#005325] transition-all bg-white space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{fb.hoTen}</span>
                    <span className="font-mono text-slate-500 text-[11px]">({fb.maGV})</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-medium text-[#005325]">{fb.tenHocPhan}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">{fb.ngayGui}</span>
                    {getStatusBadge(fb.trangThai)}
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded text-slate-700 text-[12px] border border-slate-100">
                  <div className="text-[11px] text-slate-500 font-semibold mb-0.5 uppercase tracking-wide">
                    Nội dung khiếu nại / đề nghị:
                  </div>
                  <div>{fb.noiDung}</div>
                </div>

                {fb.phanHoiXuLy && (
                  <div className="bg-emerald-50/60 p-2 rounded text-emerald-900 text-[11.5px] border border-emerald-100">
                    <strong>Giải trình & Kết quả xử lý:</strong> {fb.phanHoiXuLy} ({fb.nguoiXuLy || 'Phòng Đào tạo'} - {fb.ngayXuLy})
                  </div>
                )}

                {/* Actions for this feedback */}
                <div className="flex items-center justify-between pt-1 text-[11.5px]">
                  <button
                    onClick={() => onQuickAdjustRecord(fb.teachingRecordId)}
                    className="text-[#005325] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    Mở bản ghi để điều chỉnh số tiết / đơn giá
                  </button>

                  <div className="flex items-center gap-1.5">
                    {fb.trangThai === 'cho_xu_ly' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedFeedback(fb);
                            setResponseNote('Khoa đã đối soát với sổ đầu bài và xác nhận điều chỉnh bổ sung số tiết.');
                          }}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer"
                        >
                          Xác minh
                        </button>
                        <button
                          onClick={() => {
                            setSelectedFeedback(fb);
                            setResponseNote('Đã cập nhật đúng số tiết thực tế và tính lại thù lao tương ứng.');
                          }}
                          className="px-2.5 py-1 bg-[#005325] hover:bg-[#00421e] text-white rounded cursor-pointer"
                        >
                          Đã điều chỉnh
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Feedback Response Sub-Panel */}
        {selectedFeedback && (
          <div className="p-3 bg-amber-50 border-t border-amber-200 shrink-0 text-[12px] space-y-2">
            <div className="flex items-center justify-between font-semibold text-amber-900">
              <span>Xử lý phản hồi của: {selectedFeedback.hoTen} ({selectedFeedback.tenHocPhan})</span>
              <button onClick={() => setSelectedFeedback(null)} className="text-amber-800 hover:text-black">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              rows={2}
              value={responseNote}
              onChange={(e) => setResponseNote(e.target.value)}
              placeholder="Nhập nội dung giải trình / thông báo kết quả cho giảng viên..."
              className="w-full p-2 border border-amber-300 rounded bg-white text-slate-800 text-[12px] focus:outline-none focus:border-[#005325]"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => handleResolve('tu_choi')}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded cursor-pointer"
              >
                Từ chối đề nghị
              </button>
              <button
                onClick={() => handleResolve('da_dieu_chinh')}
                className="px-3 py-1 bg-[#005325] hover:bg-[#00421e] text-white rounded cursor-pointer"
              >
                Lưu & Hoàn tất điều chỉnh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
