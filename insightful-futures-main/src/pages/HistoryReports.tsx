import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { History, Download, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import AppHeader from "@/components/AppHeader";

interface Assessment {
  id: number;
  user_id: string;
  assessment_date: string;
  risk_score: number;
  interpretation: string;
  age_months: number;
  recommended_steps: string[];
}

const HistoryReports = () => {
  const [data, setData] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching history:", err);
        setLoading(false);
      });
  }, []);

  // Normalize score: API returns 0-1, display as 0-100
  const normalizeScore = (score: number) => {
    if (score <= 1) return Math.round(score * 100);
    return Math.round(score);
  };

  const getRiskLabel = (score: number) => {
    const s = normalizeScore(score);
    return s < 40 ? "Low" : s < 70 ? "Moderate" : "High";
  };

  const trendData = useMemo(() => {
    return [...data].reverse().map((item, index) => ({
      session: `Session ${index + 1}`,
      score: normalizeScore(item.risk_score),
      date: new Date(item.assessment_date).toLocaleDateString()
    }));
  }, [data]);

  const isImproving = useMemo(() => {
    if (trendData.length < 2) return false;
    return trendData[trendData.length - 1].score < trendData[0].score;
  }, [trendData]);

  const handleDownload = async (record: Assessment) => {
    try {
      const response = await fetch("/api/download_report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...record,
          risk_score: record.risk_score,
        })
      });
      if (!response.ok) throw new Error("Failed to generate report");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `History_Report_${record.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Error downloading report");
    }
  };

  const handleExportCSV = () => {
    if (data.length === 0) return;
    const headers = ["ID", "Date", "Age (Months)", "Score (%)", "Risk Level", "Interpretation"];
    const rows = data.map(s => [
      s.id,
      new Date(s.assessment_date).toLocaleDateString(),
      s.age_months || "N/A",
      normalizeScore(s.risk_score),
      getRiskLabel(s.risk_score),
      s.interpretation
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `screening_history_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background font-body">
      <AppHeader />
      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-2xl font-bold flex items-center gap-2 text-foreground">
              <History className="w-6 h-6 text-primary" /> Screening History & Reports
            </h2>
            {data.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1" onClick={handleExportCSV}>
                  <Download className="w-4 h-4" /> Export CSV
                </Button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border">
              <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading history...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No assessment history found. Run your first screening to see results here.</p>
            </div>
          ) : (
            <>
              {/* Trend Chart */}
              <Card className="border-none shadow-lg mb-8">
                <CardHeader>
                  <CardTitle className="font-heading text-base flex items-center gap-2">
                    {isImproving ? (
                      <>
                        <TrendingDown className="w-5 h-5 text-success" /> Risk Score Trend
                        <span className="text-xs font-normal text-success ml-2">↓ Improving</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-5 h-5 text-primary" /> Risk Score Trend
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="session" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value: number) => [`${value}%`, "Risk Score"]}
                        labelFormatter={(label: string) => {
                          const item = trendData.find(t => t.session === label);
                          return item ? `${label} (${item.date})` : label;
                        }}
                      />
                      <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 5
                       }} name="Risk Score" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Sessions Table */}
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="font-heading text-base">All Sessions ({data.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Age (Mo)</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Interpretation</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((s, idx) => {
                        const displayScore = normalizeScore(s.risk_score);
                        const riskLabel = getRiskLabel(s.risk_score);
                        return (
                          <TableRow key={s.id}>
                            <TableCell className="font-medium">{idx + 1}</TableCell>
                            <TableCell className="text-sm">{new Date(s.assessment_date).toLocaleDateString()}</TableCell>
                            <TableCell>{s.age_months || "N/A"}</TableCell>
                            <TableCell>
                              <span className={`font-bold ${displayScore < 40 ? "text-success" : displayScore < 70 ? "text-warning" : "text-destructive"}`}>
                                {displayScore}%
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-primary-foreground ${
                                riskLabel === "Low" ? "bg-success" : riskLabel === "Moderate" ? "bg-warning" : "bg-destructive"
                              }`}>{riskLabel}</span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{s.interpretation}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleDownload(s)}>
                                <Download className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default HistoryReports;
