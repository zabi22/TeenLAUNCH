import React, { useState } from "react";
import { Search, Microscope, Users, Filter, Star, ChevronRight, BookOpen, Target } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../components/AuthContext.tsx";

export default function ResearchMatching() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-indigo-500" />
          Research & Mentor Matching
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Discover professors, labs, and research opportunities aligned with your target major.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filters
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Field</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>Computer Science</option>
                  <option>Bioinformatics</option>
                  <option>Neuroscience</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Type</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" className="rounded text-indigo-600" defaultChecked /> Professor/PI
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" className="rounded text-indigo-600" defaultChecked /> Structured Program
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by topic, university, or keyword..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          <div className="space-y-4">
            {[
              { name: "Dr. Sarah Jenkins", type: "Professor / PI", uni: "Stanford University", topic: "Machine Learning & Healthcare", match: 94 },
              { name: "Quantum Computing Lab", type: "Research Group", uni: "MIT", topic: "Quantum Algorithms", match: 88 },
              { name: "Bioinformatics Summer Institute", type: "Program", uni: "Johns Hopkins", topic: "Genomics", match: 76 }
            ].map((res, i) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-indigo-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-600">
                    <Target className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{res.name}</h3>
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                      {res.type} <span className="w-1 h-1 bg-slate-300 rounded-full" /> {res.uni}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                      {res.topic}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 md:flex-col md:items-end">
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold border border-emerald-100">
                    <Star className="h-4 w-4 fill-emerald-500 text-emerald-500" /> {res.match}% Match
                  </div>
                  <button className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:text-indigo-800">
                    View Profile <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
