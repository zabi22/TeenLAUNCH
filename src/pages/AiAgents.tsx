import { useState, useRef, useEffect } from "react";
import { useAuth } from "../components/AuthContext.tsx";
import { motion, AnimatePresence } from "motion/react";
import { BrainCircuit, Send, Sparkles, User as UserIcon, GraduationCap, Compass, Briefcase, Award, Bot, ChevronRight, Zap } from "lucide-react";
import Markdown from "react-markdown";

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  avatarColor: string;
  icon: any;
  systemPrompt: string;
  suggestedPrompts: string[];
}

export default function AiAgents() {
  const { user } = useAuth();
  
  const agents: Agent[] = [
    {
      id: "strategist",
      name: "Academic Strategist",
      role: "GPA & AP Course Optimizer",
      description: "Strategize course selections, optimize study schedules, and align credits for highly competitive Ivy League matching.",
      avatarColor: "bg-indigo-600 shadow-indigo-500/20",
      icon: GraduationCap,
      systemPrompt: "You are the Academic Strategist. Help the student optimize their grades, GPA, AP courses, and standardized test schedules.",
      suggestedPrompts: [
        "How can I plan my AP classes for a Computer Science major?",
        "What is the best way to raise my GPA from 3.7 to 3.9?",
        "Is taking AP Physics C worth it if I want to study pre-med?"
      ]
    },
    {
      id: "scout",
      name: "Extracurricular Scout",
      role: "Global Opportunity Hunter",
      description: "Direct matching to elite summer research fellowships, national essay competitions, STEM olympiads, and non-profit projects.",
      avatarColor: "bg-emerald-600 shadow-emerald-500/20",
      icon: Compass,
      systemPrompt: "You are the Extracurricular Scout. Help the student find, apply for, and secure top tier internships, competitions, and volunteer spots.",
      suggestedPrompts: [
        "Find me prestigious remote summer research fellowships.",
        "What high school essay contests are open right now?",
        "How can I found a local non-profit chapter and get it funded?"
      ]
    },
    {
      id: "counselor",
      name: "College Admissions Counselor",
      role: "Ivy+ Admissions Advisor",
      description: "Deconstruct your university list, analyze application strengths, brainstorm core essay hooks, and build an airtight strategy.",
      avatarColor: "bg-amber-600 shadow-amber-500/20",
      icon: Award,
      systemPrompt: "You are the College Admissions Counselor. Review essay prompts, target schools, and profile weaknesses to provide elite strategy.",
      suggestedPrompts: [
        "Brainstorm common app essay hooks based on a love for sailing.",
        "What are my chances of getting into Stanford with my current profile?",
        "How should I structure my Common App extracurricular section?"
      ]
    },
    {
      id: "career",
      name: "Career Mentor",
      role: "Industry Navigator",
      description: "Industry insights, resume structuring, tech portfolio architecture, and direct career field simulations.",
      avatarColor: "bg-purple-600 shadow-purple-500/20",
      icon: Briefcase,
      systemPrompt: "You are the Career Mentor. Help students choose professional paths, refine their portfolio, and simulate realistic career choices.",
      suggestedPrompts: [
        "What is the day-to-day life of a Quant Trader like?",
        "How can I construct an elite GitHub portfolio at 16?",
        "Suggest technical projects that stand out to tech recruiters."
      ]
    }
  ];

  const [activeAgent, setActiveAgent] = useState<Agent>(agents[0]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<Record<string, { role: "user" | "model"; text: string }[]>>({
    strategist: [
      { role: "model", text: "Hello! I am your **Academic Strategist**. Together, we will construct an airtight high-school trajectory. What academic milestones are you aiming for this term?" }
    ],
    scout: [
      { role: "model", text: "Hey! Let's scout some elite summer internships and prestige competitions. Tell me what subjects fire you up!" }
    ],
    counselor: [
      { role: "model", text: "Welcome. Let's make your admissions portfolio completely undeniable for top-tier universities. Let's start with your dream school list." }
    ],
    career: [
      { role: "model", text: "Ready to test-drive your future? Select a career pathway and let's map the direct route to your dream job." }
    ]
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, activeAgent]);

  const handleSend = async (messageText: string) => {
    if (!messageText.trim() || isTyping) return;

    const userMessage = { role: "user" as const, text: messageText };
    const agentId = activeAgent.id;

    // Update locally immediately
    setChatHistory((prev) => ({
      ...prev,
      [agentId]: [...(prev[agentId] || []), userMessage]
    }));
    setChatInput("");
    setIsTyping(true);

    try {
      // Connect to server Gemini proxy or simulate if missing
      const token = await user?.getIdToken();
      const response = await fetch("/api/coach/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          message: `[Active Persona: ${activeAgent.name}] ${messageText}`,
          history: chatHistory[agentId] || []
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory((prev) => ({
          ...prev,
          [agentId]: [...(prev[agentId] || []), { role: "model", text: data.text }]
        }));
      } else {
        throw new Error("Failed server response");
      }
    } catch (err) {
      console.error(err);
      // Fallback elegant responses for full simulation offline
      setTimeout(() => {
        let reply = "I am ready to help you formulate a solid plan. Let's outline the core steps needed to secure these achievements!";
        if (agentId === "strategist") reply = "To hit that target, we must balance rigorous AP/IB courses with optimal study rhythms. Let's schedule a mock study plan.";
        if (agentId === "scout") reply = "Based on your focus, I recommend checking the **KPMG Virtual STEM Internship** and looking into local research labs.";
        if (agentId === "counselor") reply = "Selective colleges value 'spike' portfolios over well-rounded ones. We must highlight your singular, high-impact project.";
        if (agentId === "career") reply = "Navigating this field requires hands-on projects. Let's simulate your first system design scenario.";

        setChatHistory((prev) => ({
          ...prev,
          [agentId]: [...(prev[agentId] || []), { role: "model", text: reply }]
        }));
      }, 1000);
    } finally {
      setIsTyping(false);
    }
  };

  const activeHistory = chatHistory[activeAgent.id] || [];

  return (
    <div className="space-y-8" id="ai-agents-page">
      {/* Page Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
          <Bot className="h-8 w-8 text-indigo-600" /> AI Agents Lab
        </h1>
        <p className="text-slate-500 text-sm">
          Co-pilot your college admissions and career path with persistent high-intelligence advisors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Sidebar: Choose Agent */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Select Active Agent</h3>
          <div className="space-y-3">
            {agents.map((agent) => {
              const Icon = agent.icon;
              const isActive = activeAgent.id === agent.id;
              return (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgent(agent)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                    isActive 
                      ? "bg-slate-900 text-white border-slate-900 shadow-xl" 
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className={`p-3 rounded-xl shrink-0 ${isActive ? agent.avatarColor : "bg-slate-100 text-slate-600"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h4 className="font-bold text-sm leading-none">{agent.name}</h4>
                    <p className={`text-[11px] font-semibold ${isActive ? "text-indigo-400" : "text-indigo-600"}`}>{agent.role}</p>
                    <p className={`text-xs mt-2 line-clamp-2 leading-relaxed ${isActive ? "text-slate-400" : "text-slate-500"}`}>{agent.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Main Column: Chat Console */}
        <div className="lg:col-span-2 flex flex-col h-[650px] bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          
          {/* Chat Header */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3 shrink-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${activeAgent.avatarColor}`}>
              <activeAgent.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight">{activeAgent.name}</h3>
              <p className="text-[11px] font-semibold text-indigo-600">{activeAgent.role}</p>
            </div>
            <div className="ml-auto">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-md text-[10px] font-bold text-indigo-700">
                <Zap className="h-3 w-3 fill-indigo-600 text-indigo-600" /> Active Agent
              </span>
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/20">
            {activeHistory.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white ${
                  msg.role === "model" ? activeAgent.avatarColor : "bg-slate-800"
                }`}>
                  {msg.role === "model" ? <activeAgent.icon className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] ${
                  msg.role === "model" 
                    ? "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm" 
                    : "bg-indigo-600 text-white rounded-tr-none shadow-md"
                }`}>
                  <div className="markdown-body text-current prose-sm max-w-none">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-4">
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white ${activeAgent.avatarColor}`}>
                  <activeAgent.icon className="h-4 w-4" />
                </div>
                <div className="bg-white border border-slate-200 text-slate-500 p-4 rounded-2xl rounded-tl-none text-sm flex items-center gap-2 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Helper */}
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
            {activeAgent.suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="shrink-0 px-3.5 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Form */}
          <div className="p-4 border-t border-slate-100 shrink-0 bg-white">
            <div className="relative">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend(chatInput)}
                placeholder={`Ask ${activeAgent.name.split(" ")[0]} anything...`}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm rounded-2xl py-3.5 pl-5 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-600 transition-all font-medium"
              />
              <button
                onClick={() => handleSend(chatInput)}
                disabled={isTyping || !chatInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
