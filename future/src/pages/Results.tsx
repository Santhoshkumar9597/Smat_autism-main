import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, RefreshCw, Save, LogOut, MessageCircle, CheckCircle, AlertTriangle, Activity, Eye, Brain, TrendingUp, Loader2 } from "lucide-react";
import { generateReportPDF } from "@/lib/generatePDF";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/AppHeader";

/* ─── Animated Ring Gauge ─── */
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

/* ─── Horizontal Animated Bar Chart ─── */
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
  const profile = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("childProfile") || "{}"); } catch { return {}; }
  }, []);

  const handleDownload = async () => {
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

  const riskScore = 68;

  const contributions = [
    { label: "Speech Analysis", value: 35, color: "hsl(var(--destructive))", icon: <Activity className="w-4 h-4" style={{ color: "hsl(var(--destructive))" }} /> },
    { label: "Facial & Eye Contact", value: 45, color: "hsl(var(--warning))", icon: <Eye className="w-4 h-4" style={{ color: "hsl(var(--warning))" }} /> },
    { label: "Behavioral Indicators", value: 20, color: "hsl(var(--success))", icon: <Brain className="w-4 h-4" style={{ color: "hsl(var(--success))" }} /> },
  ];

  const findings = [
    {
      category: "Speech Analysis",
      icon: <Activity className="w-5 h-5" />,
      items: ["Reduced Pitch Variability", "Irregular Rhythm"],
      attention: true,
      color: "hsl(var(--destructive))",
    },
    {
      category: "Facial & Eye Contact",
      icon: <Eye className="w-5 h-5" />,
      items: ["Low Eye Contact", "Limited Expressions"],
      attention: true,
      color: "hsl(var(--warning))",
    },
    {
      category: "Behavioral Indicators",
      icon: <Brain className="w-5 h-5" />,
      items: ["Repetitive Movements", "Delayed Social Response"],
      attention: false,
      color: "hsl(var(--success))",
    },
  ];

  const recommendations = [
    "Consult Pediatrician / Psychologist",
    "Conduct M-CHAT or ADOS Test",
    "Start Early Intervention Therapy",
  ];

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background font-body">
      <AppHeader />
      <main id="report-content" className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Top info strip */}
        <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 px-1">
            <div>
              <h1 className="font-heading text-xl font-bold text-foreground">Analysis Report</h1>
              <p className="text-sm text-muted-foreground">AI-Based Early Screening Using Audio & Video Analysis</p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              {[
                { l: "Child ID", v: profile.childId || "AUT-1023" },
                { l: "Age", v: `${profile.age || "4"} Years` },
                { l: "Gender", v: profile.gender || "Male" },
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

        {/* Risk Score + Bar Chart */}
        <div className="grid lg:grid-cols-5 gap-8 mb-12">
          <motion.div
            className="lg:col-span-2 flex flex-col items-center justify-center rounded-2xl bg-card border border-border p-8"
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <RiskRing score={riskScore} />
            <p className="text-sm text-muted-foreground mt-4 text-center">Moderate indicators of ASD detected based on multimodal analysis.</p>
          </motion.div>

          <motion.div
            className="lg:col-span-3 rounded-2xl bg-card border border-border p-8"
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="font-heading text-base font-bold text-foreground">Risk Contribution Analysis</h2>
            </div>
            <BarChart data={contributions} />
          </motion.div>
        </div>

        {/* Detailed Findings — Timeline style */}
        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }} className="mb-12">
          <h2 className="font-heading text-base font-bold text-foreground mb-6 px-1">Detailed Findings</h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border hidden md:block" />

            <div className="space-y-6">
              {findings.map((f, i) => (
                <motion.div
                  key={f.category}
                  className="relative md:pl-16 group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.15 }}
                >
                  {/* Timeline dot */}
                  <div
                    className="absolute left-[14px] top-3 w-5 h-5 rounded-full border-2 hidden md:flex items-center justify-center"
                    style={{ borderColor: f.color, backgroundColor: f.color + "22" }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
                  </div>

                  <div className="rounded-xl bg-gradient-to-r from-card to-muted/30 border border-border p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: f.color + "18", color: f.color }}>
                        {f.icon}
                      </div>
                      <h3 className="font-heading font-bold text-foreground">{f.category}</h3>
                      {f.attention && (
                        <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-destructive bg-destructive/10 px-2.5 py-1 rounded-full">
                          <AlertTriangle className="w-3 h-3" /> Needs Attention
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {f.items.map(item => (
                        <span
                          key={item}
                          className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-background border border-border text-foreground"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-primary" />
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recommendations — Horizontal pills with gradient */}
        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.6 }} className="mb-10">
          <div className="rounded-2xl overflow-hidden border border-success/30 bg-gradient-to-br from-success/5 to-background">
            <div className="px-6 py-4 border-b border-success/20 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <h2 className="font-heading text-base font-bold text-foreground">Recommended Next Steps</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-3 mb-4">
                {recommendations.map((r, i) => (
                  <motion.div
                    key={r}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border shadow-sm text-sm font-medium text-foreground"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                  >
                    <span className="w-6 h-6 rounded-full bg-success/20 text-success flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    {r}
                  </motion.div>
                ))}
              </div>
              <p className="text-xs text-warning flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Note: This tool is for screening purposes only — not a clinical diagnosis.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 pb-8"
          {...fadeUp}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          <Button className="gap-2 rounded-xl" onClick={handleDownload} disabled={downloading}>
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {downloading ? "Generating..." : "Download Report"}
          </Button>
          <Button variant="outline" className="gap-2 rounded-xl text-destructive border-destructive hover:bg-destructive/10"><RefreshCw className="w-4 h-4" /> Re-Upload Sample</Button>
          <Button variant="outline" className="gap-2 rounded-xl"><Save className="w-4 h-4" /> Save Result</Button>
          <Link to="/assistant"><Button variant="outline" className="gap-2 rounded-xl text-primary"><MessageCircle className="w-4 h-4" /> AI Assistant</Button></Link>
          <Link to="/"><Button variant="secondary" className="gap-2 rounded-xl"><LogOut className="w-4 h-4" /> Exit</Button></Link>
        </motion.div>
      </main>
    </div>
  );
};

export default Results;
