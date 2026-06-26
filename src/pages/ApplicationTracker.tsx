import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../components/AuthContext.tsx";
import { Plus, CheckCircle2, Clock, Circle, ArrowRight, Save } from "lucide-react";
import { Navigate } from "react-router-dom";

export default function ApplicationTracker() {
  const { user, loading } = useAuth();
  const [apps, setApps] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newApp, setNewApp] = useState({ collegeName: "", status: "Not Started", deadline: "" });

  useEffect(() => {
    if (user) fetchApps();
  }, [user]);

  const fetchApps = async () => {
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/applications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setApps(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddApp = async (e: FormEvent) => {
    e.preventDefault();
    if (!newApp.collegeName) return;
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newApp)
      });
      if (res.ok) {
        setNewApp({ collegeName: "", status: "Not Started", deadline: "" });
        setIsAdding(false);
        fetchApps();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <Navigate to="/" />;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Accepted": return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "Submitted": return <ArrowRight className="h-5 w-5 text-blue-500" />;
      case "In Progress": return <Clock className="h-5 w-5 text-amber-500" />;
      default: return <Circle className="h-5 w-5 text-slate-300" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">College Application Tracker</h1>
          <p className="text-slate-500">Track deadlines, statuses, and manage your college admissions journey.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add College
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-md">
          <h3 className="font-bold text-slate-900 mb-4">Add New Application</h3>
          <form onSubmit={handleAddApp} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">College Name</label>
              <input required type="text" value={newApp.collegeName} onChange={e => setNewApp({...newApp, collegeName: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Stanford University" />
            </div>
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select value={newApp.status} onChange={e => setNewApp({...newApp, status: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Submitted</option>
                <option>Accepted</option>
                <option>Waitlisted</option>
                <option>Rejected</option>
              </select>
            </div>
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
              <input type="date" value={newApp.deadline} onChange={e => setNewApp({...newApp, deadline: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <button type="submit" className="w-full md:w-auto px-6 py-2 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors h-10">
              Save
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {apps.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No applications tracked yet. Click "Add College" to start.
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-900 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">College</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Deadline</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {apps.map(app => (
                <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{app.collegeName}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-medium">
                      {getStatusIcon(app.status)} {app.status}
                    </div>
                  </td>
                  <td className="px-6 py-4">{app.deadline ? new Date(app.deadline).toLocaleDateString() : "-"}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-600 font-medium hover:underline text-xs">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
