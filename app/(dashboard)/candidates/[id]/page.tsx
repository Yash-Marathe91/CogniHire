"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Phone, MapPin, ExternalLink, Download, Star, Briefcase, GraduationCap, Loader2, CheckCircle2, XCircle, FileText } from "lucide-react";
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

  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    // existing effect code omitted as it's already updated above

    const fetchCandidate = async () => {
      if (!id) return;
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("candidates")
          .select("*, candidate_experience(*), candidate_education(*), resume_files(*), applications(id, ai_evaluations(*))")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching candidate:", error);
        } else {
          // Sort experience by start date descending
          if (data.candidate_experience) {
            data.candidate_experience.sort((a: any, b: any) => new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime());
          }
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
      
      setCandidate({ ...candidate, status: newStatus });
      router.refresh();
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

  const skills = Array.isArray(candidate.skills) 
    ? candidate.skills 
    : typeof candidate.skills === 'string' 
      ? JSON.parse(candidate.skills) 
      : [];

  const runEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch(`/api/candidates/${id}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Evaluation failed");
      router.refresh(); // Refresh page to get new evaluations
      // Re-fetch locally
      const supabase = createClient();
      const { data } = await supabase
          .from("candidates")
          .select("*, candidate_experience(*), candidate_education(*), resume_files(*), applications(id, ai_evaluations(*))")
          .eq("id", id)
          .single();
      setCandidate(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const resume = candidate.resume_files && candidate.resume_files.length > 0 
    ? candidate.resume_files[0] 
    : null;
    
  // Extract AI Evaluation if it exists
  let aiEval = null;
  if (candidate.applications && candidate.applications.length > 0) {
    const evals = candidate.applications[0].ai_evaluations;
    if (evals && evals.length > 0) {
      aiEval = evals[0];
    }
  }

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
                    <Mail className="h-4 w-4" /> {candidate.email || `${candidate.name.split(' ')[0].toLowerCase()}@example.com`}
                  </div>
                  {candidate.phone && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Phone className="h-4 w-4" /> {candidate.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {candidate.location || 'Remote'}
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
                {resume ? (
                  <div className="p-4 border border-border/50 rounded-lg flex items-center justify-between bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-medium text-sm truncate">{resume.file_url.split('/').pop()}</div>
                        <div className="text-xs text-muted-foreground">Uploaded {new Date(resume.uploaded_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <Link href={resume.file_url} target="_blank">
                      <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border/50 rounded-lg">
                    No resume on file.
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column: AI Analysis & Details */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card border-border/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Star className="h-32 w-32 text-primary" />
              </div>
              <CardHeader className="flex flex-row justify-between items-center z-10 relative">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-success/20 flex items-center justify-center">
                    <Star className="h-3 w-3 text-success" />
                  </div>
                  AI Match Analysis
                </CardTitle>
                {!aiEval && (
                  <Button 
                    onClick={runEvaluation} 
                    disabled={isEvaluating}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_-5px_rgba(59,130,246,0.5)]"
                  >
                    {isEvaluating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Star className="h-4 w-4 mr-2" />}
                    {isEvaluating ? "Analyzing..." : "Run AI Match"}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <div className="flex items-center justify-between p-4 bg-success/5 border border-success/20 rounded-lg">
                  <div>
                    <div className="text-3xl font-heading font-bold text-success">{aiEval ? aiEval.match_score : candidate.match_score}%</div>
                    <div className="text-sm font-medium text-muted-foreground">Overall Match Score</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-heading font-bold">{aiEval ? "High" : "Pending"}</div>
                    <div className="text-sm text-muted-foreground">AI Confidence</div>
                  </div>
                </div>
                
                {aiEval && (
                  <div className="p-4 rounded-lg bg-muted/20 border border-border/50 text-sm text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">AI Summary:</strong> {aiEval.explanation}
                  </div>
                )}
                
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

                {aiEval ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-success/5 border border-success/10">
                      <h4 className="font-medium text-success mb-2 text-sm">Strengths</h4>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        {aiEval.strengths.map((str: string, i: number) => <li key={i}>{str}</li>)}
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg bg-warning/5 border border-warning/10">
                      <h4 className="font-medium text-warning mb-2 text-sm">Areas for Growth</h4>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        {aiEval.weaknesses.map((wk: string, i: number) => <li key={i}>{wk}</li>)}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 border border-dashed border-border/50 rounded-lg bg-muted/10">
                    <Star className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                    <h4 className="font-medium">No AI Match Data Yet</h4>
                    <p className="text-sm text-muted-foreground">Click "Run AI Match" above to evaluate this candidate against the job profile using Gemini 2.5 Flash.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-muted-foreground" /> Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {candidate.candidate_experience && candidate.candidate_experience.length > 0 ? (
                  candidate.candidate_experience.map((exp: any, i: number) => (
                    <div key={exp.id} className="flex gap-4 relative group">
                      {i !== candidate.candidate_experience.length - 1 && (
                        <div className="absolute left-3 top-8 bottom-[-24px] w-px bg-border/50 group-hover:bg-primary/30 transition-colors" />
                      )}
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 z-10 border border-primary/20">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{exp.role}</h4>
                        <div className="text-sm text-primary mb-1">{exp.company_name}</div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {exp.start_date ? new Date(exp.start_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Unknown'} - 
                          {exp.is_current ? ' Present' : exp.end_date ? ` ${new Date(exp.end_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}` : ' Unknown'}
                        </div>
                        {exp.description && (
                          <p className="text-sm leading-relaxed text-muted-foreground">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No experience records found.</div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" /> Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {candidate.candidate_education && candidate.candidate_education.length > 0 ? (
                  candidate.candidate_education.map((edu: any, i: number) => (
                    <div key={edu.id} className="flex gap-4 relative group">
                      {i !== candidate.candidate_education.length - 1 && (
                        <div className="absolute left-3 top-8 bottom-[-24px] w-px bg-border/50 group-hover:bg-primary/30 transition-colors" />
                      )}
                      <div className="h-6 w-6 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 mt-0.5 z-10 border border-secondary/20">
                        <div className="h-2 w-2 rounded-full bg-secondary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}</h4>
                        <div className="text-sm text-foreground mb-1">{edu.institution}</div>
                        <div className="text-xs text-muted-foreground">
                          {edu.start_date ? new Date(edu.start_date).toLocaleDateString(undefined, { year: 'numeric' }) : ''} 
                          {edu.start_date && edu.end_date ? ' - ' : ''}
                          {edu.end_date ? new Date(edu.end_date).toLocaleDateString(undefined, { year: 'numeric' }) : ''}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No education records found.</div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
