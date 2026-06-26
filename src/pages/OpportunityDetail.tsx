import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../components/AuthContext.tsx";
import { Calendar, MapPin, Building2, CheckCircle2, ExternalLink, Bookmark, ArrowLeft } from "lucide-react";
import { cn } from "../lib/utils.ts";

export default function OpportunityDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [op, setOp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    fetchDetail();
    if (user) {
      checkBookmark();
    }
  }, [id, user]);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/opportunities/${id}`);
      if (res.ok) {
        setOp(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkBookmark = async () => {
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/bookmarks", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(data.some((b: any) => b.opportunity.id === parseInt(id!)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      alert("Please sign in to bookmark.");
      return;
    }
    const token = await user.getIdToken();
    try {
      if (isBookmarked) {
        await fetch(`/api/bookmarks/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        setIsBookmarked(false);
      } else {
        await fetch(`/api/bookmarks/${id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading...</div>;
  if (!op) return <div className="p-8 text-center">Opportunity not found.</div>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <Link to="/opportunities" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors w-fit">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to opportunities
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 md:p-12 border-b border-slate-100 relative">
          <button 
            onClick={toggleBookmark}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/50 backdrop-blur shadow-sm hover:bg-white transition-colors"
          >
            <Bookmark className={cn("h-6 w-6", isBookmarked ? "fill-indigo-600 text-indigo-600" : "text-slate-400")} />
          </button>
          
          <div className="inline-flex px-3 py-1 bg-white text-xs font-black uppercase tracking-widest text-indigo-700 rounded-md border border-indigo-100 shadow-sm mb-6">
            {op.category}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">{op.title}</h1>
          <p className="text-lg md:text-xl text-slate-600 font-medium flex items-center gap-2">
            <Building2 className="h-5 w-5" /> {op.organization}
          </p>
        </div>

        <div className="p-8 md:p-12 flex flex-col md:flex-row gap-12">
          <div className="flex-1 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">About this Opportunity</h2>
              <div className="prose prose-slate text-slate-600 leading-relaxed whitespace-pre-wrap">
                {op.description}
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Eligibility Requirements</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                  <span className="text-slate-600">{op.eligibility || "Check application website for detailed eligibility."}</span>
                </li>
              </ul>
            </section>
          </div>

          <div className="w-full md:w-72 shrink-0 space-y-6">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">Deadline</div>
                  <div className="text-sm text-slate-600">{op.deadline ? new Date(op.deadline).toLocaleDateString() : "Rolling Admission"}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">Location</div>
                  <div className="text-sm text-slate-600">{op.isRemote ? "Remote / Online" : op.location}</div>
                </div>
              </div>
              
              {op.country && (
                <div className="flex items-start gap-3 border-t border-slate-100 pt-3">
                  <div className="h-5 w-5 flex items-center justify-center shrink-0">
                    <span className="text-sm">🌐</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Country Availability</div>
                    <div className="text-sm text-slate-600">{op.country}</div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 border-t border-slate-100 pt-3">
                <div className="h-5 w-5 flex items-center justify-center shrink-0">
                  <span className="text-sm">💰</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Paid Status</div>
                  <div className="text-sm text-slate-600">{op.isPaid ? "Paid Program" : "Unpaid / Volunteer"}</div>
                </div>
              </div>

              {op.gradeLevel && (
                <div className="flex items-start gap-3 border-t border-slate-100 pt-3">
                  <div className="h-5 w-5 flex items-center justify-center shrink-0">
                    <span className="text-sm">🎓</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Grade Level</div>
                    <div className="text-sm text-slate-600">{op.gradeLevel}</div>
                  </div>
                </div>
              )}

              {op.ageRequirement && (
                <div className="flex items-start gap-3 border-t border-slate-100 pt-3">
                  <div className="h-5 w-5 flex items-center justify-center shrink-0">
                    <span className="text-sm">🎂</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Age Requirement</div>
                    <div className="text-sm text-slate-600">{op.ageRequirement}</div>
                  </div>
                </div>
              )}

              {op.programLength && (
                <div className="flex items-start gap-3 border-t border-slate-100 pt-3">
                  <div className="h-5 w-5 flex items-center justify-center shrink-0">
                    <span className="text-sm">⏱️</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Program Length</div>
                    <div className="text-sm text-slate-600">{op.programLength}</div>
                  </div>
                </div>
              )}
            </div>

            <a 
              href={op.applicationUrl} 
              target="_blank" 
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 text-base font-bold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Apply Now <ExternalLink className="h-5 w-5" />
            </a>
            <p className="text-xs text-center text-slate-400 mt-2">
              You will be redirected to the official organization website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
