"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Do I need professional recording equipment to join?",
    answer:
      "Not at all. Many of our members record using home studio setups with a laptop, an audio interface, and a microphone. As long as you can export audio files from a DAW (like GarageBand, Logic, Ableton, FL Studio, or Pro Tools), you can collaborate on eCollabs.",
  },
  {
    question: "How does the collaboration process work?",
    answer:
      "A project owner creates a project and defines what roles are needed (e.g., vocalist, guitarist, mix engineer). Collaborators can audition or be invited. Once accepted, everyone works in a shared project workspace where they upload tracks, submit lyrics, and discuss changes.",
  },
  {
    question: "Who owns the music we create together?",
    answer:
      "By default, the project owner retains ownership. You can use work-for-hire contracts for session contributions, or set up royalty splits for co-created works. We recommend discussing ownership terms before starting any project.",
  },
  {
    question: "Can I sell my music on eCollabs?",
    answer:
      "Yes. Completed projects can be listed in the eCollabs music library for sale. You set your price, and buyers can purchase directly through the platform. Royalties are tracked and split according to your project agreement.",
  },
  {
    question: "What audio formats are supported?",
    answer:
      "We support WAV, MP3, FLAC, AIFF, and OGG uploads. For best collaboration quality, we recommend uploading uncompressed WAV stems at 44.1kHz or 48kHz sample rate.",
  },
  {
    question: "Can I cancel or change my plan at any time?",
    answer:
      "Absolutely. You can upgrade, downgrade, or cancel your plan at any time from your membership account page. If you downgrade, you'll keep your current plan benefits until the end of your billing period.",
  },
  {
    question: "Is there a limit to how many people can collaborate on a project?",
    answer:
      "The Free plan allows up to 5 collaborators per project. Pro and Studio plans allow up to 15 and unlimited collaborators respectively, so you can build full bands and production teams.",
  },
];

const FAQSection = () => {
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
        className="max-w-3xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-foreground">
          Frequently Asked{" "}
          <span className="text-gradient-primary">Questions</span>
        </h2>
        <p className="text-muted-foreground text-center max-w-lg mx-auto mb-12">
          Everything you need to know before getting started.
        </p>

        <div className="glassmorphism rounded-xl p-4 md:p-6">
          <Accordion type="single" collapsible className="space-y-1">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={
                  hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
                }
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <AccordionItem
                  value={`faq-${index}`}
                  className="border-border/10"
                >
                  <AccordionTrigger className="text-sm font-medium text-foreground hover:text-primary transition-colors py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </motion.div>
    </section>
  );
};

export default FAQSection;
