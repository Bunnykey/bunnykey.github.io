"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Book } from "@/types";
import { cn } from "@/lib/utils";

interface BookCardProps {
  book: Book;
  isSaved: boolean;
  onSave: (book: Book) => Promise<void>;
}

export function BookCard({ book, isSaved, onSave }: BookCardProps) {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (isSaved || saving) return;
    setSaving(true);
    try {
      await onSave(book);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card interactive className="h-full flex flex-col">
      <div className="aspect-[3/4] relative bg-surface-raised overflow-hidden flex items-center justify-center">
        {book.cover ? (
          <img
            src={book.cover}
            alt={book.title}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-tertiary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        )}
        {isSaved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-2 right-2 bg-accent-primary text-white px-2 py-1 rounded text-xs font-medium"
          >
            저장됨
          </motion.div>
        )}
      </div>
      <CardContent className="flex-1 flex flex-col p-4">
        <h3 className="text-sm font-semibold text-text-primary line-clamp-2 mb-1">
          {book.title}
        </h3>
        <p className="text-xs text-text-secondary line-clamp-1 mb-0.5">
          {book.author}
        </p>
        <p className="text-xs text-text-tertiary mb-3">{book.publisher}</p>
        <div className="mt-auto">
          <Button
            onClick={handleSave}
            disabled={isSaved}
            isLoading={saving}
            variant={isSaved ? "ghost" : "primary"}
            size="sm"
            className="w-full"
          >
            {isSaved ? "저장 완료" : "노션에 저장"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
