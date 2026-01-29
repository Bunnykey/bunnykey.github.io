"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TagProps extends Omit<HTMLMotionProps<"span">, "children"> {
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "error";
  size?: "sm" | "md";
  interactive?: boolean;
  children: React.ReactNode;
}

const Tag = forwardRef<HTMLSpanElement, TagProps>(
  (
    {
      className,
      variant = "default",
      size = "sm",
      interactive = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center font-medium rounded-full transition-colors";

    const variants = {
      default: "bg-surface-raised text-text-secondary border border-border-light",
      primary: "bg-accent-primary/10 text-accent-primary border border-accent-primary/20",
      secondary: "bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20",
      success: "bg-success/10 text-success border border-success/20",
      warning: "bg-warning/10 text-warning border border-warning/20",
      error: "bg-error/10 text-error border border-error/20",
    };

    const sizes = {
      sm: "px-2.5 py-0.5 text-xs",
      md: "px-3 py-1 text-sm",
    };

    if (interactive) {
      return (
        <motion.span
          ref={ref}
          className={cn(
            baseStyles,
            variants[variant],
            sizes[size],
            "cursor-pointer hover:brightness-95",
            className
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          {...props}
        >
          {children}
        </motion.span>
      );
    }

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...(props as HTMLAttributes<HTMLSpanElement>)}
      >
        {children}
      </span>
    );
  }
);

Tag.displayName = "Tag";

export { Tag };
