"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FolderPlus, Users, Music, Rocket } from "lucide-react";

const steps = [
  {
    icon: FolderPlus,
    title: "Create a Project",
    description:
      "Set up your project with details like genre, mood, and the talents you need. Define the creative direction.",
  },
  {
    icon: Users,
    title: "Find Collaborators",
    description:
      "Browse profiles, audition musicians, or invite artists directly. Build your dream team from anywhere in the world.",
  },
  {
    icon: Music,
    title: "Collaborate & Create",
    description:
      "Upload stems, exchange tracks, submit lyrics, and refine your music together in a private workspace.",
  },
  {
    icon: Rocket,
    title: "Publish & Earn",
    description:
      "Release your finished track to the eCollabs library. Split royalties, sell your music, and grow your audience.",
  },
];

const HowItWorks = () => {
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
    <section ref={ref} className="relative py-20 px-6 bg-background/80">
      <motion.div
        className="max-w-5xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-foreground">
          How It <span className="text-gradient-primary">Works</span>
        </h2>
        <p className="text-muted-foreground text-center max-w-lg mx-auto mb-14">
          From idea to release in four simple steps. No studio required.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0" />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={
                hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              {/* Step number + icon */}
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-2xl glassmorphism flex items-center justify-center">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-lg shadow-primary/25">
                  {index + 1}
                </span>
              </div>

              <h3 className="text-base font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default HowItWorks;
