import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { LogIn, User, Lock, ArrowRight, Sparkles, Hexagon, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../components/AuthContext.tsx";
import Logo from "../components/Logo.tsx";

export default function Login() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleDemoLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);
    try {
      await signIn();
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020617]">
      {/* Futuristic Background Elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-900/10 rounded-full border border-indigo-500/10 animate-[spin_60s_linear_infinite]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-transparent rounded-full border border-cyan-500/10 animate-[spin_40s_linear_infinite_reverse]"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-8 sm:p-10"
      >
        <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 shadow-2xl rounded-3xl p-8 overflow-hidden relative">
          
          {/* Subtle top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>

          <div className="text-center mb-10">
            <Link to="/" className="inline-block mb-6 group">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-all duration-300 mx-auto">
                <Hexagon className="absolute text-indigo-500 w-12 h-12 stroke-[1.5] rotate-90 group-hover:rotate-180 transition-all duration-700" />
                <Sparkles className="text-cyan-400 w-6 h-6 animate-pulse" />
              </div>
            </Link>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">SYSTEM.LOGIN</h1>
            <p className="text-slate-400 text-sm font-medium tracking-wide">Authenticate to access the neural network</p>
          </div>

          <form onSubmit={handleDemoLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <User className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300"
                  placeholder="USER_IDENTIFIER"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300"
                  placeholder="ACCESS_CODE"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-cyan-400 transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-slate-400 cursor-pointer hover:text-white transition-colors">
                <input type="checkbox" className="mr-2 rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900" />
                <span>Maintain Link</span>
              </label>
              <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">Reset Code?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl text-sm font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>INITIALIZING...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>INITIALIZE PROTOCOL</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-slate-700 rounded-xl text-sm font-bold text-slate-300 bg-slate-800/50 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500 transition-all"
            >
              <LogIn className="w-5 h-5 mr-2" />
              <span>GUEST OVERRIDE (DEMO)</span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 font-mono">
              UNAUTHORIZED ACCESS IS PROHIBITED. <br/>
              SECURE CONNECTION ESTABLISHED.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
