import React from "react";
import styles from "../styles/hero.module.css";
import Carousel from "./Carousel";
import { mySlides } from "@/constants";

const Hero = () => {
  return (
    <section className={styles.hero__container}>
      <Carousel slides={mySlides}></Carousel>
    </section>
  );
};

export default Hero;
