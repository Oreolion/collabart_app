"use client";
import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/lib/useDebounce";

const SearchBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || "");
  const debouncedValue = useDebounce(search, 300);

  useEffect(() => {
    if (debouncedValue) {
      const params = new URLSearchParams(searchParams);
      params.set('search', debouncedValue);
      router.push(`${pathname}?${params.toString()}`);
    } else if (!debouncedValue && pathname === "/dashboard") {
      router.push("/dashboard");
    }
  }, [debouncedValue, pathname, router, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div className="relative flex items-center">
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
      <input
        className="h-9 w-full rounded-md border border-border bg-muted/50 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        type="search"
        placeholder="Search projects..."
        value={search}
        onChange={handleChange}
      />
    </div>
  );
};

export default SearchBar;
