"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import Link from "next/link";

const ForthSection = () => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) setHasAnimated(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [hasAnimated]);

  return (
    <section ref={ref} className="relative py-16 px-6 border-y border-border/10 overflow-hidden">
      {/* Glass gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-card/50 to-accent/8 backdrop-blur-sm" />

      <motion.div
        className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        <h4 className="text-xl md:text-2xl font-bold text-foreground text-center md:text-left">
          Like what you hear? Then show us whatcha got...
        </h4>
        <Link href="/sign-up">
          <Button size="lg" className="font-semibold px-10 whitespace-nowrap glow-primary">
            SIGN UP NOW FOR FREE
          </Button>
        </Link>
      </motion.div>
    </section>
  );
};

export default ForthSection;
