import { useState } from "react";
import { useAuth } from "../components/AuthContext.tsx";
import { Map, Flag, CheckCircle2, ChevronRight, Zap, ArrowRight, BrainCircuit, Target, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { Navigate, Link } from "react-router-dom";
import { cn } from "../lib/utils.ts";

export default function Roadmap() {
  const { user, loading } = useAuth();
  const [goal, setGoal] = useState("Computer Science at MIT");
  const [grade, setGrade] = useState("9th Grade");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);

  // Elite Roadmap generation simulation
  const [roadmap, setRoadmap] = useState<any[]>([]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const token = await user?.getIdToken();
      
      // Fetch profile context first to pass to AI
      let profile = {};
      try {
        const pRes = await fetch("/api/academic-profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (pRes.ok) profile = await pRes.json();
      } catch (e) {}

      const res = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ goal, grade, profile })
      });

      if (res.ok) {
        const data = await res.json();
        setRoadmap(data.roadmap || []);
        setShowRoadmap(true);
      } else {
        console.error("Failed to generate roadmap");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <Navigate to="/" />;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Student Roadmap Generator</h1>
          <p className="text-slate-500">Your personalized multi-year strategic plan for college and career.</p>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row gap-6 items-end relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500 rounded-full opacity-10 blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-purple-500 rounded-full opacity-10 blur-3xl transform -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
        
        <div className="flex-1 w-full space-y-4 relative z-10">
          <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-xs mb-2">
            <BrainCircuit className="h-4 w-4" /> Intelligence Engine Ready
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Target Goal</label>
              <div className="relative">
                <Flag className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input 
                  type="text" 
                  value={goal} 
                  onChange={e => setGoal(e.target.value)} 
                  className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-white font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Current Grade Level</label>
              <select 
                value={grade}
                onChange={e => setGrade(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-white font-medium appearance-none"
              >
                <option>9th Grade</option>
                <option>10th Grade</option>
                <option>11th Grade</option>
                <option>12th Grade</option>
              </select>
            </div>
          </div>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full md:w-auto h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-500 focus:outline-none disabled:opacity-70 relative z-10 shrink-0"
        >
          {isGenerating ? "Synthesizing Plan..." : <><Zap className="h-4 w-4" /> Generate Strategy</>}
        </button>
      </div>

      {showRoadmap && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Map className="h-6 w-6 text-indigo-600" /> Strategic Timeline
              </h3>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                12% Complete
              </span>
            </div>
            
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-12 pb-8">
              {roadmap.map((stage, i) => (
                <div key={i} className="relative pl-8">
                  <div className="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-white border-4 border-indigo-600 shadow-sm"></div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <h4 className="text-xl font-bold text-slate-900">{stage.grade}</h4>
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md", 
                      stage.priority === "Critical" ? "bg-rose-100 text-rose-700 border border-rose-200" : "bg-blue-100 text-blue-700 border border-blue-200"
                    )}>
                      {stage.priority} Priority
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {stage.items.map((item: any, j: number) => (
                      <div key={j} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center gap-4 group hover:border-indigo-300 transition-colors">
                        <div className="flex items-center gap-3 flex-1">
                          <button className="text-slate-300 hover:text-emerald-500 transition-colors shrink-0">
                            {item.done ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <div className="h-5 w-5 rounded-full border-2 border-slate-300"></div>}
                          </button>
                          <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{item.type}</div>
                            <span className={cn("text-sm font-semibold", item.done ? 'text-slate-400 line-through' : 'text-slate-900')}>
                              {item.title}
                            </span>
                          </div>
                        </div>
                        {item.hasOp && !item.done && (
                          <Link to="/opportunities" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors ml-8 md:ml-0 self-start md:self-auto shrink-0">
                            View Matches <ArrowRight className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Center Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500 rounded-full opacity-10 blur-2xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                
                <h3 className="font-bold text-white mb-6 flex items-center justify-between text-sm uppercase tracking-wider">
                  <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-400" /> Success Prediction</span>
                  <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-xs border border-emerald-500/20">On Track</span>
                </h3>
                
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-5xl font-black text-white leading-none">78<span className="text-2xl text-slate-400">%</span></span>
                  <span className="text-sm font-medium text-slate-400 mb-1">probability</span>
                </div>

                <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5" /> Pace Warning
                  </div>
                  <p className="text-sm text-slate-300 font-medium leading-relaxed">
                    Falling behind on <strong className="text-white">Leadership</strong> milestones. Secure a role within 30 days to improve projection by +5%.
                  </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" /> Action Center
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" /> This Week
                  </div>
                  <ul className="space-y-3">
                    <li className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="h-4 w-4 mt-0.5 rounded border border-slate-300 shrink-0"></div>
                      <span className="text-sm text-slate-700 font-medium">Research 3 potential hackathons to attend this fall.</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" /> This Month
                  </div>
                  <ul className="space-y-3">
                    <li className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="h-4 w-4 mt-0.5 rounded border border-slate-300 shrink-0"></div>
                      <span className="text-sm text-slate-700 font-medium">Apply for local STEM volunteer tutoring program.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl shadow-sm">
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                <BrainCircuit className="h-4 w-4" /> AI Coach Insight
              </div>
              <p className="text-sm text-indigo-900 font-medium leading-relaxed">
                "You are currently ahead of schedule academically, but you need to focus on securing a leadership position soon to stay competitive for MIT's holistic review process."
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
