import { useState } from "react";
import { useAuth } from "../components/AuthContext.tsx";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, MessageSquare, Send, Bot, Shield, Zap, Search, UserCircle, Briefcase, ChevronRight, PenTool } from "lucide-react";
import ReactMarkdown from "react-markdown";

const agents = [
  { id: "admissions", name: "Admissions Strategist", role: "Ivy League & Top-Tier Admissions", icon: Shield, color: "bg-emerald-500", desc: "Expert in framing narratives and finding unique angles." },
  { id: "scholarship", name: "Scholarship Hunter", role: "Financial Aid & Grants", icon: Search, color: "bg-blue-500", desc: "Uncovers obscure scholarships and calculates ROI." },
  { id: "career", name: "Career Architect", role: "Internships & Pathways", icon: Briefcase, color: "bg-indigo-500", desc: "Reverse-engineers career paths from 10-year goals." },
  { id: "founder", name: "Startup Mentor", role: "Venture Creation & Pitching", icon: Zap, color: "bg-amber-500", desc: "Evaluates ideas, suggests pivots, and structures pitches." },
  { id: "essay", name: "Essay Reviewer", role: "Narrative & Tone Coach", icon: PenTool, color: "bg-rose-500", desc: "Provides high-level structural feedback on essays." },
];

export default function AIAgents() {
  const { user, appUser } = useAuth();
  const [activeAgent, setActiveAgent] = useState(agents[0]);
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading || !user) return;

    const userMessage = input;
    setInput("");
    const newHistory = [...messages, { role: 'user' as const, text: userMessage }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/agents/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          agentId: activeAgent.id,
          message: userMessage,
          history: messages
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...newHistory, { role: 'model', text: data.reply }]);
      } else {
        setMessages([...newHistory, { role: 'model', text: "Sorry, I encountered an error connecting to my neural net." }]);
      }
    } catch (err) {
      setMessages([...newHistory, { role: 'model', text: "Network error." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-indigo-500" />
          AI Agent Ecosystem
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Consult with specialized high-intelligence agents powered by Gemini High Thinking mode.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
        {/* Agent Selector */}
        <div className="w-full md:w-80 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar shrink-0">
          {agents.map(agent => (
            <button
              key={agent.id}
              onClick={() => {
                setActiveAgent(agent);
                setMessages([]);
              }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeAgent.id === agent.id 
                  ? "bg-white border-indigo-200 shadow-md ring-1 ring-indigo-100" 
                  : "bg-slate-50/50 border-slate-200 hover:bg-white hover:shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-xl text-white ${agent.color}`}>
                  <agent.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{agent.name}</h3>
                  <p className="text-xs font-medium text-slate-500">{agent.role}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 line-clamp-2">{agent.desc}</p>
            </button>
          ))}
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl text-white ${activeAgent.color}`}>
                <activeAgent.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{activeAgent.name}</h3>
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  High Thinking Online
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <activeAgent.icon className="h-16 w-16 mb-4 text-slate-300" />
                <p className="text-slate-500 max-w-sm">
                  Start a conversation with the {activeAgent.name}. They have access to your profile context and goals.
                </p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white ${activeAgent.color}`}>
                    <activeAgent.icon className="h-4 w-4" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : ''}`}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full shrink-0 bg-slate-200 flex items-center justify-center overflow-hidden">
                    {appUser?.avatarUrl ? (
                      <img src={appUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle className="h-6 w-6 text-slate-500" />
                    )}
                  </div>
                )}
              </motion.div>
            ))}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 justify-start">
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white ${activeAgent.color}`}>
                  <activeAgent.icon className="h-4 w-4" />
                </div>
                <div className="bg-slate-100 text-slate-800 rounded-2xl px-5 py-3.5 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <form onSubmit={sendMessage} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Message the agent..."
                disabled={loading || !user}
                className="w-full pl-5 pr-14 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading || !user}
                className="absolute right-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <div className="mt-2 text-center text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              Powered by Gemini 3.1 Pro High Thinking
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
