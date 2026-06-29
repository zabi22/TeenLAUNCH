import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Compass, Search, Filter, Bookmark, ChevronRight, Star, Globe, ShieldCheck } from "lucide-react";

interface DiscoverableOpportunity {
  id: string;
  title: string;
  category: "STEM" | "Humanities" | "Arts" | "Leadership";
  cost: "Free" | "Paid" | "Scholarship";
  type: "Virtual" | "On-site";
  organization: string;
  description: string;
}

export default function DiscoveryDashboard() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string>("All");
  const [activeCost, setActiveCost] = useState<string>("All");

  const discoveryDb: DiscoverableOpportunity[] = [
    { id: "1", title: "KPMG STEM Virtual Experience", category: "STEM", cost: "Free", type: "Virtual", organization: "KPMG", description: "Learn real-world cybersecurity protocols and data structures from expert quantitative directors." },
    { id: "2", title: "Concord Review Historical Writing Essay", category: "Humanities", cost: "Paid", type: "Virtual", organization: "Concord Review", description: "Write an authoritative 4000-word research essay regarding historical Scandinavian mercantilist structures." },
    { id: "3", title: "Youth Leadership Parliament Sweden", category: "Leadership", cost: "Scholarship", type: "On-site", organization: "Riksdagen Youth", description: "Engage with national Swedish parliament members inside legislative debate sessions." },
    { id: "4", title: "Young Artists Stockholm Biennale", category: "Arts", cost: "Free", type: "On-site", organization: "Kulturhuset Stockholm", description: "Display high-fidelity physical or digital bio-sculptures inside central Stockholm gallery layouts." }
  ];

  const filtered = discoveryDb.filter(op => {
    const matchesSearch = op.title.toLowerCase().includes(search.toLowerCase()) || op.organization.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCat === "All" || op.category === activeCat;
    const matchesCost = activeCost === "All" || op.cost === activeCost;
    return matchesSearch && matchesCat && matchesCost;
  });

  return (
    <div className="space-y-8" id="discovery-dashboard-page">
      {/* Hero Title */}
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-900 to-slate-900 -z-10"></div>
        <div className="space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-bold text-indigo-400">
            <Compass className="h-3.5 w-3.5" /> Discovery Hub
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Extracurricular Discovery Hub
          </h1>
          <p className="text-slate-400 text-sm">
            Search, filter, and explore prestige summer internships, national essay challenges, or non-profit opportunities across Europe and globally.
          </p>
        </div>
        <div className="shrink-0 bg-slate-800/40 border border-slate-700/60 p-6 rounded-2xl text-center shadow-xl">
          <div className="text-3xl font-black text-indigo-400">{filtered.length}</div>
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mt-1">Available Matches</div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Search / Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keywords, organizations, or programs..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
            />
          </div>

          <div className="flex gap-2">
            {/* Category Select */}
            <select
              value={activeCat}
              onChange={(e) => setActiveCat(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-600 focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="STEM">STEM</option>
              <option value="Humanities">Humanities</option>
              <option value="Arts">Arts</option>
              <option value="Leadership">Leadership</option>
            </select>

            {/* Cost Select */}
            <select
              value={activeCost}
              onChange={(e) => setActiveCost(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-600 focus:outline-none"
            >
              <option value="All">All Pricing</option>
              <option value="Free">Free</option>
              <option value="Paid">Paid</option>
              <option value="Scholarship">Scholarship</option>
            </select>
          </div>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((op) => (
            <div key={op.id} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-72 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold rounded uppercase tracking-wider">{op.category}</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">{op.cost}</span>
                  </div>
                  <button className="text-slate-400 hover:text-indigo-600">
                    <Bookmark className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">{op.title}</h3>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{op.organization}</span>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{op.description}</p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{op.type} commitment</span>
                <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                  Learn More <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="p-8 text-center text-sm text-slate-400 col-span-2">No discoverable opportunities match your parameters.</p>
          )}
        </div>
      </div>
    </div>
  );
}
