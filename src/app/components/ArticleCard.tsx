"use client";

import { Article, CATEGORY_LABELS } from "@/lib/types";

interface ArticleCardProps {
  article: Article;
  variant?: "hero" | "standard" | "compact";
  onClick?: () => void;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 12) return `${diffHours}h ago`;

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function BreakingTag() {
  return (
    <span className="inline-flex items-center gap-1 text-accent font-semibold text-caption uppercase tracking-widest">
      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
      Breaking
    </span>
  );
}

function CategoryLabel({ category }: { category: string }) {
  return (
    <span className="text-caption font-semibold uppercase tracking-widest text-ink-400">
      {CATEGORY_LABELS[category] || category}
    </span>
  );
}

function SourceLine({ sources, time }: { sources: string[]; time: string }) {
  return (
    <div className="flex items-center gap-1.5 text-caption text-ink-400">
      <span>{sources.join(", ")}</span>
      <span className="text-ink-200">/</span>
      <time>{formatTime(time)}</time>
    </div>
  );
}

export default function ArticleCard({
  article,
  variant = "standard",
  onClick,
}: ArticleCardProps) {
  const paragraphs = article.summary.split("\n\n");

  if (variant === "hero") {
    return (
      <article
        className="pb-8 mb-8 border-b border-ink-200 cursor-pointer group"
        onClick={onClick}
      >
        <div className="flex items-center gap-3 mb-3">
          <CategoryLabel category={article.category} />
          {article.is_breaking && <BreakingTag />}
        </div>

        <h2 className="font-serif text-headline-lg text-ink-950 mb-3 group-hover:text-ink-700 transition-colors">
          {article.headline}
        </h2>

        {/* Show only the lede paragraph */}
        {paragraphs.length > 0 && (
          <p className="text-body-lg text-ink-700 mb-3 leading-relaxed line-clamp-3">
            {paragraphs[0]}
          </p>
        )}

        <div className="flex items-center justify-between">
          <SourceLine sources={article.sources} time={article.created_at} />
          <span className="text-caption text-ink-300 group-hover:text-ink-500 transition-colors">
            Read full story
          </span>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article
        className="py-4 border-b border-ink-100 last:border-b-0 cursor-pointer group"
        onClick={onClick}
      >
        <div className="flex items-center gap-3 mb-1.5">
          <CategoryLabel category={article.category} />
          {article.is_breaking && <BreakingTag />}
        </div>

        <h3 className="font-serif text-headline-sm text-ink-900 mb-1.5 group-hover:text-ink-600 transition-colors">
          {article.headline}
        </h3>

        <SourceLine sources={article.sources} time={article.created_at} />
      </article>
    );
  }

  // Standard card
  return (
    <article
      className="py-6 border-b border-ink-100 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-2">
        <CategoryLabel category={article.category} />
        {article.is_breaking && <BreakingTag />}
      </div>

      <h2 className="font-serif text-headline-md text-ink-950 mb-2 group-hover:text-ink-700 transition-colors">
        {article.headline}
      </h2>

      {/* Show only first paragraph, truncated */}
      <p className="text-body-md text-ink-600 mb-3 line-clamp-2">
        {paragraphs[0]}
      </p>

      <div className="flex items-center justify-between">
        <SourceLine sources={article.sources} time={article.created_at} />
        <span className="text-caption text-ink-300 group-hover:text-ink-500 transition-colors">
          Read more
        </span>
      </div>
    </article>
  );
}
