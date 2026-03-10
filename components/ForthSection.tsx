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
    <section ref={ref} className="py-16 px-6 bg-gradient-to-r from-primary/10 via-card to-accent/10 border-y border-border">
      <motion.div
        className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        <h4 className="text-xl md:text-2xl font-bold text-foreground text-center md:text-left">
          Like what you hear? Then show us whatcha got...
        </h4>
        <Link href="/sign-up">
          <Button size="lg" className="font-semibold px-10 whitespace-nowrap">
            SIGN UP NOW FOR FREE
          </Button>
        </Link>
      </motion.div>
    </section>
  );
};

export default ForthSection;
