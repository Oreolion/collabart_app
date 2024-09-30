"use client";
import React, { Suspense } from "react";
import styles from "@/styles/projects.module.css";
// import { useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";
import ProjectItem from "@/components/ProjectItem";
import SearchBar from "@/components/SearchBar";
import { Loader } from "lucide-react";
import ProjectList from "@/components/ProjectList";

const Page = () => {
//   const { user } = useUser();
//   const router = useRouter();

// const { user, isLoaded } = useUser();



  return (
    <section className={styles.project__feeds}>
           <Suspense fallback={<Loader/>}>
        <SearchBar />
      </Suspense>
      <h1 className="text-2xl font-bold mb-6">Active Collaboration Projects</h1>
      <main className={styles.content__box}>
        <ProjectList/>
       
        <ProjectItem />
        <ProjectItem />
      </main>
    </section>
  );
};

export default Page;
