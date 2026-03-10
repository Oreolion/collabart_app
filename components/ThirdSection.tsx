"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { fourthSection } from "@/constants";
import Image from "next/image";

const ThirdSection = () => {
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
    <section id="features" ref={ref} className="py-20 px-6 bg-background">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-foreground">
          Platform <span className="text-gradient-primary">Features</span>
        </h2>
        <p className="text-muted-foreground text-center max-w-lg mx-auto mb-12">
          Members have access to a number of cool features on the site.
          We&lsquo;ve listed some of the main ones below.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fourthSection.map((item) => (
            <div
              key={item.id}
              className="surface-elevated p-5 flex gap-4 hover:border-primary/30 transition-all duration-200"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Image src={item.svgUrl} alt={item.h4} height={22} width={22} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">{item.h4}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.p}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default ThirdSection;
