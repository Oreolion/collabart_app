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
              THE <span className={styles.span}>RA</span> APP
            </h3>
            <p className={`${styles.p} text-[#e67e22]`}>
              The <span className={styles.span}>Read Along</span> APP
            </p>
          </Link>
        </div>
        {/* <div className={styles.boxes}>
            
        </div> */}
        <div className={styles.box1}>
          <h5 className={styles.h5}>Explore</h5>
          <ul>
            <li className={styles.li}>Community</li>
            <li className={styles.li}>Trending Blogs</li>
            <li className={styles.li}>Read Along for teams</li>
          </ul>
        </div>
        <div className={styles.box1}>
          <h5 className={styles.h5}>Support</h5>
          <ul>
            <li className={styles.li}>Support Docs</li>
            <li className={styles.li}>Join Slack</li>
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
      <p className={styles.p1}>Term of Service | Security | the RA APP 2024</p>
    </footer>
  );
};

export default Footer;
