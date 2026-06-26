import { useState } from "react";
import { PenTool, BrainCircuit, MessageSquare, Target, Lightbulb, Save, CheckCircle2, AlertCircle, RefreshCw, Send } from "lucide-react";
import { useAuth } from "../components/AuthContext.tsx";
import { Navigate } from "react-router-dom";

export default function EssayAssistant() {
  const { user } = useAuth();
  
  const [mode, setMode] = useState<"brainstorm" | "analyze">("analyze");
  const [prompt, setPrompt] = useState("");
  const [draft, setDraft] = useState("");
  
  // State for AI response
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  const [isBrainstorming, setIsBrainstorming] = useState(false);
  const [brainstormIdeas, setBrainstormIdeas] = useState<any[]>([]);

  if (!user) return <Navigate to="/" />;

  const handleAnalyze = async () => {
    if (!prompt.trim() || !draft.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const authObj = await user.getIdToken();
      const res = await fetch("/api/essay/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authObj}`
        },
        body: JSON.stringify({ prompt, draft })
      });
      
      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
      } else {
        alert("Failed to analyze essay. Please check if your GEMINI_API_KEY is configured.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBrainstorm = async () => {
    if (!prompt.trim()) return;
    
    setIsBrainstorming(true);
    try {
      const authObj = await user.getIdToken();
      const res = await fetch("/api/essay/brainstorm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authObj}`
        },
        body: JSON.stringify({ prompt })
      });
      
      if (res.ok) {
        const data = await res.json();
        setBrainstormIdeas(data.ideas || []);
      } else {
        alert("Failed to brainstorm ideas. Please check if your GEMINI_API_KEY is configured.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred during brainstorming.");
    } finally {
      setIsBrainstorming(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
            <PenTool className="h-8 w-8 text-indigo-600" /> Essay Assistant
          </h1>
          <p className="text-slate-500 font-medium">AI-driven brainstorming, structural feedback, and scoring.</p>
        </div>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setMode("analyze")}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
            mode === "analyze" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Review & Score
        </button>
        <button
          onClick={() => setMode("brainstorm")}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
            mode === "brainstorm" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Brainstorm Ideas
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Input Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-2">Essay Prompt</h3>
            <p className="text-sm text-slate-500 mb-4">Paste the exact prompt from the Common App or University application.</p>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g., Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it. If this sounds like you, then please share your story."
              className="w-full min-h-[120px] bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
            ></textarea>
          </div>

          {mode === "analyze" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900">Your Draft</h3>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                  {draft.trim().split(/\s+/).filter(w => w.length > 0).length} Words
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-4">Paste your current draft here for structural review and scoring.</p>
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Start typing your essay draft here..."
                className="w-full flex-1 min-h-[300px] bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none mb-4"
              ></textarea>
              
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !prompt.trim() || !draft.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-auto"
              >
                {isAnalyzing ? (
                  <><RefreshCw className="h-5 w-5 animate-spin" /> Deep Thinking...</>
                ) : (
                  <><BrainCircuit className="h-5 w-5" /> Analyze Draft</>
                )}
              </button>
            </div>
          )}

          {mode === "brainstorm" && (
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500 rounded-full opacity-10 blur-2xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col h-full items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30">
                  <Lightbulb className="h-8 w-8 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Writer's Block?</h3>
                <p className="text-slate-400 text-sm max-w-sm mb-8 leading-relaxed">
                  Enter an essay prompt above, and our advanced AI will brainstorm highly unique and compelling narrative angles for you to explore.
                </p>
                <button
                  onClick={handleBrainstorm}
                  disabled={isBrainstorming || !prompt.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {isBrainstorming ? (
                    <><RefreshCw className="h-5 w-5 animate-spin" /> Brainstorming...</>
                  ) : (
                    <><SparklesIcon /> Generate Ideas</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Output Column */}
        <div className="space-y-6">
          {mode === "analyze" && (
            analysisResult ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                <div className="flex items-center gap-6 mb-8 border-b border-slate-100 pb-6">
                  <div className="w-24 h-24 rounded-full border-8 border-indigo-100 flex items-center justify-center relative">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-indigo-100 translate-x-2 translate-y-2" />
                      <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray="226.19" strokeDashoffset={226.19 - (226.19 * analysisResult.score) / 100} className="text-indigo-600 translate-x-2 translate-y-2 transition-all duration-1000 ease-out" />
                    </svg>
                    <span className="text-2xl font-black text-slate-900 relative z-10">{analysisResult.score}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Essay Score</h3>
                    <p className="text-sm text-slate-500">Based on structure, narrative, and impact.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-indigo-500" /> Overall Feedback
                    </h4>
                    <ul className="space-y-3">
                      {analysisResult.feedback?.map((fb: string, i: number) => (
                        <li key={i} className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{fb}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                       <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" /> Strengths
                       </h4>
                       <ul className="space-y-2 list-disc pl-4 text-xs font-medium text-emerald-700">
                         {analysisResult.strengths?.map((item: string, i: number) => (
                           <li key={i}>{item}</li>
                         ))}
                       </ul>
                    </div>
                    <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                       <h4 className="text-sm font-bold text-rose-800 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" /> Weaknesses
                       </h4>
                       <ul className="space-y-2 list-disc pl-4 text-xs font-medium text-rose-700">
                         {analysisResult.weaknesses?.map((item: string, i: number) => (
                           <li key={i}>{item}</li>
                         ))}
                       </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-amber-500" /> Structure Suggestions
                    </h4>
                    <ul className="space-y-3 relative border-l-2 border-slate-100 ml-2 pl-4">
                      {analysisResult.structureSuggestions?.map((item: string, i: number) => (
                        <li key={i} className="text-sm text-slate-600 relative">
                           <span className="absolute -left-[21px] top-1.5 w-2 h-2 bg-amber-500 rounded-full ring-4 ring-white"></span>
                           {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                  <PenTool className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">Awaiting Draft</h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  Enter your prompt and draft on the left, then click analyze to get comprehensive AI feedback.
                </p>
              </div>
            )
          )}

          {mode === "brainstorm" && (
            brainstormIdeas.length > 0 ? (
               <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
                    <Lightbulb className="h-5 w-5 text-indigo-600" /> Brainstorm Results
                  </h3>
                  {brainstormIdeas.map((idea: any, i: number) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group">
                      <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        Option {i + 1}: {idea.title}
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {idea.description}
                      </p>
                    </div>
                  ))}
               </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                  <Lightbulb className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">Waiting for Prompt</h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  Enter your essay prompt to generate unique ideas and narrative angles.
                </p>
              </div>
            )
          )}

        </div>
      </div>
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </svg>
  );
}
