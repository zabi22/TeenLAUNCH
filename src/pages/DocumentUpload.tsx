import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  UploadCloud, FileText, CheckCircle, Clock, AlertCircle, Trash2, 
  RefreshCw, Award, Calendar, Building, Zap, Loader2, ChevronRight 
} from "lucide-react";
import { useAuth } from "../components/AuthContext.tsx";

interface DocumentItem {
  id: number;
  userId: number;
  fileUrl: string;
  type: string;
  parsedData: {
    certificateName?: string;
    organization?: string;
    date?: string;
    extractedText?: string;
  } | null;
  verificationStatus: string; // pending, processing, verified, failed_permanently, queued_for_retry
  uploadedAt: string;
}

export default function DocumentUpload() {
  const { appUser } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const pollingIntervals = useRef<{ [key: number]: NodeJS.Timeout }>({});

  // Fetch all documents for the user
  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  // Poll status of a specific document
  const pollDocumentStatus = useCallback((docId: number) => {
    if (pollingIntervals.current[docId]) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/documents/${docId}/status`);
        if (res.ok) {
          const updatedDoc = await res.json();
          
          setDocuments((prevDocs) =>
            prevDocs.map((d) => (d.id === docId ? { ...d, ...updatedDoc } : d))
          );

          // Stop polling if status is terminal
          if (
            updatedDoc.verificationStatus === "verified" ||
            updatedDoc.verificationStatus === "failed_permanently" ||
            updatedDoc.verificationStatus === "failed"
          ) {
            clearInterval(interval);
            delete pollingIntervals.current[docId];
          }
        }
      } catch (err) {
        console.error(`Error polling document ${docId} status:`, err);
      }
    }, 10000); // 10 seconds

    pollingIntervals.current[docId] = interval;
  }, []);

  // Sync active pollers based on document list
  useEffect(() => {
    documents.forEach((doc) => {
      if (
        doc.verificationStatus === "pending" ||
        doc.verificationStatus === "processing" ||
        doc.verificationStatus === "queued_for_retry"
      ) {
        pollDocumentStatus(doc.id);
      }
    });

    return () => {
      // Cleanup pollers on unmount
      Object.values(pollingIntervals.current).forEach(clearInterval);
    };
  }, [documents, pollDocumentStatus]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Drag and drop event handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // File upload logic
  const uploadFile = useCallback(async (file: File) => {
    if (!file) return;

    // Constraints check (max 10MB, extensions)
    const allowedExtensions = ["pdf", "png", "jpg", "jpeg"];
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!allowedExtensions.includes(ext)) {
      setUploadError("Only PDF, PNG, and JPG files are supported.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10MB limit.");
      return;
    }

    setUploadError("");
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "certificate");

    try {
      const uploadRes = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errData = await uploadRes.json();
        throw new Error(errData.user_friendly_message || "Upload failed");
      }

      const uploadedDoc = await uploadRes.json();
      
      // Prepend to documents state
      setDocuments((prev) => [uploadedDoc, ...prev]);

      // Trigger parse request immediately in background
      fetch(`/api/documents/${uploadedDoc.id}/parse`, {
        method: "POST",
      }).then(() => {
        // Start polling status
        pollDocumentStatus(uploadedDoc.id);
      }).catch(err => console.error("Parsing trigger failed:", err));

    } catch (err: any) {
      setUploadError(err.message || "Something went wrong during file upload.");
    } finally {
      setIsUploading(false);
    }
  }, [pollDocumentStatus]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  }, [uploadFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  }, [uploadFile]);

  // Memoized lists
  const sortedDocuments = useMemo(() => {
    return [...documents].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }, [documents]);

  const stats = useMemo(() => {
    const verified = documents.filter((d) => d.verificationStatus === "verified").length;
    const processing = documents.filter(
      (d) => d.verificationStatus === "processing" || d.verificationStatus === "pending" || d.verificationStatus === "queued_for_retry"
    ).length;
    return { verified, processing, total: documents.length };
  }, [documents]);

  // UI Status Badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle className="h-3.5 w-3.5" /> Verified (+50 XP)
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 animate-pulse">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing...
          </span>
        );
      case "queued_for_retry":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Clock className="h-3.5 w-3.5" /> Retrying soon
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Clock className="h-3.5 w-3.5" /> Queued
          </span>
        );
      case "failed":
      case "failed_permanently":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <AlertCircle className="h-3.5 w-3.5" /> Failed
          </span>
        );
    }
  };

  return (
    <div className="space-y-8" id="document-intelligence-page">
      {/* Title Banner */}
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-900 to-slate-900 -z-10"></div>
        <div className="space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-bold text-indigo-400">
            <Award className="h-3.5 w-3.5" /> Document Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Verify Achievements & Earn XP
          </h1>
          <p className="text-slate-400 text-sm">
            Upload your certificates, awards, and transcripts. Our background AI models will scan, parse, and verify them dynamically to add verified accolades to your public portfolio and award 50 XP points!
          </p>
        </div>
        <div className="shrink-0 bg-slate-800/60 border border-slate-700/60 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-lg">
            <Zap className="h-6 w-6 fill-white" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verification Stats</div>
            <div className="text-lg font-black text-white mt-0.5">
              {stats.verified} Verified <span className="text-xs font-normal text-slate-500">• {stats.processing} Processing</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-3">
              Upload Certificate
            </h3>

            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                dragActive ? "border-indigo-500 bg-indigo-50/40" : "border-slate-200 hover:border-indigo-400"
              }`}
            >
              <input
                type="file"
                id="file-upload-input"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileInput}
                disabled={isUploading}
              />
              
              <label htmlFor="file-upload-input" className="cursor-pointer block space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500 group-hover:bg-indigo-50">
                  <UploadCloud className="h-6 w-6 text-indigo-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700">Drag & drop certificate file</p>
                  <p className="text-[10px] text-slate-400">PDF, PNG, JPG up to 10MB</p>
                </div>
                <button
                  type="button"
                  onClick={() => document.getElementById("file-upload-input")?.click()}
                  disabled={isUploading}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer"
                >
                  Select File
                </button>
              </label>

              {isUploading && (
                <div className="absolute inset-0 bg-white/80 rounded-2xl flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-800">Uploading certificate...</p>
                    <p className="text-[10px] text-slate-500">Processing... estimated time: 2 minutes</p>
                  </div>
                </div>
              )}
            </div>

            {uploadError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-xl flex items-start gap-2 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> Dynamic Verification benefits
              </h4>
              <ul className="space-y-1.5 text-[10px] text-slate-500 pl-5 list-disc leading-relaxed">
                <li>Instantly awards +50 XP to boost your scholar standing.</li>
                <li>Appends highly professional, verified badges to your profile.</li>
                <li>Powers the one-click Resume builder automatically.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Document List and Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 min-h-[400px]">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-3 flex justify-between items-center">
              <span>Your Certificates ({sortedDocuments.length})</span>
              <button 
                onClick={fetchDocuments}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                title="Refresh List"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </h3>

            {loadingDocs ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <p className="text-xs font-medium">Fetching certificates...</p>
              </div>
            ) : sortedDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                  <FileText className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-700">Upload your first certificate</h4>
                  <p className="text-xs text-slate-400 max-w-sm">No files uploaded yet. Drag a PDF or image certificate above to begin verification.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedDocuments.map((doc) => (
                  <motion.div
                    key={doc.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-slate-200/80 rounded-2xl p-5 hover:shadow-md transition-all space-y-4 bg-slate-50/30"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                            {doc.parsedData?.certificateName || doc.fileUrl.split("/").pop()}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="shrink-0 flex items-center gap-2">
                        {getStatusBadge(doc.verificationStatus)}
                      </div>
                    </div>

                    {/* Parser Preview Panel */}
                    {doc.verificationStatus === "verified" && doc.parsedData && (
                      <div className="bg-white border border-indigo-100 rounded-xl p-4 space-y-3 shadow-inner">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                          <Award className="h-3.5 w-3.5" /> AI Extracted Verification Credentials
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1">
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Certificate Title</span>
                            <div className="font-bold text-slate-800">{doc.parsedData.certificateName || "N/A"}</div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Issuing Authority</span>
                            <div className="font-bold text-slate-800 flex items-center gap-1">
                              <Building className="h-3.5 w-3.5 text-slate-400" /> {doc.parsedData.organization || "N/A"}
                            </div>
                          </div>
                          {doc.parsedData.date && (
                            <div className="space-y-1 sm:col-span-2">
                              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Issue Date</span>
                              <div className="font-bold text-slate-800 flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-slate-400" /> {doc.parsedData.date}
                              </div>
                            </div>
                          )}
                        </div>

                        {doc.parsedData.extractedText && (
                          <div className="border-t border-slate-100 pt-3 space-y-1">
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block font-mono">Dynamic Achievements Verified</span>
                            <p className="text-xs text-slate-600 leading-relaxed italic">
                              "{doc.parsedData.extractedText}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Pending state text */}
                    {(doc.verificationStatus === "pending" || doc.verificationStatus === "processing") && (
                      <div className="text-[10px] font-medium text-slate-500 bg-blue-50/50 border border-blue-100/50 p-3 rounded-xl flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 text-indigo-500 animate-spin" />
                        Our Document Intelligence engine is analyzing and verifying this document. You may browse other pages; we'll update your portfolio dynamically.
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
