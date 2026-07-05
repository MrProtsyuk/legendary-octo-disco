import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-32 text-center">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-4 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
        This page doesn&apos;t exist.
      </h1>
      <p className="mt-4 text-muted">
        Wrong turn on the graph paper. The lines all lead back home.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-md border border-line px-5 py-2.5 text-sm font-medium hover:border-muted transition-colors"
      >
        ← Back home
      </Link>
    </section>
  );
}
