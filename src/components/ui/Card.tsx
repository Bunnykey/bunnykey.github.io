"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { cardHover, springPresets } from "@/lib/motion";

export interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  interactive?: boolean;
  children: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, children, ...props }, ref) => {
    const baseStyles =
      "bg-surface border border-border-light rounded-lg shadow-sm overflow-hidden";

    if (interactive) {
      return (
        <motion.div
          ref={ref}
          className={cn(baseStyles, "cursor-pointer", className)}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
          variants={cardHover}
          {...props}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={cn(baseStyles, className)} {...(props as HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-lg border-b border-border-light", className)}
      {...props}
    />
  )
);

CardHeader.displayName = "CardHeader";

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-lg", className)} {...props} />
  )
);

CardContent.displayName = "CardContent";

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "p-lg pt-0 flex items-center gap-md",
        className
      )}
      {...props}
    />
  )
);

CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardContent, CardFooter };
