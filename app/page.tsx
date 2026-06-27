"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit, Users, Target, Zap, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } }
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-hidden selection:bg-primary/30">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4">
          {/* Animated Background Gradients */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.5, scale: 1 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.3, scale: 1 }}
              transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 1 }}
              className="absolute bottom-[-20%] right-[10%] w-[800px] h-[800px] bg-secondary/15 blur-[150px] rounded-full" 
            />
          </div>

          <motion.div 
            className="container mx-auto max-w-5xl text-center relative z-10"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeIn} className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <Sparkles className="w-4 h-4 mr-2" />
              Next-Gen AI Recruitment Intelligence
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="font-heading text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
              Hire the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-secondary">Top 1%</span><br />
              with Precision.
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              CogniHire analyzes millions of data points to find your perfect candidate match in seconds. Move beyond keyword matching to true semantic understanding.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full text-lg h-14 px-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-[0_0_40px_-10px_rgba(59,130,246,0.6)] transition-all hover:scale-105 active:scale-95 group">
                  Start Hiring Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full text-lg h-14 px-10 rounded-full border-border/60 hover:bg-accent/50 backdrop-blur-md transition-all hover:scale-105 active:scale-95">
                  View Demo
                </Button>
              </Link>
            </motion.div>
          </motion.div>
          
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 bg-surface-container-lowest/50 border-t border-border/30 relative">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-20">
              <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">Intelligence at Every Step</h2>
              <p className="text-muted-foreground text-xl max-w-2xl mx-auto">Our platform uses hybrid LLM and Vector Search to automate the tedious parts of recruiting.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: BrainCircuit, title: "Hybrid AI Matching", desc: "Our neural network scores candidates against your job description using Gemini 2.5 Flash." },
                { icon: Users, title: "Semantic Search", desc: "Find candidates by actual meaning using pgvector, skipping outdated keyword filters." },
                { icon: Target, title: "Predictive Analytics", desc: "Live dashboards tracking your hiring funnel, time-to-hire, and real-time skill distribution." },
                { icon: Zap, title: "Instant Insights", desc: "Generate comprehensive candidate summaries and explicit reasoning for every match instantly." }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all hover:-translate-y-2 group shadow-lg relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:bg-primary/20">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-8"
            >
              Ready to transform your hiring?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            >
              Join the future of talent acquisition today. Stop filtering keywords and start hiring actual talent.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/login">
                <Button size="lg" className="text-lg h-16 px-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_50px_-10px_rgba(59,130,246,0.7)] hover:scale-105 transition-all">
                  Get Started Free
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      
      <footer className="py-8 border-t border-border/30 bg-background text-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} CogniHire AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
