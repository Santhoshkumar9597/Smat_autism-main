import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Heart, Star, Sparkles, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppHeader from "@/components/AppHeader";
import childImg from "@/assets/child-profile-bg.png";

const FloatingShape = ({ delay, x, y, size, color }: { delay: number; x: string; y: string; size: number; color: string }) => (
  <motion.div
    className="absolute rounded-full opacity-20 blur-sm"
    style={{ left: x, top: y, width: size, height: size, background: `hsl(var(--${color}))` }}
    animate={{ y: [0, -20, 0], scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
    transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

const StepIndicator = ({ step, total }: { step: number; total: number }) => (
  <div className="flex items-center gap-2 mb-6">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className="flex items-center gap-2">
        <motion.div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
          initial={{ scale: 0.8 }}
          animate={{ scale: i === step ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 2, repeat: i === step ? Infinity : 0 }}
        >
          {i + 1}
        </motion.div>
        {i < total - 1 && <div className={`w-12 h-0.5 ${i < step ? "bg-primary" : "bg-border"}`} />}
      </div>
    ))}
  </div>
);

const ChildProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    childName: "", age: "", gender: "", guardianName: "", guardianPhone: "", guardianEmail: "",
  });

  const childId = `AUT-${String(Math.floor(1000 + Math.random() * 9000))}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("childProfile", JSON.stringify({ ...form, childId, testDate: new Date().toISOString() }));
    navigate("/upload");
  };

  const filledFields = Object.values(form).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background font-body relative overflow-hidden">
      <AppHeader />

      {/* Floating decorative shapes */}
      <FloatingShape delay={0} x="5%" y="20%" size={80} color="primary" />
      <FloatingShape delay={1.5} x="85%" y="15%" size={60} color="accent" />
      <FloatingShape delay={0.8} x="90%" y="60%" size={100} color="success" />
      <FloatingShape delay={2} x="10%" y="70%" size={50} color="warning" />
      <FloatingShape delay={1} x="50%" y="85%" size={70} color="primary" />

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 30% 20%, hsl(var(--primary) / 0.04) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, hsl(var(--accent) / 0.04) 0%, transparent 50%)"
      }} />

      <main className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        <div className="grid lg:grid-cols-5 gap-8 items-start">

          {/* Left side — illustration + info */}
          <motion.div
            className="lg:col-span-2 flex flex-col items-center text-center lg:sticky lg:top-24"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="relative mb-6"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl scale-110" />
              <img src={childImg} alt="Happy child playing" width={280} height={280} className="relative rounded-2xl" />
            </motion.div>

            <h2 className="font-heading text-xl font-bold text-foreground mb-2">Every Child is Unique</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              Help us understand your child better so our AI can provide the most accurate screening.
            </p>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              {[
                { icon: Shield, label: "HIPAA Compliant", color: "primary" },
                { icon: Heart, label: "Child-Centered", color: "destructive" },
                { icon: Star, label: "AI-Powered", color: "warning" },
                { icon: Sparkles, label: "98% Accuracy", color: "success" },
              ].map(({ icon: Icon, label, color }, i) => (
                <motion.div
                  key={label}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border/50 shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <Icon className={`w-4 h-4 text-${color === "destructive" ? "destructive" : color}`} style={{ color: `hsl(var(--${color}))` }} />
                  <span className="text-xs font-medium text-foreground">{label}</span>
                </motion.div>
              ))}
            </div>

            {/* Progress ring */}
            <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <div className="relative w-20 h-20 mx-auto">
                <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--border))" strokeWidth="5" />
                  <motion.circle
                    cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--primary))" strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 34}
                    initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - filledFields / 6) }}
                    transition={{ duration: 0.4 }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">
                  {Math.round((filledFields / 6) * 100)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Profile Completion</p>
            </motion.div>
          </motion.div>

          {/* Right side — form */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-primary" /> Child Profile
                </h1>
                <p className="text-sm text-muted-foreground">ID: <span className="font-mono text-primary">{childId}</span></p>
              </div>
            </div>

            <StepIndicator step={0} total={3} />

            <Card className="border-none shadow-xl bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Child section */}
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <h3 className="font-heading font-semibold text-foreground">Child Information</h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Child's Name</Label>
                        <Input
                          required value={form.childName}
                          onChange={e => setForm(f => ({ ...f, childName: e.target.value }))}
                          placeholder="Enter child's name"
                          className="h-11 bg-background/50 border-border/60 focus:bg-background transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Age (Years)</Label>
                        <Input
                          required type="number" min={1} max={18} value={form.age}
                          onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                          placeholder="e.g. 4"
                          className="h-11 bg-background/50 border-border/60 focus:bg-background transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gender</Label>
                      <Select required value={form.gender} onValueChange={v => setForm(f => ({ ...f, gender: v }))}>
                        <SelectTrigger className="h-11 bg-background/50 border-border/60">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>

                  {/* Guardian section */}
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      <h3 className="font-heading font-semibold text-foreground">Guardian Information</h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Guardian Name</Label>
                        <Input
                          required value={form.guardianName}
                          onChange={e => setForm(f => ({ ...f, guardianName: e.target.value }))}
                          placeholder="Full name"
                          className="h-11 bg-background/50 border-border/60 focus:bg-background transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone Number</Label>
                        <Input
                          value={form.guardianPhone}
                          onChange={e => setForm(f => ({ ...f, guardianPhone: e.target.value }))}
                          placeholder="+91 ..."
                          className="h-11 bg-background/50 border-border/60 focus:bg-background transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</Label>
                      <Input
                        type="email" value={form.guardianEmail}
                        onChange={e => setForm(f => ({ ...f, guardianEmail: e.target.value }))}
                        placeholder="guardian@email.com"
                        className="h-11 bg-background/50 border-border/60 focus:bg-background transition-colors"
                      />
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                    <Button type="submit" className="w-full h-12 font-heading font-bold text-base gap-2 shadow-lg shadow-primary/20">
                      <Sparkles className="w-4 h-4" /> Continue to Upload Samples →
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Your data is encrypted and secure
                    </p>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ChildProfile;
