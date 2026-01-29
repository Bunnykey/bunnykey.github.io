"use client";

import { motion } from "framer-motion";
import { PostCard } from "./PostCard";
import { staggerContainer, staggerItem } from "@/lib/motion";
import type { Post, Author } from "@/types";

interface PostListProps {
  posts: Post[];
  getAuthor?: (authorId: string) => Author | undefined;
}

export function PostList({ posts, getAuthor }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">No posts found.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {posts.map((post) => (
        <motion.div key={post.id} variants={staggerItem}>
          <PostCard
            post={post}
            author={getAuthor && post.authorId ? getAuthor(post.authorId) : undefined}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
