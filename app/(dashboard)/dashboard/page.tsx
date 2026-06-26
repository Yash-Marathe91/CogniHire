"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Briefcase, Zap, TrendingUp, MoreHorizontal, ArrowUpRight, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { CreateJobModal } from "@/components/create-job-modal";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState([
    { name: "Total Candidates", value: "-", icon: Users, change: "+0%", trend: "up" },
    { name: "Active Jobs", value: "-", icon: Briefcase, change: "+0", trend: "up" },
    { name: "AI Matches", value: "-", icon: Zap, change: "+0%", trend: "up" },
    { name: "Hiring Rate", value: "18.4%", icon: TrendingUp, change: "+4.1%", trend: "up" },
  ]);
  
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const supabase = createClient();
      
      try {
        // Fetch Total Candidates
        const { count: candidatesCount } = await supabase
          .from('candidates')
          .select('*', { count: 'exact', head: true });

        // Fetch Active Jobs
        const { count: activeJobsCount } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Active');

        // Fetch AI Matches (>80%)
        const { count: matchesCount } = await supabase
          .from('candidates')
          .select('*', { count: 'exact', head: true })
          .gte('match_score', 80);

        setStats([
          { name: "Total Candidates", value: (candidatesCount || 0).toLocaleString(), icon: Users, change: "+14%", trend: "up" },
          { name: "Active Jobs", value: (activeJobsCount || 0).toLocaleString(), icon: Briefcase, change: "+2", trend: "up" },
          { name: "AI Matches", value: (matchesCount || 0).toLocaleString(), icon: Zap, change: "+24%", trend: "up" },
          { name: "Hiring Rate", value: "18.4%", icon: TrendingUp, change: "+4.1%", trend: "up" },
        ]);

        // Fetch Pipeline Chart Data
        const statuses = ["Applied", "Interviewing", "Shortlisted", "Offer Extended", "Rejected", "Hired"];
        const pipelineCounts = await Promise.all(
          statuses.map(async (status) => {
            const { count } = await supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('status', status);
            return { name: status, count: count || 0 };
          })
        );
        setChartData(pipelineCounts);

        // Fetch Recent Activity
        const { data: latestCandidates } = await supabase
          .from('candidates')
          .select('id, name, role, created_at, avatar_url, jobs(title)')
          .order('created_at', { ascending: false })
          .limit(5);

        if (latestCandidates) {
          setRecentActivity(
            latestCandidates.map(c => ({
              id: c.id,
              user: c.name,
              action: `applied for`,
              role: (c.jobs as any)?.title || c.role,
              time: new Date(c.created_at).toLocaleDateString(),
              avatar: c.avatar_url,
              isAI: false
            }))
          );
        }
      } catch (err) {
        console.error("Dashboard data fetch failed", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your hiring pipeline today.</p>
        </div>
        <CreateJobModal />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-card border-border/50 hover:border-primary/30 transition-colors relative overflow-hidden group h-full">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <stat.icon className="w-16 h-16 text-primary" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mt-1" />
                ) : (
                  <>
                    <div className="text-3xl font-bold font-heading">{stat.value}</div>
                    <div className="flex items-center text-xs mt-1 text-success">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      {stat.change} from last month
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Overview Chart */}
        <Card className="lg:col-span-2 bg-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <div>
              <CardTitle>Pipeline Overview</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Candidates across all active jobs</p>
            </div>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-5 w-5 text-muted-foreground" /></Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
               <div className="h-[300px] w-full flex items-center justify-center">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
               </div>
            ) : chartData.every(d => d.count === 0) ? (
              <div className="h-[300px] w-full flex items-center justify-center border border-dashed border-border/50 rounded-lg bg-muted/20">
                <span className="text-sm text-muted-foreground">No pipeline data available yet.</span>
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                      itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'Rejected' ? 'hsl(var(--destructive)/0.5)' : entry.name === 'Hired' ? 'hsl(var(--success))' : 'hsl(var(--primary))'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border-border/50 flex flex-col">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  No activity found.
                </div>
              ) : (
                recentActivity.map((activity, i) => (
                  <motion.div 
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                    className="flex gap-4 relative"
                  >
                    {i !== recentActivity.length - 1 && (
                      <div className="absolute left-4 top-10 bottom-[-24px] w-px bg-border/50" />
                    )}
                    
                    {activity.isAI ? (
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 relative z-10 shadow-[0_0_10px_-2px_rgba(59,130,246,0.5)]">
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                    ) : (
                      <Avatar className="h-8 w-8 shrink-0 relative z-10 border border-border">
                        <AvatarImage src={activity.avatar || ''} />
                        <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium text-foreground">{activity.user}</span>{" "}
                        <span className="text-muted-foreground">{activity.action}</span>{" "}
                        <span className="font-medium text-primary cursor-pointer hover:underline">{activity.role}</span>
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.time}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
