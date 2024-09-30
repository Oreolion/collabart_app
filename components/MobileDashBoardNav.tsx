"use client";
// import Image from "next/image";
import Link from "next/link";
import { SignedIn, UserButton, useUser, useClerk } from "@clerk/nextjs";
import React, { useEffect, useRef, useState } from "react";
import styles from "@/styles/mobiledashboardNav.module.css";
import { usePathname, useRouter } from "next/navigation";
import { navbarLinks } from "@/constants";
import SVGIcon from "@/components/SVGIcon";

const MobileDashBoardNav = () => {
  const [toggle, setToggle] = useState<boolean>(false);
  const [dropDown, setDropDown] = useState<boolean>(false);
  const [menuListdropDown, setMenuListDropDown] = useState<boolean>(false);
  const { signOut } = useClerk();
  const { user } = useUser();
  const pathname = usePathname();
  const myRef = useRef(null);

  const router = useRouter();
  function toggleMenu() {
    setToggle(!toggle);
  }
  function toggleDropDown() {
    setDropDown(!dropDown);
  }
  function toggleMenuListDropDown() {
    setMenuListDropDown(!menuListdropDown);
  }

  useEffect(() => {
    const handleScroll = () => {
      //@ts-expect-error type-error
      myRef?.current?.classList.remove("active");
      setToggle(false);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isLinkActive = (href: string) => {
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  };

  return (
    <>
      {/*  mobile dashboard navbar  */}
      {toggle && (
        <>
          <nav
            className={`${styles.dashboard__nav} ${styles.mobile}`}
            ref={myRef}
          >
            <div className={`${styles.logo} ${styles.link}`}>
              <Link href="/">
                <h3 className={styles.h3}>
                  <span className={styles.span}>Collab</span>
                  <span className="text-red-600 font-bold bg-slate-200">@</span>
                  <span className="text-yellow-300">RT</span>
                </h3>
              </Link>
            </div>

            <ul className={styles.dashboard__navlists}>
              <h5 className={styles.h5}>Overview</h5>
              <li className={styles.li}>
                {navbarLinks.map((item) => {
                  return (
                    <Link
                      key={item.label}
                      href={item.route}
                      className={`${styles.link} ${isLinkActive(`${item.route}`) ? styles.active_link : ""}`}
                    >
                      <SVGIcon svgString={item.svg} />

                      {item.label}
                    </Link>
                  );
                })}
              </li>

              <h5 className={styles.h5}>Personal</h5>
              <li className={styles.li}>
                <Link className={styles.link} href={`/my-profile/${user?.id}`}>
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
              {/* <li className={styles.li}>
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
              </li>*/}
              <li>
                <div className={styles.link}>
                  <svg
                    className={styles.svg}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                  >
                    <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
                  </svg>
                  <SignedIn>
                    <p
                      className={styles.p}
                      onClick={() => signOut(() => router.push("/sign-in"))}
                    >
                      Log Out
                    </p>
                  </SignedIn>
                </div>
              </li>
            </ul>
          </nav>
        </>
      )}

      <main className={styles.innerdashboard__container}>
        {/* <!-- header --> */}
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
              {!toggle ? (
                <>
                  <svg
                    onClick={toggleMenu}
                    className={`${styles.menu_bar} ${styles.svg}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                  >
                    <path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z" />
                  </svg>
                </>
              ) : (
                <svg
                  className={`${styles.close_btn} ${styles.svg}`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 384 512"
                  onClick={toggleMenu}
                >
                  <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
                </svg>
              )}

              <svg
                className={styles.notification_icon}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                onClick={toggleDropDown}
              >
                <path d="M224 0c-17.7 0-32 14.3-32 32V51.2C119 66 64 130.6 64 208v18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416H416c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8V208c0-77.4-55-142-128-156.8V32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z" />
              </svg>
            </div>
          </nav>

          <div className={styles.img__box}>
            <UserButton></UserButton>
          </div>

          <svg
            className={styles.menulist__icon}
            onClick={toggleMenuListDropDown}
            fill="#ccc"
            viewBox="0 0 16 16"
            height="1.5rem"
            width="1.5rem"
          >
            <path d="M7.646.146a.5.5 0 01.708 0L10.207 2H14a2 2 0 012 2v9a2 2 0 01-2 2H2a2 2 0 01-2-2V4a2 2 0 012-2h3.793L7.646.146zM1 7v3h14V7H1zm14-1V4a1 1 0 00-1-1h-3.793a1 1 0 01-.707-.293L8 1.207l-1.5 1.5A1 1 0 015.793 3H2a1 1 0 00-1 1v2h14zm0 5H1v2a1 1 0 001 1h12a1 1 0 001-1v-2zM2 4.5a.5.5 0 01.5-.5h8a.5.5 0 010 1h-8a.5.5 0 01-.5-.5zm0 4a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5zm0 4a.5.5 0 01.5-.5h6a.5.5 0 010 1h-6a.5.5 0 01-.5-.5z" />
          </svg>

          {dropDown && (
            <div className={styles.notificationbox}>
              <div className={styles.link}>
                You currently have no Notification.
              </div>
            </div>
          )}
          {menuListdropDown && (
            <div className={styles.menulist}>
              <Link href="/my-account" className={styles.link}>
                My Account
              </Link>
              <Link href="/legals" className={styles.link}>
                Legals
              </Link>
              <Link href="/" className={styles.link}>
                Contact Us
              </Link>
              <Link href="/" className={styles.link}>
                Downloads
              </Link>
            </div>
          )}
        </header>
      </main>
    </>
  );
};

export default MobileDashBoardNav;
