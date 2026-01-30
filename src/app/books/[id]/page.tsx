import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Tag } from "@/components/ui/Tag";
import { LinkButton } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { HandwrittenText } from "@/components/effects/Highlighter";
import { getBookById } from "@/lib/books";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const revalidate = 60;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const book = await getBookById(id);

  if (!book) {
    return {
      title: "Book Not Found",
    };
  }

  return {
    title: `${book.title} | 도서 리뷰 | Bunnykey Archive`,
    description: book.description || `${book.author}의 ${book.title}`,
  };
}

export default async function BookDetailPage({ params }: PageProps) {
  const { id } = await params;
  const book = await getBookById(id);

  if (!book) {
    notFound();
  }

  const statusVariant =
    book.status === "완료"
      ? "success"
      : book.status === "읽는 중"
      ? "warning"
      : "default";

  return (
    <div className="py-12">
      <Container size="md">
        {/* Back link */}
        <Link
          href="/books"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent-primary transition-colors mb-8"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          도서 검색으로 돌아가기
        </Link>

        {/* Book content */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 mb-12">
          {/* Book cover */}
          <div className="flex justify-center md:justify-start">
            <div className="w-[200px] aspect-[3/4] bg-surface-raised rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
              {book.cover ? (
                <img
                  src={book.cover}
                  alt={book.title}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-16 h-16 text-text-tertiary"
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
              )}
            </div>
          </div>

          {/* Book info */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {book.status && (
                <Tag variant={statusVariant} size="md">
                  {book.status}
                </Tag>
              )}
              {book.rating && (
                <span className="text-sm text-accent-primary font-medium">
                  {"★".repeat(book.rating)}{"☆".repeat(5 - book.rating)}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
              {book.title}
            </h1>

            <p className="text-lg text-text-secondary mb-4">{book.author}</p>

            <div className="flex flex-wrap gap-4 text-sm text-text-tertiary mb-6">
              <span>{book.publisher}</span>
              {book.pubDate && (
                <>
                  <span>·</span>
                  <span>{book.pubDate}</span>
                </>
              )}
              {book.isbn && (
                <>
                  <span>·</span>
                  <span>ISBN: {book.isbn}</span>
                </>
              )}
            </div>

            {book.link && (
              <LinkButton href={book.link} external size="sm">
                알라딘에서 보기
              </LinkButton>
            )}
          </div>
        </div>

        {/* Description */}
        {book.description && (
          <section className="mb-12">
            <HandwrittenText className="text-accent-secondary text-lg mb-4 block">
              책 소개
            </HandwrittenText>
            <Card className="bg-surface/50">
              <CardContent className="p-6">
                <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {book.description}
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Review */}
        {book.review && (
          <section className="mb-12">
            <HandwrittenText className="text-accent-primary text-lg mb-4 block">
              나의 리뷰
            </HandwrittenText>
            <Card className="bg-surface/50 border-l-4 border-accent-primary">
              <CardContent className="p-6">
                <p className="text-text-primary leading-relaxed whitespace-pre-wrap">
                  {book.review}
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Meta info */}
        <section className="mb-12">
          <div className="text-sm text-text-tertiary">
            추가일: {formatDate(book.addedAt)}
          </div>
        </section>

        {/* Back link */}
        <div className="text-center">
          <LinkButton href="/books" variant="secondary">
            ← 도서 검색으로 돌아가기
          </LinkButton>
        </div>
      </Container>
    </div>
  );
}
