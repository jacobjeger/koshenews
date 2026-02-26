"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Article, Category } from "@/lib/types";
import ArticleCard from "./ArticleCard";
import ArticleModal from "./ArticleModal";
import CategoryFilter from "./CategoryFilter";

const PAGE_SIZE = 20;

function LoadingSkeleton() {
  return (
    <div className="max-w-content mx-auto px-5 pt-8">
      {/* Hero skeleton */}
      <div className="pb-8 mb-8 border-b border-ink-100 animate-pulse">
        <div className="h-3 w-16 bg-ink-100 rounded mb-4" />
        <div className="h-7 w-full bg-ink-100 rounded mb-2" />
        <div className="h-7 w-3/4 bg-ink-100 rounded mb-4" />
        <div className="space-y-2.5">
          <div className="h-4 w-full bg-ink-50 rounded" />
          <div className="h-4 w-full bg-ink-50 rounded" />
          <div className="h-4 w-5/6 bg-ink-50 rounded" />
        </div>
      </div>

      {/* Standard skeletons */}
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="py-6 border-b border-ink-100 animate-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="h-3 w-20 bg-ink-100 rounded mb-3" />
          <div className="h-5 w-5/6 bg-ink-100 rounded mb-2" />
          <div className="h-5 w-2/3 bg-ink-100 rounded mb-3" />
          <div className="space-y-2">
            <div className="h-3.5 w-full bg-ink-50 rounded" />
            <div className="h-3.5 w-full bg-ink-50 rounded" />
            <div className="h-3.5 w-4/5 bg-ink-50 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="max-w-content mx-auto px-5 py-20 text-center">
      <div className="w-12 h-px bg-ink-200 mx-auto mb-6" />
      <p className="font-serif text-xl text-ink-700 mb-2">
        No stories yet
      </p>
      <p className="text-body-sm text-ink-400 max-w-xs mx-auto">
        Articles will appear here once the news pipeline is running. Check
        back soon.
      </p>
      <div className="w-12 h-px bg-ink-200 mx-auto mt-6" />
    </div>
  );
}

export default function ArticleFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState<Category>("all");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchArticles = useCallback(
    async (offset = 0, append = false) => {
      if (offset === 0) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = new URLSearchParams({
          category,
          limit: String(PAGE_SIZE),
          offset: String(offset),
        });

        const res = await fetch(`/api/articles?${params}`);
        const data: Article[] = await res.json();

        if (append) {
          setArticles((prev) => [...prev, ...data]);
        } else {
          setArticles(data);
        }

        setHasMore(data.length === PAGE_SIZE);
      } catch (err) {
        console.error("Failed to fetch articles:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [category]
  );

  useEffect(() => {
    fetchArticles(0, false);
  }, [fetchArticles]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchArticles(0, false);
    }, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchArticles]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loadingMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchArticles(articles.length, true);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [articles.length, hasMore, loadingMore, loading, fetchArticles]);

  return (
    <div>
      <CategoryFilter selected={category} onSelect={setCategory} />

      {loading ? (
        <LoadingSkeleton />
      ) : articles.length === 0 ? (
        <EmptyState />
      ) : (
        <main className="max-w-content mx-auto px-5 pt-8 pb-16">
          {/* Hero: first article gets prominent treatment */}
          <ArticleCard
            article={articles[0]}
            variant="hero"
            onClick={() => setSelectedArticle(articles[0])}
          />

          {/* Remaining articles */}
          {articles.slice(1).map((article, i) => (
            <ArticleCard
              key={article.id}
              article={article}
              variant={i < 4 ? "standard" : "compact"}
              onClick={() => setSelectedArticle(article)}
            />
          ))}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-px" />

          {loadingMore && (
            <div className="py-8 text-center">
              <div className="inline-flex items-center gap-2 text-body-sm text-ink-400">
                <span className="w-3 h-3 border-2 border-ink-200 border-t-ink-500 rounded-full animate-spin" />
                Loading more stories
              </div>
            </div>
          )}
        </main>
      )}

      {/* Article Modal */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-ink-200">
        <div className="max-w-content mx-auto px-5 py-6 text-center">
          <p className="font-serif text-sm text-ink-700 font-semibold">
            Kosher News
          </p>
          <p className="text-caption text-ink-400 mt-1">
            Clean &middot; Conservative &middot; Kosher
          </p>
          <p className="text-caption text-ink-300 mt-3">
            AI-curated from trusted sources worldwide. Summaries are
            generated — always refer to original reporting for full
            context.
          </p>
        </div>
      </footer>
    </div>
  );
}
