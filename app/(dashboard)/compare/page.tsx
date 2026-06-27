"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Zap, Scale, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useBlindHiring } from "@/components/providers/BlindHiringProvider";

export default function ComparePage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<any | null>(null);
  
  const { isBlindMode } = useBlindHiring();

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('candidates')
      .select('id, name, role, skills, experience, avatar_url')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (error) {
      toast.error("Failed to load candidates");
    } else {
      setCandidates(data || []);
    }
    setIsLoading(false);
  };

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      if (selectedIds.length >= 3) {
        toast.error("You can only compare up to 3 candidates at once.");
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const runComparison = async () => {
    if (selectedIds.length < 2) {
      toast.error("Please select at least 2 candidates to compare.");
      return;
    }

    setIsComparing(true);
    setComparisonResult(null);
    
    try {
      const response = await fetch('/api/candidates/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateIds: selectedIds }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate comparison");
      }

      setComparisonResult(data.data);
      toast.success("AI Comparison Complete!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred.");
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Candidate Comparison</h1>
        <p className="text-muted-foreground mt-2">
          Select up to 3 candidates to generate a side-by-side AI matrix comparing their technical strengths, weaknesses, and overall fit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Candidate Selection Sidebar */}
        <Card className="col-span-1 border-muted bg-card/50 shadow-sm h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Select Candidates</CardTitle>
            <CardDescription>Choose 2-3 to compare</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              candidates.map((c) => (
                <div 
                  key={c.id} 
                  onClick={() => toggleSelection(c.id)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors border ${
                    selectedIds.includes(c.id) ? 'bg-primary/10 border-primary' : 'hover:bg-muted border-transparent'
                  }`}
                >
                  <Avatar className="h-10 w-10 border shadow-sm">
                    {isBlindMode ? (
                       <AvatarFallback className="bg-muted text-muted-foreground blur-[2px]">??</AvatarFallback>
                    ) : (
                       <>
                         <AvatarImage src={c.avatar_url || ''} />
                         <AvatarFallback>{c.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                       </>
                    )}
                  </Avatar>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">
                      {isBlindMode ? `Candidate ${c.id.substring(0, 4)}` : c.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{c.role}</p>
                  </div>
                  {selectedIds.includes(c.id) && <CheckCircle2 className="h-4 w-4 text-primary ml-auto flex-shrink-0" />}
                </div>
              ))
            )}
            
            <Button 
              className="w-full mt-4" 
              disabled={selectedIds.length < 2 || isComparing}
              onClick={runComparison}
            >
              {isComparing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
              ) : (
                <><Scale className="mr-2 h-4 w-4" /> Compare Selected</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Comparison Results Area */}
        <div className="col-span-1 md:col-span-3">
          {!comparisonResult && !isComparing && (
            <Card className="h-full min-h-[400px] border-dashed bg-transparent flex flex-col items-center justify-center text-center p-8">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Scale className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Awaiting Comparison</h3>
              <p className="text-muted-foreground max-w-sm">
                Select candidates from the left sidebar and click compare to generate an AI matrix.
              </p>
            </Card>
          )}

          {isComparing && (
            <Card className="h-full min-h-[400px] border-muted flex flex-col items-center justify-center text-center p-8">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI is analyzing candidates...</h3>
              <p className="text-muted-foreground">Evaluating tech stacks, experience, and cultural fit.</p>
            </Card>
          )}

          {comparisonResult && !isComparing && (
            <div className="space-y-6">
              {/* Recommendation Banner */}
              <Card className="bg-primary/5 border-primary/20 shadow-md">
                <CardContent className="p-6 flex gap-4 items-start">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-1">AI Final Recommendation</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {comparisonResult.recommendation}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Side-by-side Matrix */}
              <div className={`grid grid-cols-1 gap-4 ${comparisonResult.comparison.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                {comparisonResult.comparison.map((comp: any) => {
                  // Find the original candidate data to get avatar/role
                  const originalCandidate = candidates.find(c => c.id === comp.candidateId);
                  
                  return (
                    <Card key={comp.candidateId} className="border-muted shadow-sm hover:shadow-md transition-all">
                      <CardHeader className="text-center pb-4 border-b bg-card/50">
                        <Avatar className="h-16 w-16 mx-auto mb-3 border-2 shadow-sm">
                          {isBlindMode ? (
                            <AvatarFallback className="bg-muted text-muted-foreground blur-[2px]">??</AvatarFallback>
                          ) : (
                            <>
                              <AvatarImage src={originalCandidate?.avatar_url || ''} />
                              <AvatarFallback>{(comp.name || 'C').substring(0, 2).toUpperCase()}</AvatarFallback>
                            </>
                          )}
                        </Avatar>
                        <CardTitle className="text-lg">
                          {isBlindMode ? `Candidate ${comp.candidateId.substring(0, 4)}` : comp.name}
                        </CardTitle>
                        <CardDescription>{originalCandidate?.role || 'Professional'}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-4">
                        
                        <div>
                          <h4 className="text-sm font-semibold flex items-center gap-2 text-green-600 mb-2">
                            <CheckCircle2 className="h-4 w-4" /> Top Strengths
                          </h4>
                          <ul className="space-y-2">
                            {comp.pros.map((pro: string, i: number) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold flex items-center gap-2 text-red-500 mb-2 mt-4">
                            <XCircle className="h-4 w-4" /> Potential Risks
                          </h4>
                          <ul className="space-y-2">
                            {comp.cons.map((con: string, i: number) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-4 border-t mt-4">
                          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Best Fit For</h4>
                          <Badge variant="secondary" className="w-full justify-center py-1.5">
                            {comp.bestFitFor}
                          </Badge>
                        </div>
                        
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
