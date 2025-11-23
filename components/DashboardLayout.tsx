// app/(dashboard)/layout.tsx
"use client";
import DashboardNav from "@/components/DashboardNav";
import MobileDashBoardNav from "@/components/MobileDashBoardNav";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import React from "react";
import styles from "@/styles/dashboardlayout.module.css";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [showNav, setShowNav] = useState(true);

  const handleNavToggle = (navState: boolean) => {
    setShowNav(navState);
  };
  return (
    <div className={styles.dashboard_layout}>
      <DashboardNav onNavToggle={handleNavToggle} />{" "}
      <MobileDashBoardNav></MobileDashBoardNav>
      <main
        className={`${styles.dashboard_content} ${showNav ? "" : styles.expanded}`}
      >{children}</main>
      <Toaster/>
    </div>
  );
};

export default DashboardLayout;