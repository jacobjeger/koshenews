"use client";

import { useState, useEffect, useCallback } from "react";
import { Article, Category } from "@/lib/types";
import ArticleCard from "./ArticleCard";
import CategoryFilter from "./CategoryFilter";

const PAGE_SIZE = 20;

export default function ArticleFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState<Category>("all");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

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

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchArticles(articles.length, true);
    }
  };

  return (
    <div>
      <CategoryFilter selected={category} onSelect={setCategory} />

      <main className="max-w-2xl mx-auto px-4 py-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="flex gap-2 mb-3">
                  <div className="h-5 w-16 bg-gray-200 rounded" />
                  <div className="h-5 w-12 bg-gray-200 rounded" />
                </div>
                <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No articles yet</p>
            <p className="text-sm mt-1">
              Articles will appear here once the news pipeline is running.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full py-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
