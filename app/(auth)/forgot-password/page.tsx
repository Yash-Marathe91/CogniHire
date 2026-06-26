"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="space-y-2 text-center md:text-left">
        <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to login
        </Link>
        <h2 className="text-3xl font-heading font-bold">Reset password</h2>
        <p className="text-muted-foreground">Enter your email and we&apos;ll send you instructions to reset your password.</p>
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <input 
              id="email"
              type="email" 
              placeholder="name@company.com" 
              className="w-full h-12 px-4 rounded-lg bg-input/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        <Button type="button" className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
          Send Reset Link
        </Button>
      </form>
    </motion.div>
  );
}
