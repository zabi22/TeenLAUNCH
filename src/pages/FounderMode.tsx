import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Rocket, CheckCircle, Flame, Plus, Briefcase, Award, TrendingUp, DollarSign, RefreshCw, Sparkles, ChevronRight } from "lucide-react";

interface Milestone {
  id: string;
  stage: "Ideation" | "MVP Build" | "Validation" | "Launch Prep";
  task: string;
  done: boolean;
}

export default function FounderMode() {
  const [stage, setStage] = useState<"Ideation" | "MVP Build" | "Validation" | "Launch Prep">("Ideation");
  
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: "1", stage: "Ideation", task: "Deconstruct customer pain-points inside Stockholm student networks", done: true },
    { id: "2", stage: "Ideation", task: "Formulate a lean canvas business model structure", done: true },
    { id: "3", stage: "MVP Build", task: "Design high-fidelity user interface wireframes", done: false },
    { id: "4", stage: "MVP Build", task: "Deploy simple landing page with waitlist registration", done: false },
    { id: "5", stage: "Validation", task: "Secure first 100 organic subscriber waitlists", done: false },
    { id: "6", stage: "Launch Prep", task: "Draft pre-seed deck presentations for Swedish teen grants", done: false }
  ]);

  const toggleMilestone = (id: string) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, done: !m.done } : m));
  };

  const getStageProgress = (targetStage: string) => {
    const stageItems = milestones.filter(m => m.stage === targetStage);
    const completedItems = stageItems.filter(m => m.done);
    if (stageItems.length === 0) return 0;
    return Math.round((completedItems.length / stageItems.length) * 100);
  };

  const currentStageMilestones = milestones.filter(m => m.stage === stage);

  return (
    <div className="space-y-8" id="founder-mode-page">
      {/* Title Banner */}
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-900 to-slate-900 -z-10"></div>
        <div className="space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-bold text-amber-400">
            <Rocket className="h-3.5 w-3.5" /> Project Incubator
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Founder Mode: Teen Ventures
          </h1>
          <p className="text-slate-400 text-sm">
            Incubate your non-profit chapters, local SaaS programs, or sustainability projects. Follow guided milestones and track pre-seed funding.
          </p>
        </div>
        <div className="shrink-0 bg-slate-800/40 border border-slate-700/60 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pre-Seed Raised</div>
            <div className="text-xl font-extrabold text-white">$1,250 / $10,000</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Stages Panel & Active Milestones */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Progress Stage Steps */}
          <div className="grid grid-cols-4 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {(["Ideation", "MVP Build", "Validation", "Launch Prep"] as const).map((s) => {
              const progress = getStageProgress(s);
              const isActive = stage === s;
              return (
                <button
                  key={s}
                  onClick={() => setStage(s)}
                  className={`py-3.5 rounded-xl text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    isActive 
                      ? "bg-white text-indigo-600 shadow-sm border border-slate-200" 
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">{s}</span>
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${progress === 100 ? "bg-emerald-100 text-emerald-800" : "bg-indigo-50 text-indigo-700"}`}>
                    {progress}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Milestone checklist */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">INCUBATOR GATEWAY</span>
                <h3 className="font-extrabold text-slate-900 text-lg">{stage} Checklist</h3>
              </div>
              <button className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800">
                <Plus className="h-4 w-4" /> Add Task
              </button>
            </div>

            <div className="space-y-4">
              {currentStageMilestones.map((m) => (
                <div
                  key={m.id}
                  onClick={() => toggleMilestone(m.id)}
                  className={`p-4 border rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-all ${
                    m.done 
                      ? "border-emerald-200 bg-emerald-50/20 text-slate-500" 
                      : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-950 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      m.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white"
                    }`}>
                      {m.done && <span className="text-[10px]">✓</span>}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold">{m.task}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest">{m.stage}</span>
                </div>
              ))}

              {currentStageMilestones.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-6">No milestones defined for this stage.</p>
              )}
            </div>
          </div>

        </div>

        {/* Incubator resource kit sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
              <TrendingUp className="h-5 w-5 text-indigo-600" /> Venture Funding Program
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upon hit of 100% ideation milestones, claim a $500 Swedish innovation voucher to cover domains, hosting, and waitlist campaigns.
            </p>
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl flex justify-between items-center text-xs">
              <span className="font-bold text-indigo-800">Eligibility Status:</span>
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-bold rounded">Approved</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-3xl text-white border border-slate-800 space-y-4">
            <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4" /> Founder Resources
            </div>
            <h4 className="font-bold text-base leading-tight">Elite Pitch Decks</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore 5 winning pre-seed pitch decks used by high-school students to raise up to $50,000 from local Swedish incubators.
            </p>
            <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs cursor-pointer hover:underline">
              Download Deck templates <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
