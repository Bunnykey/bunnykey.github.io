import { Container } from "@/components/layout/Container";
import { BookSearchWidget } from "@/components/books/BookSearchWidget";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "도서 검색 | Bunnykey Archive",
  description: "알라딘에서 도서를 검색하고 노션에 저장하세요.",
};

export default function BooksPage() {
  return (
    <div className="py-12">
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            도서 검색
          </h1>
          <p className="text-text-secondary">
            알라딘에서 도서를 검색하고 노션 데이터베이스에 저장하세요.
          </p>
        </div>
        <BookSearchWidget />
      </Container>
    </div>
  );
}
