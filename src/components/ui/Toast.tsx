import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onDismiss: (id: string) => void;
}

const icons = {
  success: <CheckCircle className="text-emerald-500" />,
  error: <XCircle className="text-rose-500" />,
  warning: <AlertTriangle className="text-amber-500" />,
  info: <Info className="text-indigo-500" />,
};

const borders = {
  success: "border-l-emerald-500",
  error: "border-l-rose-500",
  warning: "border-l-amber-500",
  info: "border-l-indigo-500",
};

export const Toast: React.FC<ToastProps> = ({ id, type, message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), type === 'error' ? 10000 : 5000);
    return () => clearTimeout(timer);
  }, [id, type, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className={cn(
        "flex items-center gap-3 bg-slate-900 border border-slate-800 border-l-4 p-4 rounded-lg shadow-lg mb-4 min-w-[300px]",
        borders[type]
      )}
    >
      {icons[type]}
      <p className="text-slate-100 flex-1 text-sm">{message}</p>
      <button onClick={() => onDismiss(id)} className="text-slate-400 hover:text-white">
        <X size={16} />
      </button>
    </motion.div>
  );
};
