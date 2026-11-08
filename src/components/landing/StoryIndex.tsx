"use client";
import { useEffect, useState } from "react";

/** Decorative chapter index. Content remains visible and keyboard-navigable without it. */
export default function StoryIndex() {
  const [active, setActive] = useState("story-step-1");
  useEffect(() => {
    const steps = Array.from(document.querySelectorAll<HTMLElement>(".how-step[id]"));
    if (!steps.length || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActive(visible.target.id);
    }, { rootMargin: "-30% 0px -45% 0px", threshold: [0.2, 0.5, 0.8] });
    steps.forEach(step => observer.observe(step));
    return () => observer.disconnect();
  }, []);
  return <nav className="story-index" aria-label="How it works chapters">
    {[1, 2, 3].map(n => <a key={n} href={`#story-step-${n}`} aria-current={active === `story-step-${n}` ? "step" : undefined}>{String(n).padStart(2, "0")}</a>)}
  </nav>;
}
