import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  variant?: 'default' | 'card' | 'compact';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  variant = 'default',
  className
}) => {
  if (variant === 'compact') {
    return (
      <div className={cn("flex flex-col items-center justify-center p-6 text-center bg-slate-50 border border-slate-200 border-dashed rounded-2xl", className)}>
        <Icon className="h-6 w-6 text-slate-400 mb-3" />
        <h3 className="text-sm font-bold text-slate-700 mb-1">{title}</h3>
        <p className="text-xs text-slate-500 mb-4">{description}</p>
        {action && <div>{action}</div>}
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        variant === 'card' ? "p-8 bg-white border border-slate-200 rounded-3xl shadow-sm" : "py-24 bg-slate-50 rounded-3xl border border-slate-200 border-dashed",
        className
      )}
    >
      <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm mb-6 leading-relaxed text-sm">
        {description}
      </p>
      {action && (
        <div>
          {action}
        </div>
      )}
    </motion.div>
  );
};
