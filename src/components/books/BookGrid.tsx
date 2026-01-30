"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { BookCard } from "./BookCard";
import type { Book } from "@/types";

interface BookGridProps {
  books: Book[];
  savedBooks: Set<string>;
  onSave: (book: Book) => Promise<void>;
  loading?: boolean;
}

export function BookGrid({ books, savedBooks, onSave, loading }: BookGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface border border-border-light rounded-lg overflow-hidden animate-pulse"
          >
            <div className="aspect-[3/4] bg-surface-raised" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-surface-raised rounded w-3/4" />
              <div className="h-3 bg-surface-raised rounded w-1/2" />
              <div className="h-3 bg-surface-raised rounded w-1/3" />
              <div className="h-8 bg-surface-raised rounded mt-3" />
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
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
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
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
