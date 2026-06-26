"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Calendar, MapPin, Briefcase, Plus, MoreHorizontal, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

export default function JobDetailsPage() {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id) return;
      try {
        const supabase = createClient();
        
        // Fetch Job
        const { data: jobData, error: jobError } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", id)
          .single();

        if (jobError) throw jobError;
        setJob(jobData);

        // Fetch related candidates
        const { data: candidatesData, error: candidatesError } = await supabase
          .from("candidates")
          .select("*")
          .eq("job_id", id)
          .order("match_score", { ascending: false })
          .limit(5);

        if (!candidatesError && candidatesData) {
          setCandidates(candidatesData);
        }
      } catch (err) {
        console.error("Failed to fetch job details", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh] w-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] w-full">
        <h2 className="text-2xl font-bold font-heading mb-2">Job Not Found</h2>
        <p className="text-muted-foreground mb-4">The job posting you are looking for does not exist.</p>
        <Link href="/jobs">
          <Button>Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/jobs">
          <Button variant="ghost" size="icon" className="shrink-0 hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <Badge variant="outline" className={`mb-2 font-normal ${
            job.status === 'Active' ? 'bg-success/10 text-success border-success/20' : 
            job.status === 'Paused' ? 'bg-warning/10 text-warning border-warning/20' : 
            'bg-muted text-muted-foreground border-border/50'
          }`}>
            {job.status}
          </Badge>
          <h1 className="text-3xl font-heading font-bold">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {job.department}</span>
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Due {new Date(job.deadline).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" className="border-border/50">Edit Job</Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]">
            <Users className="h-4 w-4 mr-2" /> View All Applicants ({job.applicants_count})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                {job.description ? (
                  <p>{job.description}</p>
                ) : (
                  <>
                    <p>
                      We are looking for an experienced {job.title} to join our core product team. You will be responsible for architecting and building high-performance, scalable solutions for our platform.
                    </p>
                    <p>
                      In this role, you will work closely with our design and backend teams to implement seamless user experiences. 
                    </p>
                    <h4 className="font-medium text-foreground mt-4">Key Responsibilities:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Lead the development of complex features.</li>
                      <li>Optimize application performance and ensure responsive design.</li>
                      <li>Collaborate with product managers to define technical requirements.</li>
                      <li>Mentor junior engineers and conduct code reviews.</li>
                    </ul>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle>Skills & Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3 text-sm">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Team Player", "Problem Solving", "Communication", "Agile", "Git"].map(skill => (
                      <Badge key={skill} variant="secondary" className="bg-muted px-3 py-1 font-normal">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="bg-card border-border/50">
              <CardHeader className="pb-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <CardTitle>Top Candidates</CardTitle>
                  <Link href="/candidates" className="text-sm text-primary hover:underline">View All</Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {candidates.length > 0 ? (
                    candidates.map((candidate, i) => (
                      <Link href={`/candidates/${candidate.id}`} key={candidate.id || i}>
                        <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-border">
                              <AvatarImage src={candidate.avatar_url} />
                              <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">{candidate.name}</div>
                              <div className="text-xs text-muted-foreground">{candidate.role}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-center w-8 h-8 rounded-full border border-success/30 bg-success/10 text-success font-bold text-xs">
                            {candidate.match_score}
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      No candidates found for this position.
                    </div>
                  )}
                </div>
                <div className="p-4 text-center border-t border-border/50 bg-muted/10">
                  <Link href="/ai-search">
                    <Button variant="outline" className="w-full bg-transparent border-border/50 hover:bg-muted">
                      <Plus className="h-4 w-4 mr-2" /> Find More Matches
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
