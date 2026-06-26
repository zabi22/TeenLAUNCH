import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../components/AuthContext.tsx";
import { Plus, Activity, Briefcase, Heart, Award, Save } from "lucide-react";
import { Navigate } from "react-router-dom";

export default function ActivityTracker() {
  const { user, loading } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newActivity, setNewActivity] = useState({ title: "", type: "Volunteer", role: "", hours: "", description: "" });

  useEffect(() => {
    if (user) fetchActivities();
  }, [user]);

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

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...newActivity, hours: parseInt(newActivity.hours) || 0 })
      });
      if (res.ok) {
        setNewActivity({ title: "", type: "Volunteer", role: "", hours: "", description: "" });
        setIsAdding(false);
        fetchActivities();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <Navigate to="/" />;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Volunteer": return <Heart className="h-5 w-5 text-rose-500" />;
      case "Leadership": return <Award className="h-5 w-5 text-amber-500" />;
      case "Project": return <Briefcase className="h-5 w-5 text-blue-500" />;
      default: return <Activity className="h-5 w-5 text-indigo-500" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Activity Tracker</h1>
          <p className="text-slate-500">Log your extracurriculars, volunteer work, and projects.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Activity
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-md">
          <h3 className="font-bold text-slate-900 mb-4">New Activity Log</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input required type="text" value={newActivity.title} onChange={e => setNewActivity({...newActivity, title: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Science Olympiad" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select value={newActivity.type} onChange={e => setNewActivity({...newActivity, type: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>Volunteer</option>
                  <option>Leadership</option>
                  <option>Project</option>
                  <option>Competition</option>
                  <option>Work Experience</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role / Position</label>
                <input required type="text" value={newActivity.role} onChange={e => setNewActivity({...newActivity, role: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Team Captain" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Total Hours</label>
                <input required type="number" value={newActivity.hours} onChange={e => setNewActivity({...newActivity, hours: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 50" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description & Impact</label>
              <textarea required value={newActivity.description} onChange={e => setNewActivity({...newActivity, description: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={3} placeholder="Describe what you did and the impact you made..." />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-6 py-2 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors inline-flex items-center gap-2">
                <Save className="h-4 w-4" /> Save Activity
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map(act => (
          <div key={act.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  {getTypeIcon(act.type)}
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{act.type}</span>
              </div>
              <div className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">
                {act.hours} hrs
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">{act.title}</h3>
            <div className="text-sm font-medium text-indigo-600 mb-3">{act.role}</div>
            <p className="text-sm text-slate-600 flex-1">{act.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
