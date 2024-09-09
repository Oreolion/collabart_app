import React from "react";
import styles from "../styles/footer.module.css";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner_footer}>
        <div className={`${styles.logo} ${styles.link}`}>
          <Link href="/">
            <h3 className={styles.h3}>
              <span className={styles.span}>Collab</span>ART
            </h3>
          </Link>
        </div>
        {/* <div className={styles.boxes}>
            
        </div> */}
        <div className={styles.box1}>
          <h5 className={styles.h5}>Explore</h5>
          <ul>
            <li className={styles.li}>Community</li>
            <li className={styles.li}>Trending Blogs</li>
          </ul>
        </div>
        <div className={styles.box1}>
          <h5 className={styles.h5}>Support</h5>
          <ul>
            <li className={styles.li}>Support Docs</li>
            <li className={styles.li}>Join Forum</li>
            <li className={styles.li}>Contact</li>
          </ul>
        </div>
        <div className={styles.box1}>
          <h5 className={styles.h5}>Official Blog</h5>
          <ul>
            <li className={styles.li}>Official Blog</li>
            <li className={styles.li}>Engineering Blog</li>
          </ul>
        </div>
      </div>
      <p className={styles.p1}>Term of Service | Security | the CollabART APP 2024</p>
    </footer>
  );
};

export default Footer;
