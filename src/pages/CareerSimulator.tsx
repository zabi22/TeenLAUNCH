import { useState } from "react";
import { Briefcase, ArrowRight, BrainCircuit, GraduationCap, DollarSign, Target, Sparkles, Clock } from "lucide-react";
import { useAuth } from "../components/AuthContext.tsx";
import { Navigate } from "react-router-dom";

export default function CareerSimulator() {
  const { user } = useAuth();
  const [selectedCareer, setSelectedCareer] = useState("Software Engineer");
  const [simulating, setSimulating] = useState(false);

  if (!user) return <Navigate to="/" />;

  const careers = [
    "Software Engineer", "Investment Banker", "Corporate Lawyer", 
    "Product Manager", "Medical Doctor", "Management Consultant",
    "Data Scientist", "UI/UX Designer"
  ];

  const handleSimulate = () => {
    setSimulating(true);
    setTimeout(() => setSimulating(false), 1500);
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
          <Briefcase className="h-8 w-8 text-indigo-600" /> Career Simulator
        </h1>
        <p className="text-slate-500 font-medium">Map out the exact path to your dream profession.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Select Target Career</h2>
        <div className="flex flex-wrap gap-3 mb-6">
          {careers.map(career => (
            <button
              key={career}
              onClick={() => setSelectedCareer(career)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                selectedCareer === career
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              {career}
            </button>
          ))}
          <button className="px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Custom
          </button>
        </div>
        <button 
          onClick={handleSimulate}
          disabled={simulating}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {simulating ? (
            <><div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div> Running Simulation...</>
          ) : (
            <><BrainCircuit className="h-5 w-5" /> Generate Path</>
          )}
        </button>
      </div>

      {!simulating && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 mb-6">{selectedCareer} Pathway</h2>
              
              <div className="relative border-l-2 border-indigo-100 ml-3 md:ml-4 space-y-8 pb-4">
                
                {/* Step 1 */}
                <div className="relative pl-8">
                  <div className="absolute -left-[11px] top-1 w-5 h-5 bg-white border-4 border-indigo-500 rounded-full"></div>
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">High School (Current)</div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">Build the Foundation</h3>
                  <p className="text-sm text-slate-600 mb-4">Focus on rigorous STEM coursework and early programming exposure.</p>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Target className="h-4 w-4 text-emerald-500" /> AP Computer Science A
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Target className="h-4 w-4 text-emerald-500" /> Participate in USACO (Bronze/Silver)
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Target className="h-4 w-4 text-emerald-500" /> Build 2 personal full-stack projects
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative pl-8">
                  <div className="absolute -left-[11px] top-1 w-5 h-5 bg-white border-4 border-slate-300 rounded-full"></div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Undergrad (Years 1-2)</div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">B.S. in Computer Science</h3>
                  <p className="text-sm text-slate-600 mb-4">Secure fundamentals in Data Structures and Algorithms. Land first internship.</p>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Target className="h-4 w-4 text-slate-400" /> Maintain 3.7+ GPA in Core Classes
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Target className="h-4 w-4 text-slate-400" /> Secure Sophomore Summer Internship
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative pl-8">
                  <div className="absolute -left-[11px] top-1 w-5 h-5 bg-white border-4 border-slate-300 rounded-full"></div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Undergrad (Years 3-4)</div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">Specialization & FAANG Prep</h3>
                  <p className="text-sm text-slate-600">Master LeetCode Medium/Hard. Secure Junior Year SWE Internship at top tech firm for return offer.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl text-white">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-400" /> Market Insights
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Entry Level (0-2 YOE)</div>
                  <div className="text-2xl font-black text-emerald-400">$120k - $160k</div>
                  <div className="text-xs text-slate-500 mt-1">Total Compensation</div>
                </div>
                <div className="h-px w-full bg-slate-800"></div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Mid Level (3-5 YOE)</div>
                  <div className="text-2xl font-black text-white">$180k - $250k</div>
                </div>
                <div className="h-px w-full bg-slate-800"></div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Senior (5+ YOE)</div>
                  <div className="text-2xl font-black text-white">$250k - $400k+</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-600" /> Target Degrees
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div> B.S. Computer Science
                </li>
                <li className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div> B.S. Software Engineering
                </li>
                <li className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div> B.S. Math / Computation
                </li>
              </ul>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
