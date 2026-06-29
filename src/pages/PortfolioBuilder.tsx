import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FolderHeart, CheckCircle, Sparkles, Sliders, Eye, Copy, Globe, RefreshCw, ChevronRight } from "lucide-react";
import ResumeBuilderPanel from "../components/ResumeBuilderPanel.tsx";

export default function PortfolioBuilder() {
  const [includeGpa, setIncludeGpa] = useState(true);
  const [includeHours, setIncludeHours] = useState(true);
  const [includeResearch, setIncludeResearch] = useState(true);
  const [includeLeaderboard, setIncludeLeaderboard] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [portfolioUrl, setPortfolioUrl] = useState("");

  const handleGenerate = () => {
    setIsGenerating(true);
    setPortfolioUrl("");
    setTimeout(() => {
      setPortfolioUrl("https://teenlaunch.app/portfolio/zabi_pioneer_9381");
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <div className="space-y-8" id="portfolio-builder-page">
      {/* Title Banner */}
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-900 to-slate-900 -z-10"></div>
        <div className="space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-bold text-indigo-400">
            <FolderHeart className="h-3.5 w-3.5" /> Public Portfolio Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Portfolio Builder & Publisher
          </h1>
          <p className="text-slate-400 text-sm">
            Toggle, compile, and publish a verified public portfolio webpage. Showcase your academic metrics and extracurricular spikes to university recruiters.
          </p>
        </div>
        <div className="shrink-0 bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl text-center shadow-xl">
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Public Status</div>
          <div className="text-lg font-black text-indigo-400 mt-1 flex items-center gap-1.5 justify-center">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span> Active
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Toggle Controls */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sliders className="h-4 w-4 text-indigo-600" /> Toggle Blocks
            </h3>

            <div className="space-y-4">
              {/* GPA */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Verified GPA Statement</h4>
                  <p className="text-[10px] text-slate-400">Display 3.9 GPA on public card</p>
                </div>
                <input
                  type="checkbox"
                  checked={includeGpa}
                  onChange={() => setIncludeGpa(!includeGpa)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
              </div>

              {/* Extracurricular Hours */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Quantitative Impact Hours</h4>
                  <p className="text-[10px] text-slate-400">Include total hours sum (119 hrs)</p>
                </div>
                <input
                  type="checkbox"
                  checked={includeHours}
                  onChange={() => setIncludeHours(!includeHours)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
              </div>

              {/* Research Match Profile */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Research Matching Bio</h4>
                  <p className="text-[10px] text-slate-400">Microplastics filtration at KTH</p>
                </div>
                <input
                  type="checkbox"
                  checked={includeResearch}
                  onChange={() => setIncludeResearch(!includeResearch)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
              </div>

              {/* Leaderboard Rank */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">National Leaderboard Rank</h4>
                  <p className="text-[10px] text-slate-400">Show Sweden Rank #8 on profile</p>
                </div>
                <input
                  type="checkbox"
                  checked={includeLeaderboard}
                  onChange={() => setIncludeLeaderboard(!includeLeaderboard)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Compiling Portfolio...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4" /> Publish Live Portfolio
                </>
              )}
            </button>
          </div>

          <AnimatePresence>
            {portfolioUrl && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-50 border border-emerald-100 p-4 rounded-3xl space-y-2"
              >
                <div className="flex justify-between items-center text-xs font-bold text-emerald-800">
                  <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Published Live!</span>
                  <button className="flex items-center gap-1 text-indigo-600 hover:underline"><Copy className="h-3 w-3" /> Copy URL</button>
                </div>
                <p className="text-[10px] text-emerald-600 font-mono select-all truncate">{portfolioUrl}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <ResumeBuilderPanel />
        </div>

        {/* Live Mockup Preview */}
        <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3">
            <Eye className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Web Preview (Live Compilation)</span>
          </div>

          {/* Portfolio Live Card Mockup */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-lg max-w-xl mx-auto space-y-6 relative overflow-hidden">
            {/* Top gradient strip */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

            {/* Profile Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
              <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-extrabold shadow-md">
                ZA
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900 leading-none">ZABI</h3>
                <p className="text-xs text-slate-500 font-semibold">Stockholm, Sweden • Level 12 Scholar</p>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[9px] font-bold rounded border border-slate-100">Stockholm Gymnasium</span>
                  {includeLeaderboard && (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold rounded border border-amber-100">Sweden Rank #8</span>
                  )}
                </div>
              </div>
            </div>

            {/* Academics & hours */}
            <div className="grid grid-cols-2 gap-4">
              {includeGpa && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Academic standing</span>
                  <h4 className="text-xl font-black text-slate-900 leading-none">3.90 <span className="text-xs font-bold text-slate-400">GPA</span></h4>
                  <p className="text-[10px] text-slate-500">Verified KTH-Stanford path</p>
                </div>
              )}

              {includeHours && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Extracurricular Impact</span>
                  <h4 className="text-xl font-black text-indigo-600 leading-none">119 <span className="text-xs font-bold text-slate-400">hrs</span></h4>
                  <p className="text-[10px] text-slate-500">Volunteer & Research logs</p>
                </div>
              )}
            </div>

            {/* Research Match Focus */}
            {includeResearch && (
              <div className="p-5 bg-indigo-50/40 border border-indigo-100 rounded-2xl space-y-2">
                <span className="text-[9px] font-bold text-indigo-700 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Specialization Focus
                </span>
                <h4 className="font-extrabold text-slate-900 text-sm">Bio-Polymer Membranous Arrays filtration</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Working directly with Dr. Elin Larsson at KTH Royal Institute of Technology, Environmental Engineering department, assessing microplastics extraction.
                </p>
              </div>
            )}

            {/* Verified seal */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 justify-center border-t border-slate-100 pt-4">
              <FolderHeart className="h-4 w-4 text-indigo-500" /> Compiled and cryptographically verified by TeenLaunch platform
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
