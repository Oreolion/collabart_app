"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import styles from "../styles/thirdsection.module.css";
import { fourthSection } from "@/constants";
import Image from "next/image";

const ThirdSection = () => {
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
    <section className="bg-red-500" ref={ref}>
      <motion.div 
        initial="hidden"
        animate={hasAnimated ? "visible" : "hidden"}
        variants={variants}
      >
        <h2 className={styles.h2}>
          Platform <strong className="font-bold">Features</strong>
        </h2>
        <p className="mb-[2rem] text-center font-bold">
          Members have access to a number of cool features on the site.
          We&lsquo;ve listed some of the main ones below.
        </p>
        <ul className={styles.ul}>
          {fourthSection.map((item) => {
            return (
              <>
                <li key={item.id} className={styles.li}>
                  <Image
                    src={item.svgUrl}
                    alt="svg"
                    height={40}
                    width={40}
                  ></Image>
                  <div className="texts">
                    <h4 className={styles.h4}>{item.h4}</h4>
                    <p className={styles.p}>{item.p}</p>
                  </div>
                </li>
              </>
            );
          })}
        </ul>
      </motion.div>
    </section>
  );
};

export default ThirdSection;
