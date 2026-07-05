/** Card panel grouping related form fields, with a mono kicker label. */
export function FormSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-surface p-6">
      <h2 className="font-mono text-xs uppercase tracking-widest text-accent mb-5">
        {label}
      </h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
