import { motion } from "framer-motion";
import { History, Download, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import AppHeader from "@/components/AppHeader";

const sessions = [
  { id: "AUT-1023", date: "2026-02-12", age: "4 yrs", score: 68, risk: "Moderate", modalities: "Audio, Video" },
  { id: "AUT-1023", date: "2026-03-05", age: "4 yrs", score: 62, risk: "Moderate", modalities: "Audio, Video, Image" },
  { id: "AUT-1023", date: "2026-04-01", age: "4 yrs", score: 55, risk: "Moderate", modalities: "Audio, Video" },
];

const trendData = [
  { session: "Session 1", score: 68, speech: 35, facial: 45, behavioral: 20 },
  { session: "Session 2", score: 62, speech: 30, facial: 40, behavioral: 22 },
  { session: "Session 3", score: 55, speech: 25, facial: 38, behavioral: 18 },
];

const HistoryReports = () => (
  <div className="min-h-screen bg-background font-body">
    <AppHeader />
    <main className="container mx-auto px-4 py-10 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading text-2xl font-bold flex items-center gap-2 text-foreground">
            <History className="w-6 h-6 text-primary" /> Screening History & Reports
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1"><Download className="w-4 h-4" /> Export CSV</Button>
            <Button size="sm" className="gap-1"><Download className="w-4 h-4" /> Export PDF</Button>
          </div>
        </div>

        {/* Trend Chart */}
        <Card className="border-none shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="font-heading text-base flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-success" /> Risk Score Trend
              <span className="text-xs font-normal text-success ml-2">↓ Improving</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="session" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 5 }} name="Overall Score" />
                <Line type="monotone" dataKey="speech" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3 }} name="Speech" />
                <Line type="monotone" dataKey="facial" stroke="hsl(var(--warning))" strokeWidth={2} dot={{ r: 3 }} name="Facial" />
                <Line type="monotone" dataKey="behavioral" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 3 }} name="Behavioral" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sessions Table */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="font-heading text-base">All Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Child ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Modalities</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((s, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{s.id}</TableCell>
                    <TableCell>{s.date}</TableCell>
                    <TableCell>{s.age}</TableCell>
                    <TableCell>
                      <span className={`font-bold ${s.score < 40 ? "text-success" : s.score < 70 ? "text-warning" : "text-destructive"}`}>
                        {s.score}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-primary-foreground ${
                        s.risk === "Low" ? "bg-success" : s.risk === "Moderate" ? "bg-warning" : "bg-destructive"
                      }`}>{s.risk}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.modalities}</TableCell>
                    <TableCell><Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  </div>
);

export default HistoryReports;
