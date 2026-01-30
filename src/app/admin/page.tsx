"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  login,
  setToken,
  isAuthenticated,
  getPosts,
  updatePost,
  deletePost,
  triggerBuild,
  Post,
} from "@/lib/api";
import { Toast, useToast } from "@/components/Toast";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Dashboard state
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const fetchPosts = useCallback(async () => {
    try {
      const { posts: fetchedPosts } = await getPosts();
      setPosts(fetchedPosts);
      setLastSync(new Date());
    } catch {
      addToast("error", "게시글 목록을 불러올 수 없습니다");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    const authenticated = isAuthenticated();
    setIsLoggedIn(authenticated);

    if (authenticated) {
      fetchPosts();
    } else {
      setLoading(false);
    }
  }, [fetchPosts]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const { token } = await login(password);
      setToken(token);
      setIsLoggedIn(true);
      setPassword("");
      fetchPosts();
      addToast("success", "로그인 성공");
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleTogglePublish = async (post: Post) => {
    try {
      await updatePost(post.slug, { published: !post.published });
      setPosts((prev) =>
        prev.map((p) =>
          p.slug === post.slug ? { ...p, published: !p.published } : p
        )
      );
      addToast("success", post.published ? "초안으로 변경됨" : "게시됨");
    } catch {
      addToast("error", "상태 변경 실패");
    }
  };

  const handleDelete = async (post: Post) => {
    if (!confirm(`"${post.title}" 게시글을 삭제하시겠습니까?`)) return;

    try {
      await deletePost(post.slug);
      setPosts((prev) => prev.filter((p) => p.slug !== post.slug));
      addToast("success", "게시글 삭제됨");
    } catch {
      addToast("error", "삭제 실패");
    }
  };

  const handleTriggerBuild = async () => {
    try {
      await triggerBuild();
      addToast("success", "빌드가 트리거되었습니다");
    } catch {
      addToast("error", "빌드 트리거 실패 (GitHub 연동 확인 필요)");
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (filter === "published") return post.published;
    if (filter === "draft") return !post.published;
    return true;
  });

  const publishedCount = posts.filter((p) => p.published).length;
  const draftCount = posts.filter((p) => !p.published).length;

  // Login form if not authenticated
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-md">
        <div className="max-w-sm w-full animate-fade-in-up">
          <div className="text-center mb-xl">
            <h1 className="text-3xl font-bold text-text-primary mb-sm">
              Admin
            </h1>
            <p className="text-text-secondary">관리자 로그인</p>
          </div>

          <form onSubmit={handleLogin} className="bg-surface rounded-2xl p-xl border border-border-light">
            {loginError && (
              <div className="mb-lg p-md bg-error/10 text-error rounded-xl text-sm">
                {loginError}
              </div>
            )}

            <div className="mb-lg">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-secondary mb-sm"
              >
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-lg py-md border border-border rounded-xl bg-surface text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-md px-lg bg-accent-primary text-white rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {loginLoading ? "로그인 중..." : "로그인"}
            </button>
          </form>
        </div>
        <Toast toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen">
      <div className="max-w-container mx-auto px-md lg:px-xl py-xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-lg mb-xl animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              관리자 대시보드
            </h1>
            {lastSync && (
              <p className="text-sm text-text-tertiary mt-xs">
                마지막 동기화: {format(lastSync, "HH:mm:ss", { locale: ko })}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-sm">
            <button
              onClick={fetchPosts}
              className="px-lg py-sm border border-border rounded-xl text-text-secondary hover:bg-surface-raised transition-colors"
            >
              새로고침
            </button>
            <button
              onClick={handleTriggerBuild}
              className="px-lg py-sm border border-success text-success rounded-xl hover:bg-success/10 transition-colors"
            >
              빌드 트리거
            </button>
            <Link
              href="/admin/new/"
              className="px-lg py-sm bg-accent-primary text-white rounded-xl hover:brightness-110 transition-all"
            >
              새 글 작성
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-md mb-xl animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="bg-surface rounded-xl p-lg border border-border-light">
            <p className="text-sm text-text-tertiary">전체</p>
            <p className="text-2xl font-bold text-text-primary">{posts.length}</p>
          </div>
          <div className="bg-surface rounded-xl p-lg border border-border-light">
            <p className="text-sm text-text-tertiary">게시됨</p>
            <p className="text-2xl font-bold text-success">{publishedCount}</p>
          </div>
          <div className="bg-surface rounded-xl p-lg border border-border-light">
            <p className="text-sm text-text-tertiary">초안</p>
            <p className="text-2xl font-bold text-warning">{draftCount}</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-sm mb-lg animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          {(["all", "published", "draft"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-lg py-sm rounded-xl transition-all ${
                filter === f
                  ? "bg-accent-primary text-white"
                  : "bg-surface border border-border text-text-secondary hover:border-accent-primary"
              }`}
            >
              {f === "all" ? "전체" : f === "published" ? "게시됨" : "초안"}
            </button>
          ))}
        </div>

        {/* Posts list */}
        {loading ? (
          <div className="space-y-md">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface rounded-xl p-lg border border-border-light">
                <div className="skeleton h-5 w-1/2 mb-sm" />
                <div className="skeleton h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-4xl">
            <p className="font-handwritten text-2xl text-text-tertiary">
              게시글이 없습니다
            </p>
          </div>
        ) : (
          <div className="bg-surface rounded-xl border border-border-light overflow-hidden animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-raised">
                  <tr>
                    <th className="px-lg py-md text-left text-sm font-medium text-text-tertiary">
                      제목
                    </th>
                    <th className="px-lg py-md text-left text-sm font-medium text-text-tertiary">
                      상태
                    </th>
                    <th className="px-lg py-md text-left text-sm font-medium text-text-tertiary hidden md:table-cell">
                      수정일
                    </th>
                    <th className="px-lg py-md text-right text-sm font-medium text-text-tertiary">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-surface-raised/50 transition-colors">
                      <td className="px-lg py-md">
                        <div>
                          <p className="font-medium text-text-primary">{post.title}</p>
                          <p className="text-sm text-text-tertiary">/{post.slug}</p>
                        </div>
                      </td>
                      <td className="px-lg py-md">
                        <span
                          className={`inline-flex px-sm py-xs text-xs font-medium rounded-full ${
                            post.published
                              ? "bg-success/10 text-success"
                              : "bg-warning/10 text-warning"
                          }`}
                        >
                          {post.published ? "게시됨" : "초안"}
                        </span>
                      </td>
                      <td className="px-lg py-md text-sm text-text-tertiary hidden md:table-cell">
                        {post.lastEditedTime
                          ? format(new Date(post.lastEditedTime), "MM/dd HH:mm")
                          : "-"}
                      </td>
                      <td className="px-lg py-md">
                        <div className="flex justify-end gap-xs">
                          <button
                            onClick={() => handleTogglePublish(post)}
                            className={`px-md py-xs text-sm rounded-lg transition-colors ${
                              post.published
                                ? "text-warning hover:bg-warning/10"
                                : "text-success hover:bg-success/10"
                            }`}
                          >
                            {post.published ? "초안" : "게시"}
                          </button>
                          <Link
                            href={`/admin/edit/${post.slug}/`}
                            className="px-md py-xs text-sm text-accent-secondary hover:bg-accent-secondary/10 rounded-lg transition-colors"
                          >
                            수정
                          </Link>
                          <button
                            onClick={() => handleDelete(post)}
                            className="px-md py-xs text-sm text-error hover:bg-error/10 rounded-lg transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
