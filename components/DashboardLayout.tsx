"use client";
import DashboardNav from "@/components/DashboardNav";
import MobileDashBoardNav from "@/components/MobileDashBoardNav";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import React from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardNav collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <MobileDashBoardNav />
      <main
        className={`flex-1 transition-all duration-300 ${
          collapsed ? "md:ml-[4.5rem]" : "md:ml-[15rem]"
        } mt-[3.5rem] md:mt-0 overflow-y-auto`}
      >
        {children}
      </main>
      <Toaster />
    </div>
  );
};

export default DashboardLayout;
