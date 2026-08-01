"use client";
import { ReactNode } from "react";

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
  const baseClasses = "glass-card";
  const variantClasses = 
    variant === "featured" 
      ? "glass-card-featured" 
      : variant === "utility"
        ? "glass-card-utility"
        : "";

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`}>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
