"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/writing", label: "Writing" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav() {
  const pathname = usePathname();

  // The admin area has its own chrome — keep the public nav out of it.
  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-md">
      <nav className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight hover:text-accent transition-colors"
        >
          Mark Protsyuk
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {links.map(({ href, label }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-2.5 sm:px-3 py-2 text-sm transition-colors ${
                  active ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute left-2.5 right-2.5 -bottom-px h-0.5 bg-accent"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </Link>
            );
          })}
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
