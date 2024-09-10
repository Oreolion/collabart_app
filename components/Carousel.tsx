"use client";
import React, { useCallback } from "react";
import { EmblaOptionsType, EmblaCarouselType } from "embla-carousel";
import { DotButton, useDotButton } from "./EmblaCarouselDotButton";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { HeroCarouselProps } from "@/types";
import styles from "../styles/hero.module.css";
import { Button } from "./ui/button";

const Carousel = ({ slides }: HeroCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()]);

  const onNavButtonClick = useCallback((emblaApi: EmblaCarouselType) => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (!autoplay || !("stopOnInteraction" in autoplay.options)) return;

    const resetOrStop =
      autoplay.options.stopOnInteraction === false
        ? (autoplay.reset as () => void)
        : (autoplay.stop as () => void);

    resetOrStop();
  }, []);

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(
    emblaApi,
    onNavButtonClick
  );

  return (
    <section
      className="flex w-[79rem] ml-[-6rem] flex-col overflow-hidden"
      ref={emblaRef}
    >
      <div className="flex">
        {slides.map((item) => (
          <figure
            key={item.id}
            style={{
              backgroundImage: `url(${item.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: '.85',
            }}
            className="relative h-[28rem] cursor-pointer flex items-center justify-center text-center"
          >
            <div className="relative z-10 mt-[6rem] flex flex-col rounded-b-xl p-4 w-[56rem] h-[32rem]">
              <h1 className={styles.h1}>{item.h1}</h1>
              <h3 className={styles.h3}>{item.h3}</h3>
              <p className={styles.p}>{item.p}</p>
              <div className="flex gap-[1rem] items-center justify-center max-md:ml-[-3rem] max-md:flex-col">
                <Button className="p-[1.5rem] font-bold">SIGN UP FOR FREE</Button>
                <Button className="p-[1.5rem] font-bold">LEARN MORE</Button>
              </div>
            </div>
          </figure>
        ))}
      </div>

      <div className="flex justify-center gap-2 absolute top-[7rem] right-4">
        {scrollSnaps.map((_, index) => (
          <DotButton
            key={index}
            onClick={() => onDotButtonClick(index)}
            selected={index === selectedIndex}
          />
        ))}
      </div>
    </section>
  );
};

export default Carousel;