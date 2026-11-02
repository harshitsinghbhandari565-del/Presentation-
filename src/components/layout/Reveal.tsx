"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
export default function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={false} whileInView={{ y: reduced ? 0 : [18, 0] }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}
