import { useState } from "react";
import { useAuth } from "../components/AuthContext.tsx";
import { motion } from "motion/react";
import { Trophy, Medal, Zap, Star, Sparkles, ArrowUp, Flame, Award, Globe, Search } from "lucide-react";

interface LeaderboardUser {
  rank: number;
  name: string;
  username: string;
  country: string;
  level: number;
  xp: number;
  isCurrentUser?: boolean;
}

export default function Leaderboard() {
  const { appUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"national" | "global">("national");

  const topThree: LeaderboardUser[] = [
    { rank: 2, name: "Sofia Lindqvist", username: "sofia_l", country: "Sweden", level: 14, xp: 2150 },
    { rank: 1, name: "Zeynep Yilmaz", username: "zeynep_y", country: "Germany", level: 15, xp: 2890 },
    { rank: 3, name: "Arjun Mehta", username: "arjun_m", country: "India", level: 13, xp: 1980 },
  ];

  const runnersUp: LeaderboardUser[] = [
    { rank: 4, name: "Emily Smith", username: "emily_s", country: "United States", level: 13, xp: 1850 },
    { rank: 5, name: "Liam Davies", username: "liam_d", country: "United Kingdom", level: 12, xp: 1720 },
    { rank: 6, name: "Marcus Tan", username: "marcus_t", country: "Singapore", level: 12, xp: 1650 },
    { rank: 7, name: "Chloe Dupont", username: "chloe_d", country: "France", level: 12, xp: 1590 },
    { rank: 8, name: "ZABI", username: appUser?.username || "zabi_pioneer", country: appUser?.country || "Sweden", level: 12, xp: 1250, isCurrentUser: true },
    { rank: 9, name: "Kenji Sato", username: "kenji_s", country: "Japan", level: 11, xp: 1180 },
    { rank: 10, name: "Lucas Silva", username: "lucas_s", country: "Brazil", level: 11, xp: 1050 }
  ];

  const challenges = [
    { id: 1, title: "Essay Mastery", desc: "Submit your first essay draft to the Essay Assistant", xp: 350, completed: false },
    { id: 2, title: "Opportunity Scout", desc: "Save 3 personalized opportunities to your portfolio", xp: 150, completed: true },
    { id: 3, title: "Strategy Alignment", desc: "Align 2 new goals inside your Strategic Roadmap", xp: 200, completed: false },
  ];

  return (
    <div className="space-y-8" id="leaderboard-page">
      {/* Hero Banner */}
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-900 to-slate-900 -z-10"></div>
        <div className="space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-bold text-amber-400">
            <Trophy className="h-3.5 w-3.5" /> Launchpad Leaderboard
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Rise to the Top of the Scholar Network
          </h1>
          <p className="text-slate-400 text-sm">
            Earn Experience Points (XP) by completing strategic milestones, scouting opportunities, and optimizing your academic portfolio.
          </p>
        </div>
        <div className="shrink-0 bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Zap className="h-6 w-6 fill-white" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Position</div>
            <div className="text-xl font-extrabold text-white">Rank #8 <span className="text-xs font-medium text-slate-500">Global</span></div>
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
              Sweden National Rank
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
              className="flex flex-col items-center"
            >
              <div className="relative group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-200 border-4 border-slate-300 flex items-center justify-center font-bold text-lg text-slate-700 shadow-lg overflow-hidden">
                  SL
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-400 text-white font-black text-xs px-2 py-0.5 rounded-full shadow-md">
                  #2
                </div>
              </div>
              <div className="text-center mt-4">
                <h3 className="font-bold text-xs sm:text-sm text-slate-800 truncate max-w-[80px] sm:max-w-[120px]">{topThree[0].name}</h3>
                <p className="text-[10px] text-slate-400 font-medium">@{topThree[0].username}</p>
                <div className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-slate-600">
                  <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
                  {topThree[0].xp}
                </div>
              </div>
            </motion.div>

            {/* Rank 1 (Center) */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              <div className="relative group">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                  <Award className="h-7 w-7 fill-amber-500" />
                </div>
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-4 border-amber-400 flex items-center justify-center font-bold text-2xl text-white shadow-xl overflow-hidden shadow-amber-500/20">
                  ZY
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-black text-xs px-3 py-1 rounded-full shadow-md">
                  👑 #1
                </div>
              </div>
              <div className="text-center mt-4">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate max-w-[100px] sm:max-w-[140px]">{topThree[1].name}</h3>
                <p className="text-[10px] text-indigo-600 font-semibold">@{topThree[1].username}</p>
                <div className="mt-1 inline-flex items-center gap-1 text-sm font-black text-amber-600">
                  <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  {topThree[1].xp}
                </div>
              </div>
            </motion.div>

            {/* Rank 3 (Right) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="relative group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-orange-100 border-4 border-orange-200 flex items-center justify-center font-bold text-lg text-orange-700 shadow-lg overflow-hidden">
                  AM
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-400 text-white font-black text-xs px-2 py-0.5 rounded-full shadow-md">
                  #3
                </div>
              </div>
              <div className="text-center mt-4">
                <h3 className="font-bold text-xs sm:text-sm text-slate-800 truncate max-w-[80px] sm:max-w-[120px]">{topThree[2].name}</h3>
                <p className="text-[10px] text-slate-400 font-medium">@{topThree[2].username}</p>
                <div className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-slate-600">
                  <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
                  {topThree[2].xp}
                </div>
              </div>
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
                  key={u.rank}
                  className={`p-4 px-6 flex items-center text-sm font-medium transition-colors ${u.isCurrentUser ? 'bg-indigo-50/50 hover:bg-indigo-50 border-l-4 border-l-indigo-600 pl-5' : 'hover:bg-slate-50'}`}
                >
                  <span className="w-12 font-bold text-slate-500">
                    #{u.rank}
                  </span>
                  <div className="flex-1 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${u.isCurrentUser ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {u.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        {u.name}
                        {u.isCurrentUser && (
                          <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-700 text-[9px] font-bold rounded">YOU</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">@{u.username}</div>
                    </div>
                  </div>
                  <span className="w-32 text-slate-500 text-xs text-center flex items-center justify-center gap-1">
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    {u.country}
                  </span>
                  <span className="w-16 text-slate-600 font-bold text-center">
                    Lvl {u.level}
                  </span>
                  <span className={`w-24 text-right font-black ${u.isCurrentUser ? 'text-indigo-600' : 'text-slate-800'}`}>
                    {u.xp} XP
                  </span>
                </div>
              ))}
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
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 cursor-pointer hover:underline">
                      Start Quest &rarr;
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl text-white border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Sparkles className="h-20 w-20" />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-indigo-400 mb-2">XP Multipliers</h3>
            <h4 className="text-xl font-extrabold text-white mb-2">Join a Student Group</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Connect with fellow Swedish or international scholars. Peer reviews and collaborative roadmaps yield 1.5x XP!
            </p>
            <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all">
              Invite Peer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
