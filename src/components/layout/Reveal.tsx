import type { ReactNode } from "react";

/**
 * Content is visible by default. One CSS scroll-driven transform enhances it
 * only behind @supports and motion/width guards. No time-delay stagger: delay
 * does not offset a scroll timeline. Pinned steps own their animation directly.
 */
export default function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`reveal ${className}`.trim()}>{children}</div>;
}
