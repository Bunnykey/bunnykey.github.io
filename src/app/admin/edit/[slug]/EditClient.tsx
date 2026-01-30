"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  isAuthenticated,
  getPost,
  updatePost,
  deletePost,
  ConflictError,
  Post,
} from "@/lib/api";
import { Toast, useToast } from "@/components/Toast";
import { ConflictModal } from "@/components/ConflictModal";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

interface EditClientProps {
  slug: string;
}

export default function EditClient({ slug }: EditClientProps) {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(false);

  // Meta state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastEditedTime, setLastEditedTime] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);

  // Conflict modal state
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictServerTime, setConflictServerTime] = useState("");
  const [pendingSave, setPendingSave] = useState<(() => Promise<void>) | null>(null);

  // Original values for change detection
  const originalValues = useRef({
    title: "",
    content: "",
    excerpt: "",
    tags: "",
    published: false,
  });

  const fetchPost = useCallback(async () => {
    try {
      const { post } = await getPost(slug);
      setTitle(post.title);
      setContent(post.content || "");
      setExcerpt(post.excerpt || "");
      setTags(post.tags?.join(", ") || "");
      setPublished(post.published);
      setLastEditedTime(post.lastEditedTime);

      originalValues.current = {
        title: post.title,
        content: post.content || "",
        excerpt: post.excerpt || "",
        tags: post.tags?.join(", ") || "",
        published: post.published,
      };

      setHasChanges(false);
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "게시글을 불러올 수 없습니다");
    } finally {
      setLoading(false);
    }
  }, [slug, addToast]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/admin/");
      return;
    }

    if (slug === "_") {
      router.replace("/admin/");
      return;
    }

    if (!slug) {
      addToast("error", "Slug가 제공되지 않았습니다");
      setLoading(false);
      return;
    }

    fetchPost();
  }, [slug, router, fetchPost, addToast]);

  // Change detection
  useEffect(() => {
    const changed =
      title !== originalValues.current.title ||
      content !== originalValues.current.content ||
      excerpt !== originalValues.current.excerpt ||
      tags !== originalValues.current.tags ||
      published !== originalValues.current.published;

    setHasChanges(changed);
  }, [title, content, excerpt, tags, published]);

  // Auto-save
  useEffect(() => {
    if (!autoSaveEnabled || !hasChanges || saving) return;

    const timer = setInterval(async () => {
      await savePost(true);
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(timer);
  }, [autoSaveEnabled, hasChanges, saving]);

  const savePost = async (isAutoSave = false, forceOverwrite = false) => {
    setSaving(true);

    try {
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const response = await updatePost(
        slug,
        {
          title,
          content,
          excerpt: excerpt || undefined,
          tags: tagsArray,
          published: isAutoSave ? false : published, // Auto-save always saves as draft
        },
        forceOverwrite ? undefined : lastEditedTime || undefined
      );

      setLastEditedTime(response.lastEditedTime);
      originalValues.current = { title, content, excerpt, tags, published };
      setHasChanges(false);

      if (isAutoSave) {
        setLastAutoSave(new Date());
        addToast("info", "자동 저장됨 (초안)");
      } else {
        addToast("success", "저장 완료");
        router.push("/admin/");
      }
    } catch (err) {
      if (err instanceof ConflictError) {
        setConflictServerTime(err.serverLastEdited);
        setPendingSave(() => () => savePost(false, true));
        setShowConflictModal(true);
      } else {
        addToast("error", err instanceof Error ? err.message : "저장 실패");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await savePost(false);
  };

  const handleDelete = async () => {
    if (!confirm("정말 이 게시글을 삭제하시겠습니까?")) return;

    try {
      await deletePost(slug);
      addToast("success", "게시글이 삭제되었습니다");
      router.push("/admin/");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "삭제 실패");
    }
  };

  const handleConflictOverwrite = async () => {
    setShowConflictModal(false);
    if (pendingSave) {
      await pendingSave();
      setPendingSave(null);
    }
  };

  const handleConflictRefresh = async () => {
    setShowConflictModal(false);
    setPendingSave(null);
    setLoading(true);
    await fetchPost();
    addToast("info", "서버 버전을 불러왔습니다");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header with status */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            게시글 수정
          </h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
            {hasChanges && (
              <span className="text-yellow-600 dark:text-yellow-400">
                • 저장되지 않은 변경사항
              </span>
            )}
            {lastAutoSave && (
              <span>
                자동 저장: {lastAutoSave.toLocaleTimeString("ko-KR")}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            자동 저장
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            요약
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            태그 (쉼표로 구분)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2, tag3"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            내용
          </label>
          <div data-color-mode="dark">
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || "")}
              height={400}
            />
          </div>
        </div>

        {/* Published checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <label
            htmlFor="published"
            className="text-sm text-gray-700 dark:text-gray-300"
          >
            게시
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {saving && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {saving ? "저장 중..." : "저장"}
          </button>
          <button
            type="button"
            onClick={() => savePost(true)}
            disabled={saving || !hasChanges}
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            초안 저장
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={handleDelete}
            className="px-6 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            삭제
          </button>
          <a
            href="/admin/"
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            취소
          </a>
        </div>
      </form>

      <ConflictModal
        isOpen={showConflictModal}
        serverTime={conflictServerTime}
        onOverwrite={handleConflictOverwrite}
        onRefresh={handleConflictRefresh}
        onClose={() => setShowConflictModal(false)}
      />

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
