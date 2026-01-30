"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BookGrid } from "./BookGrid";
import { searchBooks, saveBook } from "@/lib/books";
import type { Book } from "@/types";
import { cn } from "@/lib/utils";

interface BookSearchWidgetProps {
  embedded?: boolean;
}

export function BookSearchWidget({ embedded = false }: BookSearchWidgetProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [savedBooks, setSavedBooks] = useState<Set<string>>(new Set());

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const books = await searchBooks(query);
      setResults(books);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleSave = useCallback(async (book: Book) => {
    const success = await saveBook(book);
    if (success) {
      setSavedBooks((prev) => new Set(prev).add(book.isbn));
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className={cn(embedded ? "p-4" : "")}>
      <div className="flex gap-3 mb-6">
        <div className="flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="책 제목, 저자로 검색..."
          />
        </div>
        <Button onClick={handleSearch} disabled={loading || !query.trim()}>
          {loading ? "검색 중..." : "검색"}
        </Button>
      </div>

      {loading && <BookGrid books={[]} savedBooks={savedBooks} onSave={handleSave} loading />}

      {!loading && results.length > 0 && (
        <BookGrid books={results} savedBooks={savedBooks} onSave={handleSave} />
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-12">
          <div className="text-text-tertiary mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <p className="text-text-secondary">
            &quot;{query}&quot;에 대한 검색 결과가 없습니다.
          </p>
          <p className="text-sm text-text-tertiary mt-1">
            다른 검색어로 시도해 보세요.
          </p>
        </div>
      )}

      {!loading && !searched && (
        <div className="text-center py-12">
          <div className="text-text-tertiary mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 mx-auto"
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
          <p className="text-text-secondary">
            알라딘에서 도서를 검색하고 노션에 저장하세요.
          </p>
        </div>
      )}
    </div>
  );
}
