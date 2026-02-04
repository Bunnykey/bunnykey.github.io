"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { PostList } from "@/components/blog/PostList";
import { SearchFilter } from "@/components/blog/SearchFilter";
import { TagFilter } from "@/components/blog/TagFilter";
import { HandwrittenText } from "@/components/effects/Highlighter";
import { fadeInUp } from "@/lib/motion";
import { Post, Author } from "@/types";
import { getLocalPosts, draftToPost } from "@/lib/admin";

interface BlogContentProps {
  initialPosts: (Post & { author: Author | undefined })[];
  allTags: string[];
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

export function BlogContent({ initialPosts, allTags }: BlogContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [localPosts, setLocalPosts] = useState<(Post & { author: Author | undefined })[]>([]);

  // Load local posts from localStorage
  useEffect(() => {
    const drafts = getLocalPosts();
    const publishedLocalPosts = drafts
      .filter((draft) => draft.published)
      .map((draft) => ({
        ...draftToPost(draft),
        author: defaultAuthor,
      }));
    setLocalPosts(publishedLocalPosts);
  }, []);

  // Combine initial posts with local posts, avoiding duplicates by slug
  const combinedPosts = useMemo(() => {
    const slugs = new Set(initialPosts.map((p) => p.slug));
    const uniqueLocalPosts = localPosts.filter((p) => !slugs.has(p.slug));
    return [...initialPosts, ...uniqueLocalPosts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [initialPosts, localPosts]);

  // Combine all tags
  const combinedTags = useMemo(() => {
    const tagSet = new Set([...allTags, ...localPosts.flatMap((p) => p.tags)]);
    return Array.from(tagSet).sort();
  }, [allTags, localPosts]);

  const filteredPosts = useMemo(() => {
    let posts = combinedPosts;

    // Filter by search query
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      posts = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(lowercaseQuery) ||
          post.excerpt.toLowerCase().includes(lowercaseQuery) ||
          post.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
      );
    }

    // Filter by tag
    if (selectedTag) {
      posts = posts.filter((post) => post.tags.includes(selectedTag));
    }

    return posts;
  }, [combinedPosts, searchQuery, selectedTag]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleTagSelect = useCallback((tag: string | null) => {
    setSelectedTag(tag);
  }, []);

  const getAuthor = useCallback(
    (authorId: string) => {
      const post = combinedPosts.find((p) => p.authorId === authorId);
      return post?.author;
    },
    [combinedPosts]
  );

  return (
    <div className="py-12">
      <Container>
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <HandwrittenText className="text-accent-primary text-xl mb-2 block">
            Thoughts & explorations
          </HandwrittenText>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Blog
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Articles on design systems, development practices, and the
            intersection of creativity and code.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="mb-8 space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="max-w-md">
            <SearchFilter
              onSearch={handleSearch}
              placeholder="Search articles..."
            />
          </div>
          <TagFilter
            tags={combinedTags}
            selectedTag={selectedTag}
            onTagSelect={handleTagSelect}
          />
        </motion.div>

        {/* Results count */}
        <motion.p
          className="text-sm text-text-tertiary mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"}
          {searchQuery && ` matching "${searchQuery}"`}
          {selectedTag && ` in ${selectedTag}`}
        </motion.p>

        {/* Post List */}
        <PostList posts={filteredPosts} getAuthor={getAuthor} />
      </Container>
    </div>
  );
}
