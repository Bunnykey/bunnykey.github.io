"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { motion, AnimatePresence } from "framer-motion";
import {
  isAuthenticated,
  login,
  logout,
  getLocalPosts,
  deleteLocalPost,
  DraftPost,
} from "@/lib/admin";
import { formatDate } from "@/lib/utils";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [posts, setPosts] = useState<DraftPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = isAuthenticated();
    setAuthenticated(auth);
    if (auth) {
      setPosts(getLocalPosts());
    }
    setLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      setAuthenticated(true);
      setPosts(getLocalPosts());
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setPassword("");
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteLocalPost(id);
      setPosts(getLocalPosts());
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
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-surface border border-border rounded-xl p-8 shadow-md">
              <h1 className="text-2xl font-bold text-text-primary mb-6 text-center">
                Admin Login
              </h1>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-text-secondary mb-2"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary transition-all"
                    placeholder="Enter admin password"
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-accent-primary text-white font-medium rounded-lg hover:bg-accent-primary/90 transition-colors"
                >
                  Login
                </button>
              </form>
              <p className="mt-4 text-center text-sm text-text-secondary">
                <Link href="/" className="text-accent-primary hover:underline">
                  Back to home
                </Link>
              </p>
            </div>
          </motion.div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-12">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm font-medium text-accent-primary mb-1">
                Admin Dashboard
              </p>
              <h1 className="text-3xl font-bold text-text-primary">
                Manage Posts
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary text-white font-medium rounded-lg hover:bg-accent-primary/90 transition-colors"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Post
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Posts List */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            {posts.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-raised flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  No posts yet
                </h3>
                <p className="text-text-secondary mb-4">
                  Create your first blog post to get started.
                </p>
                <Link
                  href="/admin/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary text-white font-medium rounded-lg hover:bg-accent-primary/90 transition-colors"
                >
                  Create Post
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                <AnimatePresence>
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 hover:bg-surface-raised/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-medium text-text-primary truncate">
                              {post.title}
                            </h3>
                            <span
                              className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                                post.published
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              }`}
                            >
                              {post.published ? "Published" : "Draft"}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-text-secondary">
                            <span>{formatDate(post.date)}</span>
                            <span>{post.readTime}</span>
                            {post.tags.length > 0 && (
                              <span className="flex items-center gap-1">
                                {post.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 bg-surface-raised rounded text-xs"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {post.tags.length > 3 && (
                                  <span className="text-xs">
                                    +{post.tags.length - 3}
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="p-2 text-text-secondary hover:text-accent-primary transition-colors"
                            title="View"
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </Link>
                          <Link
                            href={`/admin/edit?slug=${post.slug}`}
                            className="p-2 text-text-secondary hover:text-accent-primary transition-colors"
                            title="Edit"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id, post.title)}
                            className="p-2 text-text-secondary hover:text-red-500 transition-colors"
                            title="Delete"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-text-secondary hover:text-accent-primary transition-colors"
            >
              Back to home
            </Link>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
