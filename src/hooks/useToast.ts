import { useState, useEffect, useCallback } from 'react';
import { ToastType } from '../components/ui/Toast';

type ToastItem = { id: string; type: ToastType; message: string };

class ToastManager {
  private toasts: ToastItem[] = [];
  private listeners: ((toasts: ToastItem[]) => void)[] = [];

  addToast(type: ToastType, message: string) {
    const id = Math.random().toString(36).substr(2, 9);
    this.toasts = [...this.toasts, { id, type, message }];
    this.notifyListeners();
  }

  removeToast(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notifyListeners();
  }

  subscribe(listener: (toasts: ToastItem[]) => void) {
    this.listeners.push(listener);
    listener(this.toasts);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.toasts));
  }
}

export const toastManager = new ToastManager();

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return toastManager.subscribe(setToasts);
  }, []);

  const addToast = useCallback((type: ToastType, message: string) => {
    toastManager.addToast(type, message);
  }, []);

  const removeToast = useCallback((id: string) => {
    toastManager.removeToast(id);
  }, []);

  return { toasts, addToast, removeToast };
};
