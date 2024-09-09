"use client"
import Image from "next/image";
import React, { useEffect, useState } from "react";
import 'animate.css';


const ScrollToTop = () => {
    const [hideButton, setHideButton] = useState(true);


  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY === 0) {
        setHideButton(true);
      } else {
        setHideButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div>
      <Image
        onClick={scrollToTop}
        style={{ display: hideButton ? "none" : "block" }}
        className="arrowup animate__animated animate__backInRight"
        src="/icons/icons8-slide-up-48.png"
        width={60}
        height={60}
        alt="arrowup"
      ></Image>
    </div>
  );
};

export default ScrollToTop;
