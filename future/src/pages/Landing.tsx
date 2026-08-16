import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Upload, BarChart3, MessageCircle, ArrowRight, Users, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
  <div className="min-h-screen bg-background font-body">
    {/* Hero */}
    <section className="relative overflow-hidden bg-gradient-to-br from-medical-navy via-primary to-accent py-20 text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Brain className="w-16 h-16 mx-auto mb-6 text-accent" />
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold mb-4">
            Smart Autism Detection System
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-primary-foreground/80">
            AI-powered multimodal screening using speech, facial expression, and behavioral analysis for early autism detection.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-accent text-accent-foreground font-heading font-bold text-base px-8 gap-2 hover:bg-accent/90">
              Start Screening <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>

    {/* Stats */}
    <section className="container mx-auto px-4 -mt-10 relative z-10">
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}>
            <Card className="border-none shadow-lg">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 rounded-full bg-medical-blue-light flex items-center justify-center">
                  <s.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-heading text-2xl font-bold text-foreground">{s.value}</div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>

    {/* How it works */}
    <section className="container mx-auto px-4 py-20">
      <h2 className="font-heading text-3xl font-bold text-center mb-12 text-foreground">How It Works</h2>
      <div className="grid md:grid-cols-4 gap-8">
        {steps.map((step, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.15 }}>
            <Card className="text-center border-none shadow-md hover:shadow-xl transition-shadow h-full">
              <CardContent className="p-6 flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Footer */}
    <footer className="bg-medical-navy text-primary-foreground/60 text-center py-6 text-sm">
      © 2026 Smart Autism Detection System · Powered by AI Technology
    </footer>
  </div>
);

export default Landing;
