import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.tsx";
import { 
  LogOut, LayoutDashboard, Search, User as UserIcon, 
  Map, Activity, Target, Briefcase, GraduationCap, 
  Award, Zap, Users, Shield, Sparkles, FolderOpen,
  Menu, X, PenTool, Mic, Globe, MessageSquare,
  Trophy, BrainCircuit, Rocket, FlaskConical, UserCheck,
  Heart, BarChart3, Compass, ShoppingBag, FolderHeart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { cn } from "../lib/utils.ts";
import Logo from "./Logo.tsx";
import Onboarding from "../pages/Onboarding.tsx";

export default function Layout() {
  const { user, signIn, logOut, appUser, isOfflineMode, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center animate-pulse" id="loading-spinner">
        <div className="h-8 w-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user && appUser && appUser.onboardingComplete === false) {
    return <Onboarding />;
  }

  const handleAuth = async () => {
    if (user) {
      await logOut();
      navigate("/");
    } else {
      await signIn();
      navigate("/dashboard");
    }
  };

  const navItems = [
    { section: "Core", items: [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "Opportunity Scout", path: "/opportunities", icon: Search },
      { name: "Strategic Roadmap", path: "/roadmap", icon: Map },
      { name: "National Leaderboard", path: "/leaderboard", icon: Trophy },
      { name: "Student Digital Twin", path: "/twin", icon: Sparkles },
    ]},
    { section: "Intelligence & Academics", items: [
      { name: "Academic Profile", path: "/academic-profile", icon: GraduationCap },
      { name: "College Analyzer", path: "/analyzer", icon: Target },
      { name: "Essay Assistant", path: "/essay", icon: PenTool },
      { name: "Interview Prep", path: "/interview", icon: Mic },
      { name: "AI Agents Lab", path: "/agents", icon: BrainCircuit },
    ]},
    { section: "Research & Projects", items: [
      { name: "Research Matching", path: "/research", icon: FlaskConical },
      { name: "Founder Mode", path: "/founder", icon: Rocket },
      { name: "Achievement Vault", path: "/vault", icon: Award },
      { name: "Portfolio Builder", path: "/portfolio", icon: FolderHeart },
      { name: "Career Simulator", path: "/career", icon: Briefcase },
    ]},
    { section: "Portals & Management", items: [
      { name: "Counselor Portal", path: "/counselor", icon: UserCheck },
      { name: "Parent Portal", path: "/parent", icon: Heart },
      { name: "Impact Analytics", path: "/analytics", icon: BarChart3 },
      { name: "Discovery Hub", path: "/discovery", icon: Compass },
      { name: "Opportunity Marketplace", path: "/marketplace", icon: ShoppingBag },
    ]},
    { section: "Network", items: [
      { name: "Student Network", path: "/network", icon: Users },
      { name: "Messages", path: "/messages", icon: MessageSquare },
      { name: "Activity Tracker", path: "/activities", icon: Activity },
      { name: "App Tracker", path: "/applications", icon: Shield },
    ]}
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row overflow-hidden">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-slate-950 p-4 border-b border-slate-800 sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <Logo variant="dark" className="h-9 w-auto" />
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white p-2 hover:bg-slate-800 rounded-xl transition-colors">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 768) && (
          <motion.div 
            initial={{ x: -300, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col h-screen md:relative",
              sidebarOpen ? "block" : "hidden md:flex"
            )}
          >
            {/* Glowing effect inside sidebar */}
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>

            <div className="p-6 hidden md:flex items-center gap-3 border-b border-slate-900">
              <Link to="/" className="transition-transform hover:scale-[1.01]">
                <Logo variant="dark" className="h-10 w-auto" />
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar space-y-7">
              {user ? (
                <div className="space-y-6">
                  {navItems.map((group, i) => (
                    <div key={i} className="space-y-2">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 flex items-center justify-between">
                        <span>{group.section}</span>
                        <div className="h-px bg-slate-800 flex-1 ml-3 opacity-30"></div>
                      </div>
                      <div className="space-y-1">
                        {group.items.map(item => {
                          const isActive = location.pathname === item.path;
                          return (
                            <Link 
                              key={item.path} 
                              to={item.path}
                              onClick={() => setSidebarOpen(false)}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 text-sm font-semibold relative group",
                                isActive 
                                  ? "bg-gradient-to-r from-indigo-500/15 to-indigo-500/5 text-indigo-400 border border-indigo-500/20" 
                                  : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent"
                              )}
                            >
                              {isActive && (
                                <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-500 rounded-r-md"></span>
                              )}
                              <item.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-400")} />
                              <span>{item.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center mt-8 bg-slate-900/40 border border-slate-900 rounded-3xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-radial-gradient from-indigo-500/5 to-transparent pointer-events-none"></div>
                  <div className="w-14 h-14 bg-slate-800/80 border border-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400 shadow-inner">
                    <UserIcon className="h-6 w-6" />
                  </div>
                  <h3 className="text-white font-bold mb-1 font-sans text-base">Welcome to TeenLaunch</h3>
                  <p className="text-slate-400 text-xs mb-6 leading-relaxed">The ultimate operating system for ambitious students.</p>
                  <button
                    onClick={handleAuth}
                    className="w-full inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 hover:scale-[1.02]"
                  >
                    Log In / Sign Up
                  </button>
                </div>
              )}
            </div>

            {user && (
              <div className="p-4 border-t border-slate-900 bg-slate-950/90 backdrop-blur-sm">
                <Link to="/profile" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-900/80 border border-transparent hover:border-slate-800/40 transition-all cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-500/10 group-hover:scale-[1.03] transition-transform">
                    {(appUser?.name || user.displayName || "U").substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">{appUser?.name || user.displayName || "Student"}</div>
                    <div className="text-[10px] text-slate-400 truncate flex items-center gap-1.5 font-medium mt-0.5">
                      <Award className="h-3 w-3 text-amber-400 fill-amber-400/20" /> Level 12 Scholar
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 h-screen overflow-y-auto bg-[#fafbfe] relative flex flex-col custom-scrollbar">
        {isOfflineMode && (
          <div className="w-full bg-amber-500 text-white px-4 py-2.5 flex items-center justify-center gap-2 z-40 sticky top-0 shadow-sm border-b border-amber-600">
            <Activity className="h-4 w-4 animate-pulse" />
            <span className="text-xs font-bold tracking-wide uppercase">
              Offline / Read-Only Mode. Progress cached locally.
            </span>
          </div>
        )}
        
        {user && (
          <div className={`absolute top-6 right-6 z-10 hidden md:flex items-center gap-3 ${isOfflineMode ? 'mt-12' : ''}`}>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white border border-slate-200/80 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm"
            >
              <Zap className="h-4 w-4 text-amber-500 fill-amber-500 animate-pulse" />
              <span className="text-sm font-bold text-slate-700">1,250 XP</span>
            </motion.div>
            <button 
              onClick={handleAuth} 
              className="p-2.5 text-slate-400 hover:text-slate-900 bg-white border border-slate-200/80 rounded-full shadow-sm transition-all hover:bg-slate-50 hover:shadow-md cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 md:py-12 pb-24 flex-1">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>

    </div>
  );
}
