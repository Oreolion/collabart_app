import React from "react";
import styles from "@/styles/project.module.css";
import Project from "@/components/Project";

const ProjectPage = () => {
  return (
    <div className={styles.projects__feeds}>
      <Project />
    </div>
  );
};

export default ProjectPage;
