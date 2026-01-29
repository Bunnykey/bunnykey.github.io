import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Tag } from "@/components/ui/Tag";
import { LinkButton } from "@/components/ui/Button";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { AuthorCard } from "@/components/blog/AuthorCard";
import { HandwrittenText } from "@/components/effects/Highlighter";
import { getPostBySlug, getAllPosts, getAuthorById } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const revalidate = 60; // Revalidate every 60 seconds

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | Bunnykey Archive`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const author = getAuthorById(post.authorId || "bunnykey");

  return (
    <div className="py-12">
      <Container size="md">
        {/* Back link */}
        <Link
          href="/blog"
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
          Back to blog
        </Link>

        {/* Article header */}
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <Tag key={tag} variant="primary">
                {tag}
              </Tag>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            {post.title}
          </h1>

          <p className="text-lg text-text-secondary mb-6">{post.excerpt}</p>

          <div className="flex items-center gap-4 text-sm text-text-tertiary">
            {author && (
              <>
                <span className="text-text-primary font-medium">
                  {author.name}
                </span>
                <span>·</span>
              </>
            )}
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.readTime && (
              <>
                <span>·</span>
                <span>{post.readTime}</span>
              </>
            )}
          </div>
        </header>

        {/* Article content */}
        <article className="mb-12">
          {post.content ? (
            <MarkdownRenderer content={post.content} />
          ) : (
            <div className="prose prose-lg text-text-secondary">
              <p>{post.excerpt}</p>
              <p className="text-text-tertiary italic">
                Full content coming soon...
              </p>
            </div>
          )}
        </article>

        {/* Author card */}
        {author && (
          <section className="mb-12">
            <HandwrittenText className="text-accent-primary text-lg mb-4 block">
              About the author
            </HandwrittenText>
            <AuthorCard author={author} />
          </section>
        )}

        {/* Back to blog */}
        <div className="text-center">
          <LinkButton href="/blog" variant="secondary">
            ← Back to all posts
          </LinkButton>
        </div>
      </Container>
    </div>
  );
}
