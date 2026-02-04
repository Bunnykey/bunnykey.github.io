"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Tag } from "@/components/ui/Tag";
import { LinkButton } from "@/components/ui/Button";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { AuthorCard } from "@/components/blog/AuthorCard";
import { HandwrittenText } from "@/components/effects/Highlighter";
import { getLocalPostBySlug, DraftPost } from "@/lib/admin";
import { formatDate } from "@/lib/utils";
import { Author } from "@/types";

interface LocalPostFallbackProps {
  slug: string;
}

const defaultAuthor: Author = {
  id: "bunnykey",
  name: "Bunnykey",
  role: "Developer",
  bio: "Building cool things on the web.",
  avatar: "/images/avatar-bunnykey.svg",
  links: {
    github: "https://github.com/bunnykey",
  },
};

export function LocalPostFallback({ slug }: LocalPostFallbackProps) {
  const [post, setPost] = useState<DraftPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localPost = getLocalPostBySlug(slug);
    setPost(localPost || null);
    setLoading(false);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-12">
        <Container size="md">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-text-primary mb-4">
              Post Not Found
            </h1>
            <p className="text-text-secondary mb-8">
              The post you&apos;re looking for doesn&apos;t exist.
            </p>
            <LinkButton href="/blog" variant="primary">
              Back to Blog
            </LinkButton>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-12">
      <Container size="md">
        {/* Draft indicator */}
        {!post.published && (
          <div className="mb-6 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg text-yellow-800 dark:text-yellow-300 text-sm">
            This is a draft post. Only you can see this.
          </div>
        )}

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
            <span className="text-text-primary font-medium">
              {defaultAuthor.name}
            </span>
            <span>·</span>
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
          <MarkdownRenderer content={post.content} />
        </article>

        {/* Author card */}
        <section className="mb-12">
          <HandwrittenText className="text-accent-primary text-lg mb-4 block">
            About the author
          </HandwrittenText>
          <AuthorCard author={defaultAuthor} />
        </section>

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
