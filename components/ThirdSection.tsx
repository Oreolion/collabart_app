import React from "react";
import styles from "../styles/thirdsection.module.css";
import { fourthSection } from "@/constants";
import Image from "next/image";

const ThirdSection = () => {
  return (
    <section className="bg-red-500">
      <h2 className={styles.h2}>
        Platform <strong className="font-bold">Features</strong>
      </h2>
      <p className="mb-[2rem] text-center font-bold">
        Members have access to a number of cool features on the site. We`&lsquo;`ve
        listed some of the main ones below.
      </p>
      <ul className={styles.ul}>
        {fourthSection.map((item) => {
          return (
            <>
              <li key={item.id} className={styles.li}>
                <Image
                  src={item.svgUrl}
                  alt="svg"
                  height={40}
                  width={40}
                ></Image>
                <div className="texts">
                  <h4 className={styles.h4}>{item.h4}</h4>
                  <p className={styles.p}>{item.p}</p>
                </div>
              </li>
            </>
          );
        })}
      </ul>
    </section>
  );
};

export default ThirdSection;
