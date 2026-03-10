"use client";
import React from "react";
import Carousel from "./Carousel";
import { mySlides } from "@/constants";

const Hero = () => {
  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden">
      <Carousel slides={mySlides} />
    </section>
  );
};

export default Hero;
