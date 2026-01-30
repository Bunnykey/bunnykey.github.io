import { BookSearchWidget } from "@/components/books/BookSearchWidget";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Search Widget",
  description: "Search and save books to Notion",
};

export default function BookWidgetPage() {
  return (
    <div className="min-h-screen bg-background">
      <BookSearchWidget embedded />
    </div>
  );
}
