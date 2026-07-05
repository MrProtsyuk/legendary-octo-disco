import Link from "next/link";
import { HeroConstellation } from "@/components/motion/HeroConstellation";

const socials = [
  { label: "GitHub", href: "https://github.com/markprotsyuk" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/markprotsyuk" },
  { label: "Instagram", href: "https://www.instagram.com/markprotsyuk" },
];

// Home stays minimal (§4.2): hero + socials + resume. Work is one click away.
export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <HeroConstellation />
      <section className="relative mx-auto max-w-5xl px-6 py-28 sm:py-40">
        <p className="font-mono text-sm text-accent mb-4">
          software engineer
        </p>
        <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.1] max-w-3xl">
          Precision from math, presence from theatre, patience from long runs.
        </h1>
        <p className="mt-6 text-lg text-muted max-w-xl">
          I&apos;m Mark — I build web software with care for both the system
          underneath and the person in front of it.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href="/resume.pdf"
            className="inline-flex items-center gap-2 rounded-md bg-accent text-white dark:text-bg px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            View résumé
          </a>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-md border border-line px-5 py-2.5 text-sm font-medium text-ink hover:border-muted transition-colors"
          >
            See the work →
          </Link>
        </div>

        <div className="mt-14 flex items-center gap-6">
          {socials.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-muted hover:text-accent transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
