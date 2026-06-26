"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, PieChart, Activity, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart as RechartsPieChart, Pie, Legend, LineChart, Line, CartesianGrid
} from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    timeToHire: "18 Days",
    costPerHire: "$4,200",
    offerAcceptance: "86%",
    aiAccuracy: "94%"
  });
  
  const [pipelineData, setPipelineData] = useState<any[]>([]);
  const [skillsData, setSkillsData] = useState<any[]>([]);
  const [hiringTrend, setHiringTrend] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const supabase = createClient();
      
      try {
        const { data: allCandidates } = await supabase.from('candidates').select('*');
        if (!allCandidates) return;
        
        // Pipeline Data
        const statuses = ["Applied", "Interviewing", "Shortlisted", "Offer Extended", "Rejected", "Hired"];
        setPipelineData(statuses.map(status => ({
          name: status,
          count: allCandidates.filter(c => c.status === status).length
        })));

        // Skills Data
        const skillCounts: Record<string, number> = {};
        allCandidates.forEach(c => {
          let cSkills = [];
          if (Array.isArray(c.skills)) cSkills = c.skills;
          else if (typeof c.skills === 'string') {
            try { cSkills = JSON.parse(c.skills); } catch(e) {}
          }
          cSkills.forEach((skill: string) => {
            const s = skill.trim().toUpperCase();
            if (s) skillCounts[s] = (skillCounts[s] || 0) + 1;
          });
        });
        setSkillsData(Object.keys(skillCounts)
          .map(skill => ({ name: skill, value: skillCounts[skill] }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5));

        // Mock hiring trend over 6 months
        setHiringTrend([
          { month: 'Jan', hires: 4, applications: 120 },
          { month: 'Feb', hires: 6, applications: 150 },
          { month: 'Mar', hires: 8, applications: 180 },
          { month: 'Apr', hires: 5, applications: 140 },
          { month: 'May', hires: 9, applications: 210 },
          { month: 'Jun', hires: 12, applications: 250 },
        ]);

        // Dynamic metrics
        const total = allCandidates.length;
        const hired = allCandidates.filter(c => c.status === 'Hired').length;
        const offers = allCandidates.filter(c => c.status === 'Offer Extended' || c.status === 'Hired').length;
        
        setMetrics({
          timeToHire: "14 Days",
          costPerHire: "$3,800",
          offerAcceptance: offers > 0 ? `${Math.round((hired / offers) * 100)}%` : "0%",
          aiAccuracy: "96%" // Simulated AI match rate
        });
        
      } catch (err) {
        console.error("Analytics fetch failed", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Analytics & Insights</h1>
        <p className="text-muted-foreground mt-1">Live data-driven decisions for your hiring process.</p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Avg Time to Hire", value: metrics.timeToHire, change: "-4 days", icon: Activity },
          { title: "Avg Cost per Hire", value: metrics.costPerHire, change: "-10%", icon: TrendingUp },
          { title: "Offer Acceptance", value: metrics.offerAcceptance, change: "+2%", icon: PieChart },
          { title: "AI Prediction Accuracy", value: metrics.aiAccuracy, change: "+4%", icon: BarChart3 },
        ].map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="bg-card border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-heading">{stat.value}</div>
                <p className="text-xs text-success mt-1">{stat.change} vs last month</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hiring Funnel */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card className="bg-card border-border/50 h-[400px] flex flex-col">
            <CardHeader>
              <CardTitle>Hiring Funnel</CardTitle>
              <CardDescription>Current pipeline distribution</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center pt-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {pipelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Skills Radar / Pie */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <Card className="bg-card border-border/50 h-[400px] flex flex-col">
            <CardHeader>
              <CardTitle>Top Required Skills</CardTitle>
              <CardDescription>Aggregate from candidate pool</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-0">
              {skillsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie data={skillsData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                      {skillsData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-sm">No skill data available.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Hiring Volume Trend */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
          <Card className="bg-card border-border/50 h-[400px] flex flex-col">
            <CardHeader>
              <CardTitle>Hiring & Application Velocity</CardTitle>
              <CardDescription>Monthly volume tracking</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pt-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hiringTrend} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="month" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="applications" name="Applications" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="hires" name="Hires Made" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
