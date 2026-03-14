"use client";
import React, { useCallback } from "react";
import { EmblaCarouselType } from "embla-carousel";
import { DotButton, useDotButton } from "./EmblaCarouselDotButton";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { HeroCarouselProps } from "@/types";
import { Button } from "./ui/button";
import Link from "next/link";

const Carousel = ({ slides }: HeroCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000 }),
  ]);

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
    <div className="relative w-full h-full overflow-hidden" ref={emblaRef}>
      <div className="flex h-full">
        {slides.map((item) => (
          <div
            key={item.id}
            className="relative flex-[0_0_100%] min-w-0 h-screen min-h-[600px]"
          >
            {/* Background image */}
            <div
              className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-[8000ms]"
              style={{ backgroundImage: `url(${item.imageUrl})` }}
            />
            {/* Multi-layer gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/50 to-background" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 max-w-3xl mx-auto">
              <span className="text-primary font-bold text-sm uppercase tracking-[0.25em] mb-4 drop-shadow-[0_0_12px_hsl(262,83%,58%,0.3)]">
                {item.h1}
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4 drop-shadow-lg">
                {item.h3}
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
                {item.p}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/sign-up">
                  <Button size="lg" className="font-semibold px-8 glow-primary">
                    Sign Up For Free
                  </Button>
                </Link>
                <Link href="#about">
                  <Button size="lg" variant="outline" className="font-semibold px-8 border-border/40 text-foreground hover:bg-muted/50 backdrop-blur-sm">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {scrollSnaps.map((_, index) => (
          <DotButton
            key={index}
            onClick={() => onDotButtonClick(index)}
            selected={index === selectedIndex}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
