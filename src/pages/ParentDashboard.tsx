import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, LineChart, Shield, Target, Calendar, ArrowRight } from "lucide-react";
import { useAuth } from "../components/AuthContext.tsx";

export default function ParentDashboard() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<any>(null);

  useEffect(() => {
    async function fetchStudent() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStudentData(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchStudent();
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="h-8 w-8 text-indigo-500" />
          Parent & Guardian Portal
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Track your student's progress, view AI readiness indicators, and monitor scholarship pipelines.
        </p>
      </div>

      {/* Main Student Overview */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8">
        {!studentData ? (
          <div className="text-center py-12 text-slate-500">
            No active student profile connected yet.
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {(studentData?.name || studentData?.email || "S").charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{studentData?.name || studentData?.email || "Student Profile"}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-indigo-100">{studentData?.grade || "N/A"}</span>
                  <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1">
                    <Shield className="h-3 w-3" /> On Track
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="flex items-center gap-2 mb-2 text-slate-500 font-medium">
                  <LineChart className="h-4 w-4" /> Academic Trajectory
                </div>
                <div className="text-2xl font-black text-slate-900">-- GPA</div>
                <p className="text-xs text-emerald-600 font-bold mt-1">Data not available</p>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="flex items-center gap-2 mb-2 text-slate-500 font-medium">
                  <Target className="h-4 w-4" /> Top Target
                </div>
                <div className="text-xl font-black text-slate-900">{studentData?.goals?.split(",")[0] || "Undecided"}</div>
                <p className="text-xs text-indigo-600 font-bold mt-1">AI Prediction pending</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="flex items-center gap-2 mb-2 text-slate-500 font-medium">
                  <Calendar className="h-4 w-4" /> Next Deadline
                </div>
                <div className="text-lg font-black text-slate-900 truncate">No upcoming deadlines</div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm">Weekly AI Summary</h3>
              <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100">
                <p className="text-slate-700 text-sm leading-relaxed">
                  Your student is just getting started. Ensure they continue exploring opportunities and utilizing the Digital Twin engine.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
