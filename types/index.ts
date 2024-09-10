export interface HeroCarouselDetails {
    id: number;
    h1: string;
    h3: string;
    p: string;
    imageUrl: string;
    btn1: string;
    btn2: string;
}

export interface HeroCarouselProps {
    slides: HeroCarouselDetails[]
}

export type UseDotButtonType = {
    selectedIndex: number;
    scrollSnaps: number[];
    onDotButtonClick: (index: number) => void;
  };