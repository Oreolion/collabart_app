"use client";
import React, { Suspense, useEffect } from "react";
import styles from "@/styles/projects.module.css";
import { useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";
import ProjectItem from "@/components/ProjectItem";
import SearchBar from "@/components/SearchBar";
import { Loader } from "lucide-react";

const Page = () => {
//   const { user } = useUser();
//   const router = useRouter();

const { user, isLoaded } = useUser();

useEffect(() => {
  console.log('my Projects Page Loaded');
  console.log('User:', user);
  console.log('Is Loaded:', isLoaded);
}, [user, isLoaded]);

  return (
    <section className={styles.project__feeds}>
           <Suspense fallback={<Loader/>}>
        <SearchBar />
      </Suspense>
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
