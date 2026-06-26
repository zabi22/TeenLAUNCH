import { useState, useEffect, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext.tsx";
import { Bookmark, Target, Sparkles, TrendingUp, Zap, Trophy, MessageSquare, ChevronRight, Send, Flame, BrainCircuit, Search, PenTool, User as UserIcon, Globe, GraduationCap, Calendar, MapPin } from "lucide-react";
import Markdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";

export default function Dashboard() {
  const { user, appUser, loading, refreshAppUser } = useAuth();
  const [bookmarkedOps, setBookmarkedOps] = useState<any[]>([]);
  const [recommendedOps, setRecommendedOps] = useState<any[]>([]);
  
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Onboarding modal state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardCountry, setOnboardCountry] = useState("United States");
  const [onboardGrade, setOnboardGrade] = useState("");

  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Germany",
    "France",
    "India",
    "Singapore",
    "United Arab Emirates",
    "Saudi Arabia",
    "South Africa",
    "Brazil",
    "Mexico",
    "Japan",
    "South Korea",
    "Other"
  ];

  // Helper to calculate opportunity match score based on user profile
  const getMatchScore = (op: any, user: any) => {
    if (!user) return 70; // baseline
    let score = 70;
    if (op.country && user.country && op.country.toLowerCase() === user.country.toLowerCase()) {
      score += 15;
    } else if (op.country?.toLowerCase() === "global" || !op.country) {
      score += 10;
    }
    
    if (user.grade && op.gradeLevel) {
      if (op.gradeLevel.toLowerCase().includes(user.grade.toLowerCase()) || op.gradeLevel.toLowerCase() === "all") {
        score += 10;
      }
    }
    
    if (user.interests && op.description) {
      const userInterests = user.interests.toLowerCase().split(",").map((i: string) => i.trim());
      const hasInterest = userInterests.some((interest: string) => 
        interest && (op.description.toLowerCase().includes(interest) || op.title.toLowerCase().includes(interest))
      );
      if (hasInterest) {
        score += 4;
      }
    }
    return Math.min(score, 99);
  };

  useEffect(() => {
    if (appUser) {
      // Onboarding is mandatory if either grade or country is not set
      if (!appUser.grade || !appUser.country) {
        setShowOnboarding(true);
        setOnboardCountry(appUser.country || "");
        setOnboardGrade(appUser.grade || "");
      }
    }
  }, [appUser]);

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardGrade || !onboardCountry) return;
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/users/me", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          grade: onboardGrade,
          country: onboardCountry,
          interests: appUser?.interests || "",
          goals: appUser?.goals || ""
        })
      });
      if (res.ok) {
        await refreshAppUser();
        setShowOnboarding(false);
      }
    } catch (err) {
      console.error("Onboarding failed:", err);
    }
  };

  useEffect(() => {
    if (appUser) {
       setChatHistory([
        {
          role: "model",
          text: `Hi ${appUser.name?.split(' ')[0] || "there"}! I reviewed your **Academic Profile** and **Roadmap** this morning.\n\nYour academics are strong (3.9 GPA), but your **Leadership** category is currently your weakest area for highly selective universities. I found 3 new club leadership opportunities you can apply for this week.\n\nShould we add "Secure Leadership Role" to your immediate action plan?`
        }
      ]);
    }
  }, [appUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    
    const message = chatInput;
    setChatInput("");
    
    const newHistory = [...chatHistory, { role: "user", text: message }];
    setChatHistory(newHistory);
    setIsChatLoading(true);

    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/coach/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message, history: chatHistory })
      });

      if (res.ok) {
        const data = await res.json();
        setChatHistory([...newHistory, { role: "model", text: data.text }]);
      } else {
        setChatHistory([...newHistory, { role: "model", text: "I'm sorry, I'm having trouble connecting right now. Please check if your GEMINI_API_KEY is configured." }]);
      }
    } catch (err) {
      console.error(err);
      setChatHistory([...newHistory, { role: "model", text: "I encountered an error trying to respond. Please try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, appUser]);

  const fetchDashboardData = async () => {
    try {
      const token = await user?.getIdToken();
      // Fetch Bookmarks
      const bRes = await fetch("/api/bookmarks", { headers: { Authorization: `Bearer ${token}` } });
      if (bRes.ok) {
        const bData = await bRes.json();
        setBookmarkedOps(bData.map((b: any) => b.opportunity));
      }
      // Personalized recommendations sorted by match score based on user profile
      const rRes = await fetch("/api/opportunities");
      if (rRes.ok) {
        const rData = await rRes.json();
        const sorted = [...rData].sort((a, b) => {
          const scoreA = getMatchScore(a, appUser);
          const scoreB = getMatchScore(b, appUser);
          return scoreB - scoreA;
        });
        setRecommendedOps(sorted.slice(0, 3));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading...</div>;
  if (!user) return <Navigate to="/" />;

  return (
    <div className="flex flex-col gap-8 pb-12">
      
      {/* Welcome & XP Status */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {appUser?.name?.split(' ')[0] || "Student"}!</h1>
          <p className="text-slate-500">Ready to level up your future today?</p>
        </div>
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Zap className="h-6 w-6 text-white fill-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Level 12 • Scholar</div>
              <div className="text-xl font-black text-slate-900 leading-none">1,250 <span className="text-sm font-semibold text-slate-500">XP</span></div>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-200"></div>
          <div className="w-48">
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-400">Progress to Lvl 13</span>
              <span className="text-indigo-600">80%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full w-4/5"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column: AI Coach & Action Center */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Mentor Centerpiece */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-800 bg-slate-800/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                <BrainCircuit className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white leading-tight">TeenLaunch AI Coach</h3>
                <p className="text-xs font-medium text-indigo-400">Always-available Strategic Mentor</p>
              </div>
              <div className="ml-auto flex gap-2">
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Online
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${msg.role === 'model' ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                    {msg.role === 'model' ? <BrainCircuit className="h-4 w-4 text-white" /> : <UserIcon className="h-4 w-4 text-white" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] ${
                    msg.role === 'model' 
                      ? 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none' 
                      : 'bg-indigo-600 text-white rounded-tr-none'
                  }`}>
                    <div className="markdown-body text-current [&>*:last-child]:mb-0 [&>*:first-child]:mt-0 prose-sm prose-invert max-w-none">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 shrink-0 flex items-center justify-center">
                    <BrainCircuit className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-slate-800 border border-slate-700 text-slate-200 p-4 rounded-2xl rounded-tl-none text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 bg-slate-800/50 border-t border-slate-800">
              <div className="relative">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask your AI mentor for advice..." 
                  className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-indigo-500" 
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isChatLoading || !chatInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Elite Challenges */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Flame className="h-5 w-5 text-rose-500 fill-rose-500" /> Elite Weekly Challenges
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-1">Challenge</div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">Submit 1 Scholarship</h4>
                  <p className="text-xs text-slate-600 mb-4">Find and submit a scholarship application before Sunday.</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-rose-600">+100 XP</span>
                  <button className="text-xs font-bold bg-white text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">Accept</button>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Challenge</div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">Volunteer 5 Hours</h4>
                  <p className="text-xs text-slate-600 mb-4">Complete 5 hours of community service this week.</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-amber-600">+50 XP</span>
                  <div className="w-full max-w-[100px] h-2 bg-amber-200 rounded-full overflow-hidden ml-2">
                    <div className="h-full bg-amber-500 w-3/5 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <Link to="/opportunities" className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow group">
                <div className="rounded-full bg-indigo-100 p-2 w-fit text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Search className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-1">AI Scout</h3>
                <p className="text-xs text-slate-600">3 new opportunities found</p>
              </Link>
              <Link to="/analyzer" className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow group">
                <div className="rounded-full bg-blue-100 p-2 w-fit text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Target className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-1">College Analyzer</h3>
                <p className="text-xs text-slate-600">Update target schools</p>
              </Link>
              <Link to="/roadmap" className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow group">
                <div className="rounded-full bg-emerald-100 p-2 w-fit text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-1">Roadmap</h3>
                <p className="text-xs text-slate-600">You are on track</p>
              </Link>
          </div>

        </div>

        {/* Sidebar Column: Leaderboard & Quick Tools */}
        <div className="space-y-6">
          
          {/* National Leaderboard snippet */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" /> National Rank
              </h3>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">Top 5%</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-6 font-bold text-slate-400 text-sm text-center">1</div>
                <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">Sarah J.</div>
                  <div className="text-xs text-slate-500">14,200 XP</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-indigo-50 border border-indigo-100">
                <div className="w-6 font-bold text-indigo-600 text-sm text-center">42</div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {appUser?.name?.charAt(0) || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">You</div>
                  <div className="text-xs text-indigo-600 font-medium">1,250 XP</div>
                </div>
              </div>
            </div>
            <button className="w-full mt-4 text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center justify-center gap-1">
              View Full Leaderboard <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {/* Recommended Opportunities Panel */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Sparkles className="h-4 w-4 text-indigo-500" /> Recommended For You
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Prioritized for {appUser?.country || "Global"}</p>
              </div>
              <Link to="/opportunities" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {recommendedOps.length > 0 ? (
                recommendedOps.map((op) => {
                  const score = getMatchScore(op, appUser);
                  
                  return (
                    <Link 
                      key={op.id} 
                      to={`/opportunities/${op.id}`}
                      className="block p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all hover:border-indigo-200 group relative"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-bold rounded-md">
                          {op.category}
                        </span>
                        <span className="text-[10px] font-black text-indigo-600 shrink-0">
                          {score}% Match
                        </span>
                      </div>
                      
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-0.5">
                        {op.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 mb-2 line-clamp-1">
                        {op.organization}
                      </p>
                      
                      <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium border-t border-slate-100/60 pt-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5 shrink-0" />
                          {op.isRemote ? "Virtual" : (op.location || "Varies")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-2.5 w-2.5 shrink-0" />
                          {op.deadline ? new Date(op.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : "Rolling"}
                        </span>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  No direct recommendations found. Complete your profile for better suggestions!
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/essay" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-sm font-semibold text-slate-700">
                <div className="bg-slate-100 p-2 rounded-lg text-slate-600"><PenTool className="h-4 w-4" /></div>
                Essay Assistant
              </Link>
              <Link to="/vault" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-sm font-semibold text-slate-700">
                <div className="bg-slate-100 p-2 rounded-lg text-slate-600"><Bookmark className="h-4 w-4" /></div>
                Upload Certificate
              </Link>
              <Link to="/founder" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-sm font-semibold text-slate-700">
                <div className="bg-slate-100 p-2 rounded-lg text-slate-600"><Zap className="h-4 w-4" /></div>
                Start Founder Project
              </Link>
              <Link to="/career" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-sm font-semibold text-slate-700">
                <div className="bg-slate-100 p-2 rounded-lg text-slate-600"><MessageSquare className="h-4 w-4" /></div>
                Career Simulator
              </Link>
            </div>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-indigo-600 shadow-inner">
                  <Globe className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Welcome to TeenLaunch!</h2>
                <p className="text-slate-500 text-sm mt-1">Let's customize your global discovery engine.</p>
              </div>

              <form onSubmit={handleOnboardSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-indigo-500" /> Country of Residence
                  </label>
                  <select
                    value={onboardCountry}
                    onChange={(e) => setOnboardCountry(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 bg-slate-50 font-medium shadow-sm"
                    required
                  >
                    <option value="">Select your country</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1.5">We'll prioritize local scholarships, internships, and opportunities first.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-indigo-500" /> Grade Level
                  </label>
                  <select
                    value={onboardGrade}
                    onChange={(e) => setOnboardGrade(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 bg-slate-50 font-medium shadow-sm"
                    required
                  >
                    <option value="">Select your grade</option>
                    <option value="9th Grade">9th Grade</option>
                    <option value="10th Grade">10th Grade</option>
                    <option value="11th Grade">11th Grade</option>
                    <option value="12th Grade">12th Grade</option>
                    <option value="College Freshman">College Freshman</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Start Discovering Opportunities
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
