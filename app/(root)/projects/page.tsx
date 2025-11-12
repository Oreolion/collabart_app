// app/projects/page.tsx  (server)
import dynamic from "next/dynamic";
import React from "react";

const ProjectsClient = dynamic(
  () => import("@/components/ProjectsClient"),
  { ssr: false }
);

export default function ProjectsPage() {
  return <ProjectsClient />;
}
