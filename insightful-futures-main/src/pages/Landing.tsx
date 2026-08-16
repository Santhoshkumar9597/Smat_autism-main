import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Upload, BarChart3, ArrowRight, Users, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AppHeader from "@/components/AppHeader";

const stats = [
  { value: "1 in 36", label: "Children diagnosed with ASD", icon: Users },
  { value: "4.5 yrs", label: "Average age of diagnosis", icon: Clock },
  { value: "85%+", label: "AI detection accuracy", icon: Shield },
];

const steps = [
  { icon: Users, title: "1. Create Profile", desc: "Enter child details — age, gender, guardian info" },
  { icon: Upload, title: "2. Upload Samples", desc: "Audio, video, or image sequences for analysis" },
  { icon: Brain, title: "3. AI Analysis", desc: "Multimodal deep learning processes inputs" },
  { icon: BarChart3, title: "4. Get Results", desc: "Risk score, modality breakdown, and recommendations" },
];

const Landing = () => (
  <div className="min-h-screen bg-background font-body flex flex-col">
    <AppHeader />
    
    {/* Hero Section (Synced from future folder) */}
    <section className="relative overflow-hidden bg-gradient-to-br from-medical-navy via-primary to-accent py-24 text-primary-foreground flex-1 flex items-center">
      <div className="container mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
          <Brain className="w-20 h-20 mx-auto mb-8 text-accent animate-pulse" />
          <h1 className="font-heading text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            Early Detection,<br />Brighter Futures.
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-10 text-primary-foreground/80 font-medium">
            Next-generation AI screening for autism using multimodal behavioral analysis. Specialized detection for early developmental milestones.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/profile">
              <Button size="lg" className="h-16 px-10 bg-accent text-accent-foreground font-bold text-lg gap-3 hover:bg-accent/90 shadow-2xl transition-all">
                Access Clinical Screening <ArrowRight className="w-6 h-6" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-accent/20 rounded-full blur-3xl pointer-events-none" />
    </section>

    {/* Quick Stats */}
    <section className="container mx-auto px-4 -mt-12 relative z-10 mb-20">
      <div className="grid md:grid-cols-3 gap-8">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.15 }}>
            <Card className="border-none shadow-2xl hover:translate-y-[-4px] transition-all">
              <CardContent className="flex items-center gap-6 p-8">
                <div className="w-14 h-14 rounded-2xl bg-medical-blue-light flex items-center justify-center">
                  <s.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <div className="font-heading text-3xl font-black text-slate-900">{s.value}</div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Methodology */}
    <section className="container mx-auto px-4 py-20 bg-white rounded-[40px] shadow-sm mb-20 border border-slate-100">
      <div className="text-center mb-16">
        <h2 className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-4">Scientific Process</h2>
        <h3 className="font-heading text-4xl font-black text-slate-900">How the Screening Works</h3>
      </div>
      <div className="grid md:grid-cols-4 gap-10">
        {steps.map((step, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.15 }}>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <step.icon className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-heading font-black text-slate-900 text-lg uppercase tracking-tight">{step.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Professional Footer */}
    <footer className="bg-medical-navy text-primary-foreground/40 text-center py-10 text-[10px] font-black uppercase tracking-[0.2em] border-t border-white/5">
      © 2026 Smart Autism Detection · AI Multimodal Verification · Clinical Grade Screening
    </footer>
  </div>
);

export default Landing;
