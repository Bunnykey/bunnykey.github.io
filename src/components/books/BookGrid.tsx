"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { BookCard } from "./BookCard";
import type { Book } from "@/types";
import { cn } from "@/lib/utils";

interface BookGridProps {
  books: Book[];
  savedBooks: Set<string>;
  onSave: (book: Book) => Promise<void>;
  loading?: boolean;
  compact?: boolean;
}

export function BookGrid({ books, savedBooks, onSave, loading, compact }: BookGridProps) {
  const gridClasses = cn(
    "grid gap-3",
    compact
      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
  );

  if (loading) {
    return (
      <div className={gridClasses}>
        {Array.from({ length: compact ? 8 : 10 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "bg-surface border border-border-light overflow-hidden animate-pulse",
              compact ? "rounded-md" : "rounded-lg"
            )}
          >
            <div className="aspect-[3/4] bg-surface-raised" />
            <div className={cn("space-y-2", compact ? "p-3" : "p-4")}>
              <div className="h-4 bg-surface-raised rounded w-3/4" />
              <div className="h-3 bg-surface-raised rounded w-1/2" />
              <div className="h-3 bg-surface-raised rounded w-1/3" />
              <div className={cn("bg-surface-raised rounded", compact ? "h-7 mt-2" : "h-8 mt-3")} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return null;
  }

  return (
    <motion.div
      className={gridClasses}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {books.map((book) => (
        <motion.div key={book.isbn || book.title} variants={staggerItem}>
          <BookCard
            book={book}
            isSaved={savedBooks.has(book.isbn)}
            onSave={onSave}
            compact={compact}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
