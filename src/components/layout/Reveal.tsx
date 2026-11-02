import type { CSSProperties, ReactNode } from "react";

/**
 * Content is visible by default. Scroll-driven enhancement is applied only in
 * CSS behind @supports and prefers-reduced-motion, so animation initialization
 * failure cannot hide essential content.
 */
export default function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const style = delay ? ({ "--reveal-delay": `${delay}s` } as CSSProperties) : undefined;
  return <div className={`reveal ${className}`.trim()} style={style}>{children}</div>;
}
