"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UploadCloud, FileText, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AddCandidatePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus("idle");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("resume", file);
      // If we had a job selection dropdown, we could append it here: formData.append("jobId", selectedJobId)

      const response = await fetch("/api/candidates/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload and parse resume");
      }

      setUploadStatus("success");
      
      // Redirect to candidate profile after 2 seconds
      setTimeout(() => {
        router.push(`/candidates/${data.candidateId}`);
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setUploadStatus("error");
      setErrorMessage(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/candidates">
          <Button variant="ghost" size="icon" className="shrink-0 hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-bold">Add Candidate</h1>
          <p className="text-muted-foreground mt-1">Upload a resume and let AI parse the details automatically.</p>
        </div>
      </div>

      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle>Resume Upload</CardTitle>
          <CardDescription>We accept PDF, DOCX, and TXT files up to 5MB.</CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all ${
              isDragging ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50 hover:bg-muted/10"
            } ${uploadStatus === "success" ? "border-success bg-success/5" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {uploadStatus === "success" ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                <div className="h-16 w-16 bg-success/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-1">Resume Parsed Successfully!</h3>
                <p className="text-muted-foreground text-sm">Redirecting to candidate profile...</p>
              </motion.div>
            ) : isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h3 className="text-xl font-bold font-heading mb-1">Parsing Resume via AI...</h3>
                <p className="text-muted-foreground text-sm">Extracting experience, education, and skills.</p>
              </div>
            ) : file ? (
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold font-heading mb-1">{file.name}</h3>
                <p className="text-muted-foreground text-sm mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setFile(null)} className="border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30">
                    Remove
                  </Button>
                  <Button onClick={handleUpload} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]">
                    Process Resume
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-2">Drag & Drop Resume Here</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                  Or click the button below to select a file from your computer. Our AI will automatically extract all necessary information.
                </p>
                <label>
                  <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 cursor-pointer">
                    <span>Select File</span>
                  </Button>
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} />
                </label>
              </div>
            )}
          </div>
          
          {uploadStatus === "error" && (
            <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
              {errorMessage}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
        <h3 className="font-medium text-primary mb-2 flex items-center gap-2">
          <FileText className="h-5 w-5" /> How AI Parsing Works
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          CogniHire uses Gemini 2.5 Flash to intelligently read resumes exactly like a human recruiter would. It identifies:
        </p>
        <div className="flex flex-wrap gap-2">
          {["Contact Info", "Experience Timeline", "Education History", "Technical Skills", "Soft Skills"].map((item) => (
            <Badge key={item} variant="secondary" className="bg-background/50 border-border/50 font-normal">
              {item}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
