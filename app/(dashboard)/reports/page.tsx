"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, FileText, FileSpreadsheet, PieChart, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart as RechartsPieChart, Pie, Legend
} from "recharts";

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [pipelineData, setPipelineData] = useState<any[]>([]);
  const [skillsData, setSkillsData] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const supabase = createClient();
      
      try {
        // Fetch all candidates for processing
        const { data: allCandidates } = await supabase.from('candidates').select('*');
        if (!allCandidates) return;
        
        setCandidates(allCandidates);

        // Process Pipeline Data
        const statuses = ["Applied", "Interviewing", "Shortlisted", "Offer Extended", "Rejected", "Hired"];
        const pipeline = statuses.map(status => ({
          name: status,
          count: allCandidates.filter(c => c.status === status).length
        }));
        setPipelineData(pipeline);

        // Process Top Skills
        const skillCounts: Record<string, number> = {};
        allCandidates.forEach(c => {
          let cSkills = [];
          if (Array.isArray(c.skills)) {
            cSkills = c.skills;
          } else if (typeof c.skills === 'string') {
            try { cSkills = JSON.parse(c.skills); } catch(e) {}
          }
          
          cSkills.forEach((skill: string) => {
            const s = skill.trim().toUpperCase();
            if (s) {
              skillCounts[s] = (skillCounts[s] || 0) + 1;
            }
          });
        });

        const sortedSkills = Object.keys(skillCounts)
          .map(skill => ({ name: skill, value: skillCounts[skill] }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5); // Top 5 skills
          
        setSkillsData(sortedSkills);

      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const exportCSV = () => {
    if (candidates.length === 0) return;
    
    const headers = ["ID", "Name", "Role", "Status", "Match Score", "Applied Date"];
    const csvContent = [
      headers.join(","),
      ...candidates.map(c => 
        [c.id, `"${c.name}"`, `"${c.role}"`, c.status, c.match_score, new Date(c.created_at).toLocaleDateString()].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CogniHire_Candidates_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    window.print();
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh] w-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 report-container">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-1">Exportable metrics and insights for your hiring pipeline.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} className="border-border/50 bg-background hover:bg-muted">
            <FileSpreadsheet className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Button onClick={exportPDF} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]">
            <FileText className="h-4 w-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card border-border/50 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Hiring Funnel
              </CardTitle>
              <CardDescription>Candidate progression across all active jobs.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {pipelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-card border-border/50 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" /> Top Skills in Pool
              </CardTitle>
              <CardDescription>Most common skills across all candidate resumes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4 flex items-center justify-center">
                {skillsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={skillsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {skillsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-muted-foreground text-sm">No skills data available.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .report-container, .report-container * {
            visibility: visible;
          }
          .report-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
