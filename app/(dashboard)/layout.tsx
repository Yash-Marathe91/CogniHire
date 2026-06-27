"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useBlindHiring } from "@/components/providers/BlindHiringProvider";
import { 
  BrainCircuit, LayoutDashboard, Users, Briefcase, 
  Search, BarChart3, FileText, Settings, Bell, Menu, X, LogOut,
  ChevronLeft, ChevronRight, Moon, Sun, ChevronsUpDown, Building, Plus, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup 
} from "@/components/ui/dropdown-menu";
import { signout } from "../(auth)/actions";
import { createClient } from "@/lib/supabase/client";

const navGroups = [
  {
    title: "Platform",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "AI Search", href: "/ai-search", icon: Search },
    ]
  },
  {
    title: "Recruitment",
    items: [
      { name: "Jobs", href: "/jobs", icon: Briefcase },
      { name: "Candidates", href: "/candidates", icon: Users },
    ]
  },
  {
    title: "Insights",
    items: [
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
      { name: "Reports", href: "/reports", icon: FileText },
    ]
  },
  {
    title: "System",
    items: [
      { name: "Settings", href: "/settings", icon: Settings },
    ]
  }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isBlindMode, toggleBlindMode } = useBlindHiring();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [role, setRole] = useState<string>("Administrator"); // Default while loading
  const [profileData, setProfileData] = useState<{name: string, avatar: string}>({name: "User", avatar: ""});
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Check theme
    if (document.documentElement.classList.contains("dark")) setIsDark(true);
    else setIsDark(false);
    
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch role and profile details
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile) {
          if (profile.role) setRole(profile.role);
          const fullName = profile.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : user.user_metadata?.full_name || user.email?.split('@')[0] || "User";
          const avatarUrl = profile.avatar_url || user.user_metadata?.avatar_url || "";
          setProfileData({ name: fullName, avatar: avatarUrl });
        } else {
          const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || "User";
          const avatarUrl = user.user_metadata?.avatar_url || "";
          setProfileData({ name: fullName, avatar: avatarUrl });
        }

        // Fetch notifications
        const { data: notifs } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (notifs) {
          setNotifications(notifs);
          setUnreadCount(notifs.filter((n: any) => !n.read).length);
        }
      }
    };
    fetchData();
  }, []);

  const markAsRead = async () => {
    if (unreadCount === 0) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }
  };

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  const isItemVisible = (itemName: string) => {
    if (role === 'Candidate') {
      return ['Jobs', 'Settings'].includes(itemName);
    }
    if (role === 'Hiring Manager') {
      return ['Dashboard', 'Candidates', 'Jobs', 'Settings'].includes(itemName);
    }
    return true; // Administrator / Recruiter sees all
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-card border-r border-border/50 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col shadow-2xl lg:shadow-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-20' : 'w-72'}
      `}>
        
        {/* Sidebar Header & Workspace Switcher */}
        <div className="h-16 flex items-center px-4 border-b border-border/50 justify-between">
          {!isCollapsed && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex-1 flex items-center justify-between gap-2 hover:bg-muted/50 p-2 rounded-md transition-colors outline-none cursor-pointer">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="bg-primary/20 p-1 rounded-md shrink-0">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-col items-start truncate">
                    <span className="text-sm font-semibold truncate">Redrob Inc.</span>
                    <span className="text-[10px] text-muted-foreground">Enterprise Plan</span>
                  </div>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
                <DropdownMenuItem>Redrob Inc.</DropdownMenuItem>
                <DropdownMenuItem>Acme Corp</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-primary"><Plus className="mr-2 h-4 w-4"/> Create Workspace</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {isCollapsed && (
            <div className="w-full flex justify-center">
              <div className="bg-primary/20 p-2 rounded-md shrink-0">
                <BrainCircuit className="h-6 w-6 text-primary" />
              </div>
            </div>
          )}
          <Button variant="ghost" size="icon" className="lg:hidden ml-auto shrink-0" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
          {navGroups.map((group, i) => {
            const visibleItems = group.items.filter(item => isItemVisible(item.name));
            if (visibleItems.length === 0) return null;

            return (
              <div key={i} className="space-y-1">
                {!isCollapsed && (
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                    {group.title}
                  </h4>
                )}
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link key={item.name} href={item.href}>
                      <span className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                        isActive 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      } ${isCollapsed ? 'justify-center' : ''}`}>
                        <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-primary" : "group-hover:text-foreground transition-colors"}`} />
                        {!isCollapsed && <span>{item.name}</span>}
                        {isActive && !isCollapsed && (
                          <motion.div layoutId="sidebar-active" className="absolute left-0 w-1 h-8 bg-primary rounded-r-full" />
                        )}
                      </span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-border/50 flex flex-col gap-2">
          {!isCollapsed ? (
            <>
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={toggleTheme}>
                {isDark ? <Sun className="h-5 w-5 mr-3" /> : <Moon className="h-5 w-5 mr-3" />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </Button>
              <form action={signout}>
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </Button>
              </form>
              <Button variant="ghost" size="sm" className="hidden lg:flex w-full justify-center text-muted-foreground mt-2" onClick={() => setIsCollapsed(true)}>
                <ChevronLeft className="h-5 w-5 mr-1" /> Collapse
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" className="w-full text-muted-foreground hover:text-foreground mb-2" onClick={toggleTheme}>
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <form action={signout}>
                <Button variant="ghost" size="icon" className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                  <LogOut className="h-5 w-5" />
                </Button>
              </form>
              <Button variant="ghost" size="icon" className="hidden lg:flex w-full text-muted-foreground mt-2" onClick={() => setIsCollapsed(false)}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="relative hidden md:block w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search candidates, jobs, or skills..." 
                className="w-full h-10 pl-10 pr-4 rounded-full bg-input/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleBlindMode}
              className={`hidden md:flex gap-2 transition-all ${
                isBlindMode 
                ? "bg-primary/10 text-primary border-primary/50" 
                : "text-muted-foreground border-border/50 hover:bg-muted"
              }`}
              title={isBlindMode ? "Blind Hiring Mode ON: Names & Avatars are hidden to reduce bias." : "Turn on Blind Hiring Mode to reduce bias"}
            >
              {isBlindMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {isBlindMode ? "Blind Mode ON" : "Blind Mode OFF"}
            </Button>
            
            <DropdownMenu onOpenChange={(open) => open && markAsRead()}>
              <DropdownMenuTrigger className="relative p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer outline-none flex items-center justify-center">
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive animate-pulse" />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 border-border/50 bg-background/95 backdrop-blur-md">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-border/50" />
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <DropdownMenuItem key={notif.id} className="flex flex-col items-start p-3 focus:bg-muted/50 cursor-pointer border-b border-border/10 last:border-0">
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className={`text-sm font-semibold ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>{notif.title}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(notif.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className="text-xs text-muted-foreground line-clamp-2">{notif.message}</span>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-4 text-sm text-center text-muted-foreground">No new notifications</div>
                )}
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem className="justify-center text-xs text-primary cursor-pointer">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-1.5 rounded-lg transition-colors outline-none">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium leading-none">{profileData.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{role}</div>
                </div>
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarImage src={profileData.avatar} />
                  <AvatarFallback>{profileData.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-border/50 bg-background/95 backdrop-blur-md">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profileData.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{role}</p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem className="cursor-pointer focus:bg-muted/50 p-0">
                  <Link href="/settings" className="w-full h-full px-2 py-1.5 flex items-center">Profile Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem className="cursor-pointer focus:bg-muted/50 text-destructive focus:text-destructive p-0">
                  <form action={signout} className="w-full h-full">
                    <button type="submit" className="w-full text-left flex items-center px-2 py-1.5">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
