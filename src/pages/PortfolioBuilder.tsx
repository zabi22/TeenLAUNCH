import React, { useState, useEffect } from "react";
import { FolderOpen, ShieldCheck, Globe, Share2, Upload, FileText, Award, BadgeCheck } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../components/AuthContext.tsx";

export default function PortfolioBuilder() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<any>(null);

  useEffect(() => {
    async function fetchStudent() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStudentData(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchStudent();
  }, [user]);
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FolderOpen className="h-8 w-8 text-indigo-500" />
          Public Portfolio & Verification
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Build your public profile, showcase projects, and get achievements verified on-chain.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Globe className="h-5 w-5 text-indigo-500" />
                Live Portfolio Preview
              </h2>
              <button className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-100 flex items-center gap-2">
                <Share2 className="h-4 w-4" /> Share Link
              </button>
            </div>
            <div className="p-8 bg-slate-50 flex items-center justify-center min-h-[400px]">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                  <div className="absolute -bottom-10 left-6 w-20 h-20 bg-white rounded-xl shadow-md p-1">
                    <div className="w-full h-full bg-slate-200 rounded-lg flex items-center justify-center text-2xl font-bold text-slate-400">
                      {(studentData?.name || studentData?.email || "S").charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
                <div className="pt-14 px-6 pb-6">
                  <h3 className="text-xl font-bold text-slate-900">{studentData?.name || studentData?.email || "Student Name"}</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Aspiring {studentData?.goals?.split(',')[0] || "Student"} | {studentData?.grade || ""}</p>
                  
                  <div className="mt-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Verified Achievements</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-100 bg-emerald-50/50">
                        <BadgeCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-slate-900">Portfolio Started</p>
                          <p className="text-xs text-slate-500">Verified via TeenLaunch</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Verification Engine</h3>
                <p className="text-xs font-medium text-slate-500">Upload proof for review</p>
              </div>
            </div>
            
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">Drop certificates or PDFs here</p>
              <p className="text-xs text-slate-500 mt-1">Our AI will extract and verify the data</p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-600 flex items-center gap-2"><FileText className="h-4 w-4" /> AP Calculus Score</span>
                <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">Pending AI</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-600 flex items-center gap-2"><Award className="h-4 w-4" /> Hackathon Win</span>
                <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
