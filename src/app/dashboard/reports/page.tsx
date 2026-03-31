"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FileText, Sparkles, CheckCircle2, Loader2, FileDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ReportsPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const reportRef = useRef<HTMLDivElement>(null);

  const generateReport = async () => {
    setIsGenerating(true);
    setReportData(null);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST"
      });
      const data = await res.json();
      if (data.markdown) {
        setReportData(data.markdown);
      } else {
        alert("Failed to generate report.");
      }
    } catch (err) {
      console.error(err);
      alert("Error calling Groq SDK for generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = async () => {
    const input = reportRef.current;
    if (!input) return;

    setIsDownloading(true);
    try {
      // Small optimization wait to ensure styles render properly
      await new Promise(r => setTimeout(r, 100));

      const canvas = await html2canvas(input, {
        scale: 2, 
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`CarbonTrack_Audit_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
       console.error("PDF generation failed:", error);
       alert("PDF generation failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-playfair tracking-tight">Emissions Archive <span className="text-primary">&</span> Audit</h1>
          <p className="text-muted text-sm mt-1 font-light">Generate extensive, AI-driven PDF summaries of your logged data.</p>
        </div>
      </div>

      {!reportData ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-[32px] border border-white/40 dark:border-slate-700/50 shadow-sm p-10 relative overflow-hidden group text-center space-y-6">
          <div className="absolute top-0 right-0 p-8 text-primary/5 transition-transform duration-[20s] ease-linear rotate-[360deg] group-hover:scale-[2] pointer-events-none origin-center transform-gpu animate-[spin_30s_linear_infinite]">
            <Sparkles className="w-96 h-96" />
          </div>

          <motion.div 
            animate={{ scale: [1, 1.05, 1] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(34,197,94,0.2)]"
          >
            {isGenerating ? <Loader2 className="w-10 h-10 animate-spin" /> : <FileText className="w-10 h-10" />}
          </motion.div>

          <div className="max-w-md space-y-2 relative z-10">
            <h2 className="text-2xl font-bold font-playfair">{isGenerating ? "Analyzing Core Data..." : "Deep AI Carbon Audit"}</h2>
            <p className="text-muted text-sm leading-relaxed">
              {isGenerating 
               ? "Our Neural Core is running calculations across all your historical activity logs and searching for anomalies." 
               : "Click below to send your entire CarbonTrack activity history to the Groq AI engine for an extensive markdown-based summary, suitable for PDF export."}
            </p>
          </div>

          <button 
            onClick={generateReport}
            disabled={isGenerating}
            className="mt-6 flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:bg-primary-dark hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0 relative z-10"
          >
            <Sparkles className="w-5 h-5" />
            {isGenerating ? "Generating Assessment..." : "Generate MVP Report"}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
             <div className="flex items-center gap-2 text-success font-medium text-sm">
                <CheckCircle2 className="w-5 h-5" />
                Audit Generated Successfully
             </div>
             <div className="flex gap-4">
                <button onClick={() => setReportData(null)} className="text-muted text-sm font-medium hover:text-foreground">Discard</button>
                <button 
                  onClick={downloadPDF}
                  disabled={isDownloading}
                  className="flex items-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                  {isDownloading ? "Converting..." : "Download PDF"}
                </button>
             </div>
          </div>

          {/* Rendered Audit Display */}
          <div className="bg-white/90 dark:bg-[#0f172a] shadow-xl rounded-[32px] p-8 md:p-14 border border-gray-200 dark:border-[#1e293b]">
             <div 
               ref={reportRef} 
               className="prose prose-slate dark:prose-invert max-w-none 
                 prose-headings:font-playfair prose-h1:text-4xl prose-h1:text-primary 
                 prose-h2:text-2xl prose-h2:border-b prose-h2:pb-2 prose-h2:mt-12 
                 prose-h3:text-xl prose-p:text-muted-foreground prose-strong:text-foreground
                 bg-white p-12 text-black"
                style={{ 
                   // Force white background for PDF saving context in case of dark mode
                   backgroundColor: 'white', 
                   color: '#0f172a'
                }}
             >
                <ReactMarkdown>{reportData}</ReactMarkdown>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
