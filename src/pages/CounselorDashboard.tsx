import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserCheck, Search, Plus, CheckCircle, Mail, AlertCircle, ChevronRight, User, ShieldAlert } from "lucide-react";

interface ManagedStudent {
  id: string;
  name: string;
  grade: string;
  gpa: number;
  targetColleges: string[];
  progress: number;
  alerts: number;
  recentActivity: string;
}

export default function CounselorDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<ManagedStudent[]>(
    [
      { id: "1", name: "ZABI", grade: "12th Grade", gpa: 3.9, targetColleges: ["Stanford", "KTH Royal Institute"], progress: 80, alerts: 1, recentActivity: "Submitted Essay Assistant draft" },
      { id: "2", name: "Sofia Lindqvist", grade: "12th Grade", gpa: 3.8, targetColleges: ["Oxford University", "Lund University"], progress: 75, alerts: 0, recentActivity: "Uploaded AP Scholar certificate" },
      { id: "3", name: "Arjun Mehta", grade: "11th Grade", gpa: 3.75, targetColleges: ["MIT", "NUS Singapore"], progress: 65, alerts: 2, recentActivity: "Modified Strategic Roadmap" },
      { id: "4", name: "Kenji Sato", grade: "12th Grade", gpa: 3.95, targetColleges: ["Tokyo University", "Stanford"], progress: 90, alerts: 0, recentActivity: "Matched with Bio-Polymer Membranous lab" }
    ]
  );

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const resolveAlert = (id: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, alerts: Math.max(0, s.alerts - 1) } : s));
  };

  return (
    <div className="space-y-8" id="counselor-dashboard-page">
      {/* Title Banner */}
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-900 to-slate-900 -z-10"></div>
        <div className="space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-bold text-indigo-400">
            <UserCheck className="h-3.5 w-3.5" /> High School counselor portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Counselor Portal: Stockholm Gymnasium
          </h1>
          <p className="text-slate-400 text-sm">
            Monitor admissions portfolios, review essays, resolve compliance alerts, and recommend tailored research/career simulation tracks to your student roster.
          </p>
        </div>
        <div className="shrink-0 bg-slate-800/40 border border-slate-700/60 p-6 rounded-2xl text-center shadow-xl">
          <div className="text-3xl font-black text-indigo-400">{students.length}</div>
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mt-1">Managed Scholars</div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Search student */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students by name..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
            />
          </div>
          <button className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0">
            <Plus className="h-4 w-4" /> Add Student
          </button>
        </div>

        {/* Student list grid */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest px-6">
            <span className="flex-1">Student</span>
            <span className="w-16 text-center">GPA</span>
            <span className="w-48 text-center">Target Colleges</span>
            <span className="w-32 text-center">Progress bar</span>
            <span className="w-24 text-center">Status Alerts</span>
            <span className="w-32 text-right">Actions</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredStudents.map((s) => (
              <div key={s.id} className="p-4 px-6 flex items-center text-sm font-medium hover:bg-slate-50/50 transition-colors">
                <div className="flex-1 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                    {s.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 leading-tight">{s.name}</h4>
                    <span className="text-[10px] text-slate-400">{s.grade} • {s.recentActivity}</span>
                  </div>
                </div>

                <span className="w-16 font-black text-slate-700 text-center">{s.gpa.toFixed(2)}</span>

                <div className="w-48 text-center text-xs text-slate-500 flex flex-wrap justify-center gap-1">
                  {s.targetColleges.map((col, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">{col}</span>
                  ))}
                </div>

                <div className="w-32 flex flex-col items-center">
                  <div className="text-[10px] font-bold text-slate-400 mb-1">{s.progress}%</div>
                  <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600" style={{ width: `${s.progress}%` }}></div>
                  </div>
                </div>

                <div className="w-24 text-center">
                  {s.alerts > 0 ? (
                    <button
                      onClick={() => resolveAlert(s.id)}
                      className="px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-700 font-bold text-[10px] rounded flex items-center gap-1 mx-auto hover:bg-rose-100 transition-colors"
                    >
                      <AlertCircle className="h-3 w-3" /> {s.alerts} Alerts
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold justify-center">
                      ✓ Stable
                    </span>
                  )}
                </div>

                <div className="w-32 text-right flex justify-end gap-2">
                  <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-700">
                    <Mail className="h-4 w-4" />
                  </button>
                  <button className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition-colors">
                    Review
                  </button>
                </div>
              </div>
            ))}

            {filteredStudents.length === 0 && (
              <p className="p-8 text-center text-sm text-slate-400">No matching students found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
