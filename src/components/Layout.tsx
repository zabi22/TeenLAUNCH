import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.tsx";
import { 
  LogOut, LayoutDashboard, Search, User as UserIcon, 
  Map, Activity, Target, Briefcase, GraduationCap, 
  Award, Zap, Users, Shield, Sparkles, FolderOpen,
  Menu, X, PenTool, Mic, Globe, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { cn } from "../lib/utils.ts";
import Logo from "./Logo.tsx";

export default function Layout() {
  const { user, signIn, logOut, appUser, isOfflineMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      { name: "Digital Twin", path: "/twin", icon: Sparkles },
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "AI Agent Ecosystem", path: "/agents", icon: Zap },
      { name: "Opportunity Scout", path: "/opportunities", icon: Search },
      { name: "Discovery Network", path: "/discovery", icon: Globe },
      { name: "Strategic Roadmap", path: "/roadmap", icon: Map },
    ]},
    { section: "Network", items: [
      { name: "Student Network", path: "/network", icon: Users },
      { name: "Messages", path: "/messages", icon: MessageSquare },
      { name: "Research Matching", path: "/research", icon: Search },
      { name: "Leaderboard", path: "/leaderboard", icon: Award },
      { name: "Opportunity Market", path: "/marketplace", icon: Briefcase },
    ]},
    { section: "Academics", items: [
      { name: "Academic Profile", path: "/academic-profile", icon: GraduationCap },
      { name: "College Analyzer", path: "/analyzer", icon: Target },
      { name: "Essay Assistant", path: "/essay", icon: PenTool },
      { name: "Interview Prep", path: "/interview", icon: Mic },
      { name: "App Tracker", path: "/applications", icon: Shield },
    ]},
    { section: "Experience", items: [
      { name: "Portfolio Builder", path: "/portfolio", icon: FolderOpen },
      { name: "Activity Tracker", path: "/activities", icon: Activity },
      { name: "Achievement Vault", path: "/vault", icon: Shield },
      { name: "Founder Mode", path: "/founder", icon: Zap },
    ]},
    { section: "Future", items: [
      { name: "Career Simulator", path: "/career", icon: Briefcase },
      { name: "Impact Analytics", path: "/analytics", icon: Activity },
    ]},
    { section: "Portals", items: [
      { name: "Parent Portal", path: "/parent", icon: UserIcon },
      { name: "Counselor Portal", path: "/counselor", icon: Shield },
    ]}
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row overflow-hidden">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 p-4 border-b border-slate-800">
        <Link to="/" className="flex items-center gap-2">
          <Logo variant="dark" className="h-10 w-auto" />
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white p-2">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 768) && (
          <motion.div 
            initial={{ x: -300 }} 
            animate={{ x: 0 }} 
            exit={{ x: -300 }}
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-screen md:relative",
              sidebarOpen ? "block" : "hidden md:flex"
            )}
          >
            <div className="p-6 hidden md:flex items-center gap-3">
              <Link to="/">
                <Logo variant="dark" className="h-10 w-auto" />
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-4 custom-scrollbar">
              {user ? (
                <div className="space-y-6">
                  {navItems.map((group, i) => (
                    <div key={i}>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-3">
                        {group.section}
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
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold",
                                isActive 
                                  ? "bg-indigo-500/10 text-indigo-400" 
                                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                              )}
                            >
                              <item.icon className={cn("h-4 w-4", isActive ? "text-indigo-400" : "text-slate-500")} />
                              {item.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center mt-8">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserIcon className="h-8 w-8 text-slate-500" />
                  </div>
                  <h3 className="text-white font-bold mb-2">Welcome to TeenLaunch</h3>
                  <p className="text-slate-400 text-sm mb-6">The ultimate operating system for ambitious students.</p>
                  <button
                    onClick={handleAuth}
                    className="w-full inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-bold text-white transition-colors hover:bg-indigo-500"
                  >
                    Log In / Sign Up
                  </button>
                </div>
              )}
            </div>

            {user && (
              <div className="p-4 border-t border-slate-800">
                <Link to="/profile" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-lg group-hover:scale-105 transition-transform">
                    {(appUser?.name || user.displayName || "U").substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">{appUser?.name || user.displayName || "Student"}</div>
                    <div className="text-xs text-slate-400 truncate flex items-center gap-1">
                      <Award className="h-3 w-3 text-amber-400" /> Level 12 Scholar
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 h-screen overflow-y-auto bg-slate-50 relative flex flex-col">
        {isOfflineMode && (
          <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center justify-center gap-2 z-40 sticky top-0">
            <Activity className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              You are currently in Offline / Read-Only Mode. Some features may be unavailable.
            </span>
          </div>
        )}
        
        {user && (
          <div className={`absolute top-4 right-6 z-10 hidden md:flex items-center gap-3 ${isOfflineMode ? 'mt-12' : ''}`}>
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
              <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-bold text-slate-700">1,250 XP</span>
            </div>
            <button onClick={handleAuth} className="p-2 text-slate-400 hover:text-slate-900 bg-white border border-slate-200 rounded-full shadow-sm transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 md:py-12 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>

    </div>
  );
}
