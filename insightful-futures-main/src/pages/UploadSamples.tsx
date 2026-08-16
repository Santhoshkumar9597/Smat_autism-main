import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Video, Image, Upload, X, Check, Loader2, Brain, BarChart3, FileCheck, Play, Pause, AlertCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AppHeader from "@/components/AppHeader";
import { useToast } from "@/hooks/use-toast";

type FileType = "audio" | "video" | "image";

const fileConfig: Record<FileType, { icon: typeof Music; label: string; accept: string; formats: string }> = {
  audio: { icon: Music, label: "Child's Audio", accept: ".mp3,.wav,.m4a", formats: "MP3, WAV, M4A" },
  video: { icon: Video, label: "Behavioral Video", accept: ".mp4,.avi,.mov", formats: "MP4, AVI, MOV" },
  image: { icon: Image, label: "Child's Photos", accept: ".jpg,.jpeg,.png,.bmp", formats: "JPG, PNG, BMP" },
};

const analysisSteps = [
  { icon: Upload, label: "Uploading..." },
  { icon: FileCheck, label: "Preprocessing..." },
  { icon: Brain, label: "Neural Analysis..." },
  { icon: BarChart3, label: "Final Report..." },
];

const UploadSamples = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [files, setFiles] = useState<Record<FileType, File[]>>({ audio: [], video: [], image: [] });
  const [dragOver, setDragOver] = useState<FileType | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  
  // Preview States
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleFileSelect = async (type: FileType, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const file = selectedFiles[0];
      
      if (type === "audio") {
        setAudioUrl(URL.createObjectURL(file));
      } else if (type === "video") {
        setVideoUrl(URL.createObjectURL(file));
      }
      
      setFiles(f => ({ ...f, [type]: [...f[type], ...selectedFiles] }));
    }
  };

  const handleDrop = useCallback(async (type: FileType, e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    const dropped = Array.from(e.dataTransfer.files);
    const file = dropped[0];
    
    if (type === "audio") {
      setAudioUrl(URL.createObjectURL(file));
    } else if (type === "video") {
      setVideoUrl(URL.createObjectURL(file));
    }
    
    setFiles(f => ({ ...f, [type]: [...f[type], ...dropped] }));
  }, []);

  const removeFile = (type: FileType, idx: number) => {
    if (type === "audio") {
      setAudioUrl(null);
      setIsPlaying(false);
    } else if (type === "video") {
      setVideoUrl(null);
    }
    setFiles(f => ({ ...f, [type]: f[type].filter((_, i) => i !== idx) }));
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleAnalyze = async () => {
    if (files.audio.length === 0 || files.video.length === 0) {
      toast({ title: "Samples Missing", description: "At least one audio and one video are required.", variant: "destructive" });
      return;
    }

    setAnalyzing(true);
    setStep(0);
    setProgress(10);
    
    const formData = new FormData();
    formData.append("audio", files.audio[0]);
    formData.append("video", files.video[0]);
    
    try {
      setStep(1); setProgress(30);
      const response = await fetch("/api/predict", { method: "POST", body: formData });
      
      setStep(2); setProgress(70);
      if (!response.ok) throw new Error("Analysis failed.");

      const data = await response.json();
      setStep(3); setProgress(100);

      setTimeout(() => navigate("/results", { state: { predictionProps: data } }), 800);
    } catch (error: any) {
      toast({ title: "Analysis Error", description: error.message, variant: "destructive" });
      setAnalyzing(false);
    }
  };

  if (analyzing) {
    const orbColors = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--success))", "hsl(var(--warning))"];
    return (
      <div className="min-h-screen bg-background font-body relative overflow-hidden flex flex-col items-center justify-center">
        <AppHeader />
        
        {/* Ambient background blobs (Old Design) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent)", top: "10%", left: "20%" }}
            animate={{ scale: [1, 1.3, 1], x: [0, 40, 0], y: [0, -30, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, hsl(var(--accent)), transparent)", bottom: "10%", right: "15%" }}
            animate={{ scale: [1, 1.2, 1], x: [0, -30, 0], y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </div>

        <main className="container mx-auto px-4 py-16 max-w-2xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            {/* Central DNA-like animation (Old Design) */}
            <div className="relative w-40 h-40 mx-auto mb-10">
              {orbColors.map((color, i) => (
                <motion.div
                  key={i}
                  className="absolute w-5 h-5 rounded-full"
                  style={{ backgroundColor: color, left: "50%", top: "50%", marginLeft: -10, marginTop: -10 }}
                  animate={{
                    x: [Math.cos((i * Math.PI) / 2) * 50, Math.cos((i * Math.PI) / 2 + Math.PI) * 50, Math.cos((i * Math.PI) / 2) * 50],
                    y: [Math.sin((i * Math.PI) / 2) * 50, Math.sin((i * Math.PI) / 2 + Math.PI) * 50, Math.sin((i * Math.PI) / 2) * 50],
                    scale: [1, 1.4, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                />
              ))}
              <motion.div
                className="absolute inset-4 rounded-full border-2 border-primary/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-8 rounded-full border-2 border-accent/30"
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <Brain className="absolute inset-0 m-auto w-10 h-10 text-primary" />
            </div>

            <motion.h2
              className="font-heading text-2xl font-bold mb-2 text-foreground"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Neural Analysis in Progress
            </motion.h2>
            <p className="text-muted-foreground text-sm mb-12">Our AI is processing multimodal data patterns</p>

            {/* Timeline steps */}
            <div className="relative flex items-center justify-between mb-10 px-4">
              <div className="absolute top-5 left-[12%] right-[12%] h-0.5 bg-border" />
              <motion.div
                className="absolute top-5 left-[12%] h-0.5 bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: `${Math.min(progress, 100) * 0.76}%` }}
                transition={{ duration: 0.5 }}
              />
              {analysisSteps.map((s, i) => {
                const Icon = s.icon;
                const status = i < step ? "done" : i === step ? "active" : "pending";
                return (
                  <div key={i} className="relative z-10 flex flex-col items-center gap-2 w-24">
                    <motion.div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        status === "done" ? "bg-success text-primary-foreground" :
                        status === "active" ? "bg-primary text-primary-foreground" :
                        "bg-muted text-muted-foreground"
                      }`}
                      animate={status === "active" ? { boxShadow: ["0 0 0 0 hsl(var(--primary)/0.4)", "0 0 0 12px hsl(var(--primary)/0)", "0 0 0 0 hsl(var(--primary)/0.4)"] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {status === "done" ? <Check className="w-5 h-5" /> :
                       status === "active" ? <Loader2 className="w-5 h-5 animate-spin" /> :
                       <Icon className="w-5 h-5" />}
                    </motion.div>
                    <span className={`text-[10px] font-bold uppercase text-center leading-tight tracking-wider ${status === "pending" ? "text-muted-foreground" : "text-foreground"}`}>
                      {s.label.replace("...", "")}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Percentage */}
            <motion.div
              className="text-4xl font-black text-primary"
              key={progress}
              initial={{ scale: 1.2, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {progress}%
            </motion.div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-body">
      <AppHeader />
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3 uppercase">Smart Behavior Screening</h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm">Upload behavioral samples for AI-powered early autism screening. At least one audio and one video are required for multimodal analysis.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {(Object.entries(fileConfig) as [FileType, any][]).map(([type, cfg]) => {
            const Icon = cfg.icon;
            const hasFiles = files[type].length > 0;
            return (
              <div key={type} className="space-y-4">
                <Card
                  className={`border-2 border-dashed transition-all h-64 flex flex-col items-center justify-center p-6 bg-white relative ${
                    dragOver === type ? "border-primary bg-primary/5 shadow-inner scale-[0.98]" :
                    hasFiles ? "border-success bg-success/5" : "border-slate-200 hover:border-slate-300"
                  }`}
                  onDragOver={e => { e.preventDefault(); setDragOver(type); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={e => handleDrop(type, e)}
                >
                  <Icon className={`w-12 h-12 mb-4 ${hasFiles ? "text-success" : "text-slate-400"}`} />
                  <h3 className="font-bold text-slate-900 mb-1">{cfg.label}</h3>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-4">Supported: {cfg.formats}</p>
                  
                  <label className="cursor-pointer">
                    <input type="file" className="hidden" accept={cfg.accept} multiple={type === "image"} onChange={e => handleFileSelect(type, e)} />
                    <Button variant={hasFiles ? "secondary" : "outline"} size="sm" className="pointer-events-none gap-2 font-bold">
                      <Upload className="w-3.5 h-3.5" /> {hasFiles ? "Replace" : "Select File"}
                    </Button>
                  </label>

                  {hasFiles && (
                    <div className="absolute top-4 right-4 flex gap-1">
                      <button onClick={() => removeFile(type, 0)} className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-destructive shadow-sm">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </Card>

                {/* Audio Preview Feature */}
                {type === "audio" && audioUrl && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="bg-slate-900 rounded-2xl p-4 flex items-center gap-4 shadow-lg border border-slate-800">
                      <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0 hover:scale-105 transition-transform">
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Audio Preview</div>
                        <div className="text-xs text-white truncate font-medium">{files.audio[0].name}</div>
                      </div>
                      <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
                      <div className="text-[10px] font-bold text-primary flex items-center gap-1">
                        <Check className="w-3 h-3" /> READY
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Video Preview Feature (Added) */}
                {type === "video" && videoUrl && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                      <video src={videoUrl} controls className="w-full aspect-video bg-slate-100" />
                      <div className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-primary" />
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Visual Verification</span>
                        </div>
                        <div className="text-[10px] font-bold text-success uppercase tracking-widest">VALIDATED</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex items-start gap-4 mb-10 max-w-4xl mx-auto">
          <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-blue-900">Uploading Instructions</h4>
            <p className="text-xs text-blue-700/80 leading-relaxed font-medium">Please ensure the child's face is clearly visible in the video and the audio is recorded in a quiet environment. Video duration should be at least 5 seconds for accurate multimodal landmark tracking.</p>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={handleAnalyze} disabled={files.audio.length === 0 || files.video.length === 0} className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg gap-2 shadow-xl hover:shadow-2xl transition-all disabled:opacity-50">
            Proceed with AI Analysis <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </main>
    </div>
  );
};

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);

export default UploadSamples;
