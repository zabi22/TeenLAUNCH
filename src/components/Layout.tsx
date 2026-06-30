import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.tsx";
import { useTheme } from "./ThemeContext.tsx";
import { 
  LogOut, LayoutDashboard, Search, User as UserIcon, 
  Map, Activity, Target, Briefcase, GraduationCap, 
  Award, Zap, Users, Shield, Sparkles, FolderOpen,
  Menu, X, PenTool, Mic, Globe, MessageSquare,
  Trophy, BrainCircuit, Rocket, FlaskConical, UserCheck,
  Heart, BarChart3, Compass, ShoppingBag, FolderHeart,
  ChevronLeft, ChevronRight, Settings, Bell, Sun, Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils.ts";
import Logo from "./Logo.tsx";
import Onboarding from "../pages/Onboarding.tsx";

export default function Layout() {
  const { user, signIn, logOut, appUser, isOfflineMode, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isDarkMode = theme === "dark";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center animate-pulse" id="loading-spinner">
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
    { section: "Intelligence", items: [
      { name: "Academic Profile", path: "/academic-profile", icon: GraduationCap },
      { name: "College Analyzer", path: "/analyzer", icon: Target },
      { name: "Essay Assistant", path: "/essay", icon: PenTool },
      { name: "Interview Prep", path: "/interview", icon: Mic },
      { name: "AI Agents Lab", path: "/agents", icon: BrainCircuit },
    ]},
    { section: "Projects", items: [
      { name: "Research Matching", path: "/research", icon: FlaskConical },
      { name: "Founder Mode", path: "/founder", icon: Rocket },
      { name: "Achievement Vault", path: "/vault", icon: Award },
      { name: "Portfolio Builder", path: "/portfolio", icon: FolderHeart },
      { name: "Career Simulator", path: "/career", icon: Briefcase },
    ]}
  ];

  return (
    <div className="min-h-screen font-sans flex text-slate-100 bg-slate-950">
      
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 64 }}
        className="hidden md:flex flex-col border-r border-slate-800/80 bg-slate-950 z-50 sticky top-0 h-screen"
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && <Logo variant="dark" className="h-8" />}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg">
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
          {navItems.map((group) => (
            <div key={group.section} className="space-y-1">
              {sidebarOpen && <div className="text-[10px] font-bold text-slate-500 uppercase px-3 mb-2">{group.section}</div>}
              {group.items.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group relative",
                      isActive ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white"
                    )}
                  >
                    <item.icon size={20} />
                    {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                    {isActive && <motion.div layoutId="activePill" className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400 rounded-r" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {user && (
          <div className="p-4 border-t border-slate-800">
            <Link to="/profile" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold">
                {(appUser?.name || user.displayName || "U").substring(0, 1).toUpperCase()}
              </div>
              {sidebarOpen && <span className="text-sm font-medium">{appUser?.name || user.displayName || "Student"}</span>}
            </Link>
          </div>
        )}
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto flex flex-col">
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/80 border-b border-slate-800 p-4 flex items-center justify-between">
            <h1 className="text-lg font-bold capitalize">{location.pathname.replace('/', '') || 'Dashboard'}</h1>
            <div className="flex items-center gap-4">
                <button onClick={toggleTheme} className="p-2 hover:bg-slate-800 rounded-full">
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button className="p-2 hover:bg-slate-800 rounded-full relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
                </button>
                <button className="p-2 hover:bg-slate-800 rounded-full">
                    <Settings size={20} />
                </button>
            </div>
        </header>
        
        <div className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

    </div>
  );
}
