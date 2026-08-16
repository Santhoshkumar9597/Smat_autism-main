import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppHeader from "@/components/AppHeader";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const presetQuestions = [
  "What does moderate risk mean?",
  "What therapies can help?",
  "How to support my child?",
  "Should I see a specialist?",
];

const mockResponses: Record<string, string> = {
  "what does moderate risk mean?":
    "A **moderate risk score (50-70%)** means the AI detected some indicators consistent with ASD traits, but a definitive diagnosis requires professional evaluation. It's important to consult with a pediatrician or child psychologist for a comprehensive assessment using standardized tools like M-CHAT or ADOS.",
  "what therapies can help?":
    "Several evidence-based therapies can help:\n\n- **Applied Behavior Analysis (ABA)** — structured learning approach\n- **Speech-Language Therapy** — helps with communication skills\n- **Occupational Therapy** — improves daily living skills\n- **Social Skills Training** — helps with peer interaction\n- **Early Start Denver Model (ESDM)** — for toddlers\n\nThe best approach depends on the child's specific needs.",
  "how to support my child?":
    "Here are key ways to support your child:\n\n1. **Create routine** — Predictable schedules reduce anxiety\n2. **Use visual aids** — Picture schedules, social stories\n3. **Positive reinforcement** — Reward desired behaviors\n4. **Sensory-friendly environment** — Reduce overwhelming stimuli\n5. **Engage in play** — Follow the child's interests\n6. **Connect with support groups** — Share experiences with other parents",
  "should i see a specialist?":
    "**Yes, it's recommended.** Based on the screening results showing moderate risk indicators, you should:\n\n1. Schedule an appointment with a **developmental pediatrician**\n2. Request a referral for a **comprehensive diagnostic evaluation**\n3. Consider seeing a **child psychologist** for behavioral assessment\n\nEarly intervention leads to significantly better outcomes. Don't delay — even if it turns out to be a false positive, it's better to be evaluated.",
};

const getResponse = (q: string): string => {
  const key = q.toLowerCase().trim();
  for (const [k, v] of Object.entries(mockResponses)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return "Thank you for your question. Based on the screening results, I recommend consulting with a qualified healthcare professional who can provide personalized guidance. Early intervention is key — the sooner support begins, the better the outcomes for the child.";
};

const AIChatAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your **Autism Support Assistant**. I can help you understand the screening results and answer questions about next steps. What would you like to know?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages(m => [...m, { role: "user", content: text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages(m => [...m, { role: "assistant", content: getResponse(text) }]);
      setTyping(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background font-body">
      <AppHeader />
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <Card className="shadow-lg border-none h-[70vh] flex flex-col">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
            <CardTitle className="flex items-center gap-2 font-heading">
              <MessageCircle className="w-5 h-5" /> Autism Support Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}>
                    {msg.content.split(/(\*\*.*?\*\*)/).map((part, j) =>
                      part.startsWith("**") && part.endsWith("**")
                        ? <strong key={j}>{part.slice(2, -2)}</strong>
                        : part
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-accent" />
                    </div>
                  )}
                </motion.div>
              ))}
              {typing && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-xl px-4 py-3 text-sm text-muted-foreground">Typing...</div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Preset Questions */}
            <div className="px-4 py-2 flex flex-wrap gap-2 border-t">
              {presetQuestions.map(q => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors font-medium">
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t flex gap-2">
              <Input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage(input)}
                placeholder="Type your question..." className="flex-1" />
              <Button onClick={() => sendMessage(input)} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AIChatAssistant;
