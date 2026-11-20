import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { ConfirmDeleteModal, ConfirmDeleteModalProps } from '../components/ConfirmDeleteModal';

export interface ConfirmDeleteOptions {
  title?: string;
  targetName?: string;
  targetType?: string;
  message?: string;
  dangerNotice?: string;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmDialogContextType {
  confirmDelete: (options?: ConfirmDeleteOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export const ConfirmDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalProps, setModalProps] = useState<ConfirmDeleteModalProps>({
    isOpen: false,
    onConfirm: () => {},
    onCancel: () => {},
  });

  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirmDelete = useCallback((options?: ConfirmDeleteOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setModalProps({
        isOpen: true,
        title: options?.title || 'Xác nhận xóa dữ liệu',
        targetName: options?.targetName,
        targetType: options?.targetType,
        message: options?.message || 'Bạn có chắc chắn muốn xóa bản ghi này khỏi hệ thống không?',
        dangerNotice: options?.dangerNotice || 'Thao tác này sẽ xóa vĩnh viễn dữ liệu và không thể hoàn tác.',
        confirmText: options?.confirmText || 'Đồng ý xóa',
        cancelText: options?.cancelText || 'Hủy bỏ',
        onConfirm: () => {
          setModalProps((prev) => ({ ...prev, isOpen: false }));
          if (resolverRef.current) {
            resolverRef.current(true);
            resolverRef.current = null;
          }
        },
        onCancel: () => {
          setModalProps((prev) => ({ ...prev, isOpen: false }));
          if (resolverRef.current) {
            resolverRef.current(false);
            resolverRef.current = null;
          }
        },
      });
    });
  }, []);

  return (
    <ConfirmDialogContext.Provider value={{ confirmDelete }}>
      {children}
      <ConfirmDeleteModal {...modalProps} />
    </ConfirmDialogContext.Provider>
  );
};

export const useConfirmDelete = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirmDelete must be used within a ConfirmDialogProvider');
  }
  return context;
};
