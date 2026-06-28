import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../components/AuthContext.tsx";
import { 
  Heart, Send, Award, Users, Shield, ShieldCheck, Zap, MessageSquare, 
  ThumbsUp, Sparkles, Plus, Image, Link as LinkIcon, Hash, Globe, 
  MapPin, Check, X, Bell, UserPlus, Flame, BookOpen, Clock, 
  ExternalLink, CheckCircle, ChevronRight, GraduationCap, Briefcase, Trophy
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type TabType = "feed" | "network" | "trending" | "verify" | "notifications";

interface Post {
  id: number;
  userId: number;
  content: string;
  imageUrl?: string;
  achievementBadge?: string;
  link?: string;
  tags?: string;
  category: string;
  isFounderUpdate: boolean;
  createdAt: string;
  creator: any;
  reactions: any[];
  reactionCounts: {
    like: number;
    celebrate: number;
    inspire: number;
    support: number;
  };
  userReaction: string | null;
  commentsCount: number;
}

export default function Network() {
  const { user, appUser, refreshAppUser } = useAuth();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const [activeTab, setActiveTab] = useState<TabType>("feed");
  const [postsList, setPostsList] = useState<Post[]>([]);
  const [connectionsData, setConnectionsData] = useState<any>(null);
  const [trendingData, setTrendingData] = useState<any>(null);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Post Creator State
  const [newContent, setNewContent] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newLink, setNewLink] = useState("");
  const [newBadge, setNewBadge] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [newIsFounder, setNewIsFounder] = useState(false);
  const [posting, setPosting] = useState(false);

  // Active Comments Thread State
  const [commentingPostId, setCommentingPostId] = useState<number | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<number, any[]>>({});
  const [newCommentText, setNewCommentText] = useState("");
  const [commenting, setCommenting] = useState(false);

  // Verification request form state
  const [badgeType, setBadgeType] = useState("STEM Winner");
  const [proofText, setProofText] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Selected Student Profile Modal State
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [selectedProfileData, setSelectedProfileData] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const badgeCategories = [
    "STEM Winner",
    "Scholarship Winner",
    "Leadership Star",
    "100+ Volunteer Hours",
    "Founder / Builder",
    "Varsity Athlete",
    "Research Scholar",
    "Top Competitor"
  ];

  const postCategories = [
    "General",
    "Scholarship won",
    "Award & Honors",
    "Internship acceptance",
    "Competition results",
    "Research milestone",
    "Volunteer achievement",
    "Personal project",
    "Startup progress",
    "College acceptance"
  ];

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await user.getIdToken();
      
      // Fetch feed
      const postsRes = await fetch("/api/social/posts", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPostsList(postsData);
      }

      // Fetch network status
      const connRes = await fetch("/api/social/connections", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (connRes.ok) {
        const cData = await connRes.json();
        setConnectionsData(cData);
      }

      // Fetch trending
      const trendRes = await fetch("/api/social/trending", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (trendRes.ok) {
        const tData = await trendRes.json();
        setTrendingData(tData);
      }

      // Fetch notifications
      const notifRes = await fetch("/api/social/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (notifRes.ok) {
        const nData = await notifRes.json();
        setNotificationsList(nData);
      }

      // Fetch verification requests
      const vrRes = await fetch("/api/social/verification-requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (vrRes.ok) {
        const vrData = await vrRes.json();
        setVerificationRequests(vrData);
      }

    } catch (err) {
      console.error("Error loading social network data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Handle post submit
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      setPosting(true);
      const token = await user.getIdToken();
      const res = await fetch("/api/social/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newContent,
          imageUrl: newImage.trim() || undefined,
          achievementBadge: newBadge || undefined,
          link: newLink.trim() || undefined,
          tags: newTags.trim() || undefined,
          category: newCategory,
          isFounderUpdate: newIsFounder
        })
      });

      if (res.ok) {
        setNewContent("");
        setNewImage("");
        setNewLink("");
        setNewBadge("");
        setNewTags("");
        setNewCategory("General");
        setNewIsFounder(false);
        await fetchData();
      }
    } catch (err) {
      console.error("Error creating post:", err);
    } finally {
      setPosting(false);
    }
  };

  // Handle post reaction
  const handlePostReaction = async (postId: number, type: "like" | "celebrate" | "inspire" | "support") => {
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/social/posts/${postId}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      });

      if (res.ok) {
        // Optimize UI state update without full reload
        setPostsList(prev => prev.map(p => {
          if (p.id === postId) {
            const hasExisting = p.userReaction !== null;
            const isSameType = p.userReaction === type;
            
            // Adjust reaction counts
            const counts = { ...p.reactionCounts };
            if (hasExisting && p.userReaction) {
              counts[p.userReaction as keyof typeof counts] = Math.max(0, counts[p.userReaction as keyof typeof counts] - 1);
            }
            if (!isSameType) {
              counts[type] += 1;
            }

            return {
              ...p,
              userReaction: isSameType ? null : type,
              reactionCounts: counts
            };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error("Error reacting to post:", err);
    }
  };

  // Expand Comments panel & load comments
  const toggleComments = async (postId: number) => {
    if (commentingPostId === postId) {
      setCommentingPostId(null);
      return;
    }
    setCommentingPostId(postId);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/social/posts/${postId}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const comments = await res.json();
        setCommentsMap(prev => ({ ...prev, [postId]: comments }));
      }
    } catch (err) {
      console.error("Error loading comments:", err);
    }
  };

  // Post comment
  const handleCommentSubmit = async (postId: number, e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      setCommenting(true);
      const token = await user.getIdToken();
      const res = await fetch(`/api/social/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: newCommentText })
      });

      if (res.ok) {
        const data = await res.json();
        setCommentsMap(prev => ({
          ...prev,
          [postId]: [data, ...(prev[postId] || [])]
        }));
        setNewCommentText("");
        
        // Update comments count on post
        setPostsList(prev => prev.map(p => {
          if (p.id === postId) {
            return { ...p, commentsCount: p.commentsCount + 1 };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error("Error commenting on post:", err);
    } finally {
      setCommenting(false);
    }
  };

  // Submit profile verification
  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofText.trim()) return;

    try {
      setVerifying(true);
      const token = await user.getIdToken();
      const res = await fetch("/api/social/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ badgeType, proof: proofText })
      });

      if (res.ok) {
        setProofText("");
        setVerificationSuccess(true);
        setTimeout(() => setVerificationSuccess(false), 5000);
        await fetchData();
      }
    } catch (err) {
      console.error("Error submitting verification request:", err);
    } finally {
      setVerifying(false);
    }
  };

  // Admin/Moderator Approve Verification Mock Trigger
  const handleApproveRequest = async (requestId: number, status: "approved" | "rejected") => {
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/social/verify-approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ requestId, status })
      });

      if (res.ok) {
        await refreshAppUser();
        await fetchData();
      }
    } catch (err) {
      console.error("Error processing request approval:", err);
    }
  };

  // Handle Send Connection / Follow request
  const handleConnect = async (receiverId: number, type: "connection" | "follow") => {
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/social/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId, type })
      });

      if (res.ok) {
        await fetchData();
        // If modal is open, refresh modal profile details
        if (selectedProfileId === receiverId) {
          openStudentProfile(receiverId);
        }
      }
    } catch (err) {
      console.error("Error connecting with student:", err);
    }
  };

  // Accept Connection request
  const handleAcceptConnection = async (senderId: number) => {
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/social/connect/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ senderId })
      });

      if (res.ok) {
        await fetchData();
        if (selectedProfileId === senderId) {
          openStudentProfile(senderId);
        }
      }
    } catch (err) {
      console.error("Error accepting connection:", err);
    }
  };

  // Open rich detailed overlay/modal for another student
  const openStudentProfile = async (targetId: number) => {
    setSelectedProfileId(targetId);
    setModalLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/social/profile/${targetId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedProfileData(data);
      }
    } catch (err) {
      console.error("Error loading profile details:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      const token = await user.getIdToken();
      await fetch("/api/social/notifications/read", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotificationsList(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  };

  return (
    <div className="relative min-h-screen">
      
      {/* Title section with subtle branding */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-indigo-600" />
            Student Network
          </h1>
          <p className="text-slate-500 text-sm mt-1">Connect, showcase academic achievements, and find startup builders.</p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0 bg-indigo-50/80 px-4 py-2 rounded-2xl border border-indigo-100/50">
          <Award className="h-5 w-5 text-indigo-600 animate-pulse" />
          <span className="text-sm font-bold text-indigo-900">
            {appUser?.verificationBadges ? "Verified Scholar" : "Standard Profile"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT BAR: User brief & Tab controls */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* User brief widget */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="h-16 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <div className="px-6 pb-6 text-center -mt-8">
              <div className="relative inline-block">
                {appUser?.avatarUrl ? (
                  <img src={appUser.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-md mx-auto" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xl font-black border-4 border-white shadow-md mx-auto">
                    {(appUser?.name || "U").substring(0, 2).toUpperCase()}
                  </div>
                )}
                {appUser?.verificationBadges && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Verified Badge">
                    <ShieldCheck className="h-3 w-3" />
                  </div>
                )}
              </div>
              <h2 className="text-base font-extrabold text-slate-900 mt-3">{appUser?.name || "Student"}</h2>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">{appUser?.headline || `${appUser?.grade || "Freshman"} | TeenLaunch`}</p>
              
              {appUser?.country && (
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mt-2 font-semibold">
                  <MapPin className="h-3 w-3" />
                  {appUser.country}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 border-t border-slate-100 mt-4 pt-4 text-center">
                <div>
                  <div className="text-xs font-black text-slate-800">{connectionsData?.connectionsCount ?? 0}</div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Connections</div>
                </div>
                <div>
                  <div className="text-xs font-black text-slate-800">{connectionsData?.followersCount ?? 0}</div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Followers</div>
                </div>
                <div>
                  <div className="text-xs font-black text-slate-800">{connectionsData?.followingCount ?? 0}</div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Following</div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Navigation Tabs */}
          <div className="bg-white rounded-3xl border border-slate-200 p-2 shadow-sm space-y-1">
            <button 
              onClick={() => setActiveTab("feed")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === "feed" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <Zap className="h-4 w-4" />
              Scrolling Feed
            </button>
            <button 
              onClick={() => setActiveTab("network")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === "network" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <span className="flex items-center gap-3">
                <Users className="h-4 w-4" />
                Network Connections
              </span>
              {(connectionsData?.incomingRequests?.length ?? 0) > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-bounce">
                  {connectionsData.incomingRequests.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab("trending")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === "trending" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <Flame className="h-4 w-4" />
              Trending Leaders
            </button>
            <button 
              onClick={() => setActiveTab("verify")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === "verify" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <Shield className="h-4 w-4" />
              Profile Verification
            </button>
            <button 
              onClick={() => {
                setActiveTab("notifications");
                markNotificationsAsRead();
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === "notifications" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <span className="flex items-center gap-3">
                <Bell className="h-4 w-4" />
                Notifications Inbox
              </span>
              {notificationsList.filter(n => !n.isRead).length > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                  {notificationsList.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* MIDDLE BAR / DYNAMIC CONTENT: Grid 12 - spans 6 for central, 3 for right */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* TAB 1: SCROLLING FEED */}
          {activeTab === "feed" && (
            <div className="space-y-6">
              
              {/* Post creation panel */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="flex gap-4">
                  {appUser?.avatarUrl ? (
                    <img src={appUser.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      {(appUser?.name || "U").substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <form onSubmit={handlePostSubmit} className="space-y-4">
                      <textarea
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="Share an achievement (e.g., 'I completed 50 hours of volunteering!' or 'Won first place!')"
                        className="w-full bg-slate-50/50 border border-slate-200/80 rounded-2xl p-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[90px] resize-none"
                        required
                      />
                      
                      {/* Rich details disclosure panel */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Category</label>
                          <select 
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            {postCategories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Achievement Badge</label>
                          <select 
                            value={newBadge}
                            onChange={(e) => setNewBadge(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="">None</option>
                            {badgeCategories.map(b => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Image URL (Optional)</label>
                          <input
                            type="url"
                            value={newImage}
                            onChange={(e) => setNewImage(e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Link / Project Url (Optional)</label>
                          <input
                            type="url"
                            value={newLink}
                            onChange={(e) => setNewLink(e.target.value)}
                            placeholder="https://github.com/..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <label className="relative inline-flex items-center cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={newIsFounder} 
                              onChange={(e) => setNewIsFounder(e.target.checked)}
                              className="sr-only peer" 
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                            <span className="ms-2.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">Founder / Builder Update</span>
                          </label>
                        </div>
                        
                        <button
                          type="submit"
                          disabled={posting || !newContent.trim()}
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/10 hover:bg-indigo-500 disabled:opacity-50 disabled:shadow-none transition-all"
                        >
                          {posting ? (
                            "Sharing..."
                          ) : (
                            <>
                              <Send className="h-3.5 w-3.5" />
                              Share Achievement
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Scrolling Feed list */}
              {loading ? (
                <div className="py-12 text-center text-slate-400">
                  <Zap className="h-8 w-8 text-indigo-500 animate-spin mx-auto mb-3" />
                  <span className="text-xs font-bold">Assembling professional student feed...</span>
                </div>
              ) : postsList.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
                  <Sparkles className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-sm font-extrabold text-slate-700">No student achievements logged yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2">
                    Be the first member to log an academic award, athletic milestone, or startup update in the community!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {postsList.map(post => (
                    <div key={post.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      
                      {/* Post Header */}
                      <div className="p-6 pb-4 flex items-start gap-3">
                        <div className="cursor-pointer" onClick={() => post.creator && openStudentProfile(post.creator.id)}>
                          {post.creator?.avatarUrl ? (
                            <img src={post.creator.avatarUrl} alt="Creator" className="w-10 h-10 rounded-xl object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                              {(post.creator?.name || "U").substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span 
                              onClick={() => post.creator && openStudentProfile(post.creator.id)}
                              className="font-extrabold text-xs text-slate-900 cursor-pointer hover:text-indigo-600 transition-colors"
                            >
                              {post.creator?.name || "Anonymous Scholar"}
                            </span>
                            {post.creator?.verificationBadges && (
                              <span title="Verified">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 fill-emerald-50/20" />
                              </span>
                            )}
                            {post.isFounderUpdate && (
                              <span className="bg-indigo-50 text-indigo-600 border border-indigo-100/50 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                                Builder Mode
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{post.creator?.headline || `${post.creator?.grade || "Freshman"} | Scholar`}</p>
                          <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-1 font-semibold">
                            <Clock className="h-3 w-3" />
                            {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            {post.creator?.country && (
                              <>
                                <span>•</span>
                                <MapPin className="h-3 w-3" />
                                {post.creator.country}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Top corner category tag */}
                        <div className="bg-slate-100/80 px-2.5 py-1 rounded-lg text-[9px] font-black text-slate-600 uppercase tracking-wider border border-slate-200/50">
                          {post.category}
                        </div>
                      </div>

                      {/* Achievement Badge Banner if available */}
                      {post.achievementBadge && (
                        <div className="mx-6 mb-4 bg-amber-50/50 border border-amber-200/50 rounded-2xl p-3 flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100/50 rounded-xl flex items-center justify-center text-amber-600 shadow-sm">
                            <Award className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Logged Accomplishment</div>
                            <div className="text-xs font-black text-amber-900">{post.achievementBadge}</div>
                          </div>
                        </div>
                      )}

                      {/* Post Content */}
                      <div className="px-6 pb-4">
                        <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                        
                        {post.link && (
                          <a 
                            href={post.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50/50 border border-indigo-100 hover:bg-indigo-50 px-3 py-1.5 rounded-xl mt-3 transition-colors"
                          >
                            <LinkIcon className="h-3 w-3" />
                            {post.link.substring(0, 45)}
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>

                      {/* Post Image */}
                      {post.imageUrl && (
                        <div className="border-t border-b border-slate-100 overflow-hidden bg-slate-50">
                          <img 
                            src={post.imageUrl} 
                            alt="Post Media" 
                            className="w-full max-h-[340px] object-cover hover:scale-101 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      {/* Engagement Counters Summary */}
                      <div className="px-6 py-2.5 flex items-center justify-between border-b border-slate-100 text-[10px] text-slate-400 font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3 text-indigo-500" />
                            {post.reactionCounts.like}
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="h-3 w-3 text-amber-500" />
                            {post.reactionCounts.celebrate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-purple-500" />
                            {post.reactionCounts.inspire}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-rose-500" />
                            {post.reactionCounts.support}
                          </span>
                        </div>
                        <span className="cursor-pointer hover:underline" onClick={() => toggleComments(post.id)}>
                          {post.commentsCount} comments
                        </span>
                      </div>

                      {/* Actions Buttons */}
                      <div className="px-4 py-1.5 flex items-center justify-between text-slate-600 font-bold text-[10px] uppercase tracking-wider">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button 
                            onClick={() => handlePostReaction(post.id, "like")}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${post.userReaction === "like" ? "bg-indigo-50 text-indigo-600" : "hover:bg-slate-50"}`}
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            Like
                          </button>
                          <button 
                            onClick={() => handlePostReaction(post.id, "celebrate")}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${post.userReaction === "celebrate" ? "bg-amber-50 text-amber-600" : "hover:bg-slate-50"}`}
                          >
                            <Award className="h-3.5 w-3.5" />
                            Celebrate
                          </button>
                          <button 
                            onClick={() => handlePostReaction(post.id, "inspire")}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${post.userReaction === "inspire" ? "bg-purple-50 text-purple-600" : "hover:bg-slate-50"}`}
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            Inspire
                          </button>
                          <button 
                            onClick={() => handlePostReaction(post.id, "support")}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${post.userReaction === "support" ? "bg-rose-50 text-rose-600" : "hover:bg-slate-50"}`}
                          >
                            <Heart className="h-3.5 w-3.5" />
                            Support
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => toggleComments(post.id)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-50 transition-all ${commentingPostId === post.id ? "text-indigo-600 bg-indigo-50/50" : ""}`}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Comment
                        </button>
                      </div>

                      {/* Comments Thread Section */}
                      <AnimatePresence>
                        {commentingPostId === post.id && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-slate-50/80 border-t border-slate-100 overflow-hidden"
                          >
                            <div className="p-6 space-y-4">
                              
                              {/* New comment input */}
                              <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="flex items-center gap-3">
                                {appUser?.avatarUrl ? (
                                  <img src={appUser.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                    {(appUser?.name || "U").substring(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <input
                                  type="text"
                                  value={newCommentText}
                                  onChange={(e) => setNewCommentText(e.target.value)}
                                  placeholder="Write an inspiring comment..."
                                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <button
                                  type="submit"
                                  disabled={commenting || !newCommentText.trim()}
                                  className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 transition-colors"
                                >
                                  <Send className="h-3.5 w-3.5" />
                                </button>
                              </form>

                              {/* Comment List */}
                              <div className="space-y-3 pt-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                                {commentsMap[post.id]?.length === 0 ? (
                                  <div className="text-center py-4 text-[10px] text-slate-400 font-bold">No comments on this achievement yet. Start the conversation!</div>
                                ) : (
                                  commentsMap[post.id]?.map((comment: any) => (
                                    <div key={comment.id} className="flex gap-2.5 items-start">
                                      {comment.user?.avatarUrl ? (
                                        <img src={comment.user.avatarUrl} alt="Avatar" className="w-7 h-7 rounded-lg object-cover mt-0.5" />
                                      ) : (
                                        <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[10px] mt-0.5">
                                          {(comment.user?.name || "U").substring(0, 2).toUpperCase()}
                                        </div>
                                      )}
                                      <div className="flex-1 bg-white p-3 rounded-2xl border border-slate-100">
                                        <div className="flex items-center justify-between">
                                          <span className="font-extrabold text-[10px] text-slate-800">{comment.user?.name || "Anonymous Student"}</span>
                                          <span className="text-[8px] text-slate-400 font-bold">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">{comment.content}</p>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: NETWORK / CONNECTIONS */}
          {activeTab === "network" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              
              {/* Incoming Pending Requests */}
              <div>
                <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Pending Connection Requests
                </h3>

                {connectionsData?.incomingRequests?.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-xs font-bold text-slate-400">
                    No pending connection requests.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {connectionsData?.incomingRequests?.map((req: any) => (
                      <div key={req.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => req.sender && openStudentProfile(req.sender.id)}>
                          {req.sender?.avatarUrl ? (
                            <img src={req.sender.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-xl object-cover" />
                          ) : (
                            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-bold text-xs">
                              {(req.sender?.name || "U").substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-extrabold text-xs text-slate-900">{req.sender?.name || "Student"}</div>
                            <div className="text-[9px] text-slate-400 line-clamp-1">{req.sender?.headline || "Scholar"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAcceptConnection(req.senderId)}
                            className="p-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors"
                            title="Accept Request"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Build Network Section with Other Registered Users */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-black text-slate-900 mb-4">Discover Ambitious Students</h3>
                <p className="text-[10px] text-slate-400 font-bold -mt-3 mb-4 uppercase tracking-wider">Connect with real scholars from the database</p>
                
                {(!trendingData || trendingData.active?.length === 0) ? (
                  <div className="text-center py-6 text-xs text-slate-400 font-bold">No other students have joined yet. Invite classmates!</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trendingData.active.map((student: any) => {
                      if (student.id === appUser?.id) return null;
                      return (
                        <div key={student.id} className="bg-slate-50/40 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                          <div className="flex items-start gap-3 cursor-pointer" onClick={() => openStudentProfile(student.id)}>
                            {student.avatarUrl ? (
                              <img src={student.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-xl object-cover" />
                            ) : (
                              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-bold text-xs">
                                {(student.name || "U").substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-extrabold text-xs text-slate-900 truncate flex items-center gap-1.5">
                                {student.name || "Student"}
                                {student.verificationBadges && <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />}
                              </div>
                              <p className="text-[9px] text-slate-400 truncate mt-0.5">{student.headline || "Ambitious Scholar"}</p>
                              {student.country && (
                                <div className="flex items-center gap-1 text-[8px] text-slate-400 mt-1">
                                  <MapPin className="h-2.5 w-2.5" />
                                  {student.country}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mt-4">
                            <button
                              onClick={() => handleConnect(student.id, "connection")}
                              className="w-full inline-flex items-center justify-center gap-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors"
                            >
                              <UserPlus className="h-3 w-3" />
                              Connect
                            </button>
                            <button
                              onClick={() => handleConnect(student.id, "follow")}
                              className="w-full inline-flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors"
                            >
                              <Zap className="h-3 w-3" />
                              Follow
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: TRENDING STUDENTS */}
          {activeTab === "trending" && (
            <div className="space-y-6">
              
              {/* Active Section */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-4">
                  <Flame className="h-5 w-5 text-indigo-600" />
                  Most Active Students
                </h3>
                {(!trendingData || trendingData.active?.length === 0) ? (
                  <div className="text-xs font-bold text-slate-400 py-4 text-center">No trending active students yet.</div>
                ) : (
                  <div className="space-y-3">
                    {trendingData.active.map((student: any) => (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border border-slate-100 cursor-pointer" onClick={() => openStudentProfile(student.id)}>
                        <div className="flex items-center gap-3">
                          {student.avatarUrl ? (
                            <img src={student.avatarUrl} alt="Avatar" className="w-9 h-9 rounded-xl object-cover" />
                          ) : (
                            <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-bold text-xs">
                              {(student.name || "U").substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-extrabold text-xs text-slate-900">{student.name}</div>
                            <div className="text-[9px] text-slate-400 line-clamp-1">{student.headline || "Scholar"}</div>
                          </div>
                        </div>
                        <div className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider">
                          {student.postsCount} Posts shared
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Volunteer Leaders */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-indigo-600" />
                  Top Community Volunteers
                </h3>
                {(!trendingData || trendingData.volunteers?.length === 0) ? (
                  <div className="text-xs font-bold text-slate-400 py-4 text-center">No community volunteer logs yet.</div>
                ) : (
                  <div className="space-y-3">
                    {trendingData.volunteers.map((student: any) => (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border border-slate-100 cursor-pointer" onClick={() => openStudentProfile(student.id)}>
                        <div className="flex items-center gap-3">
                          {student.avatarUrl ? (
                            <img src={student.avatarUrl} alt="Avatar" className="w-9 h-9 rounded-xl object-cover" />
                          ) : (
                            <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-bold text-xs">
                              {(student.name || "U").substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-extrabold text-xs text-slate-900">{student.name}</div>
                            <div className="text-[9px] text-slate-400 line-clamp-1">{student.headline || "Scholar"}</div>
                          </div>
                        </div>
                        <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider">
                          {student.volunteerHours} Hours
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: PROFILE VERIFICATION PORTAL */}
          {activeTab === "verify" && (
            <div className="space-y-6">
              
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-indigo-600" />
                  Official Profile Verification Badging
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Apply for high-status verification badges on TeenLaunch to unlock maximum academic prestige on the Leaderboard. Verification requests are audited by administrators and student-moderators.
                </p>

                {verificationSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    Verification application submitted successfully! Administrators will review your proof shortly.
                  </div>
                )}

                <form onSubmit={handleVerificationSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Select Badge Type</label>
                    <select 
                      value={badgeType}
                      onChange={(e) => setBadgeType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {badgeCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Proof & Accomplishment Details</label>
                    <textarea
                      value={proofText}
                      onChange={(e) => setProofText(e.target.value)}
                      placeholder="Please describe your proof. E.g., 'I won 1st place at Hackmit, certificate URL: ...' or link to school press release."
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[90px] resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={verifying || !proofText.trim()}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/10 transition-colors"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Submit Application
                  </button>
                </form>
              </div>

              {/* MOCK ADMIN APPROVAL PANEL - EXTREMELY HELPFUL FOR TESTING/DEMONSTRATION */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Zap className="h-5 w-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Student Admin Testing Sandbox</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  We've built an interactive Admin Sandbox here so you can approve your own or other student's badges to test the badge verification flow and live Leaderboard point updates!
                </p>

                {verificationRequests.length === 0 ? (
                  <div className="text-center py-4 text-[10px] text-slate-500 font-bold">No submitted verification requests found. Submit one above to approve!</div>
                ) : (
                  <div className="space-y-3">
                    {verificationRequests.map((req: any) => (
                      <div key={req.id} className="p-4 bg-slate-800 rounded-2xl border border-slate-700 flex flex-col justify-between gap-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-xs font-black text-white">{req.user?.name || "Student"}</div>
                            <div className="text-[9px] text-slate-400">Requested: {req.badgeType}</div>
                          </div>
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${req.status === 'pending' ? 'bg-amber-500 text-slate-900 animate-pulse' : req.status === 'approved' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 italic font-medium">"{req.proof}"</p>
                        
                        {req.status === 'pending' && (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <button
                              onClick={() => handleApproveRequest(req.id, "approved")}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white py-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors"
                            >
                              Approve Badge
                            </button>
                            <button
                              onClick={() => handleApproveRequest(req.id, "rejected")}
                              className="bg-rose-600 hover:bg-rose-500 text-white py-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 5: NOTIFICATIONS INBOX */}
          {activeTab === "notifications" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5 text-indigo-600" />
                Your Notifications Inbox
              </h3>

              {notificationsList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-bold">No notifications yet.</div>
              ) : (
                <div className="space-y-3">
                  {notificationsList.map(n => (
                    <div key={n.id} className={`p-4 rounded-2xl border ${n.isRead ? 'bg-white border-slate-100' : 'bg-indigo-50/30 border-indigo-100/50'} flex items-start gap-3`}>
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs mt-0.5">
                        {(n.actor?.name || "U").substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-slate-800">
                          <span className="font-extrabold">{n.actor?.name || "Someone"}</span>
                          {n.type === 'like' && " liked your accomplishment post."}
                          {n.type === 'celebrate' && " celebrated your accomplishment!"}
                          {n.type === 'inspire' && " found your milestone highly inspiring."}
                          {n.type === 'support' && " supports your builder milestone."}
                          {n.type === 'comment' && " commented on your post."}
                          {n.type === 'follow' && " started following your academic journey."}
                          {n.type === 'connection_request' && " sent you a connection request."}
                          {n.type === 'connection_accept' && " accepted your connection request!"}
                        </div>
                        {n.postPreview && (
                          <p className="text-[10px] text-slate-400 mt-1 italic">"{n.postPreview}"</p>
                        )}
                        <span className="text-[8px] text-slate-400 font-bold mt-2 block">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT BAR: Network Stats & Quick Leaderboard Widget */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Quick link to high-integrity dynamic leaderboards */}
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white rounded-3xl p-6 border border-indigo-800 shadow-md relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
            <Trophy className="h-8 w-8 text-amber-400 mb-3" />
            <h3 className="text-sm font-black tracking-tight text-white">Live Leaderboard</h3>
            <p className="text-[10px] text-slate-300 leading-relaxed mt-1">
              Dynamic ranking based on verified achievements, GPAs, community volunteer hours, and project milestones.
            </p>
            <Link 
              to="/leaderboard" 
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 transition-all text-[9px] font-black uppercase tracking-wider px-4 py-2 rounded-xl mt-4 text-white"
            >
              Go to Leaderboard
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Social Stats info card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Insights</h4>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-800">100% Real Users</div>
                  <div className="text-[9px] text-slate-400 font-bold">Absolutely no fake profiles or mock logs.</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-800">Smart Algorithm</div>
                  <div className="text-[9px] text-slate-400 font-bold">Feed matches grade levels & interests.</div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* RICH MODAL DRAWERS: DYNAMIC VISUAL ACHIEVEMENT TIMELINE */}
      <AnimatePresence>
        {selectedProfileId !== null && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
            >
              
              {/* Modal Header banner */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white flex justify-between items-start shrink-0">
                <div className="flex items-start gap-4">
                  {modalLoading ? (
                    <div className="w-14 h-14 bg-indigo-950 rounded-2xl animate-pulse"></div>
                  ) : selectedProfileData?.user?.avatarUrl ? (
                    <img src={selectedProfileData.user.avatarUrl} alt="Avatar" className="w-14 h-14 rounded-2xl object-cover border border-white/20" />
                  ) : (
                    <div className="w-14 h-14 bg-indigo-600/30 rounded-2xl flex items-center justify-center text-white text-lg font-black border border-white/10">
                      {(selectedProfileData?.user?.name || "U").substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-base font-extrabold text-white">
                        {selectedProfileData?.user?.name || "Anonymous Scholar"}
                      </h3>
                      {selectedProfileData?.user?.verificationBadges && (
                        <ShieldCheck className="h-4 w-4 text-emerald-400 fill-emerald-950/50" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">{selectedProfileData?.user?.headline || "Scholar | TeenLaunch"}</p>
                    
                    {selectedProfileData?.user?.country && (
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-1.5">
                        <MapPin className="h-3 w-3" />
                        {selectedProfileData.user.country}
                        {selectedProfileData?.user?.grade && (
                          <>
                            <span>•</span>
                            <GraduationCap className="h-3 w-3" />
                            {selectedProfileData.user.grade} Grade
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    setSelectedProfileId(null);
                    setSelectedProfileData(null);
                  }} 
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-slate-300 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Scrollable Details */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
                {modalLoading ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-bold">
                    <Zap className="h-6 w-6 text-indigo-500 animate-spin mx-auto mb-2" />
                    Fetching academic portfolio timeline...
                  </div>
                ) : (
                  <>
                    {/* Bio */}
                    {selectedProfileData?.user?.bio && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">About Me</h4>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedProfileData.user.bio}</p>
                      </div>
                    )}

                    {/* Verification Badges */}
                    {selectedProfileData?.user?.verificationBadges && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Achievements</h4>
                        <div className="flex gap-2 flex-wrap">
                          {selectedProfileData.user.verificationBadges.split(",").map((b: string) => (
                            <span key={b} className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl text-[10px] font-black">
                              <Award className="h-3.5 w-3.5 text-amber-600" />
                              {b.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Academic Profile */}
                    {selectedProfileData?.academicProfile && (
                      <div className="space-y-2 bg-slate-50/60 border border-slate-100 p-4 rounded-2xl">
                        <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Academic Credentials</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-base font-black text-slate-800">{selectedProfileData.academicProfile.gpa || "N/A"}</div>
                            <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Unweighted GPA</div>
                          </div>
                          <div>
                            <div className="text-base font-black text-slate-800">{selectedProfileData.academicProfile.apCourses || 0}</div>
                            <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">AP Courses</div>
                          </div>
                          <div>
                            <div className="text-base font-black text-slate-800">{selectedProfileData.academicProfile.satScore || selectedProfileData.academicProfile.actScore || "N/A"}</div>
                            <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Test Score</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* DYNAMIC VISUAL ACHIEVEMENT TIMELINE */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accomplishments Timeline</h4>
                      
                      {(!selectedProfileData?.activities || selectedProfileData.activities.length === 0) ? (
                        <div className="text-[11px] text-slate-400 italic font-medium">No verified activities logged yet.</div>
                      ) : (
                        <div className="relative border-l-2 border-slate-100 pl-4 ml-2 space-y-4">
                          {selectedProfileData.activities.map((act: any) => (
                            <div key={act.id} className="relative">
                              <span className="absolute -left-[21px] top-1.5 bg-indigo-600 text-white p-0.5 rounded-full border border-white">
                                <Award className="h-2.5 w-2.5" />
                              </span>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-extrabold text-xs text-slate-900">{act.role || act.title}</span>
                                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">{act.type}</span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-0.5">{act.organization || act.details}</p>
                                {act.hours && (
                                  <span className="text-[8px] font-bold text-emerald-600 mt-1 block">Logged Hours: {act.hours} hrs</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Social connection actions */}
                    {selectedProfileData?.user?.id !== appUser?.id && (
                      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        {selectedProfileData?.connectionState?.status === 'pending' && selectedProfileData.connectionState.senderId === appUser?.id ? (
                          <div className="text-xs font-bold text-amber-600 bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-100/50">
                            Connection request pending
                          </div>
                        ) : selectedProfileData?.connectionState?.status === 'pending' && selectedProfileData.connectionState.receiverId === appUser?.id ? (
                          <button
                            onClick={() => handleAcceptConnection(selectedProfileData.user.id)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-md"
                          >
                            Accept Connection
                          </button>
                        ) : selectedProfileData?.connectionState?.status === 'accepted' ? (
                          <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2.5 rounded-xl border border-indigo-100/50">
                            Connected Student
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleConnect(selectedProfileData.user.id, "connection")}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-md"
                            >
                              Connect
                            </button>
                            <button
                              onClick={() => handleConnect(selectedProfileData.user.id, "follow")}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-5 py-2.5 rounded-xl transition-colors"
                            >
                              Follow
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                  </>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
