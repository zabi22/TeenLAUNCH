import React from 'react';
import { Clock, CheckCircle, FileText, Activity } from 'lucide-react';

export const DeadlineCounter: React.FC<{ target: string; label: string }> = ({ target, label }) => {
  const targetDate = new Date(target);
  const now = new Date();
  const diffDays = Math.max(0, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center gap-2 mb-4 text-red-700">
        <Clock className="w-5 h-5" />
        <h3 className="font-semibold text-sm uppercase tracking-wider">{label}</h3>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-bold text-red-600 tracking-tight">{diffDays}</span>
        <span className="text-red-800 font-medium text-lg">days left</span>
      </div>
    </div>
  );
};

export const MilestoneProgressBar: React.FC<{ title: string; progress: number; total: number }> = ({ title, progress, total }) => {
  const percentage = Math.min(100, Math.max(0, (progress / total) * 100));
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center gap-2 mb-4 text-gray-700">
        <CheckCircle className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold text-sm uppercase tracking-wider">{title}</h3>
      </div>
      
      <div>
        <div className="flex justify-between text-sm text-gray-500 mb-2 font-medium">
          <span>{progress} completed</span>
          <span>{total} total</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div className="bg-blue-600 h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export const EssayWorkflowStep: React.FC<{ stepName: string; draftId: string; status: string }> = ({ stepName, draftId, status }) => {
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center gap-2 mb-4 text-indigo-700">
        <FileText className="w-5 h-5" />
        <h3 className="font-semibold text-sm uppercase tracking-wider">Essay Workflow</h3>
      </div>
      
      <div>
        <h4 className="text-indigo-900 font-bold text-lg mb-1">{stepName}</h4>
        <p className="text-indigo-600 text-sm mb-4 font-mono">ID: {draftId}</p>
        
        <div className="inline-block">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            status === 'urgent' ? 'bg-red-200 text-red-800' : 
            status === 'review' ? 'bg-amber-200 text-amber-800' :
            'bg-indigo-200 text-indigo-800'
          }`}>
            {status}
          </span>
        </div>
      </div>
    </div>
  );
};

export const MetricCard: React.FC<{ title: string; value: string | number; subtitle?: string }> = ({ title, value, subtitle }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center gap-2 mb-4 text-gray-500">
        <Activity className="w-5 h-5" />
        <h3 className="font-medium text-sm uppercase tracking-wider">{title}</h3>
      </div>
      
      <div>
        <div className="text-4xl font-bold text-gray-900 tracking-tight">{value}</div>
        {subtitle && <p className="text-gray-400 text-sm mt-2">{subtitle}</p>}
      </div>
    </div>
  );
};
