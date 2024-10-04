'use client'
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import styles from "../styles/about.module.css";
import ToggleBoxes from "./ToggleBoxes";

const About = () => {
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
    <section
    ref={ref}
   
     className={styles.about__section}>
     <motion.div  initial="hidden"
     animate={hasAnimated ? "visible" : "hidden"}
     variants={variants}>
      <h2 className={styles.h2}>
        For <strong className="font-bold">Music Creators</strong>
      </h2>

      <p className={styles.p}>
        ProCollabs is an online music collaboration service that gives you
        access to experienced and talented songwriters, musicians, audio
        engineers, and music producers from all around the world. It&apos;s a place
        to unite, socialize, and collaborate in the writing and production of
        original music, all from the comfort of your own home studio.
      </p>
      <p className="mb-[1rem] text-center font-bold max-md:text-sm max-md:mb-[.5rem]">
        Click the icons below for details
      </p>
      <ToggleBoxes></ToggleBoxes>
      </motion.div>
    </section>
  );
};

export default About;
