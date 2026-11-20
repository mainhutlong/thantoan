import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  targetName?: string;
  targetType?: string;
  message?: string;
  dangerNotice?: string;
  confirmText?: string;
  cancelText?: string;
  isDeleting?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title = 'Xác nhận xóa dữ liệu',
  targetName,
  targetType,
  message = 'Bạn có chắc chắn muốn xóa bản ghi này khỏi hệ thống không?',
  dangerNotice = 'Thao tác này sẽ xóa vĩnh viễn dữ liệu và không thể hoàn tác.',
  confirmText = 'Đồng ý xóa',
  cancelText = 'Hủy bỏ',
  isDeleting = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter' && !isDeleting) {
        e.preventDefault();
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onConfirm, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans"
      onClick={onCancel}
    >
      {/* Khung Hộp thoại Modal */}
      <div
        className="relative w-full max-w-[460px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-6 sm:p-7 z-10 overflow-hidden flex flex-col"
        style={{ display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng góc trên */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          title="Đóng (Esc)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Biểu tượng cảnh báo Thùng rác đỏ TDU */}
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 mx-auto mb-4 shadow-2xs shrink-0">
          <Trash2 className="w-7 h-7 stroke-[2.2]" />
        </div>

        {/* Tiêu đề & Lời nhắn */}
        <div className="text-center">
          <h3 className="text-[17px] font-bold text-slate-900 tracking-tight leading-snug">
            {title}
          </h3>
          <p className="text-[13.5px] text-slate-600 leading-relaxed mt-2 px-1">
            {message}
          </p>
        </div>

        {/* Khung nổi bật đối tượng bị xóa (Target Box) */}
        {targetName && (
          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center flex flex-col items-center justify-center gap-1.5">
            {targetType && (
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-200/80 text-slate-600 font-semibold text-[10.5px] uppercase tracking-wider">
                {targetType}
              </span>
            )}
            <span className="text-[14px] font-bold text-rose-700 break-words max-w-full px-2 leading-snug">
              {targetName}
            </span>
          </div>
        )}

        {/* Dòng cảnh báo không thể hoàn tác */}
        <div className="mt-3.5 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-800 text-[12px] font-medium text-center">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{dangerNotice}</span>
        </div>

        {/* Hai nút hành động: Hủy bỏ & Xác nhận xóa */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="w-full h-11 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-[13.5px] transition-all shadow-2xs cursor-pointer flex items-center justify-center disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full h-11 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-[13.5px] transition-all shadow-sm shadow-rose-600/30 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isDeleting ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang xóa...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 stroke-[2.2]" />
                <span className="truncate">{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
