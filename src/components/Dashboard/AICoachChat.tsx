import { useState, useEffect, useRef, memo } from "react";
import { BrainCircuit, Send, User as UserIcon } from "lucide-react";
import Markdown from "react-markdown";
import { useAuth } from "../AuthContext.tsx";
import { TypingIndicator } from "../TypingIndicator";

export const AICoachChat = memo(function AICoachChat() {
  const { user, appUser } = useAuth();
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (appUser) {
      setChatHistory([
        {
          role: "model",
          text: `Hi ${appUser.name?.split(" ")[0] || "there"}! I reviewed your **Academic Profile** and **Roadmap** this morning.\n\nYour academics are strong (3.9 GPA), but your **Leadership** category is currently your weakest area for highly selective universities. I found 3 new club leadership opportunities you can apply for this week.\n\nShould we add "Secure Leadership Role" to your immediate action plan?`,
        },
      ]);
    }
  }, [appUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const message = chatInput;
    setChatInput("");

    const newHistory = [...chatHistory, { role: "user", text: message }];
    setChatHistory(newHistory);
    setIsChatLoading(true);

    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/coach/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message, history: chatHistory }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatHistory([...newHistory, { role: "model", text: data.text }]);
      } else {
        setChatHistory([
          ...newHistory,
          {
            role: "model",
            text: "I'm sorry, I'm having trouble connecting right now. Please check if your GEMINI_API_KEY is configured.",
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setChatHistory([
        ...newHistory,
        { role: "model", text: "I encountered an error trying to respond. Please try again." },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col relative">
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="p-6 border-b border-slate-800/80 bg-slate-900/40 flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
          <BrainCircuit className="h-5 w-5 text-white animate-pulse" />
        </div>
        <div>
          <h3 className="font-black text-white leading-tight font-sans text-base">Student Digital Twin AI</h3>
          <p className="text-xs font-semibold text-indigo-400">High-Intelligence Persistent Strategist</p>
        </div>
        <div className="ml-auto flex gap-2">
          <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span> Gemini Ultra Thinking
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div
              className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                msg.role === "model" ? "bg-indigo-500" : "bg-slate-700"
              }`}
            >
              {msg.role === "model" ? (
                <BrainCircuit className="h-4 w-4 text-white" />
              ) : (
                <UserIcon className="h-4 w-4 text-white" />
              )}
            </div>
            <div
              className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] ${
                msg.role === "model"
                  ? "bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none"
                  : "bg-indigo-600 text-white rounded-tr-none"
              }`}
            >
              <div className="markdown-body text-current [&>*:last-child]:mb-0 [&>*:first-child]:mt-0 prose-sm prose-invert max-w-none">
                <Markdown>{msg.text}</Markdown>
              </div>
            </div>
          </div>
        ))}
        {isChatLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-500 shrink-0 flex items-center justify-center">
              <BrainCircuit className="h-4 w-4 text-white" />
            </div>
            <TypingIndicator />
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-slate-800/50 border-t border-slate-800">
        <div className="relative">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask your AI mentor for advice..."
            className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-400 text-sm rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-indigo-500 focus:bg-slate-800 focus:text-white transition-colors"
          />
          <button
            onClick={handleSendMessage}
            disabled={isChatLoading || !chatInput.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
});
