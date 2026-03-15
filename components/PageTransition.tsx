"use client";

import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

/**
 * Lightweight CSS-only page transition wrapper.
 * Re-triggers the page-enter animation on route change.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [animKey, setAnimKey] = useState(pathname);

  useEffect(() => {
    setAnimKey(pathname);
  }, [pathname]);

  return (
    <div key={animKey} className="animate-page-enter">
      {children}
    </div>
  );
}
