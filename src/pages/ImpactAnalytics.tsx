import React, { useState, useEffect } from "react";
import { useAuth } from "../components/AuthContext.tsx";
import { motion } from "motion/react";
import { Activity, TrendingUp, Award, DollarSign, Briefcase, GraduationCap, Zap, ArrowUpRight } from "lucide-react";

export default function ImpactAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/analytics/impact", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchAnalytics();
  }, [user]);

  const stats = [
    { label: "Scholarships Won", value: analytics ? analytics.user.scholarships.toString() : "--", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-100", trend: "+0%" },
    { label: "College Admissions", value: analytics ? analytics.user.admissions.toString() : "--", icon: GraduationCap, color: "text-indigo-600", bg: "bg-indigo-100", trend: "+0" },
    { label: "Internships Secured", value: analytics ? analytics.user.internships.toString() : "--", icon: Briefcase, color: "text-amber-600", bg: "bg-amber-100", trend: "0" },
    { label: "Leadership Growth", value: "+0%", icon: TrendingUp, color: "text-rose-600", bg: "bg-rose-100", trend: "Top %" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Activity className="h-8 w-8 text-indigo-500" />
          Impact Analytics
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Track your progress, measure your outcomes, and predict future success probabilistically.
        </p>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-indigo-200 font-bold uppercase tracking-wider text-xs mb-2 block">Global Network Impact</span>
            <h2 className="text-3xl md:text-4xl font-black">TeenLaunch students have earned <span className="text-emerald-400">real opportunities</span>.</h2>
            <p className="text-indigo-100 mt-3 text-lg">Join the world's most powerful student success operating system.</p>
          </div>
          <div className="shrink-0 flex gap-4">
            <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
              <div className="text-2xl font-black text-white">{analytics ? analytics.global.totalOpportunitiesWon : '--'}</div>
              <div className="text-xs text-indigo-200 font-medium mt-1">Opportunities Won Globally</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-colors"
          >
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                {stat.trend} <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            </div>
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${stat.bg} opacity-50 group-hover:scale-150 transition-transform duration-500`} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
                Success Prediction System
              </h2>
              <p className="text-sm text-slate-500 mt-1">Probability of achieving primary academic targets</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <div className="font-bold text-slate-700">Stanford University (Target)</div>
                <div className="text-xl font-black text-emerald-600">34%</div>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: "34%" }} className="h-full bg-emerald-500 rounded-full" />
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">To increase: Secure 1 more leadership role in STEM.</p>
            </div>
            
            <div>
              <div className="flex justify-between items-end mb-2">
                <div className="font-bold text-slate-700">UC Berkeley (Target)</div>
                <div className="text-xl font-black text-indigo-600">68%</div>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: "68%" }} className="h-full bg-indigo-500 rounded-full" />
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">On track. Maintain current GPA trend.</p>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <div className="font-bold text-slate-700">National Merit Scholarship</div>
                <div className="text-xl font-black text-amber-500">85%</div>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: "85%" }} className="h-full bg-amber-500 rounded-full" />
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">High probability based on PSAT diagnostic.</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
          <div className="relative z-10 h-full flex flex-col">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-400" />
              Student Reputation Graph
            </h2>
            <p className="text-slate-400 text-sm mb-6">Tracking Leadership, Impact, Research, Service, and Entrepreneurship.</p>
            
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-48 h-48">
                {/* Simplified Graph Visual */}
                <div className="absolute inset-0 border border-slate-700 rounded-full animate-ping opacity-20" />
                <div className="absolute inset-4 border border-slate-700 rounded-full animate-spin-slow" />
                <div className="absolute inset-12 bg-indigo-500/20 rounded-full blur-xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-black text-white">92</div>
                    <div className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold">Rep Score</div>
                  </div>
                </div>
                
                {/* Nodes */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" title="Leadership" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" title="Impact" />
                <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]" title="Research" />
                <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.8)]" title="Service" />
                <div className="absolute top-[85%] right-[15%] w-4 h-4 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" title="Entrepreneurship" />
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-2 text-xs font-bold text-slate-300">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"/> Leadership: Top 5%</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"/> Research: Top 12%</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Impact: Top 8%</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"/> Service: Top 15%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
