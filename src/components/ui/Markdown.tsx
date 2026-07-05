import ReactMarkdown from "react-markdown";

/** Server-rendered markdown with the site's typographic defaults. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-content">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
