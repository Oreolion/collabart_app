"use client";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import IconMusic from "./IconMusic";
import IconMix from "./IconMix";
import IconPc from "./IconPc";
import IconSave from "./IconSave";
import styles from "../styles/about.module.css";

export default function ToggleBoxes() {
  const [activeIndex, setActiveIndex] = useState(0);
  const contentVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };
// @ts-expect-error type-error
  const handleToggle = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <main className={styles.main}>
      <div className={styles.leftbox}>
        <div className={styles.toggleicon} onClick={() => handleToggle(0)}>
          <svg
            className={styles.svg}
            viewBox="0 0 1024 1024"
            fill="currentColor"
            height="4rem"
            width="4rem"
          >
            <title>Start a project</title>
            <path d="M928 444H820V330.4c0-17.7-14.3-32-32-32H473L355.7 186.2a8.15 8.15 0 00-5.5-2.2H96c-17.7 0-32 14.3-32 32v592c0 17.7 14.3 32 32 32h698c13 0 24.8-7.9 29.7-20l134-332c1.5-3.8 2.3-7.9 2.3-12 0-17.7-14.3-32-32-32zm-180 0H238c-13 0-24.8 7.9-29.7 20L136 643.2V256h188.5l119.6 114.4H748V444z" />
          </svg>
        </div>
        <div className={styles.toggleicon} onClick={() => handleToggle(1)}>
          <IconMusic />
        </div>
        <div className={styles.toggleicon} onClick={() => handleToggle(2)}>
          <IconMix />
        </div>
        <div className={styles.toggleicon} onClick={() => handleToggle(3)}>
          <svg
            viewBox="0 0 1024 1024"
            fill="currentColor"
            height="4rem"
            width="4rem"
            className={styles.svg}
          >
            <title>Publish, license and sell</title>
            <path d="M120 160H72c-4.4 0-8 3.6-8 8v688c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V168c0-4.4-3.6-8-8-8zm833 0h-48c-4.4 0-8 3.6-8 8v688c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V168c0-4.4-3.6-8-8-8zM200 736h112c4.4 0 8-3.6 8-8V168c0-4.4-3.6-8-8-8H200c-4.4 0-8 3.6-8 8v560c0 4.4 3.6 8 8 8zm321 0h48c4.4 0 8-3.6 8-8V168c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v560c0 4.4 3.6 8 8 8zm126 0h178c4.4 0 8-3.6 8-8V168c0-4.4-3.6-8-8-8H647c-4.4 0-8 3.6-8 8v560c0 4.4 3.6 8 8 8zm-255 0h48c4.4 0 8-3.6 8-8V168c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v560c0 4.4 3.6 8 8 8zm-79 64H201c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h112c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm257 0h-48c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm256 0H648c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h178c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm-385 0h-48c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8z" />
          </svg>
        </div>
      </div>

      {/* Right Boxes */}
      <div className={styles.rightbox}>
        {activeIndex === 0 && (
          <motion.div
            className={styles.content}
            key={0}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={contentVariants}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.imgbox}>
              <Image
                src="/assets/images/william-hall-36WpSIixex0-unsplash-removebg-preview.png"
                alt="pic"
                height={500}
                width={600}
              ></Image>
            </div>
            <div className={styles.textbox}>
              <h3 className="text-2xl text-center mb-[1rem] max-md:text-xl max-md:mb-[.5rem] max-md:ml-[-3rem]">
                It all starts with an idea
              </h3>
              <h4 className="font-bold text-center mb-[.5rem] max-md:ml-[-2rem] max-md:max-w-[19rem]">
                Start or join a collaboration project
              </h4>
              <p className="mb-[1rem] text-sm">
                Whether it&apos;s a guitar riff, drum loop, a vocal a cappella
                or lyrics - just start your own music collaboration project and
                upload your idea. Then, wait for others to join in, or send
                invites to other members. You can also jump in on any other open
                project by uploading your idea as an audition.
              </p>
              <h4 className="mb-[1rem] font-bold max-md:ml-[0rem] max-md:max-w-[17rem]">
                Here&apos;s what you can expect as a CollabArts member
              </h4>

              <ul className="flex flex-col gap-[.4rem]">
                <li className="flex gap-[1rem]">
                  <div className={styles.icon}>
                    <Image
                      src="/assets/icons/music-svgrepo-com.svg"
                      alt="icon"
                      height={20}
                      width={20}
                    ></Image>{" "}
                  </div>
                  <p className="text-sm max-md:max-w-[14rem]">
                    Opportunities to co-write and produce music in all genres
                    and styles
                  </p>
                </li>
                <li className="flex gap-[1rem]">
                  <div className={styles.icon}>
                    <Image
                      src="/assets/icons/group-svgrepo-com.svg"
                      alt="icon"
                      height={20}
                      width={20}
                    ></Image>
                  </div>
                  <p className="text-sm max-md:max-w-[14rem]">
                    A like-minded community bubbling with experience and talent
                  </p>
                </li>
                <li className="flex gap-[1rem]">
                  <div className={styles.icon}>
                    <Image
                      src="/assets/icons/headphone.svg"
                      alt="icon"
                      height={20}
                      width={20}
                    ></Image>
                  </div>
                  <p className="text-sm max-md:max-w-[14rem]">
                    Privacy options and flexibilty in managing your
                    collaboration projects
                  </p>
                </li>
                <li className="flex gap-[1rem]">
                  <div className={styles.icon}>
                    <Image
                      src="/assets/icons/microphone.svg"
                      alt="icon"
                      height={20}
                      width={20}
                    ></Image>
                  </div>
                  <p className="text-sm max-md:max-w-[14rem]">
                    A safe and private environment to share and exchange ideas
                  </p>
                </li>
                <li className="flex gap-[1rem]">
                  <div className={styles.icon}>
                    <Image
                      src="/assets/icons/copyright-svgrepo-com.svg"
                      alt="icon"
                      height={20}
                      width={20}
                    ></Image>
                  </div>
                  <p className="text-sm max-md:max-w-[14rem]">
                    Transparency in song ownership and production credits
                  </p>
                </li>
                <li className="flex gap-[1rem]">
                  <div className={styles.icon}>
                    <Image
                      src="/assets/icons/world-1-svgrepo-com.svg"
                      alt="icon"
                      height={20}
                      width={20}
                    ></Image>
                  </div>
                  <p className="text-sm max-md:max-w-[14rem]">
                    A secure, reliable, and feature filled platform for online
                    music collaboration
                  </p>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
        {activeIndex === 1 && (
          <motion.div
            className={styles.content}
            key={0}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={contentVariants}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.imgbox}>
              <Image
                src="/assets/images/vadim-artyukhin-IB1rjfAZQDk-unsplash-removebg-preview.png"
                alt="pic"
                height={450}
                width={500}
              ></Image>
            </div>
            <div className={styles.textbox}>
              <h3 className="text-2xl text-center mb-[1rem] max-md:text-xl max-md:mb-[.5rem] max-md:ml-[-3rem]">
                Write and record your music
              </h3>
              <h4 className="font-bold text-center mb-[.5rem] max-md:ml-[-2rem] max-md:max-w-[19rem]">
                Collaborate with other writers and musicians
              </h4>
              <p className="mb-[1rem] text-sm max-md:max-w-[14rem]">
                All you need is a passion for music, some basic recording
                equipment, and a willingness to interact and learn.
              </p>
              <p className="mb-[1rem] text-sm max-md:max-w-[14rem]">
                You&apos;ll collaborate with others to write the lyrics and
                music, then record and upload your individual performance to the
                project area.{" "}
              </p>
              <h4 className="mb-[1rem] font-bold max-md:ml-[-2rem] max-md:max-w-[19rem]">
                Some essentials you&apos;ll need:{" "}
              </h4>
              <ul className="flex flex-col gap-[.4rem]">
                <li className="flex gap-[1rem]">
                  <div className={styles.icon}>
                    <IconPc></IconPc>
                  </div>
                  <p className="text-sm max-md:max-w-[14rem]">
                    PC or Mac computer with a good quality audio interface
                    styles
                  </p>
                </li>
                <li className="flex gap-[1rem]">
                  <div className={styles.icon}>
                    <IconSave></IconSave>
                  </div>
                  <p className="text-sm max-md:max-w-[14rem]">
                    Digital Audio Workstation (DAW) recording software{" "}
                  </p>
                </li>
                <li className="flex gap-[1rem]">
                  <div className={styles.icon}>
                    <Image
                      src="/assets/icons/headphone.svg"
                      alt="icon"
                      height={20}
                      width={20}
                    ></Image>
                  </div>
                  <p className="text-sm max-md:max-w-[14rem]">
                    Studio monitors or a good pair of headphones
                  </p>
                </li>
                <li className="flex gap-[1rem]">
                  <div className={styles.icon}>
                    <Image
                      src="/assets/icons/microphone.svg"
                      alt="icon"
                      height={20}
                      width={20}
                    ></Image>
                  </div>
                  <p className="text-sm max-md:max-w-[14rem]">
                    Microphone (if recording vocals or acoustic audio){" "}
                  </p>
                </li>

                <li className="flex gap-[1rem]">
                  <div className={styles.icon}>
                    <Image
                      src="/assets/icons/discover.svg"
                      alt="icon"
                      height={20}
                      width={20}
                    ></Image>
                  </div>
                  <p className="text-sm max-md:max-w-[14rem]">
                    A recording room or quiet space
                  </p>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
        {activeIndex === 2 && (
          <motion.div
            className={styles.content}
            key={0}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={contentVariants}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.imgbox}>
              <Image
                src="/assets/images/pexels-studioideahd-8568090-removebg-preview.png"
                alt="pic"
                height={450}
                width={500}
              ></Image>
            </div>
            <div className={styles.textbox}>
              <h3 className="text-2xl text-center mb-[1rem] max-md:text-xl max-md:mb-[.5rem] max-md:ml-[-3rem]">
                Mix and produce your song
              </h3>
              <h4 className="font-bold text-center mb-[.5rem] max-md:ml-[-2rem] max-md:max-w-[19rem]">
                Mix, master, and polish your songs to perfection!
              </h4>
              <p className="mb-[1rem] text-sm">
                Once a song has taken shape and all collaborators have uploaded
                and fined tuned their contributions, it&apos;s time to mix! And
                if that ain&apos;t your specialty, no worries, you&apos;ll find
                many talented audio engineers on CollabArts who&apos;ll be more
                than happy to participate.
              </p>

              <h4 className="mb-[1rem] font-bold max-md:ml-[-2rem] max-md:max-w-[19rem]">
                Completing your collaboration project on CollabArts
              </h4>
              <ul className="flex flex-col gap-[.4rem]">
                <li className="flex gap-[1rem]">
                  <div className={styles.icon}>
                    <Image
                      src="/assets/icons/like-shapes-svgrepo-com.svg"
                      alt="icon"
                      height={20}
                      width={20}
                    ></Image>
                  </div>
                  <p className="text-sm">
                    Collaborator agreement and final sign off
                  </p>
                </li>
                <li className="flex gap-[1rem]">
                  <div className={styles.icon}>
                    <Image
                      src="/assets/icons/chart-pie-svgrepo-com.svg"
                      alt="icon"
                      height={20}
                      width={20}
                    ></Image>
                  </div>
                  <p className="text-sm">
                    Song datasheets for track information and collaborator
                    splits
                  </p>
                </li>
                <li className="flex gap-[1rem]">
                  <div className={styles.icon}>
                    <Image
                      src="/assets/icons/padlock-outlined-svgrepo-com.svg"
                      alt="icon"
                      height={20}
                      width={20}
                    ></Image>
                  </div>
                  <p className="text-sm">
                    Option to protect your songs with audio watermarking
                  </p>
                </li>
                <li className="flex gap-[1rem]">
                  <div className={styles.icon}>
                    <Image
                      src="/assets/icons/dollar-svgrepo-com.svg"
                      alt="icon"
                      height={20}
                      width={20}
                    ></Image>
                  </div>
                  <p className="text-sm">
                    Publish to the CollabArts Music Library and pursue
                    commercial interest
                  </p>
                </li>
                <li className="flex gap-[1rem]">
                  <div className={styles.icon}>
                    <Image
                      src="/assets/icons/file-check-svgrepo-com.svg"
                      alt="icon"
                      height={20}
                      width={20}
                    ></Image>
                  </div>
                  <p className="text-sm">
                    Or, allow pre-approved uses with a Creative Commons license
                  </p>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
        {activeIndex === 3 && (
          <motion.div
            className={styles.content}
            key={0}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={contentVariants}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.imgbox}>
              <Image
                src="/assets/images/publish.png"
                alt="pic"
                height={450}
                width={300}
              ></Image>
            </div>
            <div className={styles.textbox}>
              <h3 className="text-2xl text-center mb-[1rem] max-md:text-sm max-md:mb-[.5rem] max-md:ml-[-2rem]">
                Publish, license and sell your work
              </h3>
              <h4 className="font-bold text-center mb-[.5rem]">
                Free to Use Anywhere
              </h4>
              <p className="mb-[1rem] text-sm">
                Once your song is completed, you and your collaborators are free
                to sell your song, give it away, or shop it around to music
                publishers and licensors.
              </p>

              <h4 className="mb-[1rem] font-bold">Retain 100% Ownership</h4>
              <p className="mb-[1rem] text-sm">
                Songwriting and sound recording copyrights remain wholly owned
                by collaborators.
              </p>
              <ul className="flex flex-col gap-[.4rem]">
                <li className="flex gap-[1rem]">
                  <div className={styles.icon}>
                    <IconPc></IconPc>
                  </div>
                  <p className="text-sm max-md:max-w-[14rem]">
                    PC or Mac computer with a good quality audio interface
                    styles
                  </p>
                </li>
                <li className="flex gap-[1rem]">
                  <div className={styles.icon}>
                    <IconSave></IconSave>
                  </div>
                  <p className="text-sm max-md:max-w-[14rem]">
                    Digital Audio Workstation (DAW) recording software{" "}
                  </p>
                </li>
                <li className="flex gap-[1rem]">
                  <div className={styles.icon}>
                    <Image
                      src="/assets/icons/headphone.svg"
                      alt="icon"
                      height={20}
                      width={20}
                    ></Image>
                  </div>
                  <p className="text-sm max-md:max-w-[14rem]">
                    Studio monitors or a good pair of headphones
                  </p>
                </li>
                <li className="flex gap-[1rem]">
                  <div className={styles.icon}>
                    <Image
                      src="/assets/icons/microphone.svg"
                      alt="icon"
                      height={20}
                      width={20}
                    ></Image>
                  </div>
                  <p className="text-sm max-md:max-w-[14rem]">
                    Microphone (if recording vocals or acoustic audio){" "}
                  </p>
                </li>

                <li className="flex gap-[1rem]">
                  <div className={styles.icon}>
                    <Image
                      src="/assets/icons/discover.svg"
                      alt="icon"
                      height={20}
                      width={20}
                    ></Image>
                  </div>
                  <p className="text-sm max-md:max-w-[14rem]">
                    A recording room or quiet space
                  </p>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
