"use client";

import { Article, CATEGORY_COLORS } from "@/lib/types";

interface ArticleCardProps {
  article: Article;
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const categoryColor =
    CATEGORY_COLORS[article.category] || "bg-gray-100 text-gray-800";

  return (
    <article className="card">
      <div className="flex items-center gap-2 mb-2">
        {article.is_breaking && <span className="breaking-badge">Breaking</span>}
        <span className={`category-tag ${categoryColor}`}>
          {article.category}
        </span>
        <span className="text-xs text-gray-400 ml-auto">
          {timeAgo(article.created_at)}
        </span>
      </div>

      <h2 className="text-base font-semibold leading-snug mb-2">
        {article.headline}
      </h2>

      <div className="text-sm text-gray-700 leading-relaxed space-y-2">
        {article.summary.split("\n\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {article.sources.join(" · ")}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(article.published_at).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
      </div>
    </article>
  );
}
