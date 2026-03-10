"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ToggleBoxes from "./ToggleBoxes";

const About = () => {
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
    <section
      id="about"
      ref={ref}
      className="py-20 px-6 bg-card"
    >
      <motion.div
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
          For <span className="text-gradient-primary">Music Creators</span>
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-4 leading-relaxed">
          CollabArts is an online music collaboration service that gives you
          access to experienced and talented songwriters, musicians, audio
          engineers, and music producers from all around the world. It&apos;s a
          place to unite, socialize, and collaborate in the writing and
          production of original music, all from the comfort of your own home
          studio.
        </p>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Click the icons below for details
        </p>
        <ToggleBoxes />
      </motion.div>
    </section>
  );
};

export default About;
