import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext.tsx";
import { Bookmark, Target, Sparkles, TrendingUp, Zap, Trophy, MessageSquare, ChevronRight, Send, Flame, BrainCircuit, Search, PenTool, User as UserIcon, Globe, GraduationCap, Calendar, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { GenerativeUIProvider, GenerativeUIConfig } from "../components/GenerativeUIProvider";
import { EmptyState } from '../components/EmptyState';
import { AICoachChat } from "../components/Dashboard/AICoachChat";
import { AnimatedCounter } from "../components/ui/AnimatedCounter";
import { Skeleton } from "../components/ui/Skeleton";
import { Card } from "../components/ui/Card";
import { ParticleBackground } from "../components/ParticleBackground";

const SavedOpItem = memo(function SavedOpItem({ op }: { op: any }) {
  return (
    <Link to={`/opportunities/${op.id}`} className="group block border border-slate-200 p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] hover:border-indigo-500/50">
       <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">{op.title}</h4>
       <p className="text-xs text-slate-500 line-clamp-1 mb-3">{op.organization}</p>
       <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-100 transition-colors group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600">View Details</span>
    </Link>
  );
});

const RecommendedOpItem = memo(function RecommendedOpItem({ op, score }: { op: any; score: number }) {
  return (
    <Link 
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
});

export default function Dashboard() {
  const { user, appUser, loading, refreshAppUser } = useAuth();
  const [bookmarkedOps, setBookmarkedOps] = useState<any[]>([]);
  const [recommendedOps, setRecommendedOps] = useState<any[]>([]);
  const [uiConfig, setUiConfig] = useState<GenerativeUIConfig | null>(null);
  const [isUiLoading, setIsUiLoading] = useState(false);

  // Onboarding modal state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardCountry, setOnboardCountry] = useState("");
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
  const getMatchScore = useCallback((op: any, user: any) => {
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
  }, []);

  const sortedRecommendedOps = useMemo(() => {
    return [...recommendedOps]
      .sort((a, b) => {
        const scoreA = getMatchScore(a, appUser);
        const scoreB = getMatchScore(b, appUser);
        return scoreB - scoreA;
      })
      .slice(0, 3);
  }, [recommendedOps, appUser, getMatchScore]);

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
      const rRes = await fetch("/api/opportunities", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (rRes.ok) {
        const rData = await rRes.json();
        const opsArray = rData.results || rData;
        setRecommendedOps(opsArray);
      }
      // Fetch AI Generative UI Config
      setIsUiLoading(true);
      const uiRes = await fetch("/api/dashboard/generative-ui", { headers: { Authorization: `Bearer ${token}` } });
      if (uiRes.ok) {
        const uiData = await uiRes.json();
        setUiConfig(uiData);
      }
      setIsUiLoading(false);
    } catch (err) {
      console.error(err);
      setIsUiLoading(false);
    }
  };

  if (loading) return (
    <div className="p-8 space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
  if (!user) return <Navigate to="/" />;

  return (
    <div className="flex flex-col gap-6 pb-12 p-6 relative">
      <ParticleBackground />
      {/* Welcome & XP Status */}
      <div className="col-span-full bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-4xl font-black text-white tracking-tight">
            Welcome back, <span className="text-indigo-400">{appUser?.name?.split(' ')[0] || "Student"}</span>!
          </h1>
          <p className="text-slate-400 font-medium">Your future is waiting to be built.</p>
        </div>
        
        <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 flex items-center gap-6 min-w-[320px] relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
              <Zap className="h-7 w-7 text-indigo-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">Scholar XP</div>
              <div className="text-2xl font-black text-white"><AnimatedCounter value={appUser?.totalXp || 0} /></div>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-800"></div>
          <div className="flex-1">
             <div className="text-xs font-bold text-slate-500 mb-1">Level 12</div>
             <div className="h-2 w-32 bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-indigo-500 w-4/5"></div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Main Column Items */}
        <div className="lg:col-span-3 space-y-6">
          {uiConfig && (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-400" /> Focus Mode
                </h2>
                <GenerativeUIProvider config={uiConfig} />
              </Card>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <AICoachChat />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card variant="interactive" className="p-6">
                <h3 className="font-bold text-white mb-2">Saved Opportunities</h3>
                {/* ... existing saved ops list ... */}
             </Card>
             <Card variant="interactive" className="p-6">
                <h3 className="font-bold text-white mb-2">Quick Actions</h3>
                {/* ... existing quick actions ... */}
             </Card>
          </div>
        </div>

        {/* Sidebar Column Items */}
        <div className="space-y-6">
          <Card className="p-6">
              <h3 className="font-bold text-white mb-4">Leaderboard</h3>
              {/* ... existing leaderboard ... */}
          </Card>
          <Card className="p-6">
              <h3 className="font-bold text-white mb-4">Recommended</h3>
              {/* ... existing recommendations ... */}
          </Card>
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
