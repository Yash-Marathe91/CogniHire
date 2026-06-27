"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Bell, Palette, Shield, Briefcase, Loader2, GitBranch, Users, MessageCircle, Globe, Link as LinkIcon, Camera, Moon, Sun, Monitor, Eye, EyeOff, Key, Smartphone, History, Building2, CreditCard, Users2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useBlindHiring } from "@/components/providers/BlindHiringProvider";

const tabs = [
  { id: "profile", label: "Public Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: Shield },
  { id: "workspace", label: "Workspace", icon: Briefcase },
];

export default function SettingsPage() {
  const { isBlindMode, toggleBlindMode } = useBlindHiring();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [notifPrefs, setNotifPrefs] = useState({
    emailAlerts: true,
    newApplications: true,
    weeklyDigest: false,
    securityAlerts: true
  });
  
  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) setIsDark(true);
    else setIsDark(false);
  }, []);
  
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
    skills: "",
    avatarUrl: ""
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
            skills: profile.skills || "",
            avatarUrl: profile.avatar_url || ""
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
        skills: profileData.skills,
        avatar_url: profileData.avatarUrl
      }).eq('id', user.id);
    }
    // Simulate slight delay for UX
    setTimeout(() => setIsSaving(false), 800);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setIsUploadingAvatar(true);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user found");
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('candidate_files')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('candidate_files')
        .getPublicUrl(filePath);

      setProfileData(prev => ({ ...prev, avatarUrl: publicUrl }));
      
      // Instantly save it to the DB so it persists
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);

    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setIsUploadingAvatar(false);
    }
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
                          <label className="relative group cursor-pointer block">
                            <div className="h-24 w-24 rounded-full bg-muted border-4 border-background shadow-lg overflow-hidden flex items-center justify-center text-4xl font-bold text-muted-foreground relative">
                              {profileData.avatarUrl ? (
                                <img src={profileData.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                              ) : (
                                <>{profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}</>
                              )}
                              
                              {isUploadingAvatar && (
                                <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm z-10">
                                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                                </div>
                              )}
                            </div>
                            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                              <Camera className="h-6 w-6 text-white" />
                            </div>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/png, image/jpeg, image/gif"
                              onChange={handleAvatarUpload}
                              disabled={isUploadingAvatar}
                            />
                          </label>
                          <div className="space-y-1">
                            <h3 className="font-medium text-sm">Profile picture</h3>
                            <p className="text-xs text-muted-foreground max-w-xs">Upload a picture larger than 96x96 pixels. Use PNG, JPG or GIF.</p>
                            <div className="flex gap-2 mt-2">
                              <label className={`cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 ${isUploadingAvatar ? 'opacity-50 pointer-events-none' : ''}`}>
                                Upload
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/png, image/jpeg, image/gif"
                                  onChange={handleAvatarUpload}
                                  disabled={isUploadingAvatar}
                                />
                              </label>
                              {profileData.avatarUrl && (
                                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => {
                                  setProfileData(prev => ({ ...prev, avatarUrl: "" }));
                                }}>Remove</Button>
                              )}
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

                {activeTab === "appearance" && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-primary" /> Theme Preferences
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          onClick={() => {
                            document.documentElement.classList.remove("dark");
                            setIsDark(false);
                          }}
                          className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                            !isDark ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <Sun className={`h-8 w-8 mb-3 ${!isDark ? "text-primary" : "text-muted-foreground"}`} />
                          <span className="font-medium">Light Mode</span>
                        </button>
                        <button
                          onClick={() => {
                            document.documentElement.classList.add("dark");
                            setIsDark(true);
                          }}
                          className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                            isDark ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <Moon className={`h-8 w-8 mb-3 ${isDark ? "text-primary" : "text-muted-foreground"}`} />
                          <span className="font-medium">Dark Mode</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border/50 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            {isBlindMode ? <EyeOff className="h-5 w-5 text-primary" /> : <Eye className="h-5 w-5 text-primary" />} 
                            Blind Hiring Mode
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                            When enabled, candidate names, photos, and contact info are hidden to reduce unconscious bias during the screening process.
                          </p>
                        </div>
                        <button 
                          onClick={toggleBlindMode}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${isBlindMode ? 'bg-primary' : 'bg-input'}`}
                        >
                          <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${isBlindMode ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <h3 className="text-lg font-semibold">Email Notifications</h3>
                    <div className="space-y-4">
                      {[
                        { id: 'emailAlerts', title: 'System Alerts', desc: 'Receive important system and account alerts.' },
                        { id: 'newApplications', title: 'New Applications', desc: 'Get notified when a new candidate applies.' },
                        { id: 'weeklyDigest', title: 'Weekly Digest', desc: 'Receive a weekly summary of workspace activity.' },
                        { id: 'securityAlerts', title: 'Security Alerts', desc: 'Get notified about unusual account activity.' }
                      ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/10">
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                          <button 
                            onClick={() => setNotifPrefs(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${notifPrefs[item.id as keyof typeof notifPrefs] ? 'bg-primary' : 'bg-input'}`}
                          >
                            <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${notifPrefs[item.id as keyof typeof notifPrefs] ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="pt-6 border-t border-border/50 flex justify-end">
                      <Button className="bg-primary hover:bg-primary/90">Save Preferences</Button>
                    </div>
                  </div>
                )}

                {activeTab === "security" && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Key className="h-5 w-5 text-primary" /> Password & Authentication
                      </h3>
                      <div className="space-y-4 max-w-xl">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Current Password</label>
                          <Input type="password" placeholder="••••••••" className="bg-input/50" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">New Password</label>
                          <Input type="password" placeholder="••••••••" className="bg-input/50" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
                          <Input type="password" placeholder="••••••••" className="bg-input/50" />
                        </div>
                        <Button className="mt-2">Update Password</Button>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border/50 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Smartphone className="h-5 w-5 text-primary" /> Two-Factor Authentication
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                            Add an extra layer of security to your account by requiring more than just a password to log in.
                          </p>
                        </div>
                        <Button variant="outline" className="shrink-0">Enable 2FA</Button>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border/50 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <History className="h-5 w-5 text-primary" /> Active Sessions
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                            Manage and log out your active sessions on other browsers and devices.
                          </p>
                        </div>
                        <Button variant="destructive" className="shrink-0">Log out all devices</Button>
                      </div>
                      
                      <div className="border border-border/50 rounded-lg p-4 bg-muted/10 space-y-3 mt-4">
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-3">
                            <Monitor className="h-4 w-4 text-primary" />
                            <span><strong className="block">Windows 11 • Chrome</strong> <span className="text-muted-foreground text-xs">Delhi, India • Active now</span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "workspace" && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card className="bg-muted/10 border-border/50">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">CogniHire Inc.</p>
                            <p className="text-xs text-muted-foreground">Pro Plan</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/10 border-border/50">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                            <Users2 className="h-5 w-5 text-success" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">12 / 50</p>
                            <p className="text-xs text-muted-foreground">Team Members</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/10 border-border/50">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                            <CreditCard className="h-5 w-5 text-secondary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Auto-renews</p>
                            <p className="text-xs text-muted-foreground">Oct 15, 2026</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" /> Team Management
                      </h3>
                      <div className="border border-border/50 rounded-lg overflow-hidden">
                        <div className="bg-muted/30 px-4 py-3 border-b border-border/50 flex justify-between items-center">
                          <span className="font-medium text-sm">Active Members</span>
                          <Button size="sm">Invite Member</Button>
                        </div>
                        <div className="divide-y divide-border/50">
                          <div className="px-4 py-3 flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/20 flex justify-center items-center font-bold text-primary text-xs">YA</div>
                              <span><strong>Yash Marathe</strong> <span className="text-muted-foreground block text-xs">yash@cognihire.com</span></span>
                            </div>
                            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">Owner</span>
                          </div>
                          <div className="px-4 py-3 flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-secondary/20 flex justify-center items-center font-bold text-secondary text-xs">JS</div>
                              <span><strong>John Smith</strong> <span className="text-muted-foreground block text-xs">john@cognihire.com</span></span>
                            </div>
                            <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded">Recruiter</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-destructive/20 space-y-4">
                      <h3 className="text-lg font-semibold text-destructive flex items-center gap-2">Danger Zone</h3>
                      <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-destructive">Delete Workspace</p>
                          <p className="text-sm text-muted-foreground">Once you delete a workspace, there is no going back. Please be certain.</p>
                        </div>
                        <Button variant="destructive">Delete Workspace</Button>
                      </div>
                    </div>
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
