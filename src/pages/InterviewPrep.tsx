import React, { useState, useEffect, useRef } from "react";
import { Mic, Play, Square, Award, Volume2, Shield, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../components/AuthContext.tsx";

const questions = [
  "Tell me about a time you failed and how you handled it.",
  "Why do you want to attend our university?",
  "Describe a project you are most proud of.",
  "How do you handle conflict in a team setting?",
  "What is the most significant challenge facing your generation?"
];

export default function InterviewPrep() {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [metrics, setMetrics] = useState({
    confidence: 0,
    clarity: 0,
    fillerWords: 0
  });

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
    }
  }, []);

  const handleRecord = async () => {
    if (isRecording) {
      setIsRecording(false);
      recognitionRef.current?.stop();
      if (transcript.length > 10) {
        await analyzeResponse(transcript);
      } else {
        setFeedback("Response was too short to analyze. Try again.");
      }
    } else {
      setTranscript("");
      setFeedback(null);
      setIsRecording(true);
      recognitionRef.current?.start();
    }
  };

  const analyzeResponse = async (text: string) => {
    if (!user) return;
    setIsAnalyzing(true);
    setFeedback(null);
    try {
      const token = await user.getIdToken();
      // We will send this to a new backend endpoint
      const res = await fetch("/api/interview/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          question: questions[questionIndex],
          transcript: text
        })
      });
      if (res.ok) {
        const data = await res.json();
        setFeedback(data.feedback);
        setMetrics({
          confidence: data.confidence || 0,
          clarity: data.clarity || 0,
          fillerWords: data.fillerWords || 0
        });
      }
    } catch (e) {
      console.error(e);
      setFeedback("Failed to analyze response. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const nextQuestion = () => {
    setQuestionIndex((prev) => (prev + 1) % questions.length);
    setTranscript("");
    setFeedback(null);
    setMetrics({ confidence: 0, clarity: 0, fillerWords: 0 });
  };

  return (
    <div className="space-y-8 h-full min-h-[calc(100vh-8rem)] pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <Mic className="h-8 w-8 text-indigo-500" />
          AI Mock Interviewer
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Practice your delivery. Our AI listens to your voice and analyzes structure, pacing, and content.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Main Interface */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[500px]">
          <div className="absolute top-6 left-6 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 flex items-center gap-2">
            <Volume2 className="h-4 w-4" /> Live AI Session
          </div>
          
          <button onClick={nextQuestion} className="absolute top-6 right-6 text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 transition-colors flex items-center gap-2">
            Skip Question <RefreshCw className="h-3 w-3" />
          </button>
          
          <div className="text-center max-w-xl mx-auto mb-12 mt-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">"{questions[questionIndex]}"</h2>
            <p className="text-slate-500 text-sm">Ivy League Question Bank</p>
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
          
          <div className="mt-8 text-slate-500 font-medium text-sm text-center max-w-lg min-h-[40px]">
            {isRecording ? (
              <span className="text-slate-700 italic">"{transcript}"</span>
            ) : isAnalyzing ? (
              <span className="flex items-center gap-2 justify-center text-indigo-600"><RefreshCw className="h-4 w-4 animate-spin" /> Deep analyzing response...</span>
            ) : (
              "Click the mic to start answering"
            )}
          </div>

          <AnimatePresence>
            {feedback && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-8 bg-emerald-50 text-emerald-800 p-6 rounded-2xl border border-emerald-100 text-sm w-full text-left leading-relaxed shadow-sm">
                <div className="font-bold mb-2 flex items-center gap-2"><Award className="h-4 w-4" /> AI Feedback</div>
                {feedback}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-500" />
            Performance Metrics
          </h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <div className="font-bold text-slate-700 text-sm">Overall Confidence</div>
                <div className="text-lg font-black text-indigo-600">{metrics.confidence}%</div>
              </div>
              <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${metrics.confidence}%` }} transition={{ duration: 1 }} className="h-full bg-indigo-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <div className="font-bold text-slate-700 text-sm">Pacing & Clarity</div>
                <div className="text-lg font-black text-emerald-600">{metrics.clarity}%</div>
              </div>
              <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${metrics.clarity}%` }} transition={{ duration: 1 }} className="h-full bg-emerald-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <div className="font-bold text-slate-700 text-sm">Filler Words Used</div>
                <div className="text-lg font-black text-rose-600">{metrics.fillerWords}</div>
              </div>
              <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, metrics.fillerWords * 10)}%` }} transition={{ duration: 1 }} className="h-full bg-rose-500 rounded-full" />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Try to reduce "um", "like", and "you know".</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
