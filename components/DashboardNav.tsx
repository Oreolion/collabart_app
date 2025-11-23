// components/DashboardNav.tsx
"use client";

import React, { useState } from "react";
import styles from "@/styles/dashboardnav.module.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { navbarLinks } from "@/constants";
import SVGIcon from "@/components/SVGIcon";
import { SignedIn, useClerk, useUser } from "@clerk/nextjs";

const DashboardNav = ({ onNavToggle }: { onNavToggle: (navState: boolean) => void }) => {
  const [showNav, setShowNav] = useState(true);
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();
  const pathname = usePathname();

  const handleNavToggle = () => {
    const newState = !showNav;
    setShowNav(newState);
    onNavToggle(newState);
  };

  const isLinkActive = (href: string) => {
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  };

  return (
    <>
      <nav className={showNav ? styles.dashboard__nav : styles.collapseblock}>
        <div className={styles.logo}>
          <Link href="/">
            <h3 className={styles.h3}>
              <span className={styles.span}>Collab</span>
              <span className="text-red-600 font-bold bg-slate-200">@</span>
              <span className="text-yellow-300">RT</span>
            </h3>
          </Link>
        </div>

        {showNav ? (
          <Accordion type="multiple" className={styles.dashboard__navlists}>
            <AccordionItem value="overview">
              <AccordionTrigger className={styles.h5}>Overview</AccordionTrigger>
              <AccordionContent>
                {navbarLinks.slice(0, 4).map((item) => (
                  <Link
                    key={item.label}
                    href={item.route}
                    className={`${styles.link} ${isLinkActive(item.route) ? styles.active_link : ""}`}
                  >
                    <SVGIcon svgString={item.svg} />
                    {item.label}
                  </Link>
                ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="personal">
              <AccordionTrigger className={styles.h5}>Personal</AccordionTrigger>
              <AccordionContent>
                <Link className={styles.link} href={`/my-profile/${user?.id}`}>
                  <svg className={styles.svg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z" />
                  </svg>
                  <p className={styles.p}>My Profile</p>
                </Link>
                <Link className={styles.link} href={navbarLinks[4].route}>
                  <SVGIcon svgString={navbarLinks[4].svg} />
                  {navbarLinks[4].label}
                </Link>
              </AccordionContent>
            </AccordionItem>
            <div className={`${styles.link} ${styles.logout}`}>
              <svg className={styles.svg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
              </svg>
              <SignedIn>
                <p className={styles.p} onClick={() => signOut(() => router.push("/sign-in"))}>
                  Log Out
                </p>
              </SignedIn>
            </div>
          </Accordion>
        ) : (
          <div className={styles.collapse__svg}>
            {navbarLinks.map((item) => (
              <Link key={item.label} href={item.route} className={styles.link}>
                <SVGIcon svgString={item.svg} />
              </Link>
            ))}
            <Link href={`/my-profile/${user?.id}`} className={styles.link}>
              <svg className={styles.svg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z" />
              </svg>
            </Link>
            <div className={styles.link}>
              <svg className={styles.svg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
              </svg>
            </div>
          </div>
        )}
      </nav>
      <Button variant="ghost" className={showNav ? styles.close_btn : styles.onclose_btn} onClick={handleNavToggle}>
        {showNav ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="#ef4444" className="w-5 h-5">
            <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="#ef4444" className="w-5 h-5">
            <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
          </svg>
        )}
      </Button>
    </>
  );
};

export default DashboardNav;