import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Briefcase, Play, CheckCircle, ChevronRight, BarChart, RefreshCw, Star, Sparkles, Award } from "lucide-react";

interface Career {
  id: string;
  title: string;
  industry: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  skills: string[];
  description: string;
  scenarios: Scenario[];
}

interface Scenario {
  id: number;
  question: string;
  options: {
    text: string;
    points: { strategic: number; quality: number; adaptability: number };
    feedback: string;
  }[];
}

export default function CareerSimulator() {
  const careers: Career[] = [
    {
      id: "software",
      title: "Fintech Systems Architect",
      industry: "Engineering & Finance",
      difficulty: "Advanced",
      skills: ["System Design", "Cloud Architecture", "Distributed Databases"],
      description: "Scale high-frequency, low-latency trading infrastructure and defend against automated flash crashes.",
      scenarios: [
        {
          id: 1,
          question: "Your primary database cluster experiences high replication lag during a heavy peak-trading hour. Traders complain of delayed execution. What is your strategy?",
          options: [
            {
              text: "Instantly route all read queries to stale read-replicas while keeping write channels open. Tradeoff: Minor data staleness.",
              points: { strategic: 15, quality: 10, adaptability: 20 },
              feedback: "Excellent! You prioritized system availability and trade execution while accepting minor replication delays. This is a classic distributed systems tradeoff."
            },
            {
              text: "Pause trade executions completely for 5 minutes to allow replication buffers to fully sync up.",
              points: { strategic: 5, quality: 18, adaptability: 5 },
              feedback: "Risky. Halting trade executions on high-frequency channels results in substantial financial loss and user panic, though it ensures 100% database consistency."
            },
            {
              text: "Spin up a secondary cloud instance in a different region and execute fully atomic database mirrors immediately.",
              points: { strategic: 18, quality: 8, adaptability: 12 },
              feedback: "High structural overhead. While highly strategic, cross-region state migration during peak overload typically worsens network packet chokes."
            }
          ]
        },
        {
          id: 2,
          question: "An automated arbitrage bot triggers an exponential cycle of buy-sell loops, bloating system logs and threat patterns. How do you respond?",
          options: [
            {
              text: "Apply hard rate-limiting rules specifically targeting the loop signature, preventing denial of service.",
              points: { strategic: 15, quality: 15, adaptability: 18 },
              feedback: "Great reaction. Pinpointed rate-limiting blocks the offensive agent without introducing full system latency."
            },
            {
              text: "Shutdown the trading engine main gateway entirely until the threat is identified.",
              points: { strategic: 5, quality: 10, adaptability: 5 },
              feedback: "Overkill. A complete shutdown is rarely acceptable in fintech architecture, but it does protect database integrity."
            }
          ]
        }
      ]
    },
    {
      id: "biotech",
      title: "Biomedical Gene Editor",
      industry: "Healthcare & Biotech",
      difficulty: "Advanced",
      skills: ["CRISPR Design", "Genomics", "Therapeutic Delivery"],
      description: "Harness CRISPR gene therapy mechanics to formulate rare-disease targeted cures while avoiding off-target side mutations.",
      scenarios: [
        {
          id: 1,
          question: "During preclinical trials of a genomic cure, you discover a high probability of off-target edits in non-disease cell areas. How do you steer?",
          options: [
            {
              text: "Redesign the guide RNA structure to increase specificity, even if it delays project release by 3 months.",
              points: { strategic: 20, quality: 18, adaptability: 10 },
              feedback: "Superb scientific ethics. Specificity delays are infinitely better than off-target genomic complications in live trials."
            },
            {
              text: "Proceed with live trials, relying on supplementary chemical suppressors to offset non-target edits.",
              points: { strategic: 8, quality: 5, adaptability: 18 },
              feedback: "Highly volatile. Layering suppressors on unrefined CRISPR guides increases biological side-effects exponentially."
            }
          ]
        }
      ]
    }
  ];

  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
  const [scores, setScores] = useState({ strategic: 50, quality: 50, adaptability: 50 });
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleStart = (career: Career) => {
    setSelectedCareer(career);
    setCurrentScenarioIdx(0);
    setScores({ strategic: 50, quality: 50, adaptability: 50 });
    setSelectedOption(null);
    setHasAnswered(false);
  };

  const handleAnswer = (optionIdx: number) => {
    setSelectedOption(optionIdx);
    setHasAnswered(true);
    
    const choice = selectedCareer!.scenarios[currentScenarioIdx].options[optionIdx];
    setScores(prev => ({
      strategic: Math.min(prev.strategic + choice.points.strategic, 100),
      quality: Math.min(prev.quality + choice.points.quality, 100),
      adaptability: Math.min(prev.adaptability + choice.points.adaptability, 100)
    }));
  };

  const handleNext = () => {
    if (currentScenarioIdx < selectedCareer!.scenarios.length - 1) {
      setCurrentScenarioIdx(prev => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      // Completed career simulation
      // We can leave selectedCareer as is to show final stats card
      setHasAnswered(true); // stay on final step screen
    }
  };

  return (
    <div className="space-y-8" id="career-simulator-page">
      {/* Title banner */}
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-900 to-slate-900 -z-10"></div>
        <div className="space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-bold text-amber-400">
            <Briefcase className="h-3.5 w-3.5" /> Career Simulator
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Roleplay High-Stakes Career Decisions
          </h1>
          <p className="text-slate-400 text-sm">
            Put yourself in the cockpit of professional industry roles. Deconstruct critical issues and let AI measure your tactical capabilities.
          </p>
        </div>
        {selectedCareer && (
          <button onClick={() => setSelectedCareer(null)} className="shrink-0 px-4 py-2.5 border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Reset Simulation
          </button>
        )}
      </div>

      {!selectedCareer ? (
        /* Career selection screen */
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Select Your Pathway</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {careers.map((c) => (
              <div key={c.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-80">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold rounded-lg uppercase tracking-wider">{c.industry}</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">{c.difficulty}</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">{c.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{c.description}</p>
                  
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {c.skills.map((s, idx) => (
                      <span key={idx} className="px-2 py-1 bg-slate-50 text-slate-500 text-[9px] font-bold rounded-md border border-slate-100">#{s}</span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleStart(c)}
                  className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-white" /> Launch Scenario Simulation
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Simulation screen */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main scenario simulator */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between min-h-[450px]">
            
            {/* Top Indicator */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Scenario</span>
                <h3 className="font-extrabold text-slate-900 text-base">{selectedCareer.title}</h3>
              </div>
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                Step {currentScenarioIdx + 1} of {selectedCareer.scenarios.length}
              </span>
            </div>

            {/* Scenario Question */}
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-slate-900 leading-relaxed">
                {selectedCareer.scenarios[currentScenarioIdx].question}
              </h4>

              {/* Options */}
              <div className="space-y-3">
                {selectedCareer.scenarios[currentScenarioIdx].options.map((opt, i) => {
                  const isChosen = selectedOption === i;
                  return (
                    <button
                      key={i}
                      disabled={hasAnswered}
                      onClick={() => handleAnswer(i)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                        isChosen 
                          ? "border-indigo-600 bg-indigo-50/20 text-indigo-950 font-semibold" 
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isChosen ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-xs sm:text-sm font-medium leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scenario Feedback or Next Action */}
            <AnimatePresence>
              {hasAnswered && selectedOption !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-8 p-5 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-3"
                >
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                    <Sparkles className="h-4 w-4" /> Mentor Evaluation
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedCareer.scenarios[currentScenarioIdx].options[selectedOption].feedback}
                  </p>
                  
                  <div className="flex justify-end pt-3">
                    <button
                      onClick={handleNext}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1"
                    >
                      {currentScenarioIdx < selectedCareer.scenarios.length - 1 ? (
                        <>Next Scenario <ChevronRight className="h-4 w-4" /></>
                      ) : (
                        <>View Final Score Evaluation</>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Real-time score metrics panel */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart className="h-5 w-5 text-indigo-600" /> AI Strategy Metrics
              </h3>

              {/* Progress Dials */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                    <span>Strategic Planning</span>
                    <span className="text-indigo-600">{scores.strategic}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${scores.strategic}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                    <span>Execution Quality</span>
                    <span className="text-indigo-600">{scores.quality}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${scores.quality}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                    <span>Dynamic Adaptability</span>
                    <span className="text-indigo-600">{scores.adaptability}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${scores.adaptability}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-3xl text-white border border-slate-800">
              <h3 className="font-bold text-xs uppercase tracking-widest text-indigo-400 mb-2">XP Milestones</h3>
              <h4 className="text-base font-extrabold mb-1">Earn up to 250 XP</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complete career scenarios with an average strategic weight above 75% to claim your prestige Industry Scholar badge on your public student profile.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
