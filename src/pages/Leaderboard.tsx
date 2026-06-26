import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext.tsx";
import { 
  Trophy, Award, Zap, ShieldCheck, MapPin, Search, GraduationCap, 
  ChevronRight, Sparkles, Filter, Users, Heart, ArrowUp, Star
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LeaderboardEntry {
  id: number;
  name: string;
  avatarUrl?: string;
  headline?: string;
  country?: string;
  grade?: string;
  verificationBadges?: string;
  score: number;
  activitiesCount: number;
  postsCount: number;
}

export default function Leaderboard() {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const [leaderboardList, setLeaderboardList] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const res = await fetch("/api/social/leaderboard", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLeaderboardList(data);
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [user]);

  // Filters logic
  const filteredList = leaderboardList.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (student.headline || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (student.country || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGrade = gradeFilter === "All" || student.grade === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="min-h-screen">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Trophy className="h-8 w-8 text-amber-500 fill-amber-500/10" />
            TeenLaunch Leaderboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">High-integrity rankings based exclusively on real student profiles and verified accomplishments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Description of Point System & Stats Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">How Points are Earned</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-950">Verified Badge (+150 pts)</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Granted after uploading proof of STEM, athletic, or startup launches.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 shrink-0">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-950">Academic Achievements</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">+30 pts per AP Course, +15 pts per Honors, plus GPA multiplier (GPA × 50 pts).</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 shrink-0">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-950">Extracurricular Log (+20 pts)</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">+20 pts per registered activity, plus +2 pts for every volunteer/leadership hour.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600 shrink-0">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-950">Community Sharing (+10 pts)</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Earned for every academic milestone or project update shared with the Network.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics of Real Users */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-3">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Platform Integrity Directive</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              In accordance with database guidelines, we strictly forbid fake entries, dummy bots, or simulated scores. Every student listed has registered and logged their portfolio directly.
            </p>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800">
              <Users className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-300">Total Registered Members: {leaderboardList.length}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Table */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Controls: search and grade level */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search leaderboards..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="All">All Grades</option>
                <option value="9">9th Grade</option>
                <option value="10">10th Grade</option>
                <option value="11">11th Grade</option>
                <option value="12">12th Grade</option>
              </select>
            </div>
          </div>

          {/* List panel */}
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
              <Zap className="h-8 w-8 text-indigo-500 animate-spin mx-auto mb-3" />
              <span className="text-xs font-bold">Querying database schema, compiling scoreboards...</span>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <Users className="h-10 w-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-extrabold text-slate-700">No students have joined the leaderboard yet.</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Once students register, complete their Academic Profiles, and log accomplishments, they will instantly appear here with their live scores.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100">
                {filteredList.map((student, idx) => {
                  const rank = idx + 1;
                  return (
                    <div 
                      key={student.id} 
                      className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-slate-50/50 ${rank === 1 ? 'bg-amber-50/20' : rank === 2 ? 'bg-slate-50/30' : ''}`}
                    >
                      {/* Left: Rank, Avatar, and Title details */}
                      <div className="flex items-center gap-4">
                        <div className="w-8 shrink-0 flex items-center justify-center">
                          {rank === 1 ? (
                            <Trophy className="h-6 w-6 text-amber-500 fill-amber-500/10" />
                          ) : rank === 2 ? (
                            <Trophy className="h-5 w-5 text-slate-400 fill-slate-400/10" />
                          ) : rank === 3 ? (
                            <Trophy className="h-5 w-5 text-amber-700 fill-amber-700/10" />
                          ) : (
                            <span className="text-xs font-black text-slate-400">#{rank}</span>
                          )}
                        </div>

                        {student.avatarUrl ? (
                          <img src={student.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-extrabold text-xs flex items-center justify-center border border-indigo-100/30">
                            {(student.name || "U").substring(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-xs text-slate-900">{student.name}</span>
                            {student.verificationBadges && (
                              <span title="Verified Member">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{student.headline || `${student.grade || "Scholar"} | TeenLaunch`}</p>
                          
                          {student.country && (
                            <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-1">
                              <MapPin className="h-3 w-3" />
                              {student.country}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Score Display */}
                      <div className="flex items-center gap-6 justify-between md:justify-end">
                        <div className="flex gap-4 text-right">
                          <div className="hidden sm:block">
                            <div className="text-xs font-bold text-slate-700">{student.activitiesCount}</div>
                            <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Activities Logged</div>
                          </div>
                          <div className="hidden sm:block">
                            <div className="text-xs font-bold text-slate-700">{student.postsCount}</div>
                            <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Posts Shared</div>
                          </div>
                        </div>

                        <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl flex items-center gap-1.5 shadow-md shadow-indigo-600/10 shrink-0">
                          <Star className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
                          <span className="text-xs font-black tracking-tight">{student.score} pts</span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
