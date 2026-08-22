import { Fragment } from "react";

interface HighlightProps {
  /** Full text to render. */
  children: string;
  /** Word to highlight. Matched case-insensitively, whole-word. */
  term?: string;
  /** Class applied to each matched term. */
  className?: string;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Renders text with every occurrence of `term` wrapped in a styled span.
 * Defaults to painting "Adobe" in brand red.
 */
export function Highlight({
  children,
  term = "Adobe",
  className = "text-red font-semibold",
}: HighlightProps) {
  const pattern = new RegExp(`(${escapeRegExp(term)})`, "gi");
  const parts = children.split(pattern);
  const isMatch = (part: string) => part.toLowerCase() === term.toLowerCase();

  return (
    <>
      {parts.map((part, index) =>
        isMatch(part) ? (
          <span key={index} className={className}>
            {part}
          </span>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}
