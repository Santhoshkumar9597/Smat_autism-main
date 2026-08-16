import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Video, Image, Upload, X, Check, Loader2, Brain, BarChart3, FileCheck, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import AppHeader from "@/components/AppHeader";
import uploadHero from "@/assets/upload-hero.png";

type FileType = "audio" | "video" | "image";

const fileConfig: Record<FileType, { icon: typeof Music; label: string; accept: string; formats: string; color: string; gradient: string }> = {
  audio: { icon: Music, label: "Audio Sample", accept: ".mp3,.wav,.m4a", formats: "MP3, WAV, M4A", color: "primary", gradient: "from-[hsl(var(--primary)/0.1)] to-[hsl(var(--primary)/0.02)]" },
  video: { icon: Video, label: "Video Sample", accept: ".mp4,.avi,.mov", formats: "MP4, AVI, MOV", color: "accent", gradient: "from-[hsl(var(--accent)/0.1)] to-[hsl(var(--accent)/0.02)]" },
  image: { icon: Image, label: "Image Samples", accept: ".jpg,.jpeg,.png,.bmp", formats: "JPG, PNG, BMP", color: "success", gradient: "from-[hsl(var(--success)/0.1)] to-[hsl(var(--success)/0.02)]" },
};

const analysisSteps = [
  { icon: Upload, label: "Uploading files" },
  { icon: FileCheck, label: "Preprocessing" },
  { icon: Brain, label: "AI Models" },
  { icon: BarChart3, label: "Report" },
];

/* ─── Analysis Animation Screen ─── */
const AnalysisScreen = ({ step, progress }: { step: number; progress: number }) => {
  const orbColors = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--success))", "hsl(var(--warning))"];

  return (
    <div className="min-h-screen bg-background font-body relative overflow-hidden">
      <AppHeader />
      <div className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent)", top: "10%", left: "20%" }}
          animate={{ scale: [1, 1.3, 1], x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div className="absolute w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, hsl(var(--accent)), transparent)", bottom: "10%", right: "15%" }}
          animate={{ scale: [1, 1.2, 1], x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <main className="container mx-auto px-4 py-16 max-w-2xl text-center relative z-10">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div className="relative w-40 h-40 mx-auto mb-10">
            {orbColors.map((color, i) => (
              <motion.div key={i} className="absolute w-5 h-5 rounded-full"
                style={{ backgroundColor: color, left: "50%", top: "50%", marginLeft: -10, marginTop: -10 }}
                animate={{
                  x: [Math.cos((i * Math.PI) / 2) * 50, Math.cos((i * Math.PI) / 2 + Math.PI) * 50, Math.cos((i * Math.PI) / 2) * 50],
                  y: [Math.sin((i * Math.PI) / 2) * 50, Math.sin((i * Math.PI) / 2 + Math.PI) * 50, Math.sin((i * Math.PI) / 2) * 50],
                  scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
              />
            ))}
            <motion.div className="absolute inset-4 rounded-full border-2 border-primary/30" animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
            <motion.div className="absolute inset-8 rounded-full border-2 border-accent/30" animate={{ rotate: -360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
            <Brain className="absolute inset-0 m-auto w-10 h-10 text-primary" />
          </div>

          <motion.h2 className="font-heading text-2xl font-bold mb-2 text-foreground" animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }}>
            Neural Analysis in Progress
          </motion.h2>
          <p className="text-muted-foreground text-sm mb-10">Our AI is processing multimodal data patterns</p>

          <div className="relative flex items-center justify-between mb-10 px-4">
            <div className="absolute top-5 left-[12%] right-[12%] h-0.5 bg-border" />
            <motion.div className="absolute top-5 left-[12%] h-0.5 bg-primary" initial={{ width: "0%" }} animate={{ width: `${Math.min(progress, 100) * 0.76}%` }} transition={{ duration: 0.5 }} />
            {analysisSteps.map((s, i) => {
              const Icon = s.icon;
              const status = i < step ? "done" : i === step ? "active" : "pending";
              return (
                <div key={i} className="relative z-10 flex flex-col items-center gap-2 w-24">
                  <motion.div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    status === "done" ? "bg-success text-primary-foreground" : status === "active" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                    animate={status === "active" ? { boxShadow: ["0 0 0 0 hsl(var(--primary)/0.4)", "0 0 0 12px hsl(var(--primary)/0)", "0 0 0 0 hsl(var(--primary)/0.4)"] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {status === "done" ? <Check className="w-5 h-5" /> : status === "active" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
                  </motion.div>
                  <span className={`text-xs font-medium text-center leading-tight ${status === "pending" ? "text-muted-foreground" : "text-foreground"}`}>{s.label}</span>
                </div>
              );
            })}
          </div>

          <motion.div className="text-4xl font-heading font-bold text-primary" key={progress} initial={{ scale: 1.2, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }}>
            {progress}%
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

/* ─── Upload Card ─── */
const UploadZone = ({ type, cfg, files, dragOver, onDragOver, onDragLeave, onDrop, onSelect, onRemove }: {
  type: FileType;
  cfg: typeof fileConfig.audio;
  files: File[];
  dragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (idx: number) => void;
}) => {
  const Icon = cfg.icon;
  const hasFiles = files.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: type === "audio" ? 0.2 : type === "video" ? 0.35 : 0.5 }}
      className={`relative group rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-300 ${
        dragOver ? "border-primary bg-primary/5 scale-[1.02]" :
        hasFiles ? "border-success/50 bg-gradient-to-b from-success/5 to-transparent" : "border-border hover:border-primary/40 hover:shadow-lg"
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Animated icon background */}
      <motion.div
        className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
        style={{ background: `hsl(var(--${cfg.color}) / 0.1)` }}
        animate={hasFiles ? {} : { y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Icon className="w-8 h-8" style={{ color: `hsl(var(--${cfg.color}))` }} />
      </motion.div>

      <h3 className="font-heading font-bold text-foreground mb-1">{cfg.label}</h3>
      <p className="text-xs text-muted-foreground mb-4">{cfg.formats}</p>

      <label className="cursor-pointer">
        <input type="file" className="hidden" accept={cfg.accept} multiple={type === "image"} onChange={onSelect} />
        <Button variant="outline" size="sm" className="gap-1.5 pointer-events-none rounded-full px-5">
          <Upload className="w-3.5 h-3.5" />
          {hasFiles ? "Add More" : "Choose File" + (type === "image" ? "s" : "")}
        </Button>
      </label>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 space-y-1.5 overflow-hidden"
          >
            {files.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between text-xs rounded-lg px-3 py-2"
                style={{ background: `hsl(var(--${cfg.color}) / 0.08)` }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Check className="w-3 h-3 shrink-0" style={{ color: `hsl(var(--${cfg.color}))` }} />
                  <span className="truncate text-foreground">{f.name}</span>
                </div>
                <button onClick={() => onRemove(i)} className="text-muted-foreground hover:text-destructive ml-2 shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {hasFiles && (
        <motion.div
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground"
          style={{ background: `hsl(var(--${cfg.color}))` }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {files.length}
        </motion.div>
      )}
    </motion.div>
  );
};

/* ─── Main Page ─── */
const UploadSamples = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<Record<FileType, File[]>>({ audio: [], video: [], image: [] });
  const [dragOver, setDragOver] = useState<FileType | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const handleDrop = useCallback((type: FileType, e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    setFiles(f => ({ ...f, [type]: [...f[type], ...Array.from(e.dataTransfer.files)] }));
  }, []);

  const handleFileSelect = (type: FileType, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(f => ({ ...f, [type]: [...f[type], ...Array.from(e.target.files!)] }));
  };

  const removeFile = (type: FileType, idx: number) => {
    setFiles(f => ({ ...f, [type]: f[type].filter((_, i) => i !== idx) }));
  };

  const totalFiles = Object.values(files).flat().length;

  const handleAnalyze = () => {
    setAnalyzing(true);
    setStep(0);
    setProgress(0);
    let s = 0;
    const interval = setInterval(() => {
      s++;
      setProgress(s * 25);
      setStep(Math.min(s, 3));
      if (s >= 4) {
        clearInterval(interval);
        setTimeout(() => navigate("/results"), 800);
      }
    }, 1200);
  };

  if (analyzing) return <AnalysisScreen step={step} progress={progress} />;

  return (
    <div className="min-h-screen bg-background font-body relative overflow-hidden">
      <AppHeader />

      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute w-72 h-72 rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent)", top: "5%", right: "10%" }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div className="absolute w-56 h-56 rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, hsl(var(--accent)), transparent)", bottom: "15%", left: "5%" }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <main className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        {/* Hero section */}
        <motion.div
          className="flex flex-col md:flex-row items-center gap-6 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="shrink-0"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-accent/10 blur-xl scale-110" />
              <img src={uploadHero} alt="Child screening illustration" width={200} height={150} className="relative rounded-2xl" />
            </div>
          </motion.div>
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
              Upload Screening Samples
            </h1>
            <p className="text-muted-foreground text-sm max-w-lg">
              Our AI analyzes audio, video, and images to detect early signs of autism. Upload at least one file type to begin the neural screening process.
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-success" style={{ color: "hsl(var(--success))" }} />
                End-to-end encrypted
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                AI-powered analysis
              </div>
            </div>
          </div>
        </motion.div>

        {/* File count summary */}
        {totalFiles > 0 && (
          <motion.div
            className="mb-6 p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <span className="text-sm font-medium text-foreground">
              <span className="text-primary font-bold">{totalFiles}</span> file{totalFiles > 1 ? "s" : ""} ready for analysis
            </span>
            <Button variant="ghost" size="sm" onClick={() => setFiles({ audio: [], video: [], image: [] })} className="text-xs text-muted-foreground hover:text-destructive">
              Clear All
            </Button>
          </motion.div>
        )}

        {/* Upload zones */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {(Object.entries(fileConfig) as [FileType, typeof fileConfig.audio][]).map(([type, cfg]) => (
            <UploadZone
              key={type}
              type={type}
              cfg={cfg}
              files={files[type]}
              dragOver={dragOver === type}
              onDragOver={e => { e.preventDefault(); setDragOver(type); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => handleDrop(type, e)}
              onSelect={e => handleFileSelect(type, e)}
              onRemove={idx => removeFile(type, idx)}
            />
          ))}
        </div>

        {/* Accepted formats */}
        <div className="text-center text-xs text-muted-foreground mb-6">
          <strong>Accepted:</strong> Audio: MP3, WAV, M4A &nbsp;|&nbsp; Video: MP4, AVI, MOV &nbsp;|&nbsp; Image: JPG, PNG, BMP
        </div>

        {/* CTA */}
        <motion.div className="flex justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <Button
            onClick={handleAnalyze}
            disabled={totalFiles === 0}
            className="font-heading font-bold gap-2 px-10 h-12 text-base shadow-lg shadow-primary/20 rounded-full"
          >
            <Brain className="w-5 h-5" /> Proceed with Analysis →
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default UploadSamples;
