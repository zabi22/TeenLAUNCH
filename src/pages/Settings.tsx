import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthContext.tsx";
import { useTheme } from "../components/ThemeContext.tsx";
import { Save, Bell, Shield, Moon, Sun, Monitor, User as UserIcon } from "lucide-react";

export default function Settings() {
  const { user, appUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [formData, setFormData] = useState({
    emailNotifications: true,
    pushNotifications: false,
    publicProfile: true,
    marketingEmails: false,
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Simulate save
    setTimeout(() => {
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Manage your account preferences and application settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-medium rounded-xl">
            <UserIcon size={18} /> Account
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-slate-400 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <Bell size={18} /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-slate-400 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <Shield size={18} /> Privacy
          </button>
        </div>

        <div className="md:col-span-3 space-y-8">
          
          {/* Appearance */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Appearance</h2>
            <div className="flex gap-4">
              <button 
                onClick={() => theme !== "light" && toggleTheme()}
                className={`flex-1 flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition-all ${theme === 'light' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                <Sun size={24} />
                <span className="font-medium">Light</span>
              </button>
              <button 
                onClick={() => theme !== "dark" && toggleTheme()}
                className={`flex-1 flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition-all ${theme === 'dark' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                <Moon size={24} />
                <span className="font-medium">Dark</span>
              </button>
            </div>
          </div>

          {/* Account Settings Form */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Account Preferences</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">Email Notifications</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Receive updates about new opportunities.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={formData.emailNotifications} onChange={(e) => setFormData({...formData, emailNotifications: e.target.checked})} />
                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">Push Notifications</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Get instant alerts in your browser.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={formData.pushNotifications} onChange={(e) => setFormData({...formData, pushNotifications: e.target.checked})} />
                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">Public Profile</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Allow other students to find you in the network.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={formData.publicProfile} onChange={(e) => setFormData({...formData, publicProfile: e.target.checked})} />
                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button 
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
