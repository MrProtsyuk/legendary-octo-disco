"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const adminLinks = [
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/writing", label: "Writing" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Login page renders bare — no admin chrome until authenticated.
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
        <nav className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/admin"
              className="font-mono text-sm text-ink hover:text-accent transition-colors"
            >
              <span className="text-accent">mark@site</span>
              <span className="text-muted">:</span>
              <span className="text-muted">~/admin</span>
              <span className="text-accent animate-pulse">▊</span>
            </Link>
            <div className="flex items-center gap-1 rounded-lg border border-line bg-surface p-1">
              {adminLinks.map(({ href, label }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`rounded-md px-3.5 py-1.5 text-sm transition-colors ${
                      active
                        ? "bg-accent/10 text-accent font-medium"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-md border border-line px-3 py-1.5 text-sm text-muted hover:text-ink hover:border-muted transition-colors"
            >
              View site ↗
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-md border border-line px-3 py-1.5 text-sm text-muted hover:text-red-500 hover:border-red-500/40 transition-colors"
            >
              Sign out
            </button>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-12">{children}</main>
    </div>
  );
}
