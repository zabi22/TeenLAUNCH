import { useState } from "react";
import { motion } from "motion/react";
import { Heart, CheckCircle, ShieldAlert, Award, ChevronRight, HelpCircle, UserPlus, BookOpen } from "lucide-react";

interface ParentTask {
  id: string;
  task: string;
  dueDate: string;
  done: boolean;
}

export default function ParentDashboard() {
  const [tasks, setTasks] = useState<ParentTask[]>([
    { id: "1", task: "Review and sign the FAFSA financial aid options", dueDate: "Oct 15", done: true },
    { id: "2", task: "Schedule the Stockholm University campus exploration session", dueDate: "Nov 01", done: false },
    { id: "3", task: "Review ZABI's draft for Stanford admissions essays", dueDate: "Oct 30", done: false },
    { id: "4", task: "Verify SAT/ACT local Swedish test center registrations", dueDate: "Sept 12", done: true }
  ]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div className="space-y-8" id="parent-dashboard-page">
      {/* Title Banner */}
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-900 to-slate-900 -z-10"></div>
        <div className="space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-bold text-amber-400">
            <Heart className="h-3.5 w-3.5" /> Family Co-Pilot Gateway
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Parent Portal: Admissions Sync
          </h1>
          <p className="text-slate-400 text-sm">
            Partner in your teen's academic journey. Manage critical financial aid submissions, co-sign scholarship applications, and monitor progress.
          </p>
        </div>
        <div className="shrink-0 bg-slate-800/40 border border-slate-700/60 p-6 rounded-2xl text-center shadow-xl">
          <div className="text-3xl font-black text-indigo-400">80%</div>
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mt-1">ZABI's Portfolio Progress</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Parent Checklists */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">FAMILY CHECKLIST</span>
                <h3 className="font-extrabold text-slate-900 text-lg font-sans">Active Parent Tasks</h3>
              </div>
              <button className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800">
                <UserPlus className="h-4 w-4" /> Link Guardian
              </button>
            </div>

            <div className="space-y-3">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => toggleTask(t.id)}
                  className={`p-4 border rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-all ${
                    t.done 
                      ? "border-emerald-200 bg-emerald-50/20 text-slate-500" 
                      : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-950 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      t.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white"
                    }`}>
                      {t.done && <span className="text-[10px]">✓</span>}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold">{t.task}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">Due {t.dueDate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-white space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" /> Academic Progress
            </h3>
            <h4 className="text-base font-extrabold leading-tight">College Application Status</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              ZABI has scouted 3 new opportunities and is on track with 3 AP classes. Counselor review is verified.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-xs">
              <HelpCircle className="h-4 w-4 text-indigo-500" /> Scholarship Matching
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Target Scholarship Program</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              We've identified 2 scholarships eligible for Swedish students applying to US schools. Co-signing the forms will unlock admissions credentials.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
