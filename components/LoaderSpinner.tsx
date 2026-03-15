"use client";

import React from "react";

const LoaderSpinner = () => {
  return (
    <div className="flex-center h-screen w-full">
      <div className="flex flex-col items-center gap-4">
        {/* Branded eCollabs logo spinner */}
        <div className="relative w-16 h-16">
          {/* Outer ring — rotating */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          {/* Inner glow pulse */}
          <div className="absolute inset-2 rounded-full bg-primary/5 animate-pulse-glow" />
          {/* Centered "e" brand mark */}
          <span className="absolute inset-0 flex items-center justify-center text-primary font-black text-2xl select-none animate-float">
            e
          </span>
        </div>
        <p className="text-xs text-muted-foreground animate-pulse tracking-wide">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default LoaderSpinner;
