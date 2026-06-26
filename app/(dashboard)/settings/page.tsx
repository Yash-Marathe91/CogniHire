"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Bell, Palette, Shield, Briefcase, Loader2, GitBranch, Users, MessageCircle, Globe, Link as LinkIcon, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const tabs = [
  { id: "profile", label: "Public Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: Shield },
  { id: "workspace", label: "Workspace", icon: Briefcase },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "Administrator",
    bio: "",
    company: "",
    location: "",
    website: "",
    twitter: "",
    github: "",
    linkedin: "",
    pronouns: "",
    skills: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile) {
          setProfileData({
            firstName: profile.first_name || user.user_metadata?.full_name?.split(' ')[0] || "",
            lastName: profile.last_name || user.user_metadata?.full_name?.split(' ')[1] || "",
            email: user.email || "",
            role: profile.role || "Administrator",
            bio: profile.bio || "",
            company: profile.company || "",
            location: profile.location || "",
            website: profile.website || "",
            twitter: profile.twitter || "",
            github: profile.github || "",
            linkedin: profile.linkedin || "",
            pronouns: profile.pronouns || "",
            skills: profile.skills || ""
          });
        }
      }
      setIsLoading(false);
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        bio: profileData.bio,
        company: profileData.company,
        location: profileData.location,
        website: profileData.website,
        twitter: profileData.twitter,
        github: profileData.github,
        linkedin: profileData.linkedin,
        pronouns: profileData.pronouns,
        skills: profileData.skills
      }).eq('id', user.id);
    }
    // Simulate slight delay for UX
    setTimeout(() => setIsSaving(false), 800);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-heading font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings, profile, and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap relative ${
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <tab.icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                  {tab.label}
                  {isActive && (
                    <motion.div layoutId="settings-active" className="absolute left-0 w-1 h-full bg-primary rounded-r-full hidden md:block" />
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-card border-border/50">
              <CardHeader className="border-b border-border/50 pb-6">
                <CardTitle className="text-xl">
                  {tabs.find(t => t.id === activeTab)?.label}
                </CardTitle>
                <CardDescription>
                  Update your {activeTab} details and how others see you on the platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-8">
                {activeTab === "profile" && (
                  <div className="space-y-8">
                    {isLoading ? (
                      <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                    ) : (
                      <>
                        {/* Avatar Section */}
                        <div className="flex items-center gap-6">
                          <div className="relative group cursor-pointer">
                            <div className="h-24 w-24 rounded-full bg-muted border-4 border-background shadow-lg overflow-hidden flex items-center justify-center text-4xl font-bold text-muted-foreground">
                              {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
                            </div>
                            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Camera className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-medium text-sm">Profile picture</h3>
                            <p className="text-xs text-muted-foreground max-w-xs">Upload a picture larger than 96x96 pixels. Use PNG, JPG or GIF.</p>
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" variant="outline">Upload</Button>
                              <Button size="sm" variant="ghost" className="text-destructive">Remove</Button>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">First Name</label>
                            <Input name="firstName" value={profileData.firstName} onChange={handleChange} className="bg-input/50 border-border/50" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Last Name</label>
                            <Input name="lastName" value={profileData.lastName} onChange={handleChange} className="bg-input/50 border-border/50" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Pronouns</label>
                            <Input name="pronouns" placeholder="they/them" value={profileData.pronouns} onChange={handleChange} className="bg-input/50 border-border/50" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Role / Title</label>
                            <Input name="role" value={profileData.role} disabled className="bg-muted text-muted-foreground border-border/50" />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Bio</label>
                          <textarea 
                            name="bio"
                            value={profileData.bio} 
                            onChange={handleChange}
                            placeholder="Tell us a little bit about yourself..."
                            className="flex min-h-[100px] w-full rounded-md border border-border/50 bg-input/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                          />
                          <p className="text-xs text-muted-foreground">You can @mention other users and organizations to link to them.</p>
                        </div>

                        <div className="border-t border-border/50 pt-6 space-y-6">
                          <h3 className="font-heading font-semibold text-lg">Professional Details</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-2"><Briefcase className="h-4 w-4"/> Company</label>
                              <Input name="company" placeholder="Where do you work?" value={profileData.company} onChange={handleChange} className="bg-input/50 border-border/50" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-2"><Globe className="h-4 w-4"/> Location</label>
                              <Input name="location" placeholder="City, Country" value={profileData.location} onChange={handleChange} className="bg-input/50 border-border/50" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-2"><LinkIcon className="h-4 w-4"/> Website</label>
                              <Input name="website" placeholder="https://your-website.com" value={profileData.website} onChange={handleChange} className="bg-input/50 border-border/50" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-2"><Palette className="h-4 w-4"/> Top Skills</label>
                              <Input name="skills" placeholder="React, Python, AWS (comma separated)" value={profileData.skills} onChange={handleChange} className="bg-input/50 border-border/50" />
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-border/50 pt-6 space-y-6">
                          <h3 className="font-heading font-semibold text-lg">Social Profiles</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-2"><GitBranch className="h-4 w-4"/> GitHub</label>
                              <Input name="github" placeholder="github.com/username" value={profileData.github} onChange={handleChange} className="bg-input/50 border-border/50" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-2"><Users className="h-4 w-4"/> LinkedIn</label>
                              <Input name="linkedin" placeholder="linkedin.com/in/username" value={profileData.linkedin} onChange={handleChange} className="bg-input/50 border-border/50" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-2"><MessageCircle className="h-4 w-4"/> Twitter / X</label>
                              <Input name="twitter" placeholder="@username" value={profileData.twitter} onChange={handleChange} className="bg-input/50 border-border/50" />
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-border/50 flex justify-end gap-4">
                          <Button variant="outline" onClick={() => window.location.reload()}>Cancel</Button>
                          <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]">
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {isSaving ? "Saving..." : "Update Profile"}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab !== "profile" && (
                  <div className="py-16 flex flex-col items-center justify-center text-center">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
                      {(() => {
                        const ActiveIcon = tabs.find(t => t.id === activeTab)?.icon;
                        return ActiveIcon ? <ActiveIcon className="h-10 w-10 text-muted-foreground" /> : null;
                      })()}
                    </div>
                    <h3 className="text-xl font-medium">{tabs.find(t => t.id === activeTab)?.label} Settings</h3>
                    <p className="text-muted-foreground mt-3 max-w-md">
                      These configuration options are tied to your workspace policies.
                    </p>
                    <Button variant="outline" className="mt-8">Contact Workspace Admin</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
