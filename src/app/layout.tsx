import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { DashboardNav } from "@/components/nav/DashboardNav";
import { PageTransition } from "@/components/motion/PageTransition";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: {
    default: "Mark Protsyuk",
    template: "%s · Mark Protsyuk",
  },
  description:
    "Software engineer. Projects, writing, and what I'm building toward.",
  openGraph: {
    title: "Mark Protsyuk",
    description:
      "Software engineer. Projects, writing, and what I'm building toward.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${display.variable} ${sans.variable} ${mono.variable} font-sans min-h-screen flex flex-col`}
      >
        <ThemeProvider>
          <DashboardNav />
          <main className="flex-1 w-full">
            <PageTransition>{children}</PageTransition>
          </main>
          <footer className="border-t border-line py-8 mt-16">
            <div className="mx-auto max-w-5xl px-6 flex items-center justify-between text-sm text-muted">
              <span>© {new Date().getFullYear()} Mark Protsyuk</span>
              <span className="font-mono text-xs">
                built with Next.js · designed on graph paper
              </span>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
