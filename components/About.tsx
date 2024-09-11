import React from "react";
import styles from "../styles/about.module.css";
import Image from "next/image";
// import  SecondCarousel  from './SecondCarousel'
import IconMusic from "./IconMusic";
import IconMix from "./IconMix";

const About = () => {
  return (
    <section className={styles.about__section}>
      <h2 className={styles.h2}>
        For <strong className="font-bold">Music Creators</strong>
      </h2>

      <p className={styles.p}>
        ProCollabs is an online music collaboration service that gives you
        access to experienced and talented songwriters, musicians, audio
        engineers, and music producers from all around the world. It's a place
        to unite, socialize, and collaborate in the writing and production of
        original music, all from the comfort of your own home studio.
      </p>
      <p className="mb-[2rem] text-center">Click the icons below for details</p>
      <main className={styles.main}>
        <div className={styles.leftbox}>
          <div className={styles.toggleicon}>
            <svg
              className={styles.svg}
              viewBox="0 0 1024 1024"
              fill="currentColor"
              height="4rem"
              width="4rem"
            >
              <title>start a project</title>
              <path d="M928 444H820V330.4c0-17.7-14.3-32-32-32H473L355.7 186.2a8.15 8.15 0 00-5.5-2.2H96c-17.7 0-32 14.3-32 32v592c0 17.7 14.3 32 32 32h698c13 0 24.8-7.9 29.7-20l134-332c1.5-3.8 2.3-7.9 2.3-12 0-17.7-14.3-32-32-32zm-180 0H238c-13 0-24.8 7.9-29.7 20L136 643.2V256h188.5l119.6 114.4H748V444z" />
            </svg>
          </div>
          <div className={styles.toggleicon}>
            <IconMusic></IconMusic>
          </div>
          <div className={styles.toggleicon}>
            <IconMix></IconMix>
          </div>
          <div className={styles.toggleicon}>
            <svg
              viewBox="0 0 1024 1024"
              fill="currentColor"
              height="4rem"
              width="4rem"
              className={styles.svg}
            >
              <title>publish, license and sell</title>
              <path d="M120 160H72c-4.4 0-8 3.6-8 8v688c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V168c0-4.4-3.6-8-8-8zm833 0h-48c-4.4 0-8 3.6-8 8v688c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V168c0-4.4-3.6-8-8-8zM200 736h112c4.4 0 8-3.6 8-8V168c0-4.4-3.6-8-8-8H200c-4.4 0-8 3.6-8 8v560c0 4.4 3.6 8 8 8zm321 0h48c4.4 0 8-3.6 8-8V168c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v560c0 4.4 3.6 8 8 8zm126 0h178c4.4 0 8-3.6 8-8V168c0-4.4-3.6-8-8-8H647c-4.4 0-8 3.6-8 8v560c0 4.4 3.6 8 8 8zm-255 0h48c4.4 0 8-3.6 8-8V168c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v560c0 4.4 3.6 8 8 8zm-79 64H201c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h112c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm257 0h-48c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm256 0H648c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h178c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm-385 0h-48c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8z" />
            </svg>
          </div>
        </div>
        <div className={styles.rightbox}>
          <div className={styles.imgbox}>
            <Image
              src="/assets/images/william-hall-36WpSIixex0-unsplash-removebg-preview.jpg"
              alt="pic"
              height={400}
              width={400}
            ></Image>
          </div>
          <div className={styles.textbox}>
            <h3 className="text-2xl text-center mb-[1rem]">
              It all starts with an idea
            </h3>
            <h4 className="text-xl text-center mb-[1rem]">
              Start or join a collaboration project
            </h4>
            <p className="mb-[2rem]">
              Whether it's a guitar riff, drum loop, a vocal a cappella or
              lyrics - just start your own music collaboration project and
              upload your idea. Then, wait for others to join in, or send
              invites to other members. You can also jump in on any other open
              project by uploading your idea as an audition.
            </p>
            <h4 className="mb-[1rem]">
              Here's what you can expect as a ProCollabs member
            </h4>
            <ul className="flex flex-col gap-[.4rem]">
              <li>
                Opportunities to co-write and produce music in all genres and
                styles
              </li>
              <li>
                A like-minded community bubbling with experience and talent
              </li>
              <li>
                Privacy options and flexibilty in managing your collaboration
                projects
              </li>
              <li>
                A safe and private environment to share and exchange ideas
              </li>
              <li> Transparency in song ownership and production credits</li>
              <li>
                A secure, reliable, and feature filled platform for online music
                collaboration
              </li>
            </ul>
          </div>
        </div>
      </main>
      {/* <SecondCarousel slides={[1,2,3,4]} ></SecondCarousel> */}
    </section>
  );
};

export default About;
