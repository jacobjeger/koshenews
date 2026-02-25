"use client";

import { Article, CATEGORY_LABELS } from "@/lib/types";

interface ArticleCardProps {
  article: Article;
  variant?: "hero" | "standard" | "compact";
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
}: ArticleCardProps) {
  const paragraphs = article.summary.split("\n\n");

  if (variant === "hero") {
    return (
      <article className="pb-8 mb-8 border-b border-ink-200">
        {/* Category + Breaking */}
        <div className="flex items-center gap-3 mb-3">
          <CategoryLabel category={article.category} />
          {article.is_breaking && <BreakingTag />}
        </div>

        {/* Headline */}
        <h2 className="font-serif text-headline-lg text-ink-950 mb-3">
          {article.headline}
        </h2>

        {/* Lede paragraph — larger, bolder */}
        {paragraphs.length > 0 && (
          <p className="text-body-lg text-ink-700 mb-3 leading-relaxed">
            {paragraphs[0]}
          </p>
        )}

        {/* Remaining paragraphs */}
        {paragraphs.length > 1 && (
          <div className="text-body-md text-ink-600 space-y-2.5 mb-4">
            {paragraphs.slice(1).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}

        <SourceLine sources={article.sources} time={article.created_at} />
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="py-4 border-b border-ink-100 last:border-b-0">
        <div className="flex items-center gap-3 mb-1.5">
          <CategoryLabel category={article.category} />
          {article.is_breaking && <BreakingTag />}
        </div>

        <h3 className="font-serif text-headline-sm text-ink-900 mb-1.5">
          {article.headline}
        </h3>

        <p className="text-body-sm text-ink-500 line-clamp-2 mb-2">
          {paragraphs[0]}
        </p>

        <SourceLine sources={article.sources} time={article.created_at} />
      </article>
    );
  }

  // Standard card
  return (
    <article className="py-6 border-b border-ink-100">
      <div className="flex items-center gap-3 mb-2">
        <CategoryLabel category={article.category} />
        {article.is_breaking && <BreakingTag />}
      </div>

      <h2 className="font-serif text-headline-md text-ink-950 mb-2">
        {article.headline}
      </h2>

      {/* Show first 2 paragraphs */}
      <div className="text-body-md text-ink-600 space-y-2 mb-3">
        {paragraphs.slice(0, 2).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {/* Expandable remaining paragraphs */}
      {paragraphs.length > 2 && (
        <details className="group mb-3">
          <summary className="text-body-sm text-ink-400 cursor-pointer hover:text-ink-600 transition-colors list-none">
            <span className="border-b border-dotted border-ink-300 group-open:hidden">
              Continue reading
            </span>
          </summary>
          <div className="text-body-md text-ink-600 space-y-2 mt-2">
            {paragraphs.slice(2).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </details>
      )}

      <SourceLine sources={article.sources} time={article.created_at} />
    </article>
  );
}
