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
            <Link href="#workflow" className="text-foreground/70 transition-colors hover:text-foreground">How it Works</Link>
            <Link href="#testimonials" className="text-foreground/70 transition-colors hover:text-foreground">Customers</Link>
          </nav>
          <div className="flex items-center space-x-2">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
