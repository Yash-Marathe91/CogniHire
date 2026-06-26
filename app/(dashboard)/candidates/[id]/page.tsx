"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Phone, MapPin, ExternalLink, Download, Star, Briefcase, GraduationCap, Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

export default function CandidateProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [candidate, setCandidate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidate = async () => {
      if (!id) return;
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("candidates")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching candidate:", error);
        } else {
          setCandidate(data);
        }
      } catch (err) {
        console.error("Failed to fetch candidate");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCandidate();
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    if (!id || !candidate) return;
    setIsUpdating(newStatus);
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("candidates")
        .update({ status: newStatus })
        .eq("id", id);
        
      if (error) throw error;
      
      // Update local state to reflect change immediately
      setCandidate({ ...candidate, status: newStatus });
      router.refresh(); // Refresh background data
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setIsUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh] w-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] w-full">
        <h2 className="text-2xl font-bold font-heading mb-2">Candidate Not Found</h2>
        <p className="text-muted-foreground mb-4">The candidate you are looking for does not exist.</p>
        <Link href="/candidates">
          <Button>Back to Candidates</Button>
        </Link>
      </div>
    );
  }

  // Parse skills safely
  const skills = Array.isArray(candidate.skills) 
    ? candidate.skills 
    : typeof candidate.skills === 'string' 
      ? JSON.parse(candidate.skills) 
      : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/candidates">
          <Button variant="ghost" size="icon" className="shrink-0 hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-bold">Candidate Profile</h1>
        </div>
        <div className="ml-auto flex gap-2">
          <Button 
            variant="outline" 
            className="border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            onClick={() => updateStatus('Rejected')}
            disabled={isUpdating !== null || candidate.status === 'Rejected'}
          >
            {isUpdating === 'Rejected' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
            {candidate.status === 'Rejected' ? 'Rejected' : 'Reject'}
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]"
            onClick={() => updateStatus('Interviewing')}
            disabled={isUpdating !== null || candidate.status === 'Interviewing' || candidate.status === 'Hired'}
          >
            {isUpdating === 'Interviewing' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            {candidate.status === 'Interviewing' ? 'Currently Interviewing' : 'Advance to Interview'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile & Contact */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="bg-card border-border/50 text-center pt-8 overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary/20 to-secondary/20" />
              <CardContent className="relative flex flex-col items-center">
                <Avatar className="h-24 w-24 border-4 border-card mb-4 relative z-10 shadow-lg">
                  <AvatarImage src={candidate.avatar_url} />
                  <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold font-heading">{candidate.name}</h2>
                <p className="text-muted-foreground">{candidate.role}</p>
                <Badge variant="outline" className={`mt-3 font-normal ${
                    candidate.status === 'Interviewing' ? 'bg-primary/10 text-primary border-primary/20' : 
                    candidate.status === 'Offer Extended' ? 'bg-success/10 text-success border-success/20' : 
                    candidate.status === 'Rejected' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                    'bg-muted text-muted-foreground border-border/50'
                  }`}>
                  {candidate.status}
                </Badge>
                
                <div className="w-full mt-8 pt-6 border-t border-border/50 space-y-4 text-sm text-left">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="h-4 w-4" /> {candidate.name.split(' ')[0].toLowerCase()}@example.com
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="h-4 w-4" /> +1 (555) 123-4567
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-4 w-4" /> Remote
                  </div>
                  <div className="flex items-center gap-3 text-primary hover:underline cursor-pointer">
                    <ExternalLink className="h-4 w-4" /> linkedin.com/in/{candidate.name.replace(/\s+/g, '').toLowerCase()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle>Resume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border border-border/50 rounded-lg flex items-center justify-between bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{candidate.name.replace(/\s+/g, '_')}_Resume.pdf</div>
                      <div className="text-xs text-muted-foreground">Updated recently</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column: AI Analysis & Details */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card border-border/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Star className="h-32 w-32 text-primary" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-success/20 flex items-center justify-center">
                    <Star className="h-3 w-3 text-success" />
                  </div>
                  AI Match Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-success/5 border border-success/20 rounded-lg">
                  <div>
                    <div className="text-3xl font-heading font-bold text-success">{candidate.match_score}%</div>
                    <div className="text-sm font-medium text-muted-foreground">Overall Match Score</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-heading font-bold">High</div>
                    <div className="text-sm text-muted-foreground">AI Confidence</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Top Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary" className="bg-muted px-3 py-1 font-normal">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-success/5 border border-success/10">
                    <h4 className="font-medium text-success mb-2 text-sm">Strengths</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Strong experience shown in resume</li>
                      <li>Skills match job requirements well</li>
                      <li>High overall AI fit</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-warning/5 border border-warning/10">
                    <h4 className="font-medium text-warning mb-2 text-sm">Areas for Growth</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Specific toolset may require onboarding</li>
                      <li>Further cultural fit interview needed</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-muted-foreground" /> Experience Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4 relative">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5 z-10 border border-primary/30">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{candidate.role} Experience</h4>
                    <div className="text-sm text-muted-foreground mb-2">{candidate.experience}</div>
                    <p className="text-sm leading-relaxed text-muted-foreground">Candidate demonstrates a solid background aligned with the {candidate.role} position. Their experience level makes them a {candidate.match_score > 85 ? 'strong' : 'potential'} fit for the team.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Temporary FileText component since it wasn't imported at top
function FileText(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}
