"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Amara K.",
    role: "Vocalist & Songwriter",
    quote:
      "I found a producer in Lagos and a guitarist in London through eCollabs. We made a full EP without ever meeting in person. This platform changed my career.",
    rating: 5,
  },
  {
    name: "Marcus D.",
    role: "Music Producer",
    quote:
      "The project workspace is exactly what I needed. Uploading stems, leaving notes on mixes, managing collaborators \u2014 it all just works. Way better than emailing WAV files back and forth.",
    rating: 5,
  },
  {
    name: "Suki L.",
    role: "Session Pianist",
    quote:
      "I earn extra income recording piano parts for songwriters on eCollabs. The work-for-hire system handles payments cleanly so I can focus on playing.",
    rating: 5,
  },
  {
    name: "Jean-Pierre R.",
    role: "Audio Engineer",
    quote:
      "Finally a platform built for how music actually gets made remotely. The audition system lets me hear vocalists before committing to a project.",
    rating: 4,
  },
  {
    name: "Tayo B.",
    role: "Afrobeats Artist",
    quote:
      "I connected with a mix engineer in Atlanta and a drummer in Accra. eCollabs made cross-continental collaboration feel effortless.",
    rating: 5,
  },
  {
    name: "Rachel V.",
    role: "Composer & Lyricist",
    quote:
      "The lyrics submission workflow is brilliant. I can write, submit for review, and iterate with the project owner without any confusion.",
    rating: 5,
  },
];

const Testimonials = () => {
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
    <section ref={ref} className="relative py-20 px-6 bg-card/50 backdrop-blur-sm">
      <motion.div
        className="max-w-6xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-foreground">
          Loved by <span className="text-gradient-primary">Creators</span>
        </h2>
        <p className="text-muted-foreground text-center max-w-lg mx-auto mb-12">
          Musicians, producers, and engineers around the world use eCollabs to
          make music together.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              animate={
                hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={{ duration: 0.4, delay: index * 0.07 }}
              className="glassmorphism-subtle rounded-xl p-5 flex flex-col justify-between glass-hover"
            >
              <div>
                <Quote className="h-5 w-5 text-primary/40 mb-3" />
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border/10">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < t.rating
                          ? "text-[hsl(var(--warning))] fill-[hsl(var(--warning))]"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Testimonials;
