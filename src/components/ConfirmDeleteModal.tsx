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
  // Đóng modal khi bấm phím ESC hoặc Enter để xác nhận
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop nền tối làm mờ */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Khung Modal chính */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/90 max-w-[440px] w-full p-6 overflow-hidden z-10 animate-scaleUp font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút X đóng góc trên */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          title="Đóng (Esc)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Biểu tượng cảnh báo màu đỏ TDU */}
        <div className="w-13 h-13 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 mx-auto mb-4 shadow-2xs">
          <Trash2 className="w-6 h-6 stroke-[2.2]" />
        </div>

        {/* Tiêu đề & Nội dung mô tả */}
        <div className="text-center space-y-1.5">
          <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">
            {title}
          </h3>
          <p className="text-[13px] text-slate-600 leading-relaxed px-2">
            {message}
          </p>
        </div>

        {/* Khung nổi bật đối tượng bị xóa (nếu có) */}
        {targetName && (
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 my-3 text-center">
            {targetType && (
              <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
                {targetType}
              </span>
            )}
            <span className="text-[13px] font-bold text-rose-700 break-words line-clamp-2">
              {targetName}
            </span>
          </div>
        )}

        {/* Dòng cảnh báo không thể hoàn tác */}
        <div className="flex items-center justify-center gap-1.5 text-[11.5px] font-medium text-amber-700 bg-amber-50/80 border border-amber-200/60 rounded-lg py-1.5 px-3 my-3 text-center">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          <span>{dangerNotice}</span>
        </div>

        {/* Hai nút hành động: Hủy bỏ & Đồng ý xóa */}
        <div className="flex items-center gap-2.5 mt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 h-[38px] rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-[13px] transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 h-[38px] rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-[13px] transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-70"
          >
            {isDeleting ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>{isDeleting ? 'Đang xóa...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
