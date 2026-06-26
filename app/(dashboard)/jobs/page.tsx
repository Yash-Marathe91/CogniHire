"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, Users, Calendar, MoreVertical, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { CreateJobModal } from "@/components/create-job-modal";
import Link from "next/link";

// Define Job type based on Supabase schema
type Job = {
  id: string;
  title: string;
  department: string;
  applicants_count: number;
  status: string;
  deadline: string;
  type: string;
  location: string;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching jobs:", error.message);
          return;
        }

        if (data) {
          setJobs(data);
        }
      } catch (err) {
        console.error("Failed to fetch jobs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Job Openings</h1>
          <p className="text-muted-foreground mt-1">Manage active listings and track applicants.</p>
        </div>
        <CreateJobModal />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[400px] text-muted-foreground w-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground space-y-4 border border-dashed border-border/50 rounded-xl">
          <Briefcase className="h-12 w-12 text-muted-foreground/50" />
          <p>No job postings found.</p>
          <p className="text-sm">Create your first job or run the provided SQL script to insert seed data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/jobs/${job.id}`}>
                <Card className="bg-card border-border/50 hover:border-primary/50 transition-colors group flex flex-col h-full">
                  <CardHeader className="pb-3 flex-row items-start justify-between">
                    <div>
                      <Badge variant="outline" className={`mb-2 font-normal ${
                        job.status === 'Active' ? 'bg-success/10 text-success border-success/20' : 
                        job.status === 'Paused' ? 'bg-warning/10 text-warning border-warning/20' : 
                        'bg-muted text-muted-foreground border-border/50'
                      }`}>
                        {job.status}
                      </Badge>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">{job.title}</CardTitle>
                      <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <Briefcase className="h-3 w-3" /> {job.department}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2 text-muted-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  
                  <CardContent className="flex-1 pb-4">
                    <div className="flex flex-wrap gap-4 mt-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border/50">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">{job.applicants_count}</span> applicants
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border/50">
                        <Calendar className="h-4 w-4" />
                        Due {new Date(job.deadline).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border/50 flex justify-between text-sm text-muted-foreground">
                      <span>{job.type}</span>
                      <span>{job.location}</span>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-0 gap-2">
                    <Button variant="outline" className="w-full bg-transparent border-border/50 hover:bg-muted">Edit</Button>
                    <Button variant="outline" className="w-full bg-transparent border-border/50 hover:bg-muted text-destructive hover:text-destructive">Archive</Button>
                  </CardFooter>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
