import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../components/AuthContext.tsx";
import { motion } from "motion/react";
import { Trophy, Zap, Award, Globe, Loader2, Flame } from "lucide-react";

interface LeaderboardUser {
  id: number;
  name: string;
  avatarUrl?: string;
  headline: string;
  country: string;
  grade?: string;
  score: number;
  rank: number;
  activitiesCount: number;
  postsCount: number;
}

export default function Leaderboard() {
  const { appUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"national" | "global">("national");
  const [allRealUsers, setAllRealUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch("/api/social/leaderboard");
        if (res.ok) {
          const data = await res.json();
          setAllRealUsers(data);
        }
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const getLevel = (score: number) => {
    return Math.max(1, Math.floor((score || 0) / 150) + 1);
  };

  const filteredUsers = useMemo(() => {
    let list = allRealUsers;
    if (activeTab === "national" && appUser?.country) {
      list = allRealUsers.filter(u => u.country?.toLowerCase() === appUser.country?.toLowerCase());
    }
    return list.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
  }, [allRealUsers, activeTab, appUser]);

  const currentUserEntry = useMemo(() => {
    return allRealUsers
      .map((u, idx) => ({ ...u, globalRank: idx + 1 }))
      .find(u => u.id === appUser?.id);
  }, [allRealUsers, appUser]);

  const rank1 = filteredUsers[0] || null;
  const rank2 = filteredUsers[1] || null;
  const rank3 = filteredUsers[2] || null;

  const runnersUp = useMemo(() => {
    return filteredUsers.slice(3);
  }, [filteredUsers]);

  const challenges = [
    { id: 1, title: "Essay Mastery", desc: "Submit your first essay draft to the Essay Assistant", xp: 350, completed: false },
    { id: 2, title: "Opportunity Scout", desc: "Save 3 personalized opportunities to your portfolio", xp: 150, completed: true },
    { id: 3, title: "Strategy Alignment", desc: "Align 2 new goals inside your Strategic Roadmap", xp: 200, completed: false },
  ];

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium">Computing live scholar rankings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8" id="leaderboard-page">
      {/* Hero Banner */}
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-900 to-slate-900 -z-10"></div>
        <div className="space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-bold text-amber-400">
            <Trophy className="h-3.5 w-3.5" /> Dynamic Leaderboard
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Scholars with Dynamic Academic Standing
          </h1>
          <p className="text-slate-400 text-sm">
            Strictly real-user rankings based on achievements, active portfolios, verifying awards, and strategic roadmap alignments. No fake players.
          </p>
        </div>
        <div className="shrink-0 bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Zap className="h-6 w-6 fill-white" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Position</div>
            <div className="text-xl font-extrabold text-white">
              {currentUserEntry ? `Rank #${currentUserEntry.globalRank}` : "Not Ranked"}{" "}
              <span className="text-xs font-medium text-slate-500">Global</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Podium and Runners List */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Toggle Tab */}
          <div className="flex bg-slate-200/60 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab("national")}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "national" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-950"}`}
            >
              {appUser?.country || "Sweden"} National Rank
            </button>
            <button
              onClick={() => setActiveTab("global")}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "global" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-950"}`}
            >
              Global Network
            </button>
          </div>

          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end pt-8">
            
            {/* Rank 2 (Left) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center flex-1"
            >
              {rank2 ? (
                <>
                  <div className="relative group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 border-4 border-slate-300 flex items-center justify-center font-bold text-lg text-slate-700 shadow-lg overflow-hidden">
                      {rank2.avatarUrl ? (
                        <img referrerPolicy="no-referrer" src={rank2.avatarUrl} alt={rank2.name} className="w-full h-full object-cover" />
                      ) : (
                        rank2.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-400 text-white font-black text-xs px-2 py-0.5 rounded-full shadow-md">
                      #2
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-800 truncate max-w-[80px] sm:max-w-[120px]">{rank2.name}</h3>
                    <p className="text-[10px] text-slate-400 font-medium truncate max-w-[100px]">{rank2.headline || "Scholar"}</p>
                    <div className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-slate-600">
                      <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
                      {rank2.score} XP
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative group opacity-50">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-50 border-4 border-dashed border-slate-200 flex items-center justify-center font-bold text-lg text-slate-300">
                      ?
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-500 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                      #2
                    </div>
                  </div>
                  <div className="text-center mt-4 opacity-50">
                    <h3 className="font-bold text-xs text-slate-400">Position Open</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Earn XP to Claim</p>
                  </div>
                </>
              )}
            </motion.div>

            {/* Rank 1 (Center) */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center flex-1"
            >
              {rank1 ? (
                <>
                  <div className="relative group">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                      <Award className="h-7 w-7 fill-amber-500" />
                    </div>
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-4 border-amber-400 flex items-center justify-center font-bold text-2xl text-white shadow-xl overflow-hidden shadow-amber-500/20">
                      {rank1.avatarUrl ? (
                        <img referrerPolicy="no-referrer" src={rank1.avatarUrl} alt={rank1.name} className="w-full h-full object-cover" />
                      ) : (
                        rank1.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-black text-xs px-3 py-1 rounded-full shadow-md">
                      👑 #1
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate max-w-[100px] sm:max-w-[140px]">{rank1.name}</h3>
                    <p className="text-[10px] text-indigo-600 font-semibold truncate max-w-[120px]">{rank1.headline || "Top Scholar"}</p>
                    <div className="mt-1 inline-flex items-center gap-1 text-sm font-black text-amber-600">
                      <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      {rank1.score} XP
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative group opacity-50">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-50 border-4 border-dashed border-slate-200 flex items-center justify-center font-bold text-2xl text-slate-300">
                      ?
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-500 font-bold text-[10px] px-3 py-1 rounded-full shadow-sm">
                      👑 #1
                    </div>
                  </div>
                  <div className="text-center mt-4 opacity-50">
                    <h3 className="font-bold text-xs text-slate-400">Claim the Crown</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Rank #1 is Open</p>
                  </div>
                </>
              )}
            </motion.div>

            {/* Rank 3 (Right) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center flex-1"
            >
              {rank3 ? (
                <>
                  <div className="relative group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-orange-50 border-4 border-orange-200 flex items-center justify-center font-bold text-lg text-orange-700 shadow-lg overflow-hidden">
                      {rank3.avatarUrl ? (
                        <img referrerPolicy="no-referrer" src={rank3.avatarUrl} alt={rank3.name} className="w-full h-full object-cover" />
                      ) : (
                        rank3.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-400 text-white font-black text-xs px-2 py-0.5 rounded-full shadow-md">
                      #3
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-800 truncate max-w-[80px] sm:max-w-[120px]">{rank3.name}</h3>
                    <p className="text-[10px] text-slate-400 font-medium truncate max-w-[100px]">{rank3.headline || "Scholar"}</p>
                    <div className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-slate-600">
                      <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
                      {rank3.score} XP
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative group opacity-50">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-50 border-4 border-dashed border-slate-200 flex items-center justify-center font-bold text-lg text-slate-300">
                      ?
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-500 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                      #3
                    </div>
                  </div>
                  <div className="text-center mt-4 opacity-50">
                    <h3 className="font-bold text-xs text-slate-400">Position Open</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Sweden Rank #3</p>
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* Runners Up Table List */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest px-6">
              <span className="w-12">Rank</span>
              <span className="flex-1">Scholar</span>
              <span className="w-32 text-center">Country</span>
              <span className="w-16 text-center">Level</span>
              <span className="w-24 text-right">Points</span>
            </div>

            <div className="divide-y divide-slate-100">
              {runnersUp.map((u) => (
                <div
                  key={u.id}
                  className={`p-4 px-6 flex items-center text-sm font-medium transition-colors ${u.id === appUser?.id ? 'bg-indigo-50/50 hover:bg-indigo-50 border-l-4 border-l-indigo-600 pl-5' : 'hover:bg-slate-50'}`}
                >
                  <span className="w-12 font-bold text-slate-500">
                    #{u.rank}
                  </span>
                  <div className="flex-1 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden ${u.id === appUser?.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {u.avatarUrl ? (
                        <img referrerPolicy="no-referrer" src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                      ) : (
                        u.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        {u.name}
                        {u.id === appUser?.id && (
                          <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-700 text-[9px] font-bold rounded">YOU</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{u.headline}</div>
                    </div>
                  </div>
                  <span className="w-32 text-slate-500 text-xs text-center flex items-center justify-center gap-1">
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    {u.country || "Global"}
                  </span>
                  <span className="w-16 text-slate-600 font-bold text-center">
                    Lvl {getLevel(u.score)}
                  </span>
                  <span className={`w-24 text-right font-black ${u.id === appUser?.id ? 'text-indigo-600' : 'text-slate-800'}`}>
                    {u.score} XP
                  </span>
                </div>
              ))}

              {runnersUp.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-400">
                  No other runner-up scholars are active in this region yet. Use dynamic activities to move ahead!
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Sidebar: Weekly Challenges */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-extrabold text-slate-900 mb-2 flex items-center gap-2">
              <Flame className="h-5 w-5 text-indigo-600" /> Weekly Quests
            </h3>
            <p className="text-xs text-slate-400 mb-6">Complete strategic activities to score heavy bonus XP points.</p>

            <div className="space-y-4">
              {challenges.map((c) => (
                <div key={c.id} className="border border-slate-100 p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h4 className="font-bold text-slate-900 text-sm">{c.title}</h4>
                    <span className="px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-bold rounded-md shrink-0 flex items-center gap-1">
                      <Zap className="h-2.5 w-2.5 fill-amber-500 text-amber-500" /> +{c.xp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">{c.desc}</p>
                  
                  {c.completed ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                      Start Quest &rarr;
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl text-white border border-slate-800 relative overflow-hidden">
            <h3 className="font-bold text-sm uppercase tracking-widest text-indigo-400 mb-2">XP Multipliers</h3>
            <h4 className="text-xl font-extrabold text-white mb-2">Dynamic Progress</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Every real milestone you verify, AP course you log, or opportunity you apply for adds massive XP directly to your rank!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
