"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Filter, MoreHorizontal, Download, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

// Define the Candidate type based on our new Supabase schema
type Candidate = {
  id: string;
  name: string;
  role: string;
  experience: string;
  match_score: number;
  status: string;
  location: string;
  avatar_url: string;
  skills: string[];
};

const STATUS_FILTERS = ["All", "Applied", "Interviewing", "Shortlisted", "Offer Extended", "Rejected", "Hired"];

export default function CandidatesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("candidates")
          .select("*")
          .order("match_score", { ascending: false });

        if (error) {
          console.error("Error fetching candidates:", error.message);
          return;
        }

        if (data) {
          setCandidates(data);
        }
      } catch (err) {
        console.error("Failed to fetch candidates");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const filtered = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.role.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Candidates</h1>
          <p className="text-muted-foreground mt-1">Manage and track your talent pipeline.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border/50 hover:bg-muted">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Link href="/candidates/add">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]">
              <Plus className="h-4 w-4 mr-2" /> Add Candidate
            </Button>
          </Link>
        </div>
      </div>

      <Card className="bg-card border-border/50">
        <div className="p-4 border-b border-border/50 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
          <div className="relative w-full xl:w-96 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or role..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-input/50 border-border/50 focus:border-primary w-full"
            />
          </div>
          <div className="flex gap-2 w-full overflow-x-auto pb-2 xl:pb-0 custom-scrollbar hide-scroll-bar">
            {STATUS_FILTERS.map(status => (
              <Button 
                key={status}
                variant={statusFilter === status ? "default" : "outline"} 
                size="sm" 
                onClick={() => setStatusFilter(status)}
                className={`whitespace-nowrap ${statusFilter === status ? 'shadow-md shadow-primary/20' : 'border-border/50 hover:bg-muted'}`}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground space-y-4">
              <p>No candidates found in database.</p>
              <p className="text-sm">Run the SQL schema in Supabase and add some seed data!</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground space-y-4">
              <p>No candidates match your search filters.</p>
              <Button variant="link" onClick={() => { setSearch(''); setStatusFilter('All'); }}>Clear Filters</Button>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Candidate</th>
                  <th className="px-6 py-4 font-medium">Experience</th>
                  <th className="px-6 py-4 font-medium hidden md:table-cell">Skills</th>
                  <th className="px-6 py-4 font-medium">Match</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((candidate, i) => (
                  <motion.tr 
                    key={candidate.id}
                    onClick={() => router.push(`/candidates/${candidate.id}`)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarImage src={candidate.avatar_url} />
                          <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground group-hover:text-primary transition-colors">{candidate.name}</div>
                          <div className="text-xs text-muted-foreground">{candidate.role} • {candidate.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {candidate.experience}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {candidate.skills && candidate.skills.slice(0, 3).map((skill: string) => (
                          <Badge key={skill} variant="secondary" className="bg-muted/50 text-[10px] px-1.5 py-0 font-normal">
                            {skill}
                          </Badge>
                        ))}
                        {candidate.skills && candidate.skills.length > 3 && (
                          <Badge variant="secondary" className="bg-muted/50 text-[10px] px-1.5 py-0 font-normal">
                            +{candidate.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div className="bg-success h-full rounded-full" style={{ width: `${candidate.match_score}%` }} />
                        </div>
                        <span className="text-xs font-medium text-success">{candidate.match_score}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-normal">
                        {candidate.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="p-4 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {filtered.length} entries</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled className="border-border/50 h-8">Previous</Button>
            <Button variant="outline" size="sm" className="bg-primary/10 text-primary border-primary/20 h-8">1</Button>
            <Button variant="outline" size="sm" className="border-border/50 h-8">Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
