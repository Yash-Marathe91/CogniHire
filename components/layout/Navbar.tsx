import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="font-heading text-lg font-bold tracking-tight text-foreground">CogniHire</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="#features" className="text-foreground/70 transition-colors hover:text-foreground">Features</Link>
            <Link href="https://github.com" target="_blank" className="text-foreground/70 transition-colors hover:text-foreground">Open Source</Link>
          </nav>
          <div className="flex items-center space-x-2 ml-4 border-l border-border/50 pl-4">
            <Link href="/login">
              <Button variant="ghost" className="hover:bg-accent/50 rounded-full px-6">Log in</Button>
            </Link>
            <Link href="/login">
              <Button className="bg-primary text-primary-foreground shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] hover:bg-primary/90 hover:scale-105 transition-all rounded-full px-6">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
