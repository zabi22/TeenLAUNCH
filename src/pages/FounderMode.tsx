import { useState } from "react";
import { Zap, Rocket, Lightbulb, Target, Users, LayoutTemplate, Briefcase, Plus, ArrowRight } from "lucide-react";
import { useAuth } from "../components/AuthContext.tsx";
import { Navigate } from "react-router-dom";

export default function FounderMode() {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/" />;

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
            <Zap className="h-8 w-8 text-amber-500 fill-amber-500" /> Founder Mode
          </h1>
          <p className="text-slate-500 font-medium">Build, track, and scale your student ventures.</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors">
          <Plus className="h-5 w-5" /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Active Project */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Rocket className="h-5 w-5 text-indigo-600" /> Active Venture
            </h2>
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest border border-emerald-200">
              Pre-Seed Stage
            </span>
          </div>

          <div className="mb-8">
            <h3 className="text-3xl font-black text-slate-900 mb-2">EcoSort AI</h3>
            <p className="text-slate-500 leading-relaxed max-w-2xl">
              An AI-powered computer vision mobile application that helps high schools automatically sort recycling from trash in cafeterias to reduce waste contamination.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Users</div>
              <div className="text-2xl font-black text-slate-900">450</div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Revenue</div>
              <div className="text-2xl font-black text-slate-900">$0</div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Team</div>
              <div className="text-2xl font-black text-slate-900">3</div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Competitions</div>
              <div className="text-2xl font-black text-slate-900">2</div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm font-bold mb-2">
              <span className="text-slate-600">MVP Development Phase</span>
              <span className="text-indigo-600">75%</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-3/4 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Founder AI Tools */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl flex flex-col text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-indigo-400" />
            </div>
            <h2 className="text-lg font-bold">Founder AI Kit</h2>
          </div>
          
          <div className="space-y-3 flex-1">
            <button className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-2xl flex items-start gap-3 transition-colors text-left">
              <Lightbulb className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm mb-1">Idea Generator</div>
                <div className="text-xs text-slate-400">Generate startup ideas based on your skills.</div>
              </div>
            </button>
            <button className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-2xl flex items-start gap-3 transition-colors text-left">
              <Target className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm mb-1">Business Plan Builder</div>
                <div className="text-xs text-slate-400">Step-by-step lean canvas generator.</div>
              </div>
            </button>
            <button className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-2xl flex items-start gap-3 transition-colors text-left">
              <LayoutTemplate className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm mb-1">Pitch Deck Co-Pilot</div>
                <div className="text-xs text-slate-400">Outline and draft slides for investors.</div>
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* Competitions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-indigo-600" /> Upcoming Incubators & Competitions
          </h2>
          <button className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl hover:border-indigo-300 transition-colors shadow-sm group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-xl">D</div>
              <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded border border-amber-200">2 Weeks Left</span>
            </div>
            <h3 className="font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">Diamond Challenge</h3>
            <p className="text-sm text-slate-500 mb-4 line-clamp-2">Top high school entrepreneurship competition globally. Grand prize of $100k.</p>
            <button className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-xl transition-colors">Learn More</button>
          </div>
          
          <div className="bg-white border border-slate-200 p-6 rounded-3xl hover:border-indigo-300 transition-colors shadow-sm group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-bold text-xl">M</div>
              <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">Opens Sep</span>
            </div>
            <h3 className="font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">MIT LaunchX</h3>
            <p className="text-sm text-slate-500 mb-4 line-clamp-2">Premier summer incubator for high school founders.</p>
            <button className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-xl transition-colors">Learn More</button>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl hover:border-indigo-300 transition-colors shadow-sm group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold text-xl">C</div>
              <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">Opens Oct</span>
            </div>
            <h3 className="font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">Conrad Challenge</h3>
            <p className="text-sm text-slate-500 mb-4 line-clamp-2">Purpose-driven innovation competition focusing on global issues.</p>
            <button className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-xl transition-colors">Learn More</button>
          </div>
        </div>
      </div>
    </div>
  );
}
