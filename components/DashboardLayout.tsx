"use client";
import DashboardNav from "@/components/DashboardNav";
import MobileDashBoardNav from "@/components/MobileDashBoardNav";
import PageTransition from "@/components/PageTransition";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import React from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background ambient-bg">
      <DashboardNav collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <MobileDashBoardNav />
      <main
        className={`relative z-10 flex-1 transition-all duration-300 ${
          collapsed ? "md:ml-[4.5rem]" : "md:ml-60"
        } mt-14 md:mt-0 overflow-y-auto`}
      >
        <PageTransition>{children}</PageTransition>
      </main>
      <Toaster />
    </div>
  );
};

export default DashboardLayout;
