import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Search, Bookmark, CheckCircle, ChevronRight, Briefcase, DollarSign, Calendar, MapPin } from "lucide-react";

interface MarketplaceRole {
  id: string;
  title: string;
  company: string;
  stipend: string;
  location: string;
  deadline: string;
  applied: boolean;
  description: string;
}

export default function OpportunityMarketplace() {
  const [search, setSearch] = useState("");
  const [roles, setRoles] = useState<MarketplaceRole[]>([
    { id: "1", title: "Junior Software Engineering Fellow", company: "Stripe", stipend: "$2,500 / month", location: "Remote / Europe", deadline: "Oct 30", applied: false, description: "Gain full-stack production exposure working inside Stripe financial checkout workflows." },
    { id: "2", title: "Quantitative Trading Intern", company: "Nordea Stockholm", stipend: "$3,000 / month", location: "Stockholm, SE", deadline: "Nov 15", applied: false, description: "Analyze real-time bond valuation logs and construct Python predictive dashboards." },
    { id: "3", title: "Municipal Carbon Capture Analyst", company: "Stockholm Stad", stipend: "$1,800 / month", location: "Stockholm, SE", deadline: "Dec 01", applied: false, description: "Assess industrial emissions curves and model municipal carbon-tax balances." }
  ]);

  const handleApply = (id: string) => {
    setRoles(prev => prev.map(r => r.id === id ? { ...r, applied: true } : r));
  };

  const filteredRoles = roles.filter(r => r.title.toLowerCase().includes(search.toLowerCase()) || r.company.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8" id="opportunity-marketplace-page">
      {/* Title Banner */}
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-900 to-slate-900 -z-10"></div>
        <div className="space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-bold text-indigo-400">
            <ShoppingBag className="h-3.5 w-3.5" /> High-stipend student marketplace
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Opportunity Marketplace
          </h1>
          <p className="text-slate-400 text-sm">
            Apply directly to vetted high-stipend summer fellowships, corporate sponsorships, and paid research tracks aligned with your Student Digital Twin specs.
          </p>
        </div>
        <div className="shrink-0 bg-slate-800/40 border border-slate-700/60 p-6 rounded-2xl text-center shadow-xl">
          <div className="text-3xl font-black text-indigo-400">{roles.filter(r => r.applied).length}</div>
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mt-1">Submitted Applications</div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search paid fellowships, companies, or internship topics..."
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
          />
        </div>

        {/* Roles list */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => (
            <div key={role.id} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-80 group relative">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                    {role.company}
                  </span>
                  <button className="text-slate-400 hover:text-indigo-600">
                    <Bookmark className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{role.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{role.description}</p>
                
                {/* Specs metadata */}
                <div className="space-y-1 pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <DollarSign className="h-3.5 w-3.5 text-indigo-500" /> <span className="font-bold text-slate-800">{role.stipend}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" /> <span>{role.location}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Ends {role.deadline}
                </span>

                {role.applied ? (
                  <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" /> Applied
                  </span>
                ) : (
                  <button
                    onClick={() => handleApply(role.id)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
                  >
                    One-Click Apply
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredRoles.length === 0 && (
            <p className="p-8 text-center text-sm text-slate-400 col-span-3">No marketplace roles match your query.</p>
          )}
        </div>
      </div>
    </div>
  );
}
