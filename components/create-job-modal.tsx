"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";

export function CreateJobModal({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    type: "Full-time",
    deadline: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const supabase = createClient();
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to create a job.");
      }

      // Insert the job
      const { data, error: insertError } = await supabase
        .from("jobs")
        .insert([
          {
            title: formData.title,
            department: formData.department,
            location: formData.location,
            type: formData.type,
            deadline: formData.deadline,
            description: formData.description,
            user_id: user.id,
            status: "Active",
            applicants_count: 0
          }
        ])
        .select();

      if (insertError) throw insertError;

      // Reset and close
      setFormData({
        title: "",
        department: "",
        location: "",
        type: "Full-time",
        deadline: "",
        description: "",
      });
      setIsOpen(false);
      
      // Refresh the page data
      router.refresh();
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create job.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]">
            <Plus className="h-4 w-4 mr-2" /> Create New Job
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Job Posting</DialogTitle>
          <DialogDescription>
            Fill out the details below to publish a new job to your career page.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Job Title *</label>
              <Input id="title" name="title" required value={formData.title} onChange={handleChange} placeholder="e.g. Frontend Engineer" />
            </div>
            <div className="space-y-2">
              <label htmlFor="department" className="text-sm font-medium">Department *</label>
              <Input id="department" name="department" required value={formData.department} onChange={handleChange} placeholder="e.g. Engineering" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">Location *</label>
              <Input id="location" name="location" required value={formData.location} onChange={handleChange} placeholder="e.g. Remote, NY" />
            </div>
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">Job Type</label>
              <select 
                id="type" 
                name="type" 
                value={formData.type} 
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="deadline" className="text-sm font-medium">Application Deadline *</label>
            <Input id="deadline" name="deadline" type="date" required value={formData.deadline} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <textarea 
              id="description" 
              name="description" 
              rows={4}
              value={formData.description} 
              onChange={handleChange}
              placeholder="Describe the role and responsibilities..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isLoading ? "Creating..." : "Create Job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
