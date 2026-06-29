import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, MapPin, Calendar, ExternalLink, Bookmark, Filter, Globe, Sparkles, GraduationCap, DollarSign, Clock, Globe2, Loader2 } from "lucide-react";
import { useAuth } from "../components/AuthContext.tsx";
import { cn } from "../lib/utils.ts";
import { EmptyState } from "../components/EmptyState";
import { OpportunityCard } from "../components/OpportunityCard";

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
    if (appUser?.country && countryFilter === "All") {
      setCountryFilter(appUser.country);
    }
  }, [appUser]);

  useEffect(() => {
    fetchOpportunities();
    if (user) {
      fetchBookmarks();
    }
  }, [user, countryFilter]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const token = await user?.getIdToken();
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.set("q", searchTerm);
      
      // Pass the UI filter explicitly so the backend uses it instead of defaulting to user's profile country
      if (countryFilter) {
        queryParams.set("country", countryFilter);
      }
      
      const url = `/api/opportunities?${queryParams.toString()}`;
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setOpportunities(data.results || data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // We should debounce fetchOpportunities if search changes, but since this is an MVP we'll trigger it on search.
  // Actually, we'll let a "Search" button trigger it, or trigger on enter.
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOpportunities();
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

  const toggleBookmark = useCallback(async (id: number) => {
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
        setBookmarks(prev => prev.filter(bId => bId !== id));
      } else {
        await fetch(`/api/bookmarks/${id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookmarks(prev => [...prev, id]);
      }
    } catch (err) {
      console.error(err);
    }
  }, [user, bookmarks]);

  // AI Scout continuous opportunity discovery
  const discoverOpportunitiesWithAI = async (type: string = "mixed") => {
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
        body: JSON.stringify({ 
          country: scoutCountry,
          type
        })
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
    "Mexico",
    "United Kingdom",
    "Ireland",
    "France",
    "Germany",
    "Italy",
    "Spain",
    "Portugal",
    "Netherlands",
    "Belgium",
    "Switzerland",
    "Austria",
    "Sweden",
    "Norway",
    "Denmark",
    "Finland",
    "Poland",
    "Czech Republic",
    "Hungary",
    "Romania",
    "Greece",
    "Turkey",
    "Ukraine",
    "India",
    "Pakistan",
    "Bangladesh",
    "Sri Lanka",
    "Nepal",
    "China",
    "Japan",
    "South Korea",
    "Singapore",
    "Malaysia",
    "Indonesia",
    "Thailand",
    "Vietnam",
    "Philippines",
    "Australia",
    "New Zealand",
    "South Africa",
    "Nigeria",
    "Kenya",
    "Egypt",
    "Brazil",
    "Argentina",
    "Chile",
    "Colombia",
    "Peru",
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

  const getMatchScore = useCallback((op: any, user: any) => {
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
  }, []);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(op => {
      // 2. Category filter
      const matchesCategory = categoryFilter === "All" || 
                              (op.category && op.category.toLowerCase().includes(categoryFilter.toLowerCase().replace("opportunities", "volunteer").replace("programs", "").trim()));

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

      return matchesCategory && matchesCountry && matchesGrade && matchesRemote && matchesPaid && matchesLength;
    });
  }, [opportunities, categoryFilter, countryFilter, gradeFilter, remoteFilter, paidFilter, lengthFilter]);

  // Prioritize country-based matches first
  const sortedOpportunities = useMemo(() => {
    return [...filteredOpportunities].sort((a, b) => {
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
  }, [filteredOpportunities, appUser]);

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
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input 
              type="text" 
              placeholder="Search title, org, or eligibility..." 
              className="w-full pl-11 pr-24 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm font-medium text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-4 top-3.5 text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <button type="submit" className="absolute right-2 top-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-500 transition-colors">
              Search
            </button>
          </form>
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
          <div className="p-5 bg-gradient-to-br from-indigo-900 to-purple-950 text-white rounded-2xl border border-indigo-800 shadow-lg relative overflow-hidden space-y-3">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-300 uppercase tracking-wider mb-1.5">
              <Sparkles className="h-4 w-4 animate-pulse" /> AI Scout Discoverer
            </div>
            <p className="text-[11px] text-indigo-200 leading-relaxed mb-4">
              Scout the web with real-time AI to aggregate new prestigious opportunities for <span className="font-bold underline">{countryFilter !== "All" ? countryFilter : (appUser?.country || "Global")}</span>.
            </p>
            <button 
              onClick={() => discoverOpportunitiesWithAI("local")}
              disabled={isDiscovering}
              className={cn("w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:text-indigo-400 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer", isDiscovering && "opacity-50")}
            >
              {isDiscovering ? "Discovering..." : `Find Local Gems`}
            </button>
            <button 
              onClick={() => discoverOpportunitiesWithAI("global")}
              disabled={isDiscovering}
              className={cn("w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:text-purple-400 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer", isDiscovering && "opacity-50")}
            >
              {isDiscovering ? "Discovering..." : `Find Global Prestige`}
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
              {sortedOpportunities.map(op => (
                <OpportunityCard 
                  key={op.id}
                  op={op}
                  matchScore={getMatchScore(op, appUser)}
                  isLocalMatch={!!(appUser && op.country?.toLowerCase() === appUser.country?.toLowerCase())}
                  isGlobal={op.country?.toLowerCase() === "global"}
                  isBookmarked={bookmarks.includes(op.id)}
                  toggleBookmark={toggleBookmark}
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={Search}
              title="No opportunities found"
              description="Try adjusting your global search filters or select another country."
              action={
                <div className="flex gap-2 justify-center">
                  <button 
                    onClick={() => discoverOpportunitiesWithAI("local")}
                    disabled={isDiscovering}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" /> {isDiscovering ? "Running..." : "Find Local Gems"}
                  </button>
                  <button 
                    onClick={() => discoverOpportunitiesWithAI("global")}
                    disabled={isDiscovering}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Globe2 className="h-4 w-4" /> {isDiscovering ? "Running..." : "Find Global Prestige"}
                  </button>
                </div>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
