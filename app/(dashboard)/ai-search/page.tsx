"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Zap, Star, FileText, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useBlindHiring } from "@/components/providers/BlindHiringProvider";
import Link from "next/link";

export default function AIMatchingPage() {
  const { isBlindMode } = useBlindHiring();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [error, setError] = useState("");

  const handleProcess = async () => {
    if (!jobDescription) return;
    
    setIsProcessing(true);
    setError("");
    setShowResults(false);
    
    try {
      const response = await fetch('/api/candidates/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: jobDescription }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze candidates');
      }
      
      // Map similarity to match_score for UI consistency
      const mappedCandidates = (data.candidates || []).map((c: any) => ({
        ...c,
        match_score: Math.round(c.similarity * 100),
        reasoning: "Matched via AI Semantic Search"
      }));
      
      setCandidates(mappedCandidates);
      setShowResults(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col lg:flex-row gap-6">
      {/* Left: Job Description Input */}
      <div className={`flex flex-col transition-all duration-500 ease-in-out ${showResults ? 'lg:w-1/3' : 'lg:w-1/2 lg:mx-auto'}`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-xl font-heading font-bold">Natural Language Search</h2>
        </div>
        
        <Card className="flex-1 bg-card border-border/50 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/20">
            <span className="text-sm font-medium text-muted-foreground">Ask AI for the perfect candidate</span>
          </div>
          <textarea 
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="e.g. Find React developers with AI experience and 3+ years of experience..."
            className="flex-1 w-full bg-transparent resize-none p-4 outline-none text-sm placeholder:text-muted-foreground/50"
          />
          {error && (
            <div className="px-4 pb-2 text-sm text-destructive">{error}</div>
          )}
          <div className="p-4 bg-muted/20 border-t border-border/50 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Powered by Gemini 2.5 Flash</span>
            <Button 
              onClick={handleProcess} 
              disabled={!jobDescription || isProcessing}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] transition-all"
            >
              {isProcessing ? (
               <span className="flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 animate-pulse" /> Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Find Matches
                </span>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* Center/Right: AI Processing & Results */}
      <AnimatePresence mode="wait">
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex-1 flex flex-col items-center justify-center relative"
          >
            <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <div className="absolute inset-4 rounded-full border-2 border-secondary/20 border-b-secondary animate-[spin_2s_linear_reverse]" />
                <BrainCircuit className="h-12 w-12 text-primary animate-pulse" />
              </div>
              <h3 className="text-2xl font-heading font-bold mt-8 mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Analyzing Candidates with Gemini...
              </h3>
              <div className="space-y-2 text-center text-sm text-muted-foreground">
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>Extracting key requirements...</motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>Evaluating candidate skills and experience...</motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>Generating AI insights...</motion.p>
              </div>
            </div>
          </motion.div>
        )}

        {showResults && !isProcessing && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-success/20 flex items-center justify-center">
                  <Star className="h-4 w-4 text-success" />
                </div>
                <h2 className="text-xl font-heading font-bold">Top Matches Found</h2>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {candidates.length} Candidates
              </Badge>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {candidates.map((candidate, i) => (
                <motion.div
                  key={candidate.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/candidates/${candidate.id || ''}`}>
                    <Card className="bg-card border-border/50 hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <Avatar className={`h-12 w-12 border border-border shrink-0 ${isBlindMode ? "blur-sm" : ""}`}>
                          <AvatarImage src={isBlindMode ? '' : candidate.avatar_url} />
                          <AvatarFallback className={isBlindMode ? "bg-muted text-muted-foreground" : ""}>
                            {isBlindMode ? 'C' : (candidate.name ? candidate.name.charAt(0) : 'U')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-lg group-hover:text-primary transition-colors truncate pr-4">
                              {isBlindMode ? `Candidate #${(candidate.id || '').substring(0, 5).toUpperCase()}` : candidate.name}
                            </h4>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted-foreground hidden sm:inline-block">AI Score</span>
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-success/30 bg-success/10 text-success font-bold text-sm">
                              {candidate.match_score}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1 truncate">{candidate.role}</p>
                        
                        {candidate.reasoning && (
                           <div className="text-xs text-primary/80 bg-primary/5 p-2 rounded mb-3 border border-primary/10">
                             <strong>AI Insight:</strong> {candidate.reasoning}
                           </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          {candidate.skills?.map((skill: string) => (
                            <Badge key={skill} variant="secondary" className="bg-muted text-[10px] font-normal">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="icon" className="hidden lg:flex self-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </CardContent>
                  </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
