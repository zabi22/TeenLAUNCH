import React from "react";
import { Briefcase, Building, ArrowRight, ShieldCheck, PlusCircle } from "lucide-react";
import { motion } from "motion/react";

export default function OpportunityMarketplace() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Briefcase className="h-8 w-8 text-indigo-500" />
          Opportunity Marketplace
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          For organizations: Submit and manage opportunities to reach ambitious students.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden lg:col-span-2">
          <div className="absolute top-0 right-0 p-8 opacity-20">
            <Building className="h-48 w-48 text-indigo-500" />
          </div>
          <div className="relative z-10 max-w-lg">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-4 inline-block">
              Organization Portal
            </span>
            <h2 className="text-3xl font-bold mb-4">Post an Opportunity</h2>
            <p className="text-slate-300 mb-8 leading-relaxed">
              Reach thousands of highly vetted, ambitious high school students. Whether you represent a university, a local STEM club, or a Fortune 500 company offering internships.
            </p>
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors">
              <PlusCircle className="h-5 w-5" />
              Create Listing
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Verified Partner Program</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Become a verified partner to skip the manual AI review queue and boost your opportunities to the top of the discovery engine.
            </p>
          </div>
          <button className="mt-6 text-indigo-600 font-bold text-sm flex items-center gap-1 hover:text-indigo-800">
            Apply for Verification <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-slate-900 text-lg">Your Active Listings</h2>
        </div>
        <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-[200px]">
          <Briefcase className="h-12 w-12 text-slate-300 mb-3" />
          <p>You haven't posted any opportunities yet.</p>
        </div>
      </div>
    </div>
  );
}
