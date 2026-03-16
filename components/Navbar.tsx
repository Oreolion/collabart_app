"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "glassmorphism-black shadow-lg"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-0.5 group">
          <h3 className="text-xl font-bold tracking-tight">
            <span className="text-primary font-black text-2xl transition-all duration-300 group-hover:drop-shadow-[0_0_8px_hsl(11,90%,58%,0.5)]">e</span>
            <span className="text-foreground">Collabs</span>
          </h3>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Sign in
          </Link>
          <Link href="/sign-up">
            <Button size="sm" className="font-semibold glow-primary">
              Get Started
            </Button>
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="md:hidden glassmorphism-black border-b border-border/10 px-6 pb-6 pt-2 animate-fade-in">
          <div className="flex flex-col gap-3">
            <Link href="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground py-2">
              Home
            </Link>
            <Link href="#about" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground py-2">
              About
            </Link>
            <Link href="#features" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground py-2">
              Features
            </Link>
            <Link href="/sign-in" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground py-2">
              Sign in
            </Link>
            <Link href="/sign-up" onClick={() => setMobileOpen(false)}>
              <Button className="w-full font-semibold">Get Started</Button>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
