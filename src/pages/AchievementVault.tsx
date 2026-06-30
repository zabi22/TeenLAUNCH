import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, Upload, CheckCircle, Clock, ShieldCheck, Download, Plus, Filter, FileText, ChevronRight, Sparkles } from "lucide-react";
import { useConfetti } from "../hooks/useConfetti";
import { useToast } from "../hooks/useToast";

interface Achievement {
  id: string;
  title: string;
  issuer: string;
  category: "Academics" | "Leadership" | "Extracurriculars" | "Volunteer";
  date: string;
  status: "Verified" | "Pending";
  fileSize?: string;
  badge?: string;
}

export default function AchievementVault() {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { triggerConfetti } = useConfetti();
  const { addToast } = useToast();
  
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: "1", title: "AP Scholar with Distinction", issuer: "College Board", category: "Academics", date: "June 2025", status: "Verified", fileSize: "1.2 MB", badge: "Gold Medalist" },
    { id: "2", title: "Student Council Vice President", issuer: "Stockholm Gymnasium", category: "Leadership", date: "May 2025", status: "Verified", fileSize: "840 KB", badge: "Strategic Leader" },
    { id: "3", title: "KPMG STEM Virtual Internship", issuer: "KPMG", category: "Extracurriculars", date: "December 2025", status: "Verified", fileSize: "1.5 MB", badge: "Elite Performer" },
    { id: "4", title: "Red Cross Volunteer Leader", issuer: "Swedish Red Cross", category: "Volunteer", date: "August 2025", status: "Pending", fileSize: "920 KB" }
  ]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateUpload(e.dataTransfer.files[0].name);
    }
  };

  const simulateUpload = (filename: string) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setAchievements([{
              id: Date.now().toString(),
              title: filename.split('.')[0] || "New Achievement",
              issuer: "Self Uploaded",
              category: "Extracurriculars",
              date: "Just now",
              status: "Pending",
              fileSize: "Unknown"
            }, ...achievements]);
            triggerConfetti();
            addToast("success", "Achievement securely added to vault!");
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };


  const filteredAchievements = activeFilter === "All" 
    ? achievements 
    : achievements.filter(a => a.category === activeFilter);

  return (
    <div className="space-y-8" id="achievement-vault-page">
      {/* Header Banner */}
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-900 to-slate-900 -z-10"></div>
        <div className="space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-bold text-indigo-400">
            <Award className="h-3.5 w-3.5" /> Achievement Vault
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Verify & Showcase Your Credentials
          </h1>
          <p className="text-slate-400 text-sm">
            Keep your certificates, accolades, and leadership records locked and verified. Let the TeenLaunch Digital Twin authenticate your achievements.
          </p>
        </div>
        <div className="shrink-0 bg-slate-800/40 border border-slate-700/60 p-6 rounded-2xl text-center shadow-xl">
          <div className="text-3xl font-black text-indigo-400">{achievements.filter(a => a.status === 'Verified').length}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Verified Badges</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content: Certificates List */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Categories Filters */}
          <div className="flex flex-wrap gap-2">
            {["All", "Academics", "Leadership", "Extracurriculars", "Volunteer"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeFilter === filter ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Certificates list */}
          <div className="space-y-4">
            {filteredAchievements.map((ach) => (
              <motion.div
                layout
                key={ach.id}
                className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${ach.status === 'Verified' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ach.category}</span>
                    <h3 className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors mt-0.5">{ach.title}</h3>
                    <p className="text-xs text-slate-500 font-semibold">{ach.issuer}</p>
                    
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[10px] text-slate-400 font-medium">{ach.date}</span>
                      {ach.fileSize && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] text-slate-400 font-medium">{ach.fileSize}</span>
                        </>
                      )}
                      {ach.badge && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600">
                            <Sparkles className="h-3 w-3" /> {ach.badge}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {ach.status === "Verified" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                      <ShieldCheck className="h-4 w-4" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold rounded-full">
                      <Clock className="h-4 w-4" /> Pending Verification
                    </span>
                  )}
                  <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                    <Download className="h-4 w-4 text-slate-400 hover:text-slate-700" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

        {/* Sidebar: Simulated File Uploader */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5 text-indigo-600" /> Upload Credentials
            </h3>
            
            {/* Drag & Drop Box */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${dragActive ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-200 bg-slate-50'}`}
            >
              {isUploading ? (
                <div className="space-y-4">
                  <div className="h-10 w-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Processing Document...</h4>
                    <p className="text-xs text-slate-400 mt-1">{uploadProgress}% Complete</p>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 cursor-pointer" onClick={() => simulateUpload("IELTS_Certificate_Score_8.pdf")}>
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mx-auto text-indigo-600">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Drag & drop files here</p>
                    <p className="text-xs text-slate-400 mt-1">Supports PDF, PNG, JPG up to 10MB</p>
                  </div>
                  <button type="button" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition-all">
                    Browse File
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-3xl text-white border border-slate-800">
            <h3 className="font-bold text-xs uppercase tracking-widest text-indigo-400 mb-2">Verification Standards</h3>
            <h4 className="text-lg font-extrabold mb-2">Automated Meta Validation</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              TeenLaunch verifies uploaded certificates via cryptographic signatures and school registrar portals. Verified badges add massive credibility weights to your Student Digital Twin profile.
            </p>
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs cursor-pointer hover:underline">
              Read Validation Protocol <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
