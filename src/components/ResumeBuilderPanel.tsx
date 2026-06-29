import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, Sparkles, RefreshCw, Download, AlertTriangle, 
  CheckCircle, ShieldAlert, Zap
} from "lucide-react";
import { useAuth } from "./AuthContext.tsx";

export default function ResumeBuilderPanel() {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [useAIEnhancement, setUseAIEnhancement] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setErrorMsg("");
    setSuccessMsg("");
    setDownloadUrl(null);

    try {
      const token = user ? await user.getIdToken() : "";
      const url = `/api/portfolio/generate-resume${useAIEnhancement ? "?enhance=true" : ""}`;
      
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.user_friendly_message || "Failed to generate professional resume");
      }

      const blob = await res.blob();
      const localUrl = window.URL.createObjectURL(blob);
      setDownloadUrl(localUrl);
      setSuccessMsg("Your professional resume is compiled and ready to download!");

      // Auto trigger the download for excellent UX
      const a = document.createElement('a');
      a.href = localUrl;
      a.download = 'scholar_resume.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred while compiling your resume.");
    } finally {
      setIsGenerating(false);
    }
  }, [user, useAIEnhancement]);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6" id="resume-builder-panel">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
          <FileText className="h-4 w-4 text-indigo-600" /> Professional Resume Builder
        </h3>
        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-bold rounded-md border border-indigo-100">
          pdfkit Local Engine
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Export your extracurricular hours, portfolio metrics, and verified achievements directly into a professionally structured, recruiter-ready 1-page PDF.
      </p>

      {/* AI Enhancement Toggle */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" /> Professional AI Enhancement
            </h4>
            <p className="text-[10px] text-slate-400">Rewrites titles and bullet points for maximum impact</p>
          </div>
          <input
            type="checkbox"
            checked={useAIEnhancement}
            onChange={() => setUseAIEnhancement(!useAIEnhancement)}
            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
          />
        </div>

        <AnimatePresence>
          {useAIEnhancement && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-amber-50 border border-amber-100/60 p-3 rounded-xl flex items-start gap-2 text-[10px] text-amber-700 font-medium"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <p className="font-bold text-amber-800">Limited to 3 enhancements per day</p>
                <p className="text-amber-600 mt-0.5">This action calls Gemini Flash to optimize copy. Standard exports are completely free and unlimited.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Generate Action Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
      >
        {isGenerating ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" /> Compiling Professional PDF...
          </>
        ) : (
          <>
            <FileText className="h-4 w-4" /> Compile & Generate Resume
          </>
        )}
      </button>

      {/* Success/Error displays */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl space-y-3"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
            {downloadUrl && (
              <a
                href={downloadUrl}
                download="scholar_resume.pdf"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
              >
                <Download className="h-3.5 w-3.5" /> Download PDF Resume again
              </a>
            )}
          </motion.div>
        )}

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="bg-rose-50 border border-rose-100 p-3 rounded-2xl flex items-start gap-2 text-xs text-rose-700"
          >
            <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
