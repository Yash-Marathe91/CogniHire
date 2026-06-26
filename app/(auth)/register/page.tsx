"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signup } from "../actions";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOAuth = async (provider: "google" | "github") => {
    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const result = await signup(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="space-y-2 text-center md:text-left">
        <h2 className="text-3xl font-heading font-bold">Create an account</h2>
        <p className="text-muted-foreground">Start building your dream team today.</p>
      </div>

      <div className="space-y-4">
        <Button 
          variant="outline" 
          type="button"
          onClick={() => handleOAuth("google")}
          disabled={isLoading}
          className="w-full h-12 bg-card border-border/50 hover:bg-muted relative"
        >
          <svg className="w-5 h-5 absolute left-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Sign up with Google
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="firstName">First name</label>
              <input 
                id="firstName"
                name="firstName"
                type="text" 
                required
                placeholder="John" 
                className="w-full h-12 px-4 rounded-lg bg-input/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="lastName">Last name</label>
              <input 
                id="lastName"
                name="lastName"
                type="text" 
                required
                placeholder="Doe" 
                className="w-full h-12 px-4 rounded-lg bg-input/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">Work Email</label>
            <input 
              id="email"
              name="email"
              type="email" 
              required
              placeholder="name@company.com" 
              className="w-full h-12 px-4 rounded-lg bg-input/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">Password</label>
            <div className="relative">
              <input 
                id="password"
                name="password"
                type={showPassword ? "text" : "password"} 
                required
                placeholder="Create a strong password" 
                className="w-full h-12 px-4 rounded-lg bg-input/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg border border-destructive/20">
            {error}
          </div>
        )}

        <Button disabled={isLoading} type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
