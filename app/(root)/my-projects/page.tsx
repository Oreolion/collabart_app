"use client";
import React from "react";
import styles from "@/styles/projects.module.css";
// import { useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";
import ProjectItem from "@/components/ProjectItem";
import SearchBar from "@/components/SearchBar";

const Page = () => {
//   const { user } = useUser();
//   const router = useRouter();

  return (
    <section className={styles.project__feeds}>
      <SearchBar />
      <main className={styles.content__box}>
        <ProjectItem />
        <ProjectItem />
        <ProjectItem />
        <ProjectItem />
        <ProjectItem />
      </main>
    </section>
  );
};

export default Page;
