import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="relative border-t border-border/10 bg-card/40 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Logo */}
          <div>
            <Link href="/">
              <h3 className="text-lg font-bold tracking-tight mb-3">
                <span className="text-primary font-black">e</span>
                <span className="text-foreground">Collabs</span>
              </h3>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The digital playground for creators and artists.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h5 className="text-sm font-semibold text-foreground mb-3">Explore</h5>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Community</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Trending Blogs</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h5 className="text-sm font-semibold text-foreground mb-3">Support</h5>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Support Docs</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Join Forum</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Blog */}
          <div>
            <h5 className="text-sm font-semibold text-foreground mb-3">Official Blog</h5>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Official Blog</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Engineering Blog</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border/10 py-4 relative z-10">
        <p className="text-xs text-muted-foreground text-center">
          Terms of Service | Security | eCollabs 2025
        </p>
      </div>
    </footer>
  );
};

export default Footer;
