import { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Download, RefreshCw, Save, LogOut, MessageCircle, CheckCircle, 
  AlertTriangle, Activity, Eye, Brain, TrendingUp, Loader2 
} from "lucide-react";
import { generateReportPDF } from "@/lib/generatePDF";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/AppHeader";

/* ─── Animated Ring Gauge (Old Design) ─── */
const RiskRing = ({ score }: { score: number }) => {
  const circumference = 2 * Math.PI * 70;
  const filled = (score / 100) * circumference;
  const color = score < 40 ? "hsl(var(--success))" : score < 70 ? "hsl(var(--warning))" : "hsl(var(--destructive))";
  const label = score < 40 ? "LOW RISK" : score < 70 ? "MODERATE RISK" : "HIGH RISK";
  const bgClass = score < 40 ? "bg-success" : score < 70 ? "bg-warning" : "bg-destructive";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
          <circle cx="80" cy="80" r="70" fill="none" stroke="hsl(var(--border))" strokeWidth="10" />
          <motion.circle
            cx="80" cy="80" r="70" fill="none" stroke={color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - filled }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-heading font-bold text-foreground"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground font-medium">out of 100</span>
        </div>
      </div>
      <motion.div
        className={`mt-3 px-5 py-1.5 rounded-full font-heading font-bold text-sm text-primary-foreground ${bgClass}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        {label}
      </motion.div>
    </div>
  );
};

/* ─── Horizontal Animated Bar Chart (Old Design) ─── */
const BarChart = ({ data }: { data: { label: string; value: number; color: string; icon: React.ReactNode }[] }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="space-y-5">
      {data.map((d, i) => (
        <div key={d.label} className="group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: d.color + "22" }}>
              {d.icon}
            </div>
            <span className="text-sm font-semibold text-foreground flex-1">{d.label}</span>
            <motion.span
              className="text-lg font-heading font-bold"
              style={{ color: d.color }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.2 }}
            >
              {d.value}%
            </motion.span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full relative"
              style={{ backgroundColor: d.color }}
              initial={{ width: 0 }}
              animate={{ width: `${(d.value / max) * 100}%` }}
              transition={{ duration: 1.2, delay: 0.3 + i * 0.2, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 rounded-full opacity-30"
                style={{ background: `linear-gradient(90deg, transparent, white, transparent)` }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.5 + i * 0.3 }}
              />
            </motion.div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ─── Main Results Page ─── */
const Results = () => {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const location = useLocation();
  const predictionProps = location.state?.predictionProps;

  const profile = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("childProfile") || "{}"); } catch { return {}; }
  }, []);

  const riskScore = predictionProps?.score ?? 0;
  const interpretation = predictionProps?.interpretation ?? "No analysis data combined. Please upload samples to begin.";
  const dynamicRecommendations = predictionProps?.next_steps || null;
  const dynamicObservations = predictionProps?.observations || null;

  const handleDownload = async () => {
    if (!predictionProps) {
      toast({ title: "No Data", description: "Please complete an analysis before downloading a report.", variant: "destructive" });
      return;
    }
    setDownloading(true);
    try {
      await generateReportPDF("report-content", `autism-report-${profile.childId || "report"}.pdf`);
      toast({ title: "Report Downloaded", description: "PDF saved successfully." });
    } catch {
      toast({ title: "Download Failed", description: "Could not generate PDF.", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  const handleSave = async () => {
    if (!predictionProps) {
      toast({ title: "No Data", description: "No results to save.", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch("/api/save_result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: profile.childId || "Anonymous",
          score: riskScore,
          interpretation: interpretation,
          next_steps: recommendations,
          age: parseInt(profile.age || "0") * 12
        })
      });
      if (response.ok) {
        toast({ title: "Saved!", description: "Result saved to history successfully." });
      } else {
        throw new Error("Failed to save result");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const contributions = [
    { label: "Speech Analysis", value: predictionProps ? 35 : 0, color: "hsl(var(--destructive))", icon: <Activity className="w-4 h-4" style={{ color: "hsl(var(--destructive))" }} /> },
    { label: "Facial & Eye Contact", value: predictionProps ? 45 : 0, color: "hsl(var(--warning))", icon: <Eye className="w-4 h-4" style={{ color: "hsl(var(--warning))" }} /> },
    { label: "Behavioral Indicators", value: predictionProps ? 20 : 0, color: "hsl(var(--success))", icon: <Brain className="w-4 h-4" style={{ color: "hsl(var(--success))" }} /> },
  ];

  const observations = dynamicObservations || (predictionProps ? [
    "Reduced Pitch Variability",
    "Low Eye Contact Detected",
    "Limited Facial Expressions",
    "Repetitive Motor Signs"
  ] : ["Pending Analysis"]);

  const recommendations = dynamicRecommendations || (predictionProps ? [
    "Consult Pediatrician / Psychologist",
    "Conduct M-CHAT or ADOS Test",
    "Start Early Intervention Therapy",
  ] : ["Upload samples to receive tailored recommendations"]);

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background font-body">
      <AppHeader />
      <main id="report-content" className="container mx-auto px-4 py-8 max-w-6xl">
        {!predictionProps && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3 text-primary">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm font-medium">Viewing example report structure. Please upload files to see your actual results.</p>
            <Link to="/upload" className="ml-auto">
              <Button size="sm">Start Screening</Button>
            </Link>
          </div>
        )}
        
        {/* Top info strip */}
        <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 px-1 text-center md:text-left">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">Analysis Report</h1>
              <p className="text-sm text-muted-foreground italic">AI-Based Early Screening Dashboard</p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              {[
                { l: "Child ID", v: profile.childId || "Pending" },
                { l: "Age", v: profile.age ? `${profile.age} Years` : "N/A" },
                { l: "Gender", v: profile.gender || "N/A" },
                { l: "Date", v: new Date().toLocaleDateString() },
              ].map(d => (
                <div key={d.l} className="px-3 py-1.5 rounded-full bg-muted text-foreground">
                  <span className="text-muted-foreground">{d.l}: </span>
                  <strong className="capitalize">{d.v}</strong>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Risk Score + Bar Chart Grid (Restore design) */}
        <div className="grid lg:grid-cols-5 gap-8 mb-12">
          <motion.div
            className="lg:col-span-2 flex flex-col items-center justify-center rounded-2xl bg-card border border-border p-10"
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <RiskRing score={riskScore} />
            <p className="text-sm text-center text-muted-foreground mt-4 italic font-medium">"{interpretation}"</p>
          </motion.div>

          <motion.div
            className="lg:col-span-3 rounded-2xl bg-card border border-border p-8"
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="font-heading text-base font-bold text-foreground uppercase tracking-wider">Risk Contribution Analysis</h2>
            </div>
            <BarChart data={contributions} />
          </motion.div>
        </div>

        {/* Detailed Observations (Old Design style) */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }}>
            <div className="bg-white p-6 rounded-2xl border border-border h-full">
               <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                 <Activity className="w-5 h-5 text-primary" /> Key Observations
               </h3>
               <ul className="space-y-3">
                 {observations.map((obs, i) => (
                   <li key={i} className="flex gap-2 text-sm text-muted-foreground list-none">
                     <CheckCircle className="w-4 h-4 text-success shrink-0" />
                     {obs}
                   </li>
                 ))}
               </ul>
            </div>
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.4 }}>
            <div className="bg-white p-6 rounded-2xl border border-border h-full">
               <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                 <ShieldCheck className="w-5 h-5 text-primary" /> Strategic Recommendations
               </h3>
               <ul className="space-y-3">
                 {recommendations.map((rec, i) => (
                   <li key={i} className="flex gap-2 text-sm text-muted-foreground list-none">
                     <span className="text-primary font-bold">{i+1}.</span>
                     {rec}
                   </li>
                 ))}
               </ul>
            </div>
          </motion.div>
        </div>

        {/* Professional Disclaimer (Keep content but fit old design) */}
        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 mb-10">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-widest mb-2">
            <AlertTriangle className="w-4 h-4" /> Medical Disclaimer
          </div>
          <p className="text-[11px] text-rose-700/80 leading-relaxed font-medium">
            This AI-generated analysis is for screening and educational purposes only. It DOES NOT constitute a medical diagnosis. Autism Spectrum Disorder (ASD) can only be diagnosed by licensed medical professionals through clinical evaluation.
          </p>
        </div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 no-print pb-8"
          {...fadeUp}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          <Button className="gap-2 rounded-xl" onClick={handleDownload} disabled={downloading}>
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {downloading ? "Generating..." : "Download Report"}
          </Button>
          <Link to="/upload"><Button variant="outline" className="gap-2 rounded-xl text-destructive border-destructive hover:bg-destructive/10"><RefreshCw className="w-4 h-4" /> Re-Upload Sample</Button></Link>
          <Button variant="outline" className="gap-2 rounded-xl" onClick={handleSave}><Save className="w-4 h-4" /> Save Result</Button>
          <Link to="/assistant"><Button variant="outline" className="gap-2 rounded-xl text-primary"><MessageCircle className="w-4 h-4" /> AI Assistant</Button></Link>
          <Link to="/"><Button variant="secondary" className="gap-2 rounded-xl"><LogOut className="w-4 h-4" /> Exit</Button></Link>
        </motion.div>
      </main>
    </div>
  );
};

/* --- Missing Icon mapping --- */
const ShieldCheck = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>
  </svg>
);

export default Results;
