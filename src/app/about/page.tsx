import type { Metadata } from "next";
import { HeroConstellation } from "@/components/motion/HeroConstellation";

export const metadata: Metadata = {
  title: "About",
  description:
    "Engineering background, and the through-line between math, theatre, and running.",
};

// Copy is a starting point per §4.5 — the structure follows the suggested shape:
// engineering background → the through-line → what's next.
export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      <HeroConstellation variant="ambient" />
      <section className="relative mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
        About
      </h1>

      <div className="mt-8 space-y-6 text-ink leading-relaxed">
        <p>
          I&apos;m a software engineer with a background in computer science
          and mathematics. I&apos;ve built production web applications end to
          end — TypeScript, React, Next.js, and the data layers underneath —
          and I care as much about why a system is shaped the way it is as
          about whether it works.
        </p>
        <p>
          Outside of code: theatre and long-distance running. They sound
          unrelated, but they share a spine with engineering — discipline,
          repetition, and performing under constraints. A proof, a play, and a
          marathon all reward the same thing: showing up, doing the reps, and
          staying composed when it counts.
        </p>
        <p>
          Right now I&apos;m building toward work where engineering judgment
          matters — systems with real users, real trade-offs, and room to keep
          learning. If that sounds like something you&apos;re working on,{" "}
          <a
            href="mailto:protsyukmark@gmail.com"
            className="text-accent underline underline-offset-2 hover:opacity-80"
          >
            get in touch
          </a>
          .
        </p>
      </div>
      </section>
    </div>
  );
}
