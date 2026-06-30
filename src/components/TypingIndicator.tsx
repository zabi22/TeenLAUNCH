import React from 'react';
import { motion } from 'motion/react';

export const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1.5 p-3 w-fit bg-slate-800 rounded-2xl rounded-tl-sm shadow-sm border border-slate-700/50">
      <motion.div
        className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
      />
    </div>
  );
};
