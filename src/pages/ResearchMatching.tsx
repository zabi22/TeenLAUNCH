import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FlaskConical, Search, Plus, Send, CheckCircle, HelpCircle, ChevronRight, Sparkles, BookOpen, Star } from "lucide-react";

interface ResearchProject {
  id: string;
  title: string;
  professor: string;
  university: string;
  department: string;
  matchScore: number;
  description: string;
  status: "Open" | "Applied" | "Interview Scheduled";
}

export default function ResearchMatching() {
  const [activeTab, setActiveTab] = useState<"projects" | "proposal">("projects");
  const [subjectInput, setSubjectInput] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [proposalDraft, setProposalDraft] = useState("");

  const projects: ResearchProject[] = [
    {
      id: "1",
      title: "Microplastics Filtration via Bio-Polymer Membranous Arrays",
      professor: "Dr. Elin Larsson",
      university: "KTH Royal Institute of Technology",
      department: "Environmental Engineering",
      matchScore: 94,
      description: "Developing porous membranous structures using natural bio-polymers to extract nano-plastics from Baltic aquatic samples.",
      status: "Open"
    },
    {
      id: "2",
      title: "Reinforcement Learning Models for High-Volume Algorithmic Arbitrage",
      professor: "Prof. Johan Berglund",
      university: "Stockholm School of Economics",
      department: "Quantitative Finance",
      matchScore: 89,
      description: "Assessing neural network agent stability curves inside low-latency automated high-frequency currency arbitrage cycles.",
      status: "Applied"
    },
    {
      id: "3",
      title: "Epigenetic CRISPR Interference for Rare Cellular Cancers",
      professor: "Dr. Maria Lindqvist",
      university: "Karolinska Institutet",
      department: "Oncology Research",
      matchScore: 92,
      description: "Targeted CRISPR activation modeling within genomic pathways to downregulate oncogene expression profiles.",
      status: "Open"
    }
  ];

  const handleDraftProposal = () => {
    if (!subjectInput.trim()) return;
    setIsDrafting(true);
    setProposalDraft("");
    setTimeout(() => {
      setProposalDraft(`Dear KTH Environmental Engineering Faculty,\n\nI am reaching out regarding Dr. Elin Larsson's research on "Microplastics Filtration via Bio-Polymer Membranous Arrays". Having completed 20 hours of verified organic chemistry modeling and keeping my Cumulative GPA at Stockholm Gymnasium at a strong level, I am passionate about engineering biopolymer filters.\n\nMy primary question centers on polymer degradation rates under high salinity conditions in the Baltic sea. Could we discuss potential ways I can support data aggregation for your membranous arrays project?\n\nSincerely,\nZABI`);
      setIsDrafting(false);
    }, 1200);
  };

  return (
    <div className="space-y-8" id="research-matching-page">
      {/* Page Title */}
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-900 to-slate-900 -z-10"></div>
        <div className="space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-bold text-indigo-400">
            <FlaskConical className="h-3.5 w-3.5" /> University Lab Matching
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Research Matching: University Labs
          </h1>
          <p className="text-slate-400 text-sm">
            Partner with university professors and research coordinators to publish scientific journals, conduct biological testing, or build AI model portfolios.
          </p>
        </div>
        <div className="shrink-0 bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl text-center shadow-xl">
          <div className="text-3xl font-black text-indigo-400">94%</div>
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mt-1">High-Probability Match</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-200/60 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("projects")}
          className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "projects" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-950"}`}
        >
          Open Lab Positions
        </button>
        <button
          onClick={() => setActiveTab("proposal")}
          className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "proposal" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-950"}`}
        >
          AI Proposal Composer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main interactive area */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === "projects" ? (
              <motion.div
                key="projects"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-start justify-between gap-6 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                          {proj.university}
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold">{proj.department}</span>
                      </div>
                      
                      <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {proj.title}
                      </h3>
                      
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        Advisor: <span className="text-slate-800 font-bold">{proj.professor}</span>
                      </p>

                      <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                    </div>

                    <div className="sm:text-right flex flex-col justify-between shrink-0 h-full sm:min-h-[140px] gap-4">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">AI Recommendation</div>
                        <div className="text-xl font-black text-indigo-600">{proj.matchScore}% Match</div>
                      </div>

                      {proj.status === "Open" ? (
                        <button className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors w-fit sm:ml-auto">
                          Pitch Proposal
                        </button>
                      ) : (
                        <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-full w-fit sm:ml-auto">
                          Applied
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="proposal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Write a Pitch to Dr. Larsson</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Define your core scientific question or area of interest to generate an airtight proposal pitch.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Scientific Inquiry Focus</label>
                    <input
                      type="text"
                      value={subjectInput}
                      onChange={(e) => setSubjectInput(e.target.value)}
                      placeholder="e.g. Polymer degradation under high salinity in the Baltic Sea..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    onClick={handleDraftProposal}
                    disabled={isDrafting || !subjectInput.trim()}
                    className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {isDrafting ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> Generating Draft...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" /> Draft Proposal
                      </>
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {proposalDraft && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-6 border border-slate-200 bg-slate-50 rounded-2xl p-5 space-y-4"
                    >
                      <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                        <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                          <CheckCircle className="h-4 w-4" /> Generated Proposal Pitch
                        </span>
                        <button className="text-xs font-bold text-indigo-600 hover:underline">Copy Pitch</button>
                      </div>
                      <pre className="text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">{proposalDraft}</pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-white space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" /> Academic Standards
            </h3>
            <h4 className="text-base font-extrabold leading-tight">Publishing Support</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every matched research opportunity is eligible for TeenLaunch Peer Review. Highly rated papers are submitted to prestigious high school journals like **The Concord Review**.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-xs">
              <Star className="h-4 w-4 fill-indigo-600" /> Professional Ethics
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Lab Protocol Guidelines</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Understand research integrity guidelines and copyright structures. Ensure full attribution to your academic advisors inside Swedish patent programs.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
