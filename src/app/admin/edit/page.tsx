"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { motion } from "framer-motion";
import {
  isAuthenticated,
  saveLocalPost,
  getLocalPostBySlug,
  generateSlug,
  calculateReadTime,
  DraftPost,
} from "@/lib/admin";

function EditPostContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") || "";

  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [postId, setPostId] = useState("");
  const [title, setTitle] = useState("");
  const [postSlug, setPostSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [createdAt, setCreatedAt] = useState("");

  useEffect(() => {
    const auth = isAuthenticated();
    setAuthenticated(auth);

    if (!auth) {
      router.push("/admin");
      return;
    }

    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    // Load post data
    const post = getLocalPostBySlug(slug);
    if (post) {
      setPostId(post.id);
      setTitle(post.title);
      setPostSlug(post.slug);
      setExcerpt(post.excerpt);
      setTags(post.tags.join(", "));
      setContent(post.content);
      setPublished(post.published);
      setCreatedAt(post.createdAt);
    } else {
      setNotFound(true);
    }

    setLoading(false);
  }, [router, slug]);

  const handleSave = async (publish?: boolean) => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (!content.trim()) {
      alert("Please enter content");
      return;
    }

    setSaving(true);

    try {
      const post: DraftPost = {
        id: postId,
        title: title.trim(),
        slug: postSlug || generateSlug(title),
        date: new Date().toISOString().split("T")[0],
        authorId: "bunnykey",
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
        excerpt: excerpt.trim() || content.substring(0, 150) + "...",
        readTime: calculateReadTime(content),
        content: content.trim(),
        published: publish !== undefined ? publish : published,
        createdAt: createdAt,
        updatedAt: new Date().toISOString(),
      };

      saveLocalPost(post);

      // If slug changed, redirect to new edit URL
      if (postSlug !== slug) {
        router.push(`/admin/edit?slug=${postSlug}`);
      } else {
        router.push("/admin");
      }
    } catch (error) {
      console.error("Failed to save post:", error);
      alert("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <Container>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-4">
              Post Not Found
            </h1>
            <p className="text-text-secondary mb-6">
              The post you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-8">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Link>
              <div>
                <p className="text-sm font-medium text-accent-primary">
                  Edit Post
                </p>
                <h1 className="text-2xl font-bold text-text-primary">
                  {title || "Untitled"}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  showPreview
                    ? "bg-accent-primary text-white border-accent-primary"
                    : "border-border text-text-secondary hover:text-text-primary hover:border-text-secondary"
                }`}
              >
                {showPreview ? "Edit" : "Preview"}
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="px-4 py-2 border border-border text-text-primary rounded-lg hover:bg-surface-raised transition-colors disabled:opacity-50"
              >
                Save Draft
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : published ? "Update" : "Publish"}
              </button>
            </div>
          </div>

          {showPreview ? (
            /* Preview Mode */
            <div className="bg-surface border border-border rounded-xl p-8">
              <article className="max-w-3xl mx-auto">
                <header className="mb-8">
                  <h1 className="text-4xl font-bold text-text-primary mb-4">
                    {title || "Untitled Post"}
                  </h1>
                  <p className="text-text-secondary mb-4">
                    {excerpt || "No excerpt provided"}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <span>{new Date().toLocaleDateString()}</span>
                    <span>{calculateReadTime(content)}</span>
                    {tags && (
                      <div className="flex gap-2">
                        {tags.split(",").map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-surface-raised rounded text-xs"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </header>
                <MarkdownRenderer content={content} />
              </article>
            </div>
          ) : (
            /* Edit Mode */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Editor */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Post title"
                    className="w-full px-4 py-3 text-2xl font-bold bg-transparent border-b border-border text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                  />
                </div>
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write your post content in Markdown..."
                />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Slug */}
                <div className="bg-surface border border-border rounded-xl p-4">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Slug
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={postSlug}
                      onChange={(e) => setPostSlug(e.target.value)}
                      placeholder="post-slug"
                      className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                    />
                    <button
                      onClick={() => setPostSlug(generateSlug(title))}
                      className="p-2 text-text-secondary hover:text-accent-primary transition-colors"
                      title="Auto-generate from title"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Excerpt */}
                <div className="bg-surface border border-border rounded-xl p-4">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Excerpt
                  </label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Brief description of the post..."
                    rows={3}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50 resize-none"
                  />
                </div>

                {/* Tags */}
                <div className="bg-surface border border-border rounded-xl p-4">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="tag1, tag2, tag3"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                  />
                  <p className="mt-1 text-xs text-text-secondary">
                    Separate tags with commas
                  </p>
                </div>

                {/* Publish Status */}
                <div className="bg-surface border border-border rounded-xl p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-accent-primary focus:ring-accent-primary"
                    />
                    <span className="text-sm font-medium text-text-primary">
                      Published
                    </span>
                  </label>
                  {createdAt && (
                    <p className="mt-2 text-xs text-text-secondary">
                      Created: {new Date(createdAt).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Help */}
                <div className="bg-surface-raised border border-border rounded-xl p-4">
                  <h3 className="text-sm font-medium text-text-primary mb-2">
                    Markdown Tips
                  </h3>
                  <ul className="text-xs text-text-secondary space-y-1">
                    <li>
                      <code className="bg-background px-1 rounded">
                        # Heading
                      </code>{" "}
                      for headings
                    </li>
                    <li>
                      <code className="bg-background px-1 rounded">
                        **bold**
                      </code>{" "}
                      for bold text
                    </li>
                    <li>
                      <code className="bg-background px-1 rounded">
                        *italic*
                      </code>{" "}
                      for italic text
                    </li>
                    <li>
                      <code className="bg-background px-1 rounded">
                        [text](url)
                      </code>{" "}
                      for links
                    </li>
                    <li>
                      <code className="bg-background px-1 rounded">
                        `code`
                      </code>{" "}
                      for inline code
                    </li>
                    <li>
                      <code className="bg-background px-1 rounded">
                        ```lang
                      </code>{" "}
                      for code blocks
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </Container>
    </div>
  );
}

export default function EditPostPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
        </div>
      }
    >
      <EditPostContent />
    </Suspense>
  );
}
