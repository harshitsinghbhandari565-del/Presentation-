"use client";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface Props {
  children: ReactNode;
  variant?: "default" | "featured" | "utility";
  className?: string;
}

export default function GlassCard({
  children,
  variant = "default",
  className = "",
}: Props) {
  const variantClasses = 
    variant === "featured" 
      ? "glass-card-featured" 
      : variant === "utility"
        ? "glass-card-utility"
        : "";

  return (
    <motion.div 
      className={`glass-card ${variantClasses} ${className}`}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
