import React, { useState } from "react";
import { Mic, Play, Square, Award, Volume2, Shield } from "lucide-react";
import { motion } from "motion/react";

export default function InterviewPrep() {
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      setFeedback("Analyzing your response with Voice AI...");
      setTimeout(() => {
        setFeedback("Strong response! Your confidence score is 88%. Consider using the STAR method (Situation, Task, Action, Result) more explicitly to structure your examples.");
      }, 2000);
    } else {
      setIsRecording(true);
      setFeedback(null);
    }
  };

  return (
    <div className="space-y-8 h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Mic className="h-8 w-8 text-indigo-500" />
          Interview Preparation Suite
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Practice college and scholarship interviews with our Voice AI Mock Interviewer.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Main Interface */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-6 left-6 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 flex items-center gap-2">
            <Volume2 className="h-4 w-4" /> Live Session
          </div>
          
          <div className="text-center max-w-lg mx-auto mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">"Tell me about a time you failed and how you handled it."</h2>
            <p className="text-slate-500 text-sm">Harvard Alumni Interview Question Bank</p>
          </div>

          <button 
            onClick={handleRecord}
            className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
              isRecording 
                ? "bg-rose-50 text-rose-500 border-[8px] border-rose-100 animate-pulse" 
                : "bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 hover:scale-105"
            }`}
          >
            {isRecording ? <Square className="h-10 w-10 fill-current" /> : <Mic className="h-12 w-12" />}
          </button>
          
          <div className="mt-8 text-slate-400 font-medium text-sm">
            {isRecording ? "Recording your response... (0:14)" : "Click to start answering"}
          </div>

          {feedback && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-emerald-50 text-emerald-800 p-5 rounded-2xl border border-emerald-100 text-sm font-medium w-full max-w-lg mx-auto text-center">
              {feedback}
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-500" />
            Performance Metrics
          </h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <div className="font-bold text-slate-700 text-sm">Overall Confidence</div>
                <div className="text-lg font-black text-indigo-600">82%</div>
              </div>
              <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full w-[82%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <div className="font-bold text-slate-700 text-sm">Pacing & Clarity</div>
                <div className="text-lg font-black text-emerald-600">91%</div>
              </div>
              <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[91%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <div className="font-bold text-slate-700 text-sm">Filler Words Used</div>
                <div className="text-lg font-black text-rose-600">14</div>
              </div>
              <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full w-[30%]" />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Try to reduce "um" and "like".</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
