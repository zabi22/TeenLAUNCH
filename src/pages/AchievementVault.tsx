import { useState } from "react";
import { FolderOpen, Upload, Search, Filter, Star, FileText, Award, Calendar, MoreVertical, Plus } from "lucide-react";
import { useAuth } from "../components/AuthContext.tsx";
import { Navigate } from "react-router-dom";

export default function AchievementVault() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("All");

  if (!user) return <Navigate to="/" />;

  const tabs = ["All", "Certificates", "Awards", "Resumes", "Letters"];

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Achievement Vault</h1>
          <p className="text-slate-500">Securely store, organize, and track your most important documents.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors">
          <Upload className="h-5 w-5" /> Upload Document
        </button>
      </div>

      {/* AI categorization banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shrink-0">
            <Star className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Auto-Categorization Active</h3>
            <p className="text-indigo-100 text-sm">Upload any document and TeenLaunch AI will automatically tag, categorize, and extract key achievements.</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search documents..." 
            className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
          />
        </div>
      </div>

      {/* Timeline / Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900">Recent Uploads</h2>
          <button className="text-slate-400 hover:text-slate-900 p-2"><Filter className="h-5 w-5" /></button>
        </div>

        <div className="space-y-6">
          {/* Item 1 */}
          <div className="group flex flex-col sm:flex-row gap-4 sm:items-center p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base mb-1">State Science Fair - 1st Place</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Apr 2026</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span>1.2 MB</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">AI Verified</span>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-slate-900 transition-colors">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Item 2 */}
          <div className="group flex flex-col sm:flex-row gap-4 sm:items-center p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base mb-1">Main Resume_v3_Tech.pdf</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Mar 2026</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span>450 KB</span>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-slate-900 transition-colors">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Item 3 */}
          <div className="group flex flex-col sm:flex-row gap-4 sm:items-center p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <FolderOpen className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base mb-1">AP CS Letter of Recommendation</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Feb 2026</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span>890 KB</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Confidential</span>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-slate-900 transition-colors">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
