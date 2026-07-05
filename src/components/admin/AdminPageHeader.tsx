import Link from "next/link";

/** Consistent header block for admin pages: mono kicker, title, action. */
export function AdminPageHeader({
  kicker,
  title,
  description,
  action,
}: {
  kicker: string;
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-line pb-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          {kicker}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-muted">{description}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="shrink-0 rounded-md bg-accent text-white dark:text-bg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
