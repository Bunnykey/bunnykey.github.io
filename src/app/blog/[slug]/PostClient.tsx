"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { getPost, Post } from "@/lib/api";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDPreview = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  { ssr: false }
);

interface PostClientProps {
  slug: string;
}

export default function PostClient({ slug }: PostClientProps) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (slug === "_") {
      router.replace("/blog/");
      return;
    }

    const fetchPost = async () => {
      try {
        const data = await getPost(slug);
        setPost(data.post);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, router]);

  if (loading) {
    return (
      <div className="paper-texture min-h-screen">
        <div className="max-w-prose mx-auto px-md lg:px-xl py-3xl">
          <div className="animate-fade-in-up">
            <div className="skeleton h-10 w-3/4 mb-lg" />
            <div className="skeleton h-4 w-1/4 mb-2xl" />
            <div className="space-y-md">
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="paper-texture min-h-screen">
        <div className="max-w-prose mx-auto px-md lg:px-xl py-4xl text-center">
          <div className="bg-surface rounded-2xl p-xl border border-border-light tilted animate-fade-in-up">
            <p className="font-handwritten text-4xl text-text-tertiary mb-md">
              404
            </p>
            <h1 className="text-2xl font-bold text-text-primary mb-md">
              글을 찾을 수 없어요
            </h1>
            <p className="text-text-secondary mb-xl">
              {error || "존재하지 않는 글입니다."}
            </p>
            <Link
              href="/blog/"
              className="inline-flex items-center gap-sm text-accent-primary hover:underline"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              블로그로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="paper-texture min-h-screen">
      <article className="max-w-prose mx-auto px-md lg:px-xl py-3xl">
        {/* Header */}
        <header className="mb-2xl animate-fade-in-up">
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-sm mb-lg">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-md py-xs text-sm font-medium rounded-full bg-accent-primary/10 text-accent-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-lg leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-md text-text-tertiary">
            <time>
              {format(new Date(post.publishedAt), "yyyy년 M월 d일", { locale: ko })}
            </time>
          </div>
        </header>

        {/* Content */}
        {post.content && (
          <div
            className="prose animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
            data-color-mode="auto"
          >
            <MDPreview source={post.content} />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-3xl pt-xl border-t border-border-light animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <Link
            href="/blog/"
            className="inline-flex items-center gap-sm text-text-secondary hover:text-accent-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            블로그로 돌아가기
          </Link>
        </footer>
      </article>
    </div>
  );
}
