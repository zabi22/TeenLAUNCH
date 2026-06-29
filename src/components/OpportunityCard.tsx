import { memo } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Calendar, MapPin, Sparkles, Globe } from "lucide-react";
import { cn } from "../lib/utils";

interface OpportunityCardProps {
  op: {
    id: number;
    title: string;
    organization: string;
    description: string;
    category: string;
    country?: string;
    city?: string;
    region?: string;
    location?: string;
    isRemote?: boolean;
    isPaid?: boolean;
    eligibility?: string;
    trustScore?: number;
    competitionLevel?: string;
    deadline?: string;
    programLength?: string;
  };
  matchScore: number | null;
  isLocalMatch: boolean;
  isGlobal: boolean;
  isBookmarked: boolean;
  toggleBookmark: (id: number) => void;
}

export const OpportunityCard = memo(function OpportunityCard({
  op,
  matchScore,
  isLocalMatch,
  isGlobal,
  isBookmarked,
  toggleBookmark,
}: OpportunityCardProps) {
  let colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-100";
  const catLower = op.category.toLowerCase();
  if (catLower.includes("scholarship")) colorClasses = "bg-purple-50 text-purple-700 border-purple-100";
  else if (catLower.includes("competition")) colorClasses = "bg-blue-50 text-blue-700 border-blue-100";
  else if (catLower.includes("internship")) colorClasses = "bg-orange-50 text-orange-700 border-orange-100";
  else if (catLower.includes("hackathon")) colorClasses = "bg-rose-50 text-rose-700 border-rose-100";
  else if (catLower.includes("research")) colorClasses = "bg-sky-50 text-sky-700 border-sky-100";
  else if (catLower.includes("volunteer")) colorClasses = "bg-amber-50 text-amber-700 border-amber-100";

  const formattedDeadline = op.deadline
    ? new Date(op.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : "Rolling";

  const locationStr = op.isRemote
    ? "Virtual"
    : op.city
    ? `${op.city}, ${op.region || ""}`
    : op.location || "Varies";

  return (
    <div
      className={cn(
        "bg-white rounded-3xl border p-6 shadow-sm flex flex-col relative transition-all duration-200 hover:shadow-md",
        isLocalMatch
          ? "border-indigo-300 ring-2 ring-indigo-50/50"
          : "border-slate-200 hover:border-indigo-300"
      )}
    >
      {/* Country Badge */}
      <div className="absolute top-6 right-14 flex gap-1">
        {isLocalMatch && (
          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded border border-indigo-100">
            {op.country}
          </span>
        )}
        {isGlobal && (
          <span className="px-2 py-0.5 bg-slate-50 text-slate-600 text-[10px] font-bold rounded border border-slate-100">
            Global
          </span>
        )}
      </div>

      <div className="absolute top-5 right-5">
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleBookmark(op.id);
          }}
          className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors bg-white hover:bg-slate-50 rounded-full z-10 relative shadow-sm border border-slate-100 cursor-pointer"
        >
          <Bookmark className={cn("h-4 w-4", isBookmarked ? "fill-indigo-600 text-indigo-600" : "")} />
        </button>
      </div>

      <div className="flex justify-between items-start mb-3.5">
        <span className={cn("px-2.5 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider border", colorClasses)}>
          {op.category}
        </span>
      </div>

      <h4 className="text-base font-bold text-slate-900 leading-snug mb-1 line-clamp-2 min-h-[2.5rem]">{op.title}</h4>
      <p className="text-xs font-bold text-indigo-600 mb-3">{op.organization}</p>
      <p className="text-xs text-slate-500 flex-1 mb-4 line-clamp-3 leading-relaxed">{op.description}</p>

      {/* Eligibility standard field */}
      {op.eligibility && (
        <p className="text-[11px] text-slate-400 line-clamp-1 mb-3.5 italic bg-slate-50 px-2 py-1 rounded border border-slate-100">
          <span className="font-semibold text-slate-600">Eligible:</span> {op.eligibility}
        </p>
      )}

      <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-4">
        <span className="flex items-center gap-1">
          <Globe className="h-3 w-3 text-amber-500" /> Trust: {op.trustScore || 85}/100
        </span>
        {op.competitionLevel && (
          <span
            className={cn(
              "px-2 py-0.5 rounded",
              op.competitionLevel === "Low"
                ? "bg-emerald-50 text-emerald-600"
                : op.competitionLevel === "Medium"
                ? "bg-amber-50 text-amber-600"
                : "bg-rose-50 text-rose-600"
            )}
          >
            {op.competitionLevel} Comp.
          </span>
        )}
      </div>

      {/* Meta section */}
      <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 mb-4">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">Deadline: {formattedDeadline}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 justify-end">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{locationStr}</span>
        </div>
      </div>
      {matchScore !== null && (
        <div className="flex items-center justify-between bg-indigo-50/50 border border-indigo-100/60 px-3 py-2 rounded-xl mb-4">
          <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-bold">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0" /> AI Match Score
          </div>
          <span className="text-xs font-black text-indigo-700">{matchScore}% Match</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Link
          to={`/opportunities/${op.id}`}
          className={cn(
            "w-full py-2.5 text-center text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer",
            matchScore && matchScore >= 85 ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-900 text-white hover:bg-indigo-800"
          )}
        >
          View Details & Apply
        </Link>
      </div>
    </div>
  );
});
