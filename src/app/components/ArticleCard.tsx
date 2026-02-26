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
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

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
    <span className="inline-flex items-center gap-1.5 text-accent font-semibold text-caption uppercase tracking-widest">
      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
      Breaking
    </span>
  );
}

function CategoryLabel({ category }: { category: string }) {
  return (
    <span className="text-caption font-semibold uppercase tracking-widest text-accent/70">
      {CATEGORY_LABELS[category] || category}
    </span>
  );
}

function SourceLine({ sources, time }: { sources: string[]; time: string }) {
  return (
    <div className="flex items-center gap-2 text-caption text-ink-400 font-medium">
      <span>{sources.join(", ")}</span>
      <span className="text-ink-200">&middot;</span>
      <time className="tabular-nums">{formatTime(time)}</time>
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
        className="pb-10 mb-8 border-b border-ink-200 cursor-pointer group"
        onClick={onClick}
      >
        <div className="flex items-center gap-3 mb-4">
          <CategoryLabel category={article.category} />
          {article.is_breaking && <BreakingTag />}
        </div>

        <h2 className="font-serif text-headline-xl text-ink-950 mb-4 group-hover:text-ink-700 transition-colors leading-snug">
          {article.headline}
        </h2>

        {paragraphs.length > 0 && (
          <p className="text-body-lg text-ink-600 mb-4 leading-relaxed line-clamp-3">
            {paragraphs[0]}
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          <SourceLine sources={article.sources} time={article.created_at} />
          <span className="text-caption text-ink-300 group-hover:text-accent transition-colors font-medium">
            Read full story &rarr;
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
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1.5">
              <CategoryLabel category={article.category} />
              {article.is_breaking && <BreakingTag />}
            </div>
            <h3 className="font-serif text-headline-sm text-ink-900 group-hover:text-ink-600 transition-colors leading-snug">
              {article.headline}
            </h3>
          </div>
          <span className="text-caption text-ink-300 tabular-nums shrink-0 mt-6">
            {formatTime(article.created_at)}
          </span>
        </div>
      </article>
    );
  }

  // Standard card
  return (
    <article
      className="py-7 border-b border-ink-100 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-2.5">
        <CategoryLabel category={article.category} />
        {article.is_breaking && <BreakingTag />}
      </div>

      <h2 className="font-serif text-headline-md text-ink-950 mb-2.5 group-hover:text-ink-700 transition-colors leading-snug">
        {article.headline}
      </h2>

      <p className="text-body-md text-ink-500 mb-3.5 line-clamp-2 leading-relaxed">
        {paragraphs[0]}
      </p>

      <div className="flex items-center justify-between">
        <SourceLine sources={article.sources} time={article.created_at} />
        <span className="text-caption text-ink-300 group-hover:text-accent transition-colors font-medium">
          Read more &rarr;
        </span>
      </div>
    </article>
  );
}
