import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../components/AuthContext.tsx";
import { Save, CheckCircle2, TrendingUp, BookOpen, Target, Award, Heart, Briefcase, ChevronRight } from "lucide-react";
import { Navigate } from "react-router-dom";
import { cn } from "../lib/utils.ts";

export default function AcademicProfile() {
  const { user, loading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [profileData, setProfileData] = useState({
    gpa: "",
    weightedGpa: "",
    classRank: "",
    satScore: "",
    actScore: "",
    apCourses: "",
    honorsCourses: "",
    dualEnrollment: "",
    languages: ""
  });
  
  const [strength, setStrength] = useState("Explorer");
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchActivities();
    }
  }, [user]);
  
  useEffect(() => {
    calculateStrength();
  }, [profileData, activities]);

  const fetchProfile = async () => {
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/academic-profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.id) {
          setProfileData({
            gpa: data.gpa?.toString() || "",
            weightedGpa: data.weightedGpa?.toString() || "",
            classRank: data.classRank || "",
            satScore: data.satScore?.toString() || "",
            actScore: data.actScore?.toString() || "",
            apCourses: data.apCourses?.toString() || "",
            honorsCourses: data.honorsCourses?.toString() || "",
            dualEnrollment: data.dualEnrollment?.toString() || "",
            languages: data.languages || ""
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActivities = async () => {
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/activities", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setActivities(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const getCategoryScore = (category: string) => {
    let score = 0;
    if (category === "Academic Excellence") {
        if (parseFloat(profileData.gpa) >= 3.8) score += 40;
        else if (parseFloat(profileData.gpa) >= 3.5) score += 20;
        
        if (parseInt(profileData.satScore) >= 1450) score += 30;
        else if (parseInt(profileData.satScore) >= 1300) score += 15;
        
        if (parseInt(profileData.apCourses) >= 5) score += 30;
        else if (parseInt(profileData.apCourses) >= 2) score += 15;
        
        return Math.min(100, score);
    }
    
    if (category === "Leadership") {
        const leadershipActs = activities.filter(a => a.type === "Leadership" || a.role?.toLowerCase().includes("president") || a.role?.toLowerCase().includes("captain"));
        score = leadershipActs.length * 35;
        return Math.min(100, score);
    }

    if (category === "Community Impact") {
        const volunteerActs = activities.filter(a => a.type === "Volunteer");
        score = volunteerActs.reduce((acc, curr) => acc + (parseInt(curr.hours) || 0), 0);
        return Math.min(100, score > 100 ? 100 : score);
    }

    if (category === "Research & Innovation") {
        const researchActs = activities.filter(a => a.type === "Project" || a.type === "Research");
        score = researchActs.length * 40;
        return Math.min(100, score);
    }

    return 0;
  };

  const calculateStrength = () => {
    const acad = getCategoryScore("Academic Excellence");
    const lead = getCategoryScore("Leadership");
    const comm = getCategoryScore("Community Impact");
    const res = getCategoryScore("Research & Innovation");
    
    const avg = Math.round((acad * 0.4) + (lead * 0.2) + (comm * 0.2) + (res * 0.2));
    setOverallScore(avg);

    if (avg >= 85) setStrength("Elite");
    else if (avg >= 70) setStrength("Competitive");
    else if (avg >= 50) setStrength("Achiever");
    else if (avg >= 30) setStrength("Builder");
    else setStrength("Explorer");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = await user?.getIdToken();
      const payload = {
        gpa: parseFloat(profileData.gpa) || null,
        weightedGpa: parseFloat(profileData.weightedGpa) || null,
        classRank: profileData.classRank,
        satScore: parseInt(profileData.satScore) || null,
        actScore: parseInt(profileData.actScore) || null,
        apCourses: parseInt(profileData.apCourses) || null,
        honorsCourses: parseInt(profileData.honorsCourses) || null,
        dualEnrollment: parseInt(profileData.dualEnrollment) || null,
        languages: profileData.languages
      };
      
      const res = await fetch("/api/academic-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading...</div>;
  if (!user) return <Navigate to="/" />;

  const categories = [
    { name: "Academic Excellence", icon: BookOpen, score: getCategoryScore("Academic Excellence"), color: "bg-blue-500" },
    { name: "Leadership", icon: Award, score: getCategoryScore("Leadership"), color: "bg-amber-500" },
    { name: "Community Impact", icon: Heart, score: getCategoryScore("Community Impact"), color: "bg-rose-500" },
    { name: "Research & Innovation", icon: Briefcase, score: getCategoryScore("Research & Innovation"), color: "bg-emerald-500" },
  ];

  const weakness = categories.reduce((prev, curr) => (prev.score < curr.score ? prev : curr));

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Academic Profile</h1>
          <p className="text-slate-500">Measure your standing and discover what you need to improve next.</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-900 p-2 pl-4 pr-6 rounded-full shadow-lg text-white">
          <div className="h-10 w-10 bg-indigo-500 rounded-full flex items-center justify-center font-bold text-lg">
            {overallScore}
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Overall Status</div>
            <div className="font-bold">{strength} Level</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Core Stats Form */}
        <div className="lg:col-span-3 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" /> Core Academics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Unweighted GPA</label>
                  <input type="number" step="0.01" value={profileData.gpa} onChange={(e) => setProfileData({...profileData, gpa: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Weighted GPA</label>
                  <input type="number" step="0.01" value={profileData.weightedGpa} onChange={(e) => setProfileData({...profileData, weightedGpa: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">SAT Score</label>
                  <input type="number" value={profileData.satScore} onChange={(e) => setProfileData({...profileData, satScore: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">AP/IB Courses</label>
                  <input type="number" value={profileData.apCourses} onChange={(e) => setProfileData({...profileData, apCourses: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Honors</label>
                  <input type="number" value={profileData.honorsCourses} onChange={(e) => setProfileData({...profileData, honorsCourses: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </section>
            <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
              <button 
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-600 focus:outline-none disabled:opacity-70"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Metrics"}
              </button>
              {saved && (
                <span className="flex items-center text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="mr-1 h-4 w-4" /> Updated
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Categories Analysis */}
        <div className="lg:col-span-1 space-y-4">
          {categories.map((cat, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-center mb-2 relative z-10">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  <cat.icon className="h-4 w-4 text-slate-400" /> {cat.name}
                </div>
                <div className="text-sm font-bold text-slate-900">{cat.score}</div>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden relative z-10">
                <div className={cn("h-full transition-all duration-1000", cat.color)} style={{ width: `${cat.score}%` }}></div>
              </div>
            </div>
          ))}

          <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl mt-6">
            <div className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">Weakness Detected</div>
            <p className="text-sm text-amber-900 font-medium mb-3">
              Your <strong className="font-bold">{weakness.name}</strong> profile is currently below average for selective universities ({weakness.score}/100).
            </p>
          </div>
        </div>

      </div>
      
      {/* Weekly Growth Plan */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-indigo-600" /> Weekly Growth Plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm border-t-4 border-t-emerald-500">
            <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Quick Wins</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full border border-slate-300 shrink-0 flex-none cursor-pointer hover:border-emerald-500"></div>
                <span className="text-sm text-slate-600 font-medium leading-tight">Update your Activity Tracker with recent volunteer hours.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full border border-slate-300 shrink-0 flex-none cursor-pointer hover:border-emerald-500"></div>
                <span className="text-sm text-slate-600 font-medium leading-tight">Save 3 new scholarships matching your profile.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full border border-slate-300 shrink-0 flex-none cursor-pointer hover:border-emerald-500"></div>
                <span className="text-sm text-slate-600 font-medium leading-tight">Follow two reach colleges on their admissions blogs.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm border-t-4 border-t-blue-500">
            <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Medium Goals</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full border border-slate-300 shrink-0 flex-none cursor-pointer hover:border-blue-500"></div>
                <span className="text-sm text-slate-600 font-medium leading-tight">Draft an outline for your primary college essay.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full border border-slate-300 shrink-0 flex-none cursor-pointer hover:border-blue-500"></div>
                <span className="text-sm text-slate-600 font-medium leading-tight">Reach out to a teacher for a recommendation letter.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full border border-slate-300 shrink-0 flex-none cursor-pointer hover:border-blue-500"></div>
                <span className="text-sm text-slate-600 font-medium leading-tight">Register for a regional competition in your major.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-lg border-t-4 border-t-indigo-500">
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider flex justify-between items-center">
              High Impact
              <span className="bg-indigo-600 text-[10px] px-2 py-0.5 rounded-full">PRIORITY</span>
            </h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-sm text-slate-300 font-medium leading-relaxed mb-4">
                  Secure a leadership role to improve your <strong className="text-white">Leadership Score</strong> from its current {getCategoryScore("Leadership")}/100.
                </p>
                <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  View Opportunities <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
