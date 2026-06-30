import React from 'react';
import { AnimatePresence } from 'motion/react';
import { useToast } from '../../hooks/useToast';
import { Toast } from './Toast';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              id={toast.id}
              type={toast.type}
              message={toast.message}
              onDismiss={removeToast}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
