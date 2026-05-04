"use client";
import Link from "next/link";
import { SignedIn, UserButton, useUser, useClerk } from "@clerk/nextjs";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  Bookmark,
  Wallet,
  User,
  LogOut,
  Menu,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationsPanel from "@/components/NotificationsPanel";

const navItems = [
  { route: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { route: "/projects", label: "Active Projects", icon: FolderKanban },
  { route: "/create-project", label: "Create Project", icon: PlusCircle },
  { route: "/my-projects", label: "My Projects", icon: Bookmark },
  { route: "/my-balance", label: "Funds", icon: Wallet },
  { route: "/ai-lab", label: "AI Lab", icon: Sparkles },
];

const MobileDashBoardNav = () => {
  const [open, setOpen] = useState(false);
  const { signOut } = useClerk();
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <>
      {/* Mobile Sheet Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 glassmorphism-black border-r border-border/10 p-0">
          {/* Logo */}
          <div className="flex h-14 items-center px-4 border-b border-border/10">
            <Link href="/" onClick={() => setOpen(false)} className="group">
              <h3 className="text-lg font-bold tracking-tight">
                <span className="text-primary font-black text-xl group-hover:drop-shadow-[0_0_8px_hsl(11,90%,58%,0.5)] transition-all duration-300">e</span>
                <span className="text-foreground">Collabs</span>
              </h3>
            </Link>
          </div>

          {/* Nav */}
          <div className="py-4 px-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
              Overview
            </p>
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.route}>
                  <Link
                    href={item.route}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive(item.route)
                        ? item.route === "/ai-lab"
                          ? "bg-violet-500/10 text-violet-300 shadow-[inset_0_0_12px_hsla(260,90%,65%,0.08)]"
                          : "bg-primary/10 text-primary shadow-[inset_0_0_12px_hsl(11,90%,58%,0.06)]"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-6 mb-2 px-2">
              Personal
            </p>
            <ul className="space-y-1">
              <li>
                <Link
                  href={`/my-profile/${user?.id}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    pathname.includes("/my-profile")
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <User className="h-5 w-5 shrink-0" />
                  <span>My Profile</span>
                </Link>
              </li>
              <li>
                <SignedIn>
                  <button
                    onClick={() => {
                      setOpen(false);
                      signOut(() => router.push("/sign-in"));
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                  >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span>Log Out</span>
                  </button>
                </SignedIn>
              </li>
            </ul>
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Top Header */}
      <header className="fixed top-0 left-0 right-0 z-20 flex md:hidden h-14 items-center justify-between glassmorphism-black border-b border-border/10 px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="text-foreground">
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="group">
            <h3 className="text-base font-bold tracking-tight">
              <span className="text-primary font-black text-lg group-hover:drop-shadow-[0_0_8px_hsl(11,90%,58%,0.5)] transition-all duration-300">e</span>
              <span className="text-foreground">Collabs</span>
            </h3>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <NotificationsPanel />
          <UserButton />
        </div>
      </header>
    </>
  );
};

export default MobileDashBoardNav;
