"use client";
import React from "react";
import styles from "@/styles/dashboard.module.css";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import ProjectItem from "@/components/ProjectItem";
import SearchBar from "@/components/SearchBar";

const Page = () => {
  const { user } = useUser();
  const router = useRouter();

  return (
    <section className={styles.dashboard__feeds}>
      <SearchBar />
      <main className={styles.content__box}>
        <ProjectItem />
      </main>
    </section>
  );
};

export default Page;
