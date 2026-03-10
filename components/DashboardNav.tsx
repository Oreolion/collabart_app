"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SignedIn, useClerk, useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  Bookmark,
  Wallet,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { route: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { route: "/projects", label: "Active Projects", icon: FolderKanban },
  { route: "/create-project", label: "Create Project", icon: PlusCircle },
  { route: "/my-projects", label: "My Projects", icon: Bookmark },
  { route: "/my-balance", label: "Funds", icon: Wallet },
];

interface DashboardNavProps {
  collapsed: boolean;
  onToggle: () => void;
}

const DashboardNav = ({ collapsed, onToggle }: DashboardNavProps) => {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <nav
      className={cn(
        "fixed left-0 top-0 z-30 hidden md:flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-[4.5rem]" : "w-[15rem]"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center px-4 border-b border-border">
        <Link href="/" className="flex items-center gap-1">
          <h3 className={cn("text-lg font-bold tracking-tight transition-all", collapsed && "text-base")}>
            <span className="text-foreground">Collab</span>
            <span className="text-primary font-black">@</span>
            <span className="text-accent">RT</span>
          </h3>
        </Link>
      </div>

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto py-4 px-2">
        <p className={cn("text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2", collapsed && "sr-only")}>
          Overview
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.route}>
              <Link
                href={item.route}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.route)
                    ? "bg-primary/10 text-primary border-l-2 border-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>

        <div className={cn("mt-6 mb-2 px-2", collapsed && "sr-only")}>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Personal</p>
        </div>
        <ul className="space-y-1">
          <li>
            <Link
              href={`/my-profile/${user?.id}`}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.includes("/my-profile")
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? "My Profile" : undefined}
            >
              <User className="h-5 w-5 shrink-0" />
              {!collapsed && <span>My Profile</span>}
            </Link>
          </li>
          <li>
            <SignedIn>
              <button
                onClick={() => signOut(() => router.push("/sign-in"))}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? "Log Out" : undefined}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                {!collapsed && <span>Log Out</span>}
              </button>
            </SignedIn>
          </li>
        </ul>
      </div>

      {/* Collapse toggle */}
      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full flex items-center justify-center text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span className="ml-2 text-xs">Collapse</span>}
        </Button>
      </div>
    </nav>
  );
};

export default DashboardNav;
