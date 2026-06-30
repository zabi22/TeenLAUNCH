import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../components/AuthContext.tsx";
import { Save, User, CheckCircle2 } from "lucide-react";
import { Navigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase.ts";

export default function Profile() {
  const { user, appUser, refreshAppUser, loading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    grade: "",
    interests: "",
    goals: "",
    country: ""
  });

  const countries = [
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
    "Other"
  ];

  useEffect(() => {
    if (appUser) {
      setFormData({
        grade: appUser.grade || "",
        interests: appUser.interests || "",
        goals: appUser.goals || "",
        country: appUser.country || "United States"
      });
    }
  }, [appUser]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <Navigate to="/" />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.country) {
      alert("Country selection is mandatory. Please select your country.");
      return;
    }
    setSaving(true);
    setSaved(false);
    try {
      const token = await user.getIdToken();
      
      try {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email || "",
          name: appUser?.name || user.displayName || "",
          country: formData.country,
          grade: formData.grade,
          interests: formData.interests,
          goals: formData.goals,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (fsError) {
        console.error("Failed to sync to Firestore:", fsError);
      }

      const res = await fetch("/api/users/me", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        await refreshAppUser();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Your Profile</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Complete your profile to get personalized opportunity recommendations.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm p-8">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
          <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="h-16 w-16 rounded-full" />
            ) : (
              <User className="h-8 w-8" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{appUser?.name || user.displayName}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{appUser?.email || user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Grade Level <span className="text-rose-500">*</span></label>
            <select 
              value={formData.grade}
              onChange={(e) => setFormData({...formData, grade: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 shadow-sm"
              required
            >
              <option value="">Select your grade</option>
              <option value="9th Grade">9th Grade</option>
              <option value="10th Grade">10th Grade</option>
              <option value="11th Grade">11th Grade</option>
              <option value="12th Grade">12th Grade</option>
              <option value="College Freshman">College Freshman</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Country <span className="text-rose-500">*</span></label>
            <select 
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 shadow-sm"
              required
            >
              <option value="">Select your country</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Academic & Extracurricular Interests</label>
            <textarea 
              value={formData.interests}
              onChange={(e) => setFormData({...formData, interests: e.target.value})}
              placeholder="e.g., Computer Science, Debate, Biology, Creative Writing..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 shadow-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Career Goals</label>
            <textarea 
              value={formData.goals}
              onChange={(e) => setFormData({...formData, goals: e.target.value})}
              placeholder="e.g., Software Engineer, Medical Doctor, Entrepreneur..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 shadow-sm resize-none"
            />
          </div>

          <div className="pt-4 flex items-center gap-4">
            <button 
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Profile"}
            </button>
            {saved && (
              <span className="flex items-center text-sm font-medium text-emerald-600">
                <CheckCircle2 className="mr-1 h-4 w-4" /> Saved successfully
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
