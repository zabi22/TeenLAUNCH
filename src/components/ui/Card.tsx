import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils'; // Assuming this exists

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'glass';
  tilt?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, tilt = false, ...props }, ref) => {
    const variants = {
      default: "bg-slate-900 border border-slate-800 rounded-2xl",
      elevated: "bg-slate-900 border border-slate-800 rounded-2xl shadow-xl",
      interactive: "bg-slate-900 border border-slate-800 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-indigo-500/20 hover:border-indigo-500/50",
      glass: "backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl",
    };

    const cardContent = (
      <div
        ref={ref}
        className={cn(variants[variant], "p-6", className)}
        {...props}
      >
        {children}
      </div>
    );

    if (tilt) {
      return (
        <motion.div
          whileHover={{ rotateX: 5, rotateY: 5, scale: 1.02 }}
          transition={{ duration: 0.3 }}
          style={{ perspective: 1000 }}
        >
          {cardContent}
        </motion.div>
      );
    }

    return cardContent;
  }
);
Card.displayName = "Card";
