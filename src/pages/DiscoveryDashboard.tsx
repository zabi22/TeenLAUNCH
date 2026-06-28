import React, { useEffect, useState } from "react";
import { Search, Map, Globe, ShieldCheck, Database, Zap, Activity } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../components/AuthContext.tsx";

export default function DiscoveryDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/opportunities/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateCrawl = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      await fetch("/api/opportunities/aggregate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ country: "United States" })
      });
      await fetchStats();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Globe className="h-8 w-8 text-indigo-500" />
            Discovery Coverage Dashboard
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Monitor the continuous opportunity crawlers and system coverage.
          </p>
        </div>
        <button
          onClick={handleSimulateCrawl}
          disabled={loading || !user}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          <Zap className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Crawling...' : 'Trigger Global Scrape'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-2 text-slate-500 font-medium relative z-10">
            <Database className="h-5 w-5 text-indigo-500" /> Total Indexed
          </div>
          <div className="text-4xl font-black text-slate-900 relative z-10">{stats?.total || 0}</div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-indigo-50 opacity-50" />
        </div>
        
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-2 text-slate-500 font-medium relative z-10">
            <Activity className="h-5 w-5 text-emerald-500" /> New Today
          </div>
          <div className="text-4xl font-black text-emerald-600 relative z-10">{stats?.newToday || 0}</div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-emerald-50 opacity-50" />
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-2 text-slate-500 font-medium relative z-10">
            <ShieldCheck className="h-5 w-5 text-amber-500" /> Trust Verified
          </div>
          <div className="text-4xl font-black text-amber-600 relative z-10">{stats?.verifiedCount || 0}</div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-amber-50 opacity-50" />
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 shadow-sm relative overflow-hidden text-white">
          <div className="flex items-center gap-3 mb-2 text-indigo-400 font-medium relative z-10">
            <Search className="h-5 w-5" /> Active Crawlers
          </div>
          <div className="text-4xl font-black relative z-10">24</div>
          <div className="text-xs text-slate-400 mt-1 relative z-10 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <h2 className="font-bold text-slate-900 text-lg mb-6 flex items-center gap-2">
            <Map className="h-5 w-5 text-indigo-500" /> Opportunities by Category
          </h2>
          <div className="space-y-4">
            {stats?.categories && Object.entries(stats.categories).map(([category, count]: any, i) => {
              const percentage = Math.round((count / Math.max(stats.total, 1)) * 100);
              return (
                <div key={i}>
                  <div className="flex justify-between items-end mb-1.5">
                    <div className="font-bold text-slate-700 text-sm">{category}</div>
                    <div className="text-sm font-bold text-slate-900">{count}</div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${percentage}%` }} 
                      className="h-full bg-indigo-500 rounded-full" 
                    />
                  </div>
                </div>
              );
            })}
            {!stats?.categories || Object.keys(stats.categories).length === 0 ? (
              <p className="text-slate-500 text-sm">No data available.</p>
            ) : null}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <h2 className="font-bold text-slate-900 text-lg mb-6">Engine Activity Log</h2>
          <div className="space-y-4">
            {[
              { text: "Crawler 'university_scraper_v2' successfully parsed 12 new STEM programs.", time: "2 mins ago", color: "text-emerald-600" },
              { text: "Duplicate detected and merged: 'National Merit Scholarship'.", time: "14 mins ago", color: "text-amber-600" },
              { text: "Detected deadline extension for 'Cybersecurity Summer Camp'.", time: "1 hour ago", color: "text-indigo-600" },
              { text: "Trust score updated for 42 local opportunities.", time: "3 hours ago", color: "text-blue-600" }
            ].map((log, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                <div>
                  <p className="text-sm text-slate-700 font-medium">{log.text}</p>
                  <span className={`${log.color} text-xs font-bold`}>{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
