"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { isAuthenticated, createPost } from "@/lib/api";
import { Toast, useToast } from "@/components/Toast";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const AUTO_SAVE_INTERVAL = 30000;

export default function NewPostPage() {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(false);

  const [saving, setSaving] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [hasContent, setHasContent] = useState(false);

  const slugManuallyEdited = useRef(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/admin/");
    }
  }, [router]);

  // Check if there's content to save
  useEffect(() => {
    setHasContent(!!title || !!content);
  }, [title, content]);

  // Auto-save
  useEffect(() => {
    if (!autoSaveEnabled || !hasContent || saving || !slug) return;

    const timer = setInterval(async () => {
      await savePost(true);
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(timer);
  }, [autoSaveEnabled, hasContent, saving, slug, title, content, excerpt, tags]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugManuallyEdited.current) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9가-힣\s-]/g, "")
          .replace(/\s+/g, "-")
      );
    }
  };

  const handleSlugChange = (value: string) => {
    slugManuallyEdited.current = true;
    setSlug(value);
  };

  const savePost = async (isAutoSave = false) => {
    if (!title || !slug) {
      if (!isAutoSave) {
        addToast("error", "제목과 Slug를 입력해주세요");
      }
      return;
    }

    setSaving(true);

    try {
      await createPost({
        title,
        slug,
        content,
        excerpt: excerpt || undefined,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        published: isAutoSave ? false : published,
      });

      if (isAutoSave) {
        setLastAutoSave(new Date());
        addToast("info", "자동 저장됨 (초안)");
      } else {
        addToast("success", "게시글이 생성되었습니다");
        router.push("/admin/");
      }
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await savePost(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header with status */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            새 게시글
          </h1>
          {lastAutoSave && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              자동 저장: {lastAutoSave.toLocaleTimeString("ko-KR")}
            </p>
          )}
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
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
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
            바로 게시
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
            {saving ? "저장 중..." : "게시글 생성"}
          </button>
          <button
            type="button"
            onClick={() => savePost(true)}
            disabled={saving || !hasContent || !slug}
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            초안 저장
          </button>
          <div className="flex-1" />
          <a
            href="/admin/"
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            취소
          </a>
        </div>
      </form>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
