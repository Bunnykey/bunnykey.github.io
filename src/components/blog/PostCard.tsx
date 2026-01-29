"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { formatDate } from "@/lib/utils";
import type { Post, Author } from "@/types";

interface PostCardProps {
  post: Post;
  author?: Author;
}

export function PostCard({ post, author }: PostCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="block">
      <Card interactive className="h-full">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            {post.tags.slice(0, 2).map((tag) => (
              <Tag key={tag} size="sm" variant="primary">
                {tag}
              </Tag>
            ))}
            <span className="text-xs text-text-tertiary ml-auto">
              {post.readTime}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-accent-primary transition-colors">
            {post.title}
          </h3>

          <p className="text-sm text-text-secondary mb-4 line-clamp-3">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {author && (
                <>
                  <span className="text-text-primary font-medium">
                    {author.name}
                  </span>
                  <span className="text-text-tertiary">·</span>
                </>
              )}
              <span className="text-text-tertiary">{formatDate(post.date)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
