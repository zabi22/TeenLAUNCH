import React, { useState } from "react";
import { MessageSquare, Search, Send, Image, Paperclip, MoreVertical, Hash, Users, Globe, Phone, Video } from "lucide-react";
import { useAuth } from "../components/AuthContext.tsx";
import { motion } from "motion/react";

export default function Messages() {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState<number | null>(1);
  const [message, setMessage] = useState("");

  const chats = [
    { id: 1, name: "Sarah Jenkins", role: "MIT Research Partner", lastMessage: "Are we still meeting at 5 PM for the AI lab review?", time: "2m ago", online: true, unread: 2 },
    { id: 2, name: "Global Scholarship Seekers", role: "Community Group", lastMessage: "Alex: I just submitted the Coca-Cola app!", time: "1h ago", online: false, unread: 15 },
    { id: 3, name: "Hackathon Team Alpha", role: "Project Group", lastMessage: "The GitHub repo is live.", time: "3h ago", online: true, unread: 0 },
    { id: 4, name: "Dr. Chen", role: "Mentor", lastMessage: "Your research proposal looks solid.", time: "Yesterday", online: false, unread: 0 }
  ];

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-indigo-500" />
          Messages & Communities
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Connect with mentors, research partners, and project teams globally.
        </p>
      </div>

      <div className="flex flex-1 gap-6 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {chats.map(chat => (
              <button 
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={`w-full text-left p-3 rounded-xl transition-colors flex items-start gap-3 ${
                  activeChat === chat.id ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-100 border border-transparent'
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                    {chat.name.charAt(0)}
                  </div>
                  {chat.online && (
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className={`text-sm font-bold truncate ${activeChat === chat.id ? 'text-indigo-900' : 'text-slate-900'}`}>
                      {chat.name}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">{chat.time}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 truncate">{chat.role}</p>
                  <p className={`text-xs mt-1 truncate ${chat.unread > 0 ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                    {chat.lastMessage}
                  </p>
                </div>
                {chat.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-1">
                    {chat.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {activeChat ? (
          <div className="flex-1 flex flex-col relative">
            <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {chats.find(c => c.id === activeChat)?.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">{chats.find(c => c.id === activeChat)?.name}</h2>
                  <p className="text-xs font-medium text-indigo-500">
                    {chats.find(c => c.id === activeChat)?.online ? 'Online now' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <button className="hover:text-indigo-600 transition-colors"><Phone className="h-5 w-5" /></button>
                <button className="hover:text-indigo-600 transition-colors"><Video className="h-5 w-5" /></button>
                <button className="hover:text-indigo-600 transition-colors"><MoreVertical className="h-5 w-5" /></button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/30">
              <div className="flex justify-center">
                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Today
                </span>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shrink-0 flex items-center justify-center text-white text-xs font-bold mt-auto">
                  S
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm max-w-[70%]">
                  <p className="text-sm text-slate-700">Hey! Did you check out the new AI Discovery engine for opportunities? It found like 3 local CS internships for me.</p>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1">4:32 PM</span>
                </div>
              </div>

              <div className="flex gap-4 flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 flex items-center justify-center text-slate-500 text-xs font-bold mt-auto">
                  Me
                </div>
                <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-br-none shadow-sm max-w-[70%]">
                  <p className="text-sm text-indigo-50">Yeah! It's incredible. The Digital Twin also built a roadmap for me.</p>
                  <span className="text-[10px] text-indigo-300 font-medium block mt-1 text-right">4:35 PM</span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shrink-0 flex items-center justify-center text-white text-xs font-bold mt-auto">
                  S
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm max-w-[70%]">
                  <p className="text-sm text-slate-700">{chats.find(c => c.id === activeChat)?.lastMessage}</p>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1">5:02 PM</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="flex items-center gap-2">
                <button className="text-slate-400 hover:text-indigo-600 transition-colors p-2"><Paperclip className="h-5 w-5" /></button>
                <button className="text-slate-400 hover:text-indigo-600 transition-colors p-2"><Image className="h-5 w-5" /></button>
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..." 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
            <MessageSquare className="h-16 w-16 mb-4 text-slate-300" />
            <h2 className="text-xl font-bold text-slate-600">Your Messages</h2>
            <p className="text-sm mt-2">Select a conversation or start a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
