import React from "react";
import styles from "../styles/about.module.css";

const About = () => {
  return (
    <section className={styles.about__section}>
      <h2 className={styles.h2}>
        For <strong className='font-bold'>Music Creators</strong>
      </h2>

      <p className={styles.p}>
        ProCollabs is an online music collaboration service that gives you
        access to experienced and talented songwriters, musicians, audio
        engineers, and music producers from all around the world. It's a place
        to unite, socialize, and collaborate in the writing and production of
        original music, all from the comfort of your own home studio.
      </p>
      <p className={styles.p}>Click the icons below for details</p>
      <main>
        <div className={styles.topbox}></div>
        <div className={styles.btmbox}></div>
      </main>
    </section>
  );
};

export default About;
