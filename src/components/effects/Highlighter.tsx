"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HighlighterProps {
  children: React.ReactNode;
  className?: string;
  color?: "yellow" | "amber" | "blue" | "green";
  animate?: boolean;
}

export function Highlighter({
  children,
  className,
  color = "yellow",
  animate = false,
}: HighlighterProps) {
  const colors = {
    yellow: "rgba(255, 230, 0, 0.35)",
    amber: "rgba(230, 162, 60, 0.35)",
    blue: "rgba(91, 141, 239, 0.25)",
    green: "rgba(107, 203, 119, 0.25)",
  };

  if (animate) {
    return (
      <motion.span
        className={cn("relative inline", className)}
        initial={{ backgroundSize: "0% 40%" }}
        whileInView={{ backgroundSize: "100% 40%" }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          backgroundImage: `linear-gradient(180deg, transparent 60%, ${colors[color]} 60%)`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "0 100%",
          padding: "0 4px",
          margin: "0 -4px",
        }}
      >
        {children}
      </motion.span>
    );
  }

  return (
    <span
      className={cn("highlight", className)}
      style={{
        background: `linear-gradient(180deg, transparent 60%, ${colors[color]} 60%)`,
        padding: "0 4px",
        margin: "0 -4px",
      }}
    >
      {children}
    </span>
  );
}

interface HandwrittenTextProps {
  children: React.ReactNode;
  className?: string;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "div";
  tilted?: boolean;
}

export function HandwrittenText({
  children,
  className,
  as: Component = "span",
  tilted = false,
}: HandwrittenTextProps) {
  return (
    <Component
      className={cn(
        "font-handwritten text-[1.2em]",
        tilted && "inline-block transform -rotate-1",
        className
      )}
    >
      {children}
    </Component>
  );
}
