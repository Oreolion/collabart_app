"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started and exploring the platform.",
    features: [
      "1 active project",
      "500 MB storage",
      "Basic profile & portfolio",
      "Community forum access",
      "Collaborate with others",
      "Publish to music library",
      "5 AI music generations / day",
      "20 AI assists / day",
    ],
    cta: "Get Started Free",
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    description: "For serious creators who collaborate regularly.",
    features: [
      "10 active projects",
      "5 GB storage",
      "Work-for-hire contracts",
      "Priority in search results",
      "Advanced audio player",
      "Media library uploads",
      "Royalty tracking",
      "Email support",
      "10 AI music generations / day",
      "50 AI assists / day",
      "AI mix feedback & mastering tips",
      "Stem separation",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    name: "Studio",
    price: "$24.99",
    period: "/month",
    description: "For professionals and teams running multiple projects.",
    features: [
      "Unlimited active projects",
      "50 GB storage",
      "iBand group profiles",
      "Digital audio protection",
      "Advanced royalty splitting",
      "Custom project branding",
      "Priority mentor support",
      "API access",
      "Early access to new features",
      "Unlimited AI music generations",
      "Unlimited AI assists",
      "Full AI suite: stems, mastering, design",
      "AI collaborator matching & credit splits",
    ],
    cta: "Go Studio",
  },
];

const PricingSection = () => {
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
      id="pricing"
      ref={ref}
      className="relative py-20 px-6 bg-background/80"
    >
      <motion.div
        className="max-w-5xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-foreground">
          Simple, Transparent{" "}
          <span className="text-gradient-primary">Pricing</span>
        </h2>
        <p className="text-muted-foreground text-center max-w-lg mx-auto mb-14">
          Start free. Upgrade when you need more space, projects, or
          professional features.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={
                hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`rounded-xl p-6 flex flex-col ${
                tier.highlighted
                  ? "glassmorphism ring-1 ring-primary/30 shadow-[0_0_40px_hsl(var(--primary)/0.08)] scale-[1.02]"
                  : "glassmorphism-subtle"
              }`}
            >
              {/* Badge for highlighted tier */}
              {tier.highlighted && (
                <span className="self-start text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
                  Most Popular
                </span>
              )}

              <h3 className="text-lg font-bold text-foreground">{tier.name}</h3>

              <div className="flex items-baseline gap-1 mt-2 mb-1">
                <span className="text-4xl font-black text-foreground">
                  {tier.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  {tier.period}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                {tier.description}
              </p>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-[hsl(var(--success))] shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href="/sign-up" className="mt-auto">
                <Button
                  className={`w-full font-semibold ${
                    tier.highlighted ? "glow-primary hover-lift" : ""
                  }`}
                  variant={tier.highlighted ? "default" : "outline"}
                  size="lg"
                >
                  {tier.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default PricingSection;
