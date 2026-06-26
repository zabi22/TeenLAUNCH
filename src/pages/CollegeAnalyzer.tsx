import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthContext.tsx";
import { Search, Percent, Target, BookOpen, AlertCircle, ArrowUpRight, Plus, X } from "lucide-react";
import { Navigate } from "react-router-dom";
import { cn } from "../lib/utils.ts";

const COLLEGES = [
  { name: "Harvard University", type: "Reach", baseReq: { gpa: 3.9, sat: 1540 }, tags: ["Ivy League", "Highly Selective"] },
  { name: "Stanford University", type: "Reach", baseReq: { gpa: 3.9, sat: 1520 }, tags: ["Highly Selective", "STEM Focus"] },
  { name: "MIT", type: "Reach", baseReq: { gpa: 3.95, sat: 1550 }, tags: ["STEM Focus", "Highly Selective"] },
  { name: "Yale University", type: "Reach", baseReq: { gpa: 3.9, sat: 1530 }, tags: ["Ivy League"] },
  { name: "Princeton University", type: "Reach", baseReq: { gpa: 3.9, sat: 1530 }, tags: ["Ivy League"] },
  { name: "Columbia University", type: "Reach", baseReq: { gpa: 3.9, sat: 1520 }, tags: ["Ivy League"] },
  { name: "University of Chicago", type: "Reach", baseReq: { gpa: 3.9, sat: 1530 }, tags: ["Highly Selective"] },
  { name: "Northwestern University", type: "Target", baseReq: { gpa: 3.85, sat: 1500 }, tags: ["Selective"] },
  { name: "Duke University", type: "Reach", baseReq: { gpa: 3.9, sat: 1520 }, tags: ["Highly Selective"] },
  { name: "Cornell University", type: "Target", baseReq: { gpa: 3.85, sat: 1480 }, tags: ["Ivy League"] },
  { name: "Carnegie Mellon", type: "Target", baseReq: { gpa: 3.85, sat: 1510 }, tags: ["STEM Focus"] },
  { name: "UC Berkeley", type: "Target", baseReq: { gpa: 3.85, sat: 1450 }, tags: ["Public Ivy"] },
  { name: "UCLA", type: "Target", baseReq: { gpa: 3.8, sat: 1450 }, tags: ["Public Ivy"] },
  { name: "Georgia Tech", type: "Target", baseReq: { gpa: 3.8, sat: 1420 }, tags: ["STEM Focus"] },
  { name: "University of Michigan", type: "Likely", baseReq: { gpa: 3.75, sat: 1400 }, tags: ["Public Ivy"] },
];

export default function CollegeAnalyzer() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedColleges, setSelectedColleges] = useState<any[]>([]);
  const [simulatedGPA, setSimulatedGPA] = useState<number | null>(null);
  const [simulatedSAT, setSimulatedSAT] = useState<number | null>(null);
  const [hasResearchSimulation, setHasResearchSimulation] = useState(false);
  const [hasLeadershipSimulation, setHasLeadershipSimulation] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, any>>({});
  const [loadingAnalysis, setLoadingAnalysis] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const token = await user?.getIdToken();
      
      const pRes = await fetch("/api/academic-profile", { headers: { Authorization: `Bearer ${token}` } });
      if (pRes.ok) {
        const pData = await pRes.json();
        setProfile(pData);
        setSimulatedGPA(pData.gpa);
        setSimulatedSAT(pData.satScore);
      }

      const aRes = await fetch("/api/activities", { headers: { Authorization: `Bearer ${token}` } });
      if (aRes.ok) {
        setActivities(await aRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addCollege = async (c: any) => {
    if (selectedColleges.find(sc => sc.name === c.name)) return;
    setSelectedColleges(prev => [...prev, c]);
    
    setLoadingAnalysis(prev => ({ ...prev, [c.name]: true }));
    
    try {
      const token = await user?.getIdToken();
      const currentStats = getProfileStats();
      const res = await fetch("/api/college/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          college: c.name,
          profile: currentStats,
          activities
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(prev => ({ ...prev, [c.name]: data }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAnalysis(prev => ({ ...prev, [c.name]: false }));
    }
  };

  const removeCollege = (name: string) => {
    setSelectedColleges(prev => prev.filter(c => c.name !== name));
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading...</div>;
  if (!user) return <Navigate to="/" />;

  const filteredColleges = COLLEGES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) && !selectedColleges.find(sc => sc.name === c.name));

  const getProfileStats = () => {
    const hasResearch = activities.some(a => a.type === "Research") || hasResearchSimulation;
    const hasLeadership = activities.some(a => a.type === "Leadership" || a.role?.toLowerCase().includes("president")) || hasLeadershipSimulation;
    
    return {
      gpa: simulatedGPA || profile?.gpa || 0,
      sat: simulatedSAT || profile?.satScore || 0,
      hasResearch,
      hasLeadership,
      apCount: profile?.apCourses || 0
    };
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">College Competitiveness Analyzer</h1>
          <p className="text-slate-500">Analyze your admission probability and run "What If" scenarios.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Scenario Simulator */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" /> Improvement Simulator
            </h3>
            <p className="text-slate-400 text-xs mb-6">Test scenarios to see how your chances change.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Simulate GPA</label>
                <input 
                  type="number" step="0.01" 
                  value={simulatedGPA || ""} 
                  onChange={e => setSimulatedGPA(parseFloat(e.target.value) || null)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Simulate SAT</label>
                <input 
                  type="number" 
                  value={simulatedSAT || ""} 
                  onChange={e => setSimulatedSAT(parseInt(e.target.value) || null)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500" 
                />
              </div>
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={hasLeadershipSimulation} onChange={e => setHasLeadershipSimulation(e.target.checked)} className="rounded text-indigo-500 bg-slate-800 border-slate-700" />
                  Add Leadership Role
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={hasResearchSimulation} onChange={e => setHasResearchSimulation(e.target.checked)} className="rounded text-indigo-500 bg-slate-800 border-slate-700" />
                  Add Research Project
                </label>
              </div>
              
              <button 
                onClick={() => {
                  setSimulatedGPA(profile?.gpa || null);
                  setSimulatedSAT(profile?.satScore || null);
                  setHasLeadershipSimulation(false);
                  setHasResearchSimulation(false);
                }}
                className="w-full mt-4 py-2 text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Reset to Current Profile
              </button>
            </div>
            <button 
              onClick={() => {
                selectedColleges.forEach(c => addCollege(c));
              }}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
            >
              Recalculate Chances
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Search Colleges</h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Find a college..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" 
              />
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {filteredColleges.map(c => (
                <button 
                  key={c.name}
                  onClick={() => addCollege(c)}
                  className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg text-left group"
                >
                  <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600">{c.name}</span>
                  <Plus className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main: Analysis */}
        <div className="lg:col-span-3 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedColleges.map(college => {
              const analysis = aiAnalysis[college.name];
              const isLoading = loadingAnalysis[college.name];
              
              return (
                <div key={college.name} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden flex flex-col">
                  <button 
                    onClick={() => removeCollege(college.name)}
                    className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  
                  <div className="flex justify-between items-start mb-6 pr-8">
                    <div>
                      <h3 className="font-bold text-xl text-slate-900 leading-tight">{college.name}</h3>
                      <div className="flex gap-2 mt-2">
                        {college.tags.map((t: string) => (
                          <span key={t} className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-500">
                      <p className="text-sm font-medium animate-pulse">AI Agent analyzing profile...</p>
                    </div>
                  ) : analysis ? (
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                          <svg className="w-16 h-16 transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" 
                              strokeDasharray={28 * 2 * Math.PI} 
                              strokeDashoffset={(28 * 2 * Math.PI) - ((analysis.chances / 100) * (28 * 2 * Math.PI))}
                              className={cn("transition-all duration-1000", 
                                analysis.chances >= 80 ? "text-emerald-500" : 
                                analysis.chances >= 60 ? "text-amber-500" : "text-rose-500"
                              )} 
                            />
                          </svg>
                          <span className="absolute text-sm font-bold">{analysis.chances}</span>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Probability</div>
                          <div className={cn("text-lg font-bold", 
                            analysis.category === "Reach" ? "text-rose-600" :
                            analysis.category === "Target" ? "text-amber-600" : "text-emerald-600"
                          )}>
                            {analysis.category}
                          </div>
                        </div>
                      </div>

                      <div className="mb-4 text-sm text-slate-700 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                        "{analysis.analysis}"
                      </div>

                      <div className="mt-auto pt-4 border-t border-slate-100 space-y-4">
                        {analysis.strengths?.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Strengths
                            </h4>
                            <ul className="space-y-1">
                              {analysis.strengths.map((msg: string, i: number) => (
                                <li key={i} className="flex gap-2 text-xs text-slate-600">
                                  <span>•</span>
                                  <span>{msg}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {analysis.missing?.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider text-amber-700 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> Growth Areas
                            </h4>
                            <ul className="space-y-1">
                              {analysis.missing.map((msg: string, i: number) => (
                                <li key={i} className="flex gap-2 text-xs text-slate-600">
                                  <span>•</span>
                                  <span>{msg}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-500">
                      <p className="text-sm font-medium">Failed to analyze.</p>
                    </div>
                  )}
                </div>
              );
            })}

            {selectedColleges.length === 0 && (
              <div className="col-span-1 md:col-span-2 text-center py-24 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Select colleges to analyze</h3>
                <p className="text-slate-500">Search and add colleges from the sidebar to compare your profile.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// Needed to import missing icons
function Activity(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
function CheckCircle2(props: any) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    )
}
