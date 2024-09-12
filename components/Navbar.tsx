"use client";
import Link from "next/link";
import React, { useState } from "react";
import styles from "../styles/navbar.module.css";

const Navbar = () => {
  const [toggleNavbar, setToggleNavbar] = useState<boolean>(false);

  const toggleMenu = () => {
    return setToggleNavbar(!toggleNavbar);
  };

  return (
    <header className={styles.header}>
      <div className={`${styles.logo} ${styles.link}`}>
        <Link href="/">
          <h3 className={styles.h3}>
            <span className={styles.span}>Collab</span>
            <span className="text-red-600 font-bold bg-slate-200">@</span>
            <span className="text-yellow-300">RT</span>
          </h3>
        </Link>
      </div>

      <nav className={styles.right__nav}>
        <div className={styles.nav__icons}>
          {toggleNavbar ? (
            <svg
              fill="#ddd"
              className={styles.svg}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 384 512"
              onClick={toggleMenu}
            >
              <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
            </svg>
          ) : (
            <div onClick={toggleMenu} className={styles.menu_bar}>
              <svg
                fill="#ddd"
                className={styles.svg}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z" />
              </svg>
            </div>
          )}
        </div>

        <ul className={styles.navlist}>
          <li>
            <Link className={styles.li} href="/">
              Home
            </Link>
          </li>
          <li>
            <Link className={styles.li} href="/sign-in">
              About
            </Link>
          </li>
          <li>
            <Link className={styles.li} href="/sign-in">
              Sign in
            </Link>
          </li>
          <li>
            <Link className={styles.li} href="/sign-up">
              <button type="button">Get Started</button>
            </Link>
          </li>
        </ul>
      </nav>
      {/*  Mobile Nav */}
      {toggleNavbar && (
        <nav className={styles.mobile__nav}>
          <ul className={styles.mobile_navlist}>
            <li>
              <Link className={styles.li} href="/">
                Home
              </Link>
            </li>
            <li>
              <Link className={styles.li} href="/sign-in">
                About
              </Link>
            </li>
            <li>
              <Link className={styles.li} href="/sign-in">
                Sign in
              </Link>
            </li>
            <li>
              <Link className={styles.li} href="/sign-up">
                <button type="button">Get Started</button>
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
