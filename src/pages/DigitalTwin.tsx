import React, { useState } from "react";
import { Sparkles, BrainCircuit, Target, TrendingUp, AlertTriangle, CheckCircle, ArrowRight, Activity, Map, Navigation } from "lucide-react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../components/AuthContext.tsx";

export default function DigitalTwin() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/twin/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetGoal: "MIT Computer Science" })
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BrainCircuit className="h-8 w-8 text-indigo-500" />
            Student Digital Twin & Gap Analysis
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Your predictive AI profile that learns your goals and reverse-engineers success.
          </p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading || !user}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {loading ? 'Running Predictive Model...' : 'Run Gap Analysis'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "College Readiness", score: analysis?.readiness?.college || 75, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Scholarship Readiness", score: analysis?.readiness?.scholarship || 60, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Internship Readiness", score: analysis?.readiness?.internship || 45, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Research Readiness", score: analysis?.readiness?.research || 30, color: "text-rose-600", bg: "bg-rose-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} w-fit mb-4`}>
              <Activity className="h-6 w-6" />
            </div>
            <div className="relative z-10">
              <div className="flex items-end gap-2 mb-1">
                <h3 className="text-4xl font-black text-slate-900">{stat.score}</h3>
                <span className="text-sm text-slate-500 font-bold mb-1">/ 100</span>
              </div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            </div>
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${stat.bg} opacity-50 group-hover:scale-150 transition-transform duration-500`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Gap Analysis Engine</h2>
                <p className="text-sm text-slate-500">Missing profile components for your target (MIT CS)</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {!analysis ? (
                <div className="text-center py-8 text-slate-500">
                  Click "Run Gap Analysis" to identify missing components.
                </div>
              ) : (
                analysis.gaps.map((gap: any, i: number) => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="flex gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                    <div className="mt-1">
                      {gap.severity === "High" ? <AlertTriangle className="h-5 w-5 text-rose-500" /> : <Activity className="h-5 w-5 text-amber-500" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 flex items-center gap-2">
                        {gap.title}
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${gap.severity === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                          {gap.severity} Priority
                        </span>
                      </h4>
                      <p className="text-sm text-slate-600 mt-1">{gap.description}</p>
                      <div className="mt-3 bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl">
                        <span className="text-xs font-bold text-indigo-700 block mb-1">AI Recommendation:</span>
                        <p className="text-sm text-indigo-900">{gap.recommendation}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl shadow-xl overflow-hidden text-white relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            <div className="p-6 border-b border-slate-800 bg-slate-800/50 flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                <Map className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">Opportunity Roadmap</h2>
                <p className="text-sm text-indigo-300">Generated sequence to reach MIT CS</p>
              </div>
            </div>
            <div className="p-6 relative z-10">
              {!analysis ? (
                <div className="text-center py-8 text-slate-400">
                  Run analysis to generate roadmap.
                </div>
              ) : (
                <div className="relative border-l-2 border-indigo-500/30 ml-4 space-y-8 pb-4">
                  {analysis.roadmap.map((step: any, i: number) => (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + (i * 0.1) }} key={i} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-slate-900" />
                      <div className="text-xs font-bold text-indigo-400 mb-1">{step.timeframe}</div>
                      <h4 className="font-bold text-white text-lg">{step.action}</h4>
                      <div className="prose prose-sm prose-invert mt-2 text-slate-300">
                        <ReactMarkdown>{step.details}</ReactMarkdown>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-1 shadow-lg mb-4">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center relative overflow-hidden">
                <BrainCircuit className="h-10 w-10 text-indigo-500 relative z-10" />
                <div className="absolute inset-0 bg-indigo-50 animate-pulse" />
              </div>
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Digital Twin Sync</h3>
            <p className="text-sm text-slate-500 mt-2 mb-6">
              Your AI twin continuously monitors the web for opportunities matching your profile gap areas.
            </p>
            <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-100">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-500 font-medium">Confidence Score</span>
                <span className="font-bold text-emerald-600">82%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[82%]" />
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">
                Updating predictive model daily
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
