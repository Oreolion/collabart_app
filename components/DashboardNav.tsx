"use client";
import Link from "next/link";
import React, { useState } from "react";
import styles from "@/styles/dashboardnav.module.css";
import { SignedIn, useUser, useClerk } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { navbarLinks } from "@/constants";
import SVGIcon from "@/components/SVGIcon";

const DashboardNav = () => {
  const [showNav, setShowNav] = useState(true);
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    return pathname === href || pathname.startsWith(href);
  };

  const handleShowNavbar = () => {
    setShowNav(!showNav);
  };

  return (
    <div className={styles.dashboard__navcontainer}>
      <nav className={showNav ? styles.dashboard__nav : styles.collapseblock}>
        {!showNav && (
          <div className={styles.collapse__svg}>
            {navbarLinks.map((item) => {
              return (
                <Link key={item.label} href={item.route}>
                  <SVGIcon svgString={item.svg} />
                </Link>
              );
            })}

            <div className="flex flex-col gap-[2.5rem]">
              <Link className={styles.link} href={`/profile/${user?.id}`}>
                <svg
                  className={styles.svg}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <title>My Profile</title>

                  <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z" />
                </svg>
              </Link>
              <Link className={styles.link} href="/dashboard/nocontent">
                <svg
                  className={styles.svg}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <title>Notifications</title>

                  <path d="M224 0c-17.7 0-32 14.3-32 32V51.2C119 66 64 130.6 64 208v18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416H416c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8V208c0-77.4-55-142-128-156.8V32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z" />
                </svg>
              </Link>
              <svg
                className={styles.svg}
                onClick={() => signOut(() => router.push("/sign-in"))}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <title>Sign Out</title>
                <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
                <SignedIn></SignedIn>
              </svg>
            </div>
          </div>
        )}
        <div className={`${styles.logo} ${styles.link}`}>
          <Link href="/">
            <h3 className={styles.h3}>
              <span className={styles.span}>Collab</span>
              <span className="text-red-600 font-bold bg-slate-200">@</span>
              <span className="text-yellow-300">RT</span>
            </h3>
          </Link>
        </div>
        <div className={styles.user}>
          <div className={styles.user__info}></div>
        </div>

        <ul className={styles.dashboard__navlists}>
          <h5 className={styles.h5}>Overview</h5>

          <li className={styles.li} key="Homefeeds">
            <Link
              href="/dashboard"
              className={`${styles.link} ${isLinkActive("/dashboard") ? styles.active_link : ""}`}
            >
              <SVGIcon
                svgString={`<svg className="${styles.svg}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
              <title>HomeFeeds</title>
              <path d="M211.2 96a64 64 0 1 0 -128 0 64 64 0 1 0 128 0zM32 256c0 17.7 14.3 32 32 32h85.6c10.1-39.4 38.6-71.5 75.8-86.6c-9.7-6-21.2-9.4-33.4-9.4H96c-35.3 0-64 28.7-64 64zm461.6 32H576c17.7 0 32-14.3 32-32c0-35.3-28.7-64-64-64H448c-11.7 0-22.7 3.1-32.1 8.6c38.1 14.8 67.4 47.3 77.7 87.4zM391.2 226.4c-6.9-1.6-14.2-2.4-21.6-2.4h-96c-8.5 0-16.7 1.1-24.5 3.1c-30.8 8.1-55.6 31.1-66.1 60.9c-3.5 10-5.5 20.8-5.5 32c0 17.7 14.3 32 32 32h224c17.7 0 32-14.3 32-32c0-11.2-1.9-22-5.5-32c-10.8-30.7-36.8-54.2-68.9-61.6zM563.2 96a64 64 0 1 0 -128 0 64 64 0 1 0 128 0zM321.6 192a80 80 0 1 0 0-160 80 80 0 1 0 0 160zM32 416c-17.7 0-32 14.3-32 32s14.3 32 32 32H608c17.7 0 32-14.3 32-32s-14.3-32-32-32H32z"/>
            </svg>`}
              />
              <p className={styles.linktext}>Homefeeds</p>
            </Link>
          </li>
          <li className={styles.li} key="Create Post">
            <Link
              href="/create-post"
              className={`${styles.link} ${isLinkActive("/create-post") ? styles.active_link : ""}`}
            >
              <SVGIcon
                svgString={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <title>Create Post</title>
              <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/>
            </svg>`}
              />
              <p className={styles.linktext}>Create Post</p>
            </Link>
          </li>
          <li className={styles.li} key="Bookmarks">
            <Link
              href="/bookmarks"
              className={`${styles.link} ${isLinkActive("/bookmarks") ? styles.active_link : ""}`}
            >
              <SVGIcon
                svgString={`<svg className="${styles.svg}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
              <title>Bookmarks</title>
              <path d="M0 48V487.7C0 501.1 10.9 512 24.3 512c5 0 9.9-1.5 14-4.4L192 400 345.7 507.6c4.1 2.9 9 4.4 14 4.4c13.4 0 24.3-10.9 24.3-24.3V48c0-26.5-21.5-48-48-48H48C21.5 0 0 21.5 0 48z"/>
            </svg>`}
              />
              <p className={styles.linktext}>Bookmarks</p>
            </Link>
          </li>

          <h5 className={styles.h5}>Personal</h5>

          <li className={styles.li}>
            <Link className={styles.link} href={`/profile/${user?.id}`}>
              <svg
                className={styles.svg}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z" />
              </svg>
              <p className={styles.p}>My Profile</p>
            </Link>
          </li>
          <li className={styles.li}>
            <Link className={styles.link} href="/dashboard/nocontent">
              <svg
                className={styles.svg}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path d="M224 0c-17.7 0-32 14.3-32 32V51.2C119 66 64 130.6 64 208v18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416H416c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8V208c0-77.4-55-142-128-156.8V32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z" />
              </svg>
              Notifications
            </Link>
          </li>
          <li>
            <div className={styles.link}>
              <svg
                className={`${styles.svg} ${styles.hide}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
              </svg>
              <SignedIn>
                <p
                  className={`${styles.p} ${styles.hide}`}
                  onClick={() => signOut(() => router.push("/sign-in"))}
                  //   className="text-16 w-40 bg-orange-1 font-extrabold"
                >
                  Log Out
                </p>
              </SignedIn>
            </div>
          </li>
        </ul>
      </nav>

      {!showNav && (
        <div className={`${styles.otherlogo} ${styles.link}`}>
          <Link href="/">
            <h3 className={styles.h3}>
              <span className={styles.span}>Collab</span>
              <span className="text-red-600 font-bold bg-slate-200">@</span>
              <span className="text-yellow-300">RT</span>
            </h3>
          </Link>
        </div>
      )}

      <div className={styles.show_nav}>
        {!showNav ? (
          <button
            type="button"
            onClick={handleShowNavbar}
            className={showNav ? styles.close_btn : styles.onclose_btn}
          >
            {showNav ? "<" : ">"}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleShowNavbar}
              className={showNav ? styles.close_btn : styles.onclose_btn}
            >
              &lt;
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardNav;
