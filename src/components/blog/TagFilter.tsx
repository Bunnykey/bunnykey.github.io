"use client";

import { motion } from "framer-motion";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/utils";

interface TagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

export function TagFilter({ tags, selectedTag, onTagSelect }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <motion.button
        onClick={() => onTagSelect(null)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "inline-flex items-center px-3 py-1 text-sm font-medium rounded-full transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary",
          selectedTag === null
            ? "bg-accent-primary text-white"
            : "bg-surface-raised text-text-secondary border border-border-light hover:border-accent-primary"
        )}
      >
        All
      </motion.button>
      {tags.map((tag) => (
        <motion.button
          key={tag}
          onClick={() => onTagSelect(tag === selectedTag ? null : tag)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "inline-flex items-center px-3 py-1 text-sm font-medium rounded-full transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary",
            selectedTag === tag
              ? "bg-accent-primary text-white"
              : "bg-surface-raised text-text-secondary border border-border-light hover:border-accent-primary"
          )}
        >
          {tag}
        </motion.button>
      ))}
    </div>
  );
}
