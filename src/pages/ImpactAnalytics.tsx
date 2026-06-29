import { useState } from "react";
import { motion } from "motion/react";
import { BarChart3, TrendingUp, Award, Calendar, ChevronRight, Activity, Plus, ShieldCheck } from "lucide-react";

interface ActivityHourLog {
  id: string;
  activity: string;
  category: "Volunteer" | "Leadership" | "Sports" | "Research";
  hours: number;
  date: string;
}

export default function ImpactAnalytics() {
  const [logs, setLogs] = useState<ActivityHourLog[]>([
    { id: "1", activity: "Swedish Red Cross Chapter coordination", category: "Volunteer", hours: 24, date: "Sept 2025" },
    { id: "2", activity: "Stockholm Gymnasium Student Council meeting", category: "Leadership", hours: 18, date: "Oct 2025" },
    { id: "3", activity: "High-Frequency Algorithmic lab", category: "Research", hours: 35, date: "Dec 2025" },
    { id: "4", activity: "Gymnastics Stockholm Youth team practice", category: "Sports", hours: 42, date: "Nov 2025" }
  ]);

  const [activeCategory, setActiveCategory] = useState<string>("All");

  const totalHours = logs.reduce((sum, log) => sum + log.hours, 0);
  const categorySummary = {
    Volunteer: logs.filter(l => l.category === "Volunteer").reduce((sum, l) => sum + l.hours, 0),
    Leadership: logs.filter(l => l.category === "Leadership").reduce((sum, l) => sum + l.hours, 0),
    Research: logs.filter(l => l.category === "Research").reduce((sum, l) => sum + l.hours, 0),
    Sports: logs.filter(l => l.category === "Sports").reduce((sum, l) => sum + l.hours, 0)
  };

  const filteredLogs = activeCategory === "All" ? logs : logs.filter(l => l.category === activeCategory);

  return (
    <div className="space-y-8" id="impact-analytics-page">
      {/* Page Title */}
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-900 to-slate-900 -z-10"></div>
        <div className="space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-bold text-indigo-400">
            <BarChart3 className="h-3.5 w-3.5" /> Quantitative Impact Tracker
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Extracurricular Impact Analytics
          </h1>
          <p className="text-slate-400 text-sm">
            Aggregate and model your extracurricular hours. Visualize impact distribution curves and download verified transcripts for admissions reviews.
          </p>
        </div>
        <div className="shrink-0 bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl text-center shadow-xl">
          <div className="text-3xl font-black text-indigo-400">{totalHours} hrs</div>
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mt-1">Total Verified Hours</div>
        </div>
      </div>

      {/* Visual Analytics Bar Chart */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(categorySummary).map(([cat, hrs]) => (
          <div key={cat} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cat}</span>
            <div className="flex items-baseline justify-between">
              <h4 className="text-2xl font-black text-slate-900">{hrs} <span className="text-xs font-semibold text-slate-400">hrs</span></h4>
              <span className="text-xs font-bold text-indigo-600">{Math.round((hrs / totalHours) * 100)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500" style={{ width: `${(hrs / totalHours) * 100}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main hourly logs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
              {["All", "Volunteer", "Leadership", "Research", "Sports"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveCategory(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeCategory === filter ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-950"}`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <button className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1 cursor-pointer">
              <Plus className="h-3.5 w-3.5" /> Log Hours
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              {filteredLogs.map((l) => (
                <div key={l.id} className="p-5 flex items-center justify-between text-sm hover:bg-slate-50/40 transition-colors">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{l.category}</span>
                    <h4 className="font-extrabold text-slate-900">{l.activity}</h4>
                    <span className="text-[10px] text-slate-400">{l.date}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-black text-indigo-600">+{l.hours} <span className="text-xs font-bold text-slate-400">hrs</span></span>
                  </div>
                </div>
              ))}

              {filteredLogs.length === 0 && (
                <p className="p-8 text-center text-sm text-slate-400">No logs matching this category.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-white space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Activity className="h-4 w-4" /> Activity Signal Weights
            </h3>
            <h4 className="text-base font-extrabold leading-tight">Spike Concentration</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your research hours focus representing {categorySummary.Research} hours demonstrates single-spike specialization. Keep scaling your bio-filtration or quantitative arbitrage modeling to hit Elite status.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" /> Registrar Compliance
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Official Transcript lock</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upon counselor approval, logged hours are integrated directly into your Stockholm Gymnasium transcript. Lock files to freeze quarterly records.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
