"use client";

import { useEffect } from "react";
import { Article, CATEGORY_LABELS } from "@/lib/types";

interface ArticleModalProps {
  article: Article;
  onClose: () => void;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ArticleModal({ article, onClose }: ArticleModalProps) {
  const paragraphs = article.summary.split("\n\n");

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white w-full max-w-2xl mx-4 my-8 max-h-[calc(100vh-4rem)] overflow-y-auto rounded-lg shadow-modal animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-ink-50 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-all"
          aria-label="Close"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>

        <div className="px-8 sm:px-10 py-10">
          {/* Category + Breaking */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-caption font-semibold uppercase tracking-widest text-accent/70">
              {CATEGORY_LABELS[article.category] || article.category}
            </span>
            {article.is_breaking && (
              <span className="inline-flex items-center gap-1.5 text-accent font-semibold text-caption uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                Breaking
              </span>
            )}
          </div>

          {/* Headline */}
          <h1 className="font-serif text-headline-xl text-ink-950 mb-5 pr-8 leading-snug">
            {article.headline}
          </h1>

          {/* Meta line */}
          <div className="flex items-center gap-2 text-body-sm text-ink-400 mb-8 pb-8 border-b border-ink-100 font-medium">
            <span>{article.sources.join(", ")}</span>
            <span className="text-ink-200">&middot;</span>
            <time>{formatDate(article.created_at)}</time>
          </div>

          {/* Full article body */}
          <div className="text-body-lg text-ink-700 space-y-5 leading-[1.8]">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
