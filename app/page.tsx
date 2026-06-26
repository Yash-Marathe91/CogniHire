"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit, Users, Target, Zap } from "lucide-react";
import Link from "next/link";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-hidden">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4">
          {/* Animated Background */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 blur-[120px] rounded-full opacity-50" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary/10 blur-[100px] rounded-full opacity-30" />
          </div>

          <motion.div 
            className="container mx-auto max-w-5xl text-center"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeIn} className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary mb-8 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
              Next-Gen Recruitment Intelligence
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="font-heading text-5xl md:text-7xl font-bold tracking-tight mb-8">
              Hire the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Top 1%</span><br />
              with AI Precision.
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              CogniHire analyzes thousands of data points to find your perfect candidate match in seconds. Say goodbye to manual screening and hello to predictive hiring.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] transition-all">
                Start Hiring Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 border-border hover:bg-accent/50 backdrop-blur-md">
                Book a Demo
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-surface-container-lowest/50 border-t border-border/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Intelligence at Every Step</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Our platform uses advanced machine learning to automate the tedious parts of recruiting.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: BrainCircuit, title: "AI Matching", desc: "Our neural network scores candidates against your job description with 98% accuracy." },
                { icon: Users, title: "Automated Sourcing", desc: "Connect with passive candidates across the web instantly based on skill profiles." },
                { icon: Target, title: "Predictive Success", desc: "Forecast candidate longevity and performance before the first interview." },
                { icon: Zap, title: "Instant Insights", desc: "Generate comprehensive candidate summaries and interview questions automatically." }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors group shadow-lg"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
