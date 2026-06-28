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
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
              <Microscope className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-bold text-slate-900 text-lg mb-2">No matches found</h3>
              <p className="text-slate-500 text-sm">
                Try adjusting your search criteria or explore other fields to find research opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
