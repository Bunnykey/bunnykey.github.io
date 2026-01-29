"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "Projects", href: "/projects" },
];

interface NavigationProps {
  className?: string;
  onItemClick?: () => void;
}

export function Navigation({ className, onItemClick }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex items-center gap-1", className)}>
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              "hover:bg-surface-raised min-h-[44px] flex items-center",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary",
              isActive ? "text-accent-primary" : "text-text-secondary"
            )}
          >
            {item.label}
            {isActive && (
              <motion.div
                layoutId="activeNav"
                className="absolute inset-x-2 -bottom-px h-0.5 bg-accent-primary rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNavigation({
  onItemClick,
}: {
  onItemClick?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 p-4">
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "px-4 py-3 text-lg font-medium rounded-lg transition-colors",
              "hover:bg-surface-raised min-h-[48px] flex items-center",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary",
              isActive
                ? "text-accent-primary bg-accent-primary/10"
                : "text-text-primary"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
