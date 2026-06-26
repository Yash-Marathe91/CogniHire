"use client";

import { motion } from "framer-motion";
import { X, Search, ChevronDown, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function CandidateComparisonPage() {
  const candidates = [
    {
      id: "1",
      name: "Alex Mercer",
      role: "Senior Frontend Engineer",
      avatar: "https://i.pravatar.cc/150?u=4",
      overall: 98,
      metrics: { technical: 95, experience: 100, education: 90, communication: 85, leadership: 90, culture: 95 },
      skills: ["React", "Next.js", "TypeScript"],
    },
    {
      id: "2",
      name: "Samantha Lee",
      role: "Lead React Developer",
      avatar: "https://i.pravatar.cc/150?u=5",
      overall: 94,
      metrics: { technical: 98, experience: 90, education: 100, communication: 95, leadership: 85, culture: 90 },
      skills: ["React", "TypeScript", "Node.js"],
    }
  ];

  const metricsList = [
    { key: "technical", label: "Technical Skills" },
    { key: "experience", label: "Experience Match" },
    { key: "education", label: "Education Level" },
    { key: "communication", label: "Communication" },
    { key: "leadership", label: "Leadership" },
    { key: "culture", label: "Culture Fit" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Candidate Comparison</h1>
          <p className="text-muted-foreground mt-1">Compare candidates side-by-side to make the best hiring decision.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Search className="h-4 w-4 mr-2" /> Add Candidate to Compare
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {candidates.map((candidate, i) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-card border-border/50 relative overflow-hidden">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                <X className="h-4 w-4" />
              </Button>
              <CardHeader className="text-center pb-2">
                <Avatar className="h-20 w-20 mx-auto border-2 border-card mb-2">
                  <AvatarImage src={candidate.avatar} />
                  <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{candidate.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{candidate.role}</p>
                <div className="mt-4">
                  <div className="inline-flex flex-col items-center justify-center p-3 rounded-full border-2 border-success/30 bg-success/10 text-success h-20 w-20">
                    <span className="text-2xl font-bold font-heading leading-none">{candidate.overall}</span>
                    <span className="text-[10px] font-medium uppercase mt-1">Score</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 mt-4">
                <div>
                  <h4 className="text-sm font-medium mb-3">Key Metrics</h4>
                  <div className="space-y-4">
                    {metricsList.map(metric => (
                      <div key={metric.key} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{metric.label}</span>
                          <span className="font-medium">{(candidate.metrics as any)[metric.key]}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${(candidate.metrics as any)[metric.key]}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-3">Top Skills</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {candidate.skills.map(skill => (
                      <Badge key={skill} variant="secondary" className="bg-muted px-2 py-0.5 font-normal text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        
        {/* Placeholder for adding more candidates */}
        {candidates.length < 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="h-full min-h-[500px]">
            <button className="w-full h-full border-2 border-dashed border-border/50 rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/10 hover:border-primary/50 hover:text-primary transition-all group">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Plus className="h-6 w-6" />
              </div>
              <span className="font-medium">Add Candidate</span>
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Re-using Plus icon here just in case it wasn't imported properly
function Plus(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  );
}
