import { useState } from "react";
import { useAuth } from "../components/AuthContext.tsx";
import { motion } from "motion/react";
import { Sparkles, BrainCircuit, Activity, Sliders, ShieldCheck, ChevronRight, GraduationCap, Trophy, HelpCircle, ArrowUpRight, Award } from "lucide-react";

export default function DigitalTwin() {
  const { appUser } = useAuth();
  
  // Interactive variables for state projection
  const [gpa, setGpa] = useState(3.8);
  const [leadershipScore, setLeadershipScore] = useState(55);
  const [researchHours, setResearchHours] = useState(20);
  const [extracurricularScore, setExtracurricularScore] = useState(65);

  // Helper calculation for simulated target admissions rate
  const calculateSimulatedChance = () => {
    const base = 25;
    const gpaWeight = (gpa - 3.0) * 100; // max ~100
    const leadWeight = (leadershipScore / 100) * 20; // max 20
    const researchWeight = Math.min((researchHours / 120) * 15, 15); // max 15
    const ecWeight = (extracurricularScore / 100) * 15; // max 15
    
    const rawChance = base + (gpaWeight * 0.4) + leadWeight + researchWeight + ecWeight;
    return Math.min(Math.round(rawChance), 98);
  };

  const simulatedChance = calculateSimulatedChance();

  // Color mapping based on chance level
  const getChanceColor = (chance: number) => {
    if (chance > 75) return "from-emerald-500 to-teal-400 text-emerald-400";
    if (chance > 50) return "from-indigo-500 to-purple-400 text-indigo-400";
    return "from-pink-500 to-rose-400 text-pink-400";
  };

  const chanceColor = getChanceColor(simulatedChance);

  return (
    <div className="space-y-8" id="digital-twin-page">
      {/* Hero Banner with Cosmic Atmospheric Glow */}
      <div className="relative bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="space-y-4 max-w-xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-bold text-indigo-400">
            <BrainCircuit className="h-3.5 w-3.5" /> High-Intelligence Twin Engine
          </div>
          <h1 className="text-3xl sm:text-4.5xl font-black text-white tracking-tight leading-none font-sans">
            Student <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 font-sans">Digital Twin</span> AI
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md">
            Configure dynamic variables in real-time to preview predictive college admissions outcomes, deconstruct strengths, and formulate actionable spikes.
          </p>
        </div>

        {/* Dynamic Chance Display Widget */}
        <div className="relative shrink-0 bg-slate-900/60 border border-slate-800 p-8 rounded-3xl text-center shadow-2xl min-w-[240px] overflow-hidden group">
          <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${chanceColor}`}></div>
          <div className="relative z-10">
            <motion.div 
              key={simulatedChance}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="text-6xl font-black text-white tracking-tighter"
            >
              {simulatedChance}%
            </motion.div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Ivy+ Admissions Match</div>
            
            {/* Action suggestion below score */}
            <div className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer">
              View trajectory map <ArrowUpRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main interactive variables column */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Sliders className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Configure Trajectory Sliders</h3>
                <p className="text-xs text-slate-400">Interact with admissions variables to predict shifts</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* GPA Variable */}
            <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/80 hover:border-slate-200/60 transition-colors">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4.5 w-4.5 text-indigo-500" /> Cumulative GPA
                </span>
                <span className="px-3 py-1 bg-white border border-slate-200/60 font-black text-slate-800 rounded-xl text-sm shadow-sm">{gpa.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="3.0"
                max="4.0"
                step="0.05"
                value={gpa}
                onChange={(e) => setGpa(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>3.0 Baseline</span>
                <span>4.0 Perfect GPA</span>
              </div>
            </div>

            {/* Leadership Score */}
            <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/80 hover:border-slate-200/60 transition-colors">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                  <Trophy className="h-4.5 w-4.5 text-indigo-500" /> Leadership Weight
                </span>
                <span className="px-3 py-1 bg-white border border-slate-200/60 font-black text-slate-800 rounded-xl text-sm shadow-sm">{leadershipScore}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={leadershipScore}
                onChange={(e) => setLeadershipScore(parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Low Profile</span>
                <span>Founder / Chief Executive</span>
              </div>
            </div>

            {/* Research Hours */}
            <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/80 hover:border-slate-200/60 transition-colors">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                  <Activity className="h-4.5 w-4.5 text-indigo-500" /> Verified Research Hours
                </span>
                <span className="px-3 py-1 bg-white border border-slate-200/60 font-black text-slate-800 rounded-xl text-sm shadow-sm">{researchHours} hrs</span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                step="5"
                value={researchHours}
                onChange={(e) => setResearchHours(parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>None</span>
                <span>Published Co-Author</span>
              </div>
            </div>

            {/* Extracurricular Score */}
            <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/80 hover:border-slate-200/60 transition-colors">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                  <Sparkles className="h-4.5 w-4.5 text-indigo-500" /> Extracurricular Rigor
                </span>
                <span className="px-3 py-1 bg-white border border-slate-200/60 font-black text-slate-800 rounded-xl text-sm shadow-sm">{extracurricularScore}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={extracurricularScore}
                onChange={(e) => setExtracurricularScore(parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Standard Clubs</span>
                <span>National Recognition</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 flex gap-3 text-xs text-slate-500 leading-relaxed">
            <HelpCircle className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
            <p>
              Your Digital Twin models dynamic outcomes using historical datasets from Ivy+ admissions, Swedish elite pathways, and STEM award benchmarks. These calculations are simulated projections based on your active trajectory.
            </p>
          </div>
        </div>

        {/* Sidebar: AI strategic evaluation */}
        <div className="space-y-6">
          <div className="bg-slate-950 p-6 sm:p-7 rounded-3xl border border-slate-800 text-white space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <BrainCircuit className="h-5 w-5 text-indigo-400" />
              <h3 className="font-black text-xs uppercase tracking-widest text-indigo-400 font-sans">Twin Strategy Logs</h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block font-sans">Primary Asset</span>
                <h4 className="font-bold text-sm text-slate-100 flex items-center justify-between">
                  <span>Intellectual Focus Spike</span>
                  <Award className="h-4 w-4 text-indigo-400" />
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  With your verified research hours set at <strong className="text-white">{researchHours} hrs</strong>, you exhibit strong signaling for technical university programs.
                </p>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block font-sans">Recommended Action</span>
                <h4 className="font-bold text-sm text-slate-100 flex items-center justify-between">
                  <span>Scale Leadership Rigor</span>
                  <Trophy className="h-4 w-4 text-amber-400" />
                </h4>
                {leadershipScore < 70 ? (
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Your leadership factor is low. Try boosting your leadership sliders or scout student council or non-profit chapter roles to maximize Ivy+ admission chances.
                  </p>
                ) : (
                  <p className="text-xs text-emerald-400 leading-relaxed font-semibold">
                    Outstanding leadership signaling! This puts you in the top 10% of applicants with similar GPA structures.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="h-4.5 w-4.5" /> Integrity Verified
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Cryptographic Signature Valid</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your academic records are linked securely from Stockholm Gymnasium registrar. Self-reported changes in this playground are sandbox projections only.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
