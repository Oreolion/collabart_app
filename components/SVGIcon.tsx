import React from "react";
import styles from "../styles/dashboardnav.module.css";

const SVGIcon = ({ svgString }: { svgString: string }) => {
  return (
    <span
        className={styles.svg}
      dangerouslySetInnerHTML={{ __html: svgString }}
      aria-hidden="true"
    />
  );
};

export default SVGIcon;
