import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, MapPin, Calendar, ExternalLink, Bookmark, Filter, Globe, Sparkles, GraduationCap, DollarSign, Clock } from "lucide-react";
import { useAuth } from "../components/AuthContext.tsx";
import { cn } from "../lib/utils.ts";

export default function Opportunities() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  
  // New Global Filters State
  const [countryFilter, setCountryFilter] = useState("All");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [remoteFilter, setRemoteFilter] = useState<boolean | null>(null); // null = All, true = Remote, false = In-Person
  const [paidFilter, setPaidFilter] = useState<boolean | null>(null); // null = All, true = Paid, false = Unpaid
  const [lengthFilter, setLengthFilter] = useState("All");
  const [isDiscovering, setIsDiscovering] = useState(false);

  const { user, appUser } = useAuth();
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  useEffect(() => {
    fetchOpportunities();
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/opportunities");
      if (res.ok) {
        const data = await res.json();
        setOpportunities(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/bookmarks", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data.map((b: any) => b.opportunity.id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleBookmark = async (id: number) => {
    if (!user) {
      alert("Please sign in to bookmark opportunities.");
      return;
    }
    const isBookmarked = bookmarks.includes(id);
    const token = await user.getIdToken();
    try {
      if (isBookmarked) {
        await fetch(`/api/bookmarks/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookmarks(bookmarks.filter(bId => bId !== id));
      } else {
        await fetch(`/api/bookmarks/${id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookmarks([...bookmarks, id]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // AI Scout continuous opportunity discovery
  const discoverOpportunitiesWithAI = async () => {
    setIsDiscovering(true);
    try {
      const token = await user?.getIdToken();
      const scoutCountry = countryFilter !== "All" ? countryFilter : (appUser?.country || "Global");
      const res = await fetch("/api/opportunities/aggregate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ country: scoutCountry })
      });
      if (res.ok) {
        const data = await res.json();
        await fetchOpportunities();
        alert(`Successfully discovered and added ${data.count || 3} new opportunities for ${scoutCountry}!`);
      } else {
        alert("Discovery failed. Please try again later.");
      }
    } catch (err) {
      console.error("AI Scout discovery failed:", err);
    } finally {
      setIsDiscovering(false);
    }
  };

  const categories = [
    "All",
    "Scholarships",
    "Internships",
    "Competitions",
    "Research Programs",
    "Volunteer Opportunities",
    "Hackathons",
    "Summer Programs"
  ];

  const countries = [
    "All",
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Germany",
    "France",
    "India",
    "Singapore",
    "United Arab Emirates",
    "Saudi Arabia",
    "South Africa",
    "Brazil",
    "Mexico",
    "Japan",
    "South Korea",
    "Global",
    "Other"
  ];

  const grades = [
    "All",
    "9th Grade",
    "10th Grade",
    "11th Grade",
    "12th Grade",
    "College Freshman",
    "Other"
  ];

  const getMatchScore = (op: any, user: any) => {
    if (!user) return null;
    let score = 70; // baseline
    if (op.country === user.country) score += 15;
    else if (op.country === "Global" || !op.country) score += 10;
    
    if (user.grade && op.gradeLevel) {
      if (op.gradeLevel.toLowerCase().includes(user.grade.toLowerCase()) || op.gradeLevel.toLowerCase() === "all") {
        score += 10;
      }
    }
    
    if (user.interests && op.description) {
      const userInterests = user.interests.toLowerCase().split(",").map((i: string) => i.trim());
      const hasInterest = userInterests.some((interest: string) => 
        interest && (op.description.toLowerCase().includes(interest) || op.title.toLowerCase().includes(interest))
      );
      if (hasInterest) score += 4;
    }
    return Math.min(score, 99);
  };

  const filteredOpportunities = opportunities.filter(op => {
    // 1. Search filter
    const matchesSearch = op.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          op.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          op.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Category filter
    const matchesCategory = categoryFilter === "All" || 
                            op.category.toLowerCase().includes(categoryFilter.toLowerCase().replace("opportunities", "volunteer").replace("programs", "").trim());

    // 3. Country filter
    const matchesCountry = countryFilter === "All" || 
                           (op.country && op.country.toLowerCase() === countryFilter.toLowerCase());

    // 4. Grade filter
    const matchesGrade = gradeFilter === "All" || 
                         !op.gradeLevel || 
                         op.gradeLevel.toLowerCase() === "all" || 
                         op.gradeLevel.toLowerCase().includes(gradeFilter.toLowerCase());

    // 5. Remote filter
    const matchesRemote = remoteFilter === null || op.isRemote === remoteFilter;

    // 6. Paid filter
    const matchesPaid = paidFilter === null || op.isPaid === paidFilter;

    // 7. Length filter
    let matchesLength = true;
    if (lengthFilter !== "All" && op.programLength) {
      const len = op.programLength.toLowerCase();
      if (lengthFilter === "Short") {
        matchesLength = len.includes("week") || len.includes("day") || len.includes("hour");
      } else if (lengthFilter === "Medium") {
        matchesLength = len.includes("month") || len.includes("summer");
      } else if (lengthFilter === "Long") {
        matchesLength = len.includes("year") || len.includes("4 year") || len.includes("ongoing");
      }
    }

    return matchesSearch && matchesCategory && matchesCountry && matchesGrade && matchesRemote && matchesPaid && matchesLength;
  });

  // Prioritize country-based matches first
  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    if (!appUser) return 0;
    const countryA = a.country || "";
    const countryB = b.country || "";
    const userCountry = appUser.country || "";

    // Exact matches go first
    if (countryA.toLowerCase() === userCountry.toLowerCase() && countryB.toLowerCase() !== userCountry.toLowerCase()) return -1;
    if (countryB.toLowerCase() === userCountry.toLowerCase() && countryA.toLowerCase() !== userCountry.toLowerCase()) return 1;

    // Global matches go second
    if (countryA.toLowerCase() === "global" && countryB.toLowerCase() !== "global") return -1;
    if (countryB.toLowerCase() === "global" && countryA.toLowerCase() !== "global") return 1;

    return 0;
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-2">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Discover Opportunities</h1>
          <p className="text-slate-500 font-medium">
            {appUser?.country ? (
              <span>Prioritizing opportunities for <span className="text-indigo-600 font-bold">{appUser.country}</span> & Global programs</span>
            ) : (
              "Personalized global student discovery engine."
            )}
          </p>
        </div>
        <div className="w-full md:max-w-md relative">
          <input 
            type="text" 
            placeholder="Search title, org, or eligibility..." 
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm font-medium text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-4 top-3.5 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-72 shrink-0 border border-slate-200 bg-white p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Filter className="h-4 w-4 text-indigo-500" /> Global Filters
            </h3>
            <button 
              onClick={() => {
                setCategoryFilter("All");
                setCountryFilter("All");
                setGradeFilter("All");
                setRemoteFilter(null);
                setPaidFilter(null);
                setLengthFilter("All");
                setSearchTerm("");
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              Reset
            </button>
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Opportunity Type
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-700 bg-slate-50 font-medium"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Country select */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Globe className="h-3.5 w-3.5 text-indigo-500" /> Country / Availability
            </label>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-700 bg-slate-50 font-medium"
            >
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Grade selection */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5 text-indigo-500" /> Grade Level
            </label>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-700 bg-slate-50 font-medium"
            >
              {grades.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Paid / Unpaid */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Compensation
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaidFilter(null)}
                className={cn("py-1.5 text-xs font-bold rounded-lg border transition-all", paidFilter === null ? "bg-indigo-600 border-indigo-600 text-white" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100")}
              >
                All
              </button>
              <button
                onClick={() => setPaidFilter(true)}
                className={cn("py-1.5 text-xs font-bold rounded-lg border transition-all", paidFilter === true ? "bg-indigo-600 border-indigo-600 text-white" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100")}
              >
                Paid
              </button>
              <button
                onClick={() => setPaidFilter(false)}
                className={cn("py-1.5 text-xs font-bold rounded-lg border transition-all", paidFilter === false ? "bg-indigo-600 border-indigo-600 text-white" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100")}
              >
                Free
              </button>
            </div>
          </div>

          {/* Remote / In-Person */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setRemoteFilter(null)}
                className={cn("py-1.5 text-xs font-bold rounded-lg border transition-all", remoteFilter === null ? "bg-indigo-600 border-indigo-600 text-white" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100")}
              >
                All
              </button>
              <button
                onClick={() => setRemoteFilter(true)}
                className={cn("py-1.5 text-xs font-bold rounded-lg border transition-all", remoteFilter === true ? "bg-indigo-600 border-indigo-600 text-white" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100")}
              >
                Virtual
              </button>
              <button
                onClick={() => setRemoteFilter(false)}
                className={cn("py-1.5 text-xs font-bold rounded-lg border transition-all", remoteFilter === false ? "bg-indigo-600 border-indigo-600 text-white" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100")}
              >
                In-Person
              </button>
            </div>
          </div>

          {/* Program Length */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Program Length
            </label>
            <select
              value={lengthFilter}
              onChange={(e) => setLengthFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-700 bg-slate-50 font-medium"
            >
              <option value="All">All Durations</option>
              <option value="Short">Short (under 1 month)</option>
              <option value="Medium">Medium (1-3 months)</option>
              <option value="Long">Long (3+ months)</option>
            </select>
          </div>

          {/* AI Scout Panel */}
          <div className="p-5 bg-gradient-to-br from-indigo-900 to-purple-950 text-white rounded-2xl border border-indigo-800 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-300 uppercase tracking-wider mb-1.5">
              <Sparkles className="h-4 w-4 animate-pulse" /> AI Scout Discoverer
            </div>
            <p className="text-[11px] text-indigo-200 leading-relaxed mb-4">
              Scout the web with real-time AI to aggregate new prestigious opportunities for <span className="font-bold underline">{countryFilter !== "All" ? countryFilter : (appUser?.country || "Global")}</span>.
            </p>
            <button 
              onClick={discoverOpportunitiesWithAI}
              disabled={isDiscovering}
              className={cn("w-full py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:bg-indigo-800 disabled:text-indigo-400 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer", isDiscovering && "animate-pulse")}
            >
              {isDiscovering ? "Discovering with AI..." : `Aggregate for ${countryFilter !== "All" ? countryFilter : "Local/Global"}`}
            </button>
          </div>
        </aside>

        {/* Opportunity List */}
        <div className="flex-1 w-full">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-72 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : sortedOpportunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedOpportunities.map(op => {
                const matchScore = getMatchScore(op, appUser);
                const isLocalMatch = appUser && op.country?.toLowerCase() === appUser.country?.toLowerCase();
                const isGlobal = op.country?.toLowerCase() === "global";

                let colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-100";
                const catLower = op.category.toLowerCase();
                if (catLower.includes("scholarship")) colorClasses = "bg-purple-50 text-purple-700 border-purple-100";
                else if (catLower.includes("competition")) colorClasses = "bg-blue-50 text-blue-700 border-blue-100";
                else if (catLower.includes("internship")) colorClasses = "bg-orange-50 text-orange-700 border-orange-100";
                else if (catLower.includes("hackathon")) colorClasses = "bg-rose-50 text-rose-700 border-rose-100";
                else if (catLower.includes("research")) colorClasses = "bg-sky-50 text-sky-700 border-sky-100";
                else if (catLower.includes("volunteer")) colorClasses = "bg-amber-50 text-amber-700 border-amber-100";

                return (
                  <div key={op.id} className={cn("bg-white rounded-3xl border p-6 shadow-sm flex flex-col relative transition-all duration-200 hover:shadow-md", isLocalMatch ? "border-indigo-300 ring-2 ring-indigo-50/50" : "border-slate-200 hover:border-indigo-300")}>
                    
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
                        onClick={(e) => { e.preventDefault(); toggleBookmark(op.id); }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors bg-white hover:bg-slate-50 rounded-full z-10 relative shadow-sm border border-slate-100"
                      >
                        <Bookmark className={cn("h-4 w-4", bookmarks.includes(op.id) ? "fill-indigo-600 text-indigo-600" : "")} />
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

                    {/* Meta section */}
                    <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 mb-4">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">Deadline: {op.deadline ? new Date(op.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : "Rolling"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 justify-end">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{op.isRemote ? "Virtual" : (op.location || "Varies")}</span>
                      </div>
                    </div>

                    {/* AI Match Badge or standard score */}
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
                        className={cn("w-full py-2.5 text-center text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer", matchScore && matchScore >= 85 ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-900 text-white hover:bg-indigo-800")}
                      >
                        View Details & Apply
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24 bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
              <h3 className="text-xl font-bold text-slate-900 mb-2">No opportunities found</h3>
              <p className="text-slate-500 mb-6">Try adjusting your global search filters or select another country.</p>
              <button 
                onClick={discoverOpportunitiesWithAI}
                disabled={isDiscovering}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <Sparkles className="h-4 w-4" /> Run AI Scout to find some!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
