import { BrainCircuit } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left Branding Panel */}
      <div className="hidden md:flex flex-1 relative overflow-hidden bg-muted/30 border-r border-border/50 p-12 flex-col justify-between">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/40 blur-[100px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/40 blur-[100px] rounded-full mix-blend-screen" />
        </div>
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-12 w-fit">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <span className="font-heading text-2xl font-bold">CogniHire</span>
          </Link>
          <h1 className="text-4xl font-heading font-bold max-w-md leading-tight mb-6">
            The intelligent way to scale your world-class team.
          </h1>
          <p className="text-muted-foreground text-lg max-w-md">
            Join leading enterprises using predictive AI to hire top talent faster and smarter.
          </p>
        </div>
        
        <div className="relative z-10 text-sm text-muted-foreground">
          © {new Date().getFullYear()} CogniHire Inc. All rights reserved.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 md:p-24 relative z-10">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
