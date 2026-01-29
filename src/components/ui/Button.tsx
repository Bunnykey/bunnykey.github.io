"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const buttonStyles = {
  base: "inline-flex items-center justify-center font-medium rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  variants: {
    primary:
      "bg-accent-primary text-white hover:brightness-110 focus-visible:ring-accent-primary",
    secondary:
      "bg-transparent border border-border hover:bg-surface hover:shadow-md focus-visible:ring-accent-secondary text-text-primary",
    ghost:
      "bg-transparent hover:bg-surface-raised text-text-primary focus-visible:ring-accent-primary",
  },
  sizes: {
    sm: "h-9 px-3 text-sm min-w-[36px]",
    md: "h-11 px-5 text-base min-w-[44px]",
    lg: "h-12 px-6 text-lg min-w-[48px]",
  },
};

export interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      onClick,
      type = "button",
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        type={type}
        className={cn(
          buttonStyles.base,
          buttonStyles.variants[variant],
          buttonStyles.sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        onClick={onClick}
        whileHover={
          !disabled && !isLoading ? { scale: 1.02, y: -1 } : undefined
        }
        whileTap={!disabled && !isLoading ? { scale: 0.98 } : undefined}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

// LinkButton for navigation
interface LinkButtonProps {
  href: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
  external?: boolean;
}

function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  external = false,
}: LinkButtonProps) {
  const buttonClassName = cn(
    buttonStyles.base,
    buttonStyles.variants[variant],
    buttonStyles.sizes[size],
    className
  );

  if (external) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClassName}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <Link href={href} className={buttonClassName}>
      {children}
    </Link>
  );
}

export { Button, LinkButton };
