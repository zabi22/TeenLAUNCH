import { useState, useCallback } from 'react';
import { ToastType } from '../components/ui/Toast';

export const useToast = () => {
  const [toasts, setToasts] = useState<{ id: string; type: ToastType; message: string }[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
};
