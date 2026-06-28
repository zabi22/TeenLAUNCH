import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, Users, BarChart3, Search, TrendingUp, AlertTriangle } from "lucide-react";
import { useAuth } from "../components/AuthContext.tsx";

export default function CounselorDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/users/students", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStudents(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Shield className="h-8 w-8 text-indigo-500" />
          Counselor Portal
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Manage your student cohort, monitor AI analytics, and push opportunity recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-slate-500 font-medium">
            <Users className="h-5 w-5 text-indigo-500" /> Active Students
          </div>
          <div className="text-4xl font-black text-slate-900">{students.length}</div>
        </div>
        
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-slate-500 font-medium">
            <AlertTriangle className="h-5 w-5 text-amber-500" /> Needs Attention
          </div>
          <div className="text-4xl font-black text-amber-600">0</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-slate-500 font-medium">
            <TrendingUp className="h-5 w-5 text-emerald-500" /> Avg. GPA
          </div>
          <div className="text-4xl font-black text-emerald-600">--</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-slate-500 font-medium">
            <BarChart3 className="h-5 w-5 text-blue-500" /> Applications
          </div>
          <div className="text-4xl font-black text-blue-600">--</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="font-bold text-slate-900 text-lg">Student Roster</h2>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search students..." 
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4 pl-6">Student</th>
                <th className="p-4">Grade</th>
                <th className="p-4">Top Target</th>
                <th className="p-4">AI Risk Level</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Loading students...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No real students joined yet.</td>
                </tr>
              ) : (
                students.map((student, i) => (
                  <tr key={student.id || i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-900">{student.name || student.email || "Unknown"}</td>
                    <td className="p-4 text-slate-600 text-sm">{student.grade || "N/A"}</td>
                    <td className="p-4 text-slate-600 text-sm">{student.goals?.split(",")[0] || "Unknown"}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold text-emerald-600 bg-emerald-50`}>
                        Low
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button className="text-indigo-600 font-bold text-sm hover:text-indigo-800">View Profile</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
