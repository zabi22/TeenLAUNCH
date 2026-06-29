import React, { useState } from "react";
import { useAuth } from "../components/AuthContext.tsx";
import { motion } from "motion/react";
import { Globe, User as UserIcon, Calendar, ArrowRight, Sparkles, LogOut } from "lucide-react";

export default function Onboarding() {
  const { user, appUser, refreshAppUser, logOut } = useAuth();
  const [name, setName] = useState(appUser?.name || user?.displayName || "");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("United States");
  const [customCountry, setCustomCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Germany",
    "India",
    "Singapore",
    "Other"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Full Name is required.");
      return;
    }

    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge <= 0) {
      setError("Please enter a valid positive age.");
      return;
    }

    const finalCountry = country === "Other" ? customCountry.trim() : country;
    if (!finalCountry) {
      setError("Country is required.");
      return;
    }

    setLoading(true);
    try {
      const token = await user?.getIdToken();
      const response = await fetch("/api/users/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          age: parsedAge,
          country: finalCountry
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.user_friendly_message || "Failed to save onboarding details.");
      }

      await refreshAppUser();
    } catch (err: any) {
      console.error("Onboarding submission error:", err);
      setError(err?.message || "Something went wrong while saving. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-white border border-slate-100 rounded-3xl shadow-xl p-6 sm:p-10 relative z-10"
        id="onboarding-card"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl mb-4">
            <Sparkles className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome to TeenLaunch!
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Let's customize your launchpad profile before we begin.
          </p>
        </div>

        {/* Username Showcase */}
        {appUser?.username && (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Your Assigned Launchpad Handle
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-sm font-semibold rounded-full">
              @{appUser.username}
            </span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm font-semibold"
          >
            {error}
          </motion.div>
        )}

        {/* Onboarding Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-slate-400" /> Full Name
            </label>
            <input
              type="text"
              id="onboarding-fullname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
              required
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" /> Age
            </label>
            <input
              type="number"
              id="onboarding-age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 16"
              min="1"
              max="120"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
              required
            />
          </div>

          {/* Country Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-400" /> Country
            </label>
            <select
              id="onboarding-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-semibold"
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Custom Country Input (if 'Other' is chosen) */}
            {country === "Other" && (
              <motion.input
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: "12px" }}
                type="text"
                id="onboarding-country-custom"
                value={customCountry}
                onChange={(e) => setCustomCountry(e.target.value)}
                placeholder="Enter your country"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
                required
              />
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              id="onboarding-logout-btn"
              onClick={() => logOut()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
            <button
              type="submit"
              id="onboarding-submit-btn"
              disabled={loading}
              className="flex-[2] inline-flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Complete Setup <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
