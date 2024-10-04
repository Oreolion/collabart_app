"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import styles from "../styles/forth.module.css";

const ForthSection = () => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [hasAnimated]);

  const variants = {
    hidden: { x: "-100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };
  return (
    <section className={styles.section} ref={ref}>
      <motion.div
        className="flex gap-[12rem] max-md:flex-col max-md:gap-8"
        initial="hidden"
        animate={hasAnimated ? "visible" : "hidden"}
        variants={variants}
      >
        <h4 className="text-xl font-bold">
          Like what you hear? Then show us whatcha got...
        </h4>
        <Button className="p-[2rem]">SIGN UP NOW FOR FREE</Button>
      </motion.div>
    </section>
  );
};

export default ForthSection;
