"use client";
import React from "react";
import styles from "@/styles/dashboardnav.module.css";
import { SignedIn, useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const Page = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();

  return (
    <section className="mt-[8rem]">
      <h1>This is the dashboard page</h1>
    </section>
  );
};

export default Page;
