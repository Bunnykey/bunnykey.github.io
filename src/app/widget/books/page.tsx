import { BookSearchWidget } from "@/components/books/BookSearchWidget";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Search",
  description: "Search and save books to Notion",
  // Prevent indexing of widget pages
  robots: { index: false, follow: false },
};

export default function BookWidgetPage() {
  return <BookSearchWidget embedded />;
}
